export const rgb2hsv = (
  rgb: [number, number, number]
): [number, number, number] => {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  let h = 0
  switch (min) {
    case max:
      h = 0
      break
    case r:
      h = 60 * ((b - g) / diff) + 180
      break
    case g:
      h = 60 * ((r - b) / diff) + 300
      break
    case b:
      h = 60 * ((g - r) / diff) + 60
      break
  }
  const s = max === 0 ? 0 : diff / max
  const v = max
  return [h, s, v]
}
