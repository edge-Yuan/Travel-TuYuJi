<template>
  <div class="self-plan-container">
    <div class="banner-section">
      <div class="banner-content">
        <h1 class="banner-title">探索世界，定制专属旅程</h1>
        <p class="banner-subtitle">根据您的偏好，智能生成最佳旅行方案</p>
      </div>
    </div>

    <el-row>
      <el-col :span="8" style="padding: 10px;">
        <div class="grid-content bg-purple">
          <el-card class="popular-destinations-card" shadow="hover">
            <div slot="header" class="card-header">
              <h3 class="card-title">热门目的地</h3>
            </div>
            <el-carousel :interval="5000" type="card" height="180px" indicator-position="none" class="destinations-carousel">
              <el-carousel-item v-for="dest in hotDestinations" :key="dest.id">
                <div class="destination-item" @click="selectDestination(dest.name)">
                  <img :src="dest.image" :alt="dest.name" class="dest-image" />
                  <div class="dest-info">
                    <h4 class="dest-name">{{ dest.name }}</h4>
                    <div class="dest-rating">
                      <i class="el-icon-star-on"></i>
                      <span>{{ dest.rating }}</span>
                    </div>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </el-card>

          <el-card class="help-card" shadow="hover">
            <div slot="header" class="card-header">
              <h3 class="card-title">使用指南</h3>
            </div>
            <div class="help-content">
              <div class="help-item">
                <div class="help-icon"><i class="el-icon-map-location"></i></div>
                <div class="help-text">输入旅行偏好，生成个性化路线</div>
              </div>
              <div class="help-item">
                <div class="help-icon"><i class="el-icon-user"></i></div>
                <div class="help-text">筛选条件，找到专业导游</div>
              </div>
              <div class="help-item">
                <div class="help-icon"><i class="el-icon-save"></i></div>
                <div class="help-text">保存路线到我的行程</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="grid-content bg-purple-light">
          <div style="margin-top: 8px;">
            <el-card class="main-card" shadow="hover">
              <div slot="header" class="main-card-header">
                <h2 class="plan-title">旅行规划</h2>
              </div>

              <el-tabs v-model="activeTab" class="custom-tabs" tab-position="top">
                <el-tab-pane label="路线规划" name="route" class="tab-pane">
                  <div class="route-planner">
                    <el-card class="route-form-card" shadow="never">
                      <el-form :model="routeForm" label-width="100px" class="route-form">
                        <el-form-item label="目的地">
                          <el-select v-model="routeForm.destination" placeholder="选择目的地" clearable class="form-control">
                            <el-option v-for="dest in hotDestinations" :key="dest.id" :label="dest.name" :value="dest.name" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="旅行天数">
                          <el-slider v-model="routeForm.days" :min="1" :max="15" :step="1" show-input class="form-control" />
                        </el-form-item>

                        <el-form-item label="预算范围">
                          <el-radio-group v-model="routeForm.budget" class="budget-options">
                            <el-radio-button label="economic">经济型</el-radio-button>
                            <el-radio-button label="medium">舒适型</el-radio-button>
                            <el-radio-button label="luxury">豪华型</el-radio-button>
                          </el-radio-group>
                        </el-form-item>

                        <el-form-item label="兴趣偏好">
                          <el-checkbox-group v-model="routeForm.interests" class="interests-group">
                            <el-checkbox label="food">美食</el-checkbox>
                            <el-checkbox label="history">历史</el-checkbox>
                            <el-checkbox label="nature">自然</el-checkbox>
                            <el-checkbox label="shopping">购物</el-checkbox>
                            <el-checkbox label="art">艺术</el-checkbox>
                          </el-checkbox-group>
                        </el-form-item>

                        <el-form-item label="住宿偏好">
                          <el-select v-model="routeForm.accommodation" placeholder="选择住宿类型" class="form-control">
                            <el-option label="经济型" value="经济型" />
                            <el-option label="舒适型" value="舒适型" />
                            <el-option label="豪华型" value="豪华型" />
                          </el-select>
                        </el-form-item>

                        <el-form-item class="form-actions">
                          <el-button type="primary" @click="generateRoute" :loading="routeLoading" class="generate-btn">
                            <i class="el-icon-map-location"></i> 生成路线
                          </el-button>
                          <el-button type="success" @click="generateRouteUsingAI" :loading="aiLoading" class="save-btn">
                            <i class="el-icon-magic-stick"></i> 使用AI生成
                          </el-button>
                          <el-button @click="saveRoute" :disabled="!routeResult" class="save-btn">
                            <i class="el-icon-save"></i> 保存路线
                          </el-button>
                        </el-form-item>
                      </el-form>
                    </el-card>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="导游匹配" name="guide" class="tab-pane">
                  <div class="guide-matcher">
                    <el-card class="guide-filter-card" shadow="never">
                      <el-form :model="guideFilter" label-width="100px" class="guide-filter-form">
                        <el-form-item label="语言偏好">
                          <el-select v-model="guideFilter.language" placeholder="选择语言" clearable class="form-control">
                            <el-option label="中文" value="中文" />
                            <el-option label="英文" value="英文" />
                            <el-option label="日语" value="日语" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="专长领域">
                          <el-select v-model="guideFilter.specialty" placeholder="选择专长" clearable class="form-control">
                            <el-option label="历史文化" value="历史文化" />
                            <el-option label="自然探索" value="自然探索" />
                            <el-option label="美食体验" value="美食体验" />
                            <el-option label="购物娱乐" value="购物娱乐" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="价格区间">
                          <el-slider v-model="guideFilter.priceRange" range :min="100" :max="2000" :step="50" show-stops />
                        </el-form-item>

                        <el-form-item label="最低评分">
                          <el-rate v-model="guideFilter.minRating" allow-half />
                        </el-form-item>

                        <el-form-item label="排序方式">
                          <el-select v-model="guideFilter.sortBy" placeholder="选择排序方式" class="form-control">
                            <el-option label="评分优先" value="rating" />
                            <el-option label="价格优先" value="price" />
                            <el-option label="评价数优先" value="reviews" />
                          </el-select>
                        </el-form-item>

                        <el-form-item class="form-actions">
                          <el-button type="primary" @click="filterGuides" :loading="guideLoading" class="search-btn">
                            <i class="el-icon-search"></i> 搜索导游
                          </el-button>
                        </el-form-item>
                      </el-form>
                    </el-card>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <div v-if="activeTab === 'route' && (routeLoading || routeResult)" class="route-results-section" style="margin-top: 20px;">
            <el-card shadow="hover" style="width: 100%;">
              <div slot="header" class="card-header">
                <h3 class="card-title">推荐路线</h3>
              </div>

              <div v-if="routeLoading" class="loading-container">
                <i class="el-icon-loading loading-spinner"></i>
                <p class="loading-text">正在为您规划最佳路线...</p>
              </div>

              <div v-else-if="routeResult" class="route-result-content">
                <el-tag type="success" class="result-tag" style="margin-bottom: 20px;">
                  {{ routeForm.days }}天行程
                </el-tag>
                <div class="route-preview">
                  <el-timeline class="route-timeline">
                    <el-timeline-item v-for="(day, index) in routeResult.days" :key="index" :timestamp="`第${index + 1}天`" placement="top">
                      <el-card class="day-card">
                        <div class="day-plan">
                          <div class="plan-item"><span class="time-label">上午</span><p>{{ day.activities[0] }}</p></div>
                          <div class="plan-item"><span class="time-label">中午</span><p>{{ day.activities[1] }}</p></div>
                          <div class="plan-item"><span class="time-label">下午</span><p>{{ day.activities[2] }}</p></div>
                          <div class="plan-item"><span class="time-label">晚上</span><p>{{ day.activities[3] }}</p></div>
                        </div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
                <div class="route-actions" style="display: flex; justify-content: flex-end; margin-top: 20px;">
                  <el-button @click="saveRoute" class="save-btn">
                    <i class="el-icon-save"></i> 保存路线
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <div v-if="activeTab === 'guide' && (guideLoading || filteredGuides)" class="grid-content bg-purple-dark" style="margin-top: 20px;">
            <el-card shadow="hover" style="width: 100%;">
              <div slot="header" class="card-header">
                <h3 class="card-title">导游搜索结果</h3>
              </div>

              <div v-if="guideLoading" class="loading-container">
                <i class="el-icon-loading loading-spinner"></i>
                <p class="loading-text">正在为您筛选导游...</p>
              </div>

              <div v-else class="guide-list">
                <div v-if="filteredGuides.length === 0" class="empty-state">
                  <el-empty description="暂无符合条件的导游" :image="elEmptyImage"></el-empty>
                </div>

                <el-card v-for="guide in filteredGuides" :key="guide.guideId" class="guide-card" shadow="hover">
                  <div class="guide-info">
                    <div class="guide-avatar">
                      <img :src="getGuideAvatar(guide)" :alt="guide.realName" class="avatar-img" />
                    </div>
                    <div class="guide-details">
                      <h3 class="guide-name">{{ guide.realName || '匿名导游' }}</h3>
                      <div class="guide-meta">
                        <span class="meta-item"><i class="el-icon-message"></i> {{ formatServiceLang(guide.serviceLang) }}</span>
                        <span class="meta-item"><i class="el-icon-trophy"></i> {{ guide.goodAtArea || guide.location || '-' }}</span>
                      </div>
                      <div class="guide-price">
                        <span class="price-text">¥{{ guide.baseFee || 0 }}/天</span>
                      </div>
                    </div>
                    <div class="guide-rating">
                      <el-rate :value="toNumber(guide.serviceScore)" disabled show-score />
                    </div>
                  </div>

                  <div class="guide-actions">
                    <el-button type="primary" @click="bookGuide(guide)">预订</el-button>
                    <el-button @click="viewGuideDetail(guide)">查看详情</el-button>
                  </div>
                </el-card>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="detailDialogVisible" :title="selectedGuide?.realName || '导游详情'" width="600px" center>
      <div v-if="selectedGuide" class="guide-detail-content">
        <div class="detail-header">
          <img :src="getGuideAvatar(selectedGuide)" :alt="selectedGuide.realName" class="detail-avatar" />
          <div class="detail-info">
            <h3 class="detail-name">{{ selectedGuide.realName || '匿名导游' }}</h3>
            <div class="detail-rating">
              <el-rate :value="toNumber(selectedGuide.serviceScore)" disabled show-score />
            </div>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-item"><span class="detail-label">语言：</span><span class="detail-value">{{ formatServiceLang(selectedGuide.serviceLang) }}</span></div>
          <div class="detail-item"><span class="detail-label">专长：</span><span class="detail-value">{{ selectedGuide.goodAtArea || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">价格：</span><span class="detail-value price-highlight">¥{{ selectedGuide.baseFee || 0 }}/天</span></div>
          <div class="detail-item"><span class="detail-label">地区：</span><span class="detail-value">{{ selectedGuide.location || '-' }}</span></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="bookGuide(selectedGuide)">立即预订</el-button>
      </template>
    </el-dialog>
  </div>
  </template>

<script>
import request from '@/utils/request'
export default {
  name: "SelfPlan",
  data() {
    return {
      activeTab: "route",
      currentUserId: null,
      aiLoading: false,

      hotDestinations: [
        { id: 1, name: "北京", image: "https://picsum.photos/id/10/400/200", rating: 4.8 },
        { id: 2, name: "上海", image: "https://picsum.photos/id/20/400/200", rating: 4.7 },
        { id: 3, name: "广州", image: "https://picsum.photos/id/30/400/200", rating: 4.5 },
        { id: 4, name: "成都", image: "https://picsum.photos/id/40/400/200", rating: 4.9 },
      ],
      routeForm: {
        destination: "",
        days: 3,
        budget: "medium",
        interests: [],
        accommodation: "经济型",
      },
      routeResult: null,
      routeLoading: false,

      guideFilter: {
        language: "",
        specialty: "",
        priceRange: [200, 1000],
        minRating: 0,
        sortBy: "rating",
      },
      guides: [],
      filteredGuides: [],
      guideLoading: false,

      detailDialogVisible: false,
      selectedGuide: null,
      elEmptyImage: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
    };
  },
  computed: {
    getBudgetText() {
      const budgetMap = {
        economic: '经济型 (¥500以下/天)',
        medium: '舒适型 (¥500-1500/天)',
        luxury: '豪华型 (¥1500以上/天)'
      }
      return budgetMap[this.routeForm.budget] || '未设置'
    },
    getInterestsText() {
      if (!this.routeForm.interests.length) return '未设置'
      const interestMap = { food: '美食', history: '历史', nature: '自然', shopping: '购物', art: '艺术' }
      return this.routeForm.interests.map(interest => interestMap[interest]).join('、')
    }
  },
  methods: {
    async generateRouteUsingAI() {
      if (!this.routeForm.destination) { this.$message.warning('请选择目的地'); return }
      if (!this.routeForm.interests.length) { this.$message.warning('请至少选择一个兴趣偏好'); return }
      this.aiLoading = true
      try {
        const prompt = {
          destination: this.routeForm.destination,
          days: this.routeForm.days,
          budget: this.routeForm.budget,
          interests: this.routeForm.interests,
          accommodation: this.routeForm.accommodation
        }
        // 约定：后端提供代理 POST /travel-portal/ai/planRoute，返回 { days: [{ activities: [am, noon, pm, night] }, ...] }
        const data = await request.post('/travel-portal/ai/planRoute', prompt, { timeout: 25000 })
        if (!data || !Array.isArray(data.days) || data.days.length === 0) throw new Error('AI返回数据格式不正确')
        this.routeResult = data
        this.$message.success('AI 已为您生成专属行程')
      } catch (e) {
        this.$message.error(e.message || 'AI 生成失败，已回退到本地生成')
        // 回退：调用本地生成逻辑
        this.generateRoute()
      } finally {
        this.aiLoading = false
      }
    },
    initUserId() {
      try {
        const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } }
        const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || null

        const userInfo = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'))
        if (userInfo) this.currentUserId = pickId(userInfo)
        if (!this.currentUserId) {
          const storedId = localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId')
          if (storedId) this.currentUserId = Number(storedId)
        }
        if (!this.currentUserId) {
          const token = localStorage.getItem('token')
          if (token && token.includes('.')) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              this.currentUserId = payload.userId || payload.sub || null
            } catch (e) {
              console.warn('[SelfPlan] token decode failed', e)
            }
          }
        }
        // 未登录也可浏览界面；仅在需要用户ID时再校验
      } catch (e) {
        this.$message.error('获取用户信息失败')
      }
    },
    ensureLoggedIn() {
      if (!this.currentUserId) { this.$message.warning('请先登录后再进行操作'); return false }
      return true
    },
    toNumber(v) { return v ? Number(v) : 0 },
    formatServiceLang(lang) { return lang ? String(lang).split(',').join('、') : '-' },
    getGuideAvatar(guide) {
      const hash = (guide?.guideId || 1) % 100 + 100
      return `https://picsum.photos/id/${hash}/100/100`
    },

    selectDestination(destName) {
      this.routeForm.destination = destName
      this.activeTab = 'route'
    },

    generateRoute() {
      if (!this.routeForm.destination) { this.$message.warning('请选择目的地'); return }
      if (!this.routeForm.interests.length) { this.$message.warning('请至少选择一个兴趣偏好'); return }
      this.routeLoading = true
      setTimeout(() => {
        this.routeResult = {
          days: Array.from({ length: this.routeForm.days }, (_, i) => ({
            activities: [
              `上午：参观${this.routeForm.destination}著名景点 ${i + 1}`,
              `中午：品尝当地特色美食`,
              `下午：体验${this.getInterestsText}文化活动`,
              `晚上：享受${this.routeForm.accommodation}住宿设施`,
            ],
          })),
        }
        this.routeLoading = false
      }, 800)
    },

    saveRoute() {
      if (!this.routeResult) return
      this.$message.success("路线已保存到『我的行程』（示例：未接通后端生成接口）")
    },

    async loadGuides() {
      this.guideLoading = true
      try {
        const data = await request.get('/travel-portal/guideExtend/list')
        this.guides = Array.isArray(data) ? data : []
        this.filteredGuides = this.guides.slice()
      } catch (e) {
        this.$message.error(e.message || '获取导游列表失败')
      } finally {
        this.guideLoading = false
      }
    },

    filterGuides() {
      this.guideLoading = true
      setTimeout(() => {
        const [minPrice, maxPrice] = this.guideFilter.priceRange
        const minRating = Number(this.guideFilter.minRating || 0)
        const lang = this.guideFilter.language
        const sp = this.guideFilter.specialty
        let list = this.guides.filter(g => {
          const inLang = !lang || (g.serviceLang && String(g.serviceLang).includes(lang))
          const inSpecialty = !sp || (g.goodAtArea && String(g.goodAtArea).includes(sp))
          const price = Number(g.baseFee || 0)
          const inPrice = price >= minPrice && price <= maxPrice
          const rating = Number(g.serviceScore || 0)
          const inRating = rating >= minRating
          return inLang && inSpecialty && inPrice && inRating
        })
        if (this.guideFilter.sortBy === 'rating') list.sort((a,b) => this.toNumber(b.serviceScore) - this.toNumber(a.serviceScore))
        else if (this.guideFilter.sortBy === 'price') list.sort((a,b) => this.toNumber(a.baseFee) - this.toNumber(b.baseFee))
        this.filteredGuides = list
        this.guideLoading = false
      }, 200)
    },

    async bookGuide(guide) {
      if (!guide) return
      try {
        const payload = {
          userId: this.currentUserId,
          productId: null,
          guideId: guide.guideId,
          totalPrice: Number(guide.baseFee || 0),
          payType: 2,
          payStatus: 1,
          orderStatus: 0,
          bookingDate: this.formatDateForAPI(new Date()),
          travellers: 1,
          specialNeeds: ''
        }
        await request.post('/travel-portal/tourOrder/create', payload)
        this.$message.success(`成功预订导游 ${guide.realName || ''}`)
        this.detailDialogVisible = false
      } catch (e) {
        this.$message.error(e.message || '预订失败')
      }
    },

    async viewGuideDetail(guide) {
      if (!guide?.guideId) return
      try {
        const data = await request.get(`/travel-portal/guideExtend/${guide.guideId}`)
        this.selectedGuide = data || guide
        this.detailDialogVisible = true
      } catch (e) {
        this.$message.error(e.message || '获取导游详情失败')
      }
    },

    formatDateForAPI(date) {
      const d = new Date(date)
      const pad = n => (n < 10 ? `0${n}` : `${n}`)
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
    }
  },
  mounted() {
    this.filteredGuides = this.guides
    this.initUserId()
    this.loadGuides()
  },
}
</script>

