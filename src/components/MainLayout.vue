<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-content">
        <!-- 左侧 Logo 和导航区 -->
        <div class="header-left">
          <router-link to="/books" class="logo">
            <img src="/images/shuchi.webp" alt="Logo" class="logo-image" />
            <span class="logo-text">书池商城</span>
          </router-link>
          <nav class="main-nav">
            <router-link to="/books" class="nav-item" active-class="active">
              <el-icon><House /></el-icon>
              首页
            </router-link>
            <router-link to="/mybook" class="nav-item" active-class="active">
              <el-icon><Reading /></el-icon>
              我的图书
            </router-link>
            <router-link to="/orders" class="nav-item" active-class="active">
              <el-icon><List /></el-icon>
              我的订单
            </router-link>
            <router-link to="/friends" class="nav-item" active-class="active">
              <el-icon><UserFilled /></el-icon>
              好友
            </router-link>
          </nav>
        </div>

        <!-- 右侧用户区域 -->
        <div class="header-right">
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索图书..."
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 订单消息通知 -->
          <router-link to="/orderMessage" class="notification-link">
            <el-badge :value="unreadCount" class="notification-badge">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </router-link>

          <!-- 购物车 -->
          <router-link to="/cart" class="cart-link">
            <el-badge :value="cartQuantity" :hidden="!cartQuantity">
              <el-icon><ShoppingCart /></el-icon>
            </el-badge>
          </router-link>
          
          <!-- 用户信息 -->
          <template v-if="isLoggedIn">
            <el-dropdown class="user-dropdown" trigger="click">
              <div class="user-info">
                <img :src="avatarUrl" alt="头像" class="user-avatar"/>
                <span class="username">{{ username }}</span>
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToUserProfile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToOrders">
                    <el-icon><Tickets /></el-icon>我的订单
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToMessages">
                    <el-icon><Message /></el-icon>订单消息
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <router-link v-else to="/login" class="login-btn">
            登录/注册
          </router-link>
        </div>
      </div>
    </header>

    <!-- 在线人数显示 -->
    <div v-if="socketMessage" class="online-count">
      <el-icon><User /></el-icon>
      <span>当前在线: {{ socketMessage }}</span>
    </div>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- 返回顶部按钮 -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script>
import { ref, onMounted, provide, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getCartData } from '../api/cartApi';
import { getUserInfo } from '../api/userApi';
import {
  House,
  Reading,
  List,
  UserFilled,
  Search,
  Bell,
  ShoppingCart,
  CaretBottom,
  User,
  Tickets,
  Message,
  SwitchButton
} from '@element-plus/icons-vue';

export default {
  name: 'MainLayout',
  components: {
    House,
    Reading,
    List,
    UserFilled,
    Search,
    Bell,
    ShoppingCart,
    CaretBottom,
    User,
    Tickets,
    Message,
    SwitchButton
  },
  setup() {
    const socketMessage = ref(null);
    const currentCategory = ref('all');
    const cartQuantity = ref('');
    const router = useRouter();
    let socket = null;
    const avatarUrl = ref('');
    const username = ref('');
    const searchQuery = ref('');
    const unreadCount = ref(0);
    const isLoggedIn = ref(!!sessionStorage.getItem('token'));

    // 设置分类为全部
    const setCategoryAll = () => {
      currentCategory.value = 'all';
      router.push('/books');
    };

    // 获取购物车数据
    const fetchCartData = async () => {
      try {
        const cartData = await getCartData();
        cartQuantity.value = cartData.itemCartList.length;
      } catch (error) {
        console.error('获取购物车数据失败', error);
      }
    };

    // 获取用户信息
    const getUser = async () => {
      try {
        const data = await getUserInfo();
        avatarUrl.value = data.avatarUrl;
        username.value = data.name;
      } catch (error) {
        console.error('不能获取用户头像和用户名', error);
      }
    };

    // 导航方法
    const goToUserProfile = () => router.push('/user/profile');
    const goToOrders = () => router.push('/orders');
    const goToMessages = () => router.push('/orderMessage');

    // 搜索功能
    const handleSearch = () => {
      if (!searchQuery.value.trim()) return;
      router.push({
        path: '/books',
        query: { search: searchQuery.value }
      });
      searchQuery.value = '';
    };

    // 退出功能
    const logout = () => {
      sessionStorage.removeItem('token');
      isLoggedIn.value = false;
      router.push('/login');
    };

    // 获取未读消息数量
    const fetchUnreadCount = async () => {
      try {
        // 这里可以调用相应的 API 获取未读消息数量
        // unreadCount.value = await getUnreadMessageCount();
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
      }
    };

    // 初始化 WebSocket
    const initWebSocket = () => {
      socket = new WebSocket('ws://localhost:8080/ws');
      socket.onmessage = (event) => {
        socketMessage.value = event.data;
      };
      socket.onopen = () => console.log('WebSocket connection established');
      socket.onerror = (error) => console.error('WebSocket error:', error);
      socket.onclose = () => console.log('WebSocket connection closed');
    };

    // 组件挂载时的操作
    onMounted(() => {
      getUser();
      fetchCartData();
      fetchUnreadCount();
      initWebSocket();
    });

    // 组件卸载时的操作
    onUnmounted(() => {
      if (socket) {
        socket.close();
      }
    });

    // Provide 注入
    provide('currentCategory', currentCategory);
    provide('setCategoryAll', setCategoryAll);
    provide('avatarUrl', avatarUrl);
    provide('username', username);

    return {
      currentCategory,
      setCategoryAll,
      cartQuantity,
      isLoggedIn,
      logout,
      socketMessage,
      username,
      avatarUrl,
      searchQuery,
      handleSearch,
      goToUserProfile,
      goToOrders,
      goToMessages,
      unreadCount
    };
  }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
}

.logo-image {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-nav {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  text-decoration: none;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: #409EFF;
  background: rgba(64,158,255,0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 240px;
}

.notification-link,
.cart-link {
  color: #606266;
  font-size: 20px;
  padding: 8px;
  transition: color 0.3s;
}

.notification-link:hover,
.cart-link:hover {
  color: #409EFF;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  color: #303133;
  font-size: 14px;
}

.login-btn {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
}

.online-count {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
}

.main-content {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .search-box {
    width: 160px;
  }
  
  .username {
    display: none;
  }
}
</style>
