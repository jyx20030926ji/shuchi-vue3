<template>
  <div class="chat-container">
    <!-- 消息区域 -->
    <div class="message-box">
      <!-- 渲染所有消息 -->
      <div
        v-for="message in allMessages"
        :key="message.id"
        class="message-item"
        :class="{ 'self-message': message.isSelf, 'receiver-message': !message.isSelf }"
      >
        <!-- 消息头像 -->
        <img
          :src="message.isSelf ? currentUser.avatarUrl : friend.avatarUrl"
          alt="头像"
          class="avatar"
        />
        <!-- 消息内容 -->
        <div class="message-content">
          <div>
            {{ message.content }}
          </div>
          <!-- 已读/未读状态 -->
          <div v-if="message.isSelf" class="message-status">
            {{ message.isReadMessage === 1 ? '已读' : '未读' }}
          </div>
          <!-- 消息时间 -->
          <div class="message-time">{{ formatTime(message.createTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <div class="input-area">
      <el-row>
        <el-col :span="20">
          <el-input
            v-model="messageInput"
            placeholder="请输入消息"
            class="message-input"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" class="send-btn" @click="sendMessageToFriend">发送</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getMessages, sendMessage,markMessagesAsRead } from '../api/messageApi'; // 添加标记已读的 API
import { getUserInfo, getFriendInfo } from '../api/userApi';
import { useRoute } from 'vue-router';

const route = useRoute();
const allMessages = ref([]); // 合并后的所有消息列表
const messageInput = ref(''); // 新消息输入框内容
const friendId = ref(''); // 当前好友的 ID
const currentUser = ref({}); // 当前用户信息（包括头像）
const friend = ref({}); // 好友信息（包括头像）

// 定时器
let messageTimer = null;

// 时间格式化函数
const formatTime = (time) => {
  const date = new Date(time);
  const options = { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' };
  return date.toLocaleString('zh-CN', options);
};

// 获取消息并排序
const fetchMessages = async () => {
  const friendIdParam = route.params.friendId; // 从路由参数获取好友 ID
  if (!friendIdParam) return;

  try {
    const response = await getMessages(friendIdParam);

    // 合并发送和接收的消息，并按照时间排序
    allMessages.value = [...response.senderToMessage, ...response.receiverToMessage]
      .map((message) => ({
        ...message,
        isSelf: message.senderId === currentUser.value.id, // 判断消息是否是当前用户发送
      }))
      .sort((a, b) => new Date(a.createTime) - new Date(b.createTime));
       // 按时间升序排序
    
    // 标记未读消息为已读
    const unreadMessageIds = response.receiverToMessage
      .filter((msg) => msg.isReadMessage === 0) // 过滤未读消息
      .map((msg) => msg.id);
         
    if (unreadMessageIds.length > 0) {
       
      await markMessagesAsRead(unreadMessageIds); // 调用标记已读的 API
    }
  } catch (error) {
    console.error('加载消息失败:', error);
  }
};

// 发送新消息给好友
const sendMessageToFriend = async () => {
  if (!messageInput.value.trim()) return; // 如果消息为空，不发送

  const receiverId = friendId.value;
  if (!receiverId) return; // 确保好友 ID 是有效的

  try {
    // 通过 API 发送消息
    await sendMessage({
      receiverId,
      content: messageInput.value,
    });

    // 重新加载消息记录
    await fetchMessages();
    messageInput.value = ''; // 清空输入框
  } catch (error) {
    console.error('发送消息失败:', error);
  }
};

// 获取当前用户和好友的信息
const fetchUserAndFriendInfo = async () => {
  try {
    // 获取当前用户的信息
    currentUser.value = await getUserInfo();

    // 获取好友的信息
    const friendIdParam = route.params.friendId;
    if (friendIdParam) {
      friend.value = await getFriendInfo(friendIdParam);
      friendId.value = friendIdParam;
    }

    // 获取消息
    await fetchMessages();
  } catch (error) {
    console.error('获取用户或好友信息失败:', error);
  }
};

// 监听路由参数变化（例如好友 ID）
watch(
  () => route.params.friendId,
  async (newFriendId) => {
    friendId.value = newFriendId;
    await fetchUserAndFriendInfo();
  }
);

// 在组件挂载时获取用户和好友信息，设置定时器
onMounted(() => {
  fetchUserAndFriendInfo();

  // 设置定时器，每5秒钟调用一次 fetchMessages
  messageTimer = setInterval(fetchMessages, 5000);
});

// 在组件卸载时清除定时器
onUnmounted(() => {
  if (messageTimer) {
    clearInterval(messageTimer);
  }
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.message-box {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.message-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.message-item.self-message {
  justify-content: flex-end; /* 当前用户的消息靠右 */
}

.message-item.receiver-message {
  justify-content: flex-start; /* 好友的消息靠左 */
}

.message-content {
  padding: 10px;
  border-radius: 5px;
  background-color: #ffffff;
  max-width: 60%;
  position: relative;
}

.message-item.self-message .message-content {
  background-color: #d1ecf1; /* 当前用户消息的背景色 */
}

.message-item.receiver-message .message-content {
  background-color: #e9ecef; /* 好友消息的背景色 */
}

.message-status {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.message-time {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
  text-align: right;
}

.input-area {
  padding: 10px;
  background-color: #ffffff;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
