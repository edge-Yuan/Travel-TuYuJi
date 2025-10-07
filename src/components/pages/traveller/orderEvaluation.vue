<template>
  <div class="order-evaluation-container">
    <!-- 评价弹窗 -->
    <el-dialog 
      title="订单评价" 
      :visible.sync="evaluationDialogVisible" 
      width="800px" 
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <div v-if="currentOrder" class="evaluation-content">
        <!-- 订单信息展示 -->
        <el-card class="order-info-card" shadow="never">
          <div slot="header" class="order-header">
            <h4>订单信息</h4>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="order-detail">
                <span class="label">订单号：</span>
                <span class="value">{{ currentOrder.orderNumber }}</span>
              </div>
              <div class="order-detail">
                <span class="label">产品名称：</span>
                <span class="value">{{ currentOrder.productName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="order-detail">
                <span class="label">出行日期：</span>
                <span class="value">{{ formatDate(currentOrder.bookingDate) }}</span>
              </div>
              <div class="order-detail">
                <span class="label">订单金额：</span>
                <span class="value price">¥{{ formatAmount(currentOrder.totalPrice) }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 评价表单 -->
        <el-form 
          :model="evaluationForm" 
          :rules="evaluationRules" 
          ref="evaluationForm" 
          label-width="120px"
          class="evaluation-form"
        >
          <!-- 总体评分 -->
          <el-form-item label="总体评价" prop="overallScore" required>
            <div class="rating-section">
              <el-rate
                v-model="evaluationForm.overallScore"
                :max="5"
                show-score
                text-color="#ff9900"
                score-template="{value}分"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
              <div class="rating-tips">
                <span v-if="evaluationForm.overallScore === 1">很不满意</span>
                <span v-else-if="evaluationForm.overallScore === 2">不满意</span>
                <span v-else-if="evaluationForm.overallScore === 3">一般</span>
                <span v-else-if="evaluationForm.overallScore === 4">满意</span>
                <span v-else-if="evaluationForm.overallScore === 5">非常满意</span>
                <span v-else>请选择评分</span>
              </div>
            </div>
          </el-form-item>

          <!-- 分项评分 -->
          <el-form-item label="导游服务" prop="serviceScore">
            <div class="rating-section">
              <el-rate
                v-model="evaluationForm.serviceScore"
                :max="5"
                show-score
                text-color="#ff9900"
                score-template="{value}分"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </div>
          </el-form-item>

          <el-form-item label="行程安排" prop="environmentScore">
            <div class="rating-section">
              <el-rate
                v-model="evaluationForm.environmentScore"
                :max="5"
                show-score
                text-color="#ff9900"
                score-template="{value}分"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </div>
          </el-form-item>

          <el-form-item label="餐饮住宿" prop="costEffScore">
            <div class="rating-section">
              <el-rate
                v-model="evaluationForm.costEffScore"
                :max="5"
                show-score
                text-color="#ff9900"
                score-template="{value}分"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </div>
          </el-form-item>

          <!-- 评价内容 -->
          <el-form-item label="评价内容" prop="content">
            <el-input
              v-model="evaluationForm.content"
              type="textarea"
              :rows="4"
              placeholder="请分享您的旅行体验，帮助其他用户做出选择..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="旅行照片">
            <el-upload
              :action="uploadUrl"
              :file-list="fileList"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :on-remove="handleRemove"
              :before-upload="beforeUpload"
              :http-request="uploadImageManually"
              list-type="picture-card"
              :limit="6"
              accept="image/*"
              multiple
              @change="handleFileChange"
            >
              <i class="el-icon-plus"></i>
              <div slot="tip" class="el-upload__tip">
                最多上传6张图片，支持jpg、png、gif格式，单张图片不超过5MB
              </div>
            </el-upload>
            
            <!-- 图片预览区域 -->
            <div v-if="uploadedImages.length > 0" class="image-preview-section">
              <div class="preview-title">已上传的图片：</div>
              <div class="image-preview-grid">
                <div 
                  v-for="(image, index) in uploadedImages" 
                  :key="index" 
                  class="image-preview-item"
                >
                  <img 
                    :src="image.url" 
                    :alt="image.filename"
                    @click="previewImage(image.url, uploadedImages.map(img => img.url))"
                    @error="handleImageError"
                    class="preview-image"
                  />
                  <div class="image-info">
                    <span class="filename">{{ image.filename }}</span>
                    <button 
                      @click="removeImageByIndex(index)" 
                      class="remove-btn"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="evaluationDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitEvaluation" 
          :loading="submitLoading"
        >
          提交评价
        </el-button>
      </div>
    </el-dialog>

    <!-- 评价成功提示 -->
    <el-dialog
      title="评价成功"
      :visible.sync="successDialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="success-content">
        <i class="el-icon-success" style="color: #67C23A; font-size: 48px; margin-bottom: 20px;"></i>
        <p>感谢您的评价！您的反馈对我们很重要。</p>
        <p class="reward-text">评价奖励：获得20元优惠券</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="successDialogVisible = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import UnifiedEvaluationAPI from '@/utils/evaluationAPI'
import { imageMixin } from '@/utils/imageUtils'
import request from '@/utils/request'

export default {
  name: 'OrderEvaluation',
  mixins: [imageMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      evaluationDialogVisible: false,
      successDialogVisible: false,
      submitLoading: false,
      currentOrder: {},
      
      // 评价表单数据
      evaluationForm: {
        orderId: null,
        productId: null,
        userId: null,
        overallScore: 0,
        serviceScore: 0,
        environmentScore: 0,
        costEffScore: 0,
        content: '',
        imgUrls: ''
      },
      
      // 表单验证规则
      evaluationRules: {
        overallScore: [
          { required: true, message: '请选择总体评分', trigger: 'change' }
        ],
        content: [
          { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
        ]
      },
      
      // 文件上传相关
      fileList: [],
      uploadUrl: '/travel-portal/upload/file', // 使用代理路径
      uploadHeaders: {
        'Content-Type': 'multipart/form-data'
      },
      uploadedImages: [] // 已上传的图片信息
    }
  },
  computed: {
    // 上传数据
    uploadData() {
      return {
        uploadType: 'evaluation',
        relatedId: this.evaluationForm.orderId
      }
    }
  },
  watch: {
    visible(newVal) {
      this.evaluationDialogVisible = newVal
      if (newVal && this.orderData) {
        this.initEvaluationForm()
      }
    },
    evaluationDialogVisible(newVal) {
      this.$emit('update:visible', newVal)
    }
  },
  methods: {
    // 初始化评价表单
    initEvaluationForm() {
      this.currentOrder = { ...this.orderData }
      
      // 获取用户ID
      const userId = this.getCurrentUserId()
      
      this.evaluationForm = {
        orderId: this.currentOrder.orderId,
        productId: this.currentOrder.productId,
        userId: userId,
        overallScore: 0,
        serviceScore: 0,
        environmentScore: 0,
        costEffScore: 0,
        content: '',
        imgUrls: ''
      }
      
      this.fileList = []
      this.uploadedImages = []
    },
    
    // 获取当前用户ID
    getCurrentUserId() {
      try {
        // 方法1：从localStorage获取用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}')
        if (userInfo && userInfo.userId) {
          return userInfo.userId
        }
        
        // 方法2：从localStorage获取userId
        const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
        if (storedUserId) {
          return Number(storedUserId)
        }
        
        // 方法3：从token中解析用户ID
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (token && token.includes('.')) {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.userId || payload.sub || null
        }
        
        return null
      } catch (error) {
        console.error('获取用户ID失败:', error)
        return null
      }
    },
    
    // 提交评价
    async submitEvaluation() {
      this.$refs.evaluationForm.validate(async (valid) => {
        if (!valid) return
        
        if (!this.evaluationForm.userId) {
          this.$message.error('请先登录后再进行评价')
          return
        }
        
        this.submitLoading = true
        
        try {
          // 强制更新图片URLs，确保数据是最新的
          this.updateImageUrls()
          
          console.log('=== 提交评价前的数据检查 ===')
          console.log('uploadedImages数组:', this.uploadedImages)
          console.log('uploadedImages长度:', this.uploadedImages.length)
          console.log('evaluationForm.imgUrls:', this.evaluationForm.imgUrls)
          console.log('imgUrls是否为空:', !this.evaluationForm.imgUrls || this.evaluationForm.imgUrls.trim() === '')
          
          // 如果图片URLs为空，给出警告
          if (!this.evaluationForm.imgUrls || this.evaluationForm.imgUrls.trim() === '') {
            console.log('警告：没有上传任何图片')
          } else {
            console.log('图片URLs已准备就绪')
          }
          
          // 构建统一评价数据
          const evaluationData = {
            orderId: this.evaluationForm.orderId,
            productId: this.evaluationForm.productId,
            userId: this.evaluationForm.userId,
            overallScore: this.evaluationForm.overallScore,
            serviceScore: this.evaluationForm.serviceScore || 0,
            environmentScore: this.evaluationForm.environmentScore || 0,
            costEffScore: this.evaluationForm.costEffScore || 0,
            content: this.evaluationForm.content,
            imgUrls: this.evaluationForm.imgUrls || '', // 确保不为undefined
            evalType: 1, // 1-产品评价，2-导游评价
            targetId: this.evaluationForm.productId,
            userType: '游客',
            source: '来自WWW站'
          }
          
          console.log('=== 构建的评价数据 ===')
          console.log('完整评价数据:', evaluationData)
          console.log('imgUrls字段:', evaluationData.imgUrls)
          console.log('imgUrls类型:', typeof evaluationData.imgUrls)
          console.log('imgUrls长度:', evaluationData.imgUrls ? evaluationData.imgUrls.length : 0)
          
          console.log('提交统一评价数据:', evaluationData)
          
          // 使用统一API提交评价
          console.log('=== 开始提交评价到API ===')
          const response = await UnifiedEvaluationAPI.addEvaluation(evaluationData)
          
          console.log('=== API响应 ===')
          console.log('响应数据:', response)
          console.log('响应状态:', response?.code)
          console.log('响应消息:', response?.msg)
          
          if (response && response.code === 1) {
            console.log('=== 评价提交成功 ===')
            this.$message.success('评价提交成功！')
            this.evaluationDialogVisible = false
            this.successDialogVisible = true
            
            // 通知父组件评价成功
            this.$emit('evaluation-success', {
              orderId: this.evaluationForm.orderId,
              evaluationData: evaluationData
            })
          } else {
            console.error('=== 评价提交失败 ===')
            console.error('失败响应:', response)
            this.$message.error(response?.msg || '评价提交失败')
          }
        } catch (error) {
          console.error('评价提交失败:', error)
          
          // 如果统一API失败，尝试使用旧版API
          try {
            console.log('尝试使用旧版API提交评价')
            const fallbackData = {
              orderId: this.evaluationForm.orderId,
              productId: this.evaluationForm.productId,
              userId: this.evaluationForm.userId,
              overallScore: this.evaluationForm.overallScore,
              serviceScore: this.evaluationForm.serviceScore || 0,
              environmentScore: this.evaluationForm.environmentScore || 0,
              costEffScore: this.evaluationForm.costEffScore || 0,
              content: this.evaluationForm.content,
              imgUrls: this.evaluationForm.imgUrls
            }
            
            const fallbackResponse = await UnifiedEvaluationAPI.addProductEvaluation(fallbackData)
            
            if (fallbackResponse && fallbackResponse.code === 1) {
              this.$message.success('评价提交成功！')
              this.evaluationDialogVisible = false
              this.successDialogVisible = true
              
              this.$emit('evaluation-success', {
                orderId: this.evaluationForm.orderId,
                evaluationData: fallbackData
              })
            } else {
              this.$message.error(fallbackResponse?.msg || '评价提交失败')
            }
          } catch (fallbackError) {
            console.error('旧版API也失败:', fallbackError)
            this.$message.error('评价提交失败，请稍后重试')
          }
        } finally {
          this.submitLoading = false
        }
      })
    },
    
    
    // 文件上传成功回调
    handleUploadSuccess(response, file, fileList) {
      console.log('=== handleUploadSuccess 被调用 ===')
      console.log('响应数据:', response)
      console.log('文件对象:', file)
      console.log('文件列表:', fileList)
      
      // 由于上传逻辑已经在 uploadImageManually 中处理，
      // 这里只需要确认状态更新
      console.log('图片上传成功回调，当前uploadedImages:', this.uploadedImages)
    },
    
    // 文件上传失败
    handleUploadError(error) {
      console.error('文件上传失败:', error)
      console.log('尝试使用备用上传方案...')
      
      // 备用方案：使用base64存储
      this.$message.warning('服务器上传失败，将使用本地存储方案')
    },
    
    // 更新图片URLs
    updateImageUrls() {
      console.log('updateImageUrls - 当前uploadedImages:', this.uploadedImages)
      
      const urls = this.uploadedImages
        .map(img => img.url)
        .filter(url => url && url.trim() && url !== 'undefined' && url !== 'null')
      
      this.evaluationForm.imgUrls = urls.join(',')
      
      console.log('更新图片URLs:')
      console.log('- 过滤后的URLs:', urls)
      console.log('- 最终imgUrls:', this.evaluationForm.imgUrls)
      console.log('- imgUrls长度:', this.evaluationForm.imgUrls.length)
    },
    
    // 文件变化处理
    handleFileChange(file, fileList) {
      console.log('=== 文件变化处理 ===')
      console.log('文件信息:', file)
      console.log('文件状态:', file.status)
      console.log('文件列表:', fileList)
      console.log('当前uploadedImages:', this.uploadedImages)
      
      this.fileList = fileList
      
      // 文件状态变化处理
      if (file.status === 'ready') {
        console.log('文件准备上传:', file.name)
      } else if (file.status === 'uploading') {
        console.log('文件正在上传中...')
      } else if (file.status === 'success') {
        console.log('文件上传成功，等待handleUploadSuccess处理')
      } else if (file.status === 'fail') {
        console.log('文件上传失败')
      }
    },
    
    // 手动上传图片 - 按照头像上传的逻辑
    async uploadImageManually(options) {
      try {
        console.log('=== 开始上传评价图片 ===')
        console.log('上传选项:', options)
        console.log('文件对象:', options.file)
        console.log('订单ID:', this.evaluationForm.orderId)
        
        // 准备FormData
        const formData = new FormData()
        formData.append('file', options.file)
        formData.append('uploadType', 'evaluation')
        formData.append('relatedId', this.evaluationForm.orderId)
        
        console.log('评价图片上传数据:', {
          uploadType: 'evaluation',
          relatedId: this.evaluationForm.orderId,
          fileName: options.file.name,
          fileSize: options.file.size,
          fileType: options.file.type
        })
        
        // 调用后端图片上传接口
        const response = await request.post('/travel-portal/upload/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        console.log('评价图片上传响应:', response)
        
        // 解析响应数据
        const data = response.data || response
        const uploadResult = data.data || data.result || data
        
        if (uploadResult && uploadResult.url) {
          console.log('图片上传成功，URL:', uploadResult.url)
          
          // 构建图片信息
          const imageInfo = {
            fileId: uploadResult.fileId || uploadResult.id || Date.now(),
            url: uploadResult.url,
            filename: uploadResult.filename || uploadResult.name || options.file.name,
            size: uploadResult.size || options.file.size
          }
          
          console.log('构建的图片信息:', imageInfo)
          
          // 添加到已上传图片数组
          this.uploadedImages.push(imageInfo)
          
          console.log('添加到uploadedImages:', imageInfo)
          console.log('当前uploadedImages数组:', this.uploadedImages)
          
          // 更新图片URLs
          this.updateImageUrls()
          
          // 更新文件状态
          options.file.status = 'success'
          options.file.url = uploadResult.url
          options.file.response = uploadResult
          
          this.$message.success('图片上传成功！')
          
          // 调用成功回调
          options.onSuccess && options.onSuccess(uploadResult, options.file)
        } else {
          throw new Error('上传响应数据格式错误')
        }
      } catch (error) {
        console.error('评价图片上传失败:', error)
        this.$message.error('图片上传失败: ' + (error.message || '请重试'))
        
        // 调用错误回调
        options.onError && options.onError(error)
      }
    },
    
    // 将图片转换为base64
    convertToBase64(file) {
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        const imageInfo = {
          fileId: 'base64_' + Date.now(),
          url: base64,
          filename: file.name,
          size: file.size
        }
        this.uploadedImages.push(imageInfo)
        
        console.log('convertToBase64 - 添加到uploadedImages:', imageInfo)
        console.log('convertToBase64 - 当前uploadedImages数组:', this.uploadedImages)
        
        // 更新文件状态为成功
        file.status = 'success'
        file.url = base64
        file.response = { code: 200, data: imageInfo }
        
        this.updateImageUrls()
        this.$message.success('图片已保存（本地格式）')
      }
      reader.onerror = () => {
        this.$message.error('图片处理失败，请重试')
      }
      reader.readAsDataURL(file)
    },
    
    // 文件移除
    handleRemove(file) {
      console.log('移除文件:', file)
      console.log('移除前的uploadedImages:', this.uploadedImages)
      
      // 根据文件名或URL找到对应的图片并移除
      if (file.url) {
        // 如果文件有URL，根据URL查找并移除
        const imageIndex = this.uploadedImages.findIndex(img => img.url === file.url)
        if (imageIndex > -1) {
          this.uploadedImages.splice(imageIndex, 1)
          console.log('根据URL移除图片，索引:', imageIndex)
        }
      } else if (file.name) {
        // 如果文件有名称，根据名称查找并移除
        const imageIndex = this.uploadedImages.findIndex(img => img.filename === file.name)
        if (imageIndex > -1) {
          this.uploadedImages.splice(imageIndex, 1)
          console.log('根据文件名移除图片，索引:', imageIndex)
        }
      }
      
      console.log('移除后的uploadedImages:', this.uploadedImages)
      this.updateImageUrls()
    },
    
    // 上传前检查
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      
      if (!allowedTypes.includes(file.type)) {
        this.$message.error('只支持jpg、png、gif格式的图片!')
        return false
      }
      
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      
      return true
    },
    
    // 预览图片
    previewImage(currentUrl, allUrls) {
      console.log('预览图片:', currentUrl, allUrls)
      // 这里可以添加图片预览功能，比如使用Element UI的图片预览组件
      this.$message.info('图片预览功能（点击图片查看大图）')
    },
    
    // 处理图片加载错误
    handleImageError(event) {
      console.log('图片加载失败:', event.target.src)
      event.target.src = '/static/images/default-eval.jpg'
    },
    
    // 根据索引删除图片
    removeImageByIndex(index) {
      console.log('删除图片，索引:', index)
      console.log('删除前的uploadedImages:', this.uploadedImages)
      
      if (index >= 0 && index < this.uploadedImages.length) {
        this.uploadedImages.splice(index, 1)
        console.log('删除后的uploadedImages:', this.uploadedImages)
        this.updateImageUrls()
        this.$message.success('图片已删除')
      }
    },
    
    // 关闭弹窗
    handleDialogClose() {
      this.evaluationDialogVisible = false
      this.$emit('update:visible', false)
    },
    
    // 格式化金额
    formatAmount(amount) {
      if (!amount) return '0.00'
      return Number(amount).toFixed(2)
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())}`
    },
    
    // 补零函数
    padZero(num) {
      return num < 10 ? `0${num}` : num
    }
  }
}
</script>

<style scoped>
.order-evaluation-container {
  padding: 0;
}

.evaluation-content {
  padding: 0;
}

.order-info-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

.order-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.order-detail {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.order-detail .label {
  color: #606266;
  font-size: 14px;
  min-width: 80px;
}

.order-detail .value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.order-detail .value.price {
  color: #f56c6c;
  font-weight: 600;
}

.evaluation-form {
  margin-top: 20px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rating-tips {
  color: #909399;
  font-size: 14px;
  margin-left: 10px;
}

.dialog-footer {
  text-align: right;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-content p {
  margin: 10px 0;
  color: #303133;
}

.reward-text {
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}

/* 文件上传样式优化 */
::v-deep .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}

::v-deep .el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

/* 评分组件样式优化 */
::v-deep .el-rate {
  display: inline-block;
}

::v-deep .el-rate__text {
  margin-left: 10px;
  color: #ff9900;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rating-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-detail {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-detail .label {
    min-width: auto;
    margin-bottom: 5px;
  }
}

/* 图片预览样式 */
.image-preview-section {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.image-preview-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.image-preview-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.preview-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.05);
}

.image-info {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}

.filename {
  font-size: 12px;
  color: #606266;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.remove-btn {
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.remove-btn:hover {
  background-color: #f78989;
}
</style>
