import { Fragment, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Check, MessageSquare, Plus } from 'lucide-react';
import Linkify from 'linkify-react';
import {
  getMediaFileUrl,
  mediaBackgroundPositionStyle,
  mediaIdentityId,
  mediaIdentityVersionStamp,
  mediaObjectPositionStyle,
} from '../../api';
import { AvatarGroup, Card, ClickableAvatar, SectionLabel, TradGearMarker } from '../../shared/ui';
import { LockSymbol } from '../../shared/ui/Indicators';
import { useMeta } from '../../shared/components/Meta/context';
import { VideoProcessingPlaceholder } from '../../shared/components/Media/VideoProcessingPlaceholder';
import { VideoThumbnailPlayOverlay } from '../../shared/components/Media/VideoThumbnailPlayOverlay';
import { activityShowHref, type ActivityShowCategory } from '../../shared/components/Activity/activityShowPreset';
import { climbingRouteUsesPassiveGear, formatRouteTypeLabel } from '../../utils/routeTradGear';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';

type Frontpage = components['schemas']['Frontpage'];
type FirstAscent = components['schemas']['FrontpageFirstAscent'];
type Ascent = components['schemas']['FrontpageRecentAscent'];
type NewestMedia = components['schemas']['FrontpageNewestMedia'];
type LastComment = components['schemas']['FrontpageLastComment'];

/**
 * Lock-flag accessor for activity rows. Activity-level objects (FA / Recent / Comment / Media) only carry the
 * `problemLocked*` pair — area / sector locks aren't surfaced to the frontpage feed (compact panels don't have room
 * for area-level chrome and the user can see those when they tap through).
 */
type LockFlags = {
  problemLockedAdmin?: boolean;
  problemLockedSuperadmin?: boolean;
};
function rowLockBlock(a: LockFlags) {
  if (!a.problemLockedAdmin && !a.problemLockedSuperadmin) return null;
  return (
    <span className='ml-1 inline align-baseline'>
      <LockSymbol lockedAdmin={!!a.problemLockedAdmin} lockedSuperadmin={!!a.problemLockedSuperadmin} />
    </span>
  );
}

/* ──────────────────────────── Shared shell ──────────────────────────── */

type PanelProps = {
  icon: ReactNode;
  title: string;
  seeAllLabel?: string;
  /**
   * Which `/activity` filter the See-more link should preselect. The destination page applies the preset on mount and
   * cleans the URL — see {@link activityShowHref} and `activityShowPreset.ts`. Omit to fall back to a plain `/activity`
   * link (no filter override).
   */
  seeMoreCategory?: ActivityShowCategory;
  children: ReactNode;
  /** Compact panel padding so 4 panels fit comfortably on a frontpage rail. */
  bodyClassName?: string;
};

/**
 * **Fixed-height header** that visually matches the top half of a stats tile in the aside.
 *
 * The stats card centers its `icon → number → label` stack vertically inside a 110px tile (`p-4` + flex `justify-center`),
 * so the numbers sit ~50px below the card's top edge. To make the panels' **first data row** land on that same baseline,
 * the header needs to occupy roughly the same vertical space as the stats tile's icon + margin (~40px).
 *
 * Locking the header to `h-10 sm:h-11` (40px / 44px) + a 1px divider beneath gives the first row's content baseline a
 * predictable Y that aligns with the stats numbers, regardless of font metrics. Previously `pt-3 / pt-5` left the offset
 * dependent on text height + line-height of the section title and produced inconsistent alignment.
 */
const sectionHeaderRowClass = 'flex h-10 items-center justify-between gap-3 px-4 sm:px-5';
const sectionTitleClass =
  'inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-slate-300 uppercase sm:text-[13px]';
const seeAllLinkClass =
  'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase transition-colors hover:bg-white/[0.06] hover:text-slate-100 focus-visible:ring-brand-border/70 focus-visible:ring-2 focus-visible:outline-none sm:text-[12px]';
const dividerClass = 'border-surface-border/40 border-t';
const emptyRowClass = 'px-4 py-6 text-center text-[12px] text-slate-500 sm:px-5 sm:text-[13px]';

