<template>
  <client-only>
    <VScan />
  </client-only>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import VScan from '@/components/atoms/VScan/index.vue'

export default defineComponent({
  components: {
    VScan,
  },
})
</script>

<style lang="scss">
@use '~assets/scss/reset.scss';
</style>
