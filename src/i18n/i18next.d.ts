/**
 * Compile-time guard for catalog keys.
 *
 * `resources` is bound to the `en` catalog, so i18next types every key union from it: a typo, a key that was
 * removed, or a `Trans` `i18nKey` that does not exist becomes a `tsc` error instead of a raw `status.loading`
 * rendered into the page. It also feeds autocompletion for `t('…')`.
 *
 * Why this lives beside the catalogs: `en` is the base locale (see its header), so a key only exists once it is
 * declared there — `cs` is held to the same set by the `Catalog` type, and this file holds the *call sites* to it.
 *
 * Note `keySeparator` stays at i18next's default (`.`): keys are addressed as `feature.thing`, and no key contains
 * a literal dot, so the separator never needs escaping.
 */
import 'i18next';
import type { en } from './locales/en';

declare module 'i18next' {
  // `interface` (not `type`) is required: this is a declaration merge with i18next's own interface — an alias would not
  // augment it. The eslint rule below is aimed at app code, where an object shape wants a type alias.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
    returnNull: false;
  }
}
