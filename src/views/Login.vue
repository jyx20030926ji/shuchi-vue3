<template>
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-container">
        <div class="logo-text">书池</div>
      </div>
  
      <!-- 登录表单 -->
      <div class="login-form">
        <div class="form-title">登录您的账户</div>
  
        <div class="input-group">
          <label for="username">账号</label>
          <input type="text" id="username" placeholder="请输入您的账号" v-model="account" />
        </div>
  
        <div class="input-group">
          <label for="password">密码</label>
          <input type="password" id="password" placeholder="请输入您的密码" v-model="password" />
        </div>
  
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  
        <button class="login-btn" @click="login1">登录</button>
  
        <div class="register-link">
          没有账户？  <router-link to="/register">注册</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'; // 引入 useRouter 用于页面跳转
  import { login } from '../api/userApi'; // 引入 loginApi
  
  // 定义响应式变量
  const account = ref('');
  const password = ref('');
  const errorMessage = ref(''); // 错误信息
  
  const router = useRouter(); // 初始化路由实例
  
  // 登录方法
  const login1 = async () => {
    // 基本验证
    if (!username.value || !password.value) {
      errorMessage.value = '用户名和密码不能为空';
      return;
    }

    try {
      // 调用 loginApi.js 中的 login 方法
      const response = await login(username.value, password.value);
       if(response.code!==1)
       {
        alert(response.msg);
        router.push('/login');
       }
       else{
        console.log(response.data);
        sessionStorage.setItem('token', response.data); 
     
      router.push('/books');
       }

      // 检查返回的 code 是否为 1
     
    } catch (error) {
      // 捕获错误并提示用户
      errorMessage.value = '登录失败，请稍后再试';
      console.error('登录失败', error);
    }
  };
</script>


  
  <style scoped>
  /* 容器样式 */
  .login-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('src/assets/111.jpg');
    background-size: cover;
    background-position: center;
    padding: 20px;
    flex-direction: column;
  }
  
  /* Logo样式 */
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
  
  /* 登录表单样式 */
  .login-form {
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
  
  .login-btn {
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
  
  .login-btn:hover {
    background-color: #e6b800;
  }
  
  .register-link {
    margin-top: 15px;
    font-size: 14px;
  }
  
  .register-link a {
    color: #ffd700;
    text-decoration: none;
  }
  
  .register-link a:hover {
    text-decoration: underline;
  }
  
  /* 错误信息样式 */
  .error-message {
    color: red;
    margin-top: 10px;
    font-size: 14px;
  }
  </style>
  