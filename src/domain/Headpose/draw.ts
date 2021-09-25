import { HeadPose } from '.'

/**
 * 顔の向きを描画する
 *
 * @param canvas canvas 要素
 */
type DrawHeadPose = (
  canvas: HTMLCanvasElement | undefined,
  headPose: HeadPose | undefined
) => void

export const drawHeadPose: DrawHeadPose = (canvas, headPose) => {
  const context = canvas?.getContext('2d')
  const projectPoints = headPose?.projectPoints

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
