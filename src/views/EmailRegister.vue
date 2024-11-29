<template>
  <div class="register-container">
    <!-- Logo区域 -->
    <div class="logo-container">
      <div class="logo-text">书池</div>
    </div>

    <!-- 注册表单 -->
    <div class="register-form">
      <div class="form-title">注册您的账户</div>

      <!-- 邮箱输入 -->
      <div class="input-group">
        <label for="email">邮箱</label>
        <input
          type="email"
          id="email"
          placeholder="请输入您的邮箱"
          v-model="email"
        />
      </div>

      <!-- 验证码输入 -->
      <div class="input-group">
        <label for="code">验证码</label>
        <div class="code-input">
          <input
            type="text"
            id="code"
            placeholder="请输入验证码"
            v-model="verificationCode"
          />
          <button
            class="send-code-btn"
            :disabled="isCaptchaDisabled"
            @click="sendVerificationCode"
          >
            {{ isCaptchaDisabled ? `${countdown}秒后重试` : '发送验证码' }}
          </button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <!-- 下一步按钮 -->
      <button class="register-btn" @click="verifyCode">下一步</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const email = ref('');
const verificationCode = ref('');
const errorMessage = ref('');
const isCaptchaDisabled = ref(false);
const countdown = ref(60);
const router = useRouter();
let timer = null;

// 发送验证码
const sendVerificationCode = async () => {
  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
    errorMessage.value = '请输入有效的邮箱';
    return;
  }

  try {
    const response = await axios.get('http://localhost:8080/admin/mails', {
      params: { mailTo: email.value },
    });

    if (response.data.code === 1) {
      ElMessage.success('验证码已发送，请查收');
      isCaptchaDisabled.value = true;
      countdown.value = 60;
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(timer);
          isCaptchaDisabled.value = false;
        }
      }, 1000);
      errorMessage.value = '';
    } else {
      errorMessage.value = `发送失败：${response.data.msg}`;
    }
  } catch (error) {
    errorMessage.value = '发送验证码失败，请检查网络连接';
  }
};

// 验证验证码
const verifyCode = async () => {
  if (!verificationCode.value) {
    errorMessage.value = '请输入验证码';
    return;
  }

  try {
    const response = await axios.get(
      'http://localhost:8080/user/users/emailregister',
      { params: { email: email.value, code: verificationCode.value } }
    );

    if (response.data.code === 1) {
      ElMessage.success('验证成功');
      router.push({ name: 'RegisterDetails', params: { email: email.value } });
    } else {
      errorMessage.value = `验证失败：${response.data.msg}`;
    }
  } catch (error) {
    errorMessage.value = '验证失败，请检查网络连接';
  }
};
</script>

<style scoped>
/* 样式同前面的代码 */
</style>

<style scoped>
/* 容器样式 */
.register-container {
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

/* 注册表单样式 */
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

/* 验证码输入区样式 */
.code-input {
  display: flex;
  align-items: center;
}

.code-input input {
  flex: 1;
}

.send-code-btn {
  margin-left: 10px;
  padding: 10px;
  background-color: #ffd700;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-code-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.send-code-btn:hover {
  background-color: #e6b800;
}

/* 注册按钮样式 */
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

/* 错误信息样式 */
.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}
</style>
