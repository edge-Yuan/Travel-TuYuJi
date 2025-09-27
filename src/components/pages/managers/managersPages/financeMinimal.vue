<template>
  <div class="finance-app">
    <!-- 功能选择器 -->
    <div class="tabs">
      <div 
        :class="['tab', currentTab === 'order' ? 'active' : '']"
        @click="setTab('order', 1)"
      >订单核算</div>
      <div 
        :class="['tab', currentTab === 'refund' ? 'active' : '']"
        @click="setTab('refund', 1)"
      >退款结算</div>
      <div 
        :class="['tab', currentTab === 'report' ? 'active' : '']"
        @click="setTab('report', 1)"
      >财务报表</div>
    </div>

    <!-- 主内容区 -->
    <div class="content">
      <!-- 订单核算（三级交互） -->
      <div v-if="currentTab === 'order'">
        <!-- 步骤导航 -->
        <div class="steps">
          <span :class="step >= 1 ? 'step-active' : ''">1. 选择周期</span>
          <span :class="step >= 2 ? 'step-active' : ''">2. 核对数据</span>
          <span :class="step >= 3 ? 'step-active' : ''">3. 完成核算</span>
        </div>

        <!-- 步骤1：选择周期 -->
        <div v-if="step === 1" class="card">
          <el-date-picker
            v-model="orderDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin: 10px 0;"
          ></el-date-picker>
          <el-button 
            type="primary" 
            @click="step = 2"
            :disabled="!orderDateRange || orderDateRange.length < 2"
          >
            下一步
          </el-button>
        </div>

        <!-- 步骤2：核对数据 -->
        <div v-if="step === 2" class="card">
          <div class="summary">
            周期：{{ orderDateRange[0] }} 至 {{ orderDateRange[1] }}
            <span class="total">总金额：¥{{ orderTotal }}</span>
          </div>
          <el-table :data="orderList" border size="small">
            <el-table-column prop="id" label="订单号" width="120"></el-table-column>
            <el-table-column prop="name" label="产品"></el-table-column>
            <el-table-column prop="amount" label="金额" width="100"></el-table-column>
          </el-table>
          <div class="btn-group">
            <el-button @click="step = 1">返回</el-button>
            <el-button type="primary" @click="step = 3">确认核算</el-button>
          </div>
        </div>

        <!-- 步骤3：完成核算 -->
        <div v-if="step === 3" class="card result">
          <i class="el-icon-circle-check success"></i>
          <div>
            <h3>订单核算完成</h3>
            <p>周期：{{ orderDateRange[0] }} 至 {{ orderDateRange[1] }}</p>
            <p>订单总数：{{ orderList.length }} 单</p>
            <p>总金额：¥{{ orderTotal }}</p>
          </div>
          <el-button type="primary" @click="step = 1">重新核算</el-button>
        </div>
      </div>

      <!-- 退款结算（三级交互） -->
      <div v-if="currentTab === 'refund'">
        <div class="steps">
          <span :class="step >= 1 ? 'step-active' : ''">1. 选择退款</span>
          <span :class="step >= 2 ? 'step-active' : ''">2. 确认信息</span>
          <span :class="step >= 3 ? 'step-active' : ''">3. 完成结算</span>
        </div>

        <!-- 步骤1：选择退款 -->
        <div v-if="step === 1" class="card">
          <el-table 
            :data="refundList" 
            border 
            size="small"
            @selection-change="selectRefunds"
          >
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="id" label="退款号" width="120"></el-table-column>
            <el-table-column prop="orderId" label="订单号" width="120"></el-table-column>
            <el-table-column prop="amount" label="金额" width="100"></el-table-column>
          </el-table>
          <el-button 
            type="primary" 
            @click="step = 2"
            :disabled="selectedRefunds.length === 0"
          >
            下一步
          </el-button>
        </div>

        <!-- 步骤2：确认信息 -->
        <div v-if="step === 2" class="card">
          <div class="summary">
            选中 {{ selectedRefunds.length }} 笔退款
            <span class="total">总金额：¥{{ refundTotal }}</span>
          </div>
          <el-select 
            v-model="refundMethod" 
            placeholder="选择结算方式"
            style="width: 100%; margin: 10px 0;"
          >
            <el-option label="原路退回" value="original"></el-option>
            <el-option label="手动转账" value="manual"></el-option>
          </el-select>
          <div class="btn-group">
            <el-button @click="step = 1">返回</el-button>
            <el-button type="primary" @click="step = 3">确认结算</el-button>
          </div>
        </div>

        <!-- 步骤3：完成结算 -->
        <div v-if="step === 3" class="card result">
          <i class="el-icon-circle-check success"></i>
          <div>
            <h3>退款结算完成</h3>
            <p>结算笔数：{{ selectedRefunds.length }} 笔</p>
            <p>总金额：¥{{ refundTotal }}</p>
            <p>方式：{{ refundMethod === 'original' ? '原路退回' : '手动转账' }}</p>
          </div>
          <el-button type="primary" @click="resetRefund()">重新结算</el-button>
        </div>
      </div>

      <!-- 财务报表（三级交互） -->
      <div v-if="currentTab === 'report'">
        <div class="steps">
          <span :class="step >= 1 ? 'step-active' : ''">1. 选择参数</span>
          <span :class="step >= 2 ? 'step-active' : ''">2. 查看报表</span>
          <span :class="step >= 3 ? 'step-active' : ''">3. 导出完成</span>
        </div>

        <!-- 步骤1：选择参数 -->
        <div v-if="step === 1" class="card">
          <el-select 
            v-model="reportType" 
            placeholder="报表类型"
            style="width: 100%; margin-bottom: 10px;"
          >
            <el-option label="日报表" value="day"></el-option>
            <el-option label="月报表" value="month"></el-option>
            <el-option label="季度报表" value="quarter"></el-option>
          </el-select>
          <el-date-picker
            v-model="reportDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-bottom: 10px;"
          ></el-date-picker>
          <el-button 
            type="primary" 
            @click="step = 2"
            :disabled="!reportType || !reportDateRange"
          >
            生成报表
          </el-button>
        </div>

        <!-- 步骤2：查看报表 -->
        <div v-if="step === 2" class="card">
          <div class="summary">
            {{ reportType === 'day' ? '日报表' : reportType === 'month' ? '月报表' : '季度报表' }}
            （{{ reportDateRange[0] }} 至 {{ reportDateRange[1] }}）
          </div>
          <el-table :data="reportData" border size="small">
            <el-table-column prop="date" label="日期/月份"></el-table-column>
            <el-table-column prop="income" label="收入"></el-table-column>
            <el-table-column prop="expense" label="支出"></el-table-column>
            <el-table-column prop="profit" label="利润"></el-table-column>
          </el-table>
          <div class="btn-group">
            <el-button @click="step = 1">返回</el-button>
            <el-button type="primary" @click="step = 3">导出报表</el-button>
          </div>
        </div>

        <!-- 步骤3：导出完成 -->
        <div v-if="step === 3" class="card result">
          <i class="el-icon-circle-check success"></i>
          <div>
            <h3>报表导出成功</h3>
            <p>类型：{{ reportType === 'day' ? '日报表' : reportType === 'month' ? '月报表' : '季度报表' }}</p>
            <p>周期：{{ reportDateRange[0] }} 至 {{ reportDateRange[1] }}</p>
            <p>格式：Excel</p>
          </div>
          <el-button type="primary" @click="step = 1">生成新报表</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'financeMinimal',
  data() {
    return {
      currentTab: 'order',
      step: 1,
      
      // 订单核算数据
      orderDateRange: [],
      orderList: [
        { id: 'ORD001', name: '长沙三日游', amount: 1299 },
        { id: 'ORD002', name: '张家界五日游', amount: 2199 },
        { id: 'ORD003', name: '凤凰古城游', amount: 899 }
      ],
      
      // 退款结算数据
      refundList: [
        { id: 'REF001', orderId: 'ORD004', amount: 599 },
        { id: 'REF002', orderId: 'ORD005', amount: 1599 },
        { id: 'REF003', orderId: 'ORD006', amount: 899 }
      ],
      selectedRefunds: [],
      refundMethod: 'original',
      
      // 财务报表数据
      reportType: '',
      reportDateRange: [],
      reportData: [
        { date: '2024-09-01', income: 3498, expense: 899, profit: 2599 },
        { date: '2024-09-02', income: 2897, expense: 599, profit: 2298 },
        { date: '2024-09-03', income: 4296, expense: 1599, profit: 2697 }
      ]
    };
  },
  computed: {
    // 订单总金额
    orderTotal() {
      return this.orderList.reduce((sum, item) => sum + item.amount, 0);
    },
    // 退款总金额
    refundTotal() {
      return this.selectedRefunds.reduce((sum, item) => sum + item.amount, 0);
    }
  },
  methods: {
    // 切换功能标签
    setTab(tab, step) {
      this.currentTab = tab;
      this.step = step;
    },
    // 选择退款项
    selectRefunds(rows) {
      this.selectedRefunds = rows;
    },
    // 重置退款结算
    resetRefund() {
      this.step = 1;
      this.selectedRefunds = [];
      this.refundMethod = 'original';
    }
  }
};
</script>

<style scoped>
.finance-app {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* 标签样式 */
.tabs {
  display: flex;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  margin-right: 5px;
  border-bottom: 2px solid transparent;
}

.tab.active {
  border-bottom-color: #1890ff;
  color: #1890ff;
  font-weight: 500;
}

/* 步骤样式 */
.steps {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.step-active {
  color: #1890ff;
  font-weight: 500;
}

/* 内容卡片 */
.card {
  border: 1px solid #eaeaea;
  border-radius: 4px;
  padding: 15px;
}

/* 按钮组 */
.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* 汇总信息 */
.summary {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  color: #333;
}

.total {
  color: #f5222d;
  font-weight: 500;
}

/* 结果页面 */
.result {
  text-align: center;
  padding: 30px 0;
}

.success {
  color: #52c41a;
  font-size: 48px;
  margin-bottom: 15px;
}

.result h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.result p {
  margin: 5px 0;
  color: #666;
}
</style>