const ActivityPanel = ({ icon, title, seeAllLabel, seeMoreCategory, children, bodyClassName }: PanelProps) => {
  const href = seeMoreCategory ? activityShowHref(seeMoreCategory) : '/activity';
  return (
    <Card flush>
      <div className={sectionHeaderRowClass}>
        <span className={sectionTitleClass}>
          <span className='text-slate-400'>{icon}</span>
          <SectionLabel className='!text-[12px] !tracking-[0.14em] sm:!text-[13px]'>{title}</SectionLabel>
        </span>
        <Link to={href} className={seeAllLinkClass} aria-label={`See all ${title.toLowerCase()}`}>
          {seeAllLabel ?? 'See all'}
          <ArrowRight size={11} strokeWidth={2.25} />
        </Link>
      </div>
      <div className={dividerClass} />
      <div className={cn('flex flex-col', bodyClassName)}>{children}</div>
    </Card>
  );
};

/* ──────────────────────────── Row primitives ──────────────────────────── */

/**
 * Stripped-down row layout: avatar conveys the user, headline is the route, subline is the location.
 * Roomier `py-3` (vs. the old `py-2.5` with dividers) gives clean vertical rhythm so we no longer need
 * `divide-y` between rows — whitespace alone separates entries, which reads as more premium / less "table-y".
 */
/**
 * Two-line list row: avatar on the left, **two stacked rows** on the right with their own internal left/right split:
 *
 *   ┌──── line 1 ─────────────────────────────────── timeAgo ───┐
 *   └──── line 2 (location) ─────────────── byline (italic) ────┘
 *
 * Each visual line uses `flex items-baseline justify-between` so the right column has a baseline on **both** rows
 * (timeAgo + byline), and the eye stops being pulled by the floating right-side whitespace the old 3-line layout left
 * behind. With `truncate` on every text cell, long routes / areas / names ellipsize instead of wrapping back to a
 * third line — the whole point of the redesign.
 */
const rowClass = 'group/row flex items-start gap-3 px-4 py-2 sm:px-5 sm:py-2.5';
const rowGridClass = 'min-w-0 flex-1';
const rowLineClass = 'flex items-baseline justify-between gap-3';
const timeAgoClass =
  'shrink-0 whitespace-nowrap text-[11px] font-normal tabular-nums tracking-tight text-slate-500 sm:text-[12px]';
/**
 * Right-aligned climber byline on line 2 — **same tone + size as `timeAgoClass`** (`slate-500`, `text-[11px]
 * sm:text-[12px]`, `tracking-tight`). The "who" is no more important than the "when" — both are trailing metadata
 * pinned to the right column, so they share dimness. Hierarchy now reads as:
 *
 *   slate-50  → route headline (the news)
 *   slate-400 → location (left subline; the "where")
 *   slate-500 → climber + timestamp (right column; quieter context)
 *
 * `max-w-[55%]` caps how much the name can steal from the location on narrow panels.
 */
const bylineRightClass =
  'shrink-0 max-w-[55%] truncate whitespace-nowrap text-right text-[11px] font-normal tracking-tight text-slate-500 sm:text-[12px]';
const problemLinkClass = designContract.typography.feed.routeTitle;

/**
 * **Two-tier hierarchy** — bright headline, muted everything else (slate-50 headline, slate-400 secondary).
 *
 * `min-w-0 truncate` keeps each subline to a single line and ellipsizes when the byline (or any right-side cell)
 * takes its slice of the row. **Don't reuse this for content that should wrap** (e.g. the multi-line comment body) —
 * `truncate` includes `white-space: nowrap` which would defeat any `line-clamp-N` you stack on top. The Comments
 * panel uses {@link commentBodyClass} instead.
 */
const sublineClass = 'm-0 min-w-0 truncate text-[11.5px] leading-tight text-slate-400 sm:text-[12px]';
/**
 * Comment body line — same metrics as `sublineClass` but **wraps** to allow `line-clamp-2`. `slate-300` is one notch
 * brighter than the surrounding slate-400 metadata so the comment reads as the row's actual content (the panel
 * already restricts to two lines, so it can be a touch more prominent without dominating).
 */
