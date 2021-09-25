/**
 * HeadPose
 */
type EulerAngles = {
  pitch: number // x
  yaw: number // y
  roll: number // z
}
type Points = {
  x: number
  y: number
}
type ProjectPoints = {
  nose: Points
  x: Points
  y: Points
  z: Points
}
export type HeadPose = {
  eulerAngles?: EulerAngles
  projectPoints?: ProjectPoints
}
