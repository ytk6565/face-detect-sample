import { watch as Watch, Ref } from '@nuxtjs/composition-api'
import { Update } from '~/compositions/store/useHeadpose'
import { State as LandmarkState } from '~/compositions/store/useLandmark'
import { OPCV as Opcv } from '~/libs/opencv/getEulerAngle'

let OPCV: Opcv | null = null

// let flg = true

export const useHeadposeRoot = (
  watch: typeof Watch,
  state: Ref<LandmarkState>,
  update: ReturnType<Update>
) => {
  if (OPCV) {
    OPCV.delete()
    OPCV = null
  }

  watch([state], () => {
    if (!window.cv || !window.cv.Mat) {
      return
    }

    if (!OPCV) {
      OPCV = new Opcv()
    } else {
      const { eulerAngles, projectPoints } = OPCV.estimateEulerAngles(
        state.value.points
      )
      // if (flg) {
      //   flg = false
      //   console.log(eulerAngles)
      //   setTimeout(() => {
      //     flg = true
      //   }, 5000)
      // }
      // update estimated info
      if (eulerAngles && projectPoints) {
        update(eulerAngles, projectPoints)
      }
    }
  })

  const loadedOpenCV = typeof window !== 'undefined' && window.cv

  return {
    loadedOpenCV,
  }
}
