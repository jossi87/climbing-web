import { neverGuard } from '../../utils/neverGuard';
import {
  CubicPoint,
  isArc,
  isCubicPoint,
  isQuadraticPoint,
  ParsedEntry,
  parsePath,
  Point,
} from '../../utils/svg-utils';

export const generatePath = (points: ParsedEntry[]) => {
  let d = '';
  points.forEach((p, i) => {
    if (i === 0) {
      // first point
      d += 'M ';
    } else {
      if (isQuadraticPoint(p)) {
        // quadratic
        d += `Q ${p.q.x} ${p.q.y} `;
      } else if (isCubicPoint(p)) {
        // cubic
        d += `C ${p.c[0].x} ${p.c[0].y} ${p.c[1].x} ${p.c[1].y} `;
      } else if (isArc(p)) {
        // arc
        d += `A ${p.a.rx} ${p.a.ry} ${p.a.rot} ${p.a.laf} ${p.a.sf} `;
      } else {
        d += 'L ';
      }
    }
    d += `${p.x} ${p.y} `;
  });
  return d;
};

type State = {
  mode: 'idle' | 'drag-point' | 'drag-cubic-0' | 'drag-cubic-1';
  activePoint: number;
  points: Readonly<ParsedEntry[]>;
  path: string;

  otherPoints: Record<string, ParsedEntry & { ix: number }>;
};

type Update =
  | { action: 'reset' }
  | { action: 'add-point'; x: number; y: number }
  | { action: 'remove-point' }
  | { action: 'update-path'; path: string }
  | { action: 'idle' }
  | { action: 'drag-point'; index: number }
  | { action: 'drag-cubic'; index: number; c: 0 | 1 }
  | { action: 'set-type'; type: 'line' | 'curve' }
  | { action: 'mouse-move'; x: number; y: number }
  | { action: 'mouse-up' };

