<template>
  <div class="my-collection-container" v-loading="loading">
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
              <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in pagedCollections" :key="item.collectId || item.productId">
                <el-card class="collection-card" shadow="hover" @click.native="viewDetail(item)">
                  <div class="card-image-container">
                    <img :src="item.imageUrl" :alt="item.title" class="card-image">
                    <div class="card-type-badge" v-if="item.type" :class="item.type">{{ getTypeLabel(item.type) }}</div>
                    <div class="card-actions">
                      <el-button 
                        type="text" 
                        icon="el-icon-delete" 
                        @click.stop="removeCollection(item.productId)"
                        class="delete-btn"
                      ></el-button>
                    </div>
                  </div>
                  <div class="card-body">
                    <h3 class="card-title">{{ item.title }}</h3>
                    <div class="card-meta">
                      <div class="rating" v-if="item.rating != null">
                        <i class="el-icon-star-on"></i>
                        <span>{{ item.rating }}</span>
                      </div>
                      <div class="location" v-if="item.location"><i class="el-icon-map-marker"></i> {{ item.location }}</div>
                    </div>
                    <p class="card-description" v-if="item.description">{{ item.description }}</p>
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
              :data="pagedCollections" 
              style="width: 100%"
              highlight-current-row
              @row-click="viewDetail"
            >
              <el-table-column prop="productId" label="产品ID" width="100" align="center"></el-table-column>
              <el-table-column prop="title" label="标题" width="220"></el-table-column>
              <el-table-column prop="type" label="类型" width="100" align="center">
                <template slot-scope="scope">
                  <span v-if="scope.row.type" :class="'type-tag ' + scope.row.type">{{ getTypeLabel(scope.row.type) }}</span>
                  <span v-else>—</span>
                </template>
              </el-table-column>
              <el-table-column prop="location" label="地点" width="150">
                <template slot-scope="scope">
                  {{ scope.row.location || '—' }}
                </template>
              </el-table-column>
              <el-table-column prop="rating" label="评分" width="100" align="center">
                <template slot-scope="scope">
                  <div class="table-rating" v-if="scope.row.rating != null">
                    <i class="el-icon-star-on"></i>
                    <span>{{ scope.row.rating }}</span>
                  </div>
                  <span v-else>—</span>
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
                    @click.stop="removeCollection(scope.row.productId)"
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
      // 后端 userCollection 原始数据：{ collectId, userId, productId, collectTime }
      collections: [],
      // 视图展示数据：合并产品详情后的条目
      viewItems: [],
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
      let result = [...this.viewItems];

      // 类型筛选（后端未提供类型，此处可能来自产品标签；如无则忽略）
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
          result.sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity));
          break;
      }

      return result;
    },
    pagedCollections() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredCollections.slice(start, start + this.pageSize);
    }
  },
  mounted() {
    this.loadCollections();
  },
  methods: {
    isSuccess(res) {
      if (!res) return false;
      const code = res.code;
      const success = res.success;
      return success === true || code === 1 || code === 200;
    },
    // 统一解包 Result
    unwrapResult(resp) {
      // axios: resp = { data: { code, msg, data } }
      if (resp && resp.data && typeof resp.data === 'object' && 'code' in resp.data) {
        return resp.data;
      }
      // 已被拦截器解包: resp = { code,msg,data }
      if (resp && typeof resp === 'object' && 'code' in resp) {
        return resp;
      }
      // 兜底：当网关或代理直接回原始数据
      return { code: 1, data: resp, msg: '' };
    },

    async loadCollections() {
      this.loading = true;
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          // 未登录则展示空态，不反复打扰
          this.viewItems = [];
          this.collections = [];
          return;
        }

        // 1) 拉取收藏列表
        const listResp = await request({
          url: '/travel-portal/userCollection/list',
          method: 'get',
          params: { userId }
        });
        const listResult = this.unwrapResult(listResp);
        if (!this.isSuccess(listResult)) {
          throw new Error(listResult.msg || '加载收藏失败');
        }
        const rawList = Array.isArray(listResult.data) ? listResult.data : [];
        this.collections = rawList;

        // 2) 并发拉取产品详情并合并
        const uniqueProductIds = [...new Set(rawList.map(x => x.productId).filter(Boolean))];

        const detailPromises = uniqueProductIds.map(pid =>
          request({
            url: `/travel-portal/tourProduct/getProductDetail/${pid}`,
            method: 'get'
          }).then(this.unwrapResult).catch(() => ({ code: 0, data: null }))
        );

        const detailResults = await Promise.all(detailPromises);
        const productById = {};
        uniqueProductIds.forEach((pid, idx) => {
          const r = detailResults[idx];
          if (r && r.code === 1 && r.data) {
            productById[pid] = r.data;
          }
        });

        // 3) 组装展示条目
        this.viewItems = rawList.map(x => {
          const p = productById[x.productId] || {};
          const img = this.pickFirstImage(p.imgUrls);
          return {
            collectId: x.collectId,
            userId: x.userId,
            productId: x.productId,
            collectTime: x.collectTime,

            // 展示字段（根据后端 VO 字段适配）
            title: p.productName || `产品 #${x.productId}`,
            imageUrl: img,
            description: p.description || '',
            // rating/location 后端未给出，保留可选
            rating: null,
            location: '',
            // 类型：如需根据标签映射，这里示例简单从第一个 tag 推测
            type: this.inferTypeFromTags(p.productTags)
          };
        });

        this.$message.success('收藏列表加载成功');
      } catch (error) {
        this.$message.error('收藏列表加载失败');
        // eslint-disable-next-line no-console
        console.error('加载收藏失败:', error);
      } finally {
        this.loading = false;
      }
    },

    getCurrentUserId() {
      try {
        const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } };
        const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || null;
        const info = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'));
        if (info) {
          const id = pickId(info);
          if (id) return Number(id);
        }
        const storedId = localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId');
        if (storedId) return Number(storedId);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token && token.includes('.')) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && (payload.userId || payload.sub)) return Number(payload.userId || payload.sub);
          } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
      return null;
    },

    // LocalDateTime 兼容（去掉 Z）
    nowLocalDateTimeString() {
      const iso = new Date().toISOString();           // 2025-09-30T12:34:56.789Z
      return iso.slice(0, 19);                        // 2025-09-30T12:34:56
    },

    async removeCollection(productId) {
      try {
        const userId = this.getCurrentUserId();
        const resp = await request({
          url: '/travel-portal/userCollection/remove',
          method: 'delete',
          params: { userId, productId }
        });
        const result = this.unwrapResult(resp);
        if (result.code === 1) {
          this.$message.success('取消收藏成功');
          this.loadCollections();
        } else {
          throw new Error(result.msg || '取消收藏失败');
        }
      } catch (error) {
        this.$message.error('取消收藏失败');
        // eslint-disable-next-line no-console
        console.error('取消收藏失败:', error);
      }
    },

    async addCollection(productId) {
      try {
        const userId = this.getCurrentUserId();
        const resp = await request({
          url: '/travel-portal/userCollection/add',
          method: 'post',
          data: {
            userId,
            productId,
            collectTime: this.nowLocalDateTimeString()
          }
        });
        const result = this.unwrapResult(resp);
        if (result.code === 1) {
          this.$message.success('收藏成功');
          this.loadCollections();
        } else {
          throw new Error(result.msg || '收藏失败');
        }
      } catch (error) {
        this.$message.error('收藏失败');
        // eslint-disable-next-line no-console
        console.error('收藏失败:', error);
      }
    },

    // 简单从产品标签映射类型（按需调整）
    inferTypeFromTags(tags) {
      if (!tags) return '';
      const t = String(tags).toLowerCase();
      if (t.includes('hotel')) return 'hotel';
      if (t.includes('restaurant')) return 'restaurant';
      if (t.includes('attraction') || t.includes('scenic')) return 'attraction';
      return '';
    },

    pickFirstImage(imgUrls) {
      if (!imgUrls) return '';
      if (Array.isArray(imgUrls)) return imgUrls[0] || '';
      // 可能是逗号分隔或 JSON 字符串
      try {
        const parsed = JSON.parse(imgUrls);
        if (Array.isArray(parsed)) return parsed[0] || '';
      } catch (e) {
        // ignore
      }
      const parts = String(imgUrls).split(/[,\s|]+/).filter(Boolean);
      return parts[0] || '';
    },

    getTypeLabel(type) {
      const typeMap = {
        attraction: '景点',
        hotel: '酒店',
        restaurant: '餐厅',
        plan: '旅行计划'
      };
      return typeMap[type] || type || '其他';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // 兼容后端 LocalDateTime 字符串
        const safe = new Date(dateString.replace(' ', 'T'));
        if (!isNaN(safe.getTime())) return safe.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        return String(dateString);
      }
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    },

    viewDetail(item) {
      if (!item || !item.productId) return;
      this.$router.push({
        path: '/traveller/order',
        query: { productId: String(item.productId) }
      });
    },

    goExplore() {
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