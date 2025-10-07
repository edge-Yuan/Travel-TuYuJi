<template>
  <div class="data-debug">
    <h2>数据调试页面</h2>
    
    <el-card class="debug-card">
      <h3>用户信息</h3>
      <p>用户ID: {{ currentUserId }}</p>
      <p>Token状态: {{ tokenStatus }}</p>
    </el-card>
    
    <el-card class="debug-card">
      <h3>行程数据状态分布</h3>
      <el-table :data="statusStats" border>
        <el-table-column prop="status" label="状态值" width="100" />
        <el-table-column prop="statusText" label="状态文本" width="120" />
        <el-table-column prop="count" label="数量" width="100" />
        <el-table-column prop="percentage" label="占比" width="100" />
      </el-table>
    </el-card>
    
    <el-card class="debug-card">
      <h3>原始数据样本</h3>
      <pre>{{ JSON.stringify(sampleData, null, 2) }}</pre>
    </el-card>
    
    <el-card class="debug-card">
      <h3>API测试</h3>
      <el-button @click="testItineraryAPI" :loading="loading">测试行程API</el-button>
      <el-button @click="testOrderAPI" :loading="loading">测试订单API</el-button>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import debugHelper from '@/utils/debugHelper'

export default {
  name: 'DataDebug',
  data() {
    return {
      currentUserId: null,
      tokenStatus: '未检查',
      statusStats: [],
      sampleData: null,
      loading: false
    }
  },
  mounted() {
    this.initUserInfo()
  },
  methods: {
    initUserInfo() {
      try {
        // 检查用户ID
        const localUserId = localStorage.getItem('userId')
        const sessionUserId = sessionStorage.getItem('userId')
        const localToken = localStorage.getItem('token')
        const sessionToken = sessionStorage.getItem('token')
        
        this.currentUserId = localUserId || sessionUserId || null
        
        if (localToken || sessionToken) {
          this.tokenStatus = '存在'
        } else {
          this.tokenStatus = '不存在'
        }
        
        // 如果都没有，使用默认值
        if (!this.currentUserId) {
          this.currentUserId = 10003
        }
        
        console.log('调试页面 - 用户ID:', this.currentUserId)
        console.log('调试页面 - Token状态:', this.tokenStatus)
      } catch (error) {
        console.error('初始化用户信息失败:', error)
      }
    },
    
    async testItineraryAPI() {
      this.loading = true
      try {
        console.log('🔍 测试行程API...')
        
        const params = {
          userId: Number(this.currentUserId),
          current: 1,
          page: 1,
          size: 20
        }
        
        debugHelper.logApiRequest('/travel-portal/itinerary/list', params)
        
        const response = await request.get('/travel-portal/itinerary/list', { params })
        
        debugHelper.logApiResponse(response, '行程API测试')
        
        const body = response && (response.data || response)
        const payload = body && (body.data || body.result || body)
        const records = payload && (payload.records || payload.list || [])
        
        if (Array.isArray(records)) {
          // 统计状态分布
          const statusCount = {}
          records.forEach(r => {
            const status = r.orderStatus
            statusCount[status] = (statusCount[status] || 0) + 1
          })
          
          console.log('📊 行程数据状态分布:', statusCount)
          
          // 更新状态统计
          this.statusStats = Object.entries(statusCount).map(([status, count]) => ({
            status: status,
            statusText: this.getStatusText(Number(status)),
            count: count,
            percentage: ((count / records.length) * 100).toFixed(1) + '%'
          }))
          
          // 保存样本数据
          this.sampleData = records.slice(0, 3)
          
          this.$message.success(`成功获取 ${records.length} 条行程数据`)
        } else {
          this.$message.warning('未获取到行程数据')
        }
      } catch (error) {
        console.error('测试行程API失败:', error)
        this.$message.error('测试失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    
    async testOrderAPI() {
      this.loading = true
      try {
        console.log('🔍 测试订单API...')
        
        debugHelper.logApiRequest(`/travel-portal/tourOrder/user/${this.currentUserId}`, {})
        
        const response = await request.get(`/travel-portal/tourOrder/user/${this.currentUserId}`)
        
        debugHelper.logApiResponse(response, '订单API测试')
        
        const payload = response.data || response
        const records = Array.isArray(payload) ? payload : (Array.isArray(payload?.records) ? payload.records : [])
        
        if (Array.isArray(records)) {
          // 统计状态分布
          const statusCount = {}
          records.forEach(r => {
            const status = r.orderStatus
            statusCount[status] = (statusCount[status] || 0) + 1
          })
          
          console.log('📊 订单数据状态分布:', statusCount)
          
          this.$message.success(`成功获取 ${records.length} 条订单数据`)
        } else {
          this.$message.warning('未获取到订单数据')
        }
      } catch (error) {
        console.error('测试订单API失败:', error)
        this.$message.error('测试失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '待确认',
        1: '已确认',
        2: '已完成',
        3: '已取消',
        4: '退款中'
      }
      return statusMap[status] || '未知状态'
    }
  }
}
</script>

<style scoped>
.data-debug {
  padding: 20px;
}

.debug-card {
  margin-bottom: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
