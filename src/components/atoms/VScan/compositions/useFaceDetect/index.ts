import {
  watch as Watch,
  onMounted as OnMounted,
  ComputedRef,
  computed,
  Ref,
  ref,
} from '@nuxtjs/composition-api'
import { useResizeObserver } from '@vueuse/core'
import * as faceapi from 'face-api.js'
import debounce from 'lodash/debounce'

import usePoints from '../usePoints'
import useChecklist from '../useChecklist'
import useVideo from '@/compositions/useVideo'

import { isMediaStream } from '@/domain/MediaStream'
import { isModelLoaded, mightLoadNets } from '@/domain/FaceDetect'
import { drawHeadPose } from '@/domain/HeadPose/draw'
import { drawLandmark } from '@/domain/Landmark/draw'
import { drawImageFromVideo } from '@/domain/Canvas'
import { Rect } from '@/domain/Web'

type Size = {
  width: number
  height: number
}

// 何回に一度描画するか
const RENDER_THROTTLE = 5

/**
 * 顔を検出する
 */
type Detect = (callback: Detect, renderThrottleCount: number) => Promise<void>
type DetectFactory = (
  videoRef: Ref<HTMLVideoElement | undefined>,
  videoStreamSizeRef: Ref<Size>,
  renderCountRef: Ref<number>,
  updatePoints: ReturnType<typeof usePoints>['updatePoints']
) => Detect

const detectFactory: DetectFactory =
  (videoRef, videoStreamSizeRef, renderCountRef, updatePoints) =>
  async (callback, renderThrottleCount) => {
    const video = videoRef.value
    const stream = video?.srcObject

    if (!video) {
      // eslint-disable-next-line no-console
      return console.log('video is null')
    }

    if (!isMediaStream(stream)) {
      // eslint-disable-next-line no-console
      return console.log('not exist video stream')
    }

    // skip anime in 4/5
    const nextRenderCount = (renderThrottleCount + 1) % RENDER_THROTTLE
    requestAnimationFrame(() => callback(callback, nextRenderCount))
    if (renderThrottleCount !== 0) {
      renderCountRef.value = nextRenderCount
      return
    }

    if (!isModelLoaded()) {
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoStreamSizeRef.value.width
    canvas.height = videoStreamSizeRef.value.height
    drawImageFromVideo(canvas, video)

    //  get facedata from webcam
    const useTinyModel = true
    const detection = await faceapi
      .detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
        })
      )
      .withFaceLandmarks(useTinyModel)

    if (!detection) {
      updatePoints()
      return
    }

    // resize facedata
    const resizedDetection = faceapi.resizeResults(
      detection,
      videoStreamSizeRef.value
    )

    // update points
    updatePoints(resizedDetection.landmarks)
  }

/**
 * composition 関数
 */
type UseFaceDetect = (
  watch: typeof Watch,
  onMounted: typeof OnMounted,
  videoRef: Ref<HTMLVideoElement | undefined>,
  flameRef: Ref<HTMLDivElement | undefined>,
  options?: Options
) => {
  checklist: ReturnType<typeof useChecklist>
  videoDomSize: ComputedRef<Size>
}
type Options = {
  landmarkCanvasRef?: Ref<HTMLCanvasElement | undefined>
  headPoseCanvasRef?: Ref<HTMLCanvasElement | undefined>
}

const useFaceDetect: UseFaceDetect = (
  watch,
  onMounted,
  videoRef,
  flameRef,
  options
) => {
  const { createStream } = useVideo(videoRef)
  const {
    faceLandmarks68,
    landmark,
    headPose,
    updatePoints,
    updateCameraMatrix,
  } = usePoints()

  const videoStreamSizeRef = ref<Size>({ width: 0, height: 0 })
  const flameRectRef = ref<Rect>({ x: 0, y: 0, width: 0, height: 0 })
  const renderCountRef = ref(0)
  const detect = detectFactory(
    videoRef,
    videoStreamSizeRef,
    renderCountRef,
    updatePoints
  )

  // TODO: 関数に切り出す
  useResizeObserver(
    videoRef,
    debounce(([video]) => {
      const { width, height } = video.contentRect
      videoStreamSizeRef.value = { width, height }
      updateCameraMatrix(width, height)
    }, 500)
  )

  useResizeObserver(
    flameRef,
    debounce(() => {
      const flame = flameRef.value
      if (!flame) return
      const { x, y, width, height } = flame.getBoundingClientRect()
      flameRectRef.value = { x, y, width, height }
    }, 500)
  )

  onMounted(() => {
    Promise.all([mightLoadNets(), createStream()]).then(() => {
      detect(detect, 0)
    })
  })

  // ランドマークと顔の向きのオプションが有効であれば描画する
  if (options?.landmarkCanvasRef) {
    watch(faceLandmarks68, () =>
      drawLandmark(options?.landmarkCanvasRef?.value, faceLandmarks68.value)
    )
  }
  if (options?.headPoseCanvasRef) {
    watch(headPose, () =>
      drawHeadPose(options?.headPoseCanvasRef?.value, headPose.value)
    )
  }

  return {
    checklist: useChecklist(landmark, headPose, videoRef, flameRectRef),
    videoDomSize: computed(() => videoStreamSizeRef.value),
  }
}

export default useFaceDetect
