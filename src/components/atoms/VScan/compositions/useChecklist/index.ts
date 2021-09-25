import { ComputedRef, computed, Ref } from '@nuxtjs/composition-api'
import { Landmark } from '@/domain/Landmark'
import { HeadPose } from '@/domain/HeadPose'
import {
  Checklist,
  ValidateContains,
  validateContains,
  ValidateDirection,
  validateDirection,
  ValidateBrightness,
  validateBrightness,
} from '@/domain/Checklist'
import { Rect } from '@/domain/Web'

const DIRECTION_RANGE = 20
const BRIGHTNESS_THRESHOLD = 0.35

/**
 * チェックリストを作成する
 *
 * @param landmark ランドマーク
 * @param headPose 顔の向き
 * @param validateContains 顔が枠内に収まっているか
 * @param validateDirection 顔が正面を向いているか
 * @param validateBrightness 枠内に絞った画像の平均明度を算出する
 */
type MakeChecklist = (
  landmark: ComputedRef<Landmark>,
  headPose: ComputedRef<HeadPose>,
  videoRef: Ref<HTMLVideoElement | undefined>,
  flameRectRef: Ref<Rect>,
  validateContains: ValidateContains,
  validateDirection: ReturnType<ValidateDirection>,
  validateBrightness: ReturnType<ValidateBrightness>
) => Checklist

const makeChecklist: MakeChecklist = (
  landmark,
  headPose,
  videoRef,
  flameRectRef,
  validateContains,
  validateDirection,
  validateBrightness
) => {
  const flameRect = flameRectRef.value
  const contains = validateContains(landmark.value.points, flameRect)
  const direction = validateDirection(headPose.value.eulerAngles)

  return {
    contains,
    direction,
    brightness:
      contains && direction && validateBrightness(videoRef.value, flameRect),
  }
}

/**
 * composition 関数
 */
type UseChecklist = (
  landmark: ComputedRef<Landmark>,
  headPose: ComputedRef<HeadPose>,
  videoRef: Ref<HTMLVideoElement | undefined>,
  flameRectRef: Ref<Rect>
) => ComputedRef<Checklist>

const useChecklist: UseChecklist = (
  landmark,
  headPose,
  videoRef,
  flameRectRef
) => {
  return computed(() =>
    makeChecklist(
      landmark,
      headPose,
      videoRef,
      flameRectRef,
      validateContains,
      validateDirection(DIRECTION_RANGE),
      validateBrightness(BRIGHTNESS_THRESHOLD)
    )
  )
}

export default useChecklist
