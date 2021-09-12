import {
  onMounted as OnMounted,
  ComputedRef,
  computed,
  Ref,
  ref,
} from '@nuxtjs/composition-api'
import * as faceapi from 'face-api.js'
import { MediaDeviceHelper } from '~/libs/media/MediaDevice'
import { isNumber, loadNets, isModelLoaded } from '~/domain/FaceDetect'

const RENDER_THROTTLE = 5

type Points = {
  nose?: faceapi.Point
  leftEye?: faceapi.Point
  rightEye?: faceapi.Point
  leftMouth?: faceapi.Point
  rightMouth?: faceapi.Point
  upperLip?: faceapi.Point
  lowerLip?: faceapi.Point
  jaw?: faceapi.Point
  leftOutline?: faceapi.Point
  rightOutline?: faceapi.Point
}

type VideoStreamSize = {
  width: number
  height: number
}
// TODO: 別の composition で管理する
export type VideoDomSize = {
  width: number
  height: number
}

type VideoRef = Ref<HTMLVideoElement | null>
type CanvasRef = Ref<HTMLCanvasElement | null>
type PointsRef = Ref<Points>
type VideoStreamSizeRef = Ref<VideoStreamSize>
type RenderCountRef = Ref<number>

type Config = {
  videoRef: VideoRef
  canvasRef: CanvasRef
  videoSize: VideoStreamSize
}

// const isLandscapeVideoStream = videoStreamSize.width >= videoStreamSize.height

/**
 * 顔診断
 *
 * @param videoRef video 要素
 * @param canvasRef canvas 要素
 * @param pointsRef ポイント
 * @param videoStreamSizeRef ビデオのサイズ
 * @param renderCountRef renderCount
 */
type Detect = (
  videoRef: VideoRef,
  canvasRef: CanvasRef,
  pointsRef: PointsRef,
  videoStreamSizeRef: VideoStreamSizeRef,
  renderCountRef: RenderCountRef
) => (
  callback: ReturnType<Detect>,
  renderThrottleCount: number
) => Promise<void>

const detect: Detect =
  (videoRef, canvasRef, pointsRef, videoStreamSizeRef, renderCountRef) =>
  async (callback, renderThrottleCount) => {
    const video = videoRef.value
    const stream = video?.srcObject
    const canvas = canvasRef.value

    if (!video || !canvas) {
      return console.log('video or canvas is null')
    }

    if (!MediaDeviceHelper.isMediaStream(stream)) {
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

    const trackSettings = stream.getTracks()[0].getSettings()
    const { width, height } = trackSettings

    const videoWidth = isNumber(width) ? width : videoStreamSizeRef.value.width
    const videoHeight = isNumber(height) ? height : videoStreamSizeRef.value.height
    if (
      videoWidth !== videoStreamSizeRef.value.width ||
      videoHeight !== videoStreamSizeRef.value.height
    ) {
      videoStreamSizeRef.value = { width: videoWidth, height: videoHeight }
    }

    //  get facedata from webcam
    const useTinyModel = true
    const detection = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
        })
      )
      .withFaceLandmarks(useTinyModel)

    if (!detection) {
      // TODO: 更新処理をまとめる
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
      pointsRef.value = {
        nose: undefined,
        leftEye: undefined,
        rightEye: undefined,
        jaw: undefined,
        leftMouth: undefined,
        rightMouth: undefined,
        upperLip: undefined,
        lowerLip: undefined,
        leftOutline: undefined,
        rightOutline: undefined,
      }
      return
    }

    // resize facedata
    const resizedDetection = faceapi.resizeResults(detection, {
      width: canvas.width,
      height: canvas.height,
    })

    // draw canvas landmarks point
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection)

    // update points
    const landmarks = resizedDetection.landmarks

    pointsRef.value = {
      nose: landmarks.getNose()[3],
      leftEye: landmarks.getLeftEye()[0],
      rightEye: landmarks.getRightEye()[3],
      jaw: landmarks.getJawOutline()[8],
      leftMouth: landmarks.getMouth()[0],
      rightMouth: landmarks.getMouth()[6],
      upperLip: landmarks.getMouth()[14],
      lowerLip: landmarks.getMouth()[18],
      leftOutline: landmarks.getJawOutline()[0],
      rightOutline: landmarks.getJawOutline()[16],
    }
  }

/**
 * video 要素のサイズを取得する
 *
 * @param config
 * @param videoRef video 要素
 * @returns
 */
type GetVideoDomSize = (config: Config, videoRef: VideoRef) => VideoDomSize

const getVideoDomSize: GetVideoDomSize = (config, videoRef) =>
  videoRef.value
    ? {
        width: videoRef.value.clientWidth,
        height: videoRef.value.clientHeight,
      }
    : config.videoSize

/**
 * composition 関数
 *
 * @param onMounted
 * @param config
 * @returns
 */
type UseFaceDetect = (
  onMounted: typeof OnMounted,
  config: Config
) => {
  pointsRef: PointsRef
  videoDomSize: ComputedRef<VideoDomSize>
  renderCountRef: RenderCountRef
  detect: ReturnType<Detect>
}

export const useFaceDetect: UseFaceDetect = (onMounted, config) => {
  const { videoRef, canvasRef } = config
  const pointsRef: PointsRef = ref({})
  const videoStreamSizeRef: VideoStreamSizeRef = ref(config.videoSize)
  const renderCountRef: RenderCountRef = ref(0)

  onMounted(async () => {
    if (!isModelLoaded()) {
      await loadNets()
    }
  })

  return {
    pointsRef,
    videoDomSize: computed(() => getVideoDomSize(config, videoRef)),
    renderCountRef,
    detect: detect(
      videoRef,
      canvasRef,
      pointsRef,
      videoStreamSizeRef,
      renderCountRef
    ),
  }
}
