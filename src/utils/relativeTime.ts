/**
 * Coarse relative-time buckets for the timestamps the API sends.
 *
 * The backend used to render these itself (“3 days ago”), which meant the sentence was English no matter
 * which locale the visitor had picked. It now sends the raw timestamp and the wording lives in the
 * catalog (`timeAgo.*`), so every locale can phrase its own buckets.
 */

/** A bucket that needs a count (`t('timeAgo.daysAgo', { count })`) or a fixed phrase (`today` / `yesterday`). */
export type TimeAgoBucket =
  { unit: 'today' } | { unit: 'yesterday' } | { unit: 'days' | 'weeks' | 'months' | 'years'; count: number };

const MS_PER_DAY = 86_400_000;

/**
 * Timestamps arrive as zone-less ISO local date-times (`2026-10-22T14:31:05`) straight from the database
 * (`activity.activity_timestamp`, `user_login.when`). `new Date()` reads exactly that form as local time,
 * so the calendar date the backend stored survives untouched — no UTC shift can move a row to another day.
 */
function parse(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole calendar days from `date` to `now`: 23:59 → 00:01 is one day, and DST cannot add a half day. */
function calendarDaysBetween(date: Date, now: Date): number {
  const from = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const to = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Bucket for `value`, or `null` when there is nothing to show: a missing timestamp, an unparsable one, or one
 * of the epoch sentinels (`1970-01-01`) that imported rows carry for “no date”.
 *
 * Future timestamps (a first-ascent date typed ahead of today) read as `today` instead of a negative count.
 */
export function timeAgoBucket(value: string | null | undefined, now: Date = new Date()): TimeAgoBucket | null {
  if (!value) return null;
  const date = parse(value);
  if (!date || date.getFullYear() < 1971) return null;

  const days = calendarDaysBetween(date, now);
  if (days <= 0) return { unit: 'today' };
  if (days === 1) return { unit: 'yesterday' };
  if (days < 7) return { unit: 'days', count: days };
  if (days < 30) return { unit: 'weeks', count: Math.floor(days / 7) };
  if (days < 365) return { unit: 'months', count: Math.floor(days / 30) };
  return { unit: 'years', count: Math.floor(days / 365) };
}