const commentBodyClass =
  'm-0 line-clamp-2 text-[11.5px] leading-tight text-slate-300 [overflow-wrap:anywhere] sm:text-[12px]';
/** Climber-name links inside `NameList` — `slate-500` to match the trailing right-column tone (see {@link bylineRightClass}). */
const nameLinkClass = 'font-normal text-slate-500 antialiased transition-colors hover:text-brand';
const mutedLocationLinkClass = 'font-normal text-slate-400 antialiased transition-colors hover:text-brand';

/**
 * Single-avatar halo so Recent Ascents / Last Comments match the First Ascents look (where `AvatarGroup` adds the ring
 * to every stacked avatar). Same ring tone as `AvatarGroup` (`ring-surface-hover`) to keep all panels visually identical.
 */
const singleAvatarRingClass = 'ring-surface-hover rounded-full ring-2';

/**
 * **Thinner grade glyph** — `font-light tabular-nums` so the route name (medium-weight) reads as the headline and
 * the grade reads as a secondary spec. Same color as the headline (slate-50) so it still stays prominent next to
 * the route name; the *weight* difference (medium → light) is what creates the "name vs. grade" pop the user asked
 * for. `tabular-nums` keeps multi-digit grades like `8a+` / `9b/+` aligned across rows.
 */
const gradeBesideTitle = 'ml-1 whitespace-nowrap font-light tabular-nums tracking-tight text-slate-50 antialiased';

/**
 * Inline `{problem}` (link) `{grade}` (thinner) plus optional **subtype icon** (trad gear glyph for trad / mixed /
 * aid routes — same heuristic the activity feed uses) and **lock symbol** (admin / super-admin protected). Subtype
 * is only meaningful on FA / Recent rows; comment rows (no `problemSubtype`) just don't pass it.
 */
function ProblemTitleInline({
  problemId,
  problemName,
  problemSubtype,
  grade,
  problemLockedAdmin,
  problemLockedSuperadmin,
}: {
  problemId?: number;
  problemName?: string;
  problemSubtype?: string;
  grade?: string;
  problemLockedAdmin?: boolean;
  problemLockedSuperadmin?: boolean;
}) {
  /** `formatRouteTypeLabel` accepts `(type, subtype)`; on the frontpage we only have subtype, so type is empty.
   *  `climbingRouteUsesPassiveGear` then decides whether the trad glyph belongs (true for trad / mixed / aid). */
  const subtypeLabel = formatRouteTypeLabel('', problemSubtype);
  const showTradIcon = climbingRouteUsesPassiveGear(subtypeLabel);
  return (
    <>
      <Link to={`/problem/${problemId ?? 0}`} className={problemLinkClass}>
        {problemName?.trim()}
      </Link>
      {grade && grade !== '.' ? <span className={gradeBesideTitle}>{grade}</span> : null}
      {showTradIcon ? (
        <TradGearMarker
          line={subtypeLabel}
          /**
           * Smaller + dimmer than the activity-feed default. The base CSS sizes the wire glyph at `1.08em / 1.02em`
           * (sized to a body-text baseline), which on a `13px` row reads as a peer of the route-name letterforms and
           * pulls the eye. We override to `~0.85em` and drop opacity to `0.65` so it reads as a *subtype hint* — there
           * if you look for it, gone if you don't. The `!` overrides the `.trad-gear-wire-icon` height/max-width
           * baked into the global stylesheet (matches the pattern used by `--list-emphasis` modifier without pulling
           * in its golden filter).
           */
          className='ml-1 align-[-0.05em]'
          iconClassName='!h-[0.85em] !max-w-[0.85em] opacity-65'
        />
      ) : null}
      {rowLockBlock({ problemLockedAdmin, problemLockedSuperadmin })}
    </>
  );
}

/**
 * **Area-only** location link. Sector was removed from frontpage activity payloads (the panels are too compact to
 * read "Area · Sector" comfortably and the user can drill in for sector via the route page). `tone='muted'` flips to
 * {@link mutedLocationLinkClass} (slate-400) for the panel rows where the location sits below the headline.
 */
