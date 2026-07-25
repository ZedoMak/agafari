/**
 * Captures the Clarity demo script as screenshots into `docs/screenshots/`.
 *
 * Drives headless Chrome over the DevTools protocol and goes through the real
 * flow — including signing in with the access code — so the images reflect what
 * a reviewer sees.
 *
 *   node scripts/screenshots.mjs
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP = process.env.APP_URL ?? "http://127.0.0.1:3000";
const SLUG = process.env.ORG_SLUG ?? "hope-aid";
const CODE = process.env.ACCESS_CODE ?? "ngo-demo";
const OUT = "docs/screenshots";
const PORT = 9333;

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowser() {
  const binary = process.env.CHROME_PATH ?? CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!binary) throw new Error("No Chrome or Edge binary found. Set CHROME_PATH.");
  return binary;
}

class Session {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const resolver = this.pending.get(message.id);
      if (!resolver) return;
      this.pending.delete(message.id);
      if (message.error) resolver.reject(new Error(message.error.message));
      else resolver.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? "evaluate failed");
    }
    return result.result?.value;
  }

  async goto(path) {
    await this.send("Page.navigate", { url: `${APP}${path}` });
    await sleep(1600);
    await this.waitForIdle();
  }

  async waitForIdle(timeoutMs = 12_000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const busy = await this.evaluate(
        `document.readyState !== 'complete' || Boolean(document.querySelector('[aria-busy="true"]'))`,
      );
      if (!busy) return;
      await sleep(400);
    }
  }

  async viewport(width, height, mobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile,
    });
  }

  async shot(name) {
    await sleep(500);
    const { data } = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    await writeFile(join(OUT, `${name}.png`), Buffer.from(data, "base64"));
    console.log(`  saved ${OUT}/${name}.png`);
  }
}

async function connect(browser) {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((target) => target.type === "page") ?? list[0];
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const session = new Session(socket);
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  void browser;
  return session;
}

const ASK_QUESTION = "Who is eligible and what documents are required?";
const INTERNAL_QUESTION = "What is the field travel approval process?";

async function askInChat(session, question) {
  await session.evaluate(`
    (() => {
      const box = document.querySelector('.c-composer textarea');
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(box, ${JSON.stringify(question)});
      box.dispatchEvent(new Event('input', { bubbles: true }));
      box.closest('form').requestSubmit();
      return true;
    })()
  `);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await sleep(500);
    const done = await session.evaluate(
      `Boolean(document.querySelector('.c-turn.assistant')) && !document.querySelector('.c-typing')`,
    );
    if (done) return;
  }
}

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const profile = join(tmpdir(), `clarity-shots-${Date.now()}`);
  const browser = spawn(findBrowser(), [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--disable-gpu",
    "--force-color-profile=srgb",
    "--window-size=1440,960",
  ]);
  browser.on("error", (error) => console.error(error));

  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/version`);
      break;
    } catch {
      await sleep(400);
    }
  }

  const session = await connect(browser);
  await session.viewport(1440, 960);

  console.log("Public site");
  await session.goto(`/sites/${SLUG}`);
  await session.shot("01-public-home");

  await session.goto(`/sites/${SLUG}/services`);
  await session.shot("02-public-services");

  await session.goto(`/sites/${SLUG}/services/community-livelihood-grant`);
  await session.shot("03-public-service-detail");

  await session.goto(`/sites/${SLUG}/ask`);
  await askInChat(session, ASK_QUESTION);
  await session.shot("04-public-chat-cited");

  await session.goto(`/sites/${SLUG}/support`);
  await session.shot("05-public-support");

  console.log("Access");
  await session.goto(`/sites/${SLUG}/access`);
  await session.shot("06-access");

  await session.evaluate(`
    (() => {
      const input = document.querySelector('input[type="password"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, ${JSON.stringify(CODE)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.closest('form').requestSubmit();
      return true;
    })()
  `);
  await sleep(2500);

  console.log("Workspace");
  await session.waitForIdle();
  await session.shot("07-workspace-overview");

  await session.goto(`/sites/${SLUG}/workspace/assistant`);
  await askInChat(session, INTERNAL_QUESTION);
  await session.shot("08-workspace-assistant-internal-citation");

  for (const [name, path] of [
    ["09-workspace-documents", "/workspace/documents"],
    ["10-workspace-services-builder", "/workspace/services"],
    ["11-workspace-insights", "/workspace/insights"],
    ["12-workspace-complaints", "/workspace/complaints"],
    ["13-workspace-conversations", "/workspace/conversations"],
    ["14-workspace-settings", "/workspace/settings"],
  ]) {
    await session.goto(`/sites/${SLUG}${path}`);
    await session.shot(name);
  }

  console.log("Mobile");
  await session.viewport(390, 844, true);
  await session.goto(`/sites/${SLUG}`);
  await session.shot("15-mobile-home");
  await session.goto(`/sites/${SLUG}/ask`);
  await askInChat(session, ASK_QUESTION);
  await session.shot("16-mobile-chat");
  await session.goto(`/sites/${SLUG}/workspace`);
  await session.shot("17-mobile-workspace");

  session.socket.close();
  browser.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  console.log("\nDone.");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
