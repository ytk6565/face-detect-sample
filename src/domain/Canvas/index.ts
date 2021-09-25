export const drawImageFromVideo = (
  canvas: HTMLCanvasElement | undefined,
  video: HTMLVideoElement | undefined
) => {
  const context = canvas?.getContext('2d')
  if (!canvas || !video || !context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const { videoWidth, videoHeight } = video
  const videoAspect = videoHeight / videoWidth
  const canvasAspect = canvasHeight / canvasWidth

  // --------------------------------------------------
  // 描画するソースの座標を指定する
  // --------------------------------------------------

  let sx = 0
  let sy = 0
  let sw = videoWidth
  let sh = videoHeight

  // --------------------------------------------------
  // canvas に描画する座標を指定する
  // --------------------------------------------------

  const dx = 0
  const dy = 0
  const dw = canvasWidth
  const dh = canvasHeight

  // --------------------------------------------------
  // アスペクト比によって描画するソースの座標を調整する
  // --------------------------------------------------

  if (videoAspect < canvasAspect) {
    // canvasHeight と videoHeight の倍率で canvasWidth を videoWidth に正規化する
    sw = Math.round(canvasWidth * (videoHeight / canvasHeight))
    sx = (videoWidth - sw) / 2
  } else if (videoAspect > canvasAspect) {
    // canvasWidth と videoWidth の倍率で canvasHeight を videoHeight に正規化する
    sh = Math.round(canvasHeight * (videoWidth / canvasWidth))
    sy = (videoHeight - sh) / 2
  }

  // --------------------------------------------------
  // canvas に描画する
  // --------------------------------------------------

  context.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh)
}
