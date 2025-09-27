<template>
  <div class="my-collection-container">
    <!-- 顶部Banner -->
    <div class="banner-section">
      <div class="banner-content">
        <h1 class="banner-title">我的收藏</h1>
        <p class="banner-subtitle">记录您的旅行灵感与计划</p>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="selectedType" placeholder="筛选收藏类型" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="景点" value="attraction"></el-option>
              <el-option label="酒店" value="hotel"></el-option>
              <el-option label="餐厅" value="restaurant"></el-option>
              <el-option label="旅行计划" value="plan"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="selectedSort" placeholder="排序方式">
              <el-option label="最新收藏" value="newest"></el-option>
              <el-option label="最早收藏" value="oldest"></el-option>
              <el-option label="评分最高" value="rating"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6" :offset="6">
            <div class="view-toggle">
              <el-button 
                :type="viewMode === 'grid' ? 'primary' : 'default'" 
                icon="el-icon-s-grid" 
                @click="viewMode = 'grid'"
              ></el-button>
              <el-button 
                :type="viewMode === 'list' ? 'primary' : 'default'" 
                icon="el-icon-menu" 
                @click="viewMode = 'list'"
              ></el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 收藏内容区域 -->
      <div class="collection-content">
        <template v-if="filteredCollections.length > 0">
          <!-- 网格视图 -->
          <div class="grid-view" v-if="viewMode === 'grid'">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in filteredCollections" :key="item.id">
                <el-card class="collection-card" shadow="hover" @click.native="viewDetail(item)">
                  <div class="card-image-container">
                    <img :src="item.imageUrl" :alt="item.title" class="card-image">
                    <div class="card-type-badge" :class="item.type">{{ getTypeLabel(item.type) }}</div>
                    <div class="card-actions">
                      <el-button 
                        type="text" 
                        icon="el-icon-delete" 
                        @click.stop="removeCollection(item.id)"
                        class="delete-btn"
                      ></el-button>
                    </div>
                  </div>
                  <div class="card-body">
                    <h3 class="card-title">{{ item.title }}</h3>
                    <div class="card-meta">
                      <div class="rating">
                        <i class="el-icon-star-on"></i>
                        <span>{{ item.rating }}</span>
                      </div>
                      <div class="location"><i class="el-icon-map-marker"></i> {{ item.location }}</div>
                    </div>
                    <p class="card-description">{{ item.description }}</p>
                    <div class="card-footer">
                      <span class="collect-time">{{ formatDate(item.collectTime) }}</span>
                      <el-button 
                        type="primary" 
                        size="small" 
                        plain 
                        class="view-detail-btn"
                        @click.stop="viewDetail(item)"
                      >
                        查看详情
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 列表视图 -->
          <div class="list-view" v-else>
            <el-table 
              :data="filteredCollections" 
              style="width: 100%"
              highlight-current-row
              @row-click="viewDetail"
            >
              <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
              <el-table-column prop="title" label="标题" width="200"></el-table-column>
              <el-table-column prop="type" label="类型" width="100" align="center">
                <template slot-scope="scope">
                  <span :class="'type-tag ' + scope.row.type">{{ getTypeLabel(scope.row.type) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="location" label="地点" width="150"></el-table-column>
              <el-table-column prop="rating" label="评分" width="100" align="center">
                <template slot-scope="scope">
                  <div class="table-rating">
                    <i class="el-icon-star-on"></i>
                    <span>{{ scope.row.rating }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="collectTime" label="收藏时间" width="180" align="center">
                <template slot-scope="scope">
                  {{ formatDate(scope.row.collectTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-button 
                    type="danger" 
                    size="small" 
                    icon="el-icon-delete"
                    @click.stop="removeCollection(scope.row.id)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              layout="total, sizes, prev, pager, next, jumper"
               :total="filteredCollections.length"
               :page-sizes="[6, 12, 24, 48]"
               :page-size.sync="pageSize"
               :current-page.sync="currentPage"
            ></el-pagination>
          </div>
        </template>

        <!-- 空状态 -->
        <div class="empty-state" v-else>
          <el-empty description="暂无收藏内容" :image-size="120">
            <el-button type="primary" @click="goExplore">去探索</el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'myCollection',
  data() {
    return {
      collections: [],
      selectedType: '',
      selectedSort: 'newest',
      viewMode: 'grid',
      currentPage: 1,
      pageSize: 6,
      loading: false
    };
  },
  computed: {
    filteredCollections() {
      let result = [...this.collections];
      
      // 类型筛选
      if (this.selectedType) {
        result = result.filter(item => item.type === this.selectedType);
      }
      
      // 排序
      switch (this.selectedSort) {
        case 'newest':
          result.sort((a, b) => new Date(b.collectTime) - new Date(a.collectTime));
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.collectTime) - new Date(b.collectTime));
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
      }
      
      return result;
    }
  },
  mounted() {
    this.loadCollections();
  },
  methods: {
    async loadCollections() {
      this.loading = true;
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          this.$message.error('请先登录');
          return;
        }
        
        const response = await request({
          url: '/travel-portal/userCollection/list',
          method: 'get',
          params: {
            userId: userId
          }
        });
        
        // 处理响应数据
        if(response && response.data){
          this.collections = response.data;
        } else {
          this.collections = response;
        }
        this.$message.success('收藏列表加载成功');
      } catch (error) {
        this.$message.error('收藏列表加载失败');
        console.error('加载收藏失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    getCurrentUserId() {
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        return JSON.parse(userInfo).userId;
      }
      return null;
    },
    
    async removeCollection(collectionId) {
      try {
        const userId = this.getCurrentUserId();
        await request({
          url: '/travel-portal/userCollection/remove',
          method: 'delete',
          params: {
            userId: userId,
            productId: collectionId
          }
        });
        this.$message.success('取消收藏成功');
        this.loadCollections(); // 重新加载收藏列表
      } catch (error) {
        this.$message.error('取消收藏失败');
        console.error('取消收藏失败:', error);
      }
    },
    
    async addCollection(productId) {
      try {
        const userId = this.getCurrentUserId();
        await request({
          url: '/travel-portal/userCollection/add',
          method: 'post',
          data: {
            userId: userId,
            productId: productId,
            collectTime: new Date().toISOString()
          }
        });
        this.$message.success('收藏成功');
      } catch (error) {
        this.$message.error('收藏失败');
        console.error('收藏失败:', error);
      }
    },
    getTypeLabel(type) {
      const typeMap = {
        'attraction': '景点',
        'hotel': '酒店',
        'restaurant': '餐厅',
        'plan': '旅行计划'
      };
      return typeMap[type] || type;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    viewDetail(item) {
      // 这里可以跳转到详情页或显示详情弹窗
      this.$message(`查看${item.title}的详情`);
    },
    goExplore() {
      // 跳转到探索页面
      this.$router.push('/explore');
    }
  }
};
</script>

<style scoped>
.my-collection-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Banner样式 */
.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0;
  text-align: center;
  margin-bottom: 30px;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.banner-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* 主内容区 */
.main-content {
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle {
  display: flex;
  justify-content: flex-end;
}

.view-toggle .el-button {
  margin-left: 10px;
}

/* 收藏内容区域 */
.collection-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 网格视图 */
.grid-view {
  margin-bottom: 20px;
}

.collection-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.collection-card:hover .card-image {
  transform: scale(1.05);
}

.card-type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
}

.card-type-badge.attraction {
  background-color: #409eff;
}

.card-type-badge.hotel {
  background-color: #67c23a;
}

.card-type-badge.restaurant {
  background-color: #e6a23c;
}

.card-type-badge.plan {
  background-color: #f56c6c;
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.delete-btn {
  color: white !important;
  background-color: rgba(245, 108, 108, 0.8);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.rating {
  color: #e6a23c;
}

.location {
  color: #606266;
}

.card-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.collect-time {
  font-size: 12px;
  color: #909399;
}

.view-detail-btn {
  font-size: 12px;
}

/* 列表视图 */
.list-view {
  margin-bottom: 20px;
}

.type-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.type-tag.attraction {
  background-color: #409eff;
}

.type-tag.hotel {
  background-color: #67c23a;
}

.type-tag.restaurant {
  background-color: #e6a23c;
}

.type-tag.plan {
  background-color: #f56c6c;
}

.table-rating {
  color: #e6a23c;
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .filter-section {
    padding: 15px;
  }
  
  .el-col {
    margin-bottom: 15px;
  }
}
</style>