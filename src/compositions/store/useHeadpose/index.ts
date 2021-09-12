import { Ref, ref } from '@nuxtjs/composition-api'
import { Angles, ProjectPoints } from '~/domain/Headpose'

export type State = {
  eulerAngles?: Angles
  projectPoints?: ProjectPoints
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
  eulerAngles: State['eulerAngles'],
  projectPoints: State['projectPoints']
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
