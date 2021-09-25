/**
 * MediaStream かどうか
 */
export const isMediaStream = (data: unknown): data is MediaStream => {
  return data instanceof MediaStream
}

/**
 * stream を停止する
 */
type Clean = (stream: MediaStream) => void

export const clean: Clean = (stream) => {
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

/**
 * video の stream を取得する
 */
type GetVideoStream = (deviceId: string) => Promise<MediaStream>

export const getVideoStream: GetVideoStream = async (deviceId) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      deviceId,
    },
  })
  return stream
}

/**
 * video のデバイスを取得する
 */
type GetVideoDevices = () => Promise<MediaDeviceInfo[]>

export const getVideoDevices: GetVideoDevices = async () => {
  const mediaDevices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = mediaDevices.filter(
    (device) => device.kind === 'videoinput'
  )
  return videoDevices
}

/**
 * stream を操作する権限を確認する
 */
type ConfirmPermission = () => Promise<MediaStream>

export const confirmPermission: ConfirmPermission = async () => {
  return await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  })
}
