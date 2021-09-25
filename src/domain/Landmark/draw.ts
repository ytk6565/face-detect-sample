import * as faceapi from 'face-api.js'

/**
 * 顔の向きを表示する
 *
 * @param canvas canvas 要素
 */
type DrawLandmark = (
  canvas: HTMLCanvasElement | undefined,
  faceLandmarks68?: faceapi.FaceLandmarks68
) => void

export const drawLandmark: DrawLandmark = (canvas, faceLandmarks68) => {
  if (canvas === undefined) {
    return
  }

  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)

  if (faceLandmarks68 === undefined) {
    return
  }

  // draw canvas landmarks point
  faceapi.draw.drawFaceLandmarks(canvas, faceLandmarks68)
}
