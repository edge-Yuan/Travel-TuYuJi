<template>
  <div class="pending-orders">
    <h2>待完成订单</h2>
    
    <div class="filter-bar">
      <input type="text" v-model="searchKeyword" placeholder="搜索订单号或客户名称">
      <select v-model="filterStatus">
        <option value="">全部状态</option>
        <option value="pending">待确认</option>
        <option value="confirmed">已确认</option>
        <option value="processing">处理中</option>
      </select>
    </div>
    
    <div class="orders-table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>客户名称</th>
            <th>旅游团名称</th>
            <th>行程日期</th>
            <th>订单状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>{{ order.orderNumber }}</td>
            <td>{{ order.customerName }}</td>
            <td>{{ order.tourGroupName }}</td>
            <td>{{ formatDate(order.tourDate) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td class="actions">
              <button class="btn view-btn" @click="viewOrderDetails(order.id)">查看</button>
              <button class="btn accept-btn" @click="acceptOrder(order.id)" 
                      v-if="order.status === 'pending'">接受</button>
              <button class="btn reject-btn" @click="rejectOrder(order.id)"
                      v-if="order.status === 'pending'">拒绝</button>
              <button class="btn itinerary-btn" @click="createItinerary(order.id)"
                      v-if="order.status === 'confirmed' || order.status === 'processing'">
                创建行程
              </button>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="6" class="no-data">没有找到匹配的订单</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination" v-if="orders.length > 0">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PendingOrders',
  data() {
    return {
      orders: [],
      searchKeyword: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    filteredOrders() {
      // 过滤订单
      let result = this.orders.filter(order => {
        const matchesSearch = order.orderNumber.includes(this.searchKeyword) || 
                             order.customerName.includes(this.searchKeyword) ||
                             order.tourGroupName.includes(this.searchKeyword)
                             
        const matchesStatus = !this.filterStatus || order.status === this.filterStatus
        
        return matchesSearch && matchesStatus
      })
      
      // 分页处理
      const startIndex = (this.currentPage - 1) * this.pageSize
      return result.slice(startIndex, startIndex + this.pageSize)
    },
    totalPages() {
      const filteredCount = this.orders.filter(order => {
        // const matchesSearch = order.orderNumber.includes(this.searchKeyword) || 
        //                      order.customerName.includes(this.searchKeyword) ||
        //                      order.tourGroupName.includes(this.searchKeyword)
                             
        return !this.filterStatus || order.status === this.filterStatus
      }).length
      
      return Math.ceil(filteredCount / this.pageSize)
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        // 模拟从API加载订单数据
        // const response = await this.$axios.get('/api/orders/pending')
        // this.orders = response.data
        
        // 生成模拟数据
        this.orders = []
        const statuses = ['pending', 'confirmed', 'processing']
        const tourGroups = ['经典北京5日游', '海南三亚度假游', '云南丽江风情游', '桂林山水甲天下', '张家界探险之旅']
        
        for (let i = 1; i <= 25; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          this.orders.push({
            id: i,
            orderNumber: 'ORD' + new Date().getFullYear() + 
                        (new Date().getMonth() + 1).toString().padStart(2, '0') + 
                        Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            customerName: `客户${i}`,
            tourGroupName: tourGroups[Math.floor(Math.random() * tourGroups.length)],
            tourDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            status: status
          })
        }
      } catch (error) {
        this.$message.error('加载订单失败')
        console.error('加载订单失败:', error)
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    },
    
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待确认'
        case 'confirmed': return '已确认'
        case 'processing': return '处理中'
        default: return '未知状态'
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'pending': return 'pending'
        case 'confirmed': return 'confirmed'
        case 'processing': return 'processing'
        default: return ''
      }
    },
    
    viewOrderDetails(orderId) {
      this.$message.info(`查看订单 ${orderId} 的详情`)
      // 实际项目中可以跳转到详情页
      // this.$router.push(`/order/detail/${orderId}`)
    },
    
    async acceptOrder(orderId) {
      try {
        // 模拟接受订单API调用
        // await this.$axios.put(`/api/orders/${orderId}/accept`)
        
        // 更新本地数据
        const order = this.orders.find(o => o.id === orderId)
        if (order) {
          order.status = 'confirmed'
        }
        this.$message.success('已接受订单')
      } catch (error) {
        this.$message.error('操作失败，请重试')
        console.error('接受订单失败:', error)
      }
    },
    
    async rejectOrder(orderId) {
      try {
        // 模拟拒绝订单API调用
        // await this.$axios.put(`/api/orders/${orderId}/reject`)
        
        // 从列表中移除拒绝的订单
        this.orders = this.orders.filter(o => o.id !== orderId)
        this.$message.success('已拒绝订单')
      } catch (error) {
        this.$message.error('操作失败，请重试')
        console.error('拒绝订单失败:', error)
      }
    },
    
    createItinerary(orderId) {
      // 跳转到创建行程页面，并传递订单ID
      this.$router.push({ path: '/order/itinerary', query: { orderId: orderId } })
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
.pending-orders {
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

.orders-table-container {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 768px;
}

.orders-table th,
.orders-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
}

.orders-table tr:hover {
  background-color: #f9f9f9;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.processing {
  background-color: #cce5ff;
  color: #004085;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #e9ecef;
  color: #495057;
}

.view-btn:hover {
  background-color: #dee2e6;
}

.accept-btn {
  background-color: #28a745;
  color: white;
}

.accept-btn:hover {
  background-color: #218838;
}

.reject-btn {
  background-color: #dc3545;
  color: white;
}

.reject-btn:hover {
  background-color: #c82333;
}

.itinerary-btn {
  background-color: #007bff;
  color: white;
}

.itinerary-btn:hover {
  background-color: #0069d9;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
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
</style>