export const reducer = (state: State, update: Update): State => {
  const { action } = update;
  switch (action) {
    case 'reset': {
      return {
        ...state,
        mode: 'idle',
        activePoint: 0,
        points: [],
        path: '',
      };
    }

    case 'add-point': {
      if (state.points.length > 0) {
        const lastPoint = state.points[state.points.length - 1];
        if (lastPoint.x === update.x && lastPoint.y === update.y) {
          // Trying to add an identical point - ignore this.
          return state;
        }
      }

      const points = [...state.points, { x: update.x, y: update.y }];
      if (points.length > 1) {
        const latest = points[points.length - 1];
        const previous = points[points.length - 2];
        const distance = Math.hypot(latest.x - previous.x, latest.y - previous.y);
        if (distance > 130) {
          // If the points are sufficiently far away from each other,
          // automatically connect them with a curve, rather than a line.

          const deltaX = Math.round((previous.x - latest.x) / 3);
          const deltaY = Math.round((previous.y - latest.y) / 3);
          // Update points
          (latest as CubicPoint).c = [
            {
              x: previous.x - deltaX,
              y: previous.y - deltaY,
            },
            {
              x: latest.x + deltaX,
              y: latest.y + deltaY,
            },
          ];
        }
      }

      const path = generatePath(points);
      return {
        ...state,
        mode: state.mode,
        activePoint: points.length - 1,
        points,
        path,
      };
    }

    case 'remove-point': {
      const points = state.points.filter((_, i) => i !== state.activePoint);
      if (points.length > 0 && isCubicPoint(points[0])) {
        delete points[0].c;
      }
      const path = generatePath(points);
      return {
        ...state,
        mode: state.mode,
        activePoint: Math.max(0, points.length - 1),
        points,
        path,
      };
    }

    case 'update-path': {
      try {
        const points = parsePath(update.path);
        return {
          ...state,
          mode: state.mode,
          activePoint: Math.max(0, points.length - 1),
          points,
          path: update.path,
        };
      } catch (ex) {
        console.debug(ex);
        return {
          ...state,
          path: update.path,
        };
      }
    }

    case 'drag-point': {
      if (!state.points[update.index]) {
        return state;
      }

      return {
        ...state,
        mode: 'drag-point',
        activePoint: update.index,
      };
    }

    case 'drag-cubic': {
      if (!state.points[update.index] || !isCubicPoint(state.points[update.index])) {
        return state;
      }

      return {
        ...state,
        mode: update.c === 0 ? 'drag-cubic-0' : 'drag-cubic-1',
        activePoint: update.index,
      };
    }

    case 'idle': {
      return {
        ...state,
        mode: 'idle',
      };
    }

    case 'mouse-move': {
      const { mode } = state;
      switch (mode) {
        case 'idle': {
          return state;
        }

        case 'drag-point': {
          const points = state.points.map((p, i) => {
            if (i === state.activePoint) {
              return {
                ...p,
                x: update.x,
                y: update.y,
              };
            }
            return p;
          });
          return {
            ...state,
            points,
            path: generatePath(points),
          };
        }

        case 'drag-cubic-0':
        case 'drag-cubic-1': {
          const which = mode === 'drag-cubic-0' ? 0 : 1;
          const points = state.points.map((p, i) => {
            if (i !== state.activePoint) {
              return p;
            }

            if (!isCubicPoint(p)) {
              return p;
            }

            return {
              ...p,
              c: {
                ...p.c,
                [which]: {
                  x: update.x,
                  y: update.y,
                },
              },
            };
          });

          return {
            ...state,
            points,
            path: generatePath(points),
          };
        }

        default: {
          return neverGuard(mode, state);
        }
      }
    }

    case 'set-type': {
      const points = state.points.map((p, i, points) => {
        if (i !== state.activePoint || i === 0) {
          return p;
        }

        const { type } = update;

        switch (type) {
          case 'line': {
            if (!isCubicPoint(p)) {
              return p;
            }

            const next: Point & { c?: CubicPoint['c'] } = { ...p };
            delete next.c;
            return next;
          }

          case 'curve': {
            const previous = points[i - 1];

            return {
              ...p,
              c: [
                {
                  x: (p.x + previous.x - 50) / 2,
                  y: (p.y + previous.y) / 2,
                },
                {
                  x: (p.x + previous.x + 50) / 2,
                  y: (p.y + previous.y) / 2,
                },
              ],
            } satisfies ParsedEntry;
          }

          default: {
            return neverGuard(type, p);
          }
        }
      });

      return {
        ...state,
        points,
      };
    }

    // They're done editing things - do a sanity-check on the data and
    // align things if necessary.
    case 'mouse-up': {
      const { otherPoints } = state;

      const keys = new Map<string, number>();
      const keyLookup: string[] = new Array(state.points.length);
      let activePoint = state.activePoint;

      const points = state.points
        .map((p, i, points) => {
          const key = `${p.x}x${p.y}`;

          // Remove duplicate points
          const otherIndex = keys.get(key);
          if (otherIndex !== undefined) {
            if (activePoint === i) {
              activePoint = otherIndex;
            } else if (activePoint > i) {
              activePoint -= 1;
            }

            return undefined;
          }

          // Cache this key so we can fetch it later
          keyLookup[i] = key;
          keys.set(key, i);

          const paired = otherPoints[key];
          if (!paired) {
            return p;
          }

          if (i === 0) {
            if (points.length >= 2 && paired.ix === 0) {
              // The starting point for this line overlaps with the starting
              // point for another route. If this were to stand, then we'd have
              // an awkward problem: the start labels would overlap. In these
              // cases, we'll insert a new point that's lower than the other one
              // to force them to not overlap.
              //
              // TODO: It might be nicer to have better painting logic to allow
              // the labels to float themselves around to prevent this situation
              // without having to synthesize arbitrary points, but .. oh well.
              activePoint += 1;
              return [{ ...p, y: p.y + 90 }, p];
            }

            return p;
          }

          const previousPair = otherPoints[keyLookup[i - 1]];
          if (previousPair && !isCubicPoint(p)) {
            // The previous point in the line (which has already been processed)
            // *also* lines up with another point in the SVG. We should make
            // sure that the lines exactly match so that it looks as clean as
            // possible.
            //
            // NOTE: This is making an assumption that there aren't two
            // consecutive points aligning with two separate routes. If that
            // happens, things will get pretty goofy. However, this is a corner
            // case, and one that is easily fixed by the user just adding a
            // third point between them if it ever does.
            //
            // While drawing topo per pitch (e.g. Hoka Hey) this resulted in
            // cubic line being converted to line. Added isCubicPoint check
            // to fix this issue.
            return { ...paired };
          }

          return p;
        })
        .flat()
        .filter((p: ParsedEntry | undefined): p is ParsedEntry => !!p);

      return {
        ...state,
        points,
        path: generatePath(points),
        activePoint,
      };
    }

    default: {
      return neverGuard(action, state);
    }
  }
};
