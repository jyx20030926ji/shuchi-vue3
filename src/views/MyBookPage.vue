<template>
  <el-container class="main-container">
    <!-- 左侧图书列表 -->
    <el-aside width="400px" class="book-list-container">
      <!-- 操作按钮 -->
      <div class="button-group">
        <el-button type="primary" icon="Plus" @click="openAddDialog">发布图书</el-button>
        <el-button
          type="danger"
          icon="Delete"
          :disabled="!selectedBooks.length"
          @click="handleBulkDelete"
        >
          批量删除
        </el-button>
      </div>

      <el-scrollbar height="calc(100vh - 180px)">
        <el-menu :default-active="String(selectedBookId)" class="book-menu">
          <el-menu-item
            v-for="book in books"
            :key="book.id"
            :index="String(book.id)"
            class="book-item-wrapper"
            @click="selectBook(book)"  
          >
            <div class="book-item">
              <el-checkbox
                v-model="selectedBooks"
                :label="book.id"
                class="book-checkbox"
                @click.stop
              ></el-checkbox>
              <img class="book-thumbnail" :src="book.imageUrl || defaultImage" alt="thumbnail" />
              <div class="book-details">
                <div class="book-name">{{ book.bookName }}</div>
                <div class="book-info">
                  <span class="book-author">{{ book.bookAuthor }}</span>
                  <span class="book-price">¥{{ book.bookPrice }}</span>
                </div>
                <div class="book-status">
                  <el-tag :type="book.bookStatus === 1 ? 'success' : 'warning'" size="small">
                    {{ book.bookStatus === 1 ? '全新' : '二手' }}
                  </el-tag>
                  <span class="book-time">{{ formatTime(book.createTime) }}</span>
                </div>
              </div>
            </div>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-main class="book-detail-container">
      <router-view v-if="selectedBookId"></router-view>
      <div v-else class="empty-state">
        <el-empty description="请选择一本图书查看详情" />
      </div>
    </el-main>
  </el-container>

  <!-- 添加/编辑图书对话框 -->
  <el-dialog 
    v-model="isDialogVisible" 
    :title="dialogTitle"
    width="50%"
    destroy-on-close
  >
    <el-form 
      :model="bookForm" 
      :rules="rules" 
      ref="bookFormRef"
      label-width="100px"
    >
      <el-form-item label="书名" prop="bookName">
        <el-input v-model="bookForm.bookName" />
      </el-form-item>
      
      <el-form-item label="作者" prop="bookAuthor">
        <el-input v-model="bookForm.bookAuthor" />
      </el-form-item>

      <el-form-item label="ISBN" prop="bookISBN">
        <el-input v-model="bookForm.bookISBN" />
      </el-form-item>

      <el-form-item label="价格" prop="bookPrice">
        <el-input-number 
          v-model="bookForm.bookPrice" 
          :precision="2" 
          :step="0.1"
          :min="0"
        />
      </el-form-item>

      <el-form-item label="库存" prop="stock">
        <el-input-number 
          v-model="bookForm.stock" 
          :min="0" 
          :step="1"
        />
      </el-form-item>

      <el-form-item label="状态" prop="bookStatus">
        <el-select v-model="bookForm.bookStatus">
          <el-option :value="1" label="全新" />
          <el-option :value="2" label="二手" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input 
          type="textarea" 
          v-model="bookForm.description" 
          rows="4"
        />
      </el-form-item>

      <el-form-item label="封面" prop="imageUrl">
        <el-upload
          class="avatar-uploader"
          action="http://localhost:8080/admin/users/upload"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :before-upload="beforeImageUpload"
        >
          <img v-if="bookForm.imageUrl" :src="bookForm.imageUrl" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveBook">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, onMounted, provide, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  fetchBooks,
  addBook,
  updateBook,
  deleteBooksByIds,
} from "../api/mybookApi";
import { Plus } from '@element-plus/icons-vue';

