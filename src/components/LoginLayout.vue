<template>
  <div class="login-layout">
    <router-view /> <!-- 只显示登录组件的内容 -->
  </div>
</template>

<script>
export default {
  name: 'LoginLayout'
};
</script>

<style scoped>
.login-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
