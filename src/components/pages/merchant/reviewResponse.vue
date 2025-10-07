<template>
  <div class="review-response">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="title">评价回应</h1>
          <p class="subtitle">查看和回复游客评价，管理客户反馈</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-edit" @click="batchReply">批量回复</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportReviews">导出评价</el-button>
        </div>
      </div>
    </div>

    <!-- 评价统计 -->
    <div class="stats-panel">
      <el-card class="stats-card">
        <div slot="header" class="stats-header">
          <i class="el-icon-data-line"></i>
          <span>评价统计概览</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon total">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalReviews }}</div>
                <div class="stat-label">总评价数</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+15%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon average">
                <i class="el-icon-trophy"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.averageRating }}</div>
                <div class="stat-label">平均评分</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+0.2</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon positive">
                <i class="el-icon-thumb"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.positiveReviews }}</div>
                <div class="stat-label">好评数</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+8%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon negative">
                <i class="el-icon-warning"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.negativeReviews }}</div>
                <div class="stat-label">差评数</div>
                <div class="stat-trend">
                  <i class="el-icon-bottom"></i>
                  <span>-12%</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <div class="filter-container">
          <div class="filter-header">
            <div class="filter-title">
              <i class="el-icon-filter"></i>
              <span>筛选条件</span>
            </div>
            <div class="filter-actions">
              <el-button type="primary" class="search-btn" @click="searchReviews">
                <i class="el-icon-search"></i>
                搜索
              </el-button>
              <el-button class="reset-btn" @click="resetFilters">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </div>
          </div>
          
          <div class="filter-content">
            <div class="filter-row">
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-star-on"></i>
                  <span>评分筛选</span>
                </div>
                <el-select v-model="filters.rating" placeholder="请选择评分" clearable class="filter-select">
                  <el-option label="全部评分" value=""></el-option>
                  <el-option label="5星" value="5">
                    <span style="float: left">5星</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">非常满意</span>
                  </el-option>
                  <el-option label="4星" value="4">
                    <span style="float: left">4星</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">满意</span>
                  </el-option>
                  <el-option label="3星" value="3">
                    <span style="float: left">3星</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">一般</span>
                  </el-option>
                  <el-option label="2星" value="2">
                    <span style="float: left">2星</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">不满意</span>
                  </el-option>
                  <el-option label="1星" value="1">
                    <span style="float: left">1星</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">非常不满意</span>
                  </el-option>
                </el-select>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-s-order"></i>
                  <span>回复状态</span>
                </div>
                <el-select v-model="filters.status" placeholder="请选择回复状态" clearable class="filter-select">
                  <el-option label="全部状态" value=""></el-option>
                  <el-option label="已回复" value="replied">
                    <span style="float: left">已回复</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">已完成回复</span>
                  </el-option>
                  <el-option label="未回复" value="unreplied">
                    <span style="float: left">未回复</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">待回复</span>
                  </el-option>
                  <el-option label="需跟进" value="follow_up">
                    <span style="float: left">需跟进</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">需要处理</span>
                  </el-option>
                </el-select>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-goods"></i>
                  <span>产品类型</span>
                </div>
                <el-select v-model="filters.productType" placeholder="请选择产品类型" clearable class="filter-select">
                  <el-option label="全部类型" value=""></el-option>
                  <el-option label="酒店客房" value="hotel">
                    <span style="float: left">酒店客房</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">住宿服务</span>
                  </el-option>
                  <el-option label="旅行路线" value="route">
                    <span style="float: left">旅行路线</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">旅游套餐</span>
                  </el-option>
                  <el-option label="门票" value="ticket">
                    <span style="float: left">门票</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">景点门票</span>
                  </el-option>
                </el-select>
              </div>
              
              <div class="filter-item date-filter-item">
                <div class="filter-label">
                  <i class="el-icon-date"></i>
                  <span>评价时间</span>
                </div>
                <el-date-picker
                  v-model="filters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="filter-date-picker"
                  style="width: 100%; min-width: 320px;">
                </el-date-picker>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-search"></i>
                  <span>关键词搜索</span>
                </div>
                <el-input
                  v-model="filters.keyword"
                  placeholder="搜索客户姓名或评价内容"
                  prefix-icon="el-icon-search"
                  clearable
                  class="filter-input">
                </el-input>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 评价列表 -->
    <div class="review-list">
      <el-card class="list-card">
        <div slot="header" class="list-header">
          <div class="list-title">
            <i class="el-icon-list"></i>
            <span>评价列表</span>
          </div>
          <div class="list-actions">
            <el-button size="small" icon="el-icon-refresh" @click="refreshReviews">刷新</el-button>
            <el-button size="small" icon="el-icon-download" @click="exportReviews">导出</el-button>
          </div>
        </div>
        
        <el-table :data="filteredReviews" v-loading="loading" stripe @selection-change="handleSelectionChange" class="review-table" :header-cell-style="{ textAlign: 'center' }" :cell-style="{ textAlign: 'center' }">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column prop="customerName" label="客户" width="120" align="center">
            <template slot-scope="scope">
              <div class="customer-info">
                <el-image :src="scope.row.customerAvatar" class="customer-avatar" fit="cover">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-user"></i>
                  </div>
                </el-image>
                <div class="customer-details">
                  <div class="customer-name">{{ scope.row.customerName }}</div>
                  <div class="customer-level">
                    <el-tag :type="getLevelTagType(scope.row.customerLevel)" size="mini">
                      {{ getLevelName(scope.row.customerLevel) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="产品" min-width="200" align="center">
            <template slot-scope="scope">
              <div class="product-info">
                <el-image :src="scope.row.productImage" class="product-image" fit="cover">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <div class="product-details">
                  <div class="product-name">{{ scope.row.productName }}</div>
                  <div class="product-type">
                    <el-tag :type="getTypeTagType(scope.row.productType)" size="mini">
                      {{ getTypeName(scope.row.productType) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="rating" label="评分" width="120" align="center">
            <template slot-scope="scope">
              <div class="rating-section">
                <el-rate v-model="scope.row.rating" disabled show-score text-color="#ff9900"></el-rate>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="评价内容" min-width="300" align="center">
            <template slot-scope="scope">
              <div class="review-content">
                <p class="content-text">{{ scope.row.content }}</p>
                <div v-if="scope.row.images && scope.row.images.length" class="review-images">
                  <img
                    v-for="image in scope.row.images"
                    :key="image"
                    :src="image"
                    class="review-image"
                    @click="previewImage(image)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="reviewTime" label="评价时间" width="180" align="center">
            <template slot-scope="scope">
              <span class="review-time">{{ scope.row.reviewTime }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="replyStatus" label="回复状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getReplyStatusTagType(scope.row.replyStatus)" size="mini">
                {{ getReplyStatusName(scope.row.replyStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button size="mini" @click="viewReviewDetail(scope.row)">详情</el-button>
                <el-button 
                  size="mini" 
                  type="primary" 
                  v-if="scope.row.replyStatus === 'unreplied'"
                  @click="replyReview(scope.row)">
                  回复
                </el-button>
                <el-button 
                  size="mini" 
                  type="warning" 
                  v-if="scope.row.replyStatus === 'replied'"
                  @click="editReply(scope.row)">
                  编辑回复
                </el-button>
                <el-button 
                  size="mini" 
                  type="info" 
                  v-if="scope.row.rating <= 3"
                  @click="markFollowUp(scope.row)">
                  标记跟进
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 评价详情对话框 -->
    <el-dialog title="评价详情" :visible.sync="showReviewDialog" width="800px">
      <div v-if="selectedReview" class="review-detail">
        <div class="review-header">
          <div class="customer-section">
            <img :src="selectedReview.customerAvatar" class="customer-avatar-large" />
            <div class="customer-info-large">
              <h3>{{ selectedReview.customerName }}</h3>
              <div class="customer-meta">
                <el-tag :type="getLevelTagType(selectedReview.customerLevel)">
                  {{ getLevelName(selectedReview.customerLevel) }}
                </el-tag>
                <span class="review-time">{{ selectedReview.reviewTime }}</span>
              </div>
            </div>
          </div>
          <div class="rating-section-large">
            <el-rate v-model="selectedReview.rating" disabled show-score text-color="#ff9900"></el-rate>
          </div>
        </div>
        
        <div class="product-section">
          <h4>评价产品</h4>
          <div class="product-detail">
            <img :src="selectedReview.productImage" class="product-image-large" />
            <div class="product-info-large">
              <h5>{{ selectedReview.productName }}</h5>
              <p>{{ selectedReview.productDescription }}</p>
              <el-tag :type="getTypeTagType(selectedReview.productType)">
                {{ getTypeName(selectedReview.productType) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <h4>评价内容</h4>
          <div class="review-content-large">
            <p>{{ selectedReview.content }}</p>
            <div v-if="selectedReview.images && selectedReview.images.length" class="review-images-large">
              <img
                v-for="image in selectedReview.images"
                :key="image"
                :src="image"
                class="review-image-large"
                @click="previewImage(image)"
              />
            </div>
          </div>
        </div>
        
        <div class="reply-section" v-if="selectedReview.reply">
          <h4>商家回复</h4>
          <div class="reply-content">
            <p>{{ selectedReview.reply.content }}</p>
            <div class="reply-meta">
              <span class="reply-time">回复时间：{{ selectedReview.reply.time }}</span>
              <span class="reply-staff">回复人：{{ selectedReview.reply.staffName }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showReviewDialog = false">关闭</el-button>
        <el-button type="primary" @click="replyReview(selectedReview)">回复评价</el-button>
      </div>
    </el-dialog>

    <!-- 回复评价对话框 -->
    <el-dialog title="回复评价" :visible.sync="showReplyDialog" width="600px">
      <el-form :model="replyForm" label-width="100px">
        <el-form-item label="回复内容">
          <el-input type="textarea" v-model="replyForm.content" :rows="6" placeholder="请输入回复内容" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
        
        <el-form-item label="回复类型">
          <el-radio-group v-model="replyForm.type">
            <el-radio label="thank">感谢评价</el-radio>
            <el-radio label="apology">道歉说明</el-radio>
            <el-radio label="explanation">情况说明</el-radio>
            <el-radio label="improvement">改进措施</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="是否公开">
          <el-switch v-model="replyForm.isPublic"></el-switch>
          <span class="switch-text">公开回复将显示在评价下方</span>
        </el-form-item>
        
        <el-form-item label="内部备注">
          <el-input type="textarea" v-model="replyForm.internalNotes" :rows="3" placeholder="内部备注，不会显示给客户" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showReplyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReply">确定回复</el-button>
      </div>
    </el-dialog>

    <!-- 批量回复对话框 -->
    <el-dialog title="批量回复" :visible.sync="showBatchReplyDialog" width="600px">
      <el-form :model="batchReplyForm" label-width="100px">
        <el-form-item label="回复模板">
          <el-select v-model="batchReplyForm.template" placeholder="选择回复模板">
            <el-option label="感谢好评" value="thank_positive"></el-option>
            <el-option label="感谢中评" value="thank_medium"></el-option>
            <el-option label="道歉差评" value="apology_negative"></el-option>
            <el-option label="通用回复" value="general"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="回复内容" v-if="batchReplyForm.template === 'custom'">
          <el-input type="textarea" v-model="batchReplyForm.content" :rows="6" placeholder="请输入回复内容" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
        
        <el-form-item label="选择评价">
          <div class="selected-reviews">
            <el-tag
              v-for="review in selectedReviews"
              :key="review.id"
              closable
              @close="removeSelectedReview(review)"
              class="review-tag">
              {{ review.customerName }} - {{ review.productName }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBatchReplyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitBatchReply">确定回复</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ReviewResponse',
  data() {
    return {
      loading: false,
      showReviewDialog: false,
      showReplyDialog: false,
      showBatchReplyDialog: false,
      selectedReview: null,
      selectedReviews: [],
      filters: {
        rating: '',
        status: '',
        productType: '',
        dateRange: [],
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      replyForm: {
        content: '',
        type: 'thank',
        isPublic: true,
        internalNotes: ''
      },
      batchReplyForm: {
        template: '',
        content: ''
      },
      stats: {
        totalReviews: 156,
        averageRating: 4.6,
        positiveReviews: 128,
        negativeReviews: 8
      },
      reviews: [
        {
          id: 1,
          customerName: '张三',
          customerAvatar: '/src/assets/logo/logo1.jpg',
          customerLevel: 'vip',
          productName: '豪华海景套房',
          productType: 'hotel',
          productImage: '/src/assets/images/travel.jpg',
          productDescription: '面朝大海的豪华套房，享受无敌海景',
          rating: 5,
          content: '酒店环境非常好，海景房视野开阔，服务也很周到。房间设施齐全，卫生条件很好。早餐品种丰富，味道不错。下次还会选择这里！',
          images: ['/src/assets/images/travel2.jpg', '/src/assets/images/travel3.jpg'],
          reviewTime: '2024-01-15 10:30:00',
          replyStatus: 'replied',
          reply: {
            content: '感谢您的五星好评！很高兴您对我们的服务满意。我们会继续努力，为您提供更好的住宿体验。期待您的再次光临！',
            time: '2024-01-15 14:20:00',
            staffName: '酒店经理'
          }
        },
        {
          id: 2,
          customerName: '李四',
          customerAvatar: '/src/assets/logo/logo4.png',
          customerLevel: 'regular',
          productName: '三亚三日游',
          productType: 'route',
          productImage: '/src/assets/images/travel2.jpg',
          productDescription: '经典三亚三日游，包含主要景点',
          rating: 4,
          content: '整体行程安排不错，导游很专业，景点选择也很好。就是有些景点停留时间有点短，希望能多安排一些时间。',
          images: [],
          reviewTime: '2024-01-12 16:45:00',
          replyStatus: 'replied',
          reply: {
            content: '感谢您的反馈！我们会根据您的建议调整行程安排，增加景点的停留时间，让您有更充分的游览体验。',
            time: '2024-01-12 18:30:00',
            staffName: '行程规划师'
          }
        },
        {
          id: 3,
          customerName: '王五',
          customerAvatar: '/src/assets/logo/test.png',
          customerLevel: 'new',
          productName: '故宫门票',
          productType: 'ticket',
          productImage: '/src/assets/images/travel3.jpg',
          productDescription: '故宫博物院门票，感受皇家文化',
          rating: 2,
          content: '门票价格有点贵，而且人太多了，排队时间很长。景区内有些地方在维修，影响了游览体验。',
          images: [],
          reviewTime: '2024-01-10 09:15:00',
          replyStatus: 'follow_up',
          reply: null
        },
        {
          id: 4,
          customerName: '赵六',
          customerAvatar: '/src/assets/logo/logo1.jpg',
          customerLevel: 'vip',
          productName: '豪华海景套房',
          productType: 'hotel',
          productImage: '/src/assets/images/travel4.jpg',
          productDescription: '面朝大海的豪华套房，享受无敌海景',
          rating: 5,
          content: '非常满意的一次住宿体验！房间干净整洁，海景非常美，服务人员态度很好。',
          images: ['/src/assets/images/travel5.jpg'],
          reviewTime: '2024-01-08 20:30:00',
          replyStatus: 'unreplied',
          reply: null
        }
      ]
    }
  },
  computed: {
    filteredReviews() {
      let filtered = this.reviews;
      
      if (this.filters.rating) {
        filtered = filtered.filter(review => review.rating === parseInt(this.filters.rating));
      }
      
      if (this.filters.status) {
        filtered = filtered.filter(review => review.replyStatus === this.filters.status);
      }
      
      if (this.filters.productType) {
        filtered = filtered.filter(review => review.productType === this.filters.productType);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(review => 
          review.customerName.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
          review.content.toLowerCase().includes(this.filters.keyword.toLowerCase())
        );
      }
      
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        const startDate = new Date(this.filters.dateRange[0]);
        const endDate = new Date(this.filters.dateRange[1]);
        filtered = filtered.filter(review => {
          const reviewDate = new Date(review.reviewTime);
          return reviewDate >= startDate && reviewDate <= endDate;
        });
      }
      
      return filtered;
    }
  },
  watch: {
    filteredReviews: {
      handler(newVal) {
        this.pagination.total = newVal.length;
      },
      immediate: true
    }
  },
  methods: {
    exportReviews() {
      this.$message.success('评价数据导出成功');
    },
    
    refreshReviews() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.$message.success('数据刷新成功');
      }, 1000);
    },
    
    searchReviews() {
      // 搜索逻辑已在computed中实现
    },
    
    resetFilters() {
      this.filters = {
        rating: '',
        status: '',
        productType: '',
        dateRange: [],
        keyword: ''
      };
    },
    
    getTypeName(type) {
      const typeMap = {
        hotel: '酒店客房',
        route: '旅行路线',
        ticket: '门票'
      };
      return typeMap[type] || type;
    },
    
    getTypeTagType(type) {
      const typeMap = {
        hotel: 'primary',
        route: 'success',
        ticket: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getLevelName(level) {
      const levelMap = {
        vip: 'VIP客户',
        regular: '普通客户',
        new: '新客户'
      };
      return levelMap[level] || level;
    },
    
    getLevelTagType(level) {
      const typeMap = {
        vip: 'danger',
        regular: 'primary',
        new: 'success'
      };
      return typeMap[level] || 'info';
    },
    
    getReplyStatusName(status) {
      const statusMap = {
        replied: '已回复',
        unreplied: '未回复',
        follow_up: '需跟进'
      };
      return statusMap[status] || status;
    },
    
    getReplyStatusTagType(status) {
      const statusMap = {
        replied: 'success',
        unreplied: 'warning',
        follow_up: 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    handleSelectionChange(selection) {
      this.selectedReviews = selection;
    },
    
    viewReviewDetail(review) {
      this.selectedReview = review;
      this.showReviewDialog = true;
    },
    
    replyReview(review) {
      this.selectedReview = review;
      this.replyForm = {
        content: '',
        type: 'thank',
        isPublic: true,
        internalNotes: ''
      };
      this.showReplyDialog = true;
    },
    
    editReply(review) {
      this.selectedReview = review;
      this.replyForm = {
        content: review.reply.content,
        type: 'thank',
        isPublic: true,
        internalNotes: ''
      };
      this.showReplyDialog = true;
    },
    
    submitReply() {
      const reply = {
        content: this.replyForm.content,
        time: new Date().toLocaleString(),
        staffName: '当前用户'
      };
      
      this.selectedReview.reply = reply;
      this.selectedReview.replyStatus = 'replied';
      
      this.showReplyDialog = false;
      this.$message.success('回复成功');
      this.resetReplyForm();
    },
    
    markFollowUp(review) {
      review.replyStatus = 'follow_up';
      this.$message.success('已标记为需跟进');
    },
    
    batchReply() {
      if (this.selectedReviews.length === 0) {
        this.$message.warning('请选择要回复的评价');
        return;
      }
      
      this.batchReplyForm = {
        template: '',
        content: ''
      };
      this.showBatchReplyDialog = true;
    },
    
    submitBatchReply() {
      this.$message.success(`已批量回复 ${this.selectedReviews.length} 条评价`);
      this.showBatchReplyDialog = false;
    },
    
    removeSelectedReview(review) {
      const index = this.selectedReviews.findIndex(r => r.id === review.id);
      if (index > -1) {
        this.selectedReviews.splice(index, 1);
      }
    },
    
    previewImage(image) {
      console.log('预览图片:', image);
    },
    
    resetReplyForm() {
      this.replyForm = {
        content: '',
        type: 'thank',
        isPublic: true,
        internalNotes: ''
      };
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    }
  }
}
</script>

<style scoped>
.review-response {
  padding: 24px;
  min-height: 100vh;
}


/* 页面标题 */
.page-header {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计面板 */
.stats-panel {
  margin-bottom: 24px;
}

.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.stats-header i {
  color: #3b82f6;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f2f5;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e1e6eb;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  border-radius: 12px;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.average {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.positive {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.negative {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon i {
  font-size: 24px;
  position: relative;
  z-index: 1;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend i {
  font-size: 12px;
}

.stat-trend .el-icon-top {
  color: #52c41a;
}

.stat-trend .el-icon-bottom {
  color: #ff4d4f;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

.filter-container {
  padding: 0;
}

.filter-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.search-btn,
.reset-btn {
  height: 40px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  padding: 0 20px;
  min-width: 100px;
}

.search-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.filter-content {
  padding: 24px;
  background: #fafbfc;
}

.filter-row {
  display: flex;
  gap: 16px;
  margin: 0;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  max-width: 280px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.filter-label i {
  color: #3b82f6;
  font-size: 16px;
}

.filter-select,
.filter-input,
.filter-date-picker {
  width: 100%;
}

.filter-select .el-input__inner,
.filter-input .el-input__inner,
.filter-date-picker .el-input__inner {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.filter-select .el-input__inner:focus,
.filter-input .el-input__inner:focus,
.filter-date-picker .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.filter-select .el-input__inner:hover,
.filter-input .el-input__inner:hover,
.filter-date-picker .el-input__inner:hover {
  border-color: #c0c4cc;
  background: white;
}

/* 日期选择器特殊样式 */
.date-filter-item {
  flex: 1.5 !important;
  min-width: 320px !important;
  max-width: 400px !important;
}

.filter-date-picker .el-range-editor {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  min-width: 320px !important;
}

.filter-date-picker .el-range-input {
  min-width: 120px !important;
  flex: 1;
}

.filter-date-picker .el-range-separator {
  padding: 0 16px !important;
  min-width: 32px !important;
  display: inline-block !important;
  text-align: center !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

/* 评价列表 */
.review-list {
  margin-bottom: 24px;
}

.list-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.list-title i {
  color: #3b82f6;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.review-table {
  border-radius: 8px;
  overflow: hidden;
}

.review-table .el-table th,
.review-table .el-table td {
  text-align: center !important;
  vertical-align: middle !important;
}

.customer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 16px;
}

.customer-details {
  flex: 1;
  text-align: left;
}

.customer-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #2c3e50;
}

.customer-level {
  margin-top: 4px;
}

.product-info {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
}

.product-details {
  flex: 1;
  text-align: left;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #2c3e50;
}

.product-type {
  margin-top: 4px;
}

.rating-section {
  text-align: center;
}

.review-content {
  max-width: 300px;
  text-align: left;
}

.content-text {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #2c3e50;
}

.review-images {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.review-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.review-image:hover {
  transform: scale(1.1);
}

.review-time {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-buttons .el-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  height: 28px;
  line-height: 1;
}

.action-buttons .el-button--primary {
  background: #1890ff;
  border-color: #1890ff;
}

.action-buttons .el-button--primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.action-buttons .el-button--warning {
  background: #faad14;
  border-color: #faad14;
}

.action-buttons .el-button--warning:hover {
  background: #ffc53d;
  border-color: #ffc53d;
}

.action-buttons .el-button--info {
  background: #13c2c2;
  border-color: #13c2c2;
}

.action-buttons .el-button--info:hover {
  background: #36cfc9;
  border-color: #36cfc9;
}

/* 分页 */
.pagination {
  text-align: center;
  margin-top: 24px;
}

.review-detail {
  padding: 20px 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.customer-section {
  display: flex;
  align-items: center;
}

.customer-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.customer-info-large h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.customer-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.review-time {
  color: #666;
  font-size: 14px;
}

.rating-section-large {
  text-align: right;
}

.product-section,
.content-section,
.reply-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.product-section:last-child,
.content-section:last-child,
.reply-section:last-child {
  border-bottom: none;
}

.product-section h4,
.content-section h4,
.reply-section h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.product-detail {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-image-large {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.product-info-large {
  flex: 1;
}

.product-info-large h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.product-info-large p {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.review-content-large {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.review-content-large p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #333;
}

.review-images-large {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.review-image-large {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.review-image-large:hover {
  transform: scale(1.05);
}

.reply-content {
  padding: 15px;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.reply-content p {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #333;
}

.reply-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.selected-reviews {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.review-tag {
  margin: 5px;
}

.switch-text {
  margin-left: 10px;
  color: #666;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}

/* 弹窗输入框固定大小和去掉右下角图标 */
.fixed-textarea .el-textarea__inner {
  resize: none !important;
  width: 100% !important;
  min-height: 80px !important;
  max-height: 80px !important;
}

.fixed-textarea .el-textarea__inner::-webkit-resizer {
  display: none !important;
}

/* 所有弹窗中的输入框 */
.el-dialog .el-input__inner,
.el-dialog .el-textarea__inner {
  width: 100% !important;
  resize: none !important;
}

.el-dialog .el-textarea__inner::-webkit-resizer {
  display: none !important;
}
</style>
