<template>
  <div class="create-itinerary">
    <h2>创建行程安排</h2>
    
    <div class="order-info" v-if="selectedOrder">
      <h3>订单信息</h3>
      <p><strong>订单号：</strong>{{ selectedOrder.orderNumber }}</p>
      <p><strong>客户名称：</strong>{{ selectedOrder.customerName }}</p>
      <p><strong>旅游团名称：</strong>{{ selectedOrder.tourGroupName }}</p>
      <p><strong>行程日期：</strong>{{ formatDate(selectedOrder.tourDate) }}</p>
    </div>
    
    <form class="itinerary-form" @submit.prevent="saveItinerary">
      <div class="form-group">
        <label for="title">行程标题</label>
        <input type="text" id="title" v-model="itinerary.title" required 
               placeholder="例如：北京五日精华游行程安排">
      </div>
      
      <div class="form-group">
        <label for="days">行程天数</label>
        <input type="number" id="days" v-model="itinerary.days" min="1" required>
      </div>
      
      <div class="form-group">
        <label>每日行程安排</label>
        <div class="day-itineraries">
          <div v-for="(day, index) in itinerary.dailyPlans" :key="index" class="day-plan">
            <div class="day-header">
              <h4>第 {{ index + 1 }} 天</h4>
              <button type="button" class="remove-day-btn" @click="removeDay(index)" 
                      v-if="itinerary.dailyPlans.length > 1">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="form-group">
              <label>当天主题</label>
              <input type="text" v-model="day.theme" placeholder="例如：天安门广场与故宫一日游">
            </div>
            
            <div class="form-group">
              <label>时间段</label>
              <select v-model="day.timePeriod" class="form-select">
                <option value="">请选择时间段</option>
                <option value="早上">早上 (06:00-12:00)</option>
                <option value="中午">中午 (12:00-14:00)</option>
                <option value="下午">下午 (14:00-18:00)</option>
                <option value="晚上">晚上 (18:00-22:00)</option>
                <option value="全天">全天</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>行程安排</label>
              <textarea v-model="day.schedule" rows="4" 
                        placeholder="详细描述当天的行程安排，包括时间点、地点、活动内容等"></textarea>
            </div>
            
            <div class="form-group">
              <label>餐饮安排</label>
              <input type="text" v-model="day.meals" placeholder="例如：含早中晚餐">
            </div>
            
            <div class="form-group">
              <label>住宿安排</label>
              <input type="text" v-model="day.accommodation" placeholder="例如：北京XX酒店">
            </div>
            
            <div class="form-group">
              <label>注意事项</label>
              <textarea v-model="day.notes" rows="2" placeholder="当天行程的注意事项"></textarea>
            </div>
          </div>
        </div>
        
        <button type="button" class="add-day-btn" @click="addDay">
          <i class="fas fa-plus"></i> 添加一天
        </button>
      </div>
      
      <div class="form-group">
        <label for="notes">总体注意事项</label>
        <textarea id="notes" v-model="itinerary.notes" rows="3" 
                  placeholder="整个行程的总体注意事项，如必备物品、安全提示等"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn cancel-btn" @click="cancel">取消</button>
        <button type="submit" class="btn save-btn">保存行程</button>
      </div>
    </form>
  </div>
</template>
<script>
import request from '@/utils/request';

