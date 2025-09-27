<template>
  <div class="product-audit-page">
    <div class="product-audit-slider">
      <!-- 筛选和统计 -->
      <div class="top-bar">
        <div class="filter-section">
          <el-select 
            v-model="selectedStatus" 
            placeholder="筛选审核状态" 
            clearable 
            style="width: 240px; margin-right: 30px; margin-left: 40px;"
            @change="filterProducts"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="已通过" value="approved"></el-option>
            <el-option label="已驳回" value="rejected"></el-option>
          </el-select>
          <el-input 
            v-model="searchKey" 
            placeholder="搜索产品名称/ID" 
            clearable 
            style="width: 240px;"
            @keyup.enter="filterProducts"
          ></el-input>
        </div>
        <div class="status-count">
          <div class="count-item">
            <span class="count pending-count">{{ pendingCount }}</span>
            <span class="label">待审核</span>
          </div>
          <div class="count-item">
            <span class="count approved-count">{{ approvedCount }}</span>
            <span class="label">已通过</span>
          </div>
          <div class="count-item">
            <span class="count rejected-count">{{ rejectedCount }}</span>
            <span class="label">已驳回</span>
          </div>
        </div>
      </div>

      <!-- 滑动窗口容器 -->
      <div class="slider-container">
        <div class="slider-content" ref="sliderContent">
          <div v-if="filteredProductList.length === 0" class="empty-tip">
            暂无符合条件的产品
          </div>
          
          <div 
            class="audit-card" 
            v-for="(product, index) in filteredProductList" 
            :key="product.id"
            :class="{ active: currentIndex === index }"
          >
            <div class="card-header">
              <span class="product-id">ID: {{ product.id }}</span>
              <el-tag 
                :type="product.status === 'pending' ? 'warning' : (product.status === 'approved' ? 'success' : 'danger')"
                size="medium"
              >
                {{ product.status === 'pending' ? '待审核' : (product.status === 'approved' ? '已通过' : '已驳回') }}
              </el-tag>
            </div>

            <div class="card-media">
              <el-carousel height="250px" indicator-position="outside">
                <el-carousel-item v-for="(img, imgIdx) in product.imgs" :key="imgIdx">
                  <img :src="img" alt="产品图片" class="media-img">
                </el-carousel-item>
              </el-carousel>
            </div>

            <div class="card-detail">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="detail-row">
                <span class="label">产品类型：</span>
                <span class="value">{{ product.type }}</span>
              </div>
              <div class="detail-row">
                <span class="label">提交时间：</span>
                <span class="value">{{ product.submitTime }}</span>
              </div>
              <div class="detail-row">
                <span class="label">提交人：</span>
                <span class="value">{{ product.submitter }}</span>
              </div>
              <div class="detail-row">
                <span class="label">产品描述：</span>
                <span class="value desc-value">{{ product.desc }}</span>
              </div>
            </div>

            <!-- 审核操作区 -->
            <div class="card-actions">
              <el-button type="text" @click="handleViewFullDetail(product)">查看完整详情</el-button>
              <template v-if="product.status === 'pending'">
                <el-button type="warning" size="small" @click="handleReject(product)">驳回</el-button>
                <el-button type="primary" size="small" @click="handleApprove(product)">通过</el-button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="slider-control">
        <el-button 
          icon="el-icon-arrow-left" 
          type="text" 
          class="control-btn left-btn"
          :disabled="currentIndex <= 0"
          @click="switchProduct(currentIndex - 1)"
        ></el-button>
        <el-button 
          icon="el-icon-arrow-right" 
          type="text" 
          class="control-btn right-btn"
          :disabled="currentIndex >= filteredProductList.length - 1"
          @click="switchProduct(currentIndex + 1)"
        ></el-button>
      </div>

      <div class="slider-indicator">
        <span class="current-page">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total-page">{{ filteredProductList.length }}</span>
      </div>
    </div>

    <!-- 驳回弹窗 -->
    <el-dialog title="驳回产品审核" :visible.sync="rejectDialogVisible" width="450px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm" label-width="100px">
        <el-form-item label="产品名称" disabled>
          <el-input v-model="rejectForm.productName"></el-input>
        </el-form-item>
        <el-form-item label="驳回理由" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            rows="4"
            placeholder="请详细说明驳回原因"
          ></el-input>
        </el-form-item>
        <el-form-item label="驳回类型（可选）">
          <el-select v-model="rejectForm.type" placeholder="选择驳回类型">
            <el-option label="内容违规" value="content_illegal"></el-option>
            <el-option label="信息不全" value="info_incomplete"></el-option>
            <el-option label="价格异常" value="price_abnormal"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProductAuditSlider',
  data() {
    return {
      productList: [
        {
          id: 1001,
          name: '长沙十日游（含张家界+凤凰古城）',
          type: '国内长线游',
          submitTime: '2024-05-10 09:30:22',
          submitter: '张三（商家ID: 8001）',
          status: 'pending',
          imgs: [
            require('@/assets/images/travel.jpg'),
            require('@/assets/images/travel2.jpg'),
            require('@/assets/images/travel3.jpg')
          ],
          desc: '全程四星酒店住宿，含24小时导游服务，包含张家界国家森林公园、凤凰古城、橘子洲头核心景点门票，纯玩无购物'
        },
        {
          id: 1002,
          name: '三亚5日度假游（海景房+蜈支洲岛）',
          type: '国内短途游',
          submitTime: '2024-05-09 16:45:10',
          submitter: '李四（商家ID: 8002）',
          status: 'pending',
          imgs: [
            require('@/assets/images/travel4.jpg'),
            require('@/assets/images/travel5.jpg')
          ],
          desc: '亚龙湾海景双床房3晚，含蜈支洲岛门票+往返船票，赠送海鲜大餐1次，24小时接送机服务'
        },
        {
          id: 1003,
          name: '泰国曼谷+普吉岛7日游',
          type: '境外游',
          submitTime: '2024-05-08 11:20:35',
          submitter: '王五（商家ID: 8003）',
          status: 'approved',
          imgs: [
            require('@/assets/images/travel.jpg'),
            require('@/assets/images/travel2.jpg'),
            require('@/assets/images/travel3.jpg')
          ],
          desc: '含往返国际机票+落地签服务，全程五星酒店，含大皇宫、玉佛寺、普吉岛出海浮潜等景点，含中文导游'
        },
        {
          id: 1004,
          name: '西安古都3日游（兵马俑+华山）',
          type: '国内短途游',
          submitTime: '2024-05-07 14:10:05',
          submitter: '赵六（商家ID: 8004）',
          status: 'rejected',
          imgs: [
            require('@/assets/images/travel5.jpg'),
            require('@/assets/images/travel.jpg')
          ],
          desc: '含兵马俑、华山西峰索道、大雁塔景点门票，经济型酒店住宿，不含往返交通'
        }
      ],
      selectedStatus: 'pending',
      searchKey: '',
      filteredProductList: [],
      currentIndex: 0,
      rejectDialogVisible: false,
      rejectForm: {
        productName: '',
        reason: '',
        type: ''
      },
      rejectRules: {
        reason: [{ required: true, message: '请填写驳回理由', trigger: 'blur' }]
      },
      currentProduct: null
    }
  },
  computed: {
    pendingCount() {
      return this.productList.filter(item => item.status === 'pending').length;
    },
    approvedCount() {
      return this.productList.filter(item => item.status === 'approved').length;
    },
    rejectedCount() {
      return this.productList.filter(item => item.status === 'rejected').length;
    }
  },
  mounted() {
    this.filterProducts();
    window.addEventListener('resize', this.adjustSliderPosition);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.adjustSliderPosition);
  },
  methods: {
    filterProducts() {
      let result = [...this.productList];
      if (this.selectedStatus) {
        result = result.filter(item => item.status === this.selectedStatus);
      }
      if (this.searchKey) {
        const key = this.searchKey.trim().toLowerCase();
        result = result.filter(item => 
          item.id.toString().includes(key) || 
          item.name.toLowerCase().includes(key)
        );
      }
      this.filteredProductList = result;
      this.currentIndex = result.length > 0 ? 0 : -1;
      this.adjustSliderPosition();
    },

    switchProduct(targetIndex) {
      if (targetIndex < 0 || targetIndex >= this.filteredProductList.length) return;
      this.currentIndex = targetIndex;
      this.adjustSliderPosition();
    },

    adjustSliderPosition() {
      if (this.filteredProductList.length === 0 || !this.$refs.sliderContent) return;
      const sliderContent = this.$refs.sliderContent;
      const cards = sliderContent.querySelectorAll('.audit-card');
      if (cards.length === 0) return;
      
      const cardWidth = cards[0].offsetWidth;
      const containerWidth = sliderContent.parentElement.offsetWidth;
      const scrollLeft = this.currentIndex * cardWidth - (containerWidth - cardWidth) / 2;
      
      sliderContent.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    },

    handleApprove(product) {
      this.$confirm(`确定要通过“${product.name}”的审核吗？`, '审核确认', {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        type: 'success'
      }).then(() => {
        product.status = 'approved';
        this.$message.success(`“${product.name}”审核通过！`);
        this.filterProducts();
      }).catch(() => {});
    },

    handleReject(product) {
      this.currentProduct = product;
      this.rejectForm.productName = product.name;
      this.rejectForm.reason = '';
      this.rejectForm.type = '';
      this.rejectDialogVisible = true;
    },

    confirmReject() {
      this.$refs.rejectForm.validate((isValid) => {
        if (isValid) {
          this.currentProduct.status = 'rejected';
          this.rejectDialogVisible = false;
          this.$message.success(`“${this.currentProduct.name}”已驳回，理由已同步给提交者`);
          this.filterProducts();
        }
      });
    },

    handleViewFullDetail(product) {
      this.$router.push(`/product/audit/detail/${product.id}`);
    }
  }
}
</script>

