<template>
  <div class="book-detail-container">
    <el-card class="book-detail-card">
      <template #header>
        <div class="card-header">
          <h2>图书详情</h2>
          <div class="header-actions">
            <el-button type="primary" @click="editBook">编辑</el-button>
            <el-button type="danger" @click="confirmDelete">删除</el-button>
          </div>
        </div>
      </template>

      <div class="book-content">
        <div class="book-main-info">
          <div class="book-image">
            <el-image 
              :src="book.imageUrl" 
              fit="cover"
              :preview-src-list="[book.imageUrl]"
            />
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.bookName }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">作者</span>
                <span class="value">{{ book.bookAuthor }}</span>
              </div>
              <div class="info-item">
                <span class="label">ISBN</span>
                <span class="value">{{ book.bookISBN }}</span>
              </div>
              <div class="info-item">
                <span class="label">价格</span>
                <span class="value price">¥{{ book.bookPrice }}</span>
              </div>
              <div class="info-item">
                <span class="label">库存</span>
                <span class="value">{{ book.stock }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态</span>
                <el-tag :type="book.bookStatus === 1 ? 'success' : 'warning'">
                  {{ book.bookStatus === 1 ? "全新" : "二手" }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="book-description">
          <h4>图书描述</h4>
          <p>{{ book.description || '暂无描述' }}</p>
        </div>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="编辑图书信息"
      width="50%"
      destroy-on-close
    >
      <el-form 
        :model="bookForm" 
        :rules="rules"
        ref="formRef"
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
            :headers="uploadHeaders"
          >
            <img v-if="bookForm.imageUrl" :src="bookForm.imageUrl" class="avatar-preview" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.book-detail-container {
  height: 100%;
}

.book-detail-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.book-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.book-main-info {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.book-image {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.book-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: #909399;
  font-size: 14px;
}

.value {
  color: #303133;
  font-size: 16px;
}

.value.price {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: 600;
}

.book-description {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.book-description h4 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 16px;
}

.book-description p {
  color: #606266;
  line-height: 1.8;
  font-size: 15px;
  margin: 0;
}

@media (max-width: 1200px) {
  .book-main-info {
    grid-template-columns: 240px 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .book-main-info {
    grid-template-columns: 1fr;
  }

  .book-image {
    max-width: 300px;
    margin: 0 auto;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}
</style>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchBookById, deleteBook, updateBook } from '../api/mybookApi';
import { Plus } from '@element-plus/icons-vue';

export default {
  name: 'MyBookDetail',
  components: {
    Plus
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const book = ref({});
    const dialogVisible = ref(false);
    const bookForm = ref({});
    const formRef = ref(null);

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

    // 加载图书详情
    const loadBookDetail = async () => {
      try {
        book.value = await fetchBookById(props.id);
      } catch (error) {
        console.error('获取图书详情失败:', error);
        ElMessage.error('获取图书详情失败');
      }
    };

    // 监听路由参数变化
    watch(() => props.id, () => {
      loadBookDetail();
    }, { immediate: true });

    // 确认删除
    const confirmDelete = async () => {
      try {
        await ElMessageBox.confirm('确定要删除这本图书吗？', '提示', {
          type: 'warning'
        });
        await deleteBook(props.id);
        ElMessage.success('删除成功');
        router.push('/mybook');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除图书失败:', error);
          ElMessage.error('删除失败');
        }
      }
    };

    // 编辑图书
    const editBook = () => {
      bookForm.value = {
        id: book.value.id,
        bookName: book.value.bookName,
        description: book.value.description,
        bookISBN: book.value.bookISBN,
        bookPrice: Number(book.value.bookPrice),
        bookAuthor: book.value.bookAuthor,
        bookStatus: Number(book.value.bookStatus),
        imageUrl: book.value.imageUrl,
        stock: Number(book.value.stock),
      };
      
      console.log('Editing book:', bookForm.value);
      dialogVisible.value = true;
    };

    // 处理图片上传成功
    const handleUploadSuccess = (response) => {
      if (response.code === 1) {
        bookForm.value.imageUrl = response.data;
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(response.msg || '上传失败');
      }
    };

    // 图片上传前的验证
    const beforeImageUpload = (file) => {
      const isValid =
        ["image/jpeg", "image/png"].includes(file.type) &&
        file.size < 2 * 1024 * 1024;
      if (!isValid) {
        ElMessage.error("图片格式必须为 JPG/PNG，且大小小于 2MB");
      }
      return isValid;
    };

    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return;
      
      try {
        await formRef.value.validate();
        
        // 确保所有必要的字段都存在
        const updatedBook = {
          id: bookForm.value.id,
          bookName: bookForm.value.bookName,
          description: bookForm.value.description,
          bookISBN: bookForm.value.bookISBN,
          bookPrice: Number(bookForm.value.bookPrice),
          bookAuthor: bookForm.value.bookAuthor,
          bookStatus: Number(bookForm.value.bookStatus),
          imageUrl: bookForm.value.imageUrl,
          stock: Number(bookForm.value.stock),
        };

        console.log('Submitting book:', updatedBook);

        await updateBook(updatedBook);
        ElMessage.success('更新成功');
        dialogVisible.value = false;
        await loadBookDetail(); // 重新加载图书详情
      } catch (error) {
        console.error('更新失败:', error);
        if (error.message) {
          ElMessage.error(error.message);
        } else {
          ElMessage.error('更新失败，请检查表单数据');
        }
      }
    };

    // 添加对话框关闭前的确认
    const beforeClose = (done) => {
      ElMessageBox.confirm('确认关闭？未保存的更改将会丢失')
        .then(() => {
          bookForm.value = {};
          done();
        })
        .catch(() => {});
    };

    // 在 script 部分添加 computed 导入
    const uploadHeaders = computed(() => {
      return {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      };
    });

    return {
      book,
      dialogVisible,
      bookForm,
      formRef,
      rules,
      editBook,
      confirmDelete,
      handleUploadSuccess,
      beforeImageUpload,
      submitForm,
      beforeClose,
      uploadHeaders,
    };
  }
};
</script>
