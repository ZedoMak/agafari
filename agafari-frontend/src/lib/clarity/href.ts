/**
 * Prefixes a tenant path with the base the request was served from. Kept free
 * of directives so both server and client components can call it.
 */
export function joinPath(basePath: string, path: string) {
  if (!path || path === "/") return basePath || "/";
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
