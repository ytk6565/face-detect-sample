import { Ref, ref } from '@nuxtjs/composition-api'

type Point = [number, number]

export type Points = {
  nose?: Point
  leftEye?: Point
  rightEye?: Point
  leftMouth?: Point
  rightMouth?: Point
  upperLip?: Point
  lowerLip?: Point
  jaw?: Point
  leftOutline?: Point
  rightOutline?: Point
}

export type State = {
  points: Points
}

/**
 * 座標を更新する
 *
 * @param state
 * @returns void
 */
type UpdatePoints = (
  state: Ref<State>
) => (points: NonNullable<State['points']>) => void

const updatePoints: UpdatePoints = (state) => (points) => {
  state.value = {
    ...state.value,
    points,
  }
}

/**
 * composition 関数
 */
type UseLandmark = () => {
  state: Ref<State>
  updatePoints: ReturnType<UpdatePoints>
}

export const useLandmark: UseLandmark = () => {
  const state = ref({
    points: {},
  })

  return {
    state,
    updatePoints: updatePoints(state),
  }
}
