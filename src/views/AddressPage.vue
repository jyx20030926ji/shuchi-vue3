<template>
  <div class="address-center">
    <div class="content">
      <main class="address-content">
        <div class="address-header">
          <span>我的地址列表</span>
          <el-button class="add-address-btn" type="primary" @click="openAddAddressModal">
            添加新地址
          </el-button>
        </div>

        <el-row gutter={20}>
          <el-col :span="8" v-for="address in addressList" :key="address.id">
            <el-card :body-style="{ padding: '20px' }" :class="['address-card', { 'default-address': address.status === 1 }]">
              <div class="address-info">
                <p><strong>姓名：</strong>{{ address.name }}</p>
                <p><strong>电话：</strong>{{ address.phone }}</p>
                <p><strong>基本地址：</strong>{{ address.basicAddress }}</p>
                <p><strong>详细地址：</strong>{{ address.detailAddress }}</p>
                <div class="default-status">
                  <el-button
                    :type="address.status === 1 ? 'success' : 'text'"
                    @click="setAsDefault(address.id, address.status === 1 ? 0 : 1)">
                    {{ address.status === 1 ? '默认地址' : '设为默认' }}
                  </el-button>
                </div>
              </div>
              <div class="address-actions">
                <el-button class="edit-btn" type="primary" @click="edittAddress(address.id)">编辑</el-button>
                <el-button class="delete-btn" type="danger" @click="removeAddress(address.id)">删除</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </main>
    </div>

    <!-- Address Modal (For Adding and Editing Address) -->
    <AddressModal
      v-if="showAddAddressModal"
      :addressId="selectedAddressId"
      @save="handleSave"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAddressList, setDefaultAddress, addAddress, editAddress, deleteAddress } from '../api/addressApi';
import AddressModal from '../components/AddressModal.vue';
import { ElButton, ElCard, ElRow, ElCol } from 'element-plus';

export default {
  components: {
    AddressModal,
    ElButton,
    ElCard,
    ElRow,
    ElCol,
  },
  setup() {
    const addressList = ref([]);
    const showAddAddressModal = ref(false);
    const selectedAddressId = ref(null);

    const fetchAddresses = async () => {
      try {
        addressList.value = await getAddressList();
      } catch (error) {
        console.error('加载地址列表失败', error);
      }
    };

    const setAsDefault = async (addressId, status) => {
      try {
        await setDefaultAddress(addressId, status);
        await fetchAddresses();
      } catch (error) {
        console.error('设置默认地址失败', error);
      }
    };

    const openAddAddressModal = () => {
      selectedAddressId.value = null;
      showAddAddressModal.value = true;
    };

    const edittAddress = (addressId) => {
      selectedAddressId.value = addressId;
      showAddAddressModal.value = true;
    };

    const handleSave = async (addressData) => {
      try {
        if (selectedAddressId.value) {
          await editAddress(addressData);
        } else {
          await addAddress(addressData);
        }
        await fetchAddresses();
        closeModal();
      } catch (error) {
        console.error('保存地址失败', error);
      }
    };

    const closeModal = () => {
      showAddAddressModal.value = false;
      selectedAddressId.value = null;
    };

    const removeAddress = async (addressId) => {
      try {
        await deleteAddress(addressId);
        await fetchAddresses();
      } catch (error) {
        console.error('删除地址失败', error);
      }
    };

    onMounted(fetchAddresses);

    return {
      addressList,
      showAddAddressModal,
      selectedAddressId,
      setAsDefault,
      openAddAddressModal,
      edittAddress,
      handleSave,
      closeModal,
      removeAddress,
    };
  },
};
</script>

<style scoped>
.address-center {
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
  font-family: Arial, sans-serif;
  min-height: 100vh;
}

.content {
  display: flex;
  justify-content: center;
  padding: 20px;
  flex: 1;
}

.address-content {
  width: 100%;
  max-width: 1200px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-address-btn {
  background-color: #f8b400;
  color: white;
  border-radius: 4px;
}

.add-address-btn:hover {
  background-color: #e0a100;
}

.address-list {
  display: flex;
  flex-wrap: wrap;
}

.address-card {
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.address-info p {
  margin: 5px 0;
  color: #555;
}

.default-status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.address-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.edit-btn,
.delete-btn {
  padding: 5px 10px;
  border-radius: 4px;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
}

.address-actions button:hover {
  opacity: 0.8;
}

.default-address {
  border-left: 5px solid #f8b400;
  padding-left: 10px;
}

.el-card {
  background-color: #f7f7f7;
}

.el-button {
  font-size: 14px;
}
</style>
