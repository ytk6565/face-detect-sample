// const SCAN_CANVAS_MIME = 'image/jpeg'
// const CANVAS_QUOLITY = 0.95

// /**
//  * 画像を縮小する
//  *
//  * @param original 元の canvas 要素
//  * @param shrunk 縮小された canvas 要素
//  * @returns void
//  */
// type ShrinkImage = (
//   original: CanvasRef,
//   shrunk: HTMLCanvasElement
// ) => (x: number, y: number, width: number, height: number) => void

// const shrinkImage: ShrinkImage =
//   (original, shrunk) => (x, y, width, height) => {
//     const ctx = shrunk?.getContext('2d')

//     if (!ctx || original.value === null || shrunk === null) {
//       alert('Error!')
//       return
//     }

//     let cw = width
//     let ch = height
//     const longSide = Math.max(cw, ch)

//     // 画像を長辺256pxまで縮小
//     if (longSide > 256) {
//       cw = Math.round((cw / longSide) * 256)
//       ch = Math.round((ch / longSide) * 256)
//     }

//     shrunk.width = cw
//     shrunk.height = ch

//     ctx.drawImage(original.value, x, y, width, height, 0, 0, cw, ch)
//   }



// if (detection === undefined || detection.score < 0.8) {
  //   // TODO: しっかり認識されていない場合の処理
  //   return
  // }

  // const { width, height } = detection.box
  // const { width: vw, height: vh } = canvas.value

  // if (vw / 2 > width && vh / 2 > height) {
  //   // TODO: 画像が小さい場合の処理
  //   return
  // }

  // const shrunk = document.createElement('canvas')
  // const ctx = shrunk.getContext('2d')

  // if (!ctx) {
  //   // TODO: canvas が作成できない場合の処理
  //   return
  // }

  // shrinkImage(canvas, shrunk)

  // if (type === 'base64') {
  //   emit("submit", shrunk.toDataURL(SCAN_CANVAS_MIME, CANVAS_QUOLITY))
  // } else {
  //   shrunk.toBlob(
  //     (blob) =>
  //       blob
  //         ? emit("submit", blob)
  //         : emit("error"),
  //     SCAN_CANVAS_MIME,
  //     CANVAS_QUOLITY
  //   )
  // }
