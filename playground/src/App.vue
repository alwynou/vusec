<script setup lang="ts">
import { ref } from 'vue'
import Cc from './CC.vue'
const show = ref(true)
</script>

<template>
  <div>
    <template v-if="show">
      <Cc />
    </template>
    <br>
    <button @click="show = !show">
      toggle show
    </button>
  </div>
</template>
