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

/**
 * モデルを読み込んでいなければ読み込む
 */
type MightLoadNets = () => Promise<void>
type MightLoadNetsFactory = (
  loadNets: LoadNets,
  isModelLoaded: IsModelLoaded
) => MightLoadNets

const mightLoadNetsFactory: MightLoadNetsFactory =
  (loadNets, isModelLoaded) => async () => {
    if (isModelLoaded()) {
      return
    }

    await loadNets()
  }
export const mightLoadNets = mightLoadNetsFactory(loadNets, isModelLoaded)
