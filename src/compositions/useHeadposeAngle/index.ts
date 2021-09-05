import { watch as Watch, Ref } from '@nuxtjs/composition-api'
import { State } from '~/compositions/store/useHeadpose'

type CanvasRef = Ref<HTMLCanvasElement | null>

export const useHeadposeAngle = (
  watch: typeof Watch,
  state: Ref<State>,
  canvasRef: CanvasRef
) => {
  watch(state, () => {
    const canvas = canvasRef.value
    const points = state.value.projectPoints
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
  })
}
