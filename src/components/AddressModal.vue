<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ addressId ? '编辑地址' : '添加新地址' }}</h3>

      <!-- 姓名 -->
      <div class="form-group">
        <label>姓名</label>
        <input v-model="name" type="text" placeholder="请输入姓名" class="form-input"/>
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <!-- 电话 -->
      <div class="form-group">
        <label>电话</label>
        <input v-model="phone" type="text" placeholder="请输入电话号码" class="form-input"/>
        <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
      </div>

      <!-- 基本地址 -->
      <div class="form-group">
        <label>基本地址</label>
        <input v-model="basicAddress" type="text" placeholder="请输入基本地址" class="form-input"/>
        <span v-if="errors.basicAddress" class="error">{{ errors.basicAddress }}</span>
      </div>

      <!-- 详细地址 -->
      <div class="form-group">
        <label>详细地址</label>
        <input v-model="detailAddress" type="text" placeholder="请输入详细地址" class="form-input"/>
        <span v-if="errors.detailAddress" class="error">{{ errors.detailAddress }}</span>
      </div>

      <!-- 默认地址 -->
      <div class="form-group">
        <label for="defaultAddress">设为默认地址</label>
        <div class="circle-checkbox" @click="toggleDefaultAddress">
          <span :class="{'filled-heart': status === 1, 'circle': status === 0}"></span>
        </div>
        <span>{{ status === 1 ? '已设为默认' : '未设为默认' }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <button @click="closeModal" class="cancel-btn">取消</button>
        <button @click="validateAndSave" class="save-btn">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { getAddressById } from '../api/addressApi';

export default {
  props: {
    addressId: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const name = ref('');
    const phone = ref('');
    const basicAddress = ref('');
    const detailAddress = ref('');
    const status = ref(0); // 默认为非默认地址
    const errors = ref({});
    const id = ref(null); // 用来存储地址的 ID

    const fetchAddress = async () => {
      if (props.addressId) {
        try {
          const data = await getAddressById(props.addressId);
          id.value = data.id; // 获取 id 并赋值
          name.value = data.name;
          phone.value = data.phone;
          basicAddress.value = data.basicAddress;
          detailAddress.value = data.detailAddress;
          status.value = data.status;
        } catch (error) {
          console.error('加载地址失败', error);
        }
      }
    };

    // 监听 addressId 的变化
    watch(() => props.addressId, fetchAddress, { immediate: true });

    // 切换默认地址的状态
    const toggleDefaultAddress = () => {
      status.value = status.value === 1 ? 0 : 1;
    };

    // 验证表单并保存
    const validateAndSave = () => {
      errors.value = {};
      if (!name.value) errors.value.name = '姓名不能为空';
      if (!phone.value) {
        errors.value.phone = '电话号码不能为空';
      } else if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        errors.value.phone = '电话号码格式不正确';
      }
      if (!basicAddress.value) errors.value.basicAddress = '基本地址不能为空';
      if (!detailAddress.value) errors.value.detailAddress = '详细地址不能为空';

      // 如果没有错误，发送保存数据
      if (Object.keys(errors.value).length === 0) {
        emit('save', {
          id: id.value, // 传递 id
          name: name.value,
          phone: phone.value,
          basicAddress: basicAddress.value,
          detailAddress: detailAddress.value,
          status: status.value,
        });
      }
    };

    // 关闭模态框
    const closeModal = () => {
      emit('close');
    };

    return {
      name,
      phone,
      basicAddress,
      detailAddress,
      status,
      errors,
      id,
      validateAndSave,
      closeModal,
      toggleDefaultAddress,
    };
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4); /* Darker backdrop */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

h3 {
  text-align: center;
  color: #333;
  font-size: 18px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}

.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 14px;
  background-color: #f9f9f9;
}

.form-input:focus {
  border-color: #f7b200;
  outline: none;
}

.error {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

.circle-checkbox {
  display: inline-block;
  cursor: pointer;
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #f7b200;
  background-color: #fff;
  transition: background-color 0.3s, border-color 0.3s;
}

.circle-checkbox .circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.filled-heart::before {
  content: '';  /* 红心符号 */
  font-size: 20px;
  color: #f7b200;  /* 黄 */
  position: absolute;
  top: 2px;
  left: 2px;
}

.circle-checkbox .filled-heart {
  content: '';  /* 移除红心符号 */
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #e2231a;  /* 红色背景 */
  position: absolute;
  top: 0;
  left: 0;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.cancel-btn {
  background-color: #ddd;
  color: #555;
}

.cancel-btn:hover {
  background-color: #bbb;
}

.save-btn {
  background-color: #f7b200;
  color: white;
}

.save-btn:hover {
  background-color: #e6a600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button:focus {
  outline: none;
}
</style>
