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
</style>
