<template>
  <div :class="$style.root">
    <video
      ref="video"
      :width="videoDomSize.width"
      :height="videoDomSize.height"
      :class="$style.video"
      @loadeddata="play"
    />
    <canvas
      ref="landmarkCanvas"
      :width="videoDomSize.width"
      :height="videoDomSize.height"
      :class="$style.canvas"
    />
    <canvas
      ref="headPoseCanvas"
      :width="videoDomSize.width"
      :height="videoDomSize.height"
      :class="$style.canvas"
    />
    <div ref="flame" :class="$style.flame"></div>
    <ul :class="$style.checklist">
      <li :data-active="checklist.contains">顔が枠内に収まっているか</li>
      <li :data-active="checklist.direction">顔が正面を向いているか</li>
      <li :data-active="checklist.brightness">枠内に絞った画像の平均明度</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, ref } from '@nuxtjs/composition-api'
import useFaceDetect from './compositions/useFaceDetect'

export default defineComponent({
  setup() {
    const video = ref()
    const flame = ref()
    const landmarkCanvas = ref()
    const headPoseCanvas = ref()

    const play = () => video.value.play()

    return {
      video,
      flame,
      landmarkCanvas,
      headPoseCanvas,
      play,
      ...useFaceDetect(watch, onMounted, video, flame, {
        landmarkCanvasRef: landmarkCanvas,
        headPoseCanvasRef: headPoseCanvas,
      }),
    }
  },
})
</script>

<style lang="scss" module>
.root {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.video,
.canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%) scaleX(-1);
}

.flame {
  position: absolute;
  top: 30%;
  left: 20%;
  width: 60%;
  height: 60%;
  border: 2px solid blue;
}

.checklist {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;

  & > li {
    color: #fff;
    font-weight: bold;
    height: 5vh;
    line-height: 5vh;
    background-color: red;
    padding: 0 10px;

    &[data-active='true'] {
      background-color: green;
    }
  }
}
</style>
