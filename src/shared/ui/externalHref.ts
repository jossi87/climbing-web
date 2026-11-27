/**
 * Web and e-mail targets are "external" and get the trailing `BodyLinkIcon` glyph; in-app relative paths rendered
 * in markdown (`/area/12`) do not — the glyph promises "this leaves the page".
 */
export const isExternalHref = (href?: string) => /^(?:https?:|mailto:)/i.test(href ?? '');
