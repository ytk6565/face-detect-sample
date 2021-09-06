<template>
  <div :class="$style.root">
    <video ref="video" :class="$style.video" @loadeddata="play" />
    <canvas
      ref="canvas"
      :width="videoDomSize.width"
      :height="videoDomSize.height"
      :class="$style.canvas"
    />
    <canvas
      ref="canvasAngle"
      :width="videoDomSize.width"
      :height="videoDomSize.height"
      :class="$style.canvas"
    />
    <ul :class="$style.checklist">
      <li :data-active="checklistState.contains">
        顔が枠内に収まっているか
      </li>
      <li :data-active="checklistState.direction">
        顔が正面を向いているか
      </li>
      <li :data-active="checklistState.brightness">
        枠内に絞った画像の平均明度
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, ref } from '@nuxtjs/composition-api'
import { useRoot } from '~/compositions/useRoot'

export default defineComponent({
  setup() {
    const video = ref()
    const canvas = ref()
    const canvasAngle = ref()

    const play = () => video.value.play()

    return {
      video,
      canvas,
      canvasAngle,
      play,
      ...useRoot(watch, onMounted, video, canvas, canvasAngle),
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

.checklist {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;

  & > li {
    color: #fff;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    background-color: red;
    padding: 0 10px;

    &[data-active="true"] {
      background-color: green;
    }
  }
}
</style>
