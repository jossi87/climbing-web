import { components } from "../@types/buldreinfo/swagger";

export type MediaRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function scaleSvg(
  m: components["schemas"]["Media"],
  pitch: number,
): {
  imgW: number;
  imgH: number;
  mediaRegion: MediaRegion;
  svgs: components["schemas"]["Svg"][];
} {
  if (pitch && m.svgs?.length > 0 && m.svgs.some((x) => x.nr === pitch)) {
    const pitchSvg = m.svgs.filter((x) => x.nr === pitch)[0];
    const mediaRegion = calculateMediaRegion(pitchSvg.path, m.width, m.height);
    const svgs = [];
    if (pitch > 1 && m.svgs.some((x) => x.nr === pitch - 1)) {
      const svg = m.svgs.filter((x) => x.nr === pitch - 1)[0];
      svgs.push({ ...svg, path: scalePath(svg.path, mediaRegion) });
    }
    svgs.push({ ...pitchSvg, path: scalePath(pitchSvg.path, mediaRegion) });
    if (m.svgs.some((x) => x.nr === pitch + 1)) {
      const svg = m.svgs.filter((x) => x.nr === pitch + 1)[0];
      svgs.push({ ...svg, path: scalePath(svg.path, mediaRegion) });
    }
    return {
      imgW: mediaRegion.width,
      imgH: mediaRegion.height,
      mediaRegion,
      svgs,
    };
  }
  return {
    imgW: m.width,
    imgH: m.height,
    mediaRegion: null,
    svgs: m.svgs,
  };
}

export function calculateMediaRegion(
  path: string,
  mediaWidth: number,
  mediaHeight: number,
): MediaRegion {
  if (!path) {
    return null;
  }

  const pathLst = path.replace("  ", " ").trim().split(" ");

  // Calculate image region
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < pathLst.length; i++) {
    const part = pathLst[i];

    switch (part) {
      case "M":
      case "L": {
        const x = parseInt(pathLst[i + 1]);
        const y = parseInt(pathLst[i + 2]);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        break;
      }
      case "C": {
        const x = parseInt(pathLst[i + 5]);
        const y = parseInt(pathLst[i + 6]);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        break;
      }
    }
  }

  const margin = 360;
  minX = Math.max(minX - margin, 0);
  minY = Math.max(minY - margin, 0);
  maxX = Math.min(maxX + margin, mediaWidth);
  maxY = Math.min(maxY + margin, mediaHeight);

  // Crop should have at least 1920 in width (if possible)
  const width = Math.min(Math.max(maxX - minX, 1920), mediaWidth);
  const addX = width - (maxX - minX);

  if (addX > 0) {
    let addLeft = Math.min(addX / 2, minX);
    let addRight = addX - addLeft;

    if (maxX + addRight > mediaWidth) {
      addRight = mediaWidth - maxX;
      addLeft = addX - addRight;
    }

    minX -= addLeft;
    maxX += addRight;
  }

  // Crop should have at least 1080 in height (if possible)
  const height = Math.min(Math.max(maxY - minY, 1080), mediaHeight);
  const addY = height - (maxY - minY);

  if (addY > 0) {
    let addTop = Math.min(addY / 2, minY);
    let addBottom = addY - addTop;
    if (maxY + addBottom > mediaHeight) {
      addBottom = mediaHeight - maxY;
      addTop = addY - addBottom;
    }
    minY -= addTop;
    maxY += addBottom;
  }

  return {
    x: Math.round(minX),
    y: Math.round(minY),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function scalePath(path: string, mediaRegion: MediaRegion): string {
  const pathLst = path.replace("  ", " ").trim().split(" ");
  // Update path
  const newPathLst = [];

  for (let i = 0; i < pathLst.length; i++) {
    const part = pathLst[i];
    const isCharacter = !/^\d+$/.test(part);
    if (isCharacter) {
      newPathLst.push(part);
    } else {
      newPathLst.push(parseInt(pathLst[i++]) - mediaRegion.x);
      newPathLst.push(parseInt(pathLst[i]) - mediaRegion.y);
    }
  }
  return newPathLst.join(" ");
}
