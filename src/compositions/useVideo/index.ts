import { Ref } from '@nuxtjs/composition-api'
import useMediaStream, {
  AddStream,
  ClearAllStream,
} from '@/compositions/useMediaStream'
import {
  isMediaStream,
  clean,
  getVideoDevices,
  getVideoStream,
  confirmPermission,
} from '@/domain/MediaStream'

type VideoRef = Ref<HTMLVideoElement | undefined>

/**
 * stream を更新する
 */
type UpdateStream = (stream: MediaStream) => void
type UpdateStreamFactory = (videoRef: VideoRef) => UpdateStream

const updateStreamFactory: UpdateStreamFactory = (videoRef) => (stream) => {
  if (videoRef.value && isMediaStream(stream)) {
    videoRef.value.srcObject = stream
  }
}

/**
 * stream を作成する
 */
type CreateStream = (
  updateStream: UpdateStream,
  addStream: ReturnType<AddStream>
) => () => Promise<void>

const createStream: CreateStream =
  (updateStream, addStream) => async () => {
    // アクセス権を確認するために仮のカメラを取得し、破棄する
    const streamForConfirm = await confirmPermission()
    clean(streamForConfirm)
    // アクセス権が確認出来たとき、正式なカメラを取得する
    const devices = await getVideoDevices()
    const deviceId = devices[0].deviceId
    const stream = await getVideoStream(deviceId)
    addStream(stream)
    updateStream(stream)
  }

/**
 * stream を停止する
 */
type StopStream = (
  videoRef: VideoRef,
  clearAllStream: ReturnType<ClearAllStream>
) => () => void

const stopStream: StopStream = (videoRef, clearAllStream) => () => {
  const video = videoRef.value
  if (video && isMediaStream(video.srcObject)) {
    clearAllStream()
    video.srcObject = null
  }
}

/**
 * composition 関数
 */
type UseVideo = (videoRef: VideoRef) => {
  createStream: ReturnType<CreateStream>
  stopStream: ReturnType<StopStream>
}

const useVideo: UseVideo = (videoRef) => {
  const { addStream, clearAllStream } = useMediaStream()
  const updateStream = updateStreamFactory(videoRef)

  return {
    createStream: createStream(updateStream, addStream),
    stopStream: stopStream(videoRef, clearAllStream),
  }
}

export default useVideo
