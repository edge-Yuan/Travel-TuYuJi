<template>
  <div class="order-management">
    <!-- 功能切换 -->
    <el-tabs v-model="activeTab" @tab-click="reset">
      <el-tab-pane label="全局订单监控" name="monitor"></el-tab-pane>
      <el-tab-pane label="异常订单处理" name="abnormal"></el-tab-pane>
      <el-tab-pane label="退款申请审核" name="refund"></el-tab-pane>
    </el-tabs>

    <!-- 三级流程指示器（异常处理和退款审核用） -->
    <div class="steps" v-if="activeTab !== 'monitor'">
      <div :class="['step', { active: step >= 1 }]">
        <span>{{ step >= 1 ? '✓' : '1' }}</span>
        <span>{{ getStepText(1) }}</span>
      </div>
      <div :class="['line', { active: step >= 2 }]"></div>
      <div :class="['step', { active: step >= 2 }]">
        <span>{{ step >= 2 ? '✓' : '2' }}</span>
        <span>{{ getStepText(2) }}</span>
      </div>
      <div :class="['line', { active: step >= 3 }]"></div>
      <div :class="['step', { active: step >= 3 }]">
        <span>{{ step >= 3 ? '✓' : '3' }}</span>
        <span>{{ getStepText(3) }}</span>
      </div>
    </div>

    <!-- 1. 全局订单监控 -->
    <el-card v-if="activeTab === 'monitor'">
      <el-input 
        v-model="search" 
        placeholder="搜索订单号/游客" 
        prefix-icon="el-icon-search" 
        style="width: 300px; margin-bottom: 15px;"
      ></el-input>
      <el-table :data="filteredOrders" border v-loading="loading">
        <el-table-column prop="orderId" label="订单号" width="160"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="productId" label="产品ID" width="100"></el-table-column>
        <el-table-column prop="orderAmount" label="金额" width="100">
          <template slot-scope="scope">￥{{ scope.row.orderAmount }}</template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTypes[scope.row.status]">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="160"></el-table-column>
      </el-table>
    </el-card>

    <!-- 2. 异常订单处理（三级交互） -->
    <div v-if="activeTab === 'abnormal'">
      <!-- 步骤1：选择异常订单 -->
      <el-card v-if="step === 1">
        <el-table :data="abnormalOrders" border @row-click="selectItem">
          <el-table-column prop="id" label="订单号" width="160"></el-table-column>
          <el-table-column prop="user" label="游客" width="100"></el-table-column>
          <el-table-column prop="reason" label="异常原因"></el-table-column>
          <el-table-column prop="time" label="发生时间" width="160"></el-table-column>
        </el-table>
        <el-button type="primary" @click="step=2" :disabled="!selected" style="margin-top:15px;">处理</el-button>
      </el-card>

      <!-- 步骤2：处理异常 -->
      <el-card v-if="step === 2 && selected">
        <el-descriptions column="1" border>
          <el-descriptions-item label="订单号">{{ selected.id }}</el-descriptions-item>
          <el-descriptions-item label="游客">{{ selected.user }}</el-descriptions-item>
          <el-descriptions-item label="产品">{{ selected.product }}</el-descriptions-item>
          <el-descriptions-item label="异常原因">{{ selected.reason }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="handleForm" style="margin-top:15px;">
          <el-form-item label="处理方式">
            <el-select v-model="handleForm.method" placeholder="选择方式">
              <el-option label="重新安排" value="rearrange"></el-option>
              <el-option label="全额退款" value="refund"></el-option>
              <el-option label="部分补偿" value="compensate"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="handleForm.remark" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div class="btn-group">
          <el-button @click="step=1">返回</el-button>
          <el-button type="primary" @click="step=3">提交</el-button>
        </div>
      </el-card>

      <!-- 步骤3：处理结果 -->
      <el-card v-if="step === 3 && selected">
        <div class="result">
          <i class="el-icon-circle-check success"></i>
          <div>
            <h3>异常处理完成</h3>
            <p>订单号：{{ selected.id }}</p>
            <p>处理方式：{{ handleForm.method | formatMethod }}</p>
            <p>备注：{{ handleForm.remark }}</p>
          </div>
        </div>
        <el-button type="primary" @click="reset" style="margin-top:15px;">完成</el-button>
      </el-card>
    </div>

    <!-- 3. 退款申请审核（三级交互） -->
    <div v-if="activeTab === 'refund'">
      <!-- 步骤1：选择退款申请 -->
      <el-card v-if="step === 1">
        <el-table :data="refundApplications" border @row-click="selectItem">
          <el-table-column prop="rid" label="退款号" width="160"></el-table-column>
          <el-table-column prop="id" label="订单号" width="160"></el-table-column>
          <el-table-column prop="user" label="申请人" width="100"></el-table-column>
          <el-table-column prop="amount" label="金额" width="100" formatter="￥{value}"></el-table-column>
          <el-table-column prop="time" label="申请时间" width="160"></el-table-column>
        </el-table>
        <el-button type="primary" @click="step=2" :disabled="!selected" style="margin-top:15px;">审核</el-button>
      </el-card>

      <!-- 步骤2：审核退款 -->
      <el-card v-if="step === 2 && selected">
        <el-descriptions column="1" border>
          <el-descriptions-item label="退款号">{{ selected.rid }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ selected.id }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selected.user }}</el-descriptions-item>
          <el-descriptions-item label="产品">{{ selected.product }}</el-descriptions-item>
          <el-descriptions-item label="申请金额">￥{{ selected.amount }}</el-descriptions-item>
          <el-descriptions-item label="退款原因">{{ selected.reason }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="reviewForm" style="margin-top:15px;">
          <el-form-item label="审核结果">
            <el-radio-group v-model="reviewForm.result">
              <el-radio label="pass">通过</el-radio>
              <el-radio label="reject">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="实际退款" v-if="reviewForm.result === 'pass'">
            <el-input v-model="reviewForm.actualAmount" prefix-icon="el-icon-money"></el-input>
          </el-form-item>
          <el-form-item label="审核备注">
            <el-input v-model="reviewForm.remark" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div class="btn-group">
          <el-button @click="step=1">返回</el-button>
          <el-button type="primary" @click="step=3">提交</el-button>
        </div>
      </el-card>

      <!-- 步骤3：审核结果 -->
      <el-card v-if="step === 3 && selected">
        <div class="result">
          <i :class="reviewForm.result === 'pass' ? 'el-icon-circle-check success' : 'el-icon-circle-cross error'"></i>
          <div>
            <h3>{{ reviewForm.result === 'pass' ? '退款审核通过' : '退款审核驳回' }}</h3>
            <p>退款号：{{ selected.rid }}</p>
            <p v-if="reviewForm.result === 'pass'">退款金额：￥{{ reviewForm.actualAmount || selected.amount }}</p>
            <p>备注：{{ reviewForm.remark }}</p>
          </div>
        </div>
        <el-button type="primary" @click="reset" style="margin-top:15px;">完成</el-button>
      </el-card>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'orderManagement',
  data() {
    return {
      activeTab: 'monitor',
      step: 1,
      selected: null,
      search: '',
      loading: false,
      
      // 订单数据
      allOrders: [],
      
      // 异常订单
      abnormalOrders: [],
      
      // 退款申请
      refundApplications: [],
      
      // 表单数据
      handleForm: { method: '', remark: '' },
      reviewForm: { result: '', actualAmount: '', remark: '' }
    };
  },
  created() {
    this.loadOrders();
    this.loadRefundApplications();
  },
  computed: {
    // 筛选订单
    filteredOrders() {
      return this.allOrders.filter(order => 
        order.orderId.toString().includes(this.search) || 
        (order.user && order.user.includes(this.search))
      );
    },
    // 状态标签样式
    statusTypes() {
      return { 
        '已完成': 'success', 
        '待出行': 'info', 
        '已取消': 'warning', 
        '异常': 'danger',
        '待确认': 'warning',
        '已确认': 'success',
        '退款中': 'danger'
      };
    }
  },
  filters: {
    // 格式化处理方式
    formatMethod(val) {
      const map = { rearrange: '重新安排', refund: '全额退款', compensate: '部分补偿' };
      return map[val] || val;
    }
  },
  methods: {
    async loadOrders() {
      this.loading = true;
      try {
        const response = await request({
          url: '/travel-portal/tourOrder/list',
          method: 'get'
        });
        this.allOrders = response.map(order => ({
          ...order,
          id: order.orderId,
          user: order.userId, // 这里需要根据实际用户信息调整
          product: order.productId, // 这里需要根据实际产品信息调整
          amount: order.orderAmount,
          status: this.getOrderStatusText(order.orderStatus),
          time: order.createTime
        }));
        this.$message.success('订单列表加载成功');
      } catch (error) {
        this.$message.error('订单列表加载失败');
        console.error('加载订单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadRefundApplications() {
      try {
        const response = await request({
          url: '/travel-portal/refundApply/list',
          method: 'get'
        });
        this.refundApplications = response.map(refund => ({
          ...refund,
          rid: refund.id,
          id: refund.orderId,
          user: refund.userId, // 这里需要根据实际用户信息调整
          product: refund.orderId, // 这里需要根据实际产品信息调整
          amount: refund.refundAmount,
          reason: refund.refundReason,
          time: refund.createTime
        }));
      } catch (error) {
        console.error('加载退款申请失败:', error);
      }
    },
    
    getOrderStatusText(status) {
      const statusMap = {
        0: '待确认',
        1: '已确认',
        2: '已完成',
        3: '已取消',
        4: '退款中'
      };
      return statusMap[status] || '未知状态';
    },
    
    // 获取步骤文本
    getStepText(step) {
      const texts = {
        abnormal: ['选择异常订单', '处理异常', '处理结果'],
        refund: ['选择退款申请', '审核退款', '审核结果']
      };
      return texts[this.activeTab][step - 1];
    },
    // 选择项目
    selectItem(row) {
      this.selected = row;
    },
    // 重置流程
    reset() {
      this.step = 1;
      this.selected = null;
      this.handleForm = { method: '', remark: '' };
      this.reviewForm = { result: '', actualAmount: '', remark: '' };
    }
  }
};
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
}

.step span:first-child {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8e8e8;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.step.active span:first-child {
  background: #1890ff;
}

.step.active span:last-child {
  color: #1890ff;
  font-weight: 500;
}

.line {
  width: 40px;
  height: 2px;
  background: #e8e8e8;
}

.line.active {
  background: #1890ff;
}

.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.result {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.success {
  color: #52c41a;
  font-size: 36px;
  margin-right: 15px;
}

.error {
  color: #f5222d;
  font-size: 36px;
  margin-right: 15px;
}

.result h3 {
  margin: 0 0 10px 0;
}

.result p {
  margin: 5px 0;
  color: #666;
}
</style>
