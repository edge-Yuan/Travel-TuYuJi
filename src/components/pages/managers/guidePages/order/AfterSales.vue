<template>
  <div class="after-sales">
    <h2>售后处理</h2>
    
    <div class="filter-bar">
      <input type="text" v-model="searchKeyword" placeholder="搜索订单号或客户名称">
      <select v-model="filterStatus">
        <option value="">全部状态</option>
        <option value="pending">待处理</option>
        <option value="processing">处理中</option>
        <option value="resolved">已解决</option>
        <option value="rejected">已拒绝</option>
      </select>
    </div>
    
    <div class="service-requests">
      <div class="request-card" v-for="request in filteredRequests" :key="request.id">
        <div class="request-header">
          <div class="request-info">
            <h3>售后请求 #{{ request.id }}</h3>
            <p><strong>订单号：</strong>{{ request.orderNumber }}</p>
            <p><strong>客户名称：</strong>{{ request.customerName }}</p>
            <p><strong>提交时间：</strong>{{ formatDate(request.submitTime) }}</p>
          </div>
          <div class="request-status">
            <span class="status-badge" :class="getStatusClass(request.status)">
              {{ getStatusText(request.status) }}
            </span>
          </div>
        </div>
        
        <div class="request-content">
          <h4>问题描述：</h4>
          <p class="description">{{ request.description }}</p>
          
          <div v-if="request.images && request.images.length > 0" class="request-images">
            <h4>相关图片：</h4>
            <div class="image-grid">
              <img v-for="(img, index) in request.images" :key="index" :src="img" :alt="'问题图片 ' + (index + 1)" 
                   class="request-image" @click="previewImage(img)">
            </div>
          </div>
          
          <div v-if="request.processRecords && request.processRecords.length > 0" class="process-records">
            <h4>处理记录：</h4>
            <div class="record-item" v-for="(record, index) in request.processRecords" :key="index">
              <div class="record-time">{{ formatDate(record.time) }}</div>
              <div class="record-content">{{ record.content }}</div>
            </div>
          </div>
        </div>
        
        <div class="request-actions" v-if="request.status === 'pending' || request.status === 'processing'">
          <div class="action-form">
            <textarea v-model="request.processContent" placeholder="请输入处理意见或回复内容"></textarea>
            <div class="action-buttons">
              <button class="btn resolve-btn" @click="handleRequest(request.id, 'resolved')" 
                      v-if="request.status !== 'resolved'">
                标记为已解决
              </button>
              <button class="btn reject-btn" @click="handleRequest(request.id, 'rejected')"
                      v-if="request.status !== 'rejected'">
                拒绝请求
              </button>
              <button class="btn process-btn" @click="handleRequest(request.id, 'processing')"
                      v-if="request.status === 'pending'">
                标记为处理中
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredRequests.length === 0" class="no-data">
        没有找到匹配的售后请求
      </div>
    </div>
    
    <div class="pagination" v-if="serviceRequests.length > 0">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
    
    <!-- 图片预览弹窗 -->
    <div class="image-preview" v-if="previewImgUrl">
      <div class="preview-overlay" @click="closePreview"></div>
      <div class="preview-content">
        <button class="close-btn" @click="closePreview">
          <i class="fas fa-times"></i>
        </button>
        <img :src="previewImgUrl" alt="图片预览">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AfterSales',
  data() {
    return {
      serviceRequests: [],
      searchKeyword: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 5,
      previewImgUrl: ''
    }
  },
  computed: {
    filteredRequests() {
      // 过滤售后请求
      let result = this.serviceRequests.filter(request => {
        const matchesSearch = request.orderNumber.includes(this.searchKeyword) || 
                             request.customerName.includes(this.searchKeyword) ||
                             request.description.includes(this.searchKeyword)
                             
        const matchesStatus = !this.filterStatus || request.status === this.filterStatus
        
        return matchesSearch && matchesStatus
      })
      
      // 分页处理
      const startIndex = (this.currentPage - 1) * this.pageSize
      return result.slice(startIndex, startIndex + this.pageSize)
    },
    totalPages() {
      const filteredCount = this.serviceRequests.filter(request => {
        // const matchesSearch = request.orderNumber.includes(this.searchKeyword) || 
        //                      request.customerName.includes(this.searchKeyword) ||
        //                      request.description.includes(this.searchKeyword)
                             
        return !this.filterStatus || request.status === this.filterStatus
      }).length
      
      return Math.ceil(filteredCount / this.pageSize)
    }
  },
  mounted() {
    this.loadServiceRequests()
  },
  methods: {
    async loadServiceRequests() {
      try {
        // 模拟从API加载售后请求
        // const response = await this.$axios.get('/api/after-sales')
        // this.serviceRequests = response.data
        
        // 生成模拟数据
        this.serviceRequests = []
        const statuses = ['pending', 'processing', 'resolved', 'rejected']
        const issues = [
          '行程与描述不符，景点减少了',
          '预订的酒店与实际入住的不一致',
          '导游服务态度不好',
          '交通安排不合理，等待时间过长',
          '餐饮质量差，与标准不符',
          '行程安排过于紧凑，体验不好'
        ]
        
        for (let i = 1; i <= 12; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const hasImages = Math.random() > 0.3
          const hasRecords = status !== 'pending' && Math.random() > 0.2
          
          const request = {
            id: i,
            orderNumber: 'ORD' + new Date().getFullYear() + 
                        (new Date().getMonth() + 1).toString().padStart(2, '0') + 
                        Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            customerName: `客户${i}`,
            submitTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            status: status,
            description: issues[Math.floor(Math.random() * issues.length)],
            processContent: '',
            images: []
          }
          
          // 添加图片
          if (hasImages) {
            const imageCount = Math.floor(Math.random() * 3) + 1
            for (let j = 0; j < imageCount; j++) {
              request.images.push(`https://picsum.photos/seed/${i}${j}/300/200`)
            }
          }
          
          // 添加处理记录
          if (hasRecords) {
            request.processRecords = []
            const recordCount = Math.floor(Math.random() * 2) + 1
            for (let k = 0; k < recordCount; k++) {
              request.processRecords.push({
                time: new Date(Date.parse(request.submitTime) + 
                              Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
                content: `已收到您的反馈，我们会尽快处理。${k > 0 ? '正在与相关部门沟通解决。' : ''}`
              })
            }
          }
          
          this.serviceRequests.push(request)
        }
        
        // 按提交时间排序（最新的在前）
        this.serviceRequests.sort((a, b) => 
          new Date(b.submitTime) - new Date(a.submitTime)
        )
      } catch (error) {
        this.$message.error('加载售后请求失败')
        console.error('加载售后请求失败:', error)
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待处理'
        case 'processing': return '处理中'
        case 'resolved': return '已解决'
        case 'rejected': return '已拒绝'
        default: return '未知状态'
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'pending': return 'pending'
        case 'processing': return 'processing'
        case 'resolved': return 'resolved'
        case 'rejected': return 'rejected'
        default: return ''
      }
    },
    
    async handleRequest(requestId, status) {
      const request = this.serviceRequests.find(r => r.id === requestId)
      
      if (!request) return
      
      // 验证是否填写了处理内容
      if (!request.processContent.trim()) {
        this.$message.error('请输入处理意见或回复内容')
        return
      }
      
      try {
        // 构建处理数据
        // const processData = {
        //   status: status,
        //   content: request.processContent
        // }
        
        // 模拟处理售后请求API调用
        // await this.$axios.put(`/api/after-sales/${requestId}`, processData)
        
        // 更新本地数据
        request.status = status
        
        // 添加处理记录
        if (!request.processRecords) {
          request.processRecords = []
        }
        
        request.processRecords.push({
          time: new Date().toISOString(),
          content: request.processContent
        })
        
        // 清空处理内容
        request.processContent = ''
        
        this.$message.success(`售后请求已${this.getStatusText(status)}`)
      } catch (error) {
        this.$message.error('处理失败，请重试')
        console.error('处理售后请求失败:', error)
      }
    },
    
    previewImage(url) {
      this.previewImgUrl = url
    },
    
    closePreview() {
      this.previewImgUrl = ''
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  }
}
</script>

<style scoped>
.after-sales {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-top: 0;
  text-align: left;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar input,
.filter-bar select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-bar input {
  flex: 1;
  min-width: 200px;
}

.filter-bar select {
  width: 180px;
}

.service-requests {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.request-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.request-header {
  display: flex;
  justify-content: space-between;
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.request-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.request-info p {
  margin: 5px 0;
  color: #495057;
  font-size: 0.95rem;
}

.request-status {
  display: flex;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.resolved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.request-content {
  padding: 15px 20px;
  text-align: left;
}

.request-content h4 {
  margin: 15px 0 8px 0;
  color: #34495e;
  font-size: 1.05rem;
}

.description {
  line-height: 1.6;
  color: #495057;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.request-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.request-image:hover {
  transform: scale(1.05);
}

.process-records {
  margin-top: 15px;
}

.record-item {
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 2px solid #3498db;
}

.record-time {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 3px;
}

.record-content {
  font-size: 0.95rem;
  color: #495057;
}

.request-actions {
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e9ecef;
}

.action-form textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  min-height: 100px;
  margin-bottom: 15px;
  resize: vertical;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.process-btn {
  background-color: #007bff;
  color: white;
}

.process-btn:hover {
  background-color: #0069d9;
}

.resolve-btn {
  background-color: #28a745;
  color: white;
}

.resolve-btn:hover {
  background-color: #218838;
}

.reject-btn {
  background-color: #dc3545;
  color: white;
}

.reject-btn:hover {
  background-color: #c82333;
}

.no-data {
  text-align: center;
  padding: 60px 0;
  color: #6c757d;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 10px 0;
}

.pagination button {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover {
  background-color: #e9ecef;
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.preview-content img {
  max-width: 100%;
  max-height: 80vh;
  border: 4px solid white;
  border-radius: 4px;
}

.close-btn {
  position: absolute;
  top: -30px;
  right: -30px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
