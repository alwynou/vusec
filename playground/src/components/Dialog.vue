<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

defineExpose({ aa: 'xxx' })
</script>

<template>
  <div class="wrapper">
    <div class="dialog">
      <div class="dialog-header">
        <h3 v-if="title">
          {{ title }}
        </h3>
      </div>
      <div class="dialog-body">
        <slot />
      </div>
      <div class="dialog-footer">
        <button @click="$emit('confirm')">
          确认
        </button>
        <button @click="$emit('cancel')">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.wrapper{
  position: fixed;
  display: flex;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
}
.dialog{
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 50%;
  margin-top: 10vh;
  background-color: #fff;
  color: #000;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.dialog-body{
  padding: 2rem;
}

.dialog-footer{
  display: flex;
  justify-content: flex-end;
  padding: 2rem;
}

.dialog-footer button{
  background-color: rgb(67, 67, 224);
}

.dialog-footer button + button{
  margin-left: 1rem;
}
</style>
