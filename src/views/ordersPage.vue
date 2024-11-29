<template>
  <div class="order-center">
    <!-- 订单状态导航 -->
    <div class="order-nav">
      <router-link 
        v-for="(label, status) in statusMap" 
        :key="status"
        :to="{ name: 'Order', params: { status: status === 'all' ? null : status }}"
        class="nav-item"
        :class="{ active: currentStatus === status }"
      >
        {{ label }}
      </router-link>
    </div>

    <!-- 批量操作按钮 -->
    <div class="bulk-actions">
      <el-button 
        type="danger" 
        :disabled="!selectedOrders.length"
        @click="banchDelete"
      >
        批量删除订单
      </el-button>
    </div>

    <!-- 订单列表 -->
    <div v-if="orders.length === 0" class="empty-state">
      <el-empty description="暂无订单">
        <router-link to="/books">
          <el-button type="primary">去购物</el-button>
        </router-link>
      </el-empty>
    </div>

    <div v-else class="order-list">
      <el-card 
        v-for="order in orders" 
        :key="order.id"
        class="order-item"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号：{{ order.orderNumber }}</span>
            <div class="time-info">
              <span class="time-item">
                <span class="time-label">创建时间：</span>
                {{ formatTime(order.createTime) }}
              </span>
              <span class="time-item">
                <span class="time-label">更新时间：</span>
                {{ formatTime(order.updateTime) }}
              </span>
            </div>
          </div>
          <el-tag :type="getStatusType(order.orderStatus)">
            {{ orderStatusText(order.orderStatus) }}
          </el-tag>
        </div>

        <div class="order-content">
          <div class="order-images">
            <el-image 
              v-for="(image, index) in order.imageUrls" 
              :key="index"
              :src="image" 
              fit="cover"
              class="book-image"
              @click="goToOrderDetail(order.id)"
            />
          </div>

          <div class="order-summary">
            <div class="order-amount">
              <span>数量：{{ order.number }}</span>
              <span class="total-price">总金额：¥{{ order.total }}</span>
            </div>
            <div class="order-actions">
              <el-checkbox 
                v-model="selectedOrders" 
                :label="order.id"
              />
              <el-button 
                type="primary" 
                @click="goToOrderDetail(order.id)"
              >
                查看详情
              </el-button>
              <el-button 
                type="danger" 
                @click="openBulkCancelModal(order.id)"
              >
                取消订单
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="10"
        :total="totalOrders"
        layout="prev, pager, next"
        @current-change="changePage"
      />
    </div>

    <!-- 取消订单对话框 -->
    <el-dialog
      v-model="showBulkCancelModal"
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
          <el-button @click="closeBulkCancelModal">取消</el-button>
          <el-button type="primary" @click="cancellOrder">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrderList, deleteOrder, cancelOrder } from '../api/orderApi';
import { getUserInfo } from '../api/userApi';

export default {
  name: 'OrderPage',
  setup() {
    const orders = ref([]);
    const totalOrders = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const route = useRoute();
    const router = useRouter();
    const selectedOrders = ref([]);
    const cancelReason = ref('');
    const showBulkCancelModal = ref(false);
    const selectOrderId = ref('');

    const status = computed(() => (route.params.status ? parseInt(route.params.status) : null));

    const statusMap = {
      'all': '全部订单',
      '1': '待支付',
      '2': '待发货',
      '3': '待收货',
      '4': '已完成',
      '5': '已取消'
    };

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

    const fetchOrders = async () => {
      try {
        const ordersData = await getOrderList({
          page: currentPage.value,
          pageSize: pageSize.value,
          status: status.value,
        });
        
        if (ordersData && ordersData.orders) {
          // 获取每个订单的用户信息
          const ordersWithUserInfo = await Promise.all(
            ordersData.orders.map(async (order) => {
              try {
                const userInfo = await getUserInfo(order.userId);
                return {
                  ...order,
                  userInfo: {
                    name: userInfo.name,
                    avatarUrl: userInfo.avatarUrl
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
          totalOrders.value = ordersData.total;
        } else {
          orders.value = [];
          totalOrders.value = 0;
        }
      } catch (error) {
        console.error('获取订单失败', error);
        orders.value = [];
        totalOrders.value = 0;
      }
    };

    watch(() => route.params.status, () => {
      currentPage.value = 1;
      fetchOrders();
    });

    const changePage = (newPage) => {
      currentPage.value = newPage;
    };

    const goToOrderDetail = (orderId) => {
      router.push({ name: 'OrderDetails', params: { orderId } });
    };

    const orderStatusText = (status) => {
      switch (status) {
        case 1: return '待支付';
        case 2: return '待发货';
        case 3: return '待收货';
        case 4: return '已完成';
        case 5: return '已取消';
        default: return '未知状态';
      }
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return '暂无';
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    };

    const cancellOrder = async () => {
      const orderData = {
        orderId: selectOrderId.value,
        status: 5,
        reason: cancelReason.value,
      };

      try {
        await cancelOrder(orderData);
        closeBulkCancelModal();
        fetchOrders();
      } catch (error) {
        console.error('取消订单失败', error);
      }
    };

    const openBulkCancelModal = (orderId) => {
      showBulkCancelModal.value = true;
      selectOrderId.value = orderId;
    };

    const closeBulkCancelModal = () => {
      showBulkCancelModal.value = false;
      cancelReason.value = '';
      selectOrderId.value = '';
    };

    const banchDelete = async () => {
      try {
        await ElMessageBox.confirm('确定要删除选中的订单吗？', '提示', {
          type: 'warning'
        });
        
        await deleteOrder(selectedOrders.value.join(','));
        ElMessage.success('删除成功');
        selectedOrders.value = [];
        fetchOrders();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除订单失败', error);
          ElMessage.error('删除失败');
        }
      }
    };

    const currentStatus = computed(() => {
      return route.params.status || 'all';
    });

    onMounted(fetchOrders);

    return {
      orders,
      statusText: computed(() => statusMap[currentStatus.value]),
      currentPage,
      totalOrders,
      selectedOrders,
      cancelReason,
      showBulkCancelModal,
      changePage,
      goToOrderDetail,
      cancellOrder,
      openBulkCancelModal,
      closeBulkCancelModal,
      banchDelete,
      orderStatusText,
      formatTime,
      statusMap,
      currentStatus,
      getStatusType,
    };
  },
};
</script>

<style scoped>
.order-center {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.order-nav {
  display: flex;
  gap: 20px;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.nav-item {
  color: #606266;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #409EFF;
  background: rgba(64,158,255,0.1);
}

.bulk-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  transition: transform 0.3s;
}

.order-item:hover {
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.order-info {
  display: flex;
  gap: 24px;
  color: #606266;
}

.order-number {
  font-weight: 500;
}

.time-info {
  display: flex;
  gap: 24px;
  color: #909399;
  font-size: 14px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-label {
  color: #606266;
}

.order-content {
  display: flex;
  gap: 24px;
}

.order-images {
  display: flex;
  gap: 12px;
}

.book-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.book-image:hover {
  transform: scale(1.05);
}

.order-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-amount {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  color: #606266;
}

.total-price {
  color: #ff4d4f;
  font-weight: 500;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.empty-state {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

@media (max-width: 768px) {
  .order-nav {
    overflow-x: auto;
    padding: 12px;
  }

  .order-content {
    flex-direction: column;
  }

  .order-images {
    overflow-x: auto;
    padding-bottom: 12px;
  }

  .order-actions {
    flex-wrap: wrap;
  }

  .time-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>


