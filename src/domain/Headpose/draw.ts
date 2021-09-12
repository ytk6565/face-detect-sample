import { ProjectPoints } from '../Headpose'

/**
 * 顔の向きを表示する
 *
 * @param canvas canvas 要素
 */
type Draw = (
  canvas: HTMLCanvasElement | null,
  projectPoints: ProjectPoints | undefined
) => void

export const draw: Draw = (canvas, projectPoints) => {
  const context = canvas?.getContext('2d')

  if (!canvas || !context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (!projectPoints) {
    return
  }

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'rgb(255, 0, 0)'
  context.moveTo(projectPoints.nose.x, projectPoints.nose.y)
  context.lineTo(projectPoints.z.x, projectPoints.z.y)
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'rgb(0, 0, 255)'
  context.moveTo(projectPoints.nose.x, projectPoints.nose.y)
  context.lineTo(projectPoints.x.x, projectPoints.x.y)
  context.stroke()
  context.closePath()

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = 'rgb(0, 255, 0)'
  context.moveTo(projectPoints.nose.x, projectPoints.nose.y)
  context.lineTo(projectPoints.y.x, projectPoints.y.y)
  context.stroke()
  context.closePath()
}
