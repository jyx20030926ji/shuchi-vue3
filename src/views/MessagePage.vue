<template>
    <div class="message-list">
      <el-list>
        <!-- 循环好友请求 -->
        <el-list-item v-for="request in friends" :key="request.id" class="message-item">
          <template #default>
            <!-- 显示头像和消息 -->
            <div class="user-info">
              <img :src="request.avatarUrl" alt="头像" class="user-avatar" />
              <div class="message-content">
                <div>用户 {{ request.name }} 向您发送了好友请求</div>
                <div class="action-buttons">
                  <el-button
                    @click="acceptRequest(request.id)"
                    size="mini"
                    type="primary"
                    class="accept-btn"
                  >
                    接受
                  </el-button>
                  <el-button
                    @click="rejectRequest(request.id)"
                    size="mini"
                    type="danger"
                    class="reject-btn"
                  >
                    拒绝
                  </el-button>
                </div>
              </div>
            </div>
          </template>
        </el-list-item>
      </el-list>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { ElNotification } from 'element-plus'; // 用于显示通知
  import { getRequestFriends, addFriend } from '../api/friendApi'; // 假定你已有这些 API
  
  // 存储好友请求数据
  const friends = ref([]);
  
  // 挂载时获取好友请求列表
  const fetchFriends = async () => {
    try {
      const response = await getRequestFriends();
      friends.value = response; // 假设 API 返回数据格式正确
      console.log(friends.value);
    } catch (error) {
      console.error('获取好友请求失败:', error);
    }
  };
  
  // 接受好友请求
  const acceptRequest = async (requestId) => {
    try {
      const response = await addFriend(requestId, 2); // 2 = 接受请求
      if (response.data.code === 1) {
        ElNotification({
          title: '好友请求',
          message: '您已接受好友请求！',
          type: 'success',
        });
        fetchFriends(); // 刷新好友请求列表
      }
    } catch (error) {
      console.error('接受好友请求失败:', error);
    }
  };
  
  // 拒绝好友请求
  const rejectRequest = async (requestId) => {
    try {
      const response = await addFriend(requestId, 3); // 3 = 拒绝请求
      if (response.data.code === 1) {
        ElNotification({
          title: '好友请求',
          message: '您已拒绝好友请求。',
          type: 'warning',
        });
        fetchFriends(); // 刷新好友请求列表
      }
    } catch (error) {
      console.error('拒绝好友请求失败:', error);
    }
  };
  
  // 挂载时调用获取好友请求函数
  onMounted(fetchFriends);
  </script>
  
  <style scoped>
  .message-list {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  
  .message-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .message-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
  }
  
  .action-buttons {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
  
  .accept-btn {
    background-color: #409eff;
    color: white;
  }
  
  .reject-btn {
    background-color: #f56c6c;
    color: white;
  }
  </style>
  