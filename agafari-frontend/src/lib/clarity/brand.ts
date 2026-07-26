import type { CSSProperties } from "react";
import type { Organization } from "@/lib/types";

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

const FALLBACK_PRIMARY = "#175cd3";
const FALLBACK_ACCENT = "#12b76a";

function parseHex(value: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((char) => char + char)
          .join("")
      : match[1];
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === red) h = ((green - blue) / delta) % 6;
  else if (max === green) h = (blue - red) / delta + 2;
  else h = (red - green) / delta + 4;
  h = Math.round(h * 60);
  return { h: h < 0 ? h + 360 : h, s, l };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const secondary = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const match = l - chroma / 2;
  const sector = Math.floor(((h % 360) + 360) % 360 / 60);
  const [r, g, b] = (
    [
      [chroma, secondary, 0],
      [secondary, chroma, 0],
      [0, chroma, secondary],
      [0, secondary, chroma],
      [secondary, 0, chroma],
      [chroma, 0, secondary],
    ] as const
  )[sector];
  return {
    r: Math.round((r + match) * 255),
    g: Math.round((g + match) * 255),
    b: Math.round((b + match) * 255),
  };
}

function toHex({ r, g, b }: Rgb) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function relativeLuminance({ r, g, b }: Rgb) {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const ratio = channel / 255;
    return ratio <= 0.03928
      ? ratio / 12.92
      : ((ratio + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

export function contrastRatio(a: Rgb, b: Rgb) {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };

function shade(base: Hsl, lightness: number, saturationScale = 1) {
  return toHex(
    hslToRgb({
      h: base.h,
      s: Math.max(0, Math.min(1, base.s * saturationScale)),
      l: Math.max(0, Math.min(1, lightness)),
    }),
  );
}

/**
 * Darkens the brand colour only as far as needed for white text to reach the
 * WCAG AA 4.5:1 threshold, so tenant palettes stay recognisable.
 */
function solidOnWhiteText(base: Hsl) {
  let lightness = base.l;
  for (let step = 0; step < 48; step += 1) {
    const candidate = hslToRgb({ h: base.h, s: base.s, l: lightness });
    if (contrastRatio(candidate, WHITE) >= 4.5) break;
    lightness -= 0.02;
    if (lightness <= 0.08) break;
  }
  return { hex: toHex(hslToRgb({ h: base.h, s: base.s, l: lightness })), lightness };
}

export type BrandPalette = {
  hue: number;
  primary: string;
  accent: string;
  variables: CSSProperties;
};

export function buildBrandPalette(
  organization: Pick<Organization, "theme">,
): BrandPalette {
  const primaryRgb =
    parseHex(organization.theme?.primary ?? "") ?? parseHex(FALLBACK_PRIMARY)!;
  const accentRgb =
    parseHex(organization.theme?.accent ?? "") ?? parseHex(FALLBACK_ACCENT)!;
  const primary = rgbToHsl(primaryRgb);
  const accent = rgbToHsl(accentRgb);

  // Keep hand-picked but washed-out brands from producing a grey template.
  const brand: Hsl = { ...primary, s: Math.max(primary.s, 0.32) };
  const solid = solidOnWhiteText(brand);
  const accentSolid = solidOnWhiteText({ ...accent, s: Math.max(accent.s, 0.3) });

  const variables = {
    "--c-hue": String(brand.h),
    "--c-brand-50": shade(brand, 0.975, 0.55),
    "--c-brand-100": shade(brand, 0.94, 0.6),
    "--c-brand-200": shade(brand, 0.87, 0.7),
    "--c-brand-300": shade(brand, 0.74, 0.85),
    "--c-brand-400": shade(brand, 0.6),
    "--c-brand-500": toHex(hslToRgb(brand)),
    "--c-brand-600": solid.hex,
    "--c-brand-700": shade(brand, Math.max(0.14, solid.lightness - 0.08)),
    "--c-brand-800": shade(brand, Math.max(0.11, solid.lightness - 0.14)),
    "--c-brand-900": shade(brand, 0.11, 1.1),
    "--c-accent": accentSolid.hex,
    "--c-accent-soft": shade(accent, 0.93, 0.7),

    "--c-surface": shade(brand, 1, 0),
    "--c-surface-2": shade(brand, 0.985, 0.18),
    "--c-surface-3": shade(brand, 0.965, 0.16),
    "--c-surface-inset": shade(brand, 0.945, 0.14),
    "--c-line": shade(brand, 0.905, 0.16),
    "--c-line-strong": shade(brand, 0.82, 0.14),
    "--c-muted": shade(brand, 0.42, 0.14),
    "--c-ink-soft": shade(brand, 0.27, 0.18),
    "--c-ink": shade(brand, 0.12, 0.26),

    "--c-ring": `color-mix(in srgb, ${solid.hex} 34%, transparent)`,
  } as CSSProperties;

  return {
    hue: brand.h,
    primary: solid.hex,
    accent: accentSolid.hex,
    variables,
  };
}

export function organizationInitials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export type Terminology = {
  singular: string;
  plural: string;
  singularLower: string;
  pluralLower: string;
};

export function terminologyOf(organization: Organization): Terminology {
  const singular = organization.terminology?.service_singular?.trim() || "Service";
  const plural = organization.terminology?.service_plural?.trim() || "Services";
  return {
    singular,
    plural,
    singularLower: singular.toLowerCase(),
    pluralLower: plural.toLowerCase(),
  };
}
