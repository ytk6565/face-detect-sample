import { watch as Watch, Ref } from '@nuxtjs/composition-api'
import { State } from '~/compositions/store/useHeadpose'

type CanvasRef = Ref<HTMLCanvasElement | null>

/**
 * canvas 顔の向きを表示する
 *
 * @param watch watch 関数
 * @param state headpose のステート
 * @param canvasRef canvas 要素
 */
type Draw = (canvasRef: CanvasRef) => (state: State) => void

export const draw: Draw = (canvasRef) => (state) => {
  const canvas = canvasRef.value
  const points = state.projectPoints
  if (!canvas || !points) {
    return
  }

  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'rgb(255, 0, 0)'
  context.moveTo(points.nose.x, points.nose.y)
  context.lineTo(points.z.x, points.z.y)
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'rgb(0, 0, 255)'
  context.moveTo(points.nose.x, points.nose.y)
  context.lineTo(points.x.x, points.x.y)
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'rgb(0, 255, 0)'
  context.moveTo(points.nose.x, points.nose.y)
  context.lineTo(points.y.x, points.y.y)
  context.stroke()
  context.closePath()
}

/**
 * composition 関数
 *
 * @param watch watch 関数
 * @param state headpose のステート
 * @param canvasRef canvas 要素
 */
type UseHeadposeAngle = (
  watch: typeof Watch,
  state: Ref<State>,
  canvasRef: CanvasRef
) => void
export const useHeadposeAngle: UseHeadposeAngle = (watch, state, canvasRef) => {
  watch(state, (newState) => draw(canvasRef)(newState))
}
