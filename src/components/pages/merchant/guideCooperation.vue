<template>
  <div class="guide-cooperation">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">导游合作</h1>
      <p class="subtitle">筛选和对接合适的导游，建立合作关系</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索导游姓名或专长"
            prefix-icon="el-icon-search"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.location" placeholder="服务地区" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="北京" value="beijing"></el-option>
            <el-option label="上海" value="shanghai"></el-option>
            <el-option label="广州" value="guangzhou"></el-option>
            <el-option label="深圳" value="shenzhen"></el-option>
            <el-option label="成都" value="chengdu"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.language" placeholder="语言能力" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="中文" value="chinese"></el-option>
            <el-option label="英语" value="english"></el-option>
            <el-option label="日语" value="japanese"></el-option>
            <el-option label="韩语" value="korean"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.experience" placeholder="经验等级" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="新手(1-2年)" value="junior"></el-option>
            <el-option label="中级(3-5年)" value="intermediate"></el-option>
            <el-option label="高级(5年以上)" value="senior"></el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="searchGuides">搜索</el-button>
        </el-col>
        <el-col :span="3">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 导游列表 -->
    <div class="guide-list">
      <el-row :gutter="20">
        <el-col :span="8" v-for="guide in filteredGuides" :key="guide.id">
          <el-card class="guide-card" shadow="hover">
            <div class="guide-header">
              <img :src="guide.avatar" class="guide-avatar" />
              <div class="guide-info">
                <h3 class="guide-name">{{ guide.name }}</h3>
                <div class="guide-rating">
                  <el-rate v-model="guide.rating" disabled show-score text-color="#ff9900"></el-rate>
                </div>
                <div class="guide-location">
                  <i class="el-icon-location"></i> {{ guide.location }}
                </div>
              </div>
            </div>
            
            <div class="guide-details">
              <div class="detail-item">
                <span class="label">专长领域：</span>
                <el-tag
                  v-for="specialty in guide.specialties"
                  :key="specialty"
                  size="mini"
                  class="specialty-tag">
                  {{ specialty }}
                </el-tag>
              </div>
              
              <div class="detail-item">
                <span class="label">语言能力：</span>
                <el-tag
                  v-for="language in guide.languages"
                  :key="language"
                  size="mini"
                  type="success">
                  {{ language }}
                </el-tag>
              </div>
              
              <div class="detail-item">
                <span class="label">服务经验：</span>
                <span>{{ guide.experience }}年</span>
              </div>
              
              <div class="detail-item">
                <span class="label">服务次数：</span>
                <span>{{ guide.serviceCount }}次</span>
              </div>
              
              <div class="detail-item">
                <span class="label">服务价格：</span>
                <span class="price">¥{{ guide.price }}/天</span>
              </div>
            </div>
            
            <div class="guide-description">
              <p>{{ guide.description }}</p>
            </div>
            
            <div class="guide-actions">
              <el-button size="small" @click="viewGuideProfile(guide)">查看详情</el-button>
              <el-button size="small" type="primary" @click="sendCooperationRequest(guide)">
                发送合作邀请
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[9, 18, 36]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 导游详情对话框 -->
    <el-dialog title="导游详情" :visible.sync="showGuideDialog" width="800px">
      <div v-if="selectedGuide" class="guide-detail">
        <div class="detail-header">
          <img :src="selectedGuide.avatar" class="detail-avatar" />
          <div class="detail-info">
            <h2>{{ selectedGuide.name }}</h2>
            <div class="detail-rating">
              <el-rate v-model="selectedGuide.rating" disabled show-score text-color="#ff9900"></el-rate>
            </div>
            <p class="detail-location">
              <i class="el-icon-location"></i> {{ selectedGuide.location }}
            </p>
          </div>
        </div>
        
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="detail-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">专长领域：</span>
                    <el-tag
                      v-for="specialty in selectedGuide.specialties"
                      :key="specialty"
                      size="small"
                      class="specialty-tag">
                      {{ specialty }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">语言能力：</span>
                    <el-tag
                      v-for="language in selectedGuide.languages"
                      :key="language"
                      size="small"
                      type="success">
                      {{ language }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">服务经验：</span>
                    <span>{{ selectedGuide.experience }}年</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">服务次数：</span>
                    <span>{{ selectedGuide.serviceCount }}次</span>
                  </div>
                  <div class="info-item">
                    <span class="label">服务价格：</span>
                    <span class="price">¥{{ selectedGuide.price }}/天</span>
                  </div>
                  <div class="info-item">
                    <span class="label">联系方式：</span>
                    <span>{{ selectedGuide.contact }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="服务评价" name="reviews">
            <div class="reviews-section">
              <div v-for="review in selectedGuide.reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <span class="reviewer-name">{{ review.reviewerName }}</span>
                  <el-rate v-model="review.rating" disabled size="small"></el-rate>
                  <span class="review-date">{{ review.date }}</span>
                </div>
                <p class="review-content">{{ review.content }}</p>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="服务案例" name="cases">
            <div class="cases-section">
              <div v-for="caseItem in selectedGuide.cases" :key="caseItem.id" class="case-item">
                <h4>{{ caseItem.title }}</h4>
                <p>{{ caseItem.description }}</p>
                <div class="case-images">
                  <img
                    v-for="image in caseItem.images"
                    :key="image"
                    :src="image"
                    class="case-image"
                    @click="previewImage(image)"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showGuideDialog = false">关闭</el-button>
        <el-button type="primary" @click="sendCooperationRequest(selectedGuide)">
          发送合作邀请
        </el-button>
      </div>
    </el-dialog>

    <!-- 合作邀请对话框 -->
    <el-dialog title="发送合作邀请" :visible.sync="showCooperationDialog" width="600px">
      <el-form :model="cooperationRequest" label-width="100px">
        <el-form-item label="合作类型">
          <el-radio-group v-model="cooperationRequest.type">
            <el-radio label="exclusive">独家合作</el-radio>
            <el-radio label="partnership">合作伙伴</el-radio>
            <el-radio label="project">项目合作</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="合作项目">
          <el-select v-model="cooperationRequest.projects" multiple placeholder="选择相关产品">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="合作期限">
          <el-date-picker
            v-model="cooperationRequest.duration"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="合作条件">
          <el-input type="textarea" v-model="cooperationRequest.conditions" :rows="3"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input type="textarea" v-model="cooperationRequest.notes" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCooperationDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCooperationRequest">发送邀请</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GuideCooperation',
  data() {
    return {
      filters: {
        keyword: '',
        location: '',
        language: '',
        experience: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 9,
        total: 0
      },
      showGuideDialog: false,
      showCooperationDialog: false,
      selectedGuide: null,
      activeTab: 'basic',
      cooperationRequest: {
        type: 'partnership',
        projects: [],
        duration: [],
        conditions: '',
        notes: ''
      },
      products: [
        { id: 1, name: '豪华海景套房' },
        { id: 2, name: '三亚三日游' },
        { id: 3, name: '故宫门票' }
      ],
      guides: [
        {
          id: 1,
          name: '张明',
          avatar: '/src/assets/logo/logo1.jpg',
          rating: 4.8,
          location: '北京',
          specialties: ['历史文化', '古建筑', '博物馆'],
          languages: ['中文', '英语'],
          experience: 5,
          serviceCount: 156,
          price: 500,
          description: '专业的历史文化导游，对北京的历史文化有深入了解，服务热情周到。',
          contact: '138****1234',
          reviews: [
            {
              id: 1,
              reviewerName: '李女士',
              rating: 5,
              date: '2024-01-15',
              content: '张导非常专业，讲解详细，服务态度很好！'
            },
            {
              id: 2,
              reviewerName: '王先生',
              rating: 4,
              date: '2024-01-10',
              content: '对历史文化的讲解很深入，学到了很多知识。'
            }
          ],
          cases: [
            {
              id: 1,
              title: '故宫深度游',
              description: '为游客提供故宫深度游览服务，讲解明清历史',
              images: ['/src/assets/images/travel.jpg', '/src/assets/images/travel2.jpg']
            }
          ]
        },
        {
          id: 2,
          name: '李小红',
          avatar: '/src/assets/logo/logo4.png',
          rating: 4.6,
          location: '上海',
          specialties: ['现代都市', '购物', '美食'],
          languages: ['中文', '日语'],
          experience: 3,
          serviceCount: 89,
          price: 400,
          description: '熟悉上海各大商圈和美食，能够为游客提供优质的购物和美食体验。',
          contact: '139****5678',
          reviews: [
            {
              id: 1,
              reviewerName: '陈女士',
              rating: 5,
              date: '2024-01-12',
              content: '李导带我们去了很多好吃的餐厅，购物也很方便！'
            }
          ],
          cases: [
            {
              id: 1,
              title: '上海美食之旅',
              description: '带领游客体验上海特色美食',
              images: ['/src/assets/images/travel3.jpg']
            }
          ]
        },
        {
          id: 3,
          name: '王强',
          avatar: '/src/assets/logo/test.png',
          rating: 4.9,
          location: '广州',
          specialties: ['自然风光', '户外运动', '摄影'],
          languages: ['中文', '英语', '韩语'],
          experience: 7,
          serviceCount: 234,
          price: 600,
          description: '专业的户外导游，熟悉各种户外运动，能够为游客提供安全有趣的户外体验。',
          contact: '137****9012',
          reviews: [
            {
              id: 1,
              reviewerName: '刘先生',
              rating: 5,
              date: '2024-01-08',
              content: '王导的户外经验很丰富，安全措施做得很好！'
            }
          ],
          cases: [
            {
              id: 1,
              title: '白云山徒步',
              description: '组织游客进行白云山徒步活动',
              images: ['/src/assets/images/travel4.jpg', '/src/assets/images/travel5.jpg']
            }
          ]
        }
      ]
    }
  },
  computed: {
    filteredGuides() {
      let filtered = this.guides;
      
      if (this.filters.keyword) {
        filtered = filtered.filter(guide => 
          guide.name.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
          guide.specialties.some(s => s.toLowerCase().includes(this.filters.keyword.toLowerCase()))
        );
      }
      
      if (this.filters.location) {
        filtered = filtered.filter(guide => guide.location === this.filters.location);
      }
      
      if (this.filters.language) {
        filtered = filtered.filter(guide => guide.languages.includes(this.filters.language));
      }
      
      if (this.filters.experience) {
        const experienceMap = {
          junior: guide => guide.experience >= 1 && guide.experience <= 2,
          intermediate: guide => guide.experience >= 3 && guide.experience <= 5,
          senior: guide => guide.experience > 5
        };
        filtered = filtered.filter(experienceMap[this.filters.experience]);
      }
      
      return filtered;
    }
  },
  watch: {
    filteredGuides: {
      handler(newVal) {
        this.pagination.total = newVal.length;
      },
      immediate: true
    }
  },
  methods: {
    searchGuides() {
      // 搜索逻辑已在computed中实现
    },
    
    resetFilters() {
      this.filters = {
        keyword: '',
        location: '',
        language: '',
        experience: ''
      };
    },
    
    viewGuideProfile(guide) {
      this.selectedGuide = guide;
      this.showGuideDialog = true;
      this.activeTab = 'basic';
    },
    
    sendCooperationRequest(guide) {
      this.selectedGuide = guide;
      this.showCooperationDialog = true;
    },
    
    submitCooperationRequest() {
      this.$message.success('合作邀请发送成功！');
      this.showCooperationDialog = false;
    },
    
    previewImage(image) {
      // 图片预览逻辑
      console.log('预览图片:', image);
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
.guide-cooperation {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin: 0;
}

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.guide-list {
  margin-bottom: 20px;
}

.guide-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.guide-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.guide-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.guide-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.guide-info {
  flex: 1;
}

.guide-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.guide-rating {
  margin-bottom: 5px;
}

.guide-location {
  color: #666;
  font-size: 14px;
}

.guide-details {
  margin-bottom: 15px;
}

.detail-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.label {
  font-weight: 500;
  margin-right: 8px;
  min-width: 80px;
}

.specialty-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.price {
  font-weight: bold;
  color: #e6a23c;
}

.guide-description {
  margin-bottom: 15px;
}

.guide-description p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.guide-actions {
  text-align: right;
}

.guide-actions .el-button {
  margin-left: 10px;
}

.pagination {
  text-align: center;
}

.guide-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.detail-info h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.detail-rating {
  margin-bottom: 10px;
}

.detail-location {
  color: #666;
  margin: 0;
}

.detail-content {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.reviews-section {
  padding: 20px 0;
}

.review-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer-name {
  font-weight: 500;
  margin-right: 15px;
}

.review-date {
  margin-left: auto;
  color: #666;
  font-size: 14px;
}

.review-content {
  color: #333;
  line-height: 1.5;
  margin: 0;
}

.cases-section {
  padding: 20px 0;
}

.case-item {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.case-item h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.case-item p {
  color: #666;
  margin-bottom: 15px;
}

.case-images {
  display: flex;
  gap: 10px;
}

.case-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.case-image:hover {
  transform: scale(1.05);
}

.dialog-footer {
  text-align: right;
}
</style>
