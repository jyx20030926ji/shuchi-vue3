<template>
  <div class="friend-list-container">
    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索好友"
      class="friend-search"
      clearable
    ></el-input>

    <!-- 好友列表 -->
    <el-menu :default-active="selectedFriendId" class="friend-menu" @select="selectFriend">
      <el-menu-item
        v-for="friend in filteredFriends"
        :key="friend.id"
        :index="friend.id.toString()"
        class="friend-item"
      >
        <img :src="friend.avatarUrl" alt="头像" class="friend-avatar" />
        <span class="friend-name">{{ friend.name }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFriends } from '../api/friendApi';
import { useRouter } from 'vue-router';

const router = useRouter(); // 获取路由实例

const friends = ref([]);
const selectedFriendId = ref(null);
const searchQuery = ref(''); // 存储搜索的关键词

// 获取好友列表
const fetchFriends = async () => {
  try {
   
    friends.value = await getFriends(); // 获取好友数据
  } catch (error) {
    console.error('加载好友列表失败:', error);
  }
};

// 选择好友
const selectFriend = (friendId) => {
  router.push({ name: 'Chat', params: { friendId } }); // 跳转到聊天页面
};

// 过滤好友列表
const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value; // 如果没有搜索关键词，返回全部好友
  return friends.value.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.value.toLowerCase()) // 进行不区分大小写的匹配
  );
});

onMounted(fetchFriends); // 页面加载时获取好友列表
</script>
<style scoped>
.friend-list-container {
  width: 300px;
  padding: 20px;
}

.friend-search {
  margin-bottom: 15px;
}

.friend-menu {
  border: 1px solid #e4e7ed;
  border-radius: 5px;
  overflow: hidden;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.friend-name {
  font-size: 16px;
  color: #333;
}
</style>
