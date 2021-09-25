import { Ref, ref } from '@nuxtjs/composition-api'

type StreamsRef = Ref<MediaStream[]>

/**
 * stream を追加する
 */
export type AddStream = (streamsRef: StreamsRef) => (stream: MediaStream) => void

const addStream: AddStream = (streamsRef) => (stream) => {
  streamsRef.value.push(stream)
}

/**
 * stream をリセットする
 * ※未使用
 */
export type ClearStream = (streamsRef: StreamsRef) => (streamId: string) => void

const clearStream: ClearStream = (streamsRef) => (streamId) => {
  const streamIdx = streamsRef.value.findIndex(
    (stream) => stream.id === streamId
  )
  if (streamIdx > -1) {
    streamsRef.value[streamIdx].getTracks().forEach((track) => {
      track.stop()
    })
    streamsRef.value.splice(streamIdx, 1)
  }
}

/**
 * 全ての stream をリセットする
 */
export type ClearAllStream = (streamsRef: StreamsRef) => () => void

const clearAllStream: ClearAllStream = (streamsRef) => () => {
  streamsRef.value.forEach((stream) => {
    stream.getTracks().forEach((track) => {
      track.stop()
    })
  })
  streamsRef.value = []
}

/**
 * composition 関数
 */
type UseMediaStream = () => {
  addStream: ReturnType<AddStream>
  clearStream: ReturnType<ClearStream>
  clearAllStream: ReturnType<ClearAllStream>
}

const useMediaStream: UseMediaStream = () => {
  const streams = ref<MediaStream[]>([])

  return {
    addStream: addStream(streams),
    clearStream: clearStream(streams),
    clearAllStream: clearAllStream(streams),
  }
}

export default useMediaStream
