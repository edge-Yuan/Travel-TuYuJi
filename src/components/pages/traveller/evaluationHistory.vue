<template>
  <div class="evaluation-history-container">
    <div class="page-header">
      <h3 class="page-title">我的评价</h3>
      <p class="page-description">查看和管理您的所有评价记录</p>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="selectedScore" placeholder="评分筛选" clearable @change="handleFilterChange">
            <el-option label="5分" :value="5" />
            <el-option label="4分" :value="4" />
            <el-option label="3分" :value="3" />
            <el-option label="2分" :value="2" />
            <el-option label="1分" :value="1" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input v-model="searchKeyword" placeholder="搜索产品名称" clearable @keyup.enter.native="handleFilterChange" style="width: 100%;">
            <el-button slot="append" icon="el-icon-search" @click="handleFilterChange"></el-button>
          </el-input>
        </el-col>
        <el-col :span="10" class="filter-actions">
          <el-button type="primary" @click="resetFilters" size="mini">重置筛选</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 评价列表 -->
    <el-card class="evaluations-card" shadow="never">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="filteredEvaluations.length === 0" class="empty-state">
        <el-empty description="暂无评价记录">
          <el-button type="primary" @click="goToOrders">去订单管理</el-button>
        </el-empty>
      </div>
      
      <div v-else class="evaluations-list">
        <div v-for="evaluation in pagedEvaluations" :key="evaluation.evalId" class="evaluation-item">
          <div class="evaluation-header">
            <div class="product-info">
              <h4 class="product-name">{{ evaluation.productName || '未知产品' }}</h4>
              <div class="order-info">
                <span class="order-number">订单号：{{ evaluation.orderNumber || `TRIP${evaluation.orderId}` }}</span>
                <span class="evaluation-date">{{ formatDate(evaluation.evalTime) }}</span>
              </div>
            </div>
            <div class="evaluation-actions">
              <el-button type="text" size="small" @click="viewEvaluationDetail(evaluation)">查看详情</el-button>
              <el-button type="text" size="small" @click="editEvaluation(evaluation)" v-if="canEditEvaluation(evaluation)">编辑</el-button>
              <el-button type="text" size="small" @click="deleteEvaluation(evaluation)" v-if="canDeleteEvaluation(evaluation)" class="delete-btn">删除</el-button>
            </div>
          </div>

          <!-- 用户信息 -->
          <div class="user-info" v-if="evaluation.userName">
            <div class="user-avatar-container">
              <img 
                :src="getUserAvatar(evaluation)" 
                :alt="evaluation.userName"
                @error="handleImageError($event, 'avatar')"
                class="user-avatar"
              />
            </div>
            <div class="user-details">
              <div class="user-name">{{ getUserDisplayName(evaluation) }}</div>
              <div class="user-type">{{ '游客' }}</div>
            </div>
          </div>

          <div class="evaluation-content">
            <!-- 评分展示 -->
            <div class="ratings-display">
              <div class="rating-item">
                <span class="rating-label">总体评价：</span>
                <el-rate v-model="evaluation.overallScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
              </div>
              <div class="rating-item" v-if="evaluation.serviceScore">
                <span class="rating-label">导游服务：</span>
                <el-rate v-model="evaluation.serviceScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
              </div>
              <div class="rating-item" v-if="evaluation.environmentScore">
                <span class="rating-label">行程安排：</span>
                <el-rate v-model="evaluation.environmentScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
              </div>
              <div class="rating-item" v-if="evaluation.costEffScore">
                <span class="rating-label">餐饮住宿：</span>
                <el-rate v-model="evaluation.costEffScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
              </div>
            </div>

            <!-- 评价内容 -->
            <div class="evaluation-text" v-if="evaluation.content">
              <div class="text-content">
                <i class="el-icon-quote-left quote-icon"></i>
                <span class="text">{{ evaluation.content }}</span>
              </div>
            </div>

            <!-- 评价图片 -->
            <div class="evaluation-images" v-if="evaluation.imgUrls && evaluation.imgUrls.trim() && getImageList(evaluation.imgUrls).length > 0">
              <div class="images-title">旅行照片</div>
              <div class="images-grid">
                <div v-for="(img, index) in getImageList(evaluation.imgUrls)" :key="index" class="image-item">
                  <img 
                    :src="getImageUrl(img)" 
                    :alt="`评价图片${index + 1}`" 
                    @click="previewImage(img, getImageList(evaluation.imgUrls))"
                    @error="handleImageError($event, 'evaluation')"
                    class="evaluation-img"
                    style="cursor: pointer;"
                  />
                </div>
              </div>
            </div>

            <!-- 回复内容 -->
            <div class="reply-content" v-if="evaluation.replyContent">
              <div class="reply-header">
                <i class="el-icon-chat-dot-round"></i>
                <span>商家回复</span>
                <span class="reply-date">{{ formatDate(evaluation.replyTime) }}</span>
              </div>
              <div class="reply-text">{{ evaluation.replyContent }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination 
        v-if="filteredEvaluations.length > 0"
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="currentPage" 
        :page-sizes="[5, 10, 20]" 
        :page-size="pageSize" 
        :total="filteredEvaluations.length" 
        layout="total, sizes, prev, pager, next, jumper" 
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <!-- 评价详情弹窗 -->
    <el-dialog title="评价详情" :visible.sync="detailDialogVisible" width="70%" :close-on-click-modal="false">
      <div v-if="currentEvaluation" class="evaluation-detail">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="detail-section">
              <h4>产品信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="产品名称">{{ currentEvaluation.productName }}</el-descriptions-item>
                <el-descriptions-item label="订单号">{{ currentEvaluation.orderNumber || `TRIP${currentEvaluation.orderId}` }}</el-descriptions-item>
                <el-descriptions-item label="评价时间">{{ formatDateTime(currentEvaluation.evalTime) }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="detail-section">
              <h4>评分详情</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="总体评价">
                  <el-rate v-model="currentEvaluation.overallScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
                </el-descriptions-item>
                <el-descriptions-item label="导游服务" v-if="currentEvaluation.serviceScore">
                  <el-rate v-model="currentEvaluation.serviceScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
                </el-descriptions-item>
                <el-descriptions-item label="行程安排" v-if="currentEvaluation.environmentScore">
                  <el-rate v-model="currentEvaluation.environmentScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
                </el-descriptions-item>
                <el-descriptions-item label="餐饮住宿" v-if="currentEvaluation.costEffScore">
                  <el-rate v-model="currentEvaluation.costEffScore" disabled show-score text-color="#ff9900" score-template="{value}分" />
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="detail-section" v-if="currentEvaluation.content">
              <h4>评价内容</h4>
              <div class="content-display">{{ currentEvaluation.content }}</div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="detail-section" v-if="currentEvaluation.imgUrls && currentEvaluation.imgUrls.trim() && getImageList(currentEvaluation.imgUrls).length > 0">
              <h4>评价图片</h4>
              <div class="images-display">
                <div v-for="(img, index) in getImageList(currentEvaluation.imgUrls)" :key="index" class="detail-image">
                  <img 
                    :src="getImageUrl(img)" 
                    :alt="`评价图片${index + 1}`" 
                    @click="previewImage(img, getImageList(currentEvaluation.imgUrls))"
                    @error="handleImageError($event, 'evaluation')"
                    class="detail-img"
                    style="cursor: pointer;"
                  />
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="currentEvaluation.replyContent">
              <h4>商家回复</h4>
              <div class="reply-display">
                <div class="reply-time">{{ formatDateTime(currentEvaluation.replyTime) }}</div>
                <div class="reply-text">{{ currentEvaluation.replyContent }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 编辑评价弹窗 -->
    <el-dialog title="编辑评价" :visible.sync="editDialogVisible" width="60%" :close-on-click-modal="false">
      <div v-if="currentEvaluation" class="edit-evaluation-form">
        <el-form :model="currentEvaluation" label-width="120px">
          <!-- 评分编辑 -->
          <el-form-item label="总体评价">
            <el-rate v-model="currentEvaluation.overallScore" show-score text-color="#ff9900" score-template="{value}分" />
          </el-form-item>
          
          <el-form-item label="导游服务" v-if="currentEvaluation.serviceScore">
            <el-rate v-model="currentEvaluation.serviceScore" show-score text-color="#ff9900" score-template="{value}分" />
          </el-form-item>
          
          <el-form-item label="行程安排" v-if="currentEvaluation.environmentScore">
            <el-rate v-model="currentEvaluation.environmentScore" show-score text-color="#ff9900" score-template="{value}分" />
          </el-form-item>
          
          <el-form-item label="餐饮住宿" v-if="currentEvaluation.costEffScore">
            <el-rate v-model="currentEvaluation.costEffScore" show-score text-color="#ff9900" score-template="{value}分" />
          </el-form-item>
          
          <!-- 评价内容编辑 -->
          <el-form-item label="评价内容">
            <el-input 
              v-model="currentEvaluation.content" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入您的评价内容"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 评价图片展示 -->
          <el-form-item label="评价图片" v-if="currentEvaluation.imgUrls && currentEvaluation.imgUrls.trim() && getImageList(currentEvaluation.imgUrls).length > 0">
            <div class="edit-images-display">
              <div class="images-title">当前图片：</div>
              <div class="images-grid">
                <div v-for="(img, index) in getImageList(currentEvaluation.imgUrls)" :key="index" class="image-item">
                  <img 
                    :src="getImageUrl(img)" 
                    :alt="`评价图片${index + 1}`" 
                    @click="previewImage(img, getImageList(currentEvaluation.imgUrls))"
                    @error="handleImageError($event, 'evaluation')"
                    class="edit-img"
                    style="cursor: pointer;"
                  />
                </div>
              </div>
              <div class="images-note">注：编辑时无法修改图片，如需更换图片请删除后重新评价</div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEvaluation" :loading="saveLoading">保存修改</el-button>
      </div>
    </el-dialog>

    <!-- 图片预览 - 使用自定义弹窗方案 -->
    <div v-if="imageViewerVisible" class="image-preview-modal">
      <div class="preview-overlay" @click="handleImageViewerClose">
        <div class="preview-content" @click.stop>
          <div class="preview-header">
            <span class="preview-title">图片预览 ({{ previewIndex + 1 }}/{{ previewImages.length }})</span>
            <button @click="handleImageViewerClose" class="close-btn">×</button>
          </div>
          <div class="preview-body">
            <img 
              :src="previewImages[previewIndex]" 
              alt="预览图片" 
              class="preview-image"
              @error="handlePreviewImageError"
            />
          </div>
          <div class="preview-footer" v-if="previewImages.length > 1">
            <button 
              @click="prevImage" 
              :disabled="previewIndex === 0"
              class="nav-btn prev-btn"
            >
              ← 上一张
            </button>
            <button 
              @click="nextImage" 
              :disabled="previewIndex === previewImages.length - 1"
              class="nav-btn next-btn"
            >
              下一张 →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import { imageMixin } from '@/utils/imageUtils'
import UnifiedEvaluationAPI from '@/utils/evaluationAPI'

export default {
  name: 'EvaluationHistory',
  mixins: [imageMixin],
  data() {
    return {
      loading: false,
      currentUserId: null,
      evaluations: [],
      filteredEvaluations: [],
      
      // 筛选条件
      selectedScore: '',
      searchKeyword: '',
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      
      // 详情弹窗
      detailDialogVisible: false,
      editDialogVisible: false,
      currentEvaluation: {},
      
      // 图片预览
      imageViewerVisible: false,
      previewImages: [],
      previewIndex: 0,
      currentPreviewImage: '',
      
      // 编辑状态
      saveLoading: false
    }
  },
  computed: {
    pagedEvaluations() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredEvaluations.slice(start, end)
    }
  },
  created() {
    this.initUserId()
    this.loadEvaluations()
  },
  methods: {
    // 初始化用户ID
    initUserId() {
      try {
        const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } }
        const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || null

        const userInfo = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'))
        if (userInfo) {
          this.currentUserId = pickId(userInfo)
        }
        if (!this.currentUserId) {
          const storedId = localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId')
          if (storedId) {
            this.currentUserId = Number(storedId)
          }
        }
        if (!this.currentUserId) {
          const token = localStorage.getItem('token')
          if (token && token.includes('.')) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              this.currentUserId = payload.userId || payload.sub || null
            } catch (e) {
              console.warn('token decode failed', e)
            }
          }
        }
      } catch (e) {
        this.$message.error('获取用户信息失败')
      }
    },
    
    // 加载评价列表
    async loadEvaluations() {
      if (!this.currentUserId) {
        this.$message.warning('请先登录')
        return
      }
      
      this.loading = true
      try {
        console.log('加载用户评价列表，用户ID:', this.currentUserId)
        
        // 使用真实API获取用户评价列表
        
        // 使用统一API获取用户评价列表
        const response = await UnifiedEvaluationAPI.getUserEvaluations(this.currentUserId, this.currentPage, this.pageSize)
        console.log('统一评价列表API响应:', response)
        
        if (response && response.code === 1) {
          const list = response.data || []
          
          // 获取产品信息
          const enriched = await this.enrichEvaluationsWithProduct(list)
          // 使用图片处理工具处理评价数据
          this.evaluations = enriched.map(evaluation => {
            const processed = this.processEvaluationData(evaluation)
            console.log('处理后的评价数据:', processed)
            console.log('用户头像URL:', processed.userAvatar)
            console.log('评价图片URLs:', processed.imgUrls)
            return processed
          })
          this.filteredEvaluations = this.evaluations.slice()
          this.total = response.total || list.length
          
          console.log('统一评价列表数据:', this.evaluations)
        } else {
          // 如果统一API失败，尝试使用旧版API
          try {
            console.log('尝试使用旧版API获取评价列表')
            const fallbackResponse = await request.get(`/travel-portal/productEvaluation/user/${this.currentUserId}`)
            console.log('旧版评价列表API响应:', fallbackResponse)
            
            const payload = fallbackResponse.data || fallbackResponse
            const list = payload.data || payload.result || payload || []
            
            // 获取产品信息
            const enriched = await this.enrichEvaluationsWithProduct(list)
            // 使用图片处理工具处理评价数据
            this.evaluations = enriched.map(evaluation => this.processEvaluationData(evaluation))
            this.filteredEvaluations = this.evaluations.slice()
            this.total = list.length
            
            console.log('旧版评价列表数据:', this.evaluations)
          } catch (fallbackError) {
            console.error('旧版API也失败:', fallbackError)
            this.$message.error('获取评价列表失败: ' + (fallbackError.message || '未知错误'))
            this.evaluations = []
          }
        }
      } catch (error) {
        console.error('获取评价列表失败:', error)
        this.$message.error('获取评价列表失败: ' + (error.message || '未知错误'))
        this.evaluations = []
        this.filteredEvaluations = []
      } finally {
        this.loading = false
      }
    },
    
    // 补充产品信息
    async enrichEvaluationsWithProduct(evaluationList) {
      const results = []
      for (const evaluation of evaluationList) {
        let productName = ''
        if (evaluation.productId) {
          try {
            const prodRes = await request.get(`/travel-portal/tourProduct/getProductDetail/${evaluation.productId}`)
            const prod = prodRes.data?.data || prodRes.data?.result || prodRes.data
            if (prod) {
              productName = prod.productName || prod.name || ''
            }
          } catch (e) {
            console.warn('获取产品详情失败', e)
          }
        }
        results.push({ 
          ...evaluation, 
          productName,
          orderNumber: `TRIP${evaluation.orderId}`
        })
      }
      return results
    },
    
    // 筛选处理
    handleFilterChange() {
      let result = this.evaluations.slice()
      
      if (this.selectedScore !== '') {
        result = result.filter(e => e.overallScore === Number(this.selectedScore))
      }
      
      if (this.searchKeyword) {
        const kw = this.searchKeyword.toLowerCase()
        result = result.filter(e => 
          (e.productName || '').toLowerCase().includes(kw) ||
          (e.content || '').toLowerCase().includes(kw)
        )
      }
      
      this.filteredEvaluations = result
      this.currentPage = 1
    },
    
    // 重置筛选
    resetFilters() {
      this.selectedScore = ''
      this.searchKeyword = ''
      this.filteredEvaluations = this.evaluations.slice()
      this.currentPage = 1
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
    },
    
    // 查看评价详情
    viewEvaluationDetail(evaluation) {
      this.currentEvaluation = { ...evaluation }
      this.detailDialogVisible = true
    },
    
    // 编辑评价
    editEvaluation(evaluation) {
      console.log('编辑评价:', evaluation)
      this.currentEvaluation = { ...evaluation }
      this.editDialogVisible = true
    },
    
    // 判断是否可以编辑评价
    canEditEvaluation(evaluation) {
      // 评价提交后7天内可以编辑
      const evalTime = new Date(evaluation.evalTime)
      const now = new Date()
      const daysDiff = (now - evalTime) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    },
    
    // 删除评价
    async deleteEvaluation(evaluation) {
      try {
        await this.$confirm('确定要删除这条评价吗？删除后无法恢复。', '确认删除', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        })
        
        console.log('删除评价:', evaluation)
        
        // 调用删除API
        const response = await UnifiedEvaluationAPI.deleteEvaluation(evaluation.evalId)
        
        if (response && response.code === 1) {
          this.$message.success('评价删除成功')
          // 重新加载评价列表
          await this.loadEvaluations()
        } else {
          throw new Error(response?.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除评价失败:', error)
          this.$message.error('删除失败: ' + (error.message || '请重试'))
        }
      }
    },
    
    // 判断是否可以删除评价
    canDeleteEvaluation(evaluation) {
      // 评价提交后3天内可以删除
      const evalTime = new Date(evaluation.evalTime)
      const now = new Date()
      const daysDiff = (now - evalTime) / (1000 * 60 * 60 * 24)
      return daysDiff <= 3
    },
    
    // 保存评价修改
    async saveEvaluation() {
      try {
        this.saveLoading = true
        
        console.log('保存评价修改:', this.currentEvaluation)
        
        // 构建更新数据 - 使用新的编辑接口格式
        const updateData = {
          orderId: this.currentEvaluation.orderId,
          productId: this.currentEvaluation.productId,
          userId: this.currentEvaluation.userId,
          overallScore: this.currentEvaluation.overallScore,
          serviceScore: this.currentEvaluation.serviceScore,
          environmentScore: this.currentEvaluation.environmentScore,
          costEffScore: this.currentEvaluation.costEffScore,
          content: this.currentEvaluation.content,
          imgUrls: this.currentEvaluation.imgUrls, // 保持原有图片
          evalType: this.currentEvaluation.evalType || 1,
          targetId: this.currentEvaluation.productId,
          userType: this.currentEvaluation.userType || '游客',
          source: this.currentEvaluation.source || '来自WWW站'
        }
        
        console.log('发送编辑请求数据:', updateData)
        
        // 使用新的编辑接口
        const response = await UnifiedEvaluationAPI.updateEvaluation(this.currentEvaluation.evalId, updateData)
        console.log('编辑评价API响应:', response)
        
        if (response && (response.code === 1 || response.data === true)) {
          this.$message.success('评价修改成功')
          this.editDialogVisible = false
          // 重新加载评价列表
          await this.loadEvaluations()
        } else {
          throw new Error(response?.msg || '修改失败')
        }
      } catch (error) {
        console.error('保存评价修改失败:', error)
        this.$message.error('保存失败: ' + (error.message || '请重试'))
      } finally {
        this.saveLoading = false
      }
    },
    
    // 跳转到订单管理
    goToOrders() {
      this.$router.push('/traveller/orderManage')
    },
    
    // 获取图片列表
    getImageList(imgUrls) {
      if (!imgUrls || !imgUrls.trim()) {
        return []
      }
      // 确保imgUrls是字符串类型
      if (typeof imgUrls !== 'string') {
        console.warn('imgUrls不是字符串类型:', typeof imgUrls, imgUrls)
        return []
      }
      try {
        return imgUrls.split(',').map(url => url ? url.trim() : '').filter(url => url && url.length > 0)
      } catch (error) {
        console.error('处理图片URL时出错:', error, imgUrls)
        return []
      }
    },
    
    // 获取用户头像
    getUserAvatar(evaluation) {
      // 优先使用userAvatar字段
      if (evaluation.userAvatar && evaluation.userAvatar.trim()) {
        return this.processImageUrl(evaluation.userAvatar, 'avatar')
      }
      
      // 如果没有头像，使用默认头像
      return this.getDefaultImage('avatar')
    },
    
    // 获取用户显示名称
    getUserDisplayName(evaluation) {
      // 如果是当前用户自己的评价，尝试获取完整用户名
      const evalUserId = Number(evaluation.userId)
      const currentUserId = Number(this.currentUserId)
      
      if (evaluation.userId && this.currentUserId && evalUserId === currentUserId) {
        // 尝试从本地存储获取完整用户名
        const fullUserName = this.getCurrentUserFullName()
        if (fullUserName && fullUserName !== '匿名用户') {
          return fullUserName
        } else {
          // 如果是当前用户的评价，直接返回评价数据中的用户名（不进行脱敏）
          const userName = evaluation.userName || '匿名用户'
          return userName
        }
      }
      
      // 使用评价数据中的用户名（可能已经被脱敏）
      const userName = evaluation.userName || '匿名用户'
      
      // 如果是匿名用户，直接返回
      if (userName === '匿名用户') {
        return userName
      }
      
      // 如果用户名已经被脱敏（包含*），直接返回
      if (userName.includes('*')) {
        return userName
      }
      
      // 如果用户名没有被脱敏，进行脱敏处理
      let maskedName
      if (userName.length <= 1) {
        maskedName = userName
      } else if (userName.length === 2) {
        maskedName = userName.charAt(0) + '*'
      } else {
        maskedName = userName.charAt(0) + '*'.repeat(userName.length - 2) + userName.charAt(userName.length - 1)
      }
      
      return maskedName
    },
    
    // 获取当前用户的完整用户名
    getCurrentUserFullName() {
      try {
        // 从localStorage获取用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        if (userInfo && userInfo.username) {
          return userInfo.username
        }
        
        // 从sessionStorage获取用户信息
        const sessionUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
        if (sessionUserInfo && sessionUserInfo.username) {
          return sessionUserInfo.username
        }
        
        // 从localStorage直接获取用户名
        const storedUsername = localStorage.getItem('username')
        if (storedUsername) {
          return storedUsername
        }
        
        // 从sessionStorage直接获取用户名
        const sessionUsername = sessionStorage.getItem('username')
        if (sessionUsername) {
          return sessionUsername
        }
        
        return null
      } catch (error) {
        console.error('获取用户完整用户名失败:', error)
        return null
      }
    },
    
    // 处理评价图片URL
    getImageUrl(url) {
      return this.processImageUrl(url, 'evaluation')
    },
    
    // 预览图片
    previewImage(img, imgList) {
      console.log('=== 开始预览图片 ===')
      console.log('点击的图片:', img)
      console.log('图片列表:', imgList)
      
      // 处理图片URL列表，确保所有图片都经过getImageUrl处理
      this.previewImages = imgList.map(url => this.getImageUrl(url))
      this.previewIndex = imgList.indexOf(img)
      this.imageViewerVisible = true
      
      console.log('处理后的图片列表:', this.previewImages)
      console.log('预览图片索引:', this.previewIndex)
      console.log('图片查看器可见性:', this.imageViewerVisible)
      
      // 检查图片URL是否有效
      this.previewImages.forEach((url, index) => {
        console.log(`图片${index + 1} URL:`, url)
      })
      
      // 设置当前预览图片（备用方案）
      this.currentPreviewImage = this.getImageUrl(img)
    },
    
    // 图片查看器关闭处理
    handleImageViewerClose() {
      console.log('图片查看器关闭')
      this.imageViewerVisible = false
      this.previewImages = []
      this.currentPreviewImage = ''
    },
    
    // 上一张图片
    prevImage() {
      if (this.previewIndex > 0) {
        this.previewIndex--
        console.log('切换到上一张图片，索引:', this.previewIndex)
      }
    },
    
    // 下一张图片
    nextImage() {
      if (this.previewIndex < this.previewImages.length - 1) {
        this.previewIndex++
        console.log('切换到下一张图片，索引:', this.previewIndex)
      }
    },
    
    // 预览图片加载错误处理
    handlePreviewImageError(event) {
      console.error('预览图片加载失败:', event.target.src)
      event.target.src = this.getDefaultImage('evaluation')
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('zh-CN')
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    },
    
    // 处理评价数据
    processEvaluationData(evaluation) {
      if (!evaluation) return evaluation
      
      // 确保imgUrls是字符串类型
      if (evaluation.imgUrls && typeof evaluation.imgUrls !== 'string') {
        evaluation.imgUrls = String(evaluation.imgUrls)
      }
      
      // 确保userAvatar是字符串类型
      if (evaluation.userAvatar && typeof evaluation.userAvatar !== 'string') {
        evaluation.userAvatar = String(evaluation.userAvatar)
      }
      
      return evaluation
    },
    
    // 处理图片加载错误
    handleImageError(event, type) {
      // 避免重复设置默认图片
      const defaultImage = this.getDefaultImage(type)
      if (event.target.src === defaultImage) {
        return
      }
      // 静默处理，不输出日志
      event.target.src = defaultImage
    }
  }
}
</script>

