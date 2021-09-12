import { Ref, ref } from '@nuxtjs/composition-api'
import { Points } from '~/domain/Landmark'

export type State = {
  points: Points
}

/**
 * 座標を更新する
 *
 * @param state
 * @returns void
 */
type Update = (
  state: Ref<State>
) => (points: NonNullable<State['points']>) => void

const update: Update = (state) => (points) => {
  state.value = {
    points,
  }
}

/**
 * composition 関数
 */
type UseLandmark = () => {
  state: Ref<State>
  update: ReturnType<Update>
}

export const useLandmark: UseLandmark = () => {
  const state = ref({
    points: {},
  })

  return {
    state,
    update: update(state),
  }
}
