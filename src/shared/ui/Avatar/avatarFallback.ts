/** Spread hues so neighbors on lists don’t all look identical; saturation/lightness stay muted for dark UI. */
const AVATAR_FALLBACK_HUES = [199, 172, 218, 43, 268, 12, 304, 152, 84, 235] as const;

export function avatarFallbackColors(name?: string | null): { backgroundColor: string; color: string } {
  const key = name?.trim() || '?';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = AVATAR_FALLBACK_HUES[Math.abs(hash) % AVATAR_FALLBACK_HUES.length];
  return {
    backgroundColor: `hsl(${hue} 32% 32%)`,
    color: `hsl(${hue} 12% 92%)`,
  };
}

export function avatarInitialsFromName(name?: string | null): string {
  const initials =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  return initials;
}