<style scoped>
.evaluation-history-container {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.page-description {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
  background-color: #fff;
}

.filter-actions {
  text-align: right;
}

.evaluations-card {
  background-color: #fff;
}

.loading-container {
  padding: 20px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.evaluations-list {
  padding: 0;
}

.evaluation-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 20px;
  background: #fff;
  transition: all 0.3s ease;
}

.evaluation-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.order-info {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.evaluation-actions {
  display: flex;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-type {
  font-size: 12px;
  color: #666;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
  font-weight: 500;
}

.evaluation-content {
  margin-top: 16px;
}

.ratings-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.evaluation-text {
  margin-bottom: 16px;
}

.text-content {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  border-left: 4px solid #fdcb6e;
  padding: 16px;
  border-radius: 6px;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 20px;
  color: #e17055;
  opacity: 0.6;
}

.text {
  font-size: 15px;
  color: #2d3436;
  font-weight: 500;
  line-height: 1.6;
  margin-left: 24px;
}

.evaluation-images {
  margin-bottom: 16px;
}

.images-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 600;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.image-item {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img,
.evaluation-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.evaluation-img:hover {
  transform: scale(1.05);
}

.reply-content {
  background: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.reply-header i {
  color: #409eff;
}

.reply-date {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.reply-text {
  color: #303133;
  line-height: 1.6;
}

.evaluation-detail {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.content-display {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #303133;
}

.images-display {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.detail-image {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.detail-image:hover {
  transform: scale(1.05);
}

.detail-image img,
.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.detail-img:hover {
  transform: scale(1.05);
}

.reply-display {
  background: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 6px;
  padding: 16px;
}

.reply-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.reply-text {
  color: #303133;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .evaluation-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .evaluation-actions {
    align-self: flex-start;
  }
  
  .ratings-display {
    grid-template-columns: 1fr;
  }
  
  .order-info {
    flex-direction: column;
    gap: 4px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .image-item {
    width: 80px;
    height: 80px;
  }
}

/* 编辑和删除按钮样式 */
.delete-btn {
  color: #f56c6c !important;
}

.delete-btn:hover {
  color: #f78989 !important;
}

/* 编辑评价表单样式 */
.edit-evaluation-form {
  padding: 20px 0;
}

.edit-images-display {
  margin-top: 10px;
}

.images-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.images-note {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.edit-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.edit-img:hover {
  transform: scale(1.05);
}

/* 图片预览模态框样式 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.close-btn {
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #f78989;
}

.preview-body {
  padding: 20px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
}

.preview-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 15px 20px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

.nav-btn {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
