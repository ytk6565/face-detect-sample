import { Ref } from '@nuxtjs/composition-api'

// import { VideoRef } from './useVideo'

export type CanvasRef = Ref<HTMLCanvasElement | null>

/**
 * リサイズ
 *
 * @param canvas canvas 要素
 * @param dpr 解像度
 * @returns void
 */
export type SetSize = (
  canvas: CanvasRef,
  dpr: number
) => (width: number, height: number) => void

const setSize: SetSize = (canvas, dpr) => (width, height) => {
  const canvasWidth = width * dpr
  const canvasHeight = height * dpr
  const ctx = canvas.value?.getContext('2d')

  if (!canvas.value || !ctx) {
    return
  }

  canvas.value.width = canvasWidth
  canvas.value.height = canvasHeight

  ctx.scale(dpr, dpr)

  canvas.value.style.width = width + 'px'
  canvas.value.style.height = height + 'px'
}

/**
 * composition 関数
 *
 * @param canvas canvas 要素
 * @returns composition 関数
 */
type UseCanvas = (canvas: CanvasRef) => {
  setSize: ReturnType<SetSize>
}

export const useCanvas: UseCanvas = (canvas) => {
  const dpr = process.client ? window.devicePixelRatio || 1 : 1

  return {
    setSize: setSize(canvas, dpr),
  }
}

// /**
//  * canvas に video をレンダリング
//  *
//  * @param canvas canvas 要素
//  * @param dpr 解像度
//  * @returns void
//  */
// export type DrawImage = (
//   canvas: CanvasRef,
//   dpr: number
// ) => (video: VideoRef) => void

// const drawImage: DrawImage = (canvas, dpr) => (video) => {
//   const ctx = canvas.value?.getContext('2d')

//   if (!canvas.value || !ctx || !video.value) {
//     return
//   }

//   ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

//   const canvasWidth = canvas.value.width / dpr
//   const canvasHeight = canvas.value.height / dpr
//   const { videoWidth, videoHeight } = video.value
//   const videoAspect = videoHeight / videoWidth
//   const canvasAspect = canvasHeight / canvasWidth

//   // --------------------------------------------------
//   // 描画するソースの座標を指定する
//   // --------------------------------------------------

//   // 最大サイズはソースのサイズ（今回の場合は videoWidth, videoHeihgt ）
//   // デフォルトでソースの全体を指定する
//   let sx = 0
//   let sy = 0
//   let sw = videoWidth
//   let sh = videoHeight

//   // --------------------------------------------------
//   // canvas に描画する座標を指定する
//   // --------------------------------------------------

//   const dx = 0
//   const dy = 0
//   const dw = canvasWidth
//   const dh = canvasHeight

//   // --------------------------------------------------
//   // アスペクト比によって描画するソースの座標を調整する
//   // --------------------------------------------------

//   if (videoAspect < canvasAspect) {
//     // canvasHeight と videoHeight の倍率で canvasWidth を videoWidth に正規化する
//     sw = Math.round(canvasWidth * (videoHeight / canvasHeight))
//     sx = (videoWidth - sw) / 2
//   } else if (videoAspect > canvasAspect) {
//     // canvasWidth と videoWidth の倍率で canvasHeight を videoHeight に正規化する
//     sh = Math.round(canvasHeight * (videoWidth / canvasWidth))
//     sy = (videoHeight - sh) / 2
//   }

//   // --------------------------------------------------
//   // コンテキストを鏡像（反転）表示
//   // --------------------------------------------------

//   // 描画する幅分 x 方向に移動する
//   ctx.translate(dw, 0)
//   // x 方向に -1 スケールすることにより鏡像（反転）表示する
//   // （ひっくり返すイメージ）
//   ctx.scale(-1, 1)

//   // --------------------------------------------------
//   // canvas に描画する
//   // --------------------------------------------------

//   ctx.drawImage(video.value, sx, sy, sw, sh, dx, dy, dw, dh)
// }

// /**
//  * 現在のカメラの画像を canvas にレンダリングする
//  *
//  * @param video video 要素
//  * @param setSize canvas のサイズを設定する関数
//  * @param drawImage canvas にレンダリングする関数
//  * @returns void
//  */
// export type Render = (
//   video: VideoRef,
//   drawImage: ReturnType<DrawImage>,
//   setSize: ReturnType<SetSize>
// ) => (width: number, height: number) => void

// const render: Render = (video, drawImage, setSize) => (width, height) => {
//   if (video.value === null) {
//     return
//   }

//   setSize(width, height)
//   drawImage(video)
// }

// /**
//  * composition 関数
//  *
//  * @param canvas canvas 要素
//  * @param video video 要素
//  * @returns composition 関数
//  */
// type UseCanvas = (
//   canvas: CanvasRef,
//   video: VideoRef
// ) => {
//   render: ReturnType<Render>
// }

// export const useCanvas: UseCanvas = (canvas, video) => {
//   const dpr = process.client ? window.devicePixelRatio || 1 : 1

//   return {
//     render: render(video, drawImage(canvas, dpr), setSize(canvas, dpr)),
//   }
// }
