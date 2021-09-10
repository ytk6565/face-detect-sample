import { Ref, ref } from '@nuxtjs/composition-api'
import FastAverageColor from 'fast-average-color'
import { State as Landmark } from '~/compositions/store/useLandmark'
import { State as Headpose } from '~/compositions/store/useHeadpose'

const fac = new FastAverageColor()

type Source = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null

type Flame = { x: number; y: number; width: number; height: number }

export type State = {
  contains: boolean
  direction: boolean
  brightness: boolean
}

/**
 * ポイントであるか
 *
 * @param value
 * @returns boolean
 */
const isPoint = (value: unknown): value is [number, number][] =>
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

const getBrightness: GetBrightness = (red, green, blue) => {
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
type ValidateContains = (points: Landmark['points'], flame: Flame) => boolean

const validateContains: ValidateContains = (points, flame) => {
  const _points = points && Object.values(points)
  if (points === undefined || !isPoint(_points) || !flame) {
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
type ValidateDirection = (eulerAngles: Headpose['eulerAngles']) => boolean

const validateDirection: ValidateDirection = (eulerAngles) => {
  if (eulerAngles === undefined) {
    return false
  }

  const { pitch, yaw, roll } = eulerAngles
  const range = 20

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
type ValidateBrightness = (source: Source, flame: Flame) => boolean

const validateBrightness: ValidateBrightness = (source, flame) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (source === null || !context || !flame) {
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

  return getBrightness(red, green, blue) > 0.4
}

/**
 * ステートを更新する
 *
 * @param state ステート
 */
type Update = (
  state: Ref<State>
) => (
  source: Source,
  eulerAngles: Headpose['eulerAngles'],
  points: Landmark['points'],
  flame: Flame
) => void

const update: Update = (state) => (source, eulerAngles, points, flame) => {
  const contains = validateContains(points, flame)
  const direction = validateDirection(eulerAngles)

  state.value = {
    contains,
    direction,
    brightness: contains && direction && validateBrightness(source, flame),
  }
}

/**
 * composition 関数
 */
type UseChecklist = () => {
  state: Ref<State>
  update: ReturnType<Update>
}

export const useChecklist: UseChecklist = () => {
  const state: Ref<State> = ref({
    contains: false,
    direction: false,
    brightness: false,
  })

  return {
    state,
    update: update(state),
  }
}
