<template>
  <div class="guide-cooperation">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">导游合作</h1>
      <p class="subtitle">筛选和对接合适的导游，建立合作关系</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="filter-header">
        <div class="filter-title">
          <i class="el-icon-filter"></i>
          <span>筛选条件</span>
        </div>
        <div class="filter-actions">
          <el-button type="primary" @click="searchGuides">
            <i class="el-icon-search"></i>
            搜索
          </el-button>
          <el-button @click="resetFilters">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </div>
      </div>
      
      <div class="filter-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-search"></i>
                <span>搜索关键词</span>
              </div>
              <el-input
                v-model="filters.keyword"
                placeholder="请输入导游姓名或专长"
                prefix-icon="el-icon-search"
                clearable>
              </el-input>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-location"></i>
                <span>服务地区</span>
              </div>
              <el-select v-model="filters.location" placeholder="请选择服务地区" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="北京" value="beijing"></el-option>
                <el-option label="上海" value="shanghai"></el-option>
                <el-option label="广州" value="guangzhou"></el-option>
                <el-option label="深圳" value="shenzhen"></el-option>
                <el-option label="成都" value="chengdu"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-chat-line-round"></i>
                <span>语言能力</span>
              </div>
              <el-select v-model="filters.language" placeholder="请选择语言能力" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="中文" value="chinese"></el-option>
                <el-option label="英语" value="english"></el-option>
                <el-option label="日语" value="japanese"></el-option>
                <el-option label="韩语" value="korean"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-medal"></i>
                <span>经验等级</span>
              </div>
              <el-select v-model="filters.experience" placeholder="请选择经验等级" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="新手(1-2年)" value="junior"></el-option>
                <el-option label="中级(3-5年)" value="intermediate"></el-option>
                <el-option label="高级(5年以上)" value="senior"></el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 导游列表 -->
    <div class="guide-list" v-loading="loading">
      <el-row :gutter="20" v-if="filteredGuides.length > 0">
        <el-col :span="8" v-for="guide in filteredGuides" :key="guide.guideId">
          <el-card class="guide-card" shadow="hover">
            <div class="guide-header">
              <img :src="guide.avatar" class="guide-avatar" />
              <div class="guide-info">
                <h3 class="guide-name">{{ guide.realName }}</h3>
                <div class="guide-rating">
                  <el-rate v-model="guide.serviceScore" disabled show-score text-color="#ff9900"></el-rate>
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
                <span class="price">¥{{ guide.baseFee }}/天</span>
              </div>
            </div>
            
            <div class="guide-description">
              <p>{{ guide.bio }}</p>
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
      <div v-else-if="!loading" class="no-data">
        <el-empty description="暂无导游数据"></el-empty>
      </div>
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
            <h2>{{ selectedGuide.realName }}</h2>
            <div class="detail-rating">
              <el-rate v-model="selectedGuide.serviceScore" disabled show-score text-color="#ff9900"></el-rate>
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
                    <span class="price">¥{{ selectedGuide.baseFee }}/天</span>
                  </div>
                  <div class="info-item">
                    <span class="label">联系方式：</span>
                    <span>{{ selectedGuide.phone }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="服务评价" name="reviews">
            <div class="reviews-section">
              <div v-for="review in selectedGuide.reviews" :key="review.reviewId" class="review-item">
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
              <div v-for="caseItem in selectedGuide.cases" :key="caseItem.caseId" class="case-item">
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
            <el-radio :label="1">独家合作</el-radio>
            <el-radio :label="2">合作伙伴</el-radio>
            <el-radio :label="3">项目合作</el-radio>
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
          <el-input type="textarea" v-model="cooperationRequest.conditions" :rows="3" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input type="textarea" v-model="cooperationRequest.notes" :rows="2" resize="none" class="fixed-textarea"></el-input>
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
import axios from 'axios'

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
        type: 2, // 1-独家合作，2-合作伙伴，3-项目合作
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
      guides: [],
      loading: false,
      // API基础URL
      apiBaseUrl: '/travel-admin'
    }
  },
  computed: {
    filteredGuides() {
      let filtered = this.guides;
      
      // 关键词筛选
      if (this.filters.keyword) {
        const keyword = this.filters.keyword.toLowerCase();
        filtered = filtered.filter(guide => 
          guide.realName.toLowerCase().includes(keyword) ||
          guide.specialties.some(specialty => specialty.toLowerCase().includes(keyword)) ||
          guide.bio.toLowerCase().includes(keyword)
        );
      }
      
      // 地区筛选
      if (this.filters.location) {
        const locationMap = {
          'beijing': '北京',
          'shanghai': '上海',
          'guangzhou': '广州',
          'shenzhen': '深圳',
          'chengdu': '成都'
        };
        const targetLocation = locationMap[this.filters.location];
        filtered = filtered.filter(guide => 
          guide.location === targetLocation
        );
      }
      
      // 语言筛选
      if (this.filters.language) {
        const languageMap = {
          'chinese': '中文',
          'english': '英语',
          'japanese': '日语',
          'korean': '韩语'
        };
        const targetLanguage = languageMap[this.filters.language];
        filtered = filtered.filter(guide => 
          guide.languages.includes(targetLanguage)
        );
      }
      
      // 经验筛选
      if (this.filters.experience) {
        filtered = filtered.filter(guide => {
          switch (this.filters.experience) {
            case 'junior':
              return guide.experience >= 1 && guide.experience <= 2;
            case 'intermediate':
              return guide.experience >= 3 && guide.experience <= 5;
            case 'senior':
              return guide.experience > 5;
            default:
              return true;
          }
        });
      }
      
      return filtered;
    }
  },
  mounted() {
    this.loadGuides();
  },
  methods: {
    // 加载导游列表
    async loadGuides() {
      this.loading = true;
      try {
        const response = await axios.get(`${this.apiBaseUrl}/guideCooperation/searchGuides`, {
          params: {
            page: this.pagination.currentPage,
            size: this.pagination.pageSize,
            keyword: this.filters.keyword,
            location: this.filters.location,
            language: this.filters.language,
            experience: this.filters.experience
          },
          headers: {
            'X-Merchant-Id': 30001 // 模拟旅行商ID
          }
        });
        
        if (response.data.code === 1) {
          this.guides = response.data.data.guides || [];
          this.pagination.total = response.data.data.total || 0;
        } else {
          this.$message.error(response.data.msg || '加载导游列表失败');
        }
      } catch (error) {
        console.error('加载导游列表失败:', error);
        this.$message.error('加载导游列表失败，请稍后重试');
        // 如果API调用失败，使用模拟数据
        this.loadMockGuides();
      } finally {
        this.loading = false;
      }
    },

    // 加载模拟数据（作为备用）
    loadMockGuides() {
      this.guides = [
        {
          guideId: 1,
          realName: '张明',
          avatar: '/src/assets/logo/logo1.jpg',
          serviceScore: 4.8,
          location: '北京',
          specialties: ['历史文化', '古建筑', '博物馆'],
          languages: ['中文', '英语'],
          experience: 5,
          serviceCount: 156,
          baseFee: 500,
          bio: '专业的历史文化导游，对北京的历史文化有深入了解，服务热情周到。',
          phone: '138****1234',
          qualificationStatus: 1,
          reviews: [
            {
              reviewId: 1,
              reviewerName: '李女士',
              rating: 5,
              date: '2024-01-15',
              content: '张导非常专业，讲解详细，服务态度很好！'
            }
          ],
          cases: [
            {
              caseId: 1,
              title: '故宫深度游',
              description: '为游客提供故宫深度游览服务，讲解明清历史',
              images: ['/src/assets/images/travel.jpg', '/src/assets/images/travel2.jpg']
            }
          ]
        },
        {
          guideId: 2,
          realName: '李小红',
          avatar: '/src/assets/logo/logo4.png',
          serviceScore: 4.6,
          location: '上海',
          specialties: ['现代都市', '购物', '美食'],
          languages: ['中文', '日语'],
          experience: 3,
          serviceCount: 89,
          baseFee: 400,
          bio: '熟悉上海各大商圈和美食，能够为游客提供优质的购物和美食体验。',
          phone: '139****5678',
          qualificationStatus: 1
        },
        {
          guideId: 3,
          realName: '王强',
          avatar: '/src/assets/logo/test.png',
          serviceScore: 4.9,
          location: '广州',
          specialties: ['自然风光', '户外运动', '摄影'],
          languages: ['中文', '英语', '韩语'],
          experience: 7,
          serviceCount: 234,
          baseFee: 600,
          bio: '专业的户外导游，熟悉各种户外运动，能够为游客提供安全有趣的户外体验。',
          phone: '137****9012',
          qualificationStatus: 1
        },
        {
          guideId: 4,
          realName: '陈美丽',
          avatar: '/src/assets/logo/logo1.jpg',
          serviceScore: 4.7,
          location: '深圳',
          specialties: ['科技园区', '主题公园', '购物'],
          languages: ['中文', '英语'],
          experience: 2,
          serviceCount: 89,
          baseFee: 350,
          bio: '深圳本地导游，熟悉各大科技园区和主题公园，服务热情周到。',
          phone: '136****3456',
          qualificationStatus: 1
        },
        {
          guideId: 5,
          realName: '刘建国',
          avatar: '/src/assets/logo/logo4.png',
          serviceScore: 4.5,
          location: '成都',
          specialties: ['美食文化', '古建筑', '茶馆文化'],
          languages: ['中文', '日语'],
          experience: 4,
          serviceCount: 156,
          baseFee: 450,
          bio: '成都资深导游，对川菜文化和古建筑有深入研究，能够为游客提供深度的文化体验。',
          phone: '135****7890',
          qualificationStatus: 1
        },
        {
          guideId: 6,
          realName: '赵敏',
          avatar: '/src/assets/logo/test.png',
          serviceScore: 4.8,
          location: '北京',
          specialties: ['胡同文化', '传统手工艺', '京剧'],
          languages: ['中文', '英语', '韩语'],
          experience: 6,
          serviceCount: 198,
          baseFee: 550,
          bio: '北京胡同文化专家，熟悉传统手工艺和京剧文化，能够为游客提供独特的文化体验。',
          phone: '134****2468',
          qualificationStatus: 1
        }
      ];
      this.pagination.total = this.guides.length;
    },
    
    searchGuides() {
      this.pagination.currentPage = 1;
      this.loadGuides();
    },
    
    resetFilters() {
      this.filters = {
        keyword: '',
        location: '',
        language: '',
        experience: ''
      };
      this.searchGuides();
    },
    
    async viewGuideProfile(guide) {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/guideCooperation/guideDetail/${guide.guideId}`);
        if (response.data.code === 1) {
          this.selectedGuide = response.data.data;
        } else {
          this.selectedGuide = guide; // 使用列表中的数据作为备用
        }
      } catch (error) {
        console.error('获取导游详情失败:', error);
        this.selectedGuide = guide; // 使用列表中的数据作为备用
      }
      this.showGuideDialog = true;
      this.activeTab = 'basic';
    },
    
    sendCooperationRequest(guide) {
      this.selectedGuide = guide;
      this.cooperationRequest = {
        type: 2, // 1-独家合作，2-合作伙伴，3-项目合作
        projects: [],
        duration: [],
        conditions: '',
        notes: ''
      };
      this.showCooperationDialog = true;
    },
    
    async submitCooperationRequest() {
      if (!this.selectedGuide) {
        this.$message.error('请选择导游');
        return;
      }
      
      if (this.cooperationRequest.projects.length === 0) {
        this.$message.error('请选择合作项目');
        return;
      }
      
      if (!this.cooperationRequest.duration || this.cooperationRequest.duration.length !== 2) {
        this.$message.error('请选择合作期限');
        return;
      }
      
      try {
        const requestData = {
          guideId: this.selectedGuide.guideId,
          cooperationType: this.cooperationRequest.type,
          projectIds: this.cooperationRequest.projects,
          startDate: this.cooperationRequest.duration[0],
          endDate: this.cooperationRequest.duration[1],
          conditions: this.cooperationRequest.conditions,
          notes: this.cooperationRequest.notes
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/guideCooperation/sendCooperationRequest`, 
          requestData, {
          headers: {
            'X-Merchant-Id': 30001, // 模拟旅行商ID
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.code === 1) {
          this.$message.success('合作邀请发送成功！');
          this.showCooperationDialog = false;
        } else {
          this.$message.error(response.data.msg || '发送合作邀请失败');
        }
      } catch (error) {
        console.error('发送合作邀请失败:', error);
        this.$message.error('发送合作邀请失败，请稍后重试');
      }
    },
    
    previewImage(image) {
      // 图片预览逻辑
      console.log('预览图片:', image);
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.loadGuides();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.loadGuides();
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
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

.filter-actions .el-button {
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

.filter-actions .el-button--primary {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.filter-actions .el-button--primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.filter-actions .el-button:not(.el-button--primary) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.filter-actions .el-button:not(.el-button--primary):hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.filter-content {
  padding: 24px;
  background: #fafbfc;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.filter-item .el-select,
.filter-item .el-input {
  width: 100%;
}

.filter-item .el-input__inner,
.filter-item .el-select .el-input__inner {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.filter-item .el-input__inner:focus,
.filter-item .el-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.filter-item .el-input__inner:hover,
.filter-item .el-select .el-input__inner:hover {
  border-color: #c0c4cc;
  background: white;
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
