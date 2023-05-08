<script setup lang="ts">
import { ref } from 'vue'
import vusec from '../../src/index'
import Dialog from './components/Dialog.vue'
const useDialog = vusec(Dialog, { replacement: false, transition: { name: 'bounce' } })

const appendToRef = ref<HTMLElement>()
const diaRef = ref<InstanceType<typeof Dialog>>()
const { toggle, hide } = useDialog({
  ref: diaRef,
  title: 'title',
  onConfirm: () => hide(),
  onCancel: () => hide(),
}, () => 'body content', { appendTo: appendToRef, appendPosition: 'beforebegin' })
</script>

<template>
  <div>
    <button @click="toggle">
      toggle
    </button>
    <div ref="appendToRef" data-xxx />
  </div>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
