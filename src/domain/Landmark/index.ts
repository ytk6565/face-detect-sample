import * as faceapi from 'face-api.js'
import { KalmanFilter } from '~/libs/KalmanFilter'

/**
 * Landmark
 */
type Point = [number, number]
type Points = {
  nose?: Point
  leftEyeBrow?: Point
  rightEyeBrow?: Point
  leftEye?: Point
  rightEye?: Point
  leftMouth?: Point
  rightMouth?: Point
  upperLip?: Point
  lowerLip?: Point
  jaw?: Point
  leftOutline?: Point
  rightOutline?: Point
}
type LandmarkName = keyof Points
export type Landmark = {
  points: Points
}

/**
 * KalmanFilter
 */
type KFilter = {
  [k in LandmarkName]: KalmanFilter
}

const kFilter: KFilter = {
  nose: new KalmanFilter(),
  leftEyeBrow: new KalmanFilter(),
  rightEyeBrow: new KalmanFilter(),
  leftEye: new KalmanFilter(),
  rightEye: new KalmanFilter(),
  jaw: new KalmanFilter(),
  leftMouth: new KalmanFilter(),
  rightMouth: new KalmanFilter(),
  upperLip: new KalmanFilter(),
  lowerLip: new KalmanFilter(),
  leftOutline: new KalmanFilter(),
  rightOutline: new KalmanFilter(),
}

/**
 * ポイントをフォーマットする
 */
type FormatPoint = (
  name: LandmarkName,
  point?: faceapi.Point
) => [number, number] | undefined

const formatPointFactory: (kFilter: KFilter) => FormatPoint =
  (kFilter) => (name, point) => {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
      return undefined
    }
    const [x, y] = kFilter[name].filter([point.x, point.y])
    return [x, y]
  }

export const formatPoint = formatPointFactory(kFilter)
