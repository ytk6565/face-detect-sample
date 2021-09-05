import { Ref } from '@nuxtjs/composition-api'
import { MediaDeviceHelper } from '~/libs/media/MediaDevice'

type VideoRef = Ref<HTMLVideoElement | null>

const MDHelper = new MediaDeviceHelper()

MDHelper.clearAllStream()

/**
 * stream を作成する関数
 *
 * @param videoRef video 要素
 * @returns Promise
 */
type CreateStream = (videoRef: VideoRef) => () => Promise<void>

const createStream: CreateStream = (videoRef) => async () => {
  await MDHelper.confirmPermission()
  const devices = await MDHelper.getVideoDevices()
  const stream = await MDHelper.getVideoStream(devices[0].deviceId)
  if (videoRef.value && MediaDeviceHelper.isMediaStream(stream)) {
    videoRef.value.srcObject = stream
  }
}

/**
 * stream を停止する関数
 *
 * @param videoRef video 要素
 * @returns void
 */
type StopStream = (videoRef: VideoRef) => () => void

const stopStream: StopStream = (videoRef) => () => {
  const video = videoRef.value
  if (video && MediaDeviceHelper.isMediaStream(video.srcObject)) {
    MDHelper.clearAllStream()
    video.srcObject = null
  }
}

/**
 * composition 関数
 */
type UseStream = (videoRef: VideoRef) => {
  createStream: ReturnType<CreateStream>
  stopStream: ReturnType<StopStream>
}

export const useStream: UseStream = (videoRef) => {
  return {
    createStream: createStream(videoRef),
    stopStream: stopStream(videoRef),
  }
}
