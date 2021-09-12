import { Ref, ref } from '@nuxtjs/composition-api'
import { State as Landmark } from '~/compositions/store/useLandmark'
import { State as Headpose } from '~/compositions/store/useHeadpose'
import {
  Source,
  Rect,
  ValidateContains,
  validateContains,
  ValidateDirection,
  validateDirection,
  ValidateBrightness,
  validateBrightness,
} from '~/domain/Checklist'

const DIRECTION_RANGE = 20
const BRIGHTNESS_THRESHOLD = 0.4

export type State = {
  contains: boolean
  direction: boolean
  brightness: boolean
}

/**
 * ステートを更新する
 *
 * @param state ステート
 * @param _validateDirection 顔が正面を向いているか
 * @param _validateBrightness 枠内に絞った画像の平均明度を算出する
 */
type Update = (
  state: Ref<State>,
  validateContains: ValidateContains,
  validateDirection: ReturnType<ValidateDirection>,
  validateBrightness: ReturnType<ValidateBrightness>
) => (
  source: Source,
  eulerAngles: Headpose['eulerAngles'],
  points: Landmark['points'],
  flame: Rect
) => void

const update: Update =
  (state, validateContains, validateDirection, validateBrightness) =>
  (source, eulerAngles, points, flame) => {
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
    update: update(
      state,
      validateContains,
      validateDirection(DIRECTION_RANGE),
      validateBrightness(BRIGHTNESS_THRESHOLD)
    ),
  }
}
