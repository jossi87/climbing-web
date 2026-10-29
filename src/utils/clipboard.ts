/**
 * Puts `text` on the clipboard, and answers whether it got there.
 *
 * `navigator.clipboard` is the API to use — it exists in every secure context (https, and `http://localhost` in
 * development) — but it *rejects* when the document is not focused or the permission was denied, and it is missing
 * altogether on a plain-http deployment. The fallback is the pre-Clipboard-API trick: a read-only textarea holding the
 * text, selected and copied with `execCommand('copy')`.
 *
 * Returns a boolean instead of throwing because the caller's only decision is whether to show “copied” feedback —
 * claiming a copy that did not happen is worse than showing nothing. A rejection escaping a click handler would also
 * be an unhandled rejection nobody reports.
 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Not focused, permission denied, or no `navigator.clipboard` at all: fall back to the textarea.
    return copyWithTextarea(text);
  }
};

/** The `execCommand('copy')` fallback, which needs a real — if invisible — selection in the document. */
const copyWithTextarea = (text: string): boolean => {
  const area = document.createElement('textarea');
  area.value = text;
  // Off-screen and transparent, but *not* `display: none`/`visibility: hidden`: a hidden element selects nothing.
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);

  // `select()` replaces the document selection, and the user may have made one (often while sharing a part of the
  // page), so it is put back afterwards.
  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  let copied = false;
  try {
    area.select();
    copied = document.execCommand('copy');
  } catch {
    // `execCommand('copy')` is deprecated and unsupported in some browsers, where it throws: nothing was copied.
  } finally {
    area.remove();
    if (previous && selection) {
      selection.removeAllRanges();
      selection.addRange(previous);
    }
  }

  return copied;
};
