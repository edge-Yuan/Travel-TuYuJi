<template>
  <div class="process-tracking">
    <h2>处理进度查询</h2>
    
    <div class="search-container">
      <input type="text" v-model="orderNumber" placeholder="请输入订单号查询进度">
      <button class="search-btn" @click="searchOrder">查询</button>
    </div>
    
    <div class="order-process" v-if="currentOrder">
      <div class="order-header">
        <h3>订单 #{{ currentOrder.orderNumber }}</h3>
        <div class="order-info">
          <p><strong>客户名称：</strong>{{ currentOrder.customerName }}</p>
          <p><strong>旅游团名称：</strong>{{ currentOrder.tourGroupName }}</p>
          <p><strong>行程日期：</strong>{{ formatDate(currentOrder.tourDate) }}</p>
          <p><strong>当前状态：</strong>
            <span class="status-badge" :class="getStatusClass(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </span>
          </p>
        </div>
      </div>
      
      <div class="process-timeline">
        <div class="timeline-track"></div>
        
        <div class="timeline-items">
          <div class="timeline-item" :class="{ completed: currentOrder.status !== 'pending' }">
            <div class="timeline-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="timeline-content">
              <h4>订单创建</h4>
              <p class="time">{{ formatDate(currentOrder.createTime) }}</p>
              <p class="description">客户提交订单，等待导游确认</p>
            </div>
          </div>
          
          <div class="timeline-item" :class="{ completed: currentOrder.status !== 'pending' && currentOrder.status !== 'confirmed' }">
            <div class="timeline-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="timeline-content">
              <h4>订单确认</h4>
              <p class="time">{{ currentOrder.confirmTime ? formatDate(currentOrder.confirmTime) : '待处理' }}</p>
              <p class="description">导游已确认订单，开始安排行程</p>
            </div>
          </div>
          
          <div class="timeline-item" :class="{ completed: currentOrder.status === 'processing' && currentOrder.itineraryCreated }">
            <div class="timeline-icon">
              <i class="fas fa-map"></i>
            </div>
            <div class="timeline-content">
              <h4>行程创建</h4>
              <p class="time">{{ currentOrder.itineraryTime ? formatDate(currentOrder.itineraryTime) : '待创建' }}</p>
              <p class="description">导游已创建详细行程安排</p>
            </div>
          </div>
          
          <div class="timeline-item" :class="{ completed: currentOrder.status === 'processing' && currentOrder.tourStarted }">
            <div class="timeline-icon">
              <i class="fas fa-flag-checkered"></i>
            </div>
            <div class="timeline-content">
              <h4>行程开始</h4>
              <p class="time">{{ currentOrder.startTime ? formatDate(currentOrder.startTime) : '未开始' }}</p>
              <p class="description">旅游团已出发，行程正式开始</p>
            </div>
          </div>
          
          <div class="timeline-item" :class="{ completed: currentOrder.status === 'completed' }">
            <div class="timeline-icon">
              <i class="fas fa-check-double"></i>
            </div>
            <div class="timeline-content">
              <h4>行程完成</h4>
              <p class="time">{{ currentOrder.completeTime ? formatDate(currentOrder.completeTime) : '未完成' }}</p>
              <p class="description">旅游行程已顺利完成</p>
            </div>
          </div>
          
          <div class="timeline-item" :class="{ completed: currentOrder.status === 'completed' && currentOrder.evaluated }">
            <div class="timeline-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="timeline-content">
              <h4>评价完成</h4>
              <p class="time">{{ currentOrder.evaluateTime ? formatDate(currentOrder.evaluateTime) : '未评价' }}</p>
              <p class="description">客户已完成评价，订单流程结束</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="process-notes" v-if="currentOrder.processNotes && currentOrder.processNotes.length > 0">
        <h3>处理记录</h3>
        <div class="note-item" v-for="(note, index) in currentOrder.processNotes" :key="index">
          <div class="note-time">{{ formatDate(note.time) }}</div>
          <div class="note-content">{{ note.content }}</div>
        </div>
      </div>
    </div>
    
    <div class="no-result" v-if="searchPerformed && !currentOrder">
      未找到订单号为 "{{ orderNumber }}" 的订单，请检查订单号是否正确
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessTracking',
  data() {
    return {
      orderNumber: '',
      currentOrder: null,
      searchPerformed: false,
      // 模拟订单数据库
      mockOrders: []
    }
  },
  mounted() {
    // 初始化模拟订单数据
    this.initMockOrders()
  },
  methods: {
    initMockOrders() {
      const statuses = ['pending', 'confirmed', 'processing', 'completed']
      const tourGroups = ['经典北京5日游', '海南三亚度假游', '云南丽江风情游', '桂林山水甲天下', '张家界探险之旅']
      
      for (let i = 1; i <= 10; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const now = new Date()
        const createTime = new Date(now - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
        
        // 根据状态设置不同的时间点
        let confirmTime = null
        let itineraryTime = null
        let startTime = null
        let completeTime = null
        let evaluateTime = null
        let itineraryCreated = false
        let tourStarted = false
        let evaluated = false
        
        if (status !== 'pending') {
          confirmTime = new Date(createTime.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000))
          
          if (status !== 'confirmed') {
            itineraryCreated = true
            itineraryTime = new Date(confirmTime.getTime() + Math.floor(Math.random() * 48 * 60 * 60 * 1000))
            
            if (status === 'processing' || status === 'completed') {
              tourStarted = true
              startTime = new Date(itineraryTime.getTime() + Math.floor(Math.random() * 72 * 60 * 60 * 1000))
              
              if (status === 'completed') {
                completeTime = new Date(startTime.getTime() + Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000)
                evaluated = Math.random() > 0.3
                if (evaluated) {
                  evaluateTime = new Date(completeTime.getTime() + Math.floor(Math.random() * 48 * 60 * 60 * 1000))
                }
              }
            }
          }
        }
        
        // 处理记录
        const processNotes = []
        if (status !== 'pending') {
          processNotes.push({
            time: confirmTime,
            content: '导游已确认订单，将尽快安排行程'
          })
          
          if (itineraryCreated) {
            processNotes.push({
              time: itineraryTime,
              content: '行程已创建，详情已发送给客户'
            })
            
            if (tourStarted) {
              processNotes.push({
                time: startTime,
                content: '旅游团已出发，行程正式开始'
              })
              
              if (status === 'completed') {
                processNotes.push({
                  time: completeTime,
                  content: '行程已顺利完成，感谢参与'
                })
              }
            }
          }
        }
        
        this.mockOrders.push({
          id: i,
          orderNumber: 'ORD' + createTime.getFullYear() + 
                      (createTime.getMonth() + 1).toString().padStart(2, '0') + 
                      Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          customerName: `客户${i}`,
          tourGroupName: tourGroups[Math.floor(Math.random() * tourGroups.length)],
          tourDate: new Date(startTime || now.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          status: status,
          createTime: createTime,
          confirmTime: confirmTime,
          itineraryTime: itineraryTime,
          startTime: startTime,
          completeTime: completeTime,
          evaluateTime: evaluateTime,
          itineraryCreated: itineraryCreated,
          tourStarted: tourStarted,
          evaluated: evaluated,
          processNotes: processNotes
        })
      }
    },
    
    searchOrder() {
      if (!this.orderNumber.trim()) {
        this.$message.warning('请输入订单号')
        return
      }
      
      this.searchPerformed = true
      // 在模拟订单中查找
      this.currentOrder = this.mockOrders.find(order => 
        order.orderNumber === this.orderNumber.trim()
      )
      
      // 如果没找到，尝试部分匹配
      if (!this.currentOrder) {
        this.currentOrder = this.mockOrders.find(order => 
          order.orderNumber.includes(this.orderNumber.trim())
        )
      }
    },
    
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    },
    
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待确认'
        case 'confirmed': return '已确认'
        case 'processing': return '处理中'
        case 'completed': return '已完成'
        default: return '未知状态'
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'pending': return 'pending'
        case 'confirmed': return 'confirmed'
        case 'processing': return 'processing'
        case 'completed': return 'completed'
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.process-tracking {
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

.search-container {
  display: flex;
  max-width: 600px;
  margin: 20px auto 30px;
  gap: 10px;
}

.search-container input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #2980b9;
}

.order-process {
  max-width: 800px;
  margin: 0 auto;
}

.order-header {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px 20px;
  margin-bottom: 30px;
  text-align: left;
}

.order-header h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.order-info p {
  margin: 8px 0;
  color: #495057;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.confirmed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.process-timeline {
  position: relative;
  margin: 30px 0 40px;
  padding-left: 30px;
}

.timeline-track {
  position: absolute;
  top: 0;
  left: 14px;
  width: 2px;
  height: 100%;
  background-color: #e9ecef;
}

.timeline-items {
  position: relative;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
  padding-bottom: 10px;
}

.timeline-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
}

.timeline-icon {
  position: absolute;
  left: -30px;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  z-index: 1;
}

.timeline-item.completed .timeline-icon {
  background-color: #3498db;
  color: white;
}

.timeline-content {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.timeline-item.completed .timeline-content {
  background-color: #f0f7ff;
  border-left: 3px solid #3498db;
}

.timeline-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.time {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 5px 0;
}

.description {
  margin: 0;
  color: #495057;
  font-size: 0.95rem;
}

.process-notes {
  margin-top: 40px;
  text-align: left;
}

.process-notes h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.note-item {
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.note-time {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.note-content {
  margin: 0;
  color: #495057;
}

.no-result {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}
</style>
