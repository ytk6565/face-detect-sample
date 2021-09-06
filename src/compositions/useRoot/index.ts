import {
  watch as Watch,
  onMounted as OnMounted,
  ComputedRef,
  Ref,
} from '@nuxtjs/composition-api'
import * as faceapi from 'face-api.js'
import { useFaceDetect, VideoDomSize } from '~/compositions/useFaceDetect'
import { useStream } from '~/compositions/useStream'
import {
  useLandmark,
  State as LandmarkState,
} from '~/compositions/store/useLandmark'
import { useHeadpose } from '~/compositions/store/useHeadpose'
import { useHeadposeAngle } from '~/compositions/useHeadposeAngle'
import { useHeadposeRoot } from '~/compositions/useHeadposeRoot'
import {
  useChecklist,
  State as ChecklistState,
} from '~/compositions/store/useChecklist'
import { KalmanFilter } from '~/libs/KalmanFilter'

type LandmarkName =
  | 'nose'
  | 'leftEye'
  | 'rightEye'
  | 'jaw'
  | 'leftMouth'
  | 'rightMouth'
  | 'upperLip'
  | 'lowerLip'
  | 'leftOutline'
  | 'rightOutline'

const kfilter = {
  nose: new KalmanFilter(),
  leftEye: new KalmanFilter(),
  rightEye: new KalmanFilter(),
  jaw: new KalmanFilter(),
  leftMouth: new KalmanFilter(),
  rightMouth: new KalmanFilter(),
  upperLip: new KalmanFilter(),
  lowerLip: new KalmanFilter(),
  leftOutline: new KalmanFilter(),
  rightOutline: new KalmanFilter(),
}

function formatPoint(
  name: LandmarkName,
  point?: faceapi.Point
): [number, number] | undefined {
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
    return undefined
  }
  const [x, y] = kfilter[name].filter([point.x, point.y])
  return [x, y]
}

/**
 * composition 関数
 *
 * @param videoRef video 要素
 * @param canvasRef canvas 要素
 * @param canvasAngleRef canvas 要素
 */
type UseRoot = (
  watch: typeof Watch,
  onMounted: typeof OnMounted,
  videoRef: Ref<HTMLVideoElement | null>,
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasAngleRef: Ref<HTMLCanvasElement | null>
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
  canvasAngleRef
) => {
  const { createStream } = useStream(videoRef)
  const { state: landmarkState, update: updateLandmark } = useLandmark()
  const { state: headposeState, update: updateHeadpose } = useHeadpose()
  const { state: checklistState, update: updateChecklist } = useChecklist()
  useHeadposeAngle(watch, headposeState, canvasAngleRef)
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
    createStream().then(() => detect(detect, 0))
  })

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
    if (videoRef.value && newHeadposeState.eulerAngles) {
      updateChecklist(videoRef.value, newHeadposeState.eulerAngles)
    }
  })

  return {
    landmarkState,
    checklistState,
    videoDomSize,
  }
}