function LocationInline({
  areaId,
  areaName,
  tone = 'default',
}: {
  areaId?: number;
  areaName?: string;
  tone?: 'default' | 'muted';
}) {
  if (!areaName) return null;
  const linkClass = tone === 'muted' ? mutedLocationLinkClass : designContract.typography.feed.locationLink;
  return (
    <Link to={`/area/${areaId ?? 0}`} className={linkClass}>
      {areaName.trim()}
    </Link>
  );
}

/* ──────────────────────────── Panels ──────────────────────────── */

/** Mobile-only cap on Newest Media so the section stays at two rows on phones (3 cols × 2). All other panels show whatever the WS returns. */
const MEDIA_MOBILE_CAP = 6;

/**
 * Render an inline list of climber names as `Link`s to `/user/{id}`. English list join (`A`, `A & B`, `A, B & C`).
 * Used on the *name line* of FA / Recent rows — name and location live on **separate** lines now, with distinct
 * typography (see {@link nameLineClass} / {@link sublineClass}), so the eye reads them as different facts.
 */
function NameList({ users }: { users: { id?: number; name?: string }[] }) {
  if (users.length === 0) return null;
  return (
    <>
      {users.map((u, idx) => {
        /** Use ` & ` before the last entry, comma between earlier entries, nothing before the first. */
        const sep =
          idx === 0 ? null : idx === users.length - 1 ? (
            <span className='text-slate-500'> &amp; </span>
          ) : (
            <span className='text-slate-500'>, </span>
          );
        return (
          <Fragment key={u.id ?? idx}>
            {sep}
            <Link to={`/user/${u.id ?? 0}`} className={nameLinkClass}>
              {u.name}
            </Link>
          </Fragment>
        );
      })}
    </>
  );
}

/**
 * **Three-line list row** shared by First Ascents (avatar group, multi-author names) and Recent Ascents (single avatar +
 * single name). Verbs ("opened" / "ticked") stay dropped — the panel title carries the action category, and the visual
 * stack carries the meaning:
 *
 *  - Line 1: route + grade   ← headline, brightest
 *  - Line 2: climber name(s) ← `feed.emphasis`, link → `/user/{id}`
 *  - Line 3: area · sector   ← muted slate-500 metadata
 */
