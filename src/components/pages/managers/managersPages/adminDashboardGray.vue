<template>
  <div class="admin-dashboard">
    <!-- 顶部导航 -->
    <header class="admin-header">
      <div class="logo">管理控制台</div>
      <div class="user-menu">
        <div class="user-info">
          <img src="https://picsum.photos/40/40?admin" alt="管理员头像" class="mini-avatar">
          <span>系统管理员</span>
          <i class="el-icon-caret-down"></i>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 欢迎面板 -->
      <div class="welcome-panel">
        <h1>您好，管理员</h1>
        <p>今天是 {{ today }}，当前有 <span class="highlight">{{ pendingCount }}</span> 项待处理任务</p>
      </div>

      <!-- 系统状态卡片 -->
      <div class="status-cards">
        <div class="status-card">
          <div class="card-icon bg-gray">
            <i class="el-icon-s-order"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ orderStats.total }}</div>
            <div class="card-label">今日订单</div>
          </div>
          <div class="card-trend up">
            <i class="el-icon-arrow-up"></i> 12%
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon bg-gray">
            <i class="el-icon-warning"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ orderStats.abnormal }}</div>
            <div class="card-label">异常订单</div>
          </div>
          <div class="card-trend up">
            <i class="el-icon-arrow-up"></i> 5%
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon bg-gray">
            <i class="el-icon-money"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ refundStats.pending }}</div>
            <div class="card-label">待审退款</div>
          </div>
          <div class="card-trend down">
            <i class="el-icon-arrow-down"></i> 8%
          </div>
        </div>
        
        <div class="status-card">
          <div class="card-icon bg-gray">
            <i class="el-icon-user"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ userStats.new }}</div>
            <div class="card-label">新增用户</div>
          </div>
          <div class="card-trend up">
            <i class="el-icon-arrow-up"></i> 23%
          </div>
        </div>
      </div>

      <!-- 核心管理功能 -->
      <div class="management-tools">
        <h2>管理功能</h2>
        <div class="tools-grid">
          <div class="tool-card" @click="handleNavigation('orders')">
            <i class="el-icon-s-order"></i>
            <span>订单管理</span>
          </div>
          <div class="tool-card" @click="handleNavigation('users')">
            <i class="el-icon-user-solid"></i>
            <span>用户管理</span>
          </div>
          <div class="tool-card" @click="handleNavigation('products')">
            <i class="el-icon-box"></i>
            <span>产品管理</span>
          </div>
          <div class="tool-card" @click="handleNavigation('refunds')">
            <i class="el-icon-credit-card"></i>
            <span>退款审核</span>
          </div>
          <div class="tool-card" @click="handleNavigation('content')">
            <i class="el-icon-document"></i>
            <span>内容审核</span>
          </div>
          <div class="tool-card" @click="handleNavigation('finance')">
            <i class="el-icon-wallet"></i>
            <span>财务管理</span>
          </div>
          <div class="tool-card" @click="handleNavigation('system')">
            <i class="el-icon-cog"></i>
            <span>系统设置</span>
          </div>
          <div class="tool-card" @click="handleNavigation('logs')">
            <i class="el-icon-notebook"></i>
            <span>系统日志</span>
          </div>
        </div>
      </div>

      <!-- 待处理任务 -->
      <div class="pending-tasks">
        <h2>待处理任务</h2>
        <div class="task-list">
          <div class="task-item" v-for="task in pendingTasks" :key="task.id">
            <div class="task-priority" :class="task.priority"></div>
            <div class="task-details">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">{{ task.time }} · {{ task.type }}</div>
            </div>
            <button class="task-action">处理</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'adminDashboardGray',
  data() {
    return {
      // 系统统计数据
      orderStats: { total: 1286, abnormal: 18 },
      refundStats: { pending: 32 },
      userStats: { new: 543 },
      
      // 待处理任务
      pendingTasks: [
        { id: 1, title: '异常订单处理 (ORD20240915089)', time: '2小时前', type: '订单管理', priority: 'high' },
        { id: 2, title: '退款申请审核 (REF20240915023)', time: '5小时前', type: '退款管理', priority: 'medium' },
        { id: 3, title: '新用户认证审核 (USR20240915106)', time: '昨天', type: '用户管理', priority: 'medium' }
      ]
    };
  },
  computed: {
    // 今日日期
    today() {
      return new Date().toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    },
    // 待处理任务总数
    pendingCount() {
      return this.pendingTasks.length;
    }
  },
  methods: {
    // 导航到对应管理页面
    handleNavigation(page) {
      // 实际项目中这里会进行路由跳转
      console.log('导航到:', page);
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #333;
}

/* 顶部导航 - 已改为灰色 */
.admin-header {
  height: 60px;
  background-color: #555555; /* 中灰色背景 */
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.logo {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.mini-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 欢迎面板 */
.welcome-panel {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.welcome-panel h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.welcome-panel p {
  margin: 0;
  color: #666;
}

.highlight {
  color: #e02020;
  font-weight: bold;
}

/* 状态卡片 - 图标背景改为灰色 */
.status-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.bg-gray { background-color: #777777; } /* 卡片图标灰色背景 */

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.card-label {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.card-trend {
  margin-left: auto;
  font-size: 14px;
}

.up { color: #e02020; }
.down { color: #388e3c; }

/* 管理功能区 - 图标改为灰色系 */
.management-tools {
  margin-bottom: 30px;
}

.management-tools h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.tool-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background-color: #f9f9f9;
}

.tool-card i {
  font-size: 28px;
  color: #555555; /* 工具图标灰色 */
}

.tool-card span {
  font-size: 14px;
  color: #333;
}

/* 待处理任务 - 按钮改为灰色系 */
.pending-tasks h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.task-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.high { background-color: #e02020; }
.medium { background-color: #f57c00; }

.task-details {
  flex: 1;
}

.task-title {
  margin: 0 0 5px 0;
  font-weight: 500;
}

.task-meta {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.task-action {
  background-color: #666666; /* 处理按钮灰色 */
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.task-action:hover {
  background-color: #555555;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .status-cards, .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .status-cards, .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