<style scoped>
.product-audit-slider {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 120px);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap; /* 小屏时自动换行 */
  gap: 16px; /* 元素间距 */
}

.status-count {
  display: flex;
  gap: 24px;
  flex-wrap: wrap; /* 小屏时自动换行 */
}

.count-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  font-size: 18px;
  font-weight: 600;
}

.pending-count { color: #faad14; }
.approved-count { color: #8caf7a; }
.rejected-count { color: #dd1e21; }

.label {
  font-size: 14px;
  color: #666;
}

.slider-container {
  position: relative;
  margin: 0 20px; /* 缩小左右边距，适配小屏 */
  overflow: hidden;
  min-height: 620px; /* 最小高度，小屏时可自适应 */
  height: auto; /* 高度随内容自适应 */
}

.slider-content {
  display: flex;
  gap: 24px;
  height: auto; /* 内容高度自适应 */
  padding: 10px 0 20px; /* 底部内边距，防止按钮被遮挡 */
  transition: transform 0.3s ease;
}

.empty-tip {
  width: 100%;
  min-height: 620px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 16px;
}

.audit-card {
  flex: 1 1 580px; /* 卡片宽度自适应，最小580px */
  min-height: 580px; /* 最小高度，保证内容不压缩 */
  height: auto; /* 高度随内容自适应 */
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex; /* 开启flex，让按钮区固定在底部 */
  flex-direction: column; /* 子元素垂直排列 */
}
/* 鼠标放上面变成紫色 */
.audit-card:hover {
  border-color: purple;
}

.audit-card.active {
  border-color: #8f18ff;
  box-shadow: 0 10px 20px rgba(24, 144, 255, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
    }
  
  .product-id {
    font-size: 14px;
    color: #666;
  }
  
  .card-media {
    margin-bottom: 16px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0; /* 防止图片区域被压缩 */
  }
  
  .media-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-detail {
    margin-bottom: 16px;
    font-size: 14px;
    flex-grow: 1; /* 让详情区域自动填充剩余空间 */
  }
  
  .product-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 8px;
    line-height: 1.5;
    flex-wrap: wrap; /* 小屏时标签和内容自动换行 */
  }
  
  .detail-row .label {
    flex: 0 0 100px;
    color: #999;
    margin-right: 8px;
  }
  
  .detail-row .value {
    color: #666;
    word-break: break-all; /* 长文本自动换行，避免溢出 */
    flex: 1; /* 内容区占满剩余宽度 */
  }
  
  .desc-value {
    max-height: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  /* 按钮区：自适应排列，确保任何屏幕都完全显示 */
  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f5f5f5;
    gap: 12px; /* 按钮间距，防止拥挤 */
    margin-top: auto; /* 固定在卡片底部 */
    /* flex-shrink: 0; 禁止按钮区被压缩 
    flex-wrap: wrap; 小屏时自动换行  */
    
  }
  
  .card-actions .el-button {
    flex: 1; /* 按钮均分宽度 */
    min-width: 110px; /* 最小触控宽度，适配手机点击 */
    max-width: none; /* 取消最大宽度限制 */
    margin: 0;
    padding: 8px 12px;
    white-space: nowrap; /* 按钮文字不换行 */
  }
  
  /* 滑动控制按钮 */
  .slider-control {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    margin-top: 24px;
  }
  
  .control-btn {
    font-size: 24px;
    color: #999;
    transition: color 0.3s ease;
    padding: 8px 16px; /* 增大点击区域，适配触屏 */
  }
  
  .control-btn:hover:not(:disabled) {
    color: #1890ff;
  }
  
  .control-btn:disabled {
    color: #e5e5e5;
    cursor: not-allowed;
  }
  
  /* 页码指示器 */
  .slider-indicator {
    text-align: center;
    margin-top: 16px;
    font-size: 20px;
    color: #666;
    padding-bottom: 20px; /* 底部留白，避免贴边 */
  }
  
  .separator {
    margin: 0 8px;
    color: #ccc;
  }
  
  .current-page {
    font-weight: 600;
    color: #1890ff;
  }
  
  /* 响应式适配：平板（768px~1024px） */
  @media (max-width: 1024px) {
    .audit-card {
      flex: 1 1 450px; /* 缩小卡片基础宽度 */
    }
    
    .top-bar {
      padding: 0 10px;
    }
    
    .filter-section {
      display: flex;
      flex-wrap: wrap;
      gap: 16px; /* 筛选组件换行后间距 */
    }
    
    .el-select, .el-input {
      margin-left: 0 !important; /* 取消左侧固定边距 */
    }
  }
  
  /* 响应式适配：手机（≤768px） */
  @media (max-width: 768px) {
    .product-audit-slider {
      padding: 10px; /* 缩小整体内边距 */
    }
    
    .top-bar {
      flex-direction: column;
      align-items: stretch; /* 筛选区和统计区占满宽度 */
    }
    
    .status-count {
      width: 100%;
      justify-content: space-around; /* 统计项均匀分布 */
      margin-top: 12px;
    }
    
    .slider-container {
      margin: 0 10px; /* 缩小滑动容器边距 */
      min-height: auto; /* 取消最小高度，完全自适应 */
    }
    
    .audit-card {
      flex: 1 1 calc(100% - 20px); /* 卡片占满屏幕宽度（减去内边距） */
      min-height: auto;
    }
    
    .card-media {
      height: 200px; /* 缩小图片区域高度 */
    }
    
    .el-carousel {
      height: 200px !important; /* 覆盖element-ui轮播图高度 */
    }
    
    .card-actions {
      flex-direction: column; /* 按钮垂直排列 */
      align-items: stretch; /* 按钮占满宽度 */
    }
    
    .empty-tip {
      min-height: 400px; /* 缩小空状态高度 */
      font-size: 14px;
    }
    
    .slider-indicator {
      font-size: 16px;
    }
    
    /* 弹窗适配小屏 */
    .el-dialog {
      width: 90% !important; /* 弹窗占满屏幕90%宽度 */
      margin: 0 auto;
    }
  }
  
  /* 极端小屏适配（≤375px，如iPhone SE） */
  @media (max-width: 375px) {
    .status-count {
      gap: 12px; /* 缩小统计项间距 */
    }
    
    .count {
      font-size: 16px;
    }
    
    .label {
      font-size: 12px;
    }
    
    .card-detail .label {
      flex: 0 0 80px; /* 缩小详情标签宽度 */
    }
    
    .card-actions .el-button {
      padding: 6px 8px; /* 缩小按钮内边距 */
      font-size: 12px;
    }
  }
</style>