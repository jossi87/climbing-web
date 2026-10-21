/**
 * English source catalog — the base locale.
 *
 * `en` is first-class, not merely an i18next fallback: the app ships English by default and every
 * other locale is translated from these strings. Keys are semantic (`status.loading`) rather than
 * the English sentence itself, so tweaking copy never invalidates a translation.
 *
 * Add a string here first, then translate. `Catalog` widens every leaf to `string`, so a locale
 * declared `const cs: Catalog = {…}` fails to compile until it covers exactly the same keys — that
 * is the `en` ↔ `cs` parity check, and it replaces a runtime test.
 */
export const en = {
  common: {
    /** Field labels and verbs that several edit forms share. */
    latitude: 'Latitude',
    longitude: 'Longitude',
    description: 'Description',
    moveToTrash: 'Move to trash',
    sunFromHour: 'Sun from hour',
    sunToHour: 'Sun to hour',
    /** Empty option of a `<select>` whose value means “unset”. */
    emptyOption: 'Empty',
    approach: 'Approach',
    descent: 'Descent',
    add: 'Add',
    /** `<title>` / heading fragment of an edit page: “Edit <name>”. */
    editNamed: 'Edit {{name}}',
    /** Bare field label / placeholder for a numeric field (sector order, problem number). */
    number: 'Number',
    /** Tooltip on the topo glyph in a problem row. */
    topoLine: 'Topo line',
    /** Page-number abbreviation in an external link (“p. 42”). */
    pageAbbr: 'p.',
    /** Boolean segmented control / radio pair. */
    yes: 'Yes',
    no: 'No',
    tryAgain: 'Try again',
    signIn: 'Sign in',
    signOut: 'Sign out',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    remove: 'Remove',
    close: 'Close',
    /** Empty option in a filter select, e.g. a grade range with no lower bound. */
    any: 'Any',
    /** `sr-only` suffix behind a required field's red asterisk. */
    required: '(required)',
    /** “Load more” affordance at the end of a paginated list (activity feed, frontpage panels). */
    seeMore: 'See more',
    /** Primary button of a confirmation dialog. */
    confirm: 'Confirm',
    /**
     * Accessible name of an alert's close button. Kept distinct from {@link close}: screen readers expect
     * “Dismiss” for a notification, and the two buttons live in different contexts.
     */
    dismiss: 'Dismiss',
    /**
     * Entity names shared by list rows, trash entries and section headers.
     *
     * Singular on purpose: a locale inflects them per context (Czech “Oblast” vs “Oblasti”), and a
     * counted phrase belongs to `counts.*` instead.
     */
    area: 'Area',
    sector: 'Sector',
    problem: 'Problem',
    /** Singular nouns for the depth pages' PDF / maps menu entries (the plural headers live in their own pages). */
    route: 'Route',
    boulder: 'Boulder',
    media: 'Media',
    /** Placeholder for a list or panel the API answered with an empty collection. */
    noData: 'No data',
    /** Expander of a long markdown description. */
    showMore: 'Show more',
    showLess: 'Show less',
    /** Puts a soft-deleted entry back (trash). */
    restore: 'Restore',
  },
  /** Header chrome: the logo link and the account menu. */
  header: {
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    exportAscents: 'Export ascents to Excel',
    permissions: 'Permissions',
    users: 'Users',
    trash: 'Trash',
  },
  theme: {
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  },
  /**
   * Plural convention — verified against i18next 26 rather than assumed.
   *
   * A counted string declares one key per CLDR category suffix (`_one`, `_few`, `_other`) and **both**
   * catalogs must declare the same set: `Catalog` is derived from `en`, so a suffix another locale
   * needs has to exist here as well, with English simply repeating its `_other` wording. Verified
   * behaviour: if `cs` omits `…_few`, i18next does *not* fall back to the Czech `…_other` — it falls
   * back to the **English** `…_other`, i.e. untranslated text leaks into a translated page.
   *
   * `count: 0` resolves to `_other` in both `en` and `cs`, so a distinct zero state is a separate key
   * (`none` below) and never a `_zero` suffix.
   */
  externalLinks: {
    label: 'External Links',
    none: 'No external links',
    count_one: '{{count}} external link',
    count_few: '{{count}} external links',
    count_other: '{{count}} external links',
    urlPlaceholder: 'URL',
    titlePlaceholder: 'Title',
  },
  /** Problem comments: the composer/editor modal. */
  comment: {
    addTitle: 'Add comment',
    editTitle: 'Edit comment',
    label: 'Comment',
    placeholder: 'Write your comment…',
    /** HSE (health/safety) flag workflow on the problem page; the alert icons carry these as tooltips + labels. */
    flaggedDangerous: 'Flagged as dangerous',
    flaggedDangerousAria: 'Comment flagged as dangerous',
    flaggedSafe: 'Flagged as safe',
    flaggedSafeAria: 'Comment flagged as safe',
    flagDangerous: 'Flag as dangerous',
    flagDangerousAria: 'Flag this comment as dangerous',
    delete: 'Delete comment',
    confirmFlag: 'Are you sure you want to flag this comment?',
    confirmDelete: 'Are you sure you want to delete this comment?',
    /** Fallback name for a queued media item that is neither a file nor an embed. */
    itemNumber: 'Item #{{number}}',
    statusLabel: 'Status',
    statusGroupLabel: 'Comment safety status',
    safety: {
      default: 'Default',
      dangerous: 'Dangerous',
      safe: 'Safe',
    },
    /** Shown while the status is “Dangerous” — spells out what counts as a safety issue. */
    dangerWarning:
      "A loose hanger should not be flagged as dangerous. All climbers should carry a 17mm spanner (wrench), and if you don't have it just tight the nut by hand. Be specific, is the bolt spinning freely in the rock? Are there loose rocks/flakes that you were not able to safely remove by hand? What kind of tools are needed?",
  },
  /** Tick composer/editor modal — the ascent a visitor logs for a problem. */
  tick: {
    titleRoute: 'Tick route',
    titleProblem: 'Tick problem',
    errorLabel: 'Error:',
    date: 'Date',
    dateInvalid: '(cannot be in the future)',
    grade: 'Grade',
    noGrade: "I don't want to grade",
    /** One sentence with both abbreviations interpolated — never concatenated from fragments. */
    gradeMeta: 'FA: {{fa}} | Consensus: {{consensus}}',
    rating: 'Rating',
    noRating: 'No rating',
    stars_one: '{{count}} star',
    stars_few: '{{count}} stars',
    stars_other: '{{count}} stars',
    comment: 'Comment',
    commentPlaceholder: 'Optional comment',
    repeats: 'Repeats',
    repeatCommentPlaceholder: 'Optional — conditions, partners, how it felt…',
    addRepeat: 'Add repeat ascent',
    removeRepeat: 'Remove repeat {{number}}',
    confirmRemoveRepeat: 'Remove this repeat ascent from the list?',
    confirmDelete: 'Delete this tick permanently? You can add a new tick later if this was a mistake.',
    delete: 'Delete Tick',
    save: 'Save Tick',
    /**
     * Display text only. The value sent to (and echoed back from) the API stays the literal
     * `NO_PERSONAL_GRADE_LABEL` sentinel, which is deliberately *not* translated; the badge's visible
     * text is sentence-case while its `title`/`aria-label` are not — that casing split is intentional.
     */
    noPersonalGradeLabel: 'No personal grade',
    noPersonalGradeText: 'no personal grade',
  },
  /**
   * Media surfaces (viewer, edits, dropzones). The viewer's toolbar, its info panel, and the topo legend
   * are done; the edit/dropzone surfaces are converted as they are touched.
   *
   * `pitch*` and `pixelSize` interpolate numbers only — the nouns stay part of the template, so a locale
   * keeps its own word order and inflection instead of receiving a sentence glued from fragments.
   */
  media: {
    label: 'Media',
    embeddedVideo: 'Embedded video',
    /** Full-screen overlay while an edit (rotate, delete, …) is being saved. */
    saving: 'Saving Changes...',
    /** Screen-reader-only status while a video is starting or has stalled (`VideoPlaybackOverlay`). */
    buffering: 'Buffering',
    /** Fallback for a photographer/tagged user the API reports without a name. */
    unknownName: 'Unknown',
    image: 'Image',
    video: 'Video',
    /** Info overlay (`ⓘ`) title. */
    detailTitle: 'Information',
    topoLegend: 'Topo legend',
    zoomAndPan: 'Zoom and pan',
    moreActions: 'More actions',
    actions: 'Actions',
    quality: 'Quality',
    /** Adaptive HLS rendition — the player picks the level itself. */
    qualityAuto: 'Auto',
    videoQuality: 'Video quality',
    videoQualityWithLevel: 'Video quality: {{level}}',
    /** `title` of a Vimeo/YouTube embed iframe. */
    embedFrameTitle: 'Video Content',
    showProblemList: 'Show problem list',
    hideProblemList: 'Hide problem list',
    showSvg: 'Show SVG elements',
    hideSvg: 'Hide SVG elements',
    /** Sidebar tooltips: the ascent state a topo line's number is coloured by. */
    statusTicked: 'Ticked',
    statusTodo: 'In todo list',
    statusDangerous: 'Flagged as dangerous',
    photographer: 'Photographer',
    inShot: 'In shot',
    dates: 'Dates',
    uploaded: 'Uploaded: {{date}}',
    taken: 'Taken: {{date}}',
    technical: 'Technical',
    pixelSize: '{{width}} x {{height}} px',
    connectedTo: 'Connected to',
    description: 'Description',
    source: 'Source',
    guestbookEntry: 'Guestbook entry',
    userAvatar: 'User avatar',
    /** Linked trail in the info panel — the number is the API's `trailId`. */
    trail: 'Trail #{{id}}',
    pitch: 'Pitch {{pitch}}',
    pitchOfTotal: 'Pitch {{pitch}} / {{total}}',
    drawTopoLine: 'Draw topo line',
    drawOnImage: 'Draw on image',
    moveImageLeft: 'Move image left',
    moveImageRight: 'Move image right',
    downloadOriginal: 'Download Original',
    rotateCw: 'Rotate 90° CW',
    rotateCcw: 'Rotate 90° CCW',
    rotateHalf: 'Rotate 180°',
    edit: 'Edit media',
    /**
     * Two keys rather than `Delete {{kind}}`: the noun is what a locale inflects, and both branches are
     * known at the call site.
     */
    deleteImage: 'Delete image',
    deleteVideo: 'Delete video',
    /** Title of the gallery's delete confirmation; the question itself is `confirmDeleteImage`/`confirmDeleteVideo`. */
    confirmTitle: 'Confirm Action',
    confirmDeleteImage: 'Delete this image?',
    confirmDeleteVideo: 'Delete this video?',
    /** Video player: the chapter menu, and the overlay states around playback. */
    chapters: 'Chapters',
    /** Chapter-seek button of the video player; `{{chapter}}` is the chapter name or its fallback. */
    seekToChapter: 'Seek to {{chapter}} at {{time}}',
    /** Fallback name of a chapter the API returns without a problem name. */
    chapterFallback: 'Chapter {{number}}',
    play: 'Play',
    tapToPlay: 'Tap to play',
    loadingVideo: 'Loading video',
    videoUnavailable: 'Video unavailable',
    videoUnavailableDescription: 'The video could not be loaded. Check your connection and try again.',
    /** Accessible name of the zoom overlay's close button. */
    exitZoom: 'Exit zoom',
    /** Topo legend (help overlay). Colour names embed the swatch's meaning, so they read as one line. */
    legend: {
      lineShapes: 'Line Shapes',
      dottedLine: 'Dotted Line',
      boltedSportRoute: 'Bolted sport route',
      unbrokenLine: 'Unbroken Line',
      traditionallyProtected: 'Traditionally protected route',
      lineColors: 'Line Colors (Difficulty)',
      numberColors: 'Number Colors',
      ticked: 'Green: Ticked',
      todo: 'Blue: In Todo-list',
      dangerous: 'Red: Dangerous',
      defaultColor: 'White: Default color',
      otherSymbols: 'Other Symbols',
      descentLine: 'Descent Line',
      boltedAnchor: 'Bolted Anchor',
      traditionalAnchor: 'Traditional Anchor',
    },
  },
  /**
   * `MediaEdit/*` — the upload/edit surfaces for a single media item (metadata card, connected-problem
   * rows, dropzones). Grouped by sub-surface because the folder is one editing flow: `metadata` is the
   * card shared by every connection type, `problem` is one row of a connected problem.
   */
  mediaEdit: {
    /**
     * Marks media (or a media↔entity connection) that provides context rather than showing the route
     * itself. Shared by the metadata card and the problem rows, so it is not nested under either.
     */
    trivia: 'Trivia',
    metadata: {
      descriptionPlaceholder: 'Description (optional)',
      photographerPlaceholder: 'Photographer (required)',
      peopleInShotPlaceholder: 'People in shot',
      selectTrail: 'Select trail...',
      removeTrail: 'Remove trail',
      confirmRemoveTrail: 'Remove this trail from the list?',
      selectSector: 'Select sector...',
      /** Read-only fallback for a guestbook entry the API returns without a name. */
      guestbookFallback: 'Comment #{{id}}',
      errorNoProblems: 'At least one problem is required.',
      errorEmptyProblem: 'All problems must be selected from the search.',
      errorDuplicateTime: 'Duplicate timestamps are not allowed.',
      errorNoTrails: 'At least one trail is required.',
    },
    problem: {
      searchPlaceholder: 'Search problem...',
      searching: 'Searching...',
      noResults: 'No problems found.',
      noPitch: 'No pitch',
      remove: 'Remove problem',
      confirmRemove: 'Remove this problem from the list?',
      /** Time-input hint when the entered time is longer than the video; `{{time}}` is an `M:SS` string. */
      maxTime: 'Max {{time}}',
    },
    /** Page/file dropzone (`MediaDropzoneEmbed`): the drop hint, the size line, and the rejection alert. */
    dropzone: {
      /** Alert title when files were refused — pluralized, so a locale inflects the count. */
      errorsTitle_one: 'File could not be added',
      errorsTitle_few: '{{count}} files could not be added',
      errorsTitle_other: '{{count}} files could not be added',
      preparing: 'Preparing media…',
      dropHere: 'Drop here',
      tapOrDrop: 'Tap or drop to upload',
      /** Formats line under the drop hint; `{{maxMb}}` is the video size cap. */
      acceptedFormats: 'JPG (360° supported), PNG, HEIC, MP4… · up to {{maxMb}} MB',
      /** Rejection reasons; `{{size}}`/`{{limit}}` are already formatted (`12.4 MB`). */
      tooLarge: 'Too large ({{size}}, limit {{limit}})',
      unsupportedType: 'Unsupported file type',
      /** Fallback when react-dropzone rejects a file for a reason it does not name. */
      rejected: 'Rejected',
    },
    /**
     * HEIC/HEIF conversion advice (`utils/heic.ts`), keyed by the container the decoder recognised. The util
     * returns the reason as a string; the four containers each need their own sentence (also in Czech).
     */
    heicFailure: {
      heic: 'This HEIC image could not be converted. Export it as JPEG (iPhone: Settings → Camera → Formats → Most Compatible) and try again.',
      heif: 'This HEIF image could not be converted. Export it as JPEG and try again.',
      avif: 'This file is an AVIF image, not a HEIC. Export it as JPEG and try again.',
      unknown: 'This file is not a readable image. Export it as JPEG and try again.',
      /** Fallback when the failure is not a conversion error at all (the error's own message is shown instead). */
      unreadable: 'Could not be read',
    },
    /** Embed URL input (`MediaEmbedder`), the sibling of the dropzone. */
    embed: {
      urlPlaceholder: 'YouTube / Vimeo / Instagram URL…',
      add: 'Add',
      /** Button state once that Instagram carousel item has been added. */
      added: 'Added',
      /** Shown while the server-side Instagram scrape runs (it can take a minute). */
      scraping: 'Scraping Instagram post… this may take up to a minute',
      selectPosts: 'Select Instagram post(s) to add',
      /** `alt` of a scraped Instagram thumbnail; `{{number}}` is its position in the carousel. */
      postAlt: 'Instagram post {{number}}',
      noMediaFound: 'No Instagram media found at this URL.',
      /** Fallback when the scrape throws something that is not an `Error` (whose message is shown as-is). */
      processFailed: 'Failed to process URL',
    },
    /** Media edit page (`MediaEdit.tsx`): page chrome, save bar, and the connection selector. */
    page: {
      notFound: 'Media not found.',
      mediaNumber: 'Media #{{id}}',
      editVideo: 'Edit video',
      editImage: 'Edit image',
      saving: 'Saving…',
      /** Developer invariant surfaced through the error boundary when the API omits the presigned URL. */
      noPresignedUrl: 'No presigned URL returned from server',
      thumbnailFrame: 'Thumbnail frame',
      updateThumbnail: 'Update thumbnail on save',
      refetchThumbnailAria: 'Re-fetch the thumbnail from YouTube/Vimeo when saving',
      refetchThumbnail: 'Re-fetches the current thumbnail from YouTube/Vimeo.',
      embeddedVideo: 'Embedded video',
      instagramVideo: 'Instagram video',
      instagramImage: 'Instagram image',
      /** Fallback name of one uploaded item in the list; `{{number}}` is its 1-based position. */
      itemNumber: 'Item #{{number}}',
      connectedArea: 'Connected to area',
      connectedSector: 'Connected to sector',
      connectedProblem: 'Connected to problem(s)',
      connectedTrail: 'Connected to trail(s)',
      connectedGuestbook: 'Connected to guestbook',
      connectedUser: 'Connected to user',
    },
    /** Upload progress dialog (`UploadProgressDialog`). */
    upload: {
      failed: 'Upload failed',
      complete: 'Upload complete',
      uploading: 'Uploading media…',
      /** `{{done}}` of `{{total}}` tasks finished. */
      progress: '{{done}}/{{total}} completed',
    },
  },
  /** Problems filter panel (`FilterForm`) and its chips. */
  filter: {
    title: 'Filter',
    clear: 'Clear filter',
    gradeBetween: 'Grade between',
    /** One system's control while the page holds several grade systems (e.g. “Grade (UIAA)”). */
    gradeWithSystem: 'Grade ({{system}})',
    faYearBetween: 'First ascent year between',
    startingAltitudeBetween: 'Starting altitude between',
    options: 'Options',
    hideTicked: 'Hide ticked',
    onlyAdmin: 'Only admin',
    onlySuperAdmin: 'Only superadmin',
    types: 'Types',
    pitches: 'Pitches',
    /**
     * Pitch-count filter options. An option's *value* stays the API's literal (`Single-pitch` /
     * `Multi-pitch`) — only the visible text is translated.
     */
    pitchSingle: 'Single-pitch',
    pitchMulti: 'Multi-pitch',
    orientation: 'Orientation',
    conditions: 'Conditions',
    sunOnWallAt: 'Sun on wall at',
    shadeOnWallAt: 'Shade on wall at',
    regions: 'Regions',
    areas: 'Areas',
    /** Accessible name of a section header's reset button; `{{section}}` is that section's own label. */
    resetSection: 'Reset {{section}}',
    clearAll: 'Clear all',
    /** Accessible name of the chip row. */
    activeFiltersGroup: 'Active filter',
    /** One chip's tooltip/label; `{{text}}` is the already-formatted `label: value` of the filter. */
    removeChip: 'Remove filter — {{text}}',
  },
  /**
   * The active-filter chips (`ActiveFilterSummary`), built by `features/Problems/filterSummary.ts`.
   *
   * A chip glues a section label to a value, so both halves are wording: the labels that repeat the filter
   * form's sections reuse `filter.*` (the chip is the same section, spelled shorter), while the values — ranges,
   * flags, hour pickers — live here.
   */
  filterSummary: {
    /**
     * Short chip labels for sections the filter form names differently (`filter.gradeBetween` is the range
     * label in the form, the chip only has room for the noun).
     */
    grade: 'Grade',
    /** One system's chip while the page holds several grade systems (e.g. “Grade (UIAA)”). */
    gradeWithSystem: 'Grade ({{system}})',
    faYear: 'FA year',
    altitude: 'Altitude',
    sunAt: 'Sun at',
    shadeAt: 'Shade at',
    /** Two-sided / one-sided numeric range; `low`/`high` already carry their unit. */
    rangeLowHigh: '{{low}} – {{high}}',
    rangeFrom: 'from {{low}}',
    rangeUpTo: 'up to {{high}}',
    /**
     * Multi-select chip: the first names, then `+n` for the rest. Only the “and more” marker is wording —
     * the names themselves are area/type/compass values from the API.
     */
    namesMore: '+{{count}}',
    /** Hour chip (sun/shade on wall), formatted like the dropdown's own options. */
    hour: '{{hour}}:00',
    /** Header line while something survives the filter; the noun follows the discipline. */
    showingProblems_one: 'Showing {{count}} problem',
    showingProblems_few: 'Showing {{count}} problems',
    showingProblems_other: 'Showing {{count}} problems',
    showingRoutes_one: 'Showing {{count}} route',
    showingRoutes_few: 'Showing {{count}} routes',
    showingRoutes_other: 'Showing {{count}} routes',
    /** Header line when the filter leaves nothing (turned into a warning tone by the caller). */
    noMatchProblems: 'No problems match the filter.',
    noMatchRoutes: 'No routes match the filter.',
  },
  /** Problem list page (`/problems`): page header, its toolbar, and the export button. */
  problems: {
    /** Heading and `<title>`; the noun follows the discipline (`meta.isBouldering`). */
    titleBouldering: 'Problems',
    titleRoped: 'Routes',
    /**
     * Header subheader *and* meta description: how much the catalogue holds. Every slot is a counted phrase
     * (`counts.*`, and `counts.problems`/`counts.routes` for the last one), so a locale inflects each noun.
     */
    description: '{{regions}}, {{areas}}, {{sectors}}, {{items}}',
    /** Export button of the toolbar, and its state while the workbook is being written. */
    download: 'Download',
    downloading: 'Downloading...',
    /**
     * Row meta abbreviations, glued into one parenthetical: “(2p, 4 asc, 350m a.s.l.)”.
     * `mark` is `~` when the altitude is read off the problem's coordinates instead of a surveyed value.
     */
    metaPitches: '{{count}}p',
    metaAscents_one: '{{count}} asc',
    metaAscents_few: '{{count}} asc',
    metaAscents_other: '{{count}} ascs',
    metaAltitude: '{{mark}}{{meters}}m a.s.l.',
  },
  /**
   * Problem list (`ProblemList`) toolbar, filter strip, and grouping.
   *
   * `groupHeader` takes the group's name and count as placeholders: the old markup glued a group name (or
   * a `<Without area>` fallback) to a number, which no locale can reorder or inflect.
   */
  problemList: {
    grade: 'Grade',
    /** Panel label of one system's range while the list spans several grade systems (e.g. “Grade (UIAA)”). */
    gradeWithSystem: 'Grade ({{system}})',
    gradeTo: 'to',
    gradeLow: 'Lowest grade',
    gradeHigh: 'Highest grade',
    empty: 'Empty list.',
    noData: 'No data',
    /** Toolbar chip toggling the compact/detailed row rendering. */
    details: 'Details',
    toggleDetails: 'Toggle detailed rows',
    discipline: 'Discipline',
    allDisciplines: 'All disciplines',
    /** Dense chip text while every discipline is enabled. */
    disciplineAll: 'All',
    group: 'Group',
    sort: 'Sort',
    filter: 'Filter',
    reset: 'Reset',
    showFilter: 'Show filter',
    hideFilter: 'Hide filter',
    resetAll: 'Reset filters, sort and grouping',
    listFilters: 'List filters',
    onlyMultipitch: 'Only multipitch',
    onlyFa: 'Only FA',
    groupHeader: '{{name}} ({{total}})',
    /** Fallbacks for a row whose area/rock/sector/type is empty. */
    withoutArea: '<Without area>',
    withoutRock: '<Without rock>',
    noSector: '<No sector>',
    noType: '<No type>',
    groupBy: {
      area: 'Area',
      none: 'None',
      rock: 'Rock',
      sector: 'Sector',
      type: 'Type',
    },
    sortBy: {
      name: 'Name',
      ascents: 'Ascents',
      firstAscent: 'First ascent',
      firstAscentShort: '1st asc.',
      gradeAsc: 'Grade (easy -> hard)',
      gradeAscShort: 'Easy→hard',
      gradeDesc: 'Grade (hard -> easy)',
      gradeDescShort: 'Hard→easy',
      number: 'Number',
      numberShort: 'Numbers',
      rating: 'Rating',
      ratingShort: 'Stars',
      date: 'Date',
    },
  },
  /**
   * Activity feed (`Activity/*`) — the toolbar (grade filter + type chips), the empty/error states and the
   * “load more” affordance. `ActivitySkeleton`'s Suspense fallback mirrors the same toolbar, so it reads these
   * keys too and the placeholder cannot drift from the real controls.
   */
  activity: {
    title: 'Activity',
    /** Chip/dropdown text while no lower grade bound is set. */
    allGrades: 'All',
    lowestGrade: 'Lowest grade',
    /** Type chips; `chipCommentsShort` is the narrow-phone label. */
    chipFa: 'FA',
    chipTicks: 'Ticks',
    chipMedia: 'Media',
    chipComments: 'Comments',
    chipCommentsShort: 'Com',
    /** Brand-tinted chip that clears every filter (grade thresholds + activity types); only shown when something changed. */
    reset: 'Reset',
    /** `title` / `aria-label` of that chip — the visible label is just `reset`. */
    resetFilters: 'Reset filters',
    /** `role='img'` label of a media thumbnail in the feed (the thumbnail itself carries no text). */
    /** Accessible name of an activity thumbnail that links to its problem. */
    mediaAltOpenProblem: 'View activity photo, open problem {{number}}',
    mediaAlt: 'Activity media',
    /** Shown once the feed has loaded and the API returned no rows. */
    empty: 'No activity yet.',
    error: "Couldn't load activity.",
  },
  /**
   * Profile surfaces (`Profile/*`). The page-chrome keys belong to the profile route's own card (name, tab
   * strip); `settings` is the account card — `firstName`/`lastName` are that form's labels, not a user's name;
   * `statistics` is the overview/ascents section.
   */
  profile: {
    /** `aria-label` of the page skeleton, which mimics the profile card (`aria-busy` is already set). */
    loading: 'Loading profile',
    /** Body of the 404 card; its title is `meta.notFound` (or the status code when the request errored). */
    notFoundDescription: 'Profile not found',
    /** Meta description of the profile route. */
    description: 'Profile with public ascents, media, and other statistics.',
    /** Meta line under the name; `{{when}}` is the API's formatted last-activity date. */
    active: 'Active {{when}}',
    /** `aria-label` of the tab strip. */
    sections: 'Profile sections',
    /** Tab labels. `media` and `captured` spell out their count while it is non-zero. */
    page: {
      overview: 'Overview',
      ascents: 'Ascents',
      todo: 'Todo',
      media: 'Media',
      mediaCount_one: 'Media ({{count}})',
      mediaCount_few: 'Media ({{count}})',
      mediaCount_other: 'Media ({{count}})',
      captured: 'Captured',
      capturedCount_one: 'Captured ({{count}})',
      capturedCount_few: 'Captured ({{count}})',
      capturedCount_other: 'Captured ({{count}})',
    },
    settings: {
      /** `aria-label` of the loading skeleton (which is already marked `aria-busy`). */
      loading: 'Loading profile settings',
      title: 'Settings',
      subheader: 'Manage your account preferences',
      firstName: 'First Name',
      lastName: 'Last Name',
      contactByEmail: 'Allow others to contact me by email',
      avatar: 'Avatar',
      /** `alt` of the avatar preview shown before the image has been uploaded. */
      avatarPreview: 'Preview',
      preparingImage: 'Preparing image…',
      dropImage: 'Drop image here',
      dropAvatar: 'Drop avatar here, or click to select',
      save: 'Save Profile',
      displayRegions: 'Display Regions',
    },
    statistics: {
      noDisciplineData: 'No discipline data available.',
      /** Heading above {@link loadError} when the ascents request failed. */
      error: 'Error',
      loadError: 'Unable to load profile statistics.',
      noAscents: 'No ascents yet.',
      /**
       * Per-type summary on the ascents view: the row's `title` and the summary block's `aria-label`.
       *
       * The `…Fa` reading is its own key instead of a glued-on suffix — the first-ascent part only exists
       * above zero, and a separate sentence lets a locale keep its own word order and plural forms.
       */
      ascentsSummary_one: '{{header}}: {{count}} ascent',
      ascentsSummary_few: '{{header}}: {{count}} ascents',
      ascentsSummary_other: '{{header}}: {{count}} ascents',
      ascentsSummaryFa_one: '{{header}}: {{count}} ascent ({{numFa}} FA)',
      ascentsSummaryFa_few: '{{header}}: {{count}} ascents ({{numFa}} FA)',
      ascentsSummaryFa_other: '{{header}}: {{count}} ascents ({{numFa}} FA)',
      /** Parenthesised first-ascent count in the summary row; `FA` stays the app's abbreviation. */
      faCount: '({{numFa}} FA)',
      /**
       * Overview card header: the discipline's totals. `{{fa}}` and `{{ticks}}` arrive already rendered
       * ({@link overviewFa} / {@link overviewTicks}) so each noun inflects on its own count — a shared `count`
       * cannot drive two independent nouns — while this key keeps the sentence's parentheses and comma, which a
       * locale may want to place differently. `<count>` is the react-i18next slot the component emphasises.
       */
      overviewAscents_one: '<count>{{count}}</count> ascent ({{fa}}, {{ticks}})',
      overviewAscents_few: '<count>{{count}}</count> ascents ({{fa}}, {{ticks}})',
      overviewAscents_other: '<count>{{count}}</count> ascents ({{fa}}, {{ticks}})',
      /** First-ascent fragment of the overview header; `FA` stays the app's abbreviation. */
      overviewFa: '{{numFa}} FA',
      /** Repeat-ascent fragment of the overview header. */
      overviewTicks_one: '{{count}} tick',
      overviewTicks_few: '{{count}} ticks',
      overviewTicks_other: '{{count}} ticks',
      /** Chip on a tick row marking the ascent as a repeat. */
      repeatChip: 'repeat',
      /** Fallback heading when the API reports a discipline without a name. */
      unknownDiscipline: 'Unknown discipline',
    },
  },
  /**
   * Pitch editor (`ProblemSection`): the pitch-count select, one row per pitch, and the confirm that guards a
   * count change (which drops or stubs rows).
   */
  problemSection: {
    /** `{{from}}`/`{{to}}` are pitch counts. */
    confirmPitchCount: 'Are you sure you want to change number of pitches from {{from}} to {{to}}?',
    /** Counted option in the count select, so a locale inflects the noun. */
    pitchCount_one: '{{count}} Pitch',
    pitchCount_few: '{{count}} Pitches',
    pitchCount_other: '{{count}} Pitches',
    /** Read-only pitch number column. */
    nr: 'Nr',
    descriptionPlaceholder: 'Description',
  },
  /**
   * Condition chips (`Widgets/*`): page views, sun, orientation, webcams. `SunCalc` is a product name and stays
   * literal in the markup, as does the `HH:MM–HH:MM` range both sun chips render.
   */
  widgets: {
    /**
     * Page-view chip: `count` drives the plural form while `formatted` is what is drawn, so a pre-formatted
     * count from the API is never re-parsed.
     */
    pageViews_one: '{{formatted}} view',
    pageViews_few: '{{formatted}} views',
    pageViews_other: '{{formatted}} views',
    pageViewsTitle: 'Approximate page views (visits)',
    sunOnWall: 'Sun on wall',
    sunriseSunset: 'Sunrise and sunset today (local times)',
    orientationManual: 'Orientation (manual)',
    orientationCalculated: 'Orientation (calculated)',
    webcams: 'Webcams',
  },
  /**
   * Grade-distribution chart (`Chart`): the empty state plus the four column headers of the grade table. `FA`
   * stays the app's abbreviation for a first ascent (same as {@link tick.gradeMeta}); the other three are words.
   */
  chart: {
    noGradeDistribution: 'No grade distribution yet.',
    grade: 'Grade',
    fa: 'FA',
    tick: 'Tick',
    total: 'Total',
  },
  /** Map controls (`Leaflet`). Base-map and WMS layer names come from the region/API and stay as they are. */
  leaflet: {
    groupByRock: 'Group by rock',
    showElevationLabels: 'Show elevation labels',
    hideElevationLabels: 'Hide elevation labels',
  },
  /**
   * Trail card (`TrailProfile`): the stats row, the GPX download, the media link and the elevation chart. The
   * GPX file's own `<type>Running</type>` element is file format, not UI, and stays literal.
   */
  trailProfile: {
    elevationSource: 'Elevation source',
    addMedia: 'Add media to trail',
    /** Label fallback for a map marker the trail data does not name. */
    marker: 'Marker',
    openInMaps: 'Open in maps app',
    hikeProfile: 'Hike profile:',
  },
  /**
   * Passive-gear marker line (`routeTradGear.ts`): the row tooltip that adds a pitch count to a type label.
   * The count is pluralized, so a locale inflects it (`1 délka` / `3 délky` / `5 délek`).
   */
  routeTradGear: {
    passiveGearLine_one: '{{label}} · {{count}} pitch',
    passiveGearLine_few: '{{label}} · {{count}} pitches',
    passiveGearLine_other: '{{label}} · {{count}} pitches',
  },
  /** Table-of-contents affordances (`TableOfContents`). Sun/wall labels are numbers plus a separator, so they are not translated. */
  tableOfContents: {
    /** Compact scroll-to-top chip. */
    top: 'Top',
    noResults: 'No results match your search criteria.',
  },
  /** Lock chips in lists. `title` only — the icon itself is `aria-hidden`. */
  indicators: {
    superAdminLock: 'Super-admin lock',
    adminLock: 'Admin lock',
  },
  /**
   * Search box. `placeholderLong` names the entity kind the region searches via `{{entities}}` (the
   * noun is interpolated so each locale keeps its own plural and case), `kind.*` labels a result that
   * has no photo, and `altNoPhoto` is that thumbnail's `alt`.
   */
  search: {
    /** Accessible name of a bare search field that has no visible label. */
    label: 'Search',
    placeholderShort: 'Search...',
    placeholderLong: 'Search areas, sectors, {{entities}} or users...',
    entities: {
      problems: 'problems',
      routes: 'routes',
    },
    kind: {
      area: 'Area',
      sector: 'Sector',
      problem: 'Problem',
      user: 'User',
      result: 'Result',
    },
    altNoPhoto: '{{name}} (no photo)',
    externalLink: 'External link',
    clear: 'Clear search',
  },
  /**
   * Composed page `<title>`: `{{page}} | {{site}}`. The `site` half is the region's own title from
   * `/meta` (e.g. “Buldreinfo”), so it is data, never translated — only the separator and the order
   * around it belong to a locale.
   */
  meta: {
    pageTitle: '{{page}} | {{site}}',
    /** Fallback `<title>` / heading for a route the API answers with 404. */
    notFound: 'Not found',
  },
  /**
   * Counted nouns shared by several pages (list headers, SEO descriptions).
   *
   * Kept out of the page namespaces on purpose: “4 areas, 12 sectors” appears on the areas, sector and
   * frontpage screens alike, and a locale must be able to inflect the noun in one place. Sentence
   * wording that is specific to a page still lives in that page's namespace.
   */
  counts: {
    regions_one: '{{count}} region',
    regions_few: '{{count}} regions',
    regions_other: '{{count}} regions',
    areas_one: '{{count}} area',
    areas_few: '{{count}} areas',
    areas_other: '{{count}} areas',
    sectors_one: '{{count}} sector',
    sectors_few: '{{count}} sectors',
    sectors_other: '{{count}} sectors',
    problems_one: '{{count}} problem',
    problems_few: '{{count}} problems',
    problems_other: '{{count}} problems',
    routes_one: '{{count}} route',
    routes_few: '{{count}} routes',
    routes_other: '{{count}} routes',
    boulders_one: '{{count}} boulder',
    boulders_few: '{{count}} boulders',
    boulders_other: '{{count}} boulders',
    ticks_one: '{{count}} tick',
    ticks_few: '{{count}} ticks',
    ticks_other: '{{count}} ticks',
    items_one: '{{count}} item',
    items_few: '{{count}} items',
    items_other: '{{count}} items',
    points_one: '{{count}} point',
    points_few: '{{count}} points',
    points_other: '{{count}} points',
    feeds_one: '{{count}} active feed',
    feeds_few: '{{count}} active feeds',
    feeds_other: '{{count}} active feeds',
    locations_one: '{{count}} location',
    locations_few: '{{count}} locations',
    locations_other: '{{count}} locations',
    /**
     * Page opens, drawn by the areas panel's stats row. `formatted` is what is shown — the API hands the
     * count over pre-formatted so it is never re-parsed — while `count` only picks the plural form. The
     * tighter chip label lives in {@link widgets.pageViews}, which is why the two are separate keys.
     */
    pageViews_one: '{{formatted}} page view',
    pageViews_few: '{{formatted}} page views',
    pageViews_other: '{{formatted}} page views',
    /**
     * Pitch (rope length) count, drawn inline after a route's name. The problem list, the profile TODO rows and
     * the area list all read the same noun, so it is counted once here rather than per feature.
     */
    pitches_one: '{{count}} pitch',
    pitches_few: '{{count}} pitches',
    pitches_other: '{{count}} pitches',
    /** Comment count for the problem page's comment card and its accessible name. */
    comments_one: '{{count}} comment',
    comments_few: '{{count}} comments',
    comments_other: '{{count}} comments',
  },
  /**
   * Frontpage (`/`) stats strip and its meta description.
   *
   * The four tiles are short labels on their own row, so they get their own forms instead of the counted
   * phrases of `counts.*`; the description, which is a sentence, uses counted phrases for every slot.
   */
  frontpage: {
    statRegions: 'Regions',
    statAreas: 'Areas',
    /** `statProblems`/`statRoutes` follow the discipline (`meta.isBouldering`). */
    statProblems: 'Problems',
    statRoutes: 'Routes',
    statTicks: 'Ticks',
    /** Meta description; `regions`/`areas` are `counts.*`, the other two slots are counted here. */
    description: '{{regions}}, {{areas}}, {{problems}}, {{ascents}}.',
    /**
     * The discipline adjective is part of the noun, so the counted phrase carries it — “2443 bouldering
     * problems”, not a bare number glued to a discipline word.
     */
    boulderingProblems_one: '{{count}} bouldering problem',
    boulderingProblems_few: '{{count}} bouldering problems',
    boulderingProblems_other: '{{count}} bouldering problems',
    climbingRoutes_one: '{{count}} climbing route',
    climbingRoutes_few: '{{count}} climbing routes',
    climbingRoutes_other: '{{count}} climbing routes',
    /** Public ascents — a tick that is not marked private. */
    publicAscents_one: '{{count}} public ascent',
    publicAscents_few: '{{count}} public ascents',
    publicAscents_other: '{{count}} public ascents',
    /**
     * Panels below the stats strip. `panelNewest` is only ever rendered as the skeleton placeholder — the FA
     * panel's real title depends on `/meta`, so it stays behind `titleLoading` until the discipline is known
     * (else a bouldering site would flash "Newest Routes" first). See `FrontpagePanels`.
     */
    panelRecentAscents: 'Recent Ascents',
    panelNewestBoulders: 'Newest Boulders',
    panelNewestRoutes: 'Newest Routes',
    panelNewest: 'Newest',
    panelNewestMedia: 'Newest Media',
    panelLastComments: 'Last Comments',
    /** Empty states, one per panel (the Comments panel is hidden altogether when it has no entries). */
    emptyNewestBoulders: 'No new boulders yet.',
    emptyNewestRoutes: 'No new routes yet.',
    emptyRecentAscents: 'No recent ticks yet.',
    emptyNewestMedia: 'No new media yet.',
    emptyComments: 'No comments yet.',
    /**
     * Accessible name of a panel's "See more" link. All four links share the same visible label
     * (`common.seeMore`), so the accessible name is what tells them apart — it names the category the link
     * opens on the activity feed. The FA panel picks `seeMoreAriaFaBoulders` / `seeMoreAriaFaRoutes`;
     * `seeMoreAriaFa` is the discipline-neutral fallback for any other FA deep-link.
     */
    seeMoreAriaFa: 'View all first ascents on the activity feed',
    seeMoreAriaFaBoulders: 'View all first ascents and newest boulders on the activity feed',
    seeMoreAriaFaRoutes: 'View all first ascents and newest routes on the activity feed',
    seeMoreAriaTicks: 'View all recent climbing ascents and logged ticks on the activity feed',
    seeMoreAriaMedia: 'View all newest climbing photos and videos on the activity feed',
    seeMoreAriaComments: 'View all recent climbing comments and discussions on the activity feed',
    /**
     * Newest Media thumbnail. The `aria-label` is the only name the thumbnail gets, so it carries the route
     * name `{{name}}` plus two optional slots — each one pre-rendered by its own parenthesised suffix key
     * (`mediaTileGradeSuffix` / `mediaTileVideoSuffix`) so the locale owns the punctuation, while the grade
     * stays raw API data (grades are free text: `6a+`, `VIIIb`).
     */
    mediaTileAria: 'View {{name}}{{grade}}{{video}}',
    mediaTileGradeSuffix: ' ({{grade}})',
    mediaTileVideoSuffix: ' (video)',
    /** Name used when the API returns a media entry without a problem name. */
    mediaTileFallbackName: 'media',
    /** Featured-media card (the random photo aside). */
    featuredEmptyTitle: 'No featured media',
    featuredEmptyDescription: 'Check back later for a random photo from the index.',
    featuredPrevious: 'Previous featured photo',
    featuredNext: 'Next featured photo',
    /**
     * Featured-media `alt` text: the card names the route, then its area/sector (both API data, joined by the
     * locale-independent separator in `RandomMediaCard`), then the people involved. The people fragments are
     * keys of their own — the card's visible footer reuses `photographerAndInPhoto`.
     */
    inPhoto: 'In photo: {{name}}',
    inPhotoCount_one: '{{count}} in photo',
    inPhotoCount_few: '{{count}} in photo',
    inPhotoCount_other: '{{count}} in photo',
    photoBy: 'Photo by {{name}}',
    photographerAndInPhoto: '· photographer & in photo',
    /** Visible footer of the featured card: a tagged climber's name followed by the overflow count. */
    taggedMore_one: 'and {{count}} more',
    taggedMore_few: 'and {{count}} more',
    taggedMore_other: 'and {{count}} more',
    /** Label in front of the photographer's name in the featured card's footer. */
    bylineBy: 'By',
  },
  /**
   * Areas index (`/areas`): the map, the area list below it, and the area panel that opens on a marker.
   *
   * Counted nouns come from `counts.*`; what stays here is the panel's own chrome and the stats row, whose
   * pitch labels have to agree with the pitch filter's wording (`filter.pitchSingle`/`pitchMulti`).
   */
  areas: {
    /** Heading, `<title>` and the map's `aria` name. */
    title: 'Areas',
    /** Meta description; `{{items}}` is `counts.areas`. */
    description: '{{items}} for climbing.',
    addArea: 'Add area',
    /** Area panel header: link button to the area's own page, and the panel's close button. */
    openInNewTab: 'Open area page in new tab',
    closePanel: 'Close area panel',
    /**
     * Panel stats row for roped climbing, where the problems are split by pitch count. `{{details}}` is the
     * per-subtype breakdown (“2 Slab, 12 Wall”) — type names come from the API and stay as they are.
     */
    pitchSingleGroup_one: '{{count}} single-pitch ({{details}})',
    pitchSingleGroup_few: '{{count}} single-pitch ({{details}})',
    pitchSingleGroup_other: '{{count}} single-pitch ({{details}})',
    pitchMultiGroup_one: '{{count}} multi-pitch ({{details}})',
    pitchMultiGroup_few: '{{count}} multi-pitch ({{details}})',
    pitchMultiGroup_other: '{{count}} multi-pitch ({{details}})',
    /** Wall length of the area's problems: one length, or the span it covers. */
    lengthExact: '{{length}} m',
    lengthRange: '{{min}}–{{max}} m',
    /** Grade-bar tooltip; `{{items}}` is `counts.routes` for the bar's own count. */
    gradeBarTooltip: '{{grade}}: {{items}}',
    /** Grouping fallback for an area the API left without a region name. */
    unknownRegion: 'Unknown region',
    /** “Dataset: Developed / Developers” switch, shown only while developer areas exist. */
    dataset: 'Dataset:',
    datasetDeveloped: 'Developed',
    datasetDevelopers: 'Developers',
  },
  /**
   * Regions index (`/regions/:discipline`): the outline map and the super-admin outline editor.
   * The three discipline names are UI labels for `DISCIPLINE_TYPES`, not DB values.
   */
  regions: {
    title: 'Regions',
    typeBouldering: 'Bouldering',
    typeRockClimbing: 'Route Climbing',
    typeIceClimbing: 'Ice Climbing',
    summaryBouldering_one: '{{count}} bouldering region',
    summaryBouldering_few: '{{count}} bouldering regions',
    summaryBouldering_other: '{{count}} bouldering regions',
    summaryRockClimbing_one: '{{count}} rock climbing region',
    summaryRockClimbing_few: '{{count}} rock climbing regions',
    summaryRockClimbing_other: '{{count}} rock climbing regions',
    summaryIceClimbing_one: '{{count}} ice climbing region',
    summaryIceClimbing_few: '{{count}} ice climbing regions',
    summaryIceClimbing_other: '{{count}} ice climbing regions',
    editOutline: 'Edit outline of {{name}}',
    /** `<name>` bolds the region; `{{points}}` is `counts.points` already formatted for the locale. */
    editingOutline:
      'Editing the outline of <name>{{name}}</name> — click the map to add points ({{points}}). Other regions stay visible for context.',
    saveOutlineError: 'Could not save the outline. Please try again.',
    undoLastPoint: 'Undo last point',
    clearAllPoints: 'Clear all points',
  },
  /** Trash (`/trash`): soft-deleted areas, sectors, problems, and media. */
  trash: {
    title: 'Trash',
    /** `{{kind}}` is an entity name (`Media`, `Area`, …) and stays a separate word for a locale to reorder. */
    deletedItem: '{{kind}} deleted by {{by}} ({{when}})',
    /** Media keeps its own button, so only the rest of the line is interpolated. */
    deletedBy: 'deleted by {{by}} ({{when}})',
    confirmRestore: 'Are you sure you want to restore item?',
  },
  /** Public tick feed (`/ticks/:page`). */
  ticks: {
    title: 'Ticks',
    pageOf: 'Page {{page}} of {{total}}',
    empty: 'Empty list.',
  },
  /** Webcams (`/webcams`): camera map plus the selected camera panel. */
  webcams: {
    title: 'Webcams',
    description: 'Live webcams and camera feeds in climbing areas',
    /** Joins the two counted phrases below; the separator itself is locale-owned. */
    subheader: '{{feeds}} · {{locations}}',
    yrLinkTitle: 'Weather forecast on yr.no',
    closeCameraPanel: 'Close camera panel',
    officialSource: 'Official Source',
    unknownCamera: 'Unknown Camera',
  },
  /** Dangerous list (`/dangerous`): problems flagged in comments as dangerous. */
  dangerous: {
    title: 'Dangerous',
    /** `problems` is one of the two counted phrases below; `areas` / `sectors` are `counts.*`. */
    summary: '{{problems}} (located in {{areas}}, {{sectors}})',
    flaggedRoutes_one: '{{count}} route flagged as dangerous',
    flaggedRoutes_few: '{{count}} routes flagged as dangerous',
    flaggedRoutes_other: '{{count}} routes flagged as dangerous',
    flaggedBoulders_one: '{{count}} boulder flagged as dangerous',
    flaggedBoulders_few: '{{count}} boulders flagged as dangerous',
    flaggedBoulders_other: '{{count}} boulders flagged as dangerous',
  },
  /** Restrictions (`/restrictions`): areas and sectors with closed access. */
  restrictions: {
    title: 'Restrictions',
    summary: '{{areas}}, {{sectors}}',
  },
  /** Grade distribution chart page (`/graph`). */
  graph: {
    title: 'Grade Distribution',
    descriptionProblems: 'Problems grouped by grade',
    descriptionRoutes: 'Routes grouped by grade',
    clickBarForDetails: 'Click bar for details',
  },
  /**
   * Footer. Club, product, and link names (`BRV`, `Bratte Linjer`, `React / TS`) stay proper nouns in
   * the markup, so they are deliberately absent here.
   */
  footer: {
    navigation: 'Navigation',
    about: 'About',
    activity: 'Activity',
    dangerous: 'Dangerous',
    graph: 'Graph',
    restrictions: 'Restrictions',
    webcams: 'Webcams',
    openSourceStack: 'Open Source Stack',
    frontend: 'Frontend',
    backendApi: 'Backend API',
    pdfMaps: 'PDF Maps',
    affiliation: 'Affiliation',
    contact: 'Contact',
    license: 'License',
    privacy: 'Privacy',
    donate: 'Donate',
    /** `{{year}}` is the current year; the brand names are part of the string so a locale can reorder it. */
    copyright: 'Buldreinfo / Bratte Linjer © 2003-{{year}}',
  },
  errorBoundary: {
    title: 'Something went wrong',
    description: 'The application encountered an unexpected error.',
    logLabel: 'Error Log',
  },
  status: {
    loading: 'Loading',
    loadingDescription: 'Fetching data…',
    /** Interstitial shown while a stale route redirects (e.g. a problem URL that has moved to its area). */
    redirecting: 'Redirecting',
    redirectingDescription: 'Please wait...',
    authRequiredTitle: 'Authentication required',
    authRequiredDescription: 'You must be logged in to access this page.',
    insufficientPrivilegesTitle: 'Insufficient privileges',
    insufficientPrivilegesDescription: "You don't have access to this page.",
    /** `<contact>` is a component slot (react-i18next `<Trans>`); `{{name}}` is interpolated. */
    insufficientPrivilegesContact: 'Contact <contact>{{name}}</contact> if you need an upgrade.',
    /** `<title>` prefix for a page that failed to load (see `place.unableToLoad*`). */
    errorTitle: 'Error',
  },
  /**
   * Problem-row renderer shared by the area and sector problem lists.
   *
   * Those two pages each render their own row component from the same copy (rank tooltip, rock label, media glyph
   * tooltips), so the strings live here instead of being duplicated per feature. The two counted fragments in the row
   * (pitches, ticks) reuse `counts.pitches` / `counts.ticks` — same words, already plural aware.
   */
  problemRow: {
    /** Inline rock label; the rock name itself is API data. */
    rock: 'Rock: {{rock}}',
    topoTooltip: 'Topo line',
    coordinatesTooltip: 'Coordinates',
    imagesTooltip: 'Images',
    moviesTooltip: 'Movies',
    /** Tooltip on the `#rank`: status first, otherwise which numbering the rank belongs to. */
    ticked: 'Ticked',
    onTodoList: 'On to-do list',
    boulderNumber: 'Boulder number',
    routeNumber: 'Route number',
  },
  /**
   * Chrome shared by the area and sector pages: tab labels, breadcrumb, header actions, access notices.
   *
   * The two pages are twins (same tabs, same header buttons, same not-found copy with one noun swapped), so their copy
   * lives in one place — a wording change lands once, and a translator sees the whole tab strip as one block instead of
   * two half-identical ones. Nouns that stand alone come from `common.area` / `common.sector`.
   */
  place: {
    overview: 'Overview',
    map: 'Map',
    distribution: 'Distribution',
    top: 'Top',
    todo: 'Todo',
    activity: 'Activity',
    breadcrumb: 'Breadcrumb',
    /**
     * Developer invariant (bad route): thrown before any data loads, but it surfaces through the error boundary, so it
     * is translated like any other user-visible copy rather than left as an English exception message.
     */
    /** Lead-in before the neighbouring problem links. */
    neighboursLead: 'Neighbours:',
    /** Accessible name of the “problems on this rock” row; `{{rock}}` is the API rock name. */
    problemsOnRock: 'Problems on rock «{{rock}}»',
    missingSectorId: 'Missing sectorId URL param',
    missingAreaId: 'Missing areaId parameter',
    notFoundSectorDescription:
      'Cannot find the specified sector because it does not exist or you do not have sufficient permissions.',
    notFoundAreaDescription:
      'Cannot find the specified area because it does not exist or you do not have sufficient permissions.',
    loadSectorError: 'Something went wrong while loading this sector.',
    loadAreaError: 'Something went wrong while loading this area.',
    unableToLoadSector: 'Unable To Load Sector',
    unableToLoadArea: 'Unable To Load Area',
    addProblem: 'Add problem',
    addMedia: 'Add media',
    addSector: 'Add sector',
    editSector: 'Edit sector',
    editArea: 'Edit area',
    sectorSections: 'Sector sections',
    areaSections: 'Area sections',
    /** Access notice; `info` is the API's reason text (climbing ban, bird protection, …). */
    sectorClosed: 'Sector closed: {{info}}',
    areaClosed: 'Area closed: {{info}}',
    hasTrailContent: 'Contains trail with description or media',
    /** Jargon, but still catalogued so the audit stays clean and another locale can respell it. */
    pdf: 'PDF',
    downloadPdf: 'Download PDF',
    maps: 'Maps',
    parking: 'Parking',
    /** Trail chip under the title; `names` is the joined (API) trail titles. */
    trails: 'Trails: {{names}}',
    underDevelopment: 'Under development',
    /** Tab label; the sector/problem counts render in their own spans, so the label itself is count free. */
    sectors: 'Sectors',
    chooseView: 'Choose sector grid or full problem list',
    sectorPickerAria: 'Sector: {{name}}. Open list of sectors in this area.',
    /**
     * Per-type summary under the problem list. Two independent counts (routes, ticked) can't share one `count`, so the
     * glue is a plain key and each fragment pluralizes on its own: `counts.routes` + `tickedCount`.
     */
    typeSummary: '{{header}}: {{routes}}',
    typeSummaryWithTicks: '{{header}}: {{routes}}, {{ticked}}',
    tickedCount_one: '{{count}} ticked',
    tickedCount_few: '{{count}} ticked',
    tickedCount_other: '{{count}} ticked',
    /** Screen-reader-only word after the ticked count in the per-type summary. */
    tickedSr: 'ticked',
    /** Bar-chart tooltip: `routes` is `counts.routes` for the same grade. */
    gradeBarTitle: '{{grade}}: {{routes}}',
    missingProblemId: 'Missing problemId param',
    notFoundProblemDescription: 'Cannot find the specified problem or insufficient permissions.',
    loadProblemError: 'Something went wrong while loading this problem.',
    unableToLoadProblem: 'Unable To Load Problem',
    editProblem: 'Edit problem',
    problemSections: 'Problem sections',
    /** Bold label in the access notice; the API's free text follows it. */
    problemBrokenLabel: 'Problem broken:',
    routeBrokenLabel: 'Route broken:',
    /** Header buttons: run (or edit) your own tick, and the admin-only hidden-media toggle. */
    tick: 'Tick',
    editTick: 'Edit tick',
    showHiddenMedia: 'Show hidden media',
    showingHiddenMedia: 'Showing hidden media',
    dangerReported: 'Danger reported for this route',
    /** Comment card heading on the problem page (the counted `aria-label` comes from `counts.comments`). */
    comments: 'Comments',
    firstAidAscent: 'First aid ascent:',
    trivia: 'Trivia:',
    /** Meta-card heading; the guillemets are part of the copy so another locale can pick its own quotes. */
    rockHeading: 'Rock «{{rock}}»',
  },
  /**
   * About page: long-form prose with a single link slot per sentence.
   *
   * Prose uses `<Trans>` (see `status.insufficientPrivilegesContact`) so the surrounding sentence stays one unit for the
   * translator while the link/amount/name stays a real element. Proper nouns (Jostein, BRV, domains, screenshots of old
   * guides) are deliberately *inside* the sentence — they are names, not copy.
   */
  about: {
    pageDescription: 'History, information and administrators',
    statutes: {
      title: 'Statutes',
      subheader: 'A nonprofit website created by climbers, for climbers',
      createdBy: 'The webpage is created and maintained by <link>Jostein Øygarden</link>',
      aim: 'The aim is to provide the best possible climbing information in the region',
      nonProfit: 'The site is non-profit and free to use for everyone',
      editors: 'The editors are a variety of active climbers in the different regions',
      ownership: 'The owner of the content is linked to the origin, club or individual',
    },
    collaboration: {
      title: 'Collaboration',
      subheader: 'Get your own guide',
      contact: 'Contact <link>Jostein</link> if you want to establish your own online guidebook for your region.',
      hostingFee: 'The yearly hosting fee (as for 2026) is approximately <amount>250,- NOK</amount>.',
      /** `<pdf/>` is a self-closing slot: the link (label + icon) lives in the component, its sentence does not. */
      brvAgreement:
        'In Rogaland, <brv>BRV</brv> has a signed agreement ({{date}}) covering platform use and data ownership. <pdf/>. We repeat this short notice on every regional guide so it stays easy to find.',
      readPdf: 'Read the PDF',
      norwegianPdf: 'Norwegian PDF',
    },
    ethics: {
      title: 'Ethics',
      subheader: 'Guidelines for the crag',
      respectLandowners: 'Show respect for landowners',
      followPaths: 'Follow paths and park with reason',
      takeTrash: 'Take trash back',
      noChipping: 'No chipping',
      risk: 'Climbing involves risk',
      sitStart: 'Sit start means feet/behind leave the ground last',
      tightenHangers: 'Tighten loose hangers (17mm spanner)',
    },
    moderation: {
      title: 'Content & Moderation',
      subheader: 'Help us keep the platform accurate and safe',
      reportErrors:
        'If you find any factual errors, typos, or outdated information, please report them to a regional administrator or <link>Jostein</link>.',
      namesTrivia:
        'Names are given by the first ascensionists. Some routes and boulders have trivia to provide context behind the name.',
      namingGuidance:
        "For guidance on creating welcoming names, see the <link>Norwegian Climbing Federation's recommendations for route naming <icon/></link>.",
      reportOffensive:
        'If you find any content offensive or inappropriate, please contact a regional administrator or <link>Jostein</link>.',
    },
    /**
     * History timeline. Titles are the *domain* each era lived on (not copy), so only the descriptions are catalogued —
     * `redesignDescription` is a framework pairing and reads the same in every locale.
     */
    history: {
      title: 'History',
      subheader: 'First published in 2003',
      redesignTitle: 'Complete redesign',
      redesignDescription: 'Semantic UI -> TailwindCSS',
      screenshotDark: 'Screenshot (dark)',
      screenshotLight: 'Screenshot (light)',
      openSource: 'The project is now open source',
      frontend: 'Frontend',
      backend: 'Backend',
      iceGuide: 'Ice climbing guide, by Jostein Øygarden',
      sportTradGuide: 'Sport- and traditional climbing guide, by Jostein Øygarden',
      boulderingGuideJostein: 'Bouldering guide, by Jostein Øygarden',
      boulderingGuideIdar: 'Bouldering guide, by Idar Ose',
      boulderingGuideVegard: 'Bouldering guide, by Vegard Aksnes',
      boulderingGuidePredecessor: 'Bouldering guide predecessor, by Vegard Aksnes',
      screenshot: 'Screenshot',
      archive: 'Archive',
    },
    administrators: {
      title: 'Administrators',
      /** Subheader while `/administrators` is still loading (no count to show). */
      subheader: 'Regional Admins',
      count_one: '{{count}} Regional Admin',
      count_few: '{{count}} Regional Admins',
      count_other: '{{count}} Regional Admins',
    },
  },
  a11y: {
    skipToContent: 'Skip to main content',
  },
  /**
   * Map / trail editor, shared by the sector and area edit forms and by the standalone polyline editor.
   *
   * The map modes themselves (`PARKING`, `POLYGON`, `TRAIL_PATH_*`) are Leaflet state, not copy, so they stay as they
   * are in the markup.
   */
  mapEditor: {
    outline: 'Outline',
    clearParking: 'Clear parking',
    clearOutline: 'Clear outline',
    addTrail: 'Add trail',
    removeTrail: 'Remove trail',
    reverseTrailDirection: 'Reverse trail direction',
    reverse: 'Reverse',
    clickMapPath: 'Click map to add path points',
    clickMapMarker: 'Click map to place a marker',
    path: 'Path',
    marker: 'Marker',
    markers: 'Markers',
    pathMinPoints: 'Path must have at least 2 points',
    /** Trail title field; the asterisk marks the required field, so it is part of the label. */
    trailTitle: 'Title *',
    labelAsterisk: 'Label *',
    latAsterisk: 'Lat *',
    lngAsterisk: 'Lng *',
    trailIssues: 'Fix these trail issues before saving:',
    sharedWithSectors: 'Shared with sectors',
    selfSector: 'This sector (always included)',
    removeNamed: 'Remove {{name}}',
    shareNamed: 'Share trail with {{name}}',
    points: 'Points',
    rawData: 'Raw Data',
    /** File-format chip and its two names, both proper nouns. */
    gpxTcx: 'GPX/TCX',
    pointNumber: 'Point #{{number}}',
    noPoints: 'No points defined yet. Click on the map to add points.',
    coordinateString: 'Coordinate String',
    /** `<Trans>`: the two extensions are rendered as `<code>` slots. */
    dropFile: 'Drag-and-drop a <gpx>.gpx</gpx> or <tcx>.tcx</tcx> file',
    importHint: 'Import paths from GPS watches, Strava, or Fitbit to generate the approach path automatically.',
    selectFile: 'Select File',
  },
  /** Sector edit form (`/area/:areaId/sector/:sectorId/edit`). */
  sectorEdit: {
    name: 'Sector name',
    nameRequired: 'Sector name required',
    orientation: 'Orientation',
    /** API-supplied compass direction plus the word that marks it as computed. */
    calculated: '{{direction}} (calculated)',
    calculateFromOutline: '<calculate from outline>',
    closedLabel: 'Sector Closed',
    closedReasonPlaceholder: 'Sector closed reason...',
    restrictions: 'Restrictions',
    restrictionsPlaceholder: 'Sector restrictions...',
    includeAllMarkers: 'Include all markers in sector',
    mapTabAria: 'Map tab',
    problemOrder: 'Problem order',
    confirmTrash: 'Are you sure you want to move sector to trash?',
    save: 'Save sector',
    /** `<Trans>`: the mailto link is the `link` slot, so the name stays with the sentence it belongs to. */
    contact: 'Contact <link>Jostein Øygarden</link> if you want to move or split the sector.',
  },
  /**
   * Topo editor (`/problem/svg-edit/…`): the SVG overlay editor for a single pitch strip.
   *
   * The editor tabs keep their jargon (`Path`, `Bolts`, `Trad`); scene-graph attributes (`transform`, path `d=`) are
   * geometry, not copy, and deliberately stay in the markup.
   */
  svgEdit: {
    title: 'Topo editor',
    /** `<title>` prefix for a single pitch strip; the count is the pitch the editor is scoped to. */
    pitchPrefix: 'Pitch {{pitch}} · ',
    missingParams: 'Missing route parameters',
    sectionsAria: 'Topo editor sections',
    resetSegmentPath: 'Reset segment path',
    text: 'Text',
    resetTexts: 'Reset all text labels',
    bolts: 'Bolts',
    resetAnchors: 'Reset all anchors',
    trad: 'Trad',
    resetBelays: 'Reset all trad belays',
    zoomOutTitle: 'Zoom out (-)',
    zoomOut: 'Zoom out',
    zoomFitTitle: 'Zoom to fit (0) — scroll to zoom, Alt+scroll to scroll the page',
    zoomFit: 'Zoom to fit',
    zoomInTitle: 'Zoom in (+)',
    zoomIn: 'Zoom in',
    cancelAria: 'Cancel and go back to problem',
    pitch: 'Pitch',
    pitchAria: 'Which pitch strip to edit',
    entireRoute: 'Entire route',
    /** Multi-pitch crop tool: the X/Y offsets of the media region. */
    crop: 'Crop',
    cropX: 'X',
    cropY: 'Y',
    cropApplyDirtyTitle: 'Apply to update the crop preview and editor',
    cropMatchesTitle: 'Crop matches the current preview',
    cropApplyAriaDirty: 'Apply crop changes (you have unsaved edits)',
    cropApplyAria: 'Apply crop',
    apply: 'Apply',
    /** Native `prompt()` shown when editing an existing text label in the SVG. */
    editLabelPrompt: 'Edit label text:',
  },
  /**
   * Problem / route edit form (`/problem/edit/…`).
   *
   * The form edits a *problem*, which is a route or a boulder depending on the page; the copy therefore switches on
   * `meta.isBouldering` through `{{noun}}` (`problemEdit.nounProblem` / `nounRoute`) instead of duplicating every
   * sentence. The English noun doubles as the object form, and a locale that inflects it (Czech “cesta” → “cestu”)
   * supplies the accusative here, so `Add {{noun}}` and `… move this {{noun}} …` both read naturally.
   */
  problemEdit: {
    confirmTrash: 'Are you sure you want to move this problem/route to trash?',
    nounProblem: 'problem',
    nounRoute: 'route',
    addNoun: 'Add {{noun}}',
    editNoun: 'Edit {{noun}}',
    saveNoun: 'Save {{noun}}',
    /** `<Trans>`: the mailto link is the `link` slot and `noun` is interpolated. */
    contact: 'Contact <link>Jostein Øygarden</link> if you want to move this {{noun}} to another sector.',
    name: 'Name',
    nameRequired: 'Name required',
    number: 'Number',
    grade: 'Grade',
    selectGrade: 'Select grade…',
    gradeRequired: 'Grade required',
    faUsers: 'FA user(s)',
    selectFaUsers: 'Select FA user(s)',
    faDate: 'FA date',
    faHint: 'Add FA user(s), change grade, or remove the FA date',
    routeLength: 'Route length (m)',
    rock: 'Rock (grouping)',
    searchRock: 'Search or select rock...',
    type: 'Type',
    selectType: 'Select type…',
    typeRequired: 'Type required',
    firstAid: 'First AID ascent?',
    firstAidHint:
      'First AID ascent is separate from the free first ascent above. Add who, when, and optional notes — the problem page only shows this block when at least one of these is set.',
    firstAidClimbers: 'First AID — climbers',
    searchClimbers: 'Search climbers…',
    firstAidDate: 'First AID — date',
    firstAidNotes: 'First AID — notes',
    firstAidNotesPlaceholder: 'Gear, style, or other context for the first aid ascent…',
    pitches: 'Pitches',
    altitude: 'Starting altitude (m)',
    aspect: 'Aspect',
    trivia: 'Trivia',
    brokenPlaceholder: 'Leave empty if not broken',
    brokenProblem: 'Problem broken',
    brokenRoute: 'Route broken',
    includeSiblings: 'Include siblings',
    includeSiblingsAria: 'Include sibling problems and routes on the map',
    removePosition: 'Remove position',
    removePositionTitle: 'Remove this problem’s coordinates from the map',
    saveAndAddNew: 'Save & add new',
  },
  /**
   * Users admin page (`/users`, superadmin only): browse accounts, merge duplicates, rename.
   *
   * Merge jargon (“keeper”, “mergee”) is resolved in the UI into the plain words below, so no locale inherits an
   * English internal name. The subheader builds its sentence from a counted noun plus a counted “in N groups”
   * fragment, because i18next pluralises one `count` per key.
   */
  users: {
    title: 'Users',
    metaDescription: 'Browse users, merge duplicate accounts and edit names (superadmin only)',
    viewAria: 'Users view',
    searchPlaceholder: 'Search users (name, email or id)...',
    tabSuggestions: 'Merge suggestions',
    tabAll: 'All users',
    suggestedProgress: '{{visible}}/{{total}} suggested users',
    suggestedTotal_one: '{{count}} suggested user',
    suggestedTotal_few: '{{count}} suggested users',
    suggestedTotal_other: '{{count}} suggested users',
    /** Second half of the suggestions subheader; keeps its own preposition, which Czech inflects per count. */
    suggestedGroups_one: 'in {{count}} group',
    suggestedGroups_few: 'in {{count}} groups',
    suggestedGroups_other: 'in {{count}} groups',
    usersProgress: '{{visible}}/{{total}} users',
    usersTotal_one: '{{count}} user',
    usersTotal_few: '{{count}} users',
    usersTotal_other: '{{count}} users',
    accountsCount_one: '{{count}} account',
    accountsCount_few: '{{count}} accounts',
    accountsCount_other: '{{count}} accounts',
    unknown: 'Unknown',
    unknownUser: 'Unknown user',
    thisAccount: 'this account',
    seen: 'Seen {{date}}',
    regionsTitle: 'Regions where this user has activity (most ascents first)',
    editName: 'Edit name',
    editNameTitle: 'Edit the name of this user',
    editNameNotAllowed: 'Not allowed - this user is only associated with regions where you are not a superadmin',
    firstName: 'First name',
    lastName: 'Last name',
    emails: 'Emails: {{list}}',
    noEmail: 'No email registered.',
    associatedRegions: 'Associated regions: {{list}}.',
    noRegions: 'This user is not associated with any region.',
    saving: 'Saving…',
    saveName: 'Save name',
    keep: 'Keep',
    keepTitle: 'Keep this account (the merge target)',
    keepTag: 'Keep: {{name}} (#{{userId}})',
    merge: 'Merge',
    merging: 'Merging…',
    mergeTag: 'Merge: {{name}} (#{{userId}})',
    mergeSelf: 'You cannot merge away your own account',
    mergeKept: 'The kept account cannot also be merged away',
    mergeOther: 'Merge this account into the kept account',
    markToMerge: 'Mark accounts to merge',
    pickKeeper: 'Pick keeper',
    clear: 'Clear',
    markNotDupe: 'Mark {{name}} as NOT a duplicate of the other account(s) here',
    notDupe: 'Not dupe',
    mergeSelectionAria: 'Merge selection',
    noSuggestions: 'No merge suggestions found',
    suggestionsHint:
      'Accounts with the same name that share a region, or the same email address, are suggested here. Switch to "All users" to browse everything.',
    noUsers: 'No users found',
    notCandidates: 'Not merge candidates',
    dismissedTitle: 'Browse accounts you have marked as NOT merge candidates, and undo mistakes',
    noNotCandidates: 'No account pairs have been marked as "not merge candidates".',
    undo: 'Undo',
    undoTitle: 'Undo: let these two accounts be suggested for merging again',
  },
  /** Area edit form (`/area/edit/…`). Mirrors `sectorEdit`, minus the map editor. */
  areaEdit: {
    name: 'Area name',
    namePlaceholder: 'Enter name',
    nameRequired: 'Area name required',
    coordinatesRequired: 'Latitude and longitude required',
    forDevelopers: 'For developers',
    noDogsAllowed: 'No dogs allowed',
    trash: 'Trash',
    descriptionPlaceholder: 'Enter description',
    closedLabel: 'Area Closed',
    closedReasonPlaceholder: 'Enter closed-reason...',
    restrictions: 'Restrictions',
    restrictionsPlaceholder: 'Enter specific restrictions...',
    gradeSystem: 'Grade system',
    gradesUsed: 'Grades used by this area',
    gradeSystemLocked: 'The grade system cannot be changed while the area has problems.',
    sectorOrder: 'Sector order',
    confirmTrash: 'Are you sure you want to move area to trash?',
    save: 'Save area',
    /** `<Trans>`: the mailto link is the `link` slot. */
    contact: 'Contact <link>Jostein Øygarden</link> if you want to split the area.',
  },
  /**
   * Media topo editor (`MediaSvgEdit`): draws descent lines and rappel stations on a photo.
   *
   * Shares `svgEdit` for the chrome it has in common with the pitch editor (zoom, tab bar, bolts, trad); only the
   * rappel-specific labels live here.
   */
  mediaSvgEdit: {
    title: 'Draw on image',
    srTitle: 'Media topo editor',
    /** Tool + its reset, for the descent line drawn over the photo. */
    resetDescentPath: 'Reset descent path',
    resetBolts: 'Reset all bolted rappels',
    resetTrad: 'Reset all trad rappels',
    cancelAria: 'Cancel and go back',
  },
  /**
   * Donations page: prose with one link slot per sentence, so `<Trans>` keeps the sentence whole for the translator.
   * The club and product names (`BRV`, `Bratte Rogalands Venner`, `TPGO`, and the Norwegian payment note) stay inside
   * the sentence — they are names, not copy.
   */
  donations: {
    title: 'Donations',
    subheader: 'Support the site',
    nonprofit: 'This is a nonprofit website created by climbers, for climbers.',
    operatingCosts:
      'The local climbing club <brv>BRV (Bratte Rogalands Venner)</brv> pays all monthly operating expenses (server costs). By the end of the year, these costs are split between the climbing clubs that use these services.',
    donate: 'You can help out by donating a gift via <tpgo>TPGO</tpgo> (see "Støtte nettfører").',
    membership:
      'You can also support by joining your local climbing club, for example <brvMembership>BRV membership</brvMembership>.',
  },
  /**
   * Permissions page (`/permissions`, superadmin only): one role dropdown per user.
   *
   * The role list is a module-level config (it is compared by value), so it carries `labelKey`s that the render site
   * resolves through `t()`. `title` reuses `header.permissions` wording through its own key because the page heading
   * and the menu entry may diverge in another locale.
   */
  permissions: {
    title: 'Permissions',
    metaDescription: 'Manage user roles and access',
    searchPlaceholder: 'Search users...',
    noUsers: 'No users found',
    usersTotal_one: '{{count}} user in total',
    usersTotal_few: '{{count}} users in total',
    usersTotal_other: '{{count}} users in total',
    /** Dropdown label plus the fallback when the level is unknown. */
    defaultUser: 'Default user',
    readHidden: 'Read hidden',
    adminWrite: 'Admin (Write)',
    superadmin: 'Superadmin',
    /** Section headings of the grouped list; `defaultUsers` is plural because it heads a group. */
    roles: {
      superadmin: 'Superadmin',
      admin: 'Admin',
      readHidden: 'Read hidden',
      defaultUsers: 'Default users',
    },
  },
  /**
   * Privacy policy page: legal prose with one link slot per sentence.
   *
   * The agreement sentence is the privacy page's own wording (the About page states the same facts in its own
   * sentence), but the PDF button label and its tooltip are reused from `about.collaboration`.
   */
  privacy: {
    title: 'Privacy Policy',
    subheader: 'How we protect your data',
    intro:
      'This is a non-profit site. Your name may be visible, but your email stays private and is never used for spam.',
    introductionTitle: 'Introduction',
    introVisitors: 'We safeguard the privacy of website visitors.',
    introStorage:
      'We store information in your browser using local storage and session storage (not cookies)—for example to keep you signed in, remember your preferences, and cache some content. We also use a third-party error-monitoring service (Sentry) to help diagnose and fix technical issues.',
    personalDataTitle: 'How we use personal data',
    account: 'When you create an account, we store your name, email, and profile picture from your login provider.',
    saved:
      'Data you choose to save, such as climbed routes/boulders and uploaded images, can be deleted from your profile page.',
    helps: 'Saved data helps improve guide quality and helps other users choose climbs.',
    noSelling:
      'We do not sell personal data or use it for advertising. Trusted providers process data on our behalf only where needed to run the service (for example sign-in and error monitoring), and only as required for that purpose.',
    regionalTitle: 'Regional agreements',
    /** `<Trans>`: `<brv>` is the club link, `<pdf/>` the agreement download, `{{date}}` the signing date. */
    agreement:
      'For Rogaland, there is a signed agreement with <brv>BRV</brv> (the local climbing club) from {{date}}. It covers who owns the data, how the platform may be used, and related terms. Legally it applies to Rogaland; we still show this section on every regional guide so the terms stay easy to find: <pdf/>.',
    deletingTitle: 'Deleting personal data',
    deletingMost: 'Most personal data can be deleted from your profile page after login.',
    deletingContact: 'If you need help, contact <mail>jostein.oygarden@gmail.com</mail>.',
  },
  /**
   * Visibility dropdown (`VisibilitySelector`): who may see an entity.
   *
   * The option list is a module-level config, so it carries `textKey`s that the render site resolves through `t()`.
   * `label` is only the default label of `VisibilitySelectorField`; callers may pass their own.
   */
  visibility: {
    label: 'Visibility',
    everyone: 'Visible for everyone',
    admins: 'Only visible for administrators',
    superAdmins: 'Only visible for super administrators',
  },
  /**
   * One line of the activity feed (“who did what to which problem”).
   *
   * The verbs inflect per subject and per locale, and the media counts are counted nouns, so they are keys rather than
   * sentence fragments glued in the component. `andJoiner` is the list conjunction (“A, B and C”).
   */
  activityFeed: {
    opened: 'opened',
    firstAscended: 'first ascended',
    commentedOn: 'commented on',
    repeated: 'repeated',
    ticked: 'ticked',
    on: 'on',
    andJoiner: ' and ',
    /** Location lead-in: “<problem> in <crag>”. */
    in: 'in',
    metaDescription: 'Latest first ascents, ticks, comments and media across the site.',
    imageCount_one: '{{count}} image',
    imageCount_few: '{{count}} images',
    imageCount_other: '{{count}} images',
    videoCount_one: '{{count}} video',
    videoCount_few: '{{count}} videos',
    videoCount_other: '{{count}} videos',
  },
  /** Popup chrome of a Leaflet marker (parking spots, weather and source links). */
  mapPopup: {
    navigate: 'Navigate',
    weatherForecast: 'Weather Forecast',
    officialSource: 'Official Source',
  },
  /** Account settings page (`/settings`). Only its chrome lives here; the form is `ProfileSettings`. */
  settings: {
    metaDescription: 'Account settings',
  },
  /** “Top” tab of a sector/area: the climbers ranking table. */
  top: {
    climbers: 'Climbers',
  },
  /** Avatar lightbox: the profile link and close button. */
  avatarModal: {
    viewProfile: 'View profile',
  },
  /** Download/action menu chip: button label while a download is running. */
  actionMenu: {
    downloading: 'Downloading {{progress}}%',
  },
  /** Grouped grade-distribution table: first column header and the total column. */
  chartTable: {
    groupBySector: 'Sector',
    groupByRegion: 'Region',
    total: 'Total',
  },
  /** Landowner restriction widget. `allYearLeash` is the Norwegian term as written on the sign. */
  dogWarning: {
    title: 'No dogs allowed',
    allYearLeash: 'Helårsbåndtvang',
  },
  /** Markdown hint next to a field label; `<Trans>`: `<link>` is the Remarkable demo link. */
  markdownField: {
    supports: '(supports <link>markdown</link>)',
  },
  /**
   * Creatable user picker (`UserSelector` / `UsersSelector`).
   *
   * The “create” affordance is a `formatCreateLabel` callback, so it is rendered through `<Trans>` (no hook in the
   * react-select render prop); quotes are part of the copy so a locale can pick its own pair.
   */
  userSelector: {
    create: 'Create “{{name}}”',
  },

  /** Video still being transcoded server-side (`VideoProcessingPlaceholder`). */
  videoProcessing: {
    title: 'Processing video',
    description:
      'This video is still being processed in the background. It will be ready soon — refresh the page if the preview stays empty.',
  },
  /** Weather popup footer; `yr.no` is the Norwegian Meteorological Institute’s service. */
  weather: {
    forecastSource: 'Forecast · yr.no',
  },
  language: {
    /** Accessible name of the header language selector; its option labels come from `meta.languages`. */
    selectorLabel: 'Language',
  },
} as const;

/**
 * `typeof en` with every leaf widened to `string`.
 *
 * A localized catalog is declared `const cs: Catalog = {…}`, which turns both a missing key and an
 * unknown key into a compile error while still allowing different text.
 */
type Translated<T> = T extends string ? string : { [K in keyof T]: Translated<T[K]> };

export type Catalog = Translated<typeof en>;
