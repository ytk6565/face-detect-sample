import {
  watch as Watch,
  onMounted as OnMounted,
  ComputedRef,
  Ref,
} from '@nuxtjs/composition-api'
import { useFaceDetect, VideoDomSize } from '~/compositions/useFaceDetect'
import { useVideo } from '~/compositions/useVideo'
import {
  useLandmark,
  State as LandmarkState,
} from '~/compositions/store/useLandmark'
import { useHeadpose } from '~/compositions/store/useHeadpose'
import { useHeadposeRoot } from '~/compositions/useHeadposeRoot'
import {
  useChecklist,
  State as ChecklistState,
} from '~/compositions/store/useChecklist'
import { draw } from '~/domain/Headpose/draw'
import { formatPoint } from '~/domain/Landmark'

/**
 * composition 関数
 *
 * @param watch watch 関数
 * @param onMounted onMounted 関数
 * @param videoRef video 要素
 * @param canvasRef canvas 要素
 * @param canvasAngleRef canvas 要素
 * @param frameRef フレーム要素
 */
type UseRoot = (
  watch: typeof Watch,
  onMounted: typeof OnMounted,
  videoRef: Ref<HTMLVideoElement | null>,
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasAngleRef: Ref<HTMLCanvasElement | null>,
  flameRef: Ref<HTMLDivElement | null>
) => {
  landmarkState: Ref<LandmarkState>
  checklistState: Ref<ChecklistState>
  videoDomSize: ComputedRef<VideoDomSize>
}
export const useRoot: UseRoot = (
  watch,
  onMounted,
  videoRef,
  canvasRef,
  canvasAngleRef,
  flameRef
) => {
  // TODO: 引数で受け取る
  const debug = true

  const { createStream } = useVideo(videoRef)
  const { state: landmarkState, update: updateLandmark } = useLandmark()
  const { state: headposeState, update: updateHeadpose } = useHeadpose()
  const { state: checklistState, update: updateChecklist } = useChecklist()

  useHeadposeRoot(watch, landmarkState, updateHeadpose)

  const { pointsRef, videoDomSize, renderCountRef, detect } = useFaceDetect(
    onMounted,
    {
      videoRef,
      canvasRef,
      videoSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }
  )

  onMounted(() => {
    createStream({ width: window.innerWidth, height: window.innerHeight }).then(
      () => detect(detect, 0)
    )
  })

  if (debug) {
    watch(headposeState, (newState) =>
      draw(canvasAngleRef.value, newState.projectPoints)
    )
  }

  watch([pointsRef, renderCountRef], () => {
    updateLandmark({
      nose: formatPoint('nose', pointsRef.value.nose),
      leftEye: formatPoint('leftEye', pointsRef.value.leftEye),
      rightEye: formatPoint('rightEye', pointsRef.value.rightEye),
      jaw: formatPoint('jaw', pointsRef.value.jaw),
      leftMouth: formatPoint('leftMouth', pointsRef.value.leftMouth),
      rightMouth: formatPoint('rightMouth', pointsRef.value.rightMouth),
      upperLip: formatPoint('upperLip', pointsRef.value.upperLip),
      lowerLip: formatPoint('lowerLip', pointsRef.value.lowerLip),
      leftOutline: formatPoint('leftOutline', pointsRef.value.leftOutline),
      rightOutline: formatPoint('rightOutline', pointsRef.value.rightOutline),
    })
  })

  watch(headposeState, (newHeadposeState) => {
    if (videoRef.value && flameRef.value) {
      updateChecklist(
        videoRef.value,
        newHeadposeState.eulerAngles,
        landmarkState.value.points,
        flameRef.value.getBoundingClientRect()
      )
    }
  })

  return {
    landmarkState,
    checklistState,
    videoDomSize,
  }
}
