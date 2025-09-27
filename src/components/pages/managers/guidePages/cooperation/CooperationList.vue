<template>

  <div class="cooperation-list">
    <h2>合作处理</h2>

    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'invitations' }"
        @click="activeTab = 'invitations'">收到的邀请</button>
      <button class="tab-btn" :class="{ active: activeTab === 'myApplications' }"
        @click="activeTab = 'myApplications'">我的申请</button>
      <button class="tab-btn" :class="{ active: activeTab === 'current' }" @click="activeTab = 'current'">当前合作</button>
      <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">历史合作</button>
    </div>

    <!-- 收到的邀请 -->
    <div v-if="activeTab === 'invitations'" class="cooperation-content">
      <div class="filter-bar">
        <input type="text" v-model="invitationSearch" placeholder="搜索旅游团名称或领队">
        <select v-model="invitationFilter">
          <option value="">全部状态</option>
          <option value="pending">待回应</option>
          <option value="accepted">已接受</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>

      <div class="cooperation-cards">
        <div class="cooperation-card" v-for="invitation in filteredInvitations" :key="invitation.id">
          <div class="card-header">
            <h3>{{ invitation.tourGroupName }}</h3>
            <span class="status-badge" :class="getStatusClass(invitation.status)">
              {{ getStatusText(invitation.status) }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-item">
              <strong>领队：</strong>
              <span>{{ invitation.leaderName }}</span>
            </div>
            <div class="info-item">
              <strong>团队规模：</strong>
              <span>{{ invitation.groupSize }} 人</span>
            </div>
            <div class="info-item">
              <strong>行程日期：</strong>
              <span>{{ formatDate(invitation.startDate) }} 至 {{ formatDate(invitation.endDate) }}</span>
            </div>
            <div class="info-item">
              <strong>行程地点：</strong>
              <span>{{ invitation.location }}</span>
            </div>
            <div class="info-item">
              <strong>邀请时间：</strong>
              <span>{{ formatDate(invitation.inviteTime) }}</span>
            </div>
            <div class="info-item description">
              <strong>合作说明：</strong>
              <p>{{ invitation.description }}</p>
            </div>
          </div>

          <div class="card-actions" v-if="invitation.status === 'pending'">
            <button class="btn accept-btn" @click="respondInvitation(invitation.id, 'accepted')">接受邀请</button>
            <button class="btn reject-btn" @click="respondInvitation(invitation.id, 'rejected')">拒绝邀请</button>
          </div>
        </div>
      </div>

      <div v-if="filteredInvitations.length === 0" class="no-data">
        没有找到匹配的邀请
      </div>
    </div>

    <!-- 我的申请 -->
    <div v-if="activeTab === 'myApplications'" class="cooperation-content">
      <div class="filter-bar">
        <input type="text" v-model="applicationSearch" placeholder="搜索旅游团名称或领队">
        <select v-model="applicationFilter">
          <option value="">全部状态</option>
          <option value="pending">审核中</option>
          <option value="approved">已通过</option>
          <option value="rejected">未通过</option>
        </select>
      </div>

      <div class="action-bar">
        <button class="btn apply-btn" @click="showApplyModal = true">
          <i class="fas fa-plus"></i> 新申请合作
        </button>
      </div>

      <div class="cooperation-cards">
        <div class="cooperation-card" v-for="application in filteredApplications" :key="application.id">
          <div class="card-header">
            <h3>{{ application.tourGroupName }}</h3>
            <span class="status-badge" :class="getStatusClass(application.status)">
              {{ getApplicationStatusText(application.status) }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-item">
              <strong>领队：</strong>
              <span>{{ application.leaderName }}</span>
            </div>
            <div class="info-item">
              <strong>团队规模：</strong>
              <span>{{ application.groupSize }} 人</span>
            </div>
            <div class="info-item">
              <strong>行程日期：</strong>
              <span>{{ formatDate(application.startDate) }} 至 {{ formatDate(application.endDate) }}</span>
            </div>
            <div class="info-item">
              <strong>行程地点：</strong>
              <span>{{ application.location }}</span>
            </div>
            <div class="info-item">
              <strong>申请时间：</strong>
              <span>{{ formatDate(application.applyTime) }}</span>
            </div>
            <div class="info-item description">
              <strong>申请说明：</strong>
              <p>{{ application.description }}</p>
            </div>
            <div class="info-item" v-if="application.status === 'rejected' && application.rejectReason">
              <strong>未通过原因：</strong>
              <p class="reject-reason">{{ application.rejectReason }}</p>
            </div>
          </div>

          <div class="card-actions" v-if="application.status === 'pending'">
            <button class="btn cancel-btn" @click="cancelApplication(application.id)">取消申请</button>
          </div>
        </div>
      </div>

      <div v-if="filteredApplications.length === 0" class="no-data">
        没有找到匹配的申请
      </div>
    </div>

    <!-- 当前合作 -->
    <div v-if="activeTab === 'current'" class="cooperation-content">
      <div class="filter-bar">
        <input type="text" v-model="currentSearch" placeholder="搜索旅游团名称或领队">
      </div>

      <div class="cooperation-cards">
        <div class="cooperation-card" v-for="coop in filteredCurrentCooperations" :key="coop.id">
          <div class="card-header">
            <h3>{{ coop.tourGroupName }}</h3>
            <span class="status-badge processing">进行中</span>
          </div>

          <div class="card-body">
            <div class="info-item">
              <strong>领队：</strong>
              <span>{{ coop.leaderName }}</span>
            </div>
            <div class="info-item">
              <strong>团队规模：</strong>
              <span>{{ coop.groupSize }} 人</span>
            </div>
            <div class="info-item">
              <strong>行程日期：</strong>
              <span>{{ formatDate(coop.startDate) }} 至 {{ formatDate(coop.endDate) }}</span>
            </div>
            <div class="info-item">
              <strong>行程地点：</strong>
              <span>{{ coop.location }}</span>
            </div>
            <div class="info-item description">
              <strong>合作详情：</strong>
              <p>{{ coop.details }}</p>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn view-btn" @click="viewCooperationDetails(coop.id)">查看详情</button>
            <button class="btn report-btn" @click="submitReport(coop.id)">提交报告</button>
          </div>
        </div>
      </div>

      <div v-if="filteredCurrentCooperations.length === 0" class="no-data">
        没有找到匹配的当前合作
      </div>
    </div>

    <!-- 历史合作 -->
    <div v-if="activeTab === 'history'" class="cooperation-content">
      <div class="filter-bar">
        <input type="text" v-model="historySearch" placeholder="搜索旅游团名称或领队">
        <select v-model="historyFilter">
          <option value="">全部类型</option>
          <option value="completed">已完成</option>
          <option value="terminated">已终止</option>
        </select>
      </div>

      <div class="cooperation-cards">
        <div class="cooperation-card" v-for="coop in filteredHistoryCooperations" :key="coop.id">
          <div class="card-header">
            <h3>{{ coop.tourGroupName }}</h3>
            <span class="status-badge" :class="coop.status === 'completed' ? 'completed' : 'terminated'">
              {{ coop.status === 'completed' ? '已完成' : '已终止' }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-item">
              <strong>领队：</strong>
              <span>{{ coop.leaderName }}</span>
            </div>
            <div class="info-item">
              <strong>团队规模：</strong>
              <span>{{ coop.groupSize }} 人</span>
            </div>
            <div class="info-item">
              <strong>行程日期：</strong>
              <span>{{ formatDate(coop.startDate) }} 至 {{ formatDate(coop.endDate) }}</span>
            </div>
            <div class="info-item">
              <strong>行程地点：</strong>
              <span>{{ coop.location }}</span>
            </div>
            <div class="info-item">
              <strong>结束时间：</strong>
              <span>{{ formatDate(coop.endTime) }}</span>
            </div>
            <div class="info-item description" v-if="coop.terminateReason">
              <strong>终止原因：</strong>
              <p>{{ coop.terminateReason }}</p>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn view-btn" @click="viewCooperationDetails(coop.id)">查看详情</button>
            <button class="btn evaluate-btn" @click="evaluateCooperation(coop.id)"
              v-if="coop.status === 'completed'">评价合作</button>
          </div>
        </div>
      </div>

      <div v-if="filteredHistoryCooperations.length === 0" class="no-data">
        没有找到匹配的历史合作
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CooperationList',
  data() {
    return {
      activeTab: 'invitations', // 当前激活的标签页（invitations/applications/current/history）
      
      // 各标签页对应的搜索和过滤变量（与模板 v-model 绑定）
      invitationSearch: '',    // 邀请列表搜索关键词
      invitationFilter: '',    // 邀请列表过滤条件（如状态）
      applicationSearch: '',   // 申请列表搜索关键词
      applicationFilter: '',   // 申请列表过滤条件
      currentSearch: '',       // 当前合作列表搜索关键词
      currentFilter: '',       // 当前合作列表过滤条件
      historySearch: '',       // 历史合作列表搜索关键词
      historyFilter: '',       // 历史合作列表过滤条件

      // 各列表原始数据（初始化为空数组，避免 undefined）
      invitations: [],         // 收到的邀请列表
      applications: [],        // 发出的申请列表
      currentCooperations: [], // 当前合作列表
      historyCooperations: []  // 历史合作列表
    }
  },
  computed: {
    // 1. 过滤“收到的邀请”列表
    filteredInvitations() {
      // 确保数据源是数组（容错处理）
      const validInvitations = Array.isArray(this.invitations) ? this.invitations : [];
      
      return validInvitations.filter(invitation => {
        // 条件1：匹配搜索关键词（支持名称、合作方等字段，根据实际数据结构调整）
        const matchesSearch = this.invitationSearch
          ? invitation.name?.includes(this.invitationSearch) || invitation.partner?.includes(this.invitationSearch)
          : true; // 搜索为空时，默认匹配所有
        
        // 条件2：匹配过滤条件（如状态过滤，根据实际 filter 选项调整）
        const matchesFilter = this.invitationFilter
          ? invitation.status === this.invitationFilter // 假设 filter 是状态值（pending/accepted/rejected）
          : true; // 过滤为空时，默认匹配所有
        
        // 同时满足搜索和过滤条件才保留
        return matchesSearch && matchesFilter;
      });
    },

    // 2. 过滤“发出的申请”列表
    filteredApplications() {
      const validApplications = Array.isArray(this.applications) ? this.applications : [];
      
      return validApplications.filter(application => {
        // 搜索匹配（示例：匹配申请名称或目标合作方）
        const matchesSearch = this.applicationSearch
          ? application.title?.includes(this.applicationSearch) || application.target?.includes(this.applicationSearch)
          : true;
        
        // 过滤匹配（示例：按申请状态过滤）
        const matchesFilter = this.applicationFilter
          ? application.status === this.applicationFilter
          : true;
        
        return matchesSearch && matchesFilter;
      });
    },

    // 3. 过滤“当前合作”列表
    filteredCurrentCooperations() {
      const validCurrents = Array.isArray(this.currentCooperations) ? this.currentCooperations : [];
      
      return validCurrents.filter(coop => {
        // 搜索匹配（示例：匹配合作名称或合作方）
        const matchesSearch = this.currentSearch
          ? coop.name?.includes(this.currentSearch) || coop.partner?.includes(this.currentSearch)
          : true;
        
        // 过滤匹配（示例：按合作类型过滤）
        const matchesFilter = this.currentFilter
          ? coop.type === this.currentFilter
          : true;
        
        return matchesSearch && matchesFilter;
      });
    },

    // 4. 过滤“历史合作”列表
    filteredHistoryCooperations() {
      const validHistories = Array.isArray(this.historyCooperations) ? this.historyCooperations : [];
      
      return validHistories.filter(coop => {
        // 搜索匹配（示例：匹配合作名称或合作方）
        const matchesSearch = this.historySearch
          ? coop.name?.includes(this.historySearch) || coop.partner?.includes(this.historySearch)
          : true;
        
        // 过滤匹配（示例：按合作结果过滤）
        const matchesFilter = this.historyFilter
          ? coop.result === this.historyFilter // 如：success/terminated
          : true;
        
        return matchesSearch && matchesFilter;
      });
    }
  },
  methods: {
    // 根据状态返回对应的 CSS 类名（用于标签颜色等样式控制）
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'status-pending'; // 待处理（如：黄色）
        case 'accepted':
          return 'status-accepted'; // 已接受（如：绿色）
        case 'rejected':
          return 'status-rejected'; // 已拒绝（如：红色）
        case 'completed':
          return 'status-completed'; // 已完成（如：蓝色）
        default:
          return 'status-default'; // 默认样式
      }
    },

    // 日期格式化（处理可能的 null/undefined 日期）
    formatDate(dateStr) {
      if (!dateStr) return '无日期'; // 容错：日期为空时显示默认文本
      const date = new Date(dateStr);
      // 格式化：YYYY-MM-DD（兼容不同浏览器）
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },

    // 回应合作邀请（解决之前 ESLint 未使用参数的问题）
    respondInvitation(id, action) {
      // 实际业务逻辑：调用 API 处理邀请（接受/拒绝）
      console.log(`处理邀请 ID: ${id}，操作: ${action}`);
      // 示例：调用接口后更新本地列表
      // this.invitations = this.invitations.filter(inv => inv.id !== id);
      // this.$message.success(`已${action === 'accept' ? '接受' : '拒绝'}邀请`);
    },

    // 加载各列表数据（可在 mounted 中调用）
    async loadCooperationData() {
      try {
        // 模拟 API 请求（实际项目替换为真实接口）
        // const [invRes, appRes, currRes, histRes] = await Promise.all([
        //   this.$axios.get('/api/cooperation/invitations'),
        //   this.$axios.get('/api/cooperation/applications'),
        //   this.$axios.get('/api/cooperation/current'),
        //   this.$axios.get('/api/cooperation/history')
        // ]);
        // this.invitations = invRes.data;
        // this.applications = appRes.data;
        // this.currentCooperations = currRes.data;
        // this.historyCooperations = histRes.data;

        // 模拟测试数据（避免列表为空）
        this.invitations = [
          { id: 1, name: '北京旅行社合作邀请', partner: '北京旅游集团', status: 'pending', createTime: '2024-01-15' },
          { id: 2, name: '三亚酒店资源合作', partner: '三亚度假酒店', status: 'accepted', createTime: '2024-01-10' }
        ];
        this.applications = [
          { id: 1, title: '申请接入云南旅游线路', target: '云南文旅公司', status: 'pending', createTime: '2024-01-12' }
        ];
      } catch (error) {
        this.$message.error('加载合作数据失败');
        console.error('数据加载错误:', error);
      }
    }
  },
  mounted() {
    // 组件挂载后加载数据
    this.loadCooperationData();
  }
}
</script>