<style scoped>
/* 全局样式 */
.self-plan-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部Banner */
.banner-section {
  height: 300px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.banner-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://picsum.photos/id/10/1920/1080');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 0;
}

.banner-content {
  text-align: center;
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease;
}

.banner-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: 18px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 30px;
  margin-bottom: 50px;
}

/* 左侧内容 */
.content-left {
  width: 320px;
  flex-shrink: 0;
}

/* 右侧内容 */
.content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 确保左右区域顶部对齐 */
.content-left>.el-card,
.content-right>.el-card {
  margin-bottom: 20px;
}

.content-right>.el-card:last-child {
  margin-bottom: 0;
}

/* 通用卡片样式 */
.el-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.el-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 16px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 18px;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.card-title:before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  margin-right: 12px;
  border-radius: 2px;
}

/* 热门目的地样式 */
.popular-destinations-card {
  margin-bottom: 20px;
}

.destinations-carousel {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.destination-item {
  height: 180px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.destination-item:hover {
  transform: translateY(-5px);
}

.dest-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.destination-item:hover .dest-image {
  transform: scale(1.05);
}

.dest-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}

.dest-name {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.dest-rating {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.dest-rating i {
  color: #ffd700;
  margin-right: 5px;
}

/* 帮助提示样式 */
.help-card {
  margin-bottom: 20px;
}

.help-content {
  padding: 20px;
}

.help-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.help-item:hover {
  background-color: #e3f2fd;
  transform: translateX(5px);
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
}

.help-text {
  font-size: 14px;
  color: #666;
}

/* 主卡片样式 */
.main-card {
  min-height: 725px;
  display: flex;
  flex-direction: column;
}

/* 确保内容区域正确填充 */
.main-card>>>.el-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.main-card-header {
  color: black;
  border-bottom: none;
}

.main-card-header .card-title {
  color: white;
}

.main-card-header .card-title:before {
  background: white;
}

/* Tab样式 */
.custom-tabs {
  padding: 20px;
}

.tab-pane {
  padding: 0;
}

/* 路线规划样式 */
.route-planner {
  padding: 10px 0;
}

.route-form-card {
  margin-bottom: 20px;
}

.route-form {
  padding: 20px;
  gap: 18px;
}

.form-control {
  width: 100%;
}

.budget-options {
  width: 100%;
  display: flex;
}

.budget-options ::v-deep .el-radio-button {
  flex: 1;
  text-align: center;
}

.interests-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-item {
  margin-right: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.generate-btn,
.save-btn,
.search-btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 16px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 15px;
  animation: spin 2s linear infinite;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

/* 路线结果样式 */
.route-result-card {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-tag {
  font-size: 14px;
}

.route-preview {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.route-timeline {
  margin-left: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.day-card {
  border-radius: 6px;
  border-left: 3px solid #1890ff;
  transition: all 0.3s ease;
}

.day-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.day-plan {
  padding: 10px 0;
}

.plan-item {
  margin-bottom: 18px;
  padding-left: 15px;
  position: relative;
}

.plan-item:last-child {
  margin-bottom: 0;
}

.plan-item:before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #1890ff;
}

.time-label {
  display: inline-block;
  width: 70px;
  color: #1890ff;
  font-weight: 500;
  font-size: 14px;
}

.plan-item p {
  display: inline;
  margin: 0;
  color: #333;
  font-size: 14px;
}

/* 导游匹配样式 */
.guide-matcher {
  padding: 10px 0;
}

.guide-filter-card {
  margin-bottom: 20px;
}

.guide-filter-form {
  padding: 20px;
  gap: 18px;
}

.guide-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

.guide-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.guide-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex: 1;
}

.guide-avatar {
  margin-right: 15px;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.guide-details {
  flex: 1;
}

.guide-name {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.guide-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.meta-item i {
  margin-right: 5px;
  color: #1890ff;
}

.guide-price {
  margin-top: 10px;
}

.price-text {
  font-size: 16px;
  font-weight: 600;
  color: #e74c3c;
}

.guide-rating {
  margin-left: 10px;
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 空状态 */
.empty-state {
  padding: 60px 0;
  text-align: center;
}

/* 导游详情弹窗 */
.guide-detail-content {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
  margin-right: 20px;
}

.detail-info {
  flex: 1;
}

.detail-name {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #2c3e50;
}

.detail-body {
  padding: 0 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 80px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #333;
}

.price-highlight {
  color: #e74c3c;
  font-weight: 600;
  font-size: 16px;
}

/* 自定义滚动条 */
::v-deep .el-timeline {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .content-left {
    width: 100%;
  }

  .banner-title {
    font-size: 32px;
  }

  .banner-subtitle {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .banner-section {
    height: 200px;
  }

  .banner-title {
    font-size: 28px;
  }

  .banner-subtitle {
    font-size: 14px;
  }

  .guide-list {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .generate-btn,
  .save-btn,
  .search-btn {
    width: 100%;
  }

  .detail-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style>