function FirstAscentsPanel({ items, isBouldering }: { items: FirstAscent[]; isBouldering: boolean }) {
  return (
    <ActivityPanel
      icon={<Plus size={13} strokeWidth={2.25} />}
      title={isBouldering ? 'New Boulders' : 'New Routes'}
      seeAllLabel='See more'
      seeMoreCategory='fa'
    >
      {items.length === 0 ? (
        <div className={emptyRowClass}>{isBouldering ? 'No new boulders yet.' : 'No new routes yet.'}</div>
      ) : (
        <ul className='m-0 list-none p-0'>
          {items.map((a, i) => {
            const users = Array.isArray(a.users) ? a.users : [];
            return (
              <li key={`fa-${a.problemId ?? i}-${i}`} className={rowClass}>
                <div className='shrink-0 pt-0.5'>
                  <AvatarGroup
                    items={users.map((u) => ({
                      name: u.name,
                      mediaIdentity: u.mediaIdentity,
                      userId: u.id,
                    }))}
                    size='tiny'
                    max={2}
                  />
                </div>
                <div className={rowGridClass}>
                  <div className={rowLineClass}>
                    <p className='m-0 min-w-0 truncate leading-tight'>
                      <ProblemTitleInline
                        problemId={a.problemId}
                        problemName={a.problemName}
                        problemSubtype={a.problemSubtype}
                        grade={a.grade}
                        problemLockedAdmin={a.problemLockedAdmin}
                        problemLockedSuperadmin={a.problemLockedSuperadmin}
                      />
                    </p>
                    <span className={timeAgoClass}>{a.timeAgo}</span>
                  </div>
                  <div className={rowLineClass}>
                    <p className={sublineClass}>
                      <LocationInline areaId={a.areaId} areaName={a.areaName} tone='muted' />
                    </p>
                    {users.length > 0 ? (
                      <span className={bylineRightClass}>
                        <NameList users={users} />
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ActivityPanel>
  );
}

function RecentAscentsPanel({ items }: { items: Ascent[] }) {
  return (
    <ActivityPanel
      icon={<Check size={13} strokeWidth={2.25} />}
      title='Recent Ascents'
      seeAllLabel='See more'
      seeMoreCategory='ticks'
    >
      {items.length === 0 ? (
        <div className={emptyRowClass}>No recent ticks yet.</div>
      ) : (
        <ul className='m-0 list-none p-0'>
          {items.map((a, i) => {
            const u = a.u;
            return (
              <li key={`tick-${a.problemId ?? i}-${u?.id ?? i}-${i}`} className={rowClass}>
                <div className='shrink-0 pt-0.5'>
                  <ClickableAvatar
                    name={u?.name}
                    mediaIdentity={u?.mediaIdentity}
                    userId={u?.id}
                    size='tiny'
                    className={singleAvatarRingClass}
                  />
                </div>
                <div className={rowGridClass}>
                  <div className={rowLineClass}>
                    <p className='m-0 min-w-0 truncate leading-tight'>
                      <ProblemTitleInline
                        problemId={a.problemId}
                        problemName={a.problemName}
                        problemSubtype={a.problemSubtype}
                        grade={a.grade}
                        problemLockedAdmin={a.problemLockedAdmin}
                        problemLockedSuperadmin={a.problemLockedSuperadmin}
                      />
                    </p>
                    <span className={timeAgoClass}>{a.timeAgo}</span>
                  </div>
                  <div className={rowLineClass}>
                    <p className={sublineClass}>
                      <LocationInline areaId={a.areaId} areaName={a.areaName} tone='muted' />
                    </p>
                    {u ? (
                      <span className={bylineRightClass}>
                        <NameList users={[u]} />
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ActivityPanel>
  );
}

const mediaTileSize = 'min-w-0 aspect-square';

/**
 * Thumb fill — `<img>` for movies (so `onError` can swap to {@link VideoProcessingPlaceholder} while the still is being
 * generated server-side), `background-image` `<div>` for stills (lighter decode path on a tile grid).
 *
 * Mirrors the rendering split in `Activity/components/LazyMedia.tsx`.
 */
function MediaThumbFill({ m }: { m: NewestMedia }) {
  const [imgError, setImgError] = useState(false);
  const mid = mediaIdentityId(m.identity);
  const stamp = mediaIdentityVersionStamp(m.identity);
  const thumbUrl = getMediaFileUrl(mid, stamp, false, { minDimension: 188 });
  const isMovie = !!m.isMovie;

  if (isMovie) {
    if (imgError) return <VideoProcessingPlaceholder compact className='absolute inset-0' />;
    return (
      <img
        src={thumbUrl}
        alt={m.problemName ?? ''}
        loading='lazy'
        decoding='async'
        className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-110'
        style={mediaObjectPositionStyle(m.identity)}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      role='img'
      aria-label={m.problemName ?? ''}
      className='animate-in fade-in fill-mode-both absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover/tile:scale-110'
      style={{
        backgroundImage: `url(${JSON.stringify(thumbUrl)})`,
        ...mediaBackgroundPositionStyle(m.identity),
      }}
    />
  );
}

function NewestMediaPanel({ items }: { items: NewestMedia[] }) {
  const tiles = items.filter((m) => mediaIdentityId(m.identity) > 0);
  return (
    <ActivityPanel
      icon={<Camera size={13} strokeWidth={2.25} />}
      title='Newest Media'
      seeAllLabel='See more'
      seeMoreCategory='media'
      bodyClassName='p-3 sm:p-4'
    >
      {tiles.length === 0 ? (
        <div className={emptyRowClass}>No new media yet.</div>
      ) : (
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-6 md:gap-3'>
          {tiles.map((m, i) => {
            const mid = mediaIdentityId(m.identity);
            /** Mobile cap (2 rows × 3 cols = 6); `sm+` shows everything the WS returns. */
            const overflowClass = i >= MEDIA_MOBILE_CAP ? 'hidden sm:block' : '';
            const isMovie = !!m.isMovie;
            return (
              <Link
                key={`media-${mid}-${i}`}
                to={`/problem/${m.problemId ?? 0}/${mid}`}
                /**
                 * Both `group` and `group/tile`:
                 * - bare `group` lets {@link VideoThumbnailPlayOverlay}'s unnamed `group-hover:` styles fire on tile hover.
                 * - `group/tile` keeps the still/movie `group-hover/tile:scale-110` zoom scoped to the hovered tile only.
                 */
                className={cn(
                  mediaTileSize,
                  'group group/tile border-surface-border bg-surface-card hover:border-brand-border/55 focus-visible:ring-brand-border/70 relative block overflow-hidden rounded-lg border transition-all focus-visible:ring-2 focus-visible:outline-none',
                  overflowClass,
                )}
                aria-label={`View ${m.problemName ?? 'media'}${m.grade ? ` (${m.grade})` : ''}${isMovie ? ' (video)' : ''}`}
              >
                <MediaThumbFill m={m} />
                {isMovie ? <VideoThumbnailPlayOverlay size='compact' /> : null}
                {/*
                  Lighter gradient (`h-1/2` / `from-black/70`) — with only a single line of text we don't need the
                  taller two-thirds scrim that the area+sector layout used to require. Keeps more of the photo visible.
                */}
                <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
                <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col px-2 pb-1.5 text-left'>
                  {/*
                    Name + grade on the same baseline. Area / sector are intentionally **omitted** — the WS routes the
                    tile to `/problem/{id}/{mediaId}` (which carries that context) and the surrounding "Newest Media"
                    label already implies "from across the site". Stripping the sub-label cleans up the tile, lets the
                    photo dominate, and prevents secondary metadata from competing with the headline on small thumbs.
                  */}
                  <span className='flex min-w-0 items-baseline gap-1.5 leading-tight'>
                    <span className='photo-overlay-fg min-w-0 truncate text-[11px] font-semibold sm:text-[12px]'>
                      {m.problemName ?? ''}
                    </span>
                    {m.grade && m.grade !== '.' ? (
                      /** Match the FA / Recent panel's grade weight (`font-light tabular-nums`) so the typography contract
                       *  is consistent across all four panels — bold name, light grade. The overlay-muted color keeps the
                       *  grade legible on the gradient without out-shouting the route name. */
                      <span className='photo-overlay-fg-muted shrink-0 text-[10px] font-light tracking-tight tabular-nums sm:text-[11px]'>
                        {m.grade}
                      </span>
                    ) : null}
                    {m.problemLockedAdmin || m.problemLockedSuperadmin ? (
                      <span className='shrink-0 align-baseline'>
                        <LockSymbol
                          lockedAdmin={!!m.problemLockedAdmin}
                          lockedSuperadmin={!!m.problemLockedSuperadmin}
                        />
                      </span>
                    ) : null}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </ActivityPanel>
  );
}

/**
 * Comments mirror the FA / Recent layout: avatar → route headline → location subline → timeAgo. The comment text itself
 * sits between the headline and location as the row's "meat" (clamped to two lines so long replies stay scannable).
 * Two-column on `sm+` since each comment is short and the panel is full-bleed.
 */
function CommentsPanel({ items }: { items: LastComment[] }) {
  return (
    <ActivityPanel
      icon={<MessageSquare size={13} strokeWidth={2.25} />}
      title='Last Comments'
      seeAllLabel='See more'
      seeMoreCategory='comments'
      bodyClassName='py-1'
    >
      {items.length === 0 ? (
        <div className={emptyRowClass}>No comments yet.</div>
      ) : (
        <ul className='m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1 p-0 sm:grid-cols-2 sm:px-1'>
          {items.map((a, i) => {
            const u = a.u;
            return (
              <li
                key={`com-${a.problemId ?? i}-${u?.id ?? i}-${i}`}
                className={cn(rowClass, 'border-surface-border/30 sm:px-3 [&:nth-child(even)]:sm:border-l')}
              >
                <div className='shrink-0 pt-0.5'>
                  <ClickableAvatar
                    name={u?.name}
                    mediaIdentity={u?.mediaIdentity}
                    userId={u?.id}
                    size='tiny'
                    className={singleAvatarRingClass}
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  {/*
                    Three-line shape: headline (one line, truncated; lock symbol if protected) → comment body (up to
                    two wrapped lines via `line-clamp-2`) → location (one line, area only). The comment uses
                    {@link commentBodyClass} — matched metrics with the subline but **without** `white-space: nowrap`,
                    so `line-clamp-2` actually wraps. `slate-300` keeps the body slightly brighter than the
                    surrounding slate-400 metadata. Comments don't carry `problemSubtype`, so no trad icon here.
                  */}
                  <p className='m-0 leading-tight [overflow-wrap:anywhere]'>
                    <ProblemTitleInline
                      problemId={a.problemId}
                      problemName={a.problemName}
                      problemLockedAdmin={a.problemLockedAdmin}
                      problemLockedSuperadmin={a.problemLockedSuperadmin}
                    />
                  </p>
                  {a.comment ? (
                    <p className={commentBodyClass}>
                      <Linkify>{a.comment}</Linkify>
                    </p>
                  ) : null}
                  <p className={sublineClass}>
                    <LocationInline areaId={a.areaId} areaName={a.areaName} tone='muted' />
                  </p>
                </div>
                <span className={timeAgoClass}>{a.timeAgo}</span>
              </li>
            );
          })}
        </ul>
      )}
    </ActivityPanel>
  );
}

/* ──────────────────────────── Loading skeleton ──────────────────────────── */

/**
 * Skeleton bodies are rendered **inside the real `ActivityPanel`** below — no separate shell component, so the panel
 * frame (Card + header + See-more link + divider) is identical between loading and loaded states. The only thing
 * that animates in is the body content, which avoids any frame jitter when data resolves.
 */

/** FA / Recent — 2-line row mirroring `<SkeletonFeedRow>` ↔ live row (headline + timeAgo, location + name). */
const SkeletonFeedRow = () => (
  <div className={cn(rowClass, 'animate-pulse')}>
    <div className='skeleton-bar h-8 w-8 shrink-0 rounded-full' />
    <div className={cn(rowGridClass, 'space-y-1.5')}>
      <div className={rowLineClass}>
        <div className='skeleton-bar h-3 w-[55%] min-w-0 rounded' />
        <div className='skeleton-bar-muted h-2.5 w-10 shrink-0 rounded' />
      </div>
      <div className={rowLineClass}>
        <div className='skeleton-bar-muted h-2.5 w-[42%] min-w-0 rounded' />
        <div className='skeleton-bar-muted h-2.5 w-[28%] shrink-0 rounded' />
      </div>
    </div>
  </div>
);

/** Newest Media — square tile placeholder; `hideOnMobile` mirrors `MEDIA_MOBILE_CAP`. */
const SkeletonMediaTile = ({ hideOnMobile }: { hideOnMobile: boolean }) => (
  <div
    className={cn(
      mediaTileSize,
      'border-surface-border relative animate-pulse overflow-hidden rounded-lg border',
      hideOnMobile && 'hidden sm:block',
    )}
  >
    <div className='skeleton-bar absolute inset-0' />
  </div>
);

/** Comments — 3 stacked bars + right-aligned timeAgo bar; `index` toggles the alt-row left border on `sm+`. */
const SkeletonCommentRow = ({ index }: { index: number }) => (
  <div className={cn(rowClass, 'animate-pulse sm:px-3', index % 2 === 1 && 'border-surface-border/30 sm:border-l')}>
    <div className='skeleton-bar h-8 w-8 shrink-0 rounded-full' />
    <div className='min-w-0 flex-1 space-y-1.5'>
      <div className='skeleton-bar h-3 w-[55%] rounded' />
      <div className='skeleton-bar-muted h-2.5 w-[92%] rounded' />
      <div className='skeleton-bar-muted h-2.5 w-[40%] rounded' />
    </div>
    <div className='skeleton-bar-muted h-2.5 w-12 shrink-0 rounded' />
  </div>
);

/* ──────────────────────────── Public component ──────────────────────────── */

type Props = {
  /** Full `/frontpage` payload — only the four activity buckets are read here (`stats` / `randomMedia` are owned by
   *  the sibling panels). Optional so the component renders skeletons until the request resolves. */
  frontpage?: Frontpage;
  isLoading?: boolean;
};

/** Defensive read of the four pre-bucketed lists from the `/frontpage` response. */
function readBuckets(frontpage: Frontpage | undefined) {
  const fas = Array.isArray(frontpage?.firstAscents) ? frontpage!.firstAscents : [];
  const ticks = Array.isArray(frontpage?.recentAscents) ? frontpage!.recentAscents : [];
  const media = Array.isArray(frontpage?.newestMedia) ? frontpage!.newestMedia : [];
  const comments = Array.isArray(frontpage?.lastComments) ? frontpage!.lastComments : [];
  return { fas, ticks, media, comments };
}

export const FrontpageActivityPanels = ({ frontpage, isLoading = false }: Props) => {
  /** FA panel title flips between "New Routes" (default climbing) and "New Boulders" (bouldering site) — terminology
   *  the climbing community actually uses, more inviting than the literal "First Ascents" jargon. */
  const isBouldering = !!useMeta()?.isBouldering;
  const faTitle = isBouldering ? 'New Boulders' : 'New Routes';

  if (isLoading || !frontpage) {
    /**
     * Skeleton bodies live inside the **same `ActivityPanel`** the loaded state uses, so the panel frame (header,
     * See-more link, divider, body padding) is byte-identical between states — only the inner content swaps. Row
     * counts mirror what the WS returns: 8 / 8 / 12 / 4. Anything smaller and the layout visibly jumps on settle.
     */
    return (
      <div className='space-y-4 md:space-y-5'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'>
          <ActivityPanel
            icon={<Check size={13} strokeWidth={2.25} />}
            title='Recent Ascents'
            seeAllLabel='See more'
            seeMoreCategory='ticks'
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonFeedRow key={i} />
            ))}
          </ActivityPanel>
          <ActivityPanel
            icon={<Plus size={13} strokeWidth={2.25} />}
            title={faTitle}
            seeAllLabel='See more'
            seeMoreCategory='fa'
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonFeedRow key={i} />
            ))}
          </ActivityPanel>
        </div>
        <ActivityPanel
          icon={<Camera size={13} strokeWidth={2.25} />}
          title='Newest Media'
          seeAllLabel='See more'
          seeMoreCategory='media'
          bodyClassName='p-3 sm:p-4'
        >
          <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-6 md:gap-3'>
            {[...Array(12)].map((_, i) => (
              <SkeletonMediaTile key={i} hideOnMobile={i >= MEDIA_MOBILE_CAP} />
            ))}
          </div>
        </ActivityPanel>
        <ActivityPanel
          icon={<MessageSquare size={13} strokeWidth={2.25} />}
          title='Last Comments'
          seeAllLabel='See more'
          seeMoreCategory='comments'
          bodyClassName='py-1'
        >
          <div className='m-0 grid grid-cols-1 gap-x-6 gap-y-1 p-0 sm:grid-cols-2 sm:px-1'>
            {[...Array(4)].map((_, i) => (
              <SkeletonCommentRow key={i} index={i} />
            ))}
          </div>
        </ActivityPanel>
      </div>
    );
  }

  const { fas, ticks, media, comments } = readBuckets(frontpage);

  return (
    <div className='space-y-4 md:space-y-5'>
      {/* Recent Ascents leads — higher cadence and chronologically "what just happened", so it earns the left/top slot. First Ascents follow as the rarer, more curated companion. */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'>
        <RecentAscentsPanel items={ticks} />
        <FirstAscentsPanel items={fas} isBouldering={isBouldering} />
      </div>
      <NewestMediaPanel items={media} />
      <CommentsPanel items={comments} />
    </div>
  );
};

export default FrontpageActivityPanels;
