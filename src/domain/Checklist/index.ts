import FastAverageColor from 'fast-average-color'
import { Angles } from '../Headpose'
import { Points } from '../Landmark'

const fastAverageColor = new FastAverageColor()

export type Source =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | null

export type Rect = { x: number; y: number; width: number; height: number }

/**
 * ポイントであるか
 *
 * @param value
 * @returns boolean
 */
const isPoints = (value: unknown): value is [number, number][] =>
  !!value &&
  Array.isArray(value) &&
  value.every(
    (point) =>
      point && typeof point[0] === 'number' && typeof point[1] === 'number'
  )

/**
 * 明るさを判定する関数
 *
 * @param red
 * @param green
 * @param blue
 * @returns brightness 0 ~ 1
 */
type GetBrightness = (red: number, green: number, blue: number) => number

const BRIGHTNESS_WEIGHTS = [0.2126, 0.7152, 0.0722]
const BRIGHTNESS_MAX = BRIGHTNESS_WEIGHTS.reduce((a, b) => a + b * 255, 0)

export const getBrightness: GetBrightness = (red, green, blue) => {
  // 0 ~ 1
  const brightness =
    red * BRIGHTNESS_WEIGHTS[0] +
    green * BRIGHTNESS_WEIGHTS[1] +
    blue * BRIGHTNESS_WEIGHTS[2]

  return brightness / BRIGHTNESS_MAX
}

/**
 * 顔が枠内に収まっているか
 */
export type ValidateContains = (
  points: Points | undefined,
  flame: Rect
) => boolean

export const validateContains: ValidateContains = (points, flame) => {
  const _points = points && Object.values(points)
  if (points === undefined || !isPoints(_points) || !flame) {
    return false
  }

  const { width, height } = flame

  return _points.every((point) => {
    const x = point[0] - flame.x
    const y = point[1] - flame.y

    return x > 0 && x < width && y > 0 && y < height
  })
}

/**
 * 顔が正面を向いているか
 */
export type ValidateDirection = (
  range: number
) => (eulerAngles: Angles | undefined) => boolean

export const validateDirection: ValidateDirection =
  (range) => (eulerAngles) => {
    if (eulerAngles === undefined) {
      return false
    }

    const { pitch, yaw, roll } = eulerAngles

    return (
      Math.abs(pitch) > 180 - range &&
      Math.abs(yaw) < range &&
      Math.abs(roll) < range
    )
  }

/**
 * 枠内に絞った画像の平均明度を算出する
 *
 * @param source ソース
 */
export type ValidateBrightness = (
  threshold: number
) => (source: Source, flame: Rect) => boolean

const validateBrightnessFactory: (
  fac: typeof fastAverageColor
) => ValidateBrightness = (fac) => (threshold) => (source, flame) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (source === null || !canvas || !context || !flame) {
    return false
  }

  canvas.width = flame.width
  canvas.height = flame.height
  context.drawImage(
    source,
    flame.x,
    flame.y,
    flame.width,
    flame.height,
    0,
    0,
    flame.width,
    flame.height
  )

  const [red, green, blue] = fac.getColor(canvas).value

  return getBrightness(red, green, blue) > threshold
}

export const validateBrightness: ValidateBrightness =
  validateBrightnessFactory(fastAverageColor)