export default {
  name: 'CreateItinerary',
  data() {
    return {
      selectedOrder: null,
      itinerary: {
        title: '',
        days: 1,
        dailyPlans: [
          {
            theme: '',
            timePeriod: '',
            schedule: '',
            meals: '',
            accommodation: '',
            notes: ''
          }
        ],
        notes: ''
      }
    }
  },
  mounted() {
    const orderId = this.$route.query.orderId
    if (orderId) {
      this.loadOrderDetails(orderId)
    }
  },
  watch: {
    'itinerary.days'(newVal, oldVal) {
      // 当行程天数变化时，调整每日计划的数量
      const diff = newVal - oldVal
      if (diff > 0) {
        // 增加天数
        for (let i = 0; i < diff; i++) {
          this.addDay()
        }
      } else if (diff < 0) {
        // 减少天数
        this.itinerary.dailyPlans = this.itinerary.dailyPlans.slice(0, newVal)
      }
    }
  },
  methods: {
    async loadOrderDetails(orderId) {
      try {
        // 模拟从API加载订单详情
        // const response = await this.$axios.get(`/api/orders/${orderId}`)
        // this.selectedOrder = response.data
        
        // 模拟数据
        const tourGroups = ['经典北京5日游', '海南三亚度假游', '云南丽江风情游', '桂林山水甲天下', '张家界探险之旅']
        this.selectedOrder = {
          id: parseInt(orderId),
          orderNumber: 'ORD' + new Date().getFullYear() + 
                      (new Date().getMonth() + 1).toString().padStart(2, '0') + 
                      Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          customerName: `客户${orderId}`,
          tourGroupName: tourGroups[Math.floor(Math.random() * tourGroups.length)],
          tourDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed'
        }
        
        // 自动填充行程标题
        this.itinerary.title = `${this.selectedOrder.tourGroupName}行程安排`
      } catch (error) {
        this.$message.error('加载订单详情失败')
        console.error('加载订单详情失败:', error)
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    },
    
    addDay() {
      this.itinerary.dailyPlans.push({
        theme: '',
        timePeriod: '',
        schedule: '',
        meals: '',
        accommodation: '',
        notes: ''
      })
      // 更新天数
      this.itinerary.days = this.itinerary.dailyPlans.length
    },
    
    removeDay(index) {
      this.itinerary.dailyPlans.splice(index, 1)
      // 更新天数
      this.itinerary.days = this.itinerary.dailyPlans.length
    },
    
    async saveItinerary() {
      try {
        // 简单验证
        if (!this.itinerary.title) {
          this.$message.error('请填写行程标题')
          return
        }
        
        if (this.itinerary.dailyPlans.some(day => !day.theme || !day.schedule)) {
          this.$message.error('请完善每天的行程主题和安排')
          return
        }
        
        // 构建要保存的行程数据
        const saveData = {
          title: this.itinerary.title,
          days: this.itinerary.days,
          notes: this.itinerary.notes,
          orderId: this.selectedOrder ? this.selectedOrder.id : null,
          dailyPlans: this.itinerary.dailyPlans.map((day, index) => ({
            daySeq: index + 1,
            title: day.theme,
            timePeriod: day.timePeriod || '全天', // 默认全天
            description: day.schedule,
            meals: day.meals,
            accommodation: day.accommodation,
            traffic: '', // 可以后续添加
            notes: day.notes
          }))
        }
        
        // 调用后端API保存行程
        const response = await request({
          url: '/travel-portal/productDailyItinerary/create',
          method: 'post',
          data: saveData
        })
        
        if (response && response.code === 1) {
          this.$message.success('行程创建成功')
          this.$router.push('/order/pending')
        } else {
          this.$message.error(response?.msg || '保存行程失败')
        }
      } catch (error) {
        this.$message.error('保存行程失败，请重试')
        console.error('保存行程失败:', error)
      }
    },
    
    cancel() {
      this.$router.push('/order/pending')
    }
  }
}
</script>

<style scoped>
.create-itinerary {
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

.order-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 25px;
  text-align: left;
}

.order-info h3 {
  margin-top: 0;
  color: #34495e;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.itinerary-form {
  max-width: 1000px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-select {
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
  appearance: none;
  cursor: pointer;
}

.day-itineraries {
  margin-bottom: 15px;
}

.day-plan {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.day-header h4 {
  margin: 0;
  color: #2c3e50;
}

.remove-day-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-day-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.add-day-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-day-btn:hover {
  background-color: #2980b9;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background-color: #ecf0f1;
  color: #7f8c8d;
  border: 1px solid #bdc3c7;
}

.cancel-btn:hover {
  background-color: #dcdde1;
}

.save-btn {
  background-color: #3498db;
  color: white;
  border: 1px solid #3498db;
}

.save-btn:hover {
  background-color: #2980b9;
}
</style>
