<template>
  <div>
    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="请输入用户名"
      @input="searchUsers"
      style="width: 200px; margin-right: 10px;"
    />
    <el-button @click="searchUsers" type="primary">搜索</el-button>

    <!-- 用户列表 -->
    <el-list>
      <el-list-item
        v-for="user in searchResults"
        :key="user.id"
        @click="handleUserClick(user)"
        class="user-item"
      >
        <template #default>
          <!-- 用户信息 -->
          <div class="user-info">
            <!-- 用户头像 -->
            <el-avatar :src="user.avatarUrl" class="user-avatar"></el-avatar>
            <!-- 用户名字 -->
            <span class="user-name">{{ user.name }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <!-- 发消息按钮 -->
            <el-button
              v-if="user.isFriend"
              @click.stop="sendMessage(user)"
              size="mini"
              type="text"
              class="send-message-btn"
            >
              发消息
            </el-button>
            <!-- 加好友按钮 -->
            <el-button
              v-else
              @click.stop="adddFriend(user)"
              size="mini"
              type="text"
              class="add-friend-btn"
            >
              加好友
            </el-button>
          </div>
        </template>
      </el-list-item>
    </el-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getFriends, addFriend, getUserList } from '../api/friendApi'; 
import { ElNotification } from 'element-plus';// 导入API接口

const searchQuery = ref(''); // 搜索框输入
const searchResults = ref([]); // 存储搜索结果


// 搜索用户
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []; // 如果没有输入，清空结果
    return;
  }

  try {
    const response = await getUserList(searchQuery.value); // 调用API获取搜索结果
    
    // 获取好友列表并标记搜索结果中的用户是否是好友
    const friends = await getFriends();
    
    searchResults.value = response.map(user => ({
      ...user,
      isFriend: friends.some(friend => friend.id === user.id), // 判断是否是好友
    }));
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

// 处理用户点击
const handleUserClick = (user) => {
  console.log('用户点击了:', user);
  // 可以在这里执行一些操作，例如打开聊天页面
};

// 发送消息
const sendMessage = async (user) => {
  console.log('发送消息给:', user.name);
  // 可以在这里发送消息请求，例如打开聊天窗口
};

// 添加好友
const adddFriend = async (user) => {
  try {
    const status = 1
    const response = await addFriend( user.id, status);
    if(response.data.code===1)
    {
      ElNotification({
        title: '请求已发送',
        message: '您已成功发送添加好友请求',
        type: 'success', // Notification type can be 'success', 'warning', 'info', or 'error'
      });
    }
  } catch (error) {
    console.error('添加好友失败:', error);
  }
};
</script>
<style scoped>
.search-input {
  margin-bottom: 20px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  font-size: 16px;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.add-friend-btn,
.send-message-btn {
  margin-top: 5px;
}
</style>