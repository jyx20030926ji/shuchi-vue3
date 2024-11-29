<template>
  <div class="books-page">
    <aside class="sidebar">
      <div class="category-header">
        <h3>图书分类</h3>
      </div>
      <el-menu
        class="category-menu"
        :default-active="currentCategory"
      >
        <el-menu-item index="all" @click="filterBooks('all')">
          <el-icon><Grid /></el-icon>
          <span>全部图书</span>
        </el-menu-item>
        <el-menu-item
          v-for="category in categories"
          :key="category.id"
          :index="category.id.toString()"
          @click="filterBooks(category.id)"
        >
          <el-icon><Collection /></el-icon>
          <span>{{ category.categoryName }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="main-content">
      <div class="toolbar">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索图书..."
            clearable
            :prefix-icon="Search"
            @keyup.enter="searchBooks"
          >
            <template #append>
              <el-button :icon="Search" @click="searchBooks" />
            </template>
          </el-input>
        </div>

        <div class="sort-box">
          <el-select v-model="selectedSort" @change="sortBooks" placeholder="排序方式">
            <el-option label="综合排序" value="popularity" />
            <el-option label="价格从低到高" value="priceAsc" />
            <el-option label="价格从高到低" value="priceDesc" />
          </el-select>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="!books.length" class="empty-state">
        <el-empty description="暂无图书" />
      </div>

      <div v-else class="book-grid">
        <BookCard 
          v-for="book in sortedBooks"
          :key="book.id"
          :book="book"
          class="book-item"
        />
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="booksPerPage"
          :total="totalBooks"
          layout="prev, pager, next, jumper"
          background
          @current-change="changePage"
        />
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { getCategories, getBooks } from '../api/bookApi.js';
import BookCard from '../components/BookCard.vue';
import { Search, Grid, Collection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'BooksPage',
  components: { 
    BookCard,
    Search,
    Grid,
    Collection
  },
  setup() {
    const categories = ref([]);
    const books = ref([]);
    const currentPage = ref(1);
    const booksPerPage = ref(8);
    const totalBooks = ref(0);
    const selectedSort = ref('popularity');
    const currentCategory = ref('all');  // 默认是显示全部商品
    const searchQuery = ref('');  // 用于存储搜索框的内容
    const loading = ref(false);  // 控制加载状态

    const fetchData = async () => {
      loading.value = true;  // 开始加载
      try {
        // 获取分类数据
        categories.value = await getCategories();

        // 获取图书数据，添加搜索参数
        const data = await getBooks({
          page: currentPage.value,
          pageSize: booksPerPage.value,
          currentCategorys: currentCategory.value,
          searchQuery: searchQuery.value ? searchQuery.value.trim() : ''  // 确保有值时才传递
        });

        books.value = data.pageList;
        totalBooks.value = data.total;  // 添加这行来更新总数
      } catch (error) {
        console.error('获取数据失败', error);
        ElMessage.error('获取数据失败');
      } finally {
        loading.value = false;  // 数据加载完成
      }
    };

    const filterBooks = (categoryId) => {
      currentCategory.value = categoryId;
      currentPage.value = 1;
      fetchData();
    };

    const sortBooks = () => {
      console.log('当前排序方式:', selectedSort.value);
    };

    const searchBooks = async () => {
      if (!searchQuery.value.trim()) {
        ElMessage.warning('请输入搜索关键词');
        return;
      }
      currentPage.value = 1;
      await fetchData();
    };

    const changePage = (newPage) => {
      if (newPage > 0 && newPage <= totalBooks.value) {
        currentPage.value = newPage;
        fetchData();
      }
    };

    // 监听搜索框输入
    watch(searchQuery, (newVal, oldVal) => {
      if (oldVal && !newVal.trim()) {
        // 只有当从有值变成空值时才触发
        currentPage.value = 1;
        fetchData();
      }
    }, { flush: 'post' });

    // 初始化时获取数据
    onMounted(() => {
      fetchData();
    });

    // 添加计算属性来处理排序后的图书列表
    const sortedBooks = computed(() => {
      if (!books.value) return [];
      
      // 克隆数组以避免直接修改原数组
      const sortedList = [...books.value];
      
      switch (selectedSort.value) {
        case 'priceAsc':  // 价格从低到高
          return sortedList.sort((a, b) => a.bookPrice - b.bookPrice);
        case 'priceDesc':  // 价格从高到低
          return sortedList.sort((a, b) => b.bookPrice - a.bookPrice);
        default:  // 默认排序（综合排序）
          return sortedList;
      }
    });

    return {
      categories,
      books,
      sortedBooks,
      currentPage,
      totalBooks,
      selectedSort,
      filterBooks,
      sortBooks,
      changePage,
      searchQuery,
      searchBooks,
      loading,
      Search,
      Grid,
      Collection,
      currentCategory
    };
  },
};
</script>

<style scoped>
.books-page {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.category-header {
  padding: 20px;
  background: #f6f6f6;
  border-bottom: 1px solid #ebeef5;
}

.category-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.category-menu {
  border: none;
}

.category-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 50px;
  padding: 0 20px;
  transition: all 0.3s;
}

.category-menu :deep(.el-menu-item.is-active) {
  background: #ecf5ff;
  color: #409EFF;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.search-box {
  flex: 1;
  max-width: 500px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.book-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.book-item:hover {
  transform: translateY(-4px);
}

.loading-state,
.empty-state {
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.pagination {
  margin-top: auto;
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .books-page {
    flex-direction: column;
    padding: 16px;
  }

  .sidebar {
    width: 100%;
  }

  .toolbar {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
