<template>
    <div class="register-container">
      <!-- Logo区域 -->
      <div class="logo-container">
        <div class="logo-text">书池</div>
      </div>
  
      <!-- 注册表单 -->
      <div class="register-form">
        <div class="form-title">注册您的账户</div>
  
        <!-- 账号输入 -->
        <div class="input-group">
          <label for="account">账号</label>
          <input
            type="text"
            id="account"
            v-model="account"
            placeholder="请输入您的账号"
          />
        </div>
  
        <!-- 密码输入 -->
        <div class="input-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="请输入密码"
          />
        </div>
  
        <!-- 确认密码输入 -->
        <div class="input-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="请确认密码"
          />
        </div>
  
        <!-- 错误或成功提示 -->
        <div v-if="message" :class="messageType" class="message">{{ message }}</div>
  
        <!-- 注册按钮 -->
        <button class="register-btn" @click="registerAccount">注册</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { register } from '../api/userApi'; // 导入register API
  
  const account = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const message = ref('');
  const messageType = ref(''); // 用于控制消息类型的样式 (成功/失败)
  const router = useRouter();
  const props = defineProps({
  email: {
    type: String,
    required: true
  }
});
  
  // 注册功能
  const registerAccount = async () => {
    if (!account.value || !password.value || !confirmPassword.value) {
      message.value = '请填写所有字段';
      messageType.value = 'error';
      return;
    }
  
    if (password.value !== confirmPassword.value) {
      message.value = '密码和确认密码不一致';
      messageType.value = 'error';
      return;
    }
  
    try {
      // 调用注册 API
      const response = await register(account.value, password.value,props.email);
      if (response.code === 1) {
        // 注册成功
        message.value = '注册成功，跳转到登录页面';
        messageType.value = 'success';
        setTimeout(() => {
          router.push('/login');  // 跳转到登录页面
        }, 2000); // 2秒后跳转
      } else {
        // 注册失败
        message.value = response.msg || '注册失败，请稍后再试';
        messageType.value = 'error';
      }
    } catch (error) {
      // 捕获错误并提示用户
      message.value = '注册失败，请稍后再试';
      messageType.value = 'error';
      console.error('注册失败', error);
    }
  };
  </script>
  
  <style scoped>
  /* 样式与登录页面一致 */
  
  .register-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('src/assets/111.jpg'); /* 背景图与登录页一致 */
    background-size: cover;
    background-position: center;
    padding: 20px;
    flex-direction: column;
  }
  
  .logo-container {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .logo-text {
    font-family: 'Poppins', sans-serif;
    font-size: 50px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .register-form {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }
  
  .form-title {
    font-size: 22px;
    margin-bottom: 20px;
    color: #333;
  }
  
  .input-group {
    margin-bottom: 15px;
    text-align: left;
  }
  
  .input-group label {
    font-size: 14px;
    color: #333;
  }
  
  .input-group input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 5px;
  }
  
  .register-btn {
    width: 100%;
    padding: 12px;
    background-color: #ffd700;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .register-btn:hover {
    background-color: #e6b800;
  }
  
  /* 提示信息样式 */
  .message {
    margin-top: 10px;
    padding: 10px;
    font-size: 14px;
    border-radius: 4px;
  }
  
  .error {
    color: red;
    background-color: #ffdddd;
  }
  
  .success {
    color: green;
    background-color: #ddffdd;
  }
  </style>
  