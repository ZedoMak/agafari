export function accessiblePrimary(color: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return "#126b50";
  const value = match[1];
  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return 1.05 / (luminance + 0.05) >= 4.5 ? color : "#126b50";
}
