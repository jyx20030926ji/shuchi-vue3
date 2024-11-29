<template>
  <div class="profile-container">
    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <el-avatar :src="user.avatarUrl" :size="100" class="user-avatar" />
          <div class="upload-overlay">
            <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/admin/users/upload"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeImageUpload"
              :headers="uploadHeaders"
            >
              <el-icon class="upload-icon"><Camera /></el-icon>
            </el-upload>
          </div>
        </div>
        <div class="user-info">
          <h2 class="username">{{ user.name }}</h2>
          <p class="user-account">账号：{{ user.account }}</p>
          <p class="user-balance">余额：¥{{ user.balance }}</p>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">性别</span>
              <span class="value">{{ user.gender || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄</span>
              <span class="value">{{ user.age || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">城市</span>
              <span class="value">{{ user.city || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">地址</span>
              <span class="value">{{ user.address || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" @click="openEditDialog">编辑资料</el-button>
          <el-button type="warning" @click="openPasswordDialog">修改密码</el-button>
        </div>
      </div>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog
      title="编辑个人资料"
      v-model="editDialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form :model="formData" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="formData.age" :min="0" :max="150" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="formData.city" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChanges">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="passwordForm"
        ref="passwordFormRef"
        label-width="100px"
        :rules="passwordRules"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserInfo, updateUserInfo, changePassword as changePasswordApi } from '../api/userApi';
import { Camera } from '@element-plus/icons-vue';

export default {
  name: 'UserProfile',
  components: {
    Camera
  },
  setup() {
    const user = ref({});
    const editDialogVisible = ref(false);
    const passwordDialogVisible = ref(false);
    const formData = ref({});
    const formRef = ref(null);
    const passwordFormRef = ref(null);

    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.value.newPassword) {
              callback(new Error('两次输入的密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ]
    };

    const uploadHeaders = computed(() => {
      return {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      };
    });

    // 获取用户信息
    const loadUserInfo = async () => {
      try {
        const data = await getUserInfo();
        user.value = data;
      } catch (error) {
        console.error('获取用户信息失败', error);
        ElMessage.error('获取用户信息失败');
      }
    };

    // 打开编辑对话框
    const openEditDialog = () => {
      formData.value = { ...user.value };
      editDialogVisible.value = true;
    };

    // 保存用户信息
    const saveChanges = async () => {
      try {
        await updateUserInfo(formData.value);
        ElMessage.success('保存成功');
        editDialogVisible.value = false;
        await loadUserInfo();
      } catch (error) {
        console.error('保存失败', error);
        ElMessage.error('保存失败');
      }
    };

    // 修改密码
    const handleChangePassword = async () => {
      try {
        await passwordFormRef.value.validate();
        const response = await changePasswordApi(
          passwordForm.value.oldPassword,
          passwordForm.value.newPassword
        );
        
        if (response.code === 1) {
          ElMessage.success('密码修改成功');
          passwordDialogVisible.value = false;
          passwordForm.value = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        } else {
          ElMessage.error(response.msg || '修改失败');
        }
      } catch (error) {
        console.error('修改密码失败', error);
        ElMessage.error('修改失败，请重试');
      }
    };

    // 处理头像上传
    const handleUploadSuccess = (response) => {
      if (response.code === 1) {
        user.value.avatarUrl = response.data;
        ElMessage.success('头像上传成功');
      } else {
        ElMessage.error(response.msg || '上传失败');
      }
    };

    // 上传前验证
    const beforeImageUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    };

    // 打开密码修改对话框
    const openPasswordDialog = () => {
      passwordDialogVisible.value = true;
      // 重置表单
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    };

    onMounted(loadUserInfo);

    return {
      user,
      formData,
      editDialogVisible,
      passwordDialogVisible,
      passwordForm,
      formRef,
      passwordFormRef,
      passwordRules,
      openEditDialog,
      openPasswordDialog,
      saveChanges,
      handleChangePassword,
      handleUploadSuccess,
      beforeImageUpload,
      uploadHeaders
    };
  }
};
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.profile-header {
  display: flex;
  gap: 24px;
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
}

.avatar-section {
  position: relative;
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-overlay:hover {
  background: rgba(0,0,0,0.8);
}

.upload-icon {
  color: white;
  font-size: 20px;
}

.user-info {
  flex: 1;
}

.username {
  margin: 0 0 8px;
  font-size: 24px;
  color: #303133;
}

.user-account {
  color: #909399;
  margin: 0 0 8px;
}

.user-balance {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.profile-content {
  padding: 24px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: #909399;
  font-size: 14px;
}

.value {
  color: #303133;
  font-size: 16px;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
