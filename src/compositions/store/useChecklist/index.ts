import { Ref, ref } from '@nuxtjs/composition-api'
import FastAverageColor, { IFastAverageColor } from 'fast-average-color'
import { State as Headpose } from '~/compositions/store/useHeadpose'

const fac = new FastAverageColor()

type Source = Parameters<IFastAverageColor['getColor']>[0]

export type State = {
  contains: boolean
  direction: boolean
  brightness: boolean
}

/**
 * 顔が枠内に収まっているか
 */
type ValidateContains = () => boolean

const validateContains: ValidateContains = () => false

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
type ValidateBrightness = (source: Source) => boolean

const validateBrightness: ValidateBrightness = (source) =>
  fac.getColor(source).isLight

/**
 * ステートを更新する
 *
 * @param state ステート
 */
type Update = (
  state: Ref<State>
) => (source: Source, eulerAngles: Headpose['eulerAngles']) => void

const update: Update = (state) => (source, eulerAngles) => {
  state.value = {
    contains: validateContains(),
    direction: validateDirection(eulerAngles),
    brightness: validateBrightness(source),
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
