const colors = [
  "red",
  "orange",
  "yellow",
  "olive",
  "green",
  "teal",
  "blue",
  "violet",
  "purple",
  "pink",
  "brown",
  "grey",
  "black",
] as const;

export const hashSemanticColor = (hash: number): (typeof colors)[number] => {
  return colors[hash % colors.length];
};

export const hashHexColor = (hash: number): [`#${string}`, `#${string}`] => {
  const rgb = `000000${(hash & 0xffffff).toString(16)}`.substr(-6);

  const contrast = contrastingColor(rgb);

  return [`#${rgb}`, `#${contrast}`];
};

const contrastingColor = (color: string): string => {
  return luma(color) >= 165 ? "000000" : "ffffff";
};

const luma = (color: string): number => {
  const [r, g, b] = hexToRGBArray(color);
  // SMPTE C, Rec. 709 weightings
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const hexToRGBArray = (color: string): [number, number, number] => {
  if (color.length !== 6) {
    throw new Error("Invalid hex color: " + color);
  }

  return [
    parseInt(color.substr(0, 2), 16),
    parseInt(color.substr(2, 2), 16),
    parseInt(color.substr(4, 2), 16),
  ];
};
