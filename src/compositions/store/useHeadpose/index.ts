import { Ref, ref } from '@nuxtjs/composition-api'

type Angles = {
  pitch: number
  yaw: number
  roll: number
}

type Points = {
  x: number
  y: number
}

export type State = {
  eulerAngles?: Angles
  projectPoints?: {
    nose: Points
    x: Points
    y: Points
    z: Points
  }
}

/**
 * ステートを更新する
 *
 * @param state
 * @returns void
 */
export type Update = (
  state: Ref<State>
) => (
  eulerAngles: NonNullable<State['eulerAngles']>,
  projectPoints: NonNullable<State['projectPoints']>
) => void

const update: Update = (state) => (eulerAngles, projectPoints) => {
  state.value = {
    eulerAngles,
    projectPoints,
  }
}

/**
 * composition 関数
 */
type UseHeadpose = () => {
  state: Ref<State>
  update: ReturnType<Update>
}

export const useHeadpose: UseHeadpose = () => {
  const state = ref({})

  return {
    state,
    update: update(state),
  }
}
