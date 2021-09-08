import { watch as Watch, Ref } from '@nuxtjs/composition-api'
import { Update } from '~/compositions/store/useHeadpose'
import { State as LandmarkState } from '~/compositions/store/useLandmark'
import { OPCV as Opcv } from '~/libs/opencv/getEulerAngle'

let OPCV: Opcv | null = null

/**
 * headpose のステートを更新する
 *
 * @param update headpose のステートを更新する関数
 */
type UpdateHeadpose = (
  update: ReturnType<Update>
) => (state: LandmarkState) => void

const updateHeadpose: UpdateHeadpose = (update) => (state) => {
  if (!window.cv || !window.cv.Mat) {
    return
  }

  if (!OPCV) {
    OPCV = new Opcv()
  } else {
    const { eulerAngles, projectPoints } = OPCV.estimateEulerAngles(
      state.points
    )

    update(eulerAngles, projectPoints)
  }
}

/**
 * composition 関数
 *
 * @param watch watch 関数
 * @param state landmark のステート
 * @param update headpose のステートを更新する関数
 */
type UseHeadposeRoot = (
  watch: typeof Watch,
  state: Ref<LandmarkState>,
  update: ReturnType<Update>
) => {
  loadedOpenCV: boolean
}

export const useHeadposeRoot: UseHeadposeRoot = (watch, state, update) => {
  if (OPCV) {
    OPCV.delete()
    OPCV = null
  }

  watch(state, (newState) => updateHeadpose(update)(newState))

  const loadedOpenCV = typeof window !== 'undefined' && !!window.cv

  return {
    loadedOpenCV,
  }
}
