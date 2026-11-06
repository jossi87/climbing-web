/**
 * Maintainer contact address. Gmail supports sub-addressing: everything from `+` to `@` is ignored for delivery, so
 * mail to `+climbing_web` still lands in the normal inbox, but can be filtered on the `To:` header, e.g.
 * `to:(jostein.oygarden+climbing_web@gmail.com)`. Keep the tag lowercase and free of characters that third-party
 * validators dislike (`+`, `.`, `-`, `_` are all safe; a space or `@` is not).
 */
export const CONTACT_EMAIL = 'jostein.oygarden+climbing_web@gmail.com';

/** `mailto:` form of {@link CONTACT_EMAIL} — use this for every contact link in the UI. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