export default {
  components: {
    Plus
  },
  setup() {
    const books = ref([]);
    const selectedBookId = ref(null);
    const selectedBooks = ref([]);
    const isDialogVisible = ref(false);
    const dialogTitle = ref("添加图书");
    const bookForm = ref({});
    const bookFormRef = ref(null);
    const defaultImage = "https://via.placeholder.com/80";
    const router = useRouter();
   

    const rules = {
      bookName: [
        { required: true, message: '请输入书名', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      bookAuthor: [
        { required: true, message: '请输入作者', trigger: 'blur' }
      ],
      bookISBN: [
        { required: true, message: '请输入ISBN', trigger: 'blur' }
      ],
      bookPrice: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
      ],
      stock: [
        { required: true, message: '请输入库存', trigger: 'blur' },
        { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
      ],
      bookStatus: [
        { required: true, message: '请选择图书状态', trigger: 'change' }
      ]
    };

    const loadBooks = async () => {
      books.value = await fetchBooks();
    };

    const selectBook = async (book) => {
      try {
        selectedBookId.value = book.id;
        await router.push({
          name: 'MyBookDetail',
          params: { id: book.id }
        });
      } catch (error) {
        console.error('导航失败:', error);
      }
    };

    const openAddDialog = () => {
      dialogTitle.value = "添加图书";
      bookForm.value = {};
      isDialogVisible.value = true;
    };

    const saveBook = async () => {
      try {
        await bookFormRef.value.validate();
        
        if (bookForm.value.id) {
          await updateBook(bookForm.value);
          ElMessage.success('更新成功');
        } else {
          await addBook(bookForm.value);
          ElMessage.success('添加成功');
        }
        
        isDialogVisible.value = false;
        loadBooks();
      } catch (error) {
        if (error.message) {
          ElMessage.error(error.message);
        }
      }
    };

    const handleBulkDelete = async () => {
      try {
        await ElMessageBox.confirm('确定要删除选中的图书吗？', '提示', {
          type: 'warning'
        });
        
        await deleteBooksByIds(selectedBooks.value.join(','));
        ElMessage.success('删除成功');
        selectedBooks.value = [];
        loadBooks();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败');
        }
      }
    };

    const handleUploadSuccess = (response) => {
      if (response.code === 1) {
        bookForm.value.imageUrl = response.data;
      } else {
        alert("上传失败");
      }
    };

    const beforeImageUpload = (file) => {
      const isValid =
        ["image/jpeg", "image/png"].includes(file.type) &&
        file.size < 2 * 1024 * 1024;
      if (!isValid) alert("图片格式必须为 JPG/PNG，且大小小于 2MB");
      return isValid;
    };

    const closeDialog = () => {
      isDialogVisible.value = false;
      if (bookFormRef.value) {
        bookFormRef.value.resetFields();
      }
      bookForm.value = {};
    };
    provide('loadBooks', loadBooks);

    onMounted(() => {
      loadBooks();
    });

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const uploadHeaders = computed(() => {
      return {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      };
    });

    return {
      books,
      selectedBookId,
      selectedBooks,
      isDialogVisible,
      dialogTitle,
      bookForm,
      bookFormRef,
      defaultImage,
      rules,
      selectBook,
      openAddDialog,
      saveBook,
      handleBulkDelete,
      handleUploadSuccess,
      beforeImageUpload,
      closeDialog,
      loadBooks,
      formatTime,
      uploadHeaders,
    };
  },
};
</script>

<style scoped>
.main-container {
  height: calc(100vh - 64px);
  background: #f5f7fa;
}

.book-list-container {
  background: white;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.button-group .el-button {
  flex: 1;
}

.book-menu {
  border: none;
}

.book-item-wrapper {
  margin-bottom: 16px;
  height: auto !important;
  padding: 0 !important;
}

.book-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.book-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.book-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  margin: 0;
}

.book-thumbnail {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 24px;
}

.book-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
}

.book-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.book-price {
  color: #ff4d4f;
  font-weight: 500;
}

.book-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.book-time {
  font-size: 12px;
  color: #909399;
}

.book-detail-container {
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

:deep(.el-checkbox__label) {
  display: none;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-preview {
  width: 178px;
  height: 178px;
  object-fit: cover;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}
</style>
