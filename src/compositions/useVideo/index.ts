import { Ref } from '@nuxtjs/composition-api'
import useMediaStream, { AddStream, ClearAllStream } from '../useMediaStream'
import {
  isMediaStream,
  clean,
  getVideoDevices,
  getVideoStream,
  confirmPermission,
} from '@/domain/MediaStream'

type VideoRef = Ref<HTMLVideoElement | null>

/**
 * stream を作成する関数
 *
 * @param videoRef video 要素
 * @returns Promise
 */
type CreateStream = (
  videoRef: VideoRef,
  addStream: ReturnType<AddStream>
) => (size?: { width: number; height: number }) => Promise<void>

const createStream: CreateStream = (videoRef, addStream) => async (size) => {
  // アクセス権を確認するために仮のカメラを取得し、破棄する
  const streamForConfirm = await confirmPermission()
  clean(streamForConfirm)
  // アクセス権が確認出来たとき、正式なカメラを取得する
  const devices = await getVideoDevices()
  const stream = await getVideoStream(devices[0].deviceId, size)
  addStream(stream)
  if (videoRef.value && isMediaStream(stream)) {
    videoRef.value.srcObject = stream
  }
}

/**
 * stream を停止する関数
 *
 * @param videoRef video 要素
 * @returns void
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
 *
 * @param videoRef video 要素
 */
type UseVideo = (videoRef: VideoRef) => {
  createStream: ReturnType<CreateStream>
  stopStream: ReturnType<StopStream>
}

export const useVideo: UseVideo = (videoRef) => {
  const { addStream, clearAllStream } = useMediaStream()

  return {
    createStream: createStream(videoRef, addStream),
    stopStream: stopStream(videoRef, clearAllStream),
  }
}
