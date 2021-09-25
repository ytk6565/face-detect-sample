import { ComputedRef, computed, Ref, ref } from '@nuxtjs/composition-api'
import * as faceapi from 'face-api.js'
import { Landmark, formatPoint } from '@/domain/Landmark/index'
import { HeadPose } from '@/domain/HeadPose/index'
import { OPCV } from '@/libs/opencv/getEulerAngle'

/**
 * FaceLandmarks68
 */
type FaceLandmarks68 = faceapi.FaceLandmarks68

/**
 * 座標を更新する
 */
type UpdatePoints = (points?: FaceLandmarks68) => void
type UpdatePointsFactory = (
  pointsRef: Ref<FaceLandmarks68 | undefined>
) => UpdatePoints

const updatePointsFactory: UpdatePointsFactory = (pointsRef) => (points) => {
  pointsRef.value = points
}

/**
 * OpenCV を更新する
 */
type UpdateOpcv = (opcv: OPCV) => void
type UpdateOpcvFactory = (opcvRef: Ref<OPCV | undefined>) => UpdateOpcv

const updateOpcvFactory: UpdateOpcvFactory = (opcvRef) => (opcv) => {
  opcvRef.value = opcv
}

/**
 * OpenCV のインスタンスを作成する
 */
type CreateOpcv = (callback: CreateOpcv) => void
type CreateOpcvFactory = (
  updateOpcv: UpdateOpcv,
  hasLoadedOpenCV: HasLoadedOpenCV
) => CreateOpcv

const createOpcvFactory: CreateOpcvFactory =
  (updateOpcv, hasLoadedOpenCV) => (callback) => {
    if (!hasLoadedOpenCV()) {
      requestAnimationFrame(() => callback(callback))
      return
    }
    updateOpcv(new OPCV())
  }

/**
 * OpenCV が読み込まれているかどうか
 */
type HasLoadedOpenCV = () => boolean

const hasLoadedOpenCV: HasLoadedOpenCV = () => {
  return typeof window !== 'undefined' && !!window.cv && !!window.cv.Mat
}

/**
 * ランドマークを作成する
 */
type MakeLandmark = (
  faceLandmarks68Ref: Ref<FaceLandmarks68 | undefined>
) => Landmark

const makeLandmark: MakeLandmark = (faceLandmarks68Ref) => {
  const landmarks = faceLandmarks68Ref.value

  if (landmarks === undefined) {
    return { points: {} }
  }

  return {
    points: {
      nose: formatPoint('nose', landmarks.getNose()[3]),
      leftEye: formatPoint('leftEye', landmarks.getLeftEye()[0]),
      rightEye: formatPoint('rightEye', landmarks.getRightEye()[3]),
      leftEyeBrow: formatPoint('leftEyeBrow', landmarks.getLeftEyeBrow()[2]), // headPose 未使用
      rightEyeBrow: formatPoint('rightEyeBrow', landmarks.getRightEyeBrow()[2]), // headPose 未使用
      jaw: formatPoint('jaw', landmarks.getJawOutline()[8]),
      leftMouth: formatPoint('leftMouth', landmarks.getMouth()[0]),
      rightMouth: formatPoint('rightMouth', landmarks.getMouth()[6]),
      upperLip: formatPoint('upperLip', landmarks.getMouth()[14]), // headPose 未使用
      lowerLip: formatPoint('lowerLip', landmarks.getMouth()[18]), // headPose 未使用
      leftOutline: formatPoint('leftOutline', landmarks.getJawOutline()[0]),
      rightOutline: formatPoint('rightOutline', landmarks.getJawOutline()[16]),
    },
  }
}

/**
 * 顔の向きを作成する
 */
type MakeHeadPose = (landmarksRef: ComputedRef<Landmark>) => HeadPose
type MakeHeadPoseFactory = (opcvRef: Ref<OPCV | undefined>) => MakeHeadPose

const makeHeadPoseFactory: MakeHeadPoseFactory =
  (opcvRef) => (landmarksRef) => {
    const opcv = opcvRef.value

    if (opcv === undefined) {
      return {}
    }

    return opcv.estimateEulerAngles(landmarksRef.value.points)
  }

/**
 * composition 関数
 */
type UsePoints = () => {
  faceLandmarks68: ComputedRef<FaceLandmarks68 | undefined>
  landmark: ComputedRef<Landmark>
  headPose: ComputedRef<HeadPose>
  updatePoints: (value?: FaceLandmarks68) => void
  updateCameraMatrix: (width: number, height: number) => void
}

const usePoints: UsePoints = () => {
  const faceLandmarks68Ref = ref<FaceLandmarks68 | undefined>()
  const opcvRef = ref<OPCV | undefined>()
  const makeHeadPose = makeHeadPoseFactory(opcvRef)
  const landmark = computed(() => makeLandmark(faceLandmarks68Ref))
  const headPose = computed(() => makeHeadPose(landmark))
  const updateOpcv = updateOpcvFactory(opcvRef)
  const createOpcv = createOpcvFactory(updateOpcv, hasLoadedOpenCV)

  createOpcv(createOpcv)

  return {
    faceLandmarks68: computed(() => faceLandmarks68Ref.value),
    landmark,
    headPose,
    updatePoints: updatePointsFactory(faceLandmarks68Ref),
    updateCameraMatrix: (width, height) =>
      opcvRef.value?.updateCameraMatrix(width, height),
  }
}

export default usePoints
