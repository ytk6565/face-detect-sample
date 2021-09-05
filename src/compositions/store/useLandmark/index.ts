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
  renderThrottle: number
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
 * RenderThrottle を更新する
 *
 * @param state
 * @returns void
 */
type UpdateRenderThrottle = (
  state: Ref<State>
) => (renderThrottle: NonNullable<State['renderThrottle']>) => void

const updateRenderThrottle: UpdateRenderThrottle =
  (state) => (renderThrottle) => {
    state.value = {
      ...state.value,
      renderThrottle,
    }
  }

/**
 * composition 関数
 */
type UseLandmark = () => {
  state: Ref<State>
  updatePoints: ReturnType<UpdatePoints>
  updateRenderThrottle: ReturnType<UpdateRenderThrottle>
}

export const useLandmark: UseLandmark = () => {
  const state = ref({
    points: {},
    renderThrottle: 0,
  })

  return {
    state,
    updatePoints: updatePoints(state),
    updateRenderThrottle: updateRenderThrottle(state),
  }
}
