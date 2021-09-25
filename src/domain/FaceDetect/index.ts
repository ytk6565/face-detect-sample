import * as faceapi from 'face-api.js'

/**
 * モデルを読み込む
 *
 * @returns Promise
 */
type LoadNets = () => Promise<void>

export const loadNets: LoadNets = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('models/weights'),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri('models/weights'),
    ])
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
  }
}

/**
 * モデルを読み込んだか
 *
 * @returns boolean
 */
type IsModelLoaded = () => boolean

export const isModelLoaded: IsModelLoaded = () =>
  faceapi.nets.tinyFaceDetector.isLoaded &&
  faceapi.nets.faceLandmark68TinyNet.isLoaded
