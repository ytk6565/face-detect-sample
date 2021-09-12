import * as faceapi from 'face-api.js'
import { KalmanFilter } from '~/libs/KalmanFilter'

type Point = [number, number]

export type Points = {
  nose?: Point
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

type LandmarkName =
  | 'nose'
  | 'leftEye'
  | 'rightEye'
  | 'jaw'
  | 'leftMouth'
  | 'rightMouth'
  | 'upperLip'
  | 'lowerLip'
  | 'leftOutline'
  | 'rightOutline'

type KFilter = {
  [k in LandmarkName]: KalmanFilter
}

const kFilter: KFilter = {
  nose: new KalmanFilter(),
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
