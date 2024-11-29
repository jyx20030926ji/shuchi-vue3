<template>
  <div class="order-page">
    <!-- 左侧：订单消息 -->
    <div class="order-messages">
      <div class="messages-header">
        <h2>订单消息</h2>
      </div>

      <!-- 消息列表 -->
      <div v-if="messages.length === 0" class="empty-state">
        <el-empty description="暂无订单消息" />
      </div>

      <el-scrollbar v-else height="400px">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message-item"
        >
          <div class="message-content">
            <div class="message-header">
              <span class="message-type">{{ getMessageTypeText(message.type) }}</span>
              <span class="message-time">{{ formatTime(message.createTime) }}</span>
            </div>
            <p class="message-text">{{ message.content }}</p>
          </div>
          <div class="message-actions">
            <el-button 
              type="text" 
              size="small"
              @click="removeMessage(message.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 右侧：订单处理 -->
    <div class="order-details">
      <div class="orders-header">
        <h2>处理订单</h2>
        <el-radio-group v-model="selectedStatus" @change="filterOrders">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button 
            v-for="(label, status) in orderStatusText" 
            :key="status" 
            :value="status"
          >
            {{ label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 订单列表 -->
      <div v-if="orders.length === 0" class="empty-state">
        <el-empty description="暂无需要处理的订单" />
      </div>

      <div v-else class="order-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-item">
          <!-- 订单头部信息 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号：{{ order.orderNumber }}</span>
              <div class="time-info">
                <span class="time-item">创建时间：{{ formatTime(order.createTime) }}</span>
                <span class="time-item">更新时间：{{ formatTime(order.updateTime) }}</span>
              </div>
            </div>
            <el-tag :type="getStatusType(order.orderStatus)">
              {{ orderStatusText[order.orderStatus] }}
            </el-tag>
          </div>

          <!-- 购买者信息 -->
          <div class="buyer-info" v-if="order.userInfo">
            <el-avatar :src="order.userInfo.avatarUrl" :size="40" />
            <div class="buyer-details">
              <span class="buyer-name">{{ order.userInfo.name }}</span>
              <span class="buyer-account">{{ order.userInfo.account }}</span>
            </div>
          </div>

          <!-- 订单内容 -->
          <div class="order-content">
  <div class="book-info">
    <el-image 
      :src="order.imageUrl" 
      fit="cover"
      class="book-image"
    />
    <div class="book-details">
      <h4 class="book-name">{{ order.bookName }}</h4>
      <p class="book-author">作者：{{ order.bookAuthor }}</p>
      <div class="book-meta">
        <span class="book-price">¥{{ order.bookPrice }}</span>
        <span class="book-quantity">× {{ order.bookNumber }}</span>
      </div>
    </div>
  </div>

  <!-- 添加操作按钮区域 -->
  <div class="order-actions">
    <!-- 待发货状态显示发货按钮 -->
    <el-button 
      v-if="order.orderStatus === 2"
      type="primary" 
      size="small"
      :loading="loading"
      @click="handleUpdateStatus(order.id, 3)"
    >
      {{ loading ? '发货中...' : '发货' }}
    </el-button>

    <!-- 待支付或待发货状态显示取消按钮 -->
    <el-button 
      v-if="[1, 2].includes(order.orderStatus)"
      type="danger" 
      size="small"
      @click="openCancelDialog(order.id)"
    >
      取消订单
    </el-button>
  </div>

  <!-- 如果订单已取消，显示取消原因 -->
  <div v-if="order.orderStatus === 5 && order.cancelReason" class="cancel-reason">
    取消原因：{{ order.cancelReason }}
  </div>
</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 取消订单对话框 -->
  <el-dialog
    v-model="cancelDialogVisible"
    title="取消订单"
    width="30%"
  >
    <el-form>
      <el-form-item label="取消原因">
        <el-input
          v-model="cancelReason"
          type="textarea"
          rows="3"
          placeholder="请输入取消原因"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCancel">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getOrderMessages, removeOrderMessage } from "../api/orderMessageApi";
import { getOrderDetails, updateOrderStatus, cancelOrderDetail } from "../api/orderDetailApi";
import { getFriendInfo } from "../api/userApi";

export default {
  name: "OrderPage",
  setup() {
    const messages = ref([]);
    const orders = ref([]);
    const selectedStatus = ref('all');
    const loading = ref(false);
    const cancelDialogVisible = ref(false);
    const cancelReason = ref('');
    const currentOrderId = ref(null);

    // 订单状态文本
    const orderStatusText = {
      1: "待支付",
      2: "待发货",
      3: "待收货",
      4: "已完成",
      5: "已取消",
    };

    // 获取消息类型文本
    const getMessageTypeText = (type) => {
      const types = {
        1: '订单创建',
        2: '订单支付',
        3: '订单发货',
        4: '订单完成',
        5: '订单取消'
      };
      return types[type] || '未知类型';
    };

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        1: 'warning',   // 待支付
        2: 'info',      // 待发货
        3: 'primary',   // 待收货
        4: 'success',   // 已完成
        5: 'danger'     // 已取消
      };
      return types[status] || 'info';
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return "时间不可用";
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    // 获取订单消息
    const fetchMessages = async () => {
      try {
        const response = await getOrderMessages();
        messages.value = response || [];
      } catch (error) {
        console.error("获取订单消息失败", error);
      }
    };

    // 删除消息
    const removeMessage = async (messageId) => {
      try {
        await removeOrderMessage(messageId);
        messages.value = messages.value.filter(
          (message) => message.id !== messageId
        );
      } catch (error) {
        console.error("删除消息失败", error);
      }
    };

    // 获取订单列表
    const fetchOrders = async () => {
      try {
        const ordersData = await getOrderDetails();
        
        if (ordersData) {
          // 获取每个订单的用户信息
          const ordersWithUserInfo = await Promise.all(
            ordersData.map(async (order) => {
              try {
                const userInfoResponse = await getFriendInfo(order.userId);
                const userInfo = userInfoResponse;  // 获取 data 中的用户信息
                return {
                  ...order,
                  userInfo: {
                    name: userInfo.name,           // 直接使用 userInfo 中的数据
                    avatarUrl: userInfo.avatarUrl,
                    account: userInfo.account
                  }
                };
              } catch (error) {
                console.error('获取用户信息失败:', error);
                return {
                  ...order,
                  userInfo: null
                };
              }
            })
          );

          orders.value = ordersWithUserInfo;
          console.log('处理后的订单数据:', ordersWithUserInfo);
        } else {
          orders.value = [];
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        orders.value = [];
      }
    };

    // 修改计算属性来添加排序
    const filteredOrders = computed(() => {
      // 先过滤
      let result = selectedStatus.value === 'all' 
        ? orders.value 
        : orders.value.filter(order => order.orderStatus === parseInt(selectedStatus.value));
        
      // 按修改时间降序排序（最新的在前面）
      return result.sort((a, b) => {
        const timeA = new Date(a.updateTime).getTime();
        const timeB = new Date(b.updateTime).getTime();
        return timeB - timeA;  // 降序排序
      });
    });

    // 修改 filterOrders 方法
    const filterOrders = () => {
      // 不需要重新请求数据，直接使用计算属性过滤
      console.log('当前选择状态:', selectedStatus.value);
    };

    // 修改更新订单状态方法，避免方法名重复
    const handleUpdateStatus = async (orderId, status) => {  // 改名为 handleUpdateStatus
      if (loading.value) return;  // 如果正在加载，直接返回
      loading.value = true;
      try {
        await updateOrderStatus(orderId, status);  // 这里调用 API 函数
        ElMessage.success(status === 3 ? '发货成功' : '订单状态更新成功');
        await fetchOrders();
      } catch (error) {
        console.error('更新订单状态失败:', error);
        ElMessage.error(status === 3 ? '发货失败，请重试' : '更新失败，请重试');
      } finally {
        loading.value = false;
      }
    };

    // 打开取消订单对话框
    const openCancelDialog = (orderId) => {
      currentOrderId.value = orderId;
      cancelReason.value = '';
      cancelDialogVisible.value = true;
    };

    // 提交取消订单
    const submitCancel = async () => {
      if (!cancelReason.value.trim()) {
        ElMessage.warning('��输入取消原因');
        return;
      }

      try {
        await cancelOrderDetail(currentOrderId.value, cancelReason.value, 5);
        ElMessage.success('订单已取消');
        cancelDialogVisible.value = false;
        await fetchOrders();
      } catch (error) {
        console.error('取消订单失败:', error);
        ElMessage.error('取消失败，请重试');
      }
    };

    onMounted(() => {
      fetchMessages();
      fetchOrders();
    });

    return {
      messages,
      orders,
      orderStatusText,
      selectedStatus,
      formatTime,
      getMessageTypeText,
      getStatusType,
      removeMessage,
      filterOrders,
      filteredOrders,
      handleUpdateStatus,
      openCancelDialog,
      submitCancel,
      loading,
      cancelDialogVisible,
      cancelReason,
    };
  },
};
</script>

<style scoped>
.order-page {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.order-messages {
  width: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.message-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  transition: all 0.3s;
}

.message-item:hover {
  background: #f5f7fa;
}

.message-item.unread {
  background: #ecf5ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-type {
  color: #409EFF;
  font-weight: 500;
}

.message-time {
  color: #909399;
  font-size: 12px;
}

.message-text {
  color: #606266;
  line-height: 1.5;
}

.message-actions {
  margin-top: 8px;
  text-align: right;
}

.order-details {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.orders-header {
  margin-bottom: 20px;
}

.order-item {
  margin-bottom: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-info {
  display: flex;
  gap: 15px;
}

.book-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.book-details {
  flex: 1;
}

.book-author {
  color: #909399;
  margin: 8px 0;
}

.book-price {
  color: #ff4d4f;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  color: #606266;
}

.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.order-actions .el-button {
  min-width: 80px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 消息列表动画 */
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s;
}

.message-list-enter-from,
.message-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.buyer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 12px 0;
  background: #f8f9fa;
  border-radius: 8px;
}

.buyer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.buyer-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.buyer-account {
  font-size: 13px;
  color: #909399;
}

.time-info {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 13px;
}

.time-item {
  white-space: nowrap;
}

.order-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cancel-reason {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff5f5;
  color: #f56c6c;
  border-radius: 4px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .time-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
