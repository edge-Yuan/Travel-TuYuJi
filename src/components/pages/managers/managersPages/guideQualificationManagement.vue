<template>
  <div class="guide-qualification-page">
    <!-- 1. 顶部权限提示+搜索区（管理员可见操作，非管理员隐藏功能按钮） -->
    <div class="top-bar">
      <div class="page-title">导游资质管理</div>
      <div class="operation-area" v-if="isAdmin">
        <el-input
          v-model="searchKey"
          placeholder="搜索导游姓名/资质编号"
          clearable
          style="width: 260px; margin-right: 16px;"
          @keyup.enter="fetchGuides"
        ></el-input>
        <el-button type="primary" @click="fetchGuides">查询导游</el-button>
      </div>
      <div class="permission-tip" v-else>
        <el-tag type="info">非管理员账号，仅查看权限</el-tag>
      </div>
    </div>

    <!-- 2. 三大核心功能并列卡片（视觉平等，操作聚焦） -->
    <el-row :gutter="30" class="function-cards">
      <!-- 卡片1：导游资质审核 -->
      <el-col :span="8">
        <el-card class="function-card" shadow="hover" :border="!isAdmin">
          <div class="card-header">
            <div class="card-icon audit-icon"></div>
            <div class="card-title">资质审核</div>
            <div class="card-badge">
              <el-badge :value="pendingCount" type="warning" :is-dot="pendingCount > 0"></el-badge>
            </div>
          </div>
          <div class="card-desc">
            审核新提交的导游资质申请，验证证书真实性与合规性
          </div>
          <div class="card-list">
            <el-empty 
              description="暂无待审核导游" 
              v-if="pendingGuides.length === 0"
              style="margin: 20px 0;"
            ></el-empty>
            <div class="guide-item" v-for="guide in pendingGuides" :key="guide.id" @click="openAuditDialog(guide)">
              <div class="guide-name">{{ guide.name }}</div>
              <div class="guide-info">
                <span>资质编号：{{ guide.certNo }}</span>
                <span class="apply-time">申请时间：{{ guide.applyTime }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer" v-if="isAdmin">
            <el-button type="text" @click="openAllAuditList">查看全部待审核 →</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片2：导游服务等级设置 -->
      <el-col :span="8">
        <el-card class="function-card" shadow="hover" :border="!isAdmin">
          <div class="card-header">
            <div class="card-icon level-icon"></div>
            <div class="card-title">服务等级设置</div>
          </div>
          <div class="card-desc">
            根据导游服务评分与从业年限，设置/调整服务等级（初级/中级/高级）
          </div>
          <div class="card-list">
            <el-empty 
              description="暂无导游数据" 
              v-if="allGuides.length === 0"
              style="margin: 20px 0;"
            ></el-empty>
            <div class="guide-item" v-for="guide in allGuides.slice(0, 3)" :key="guide.id" @click="openLevelDialog(guide)">
              <div class="guide-name">
                {{ guide.name }}
                <el-tag :type="getLevelTagType(guide.level)">{{ guide.level }}</el-tag>
              </div>
              <div class="guide-info">
                <span>服务评分：{{ guide.score }}分</span>
                <span class="work-year">从业{{ guide.workYear }}年</span>
              </div>
            </div>
          </div>
          <div class="card-footer" v-if="isAdmin">
            <el-button type="text" @click="openAllLevelList">管理全部导游等级 →</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片3：违规导游暂停 -->
      <el-col :span="8">
        <el-card class="function-card" shadow="hover" :border="!isAdmin">
          <div class="card-header">
            <div class="card-icon pause-icon"></div>
            <div class="card-title">违规暂停管理</div>
            <div class="card-badge">
              <el-badge :value="pausedCount" type="danger" :is-dot="pausedCount > 0"></el-badge>
            </div>
          </div>
          <div class="card-desc">
            对违规导游执行暂停服务操作，设置暂停时长与恢复条件
          </div>
          <div class="card-list">
            <el-empty 
              description="暂无违规导游记录" 
              v-if="violateGuides.length === 0"
              style="margin: 20px 0;"
            ></el-empty>
            <div class="guide-item" v-for="guide in violateGuides" :key="guide.id" @click="openPauseDialog(guide)">
              <div class="guide-name">{{ guide.name }}</div>
              <div class="guide-info">
                <span>违规类型：{{ guide.violateType }}</span>
                <span class="pause-status" :style="{ color: guide.isPaused ? '#dd1e21' : '#8caf7a' }">
                  {{ guide.isPaused ? '已暂停' : '待处理' }}
                </span>
              </div>
            </div>
          </div>
          <div class="card-footer" v-if="isAdmin">
            <el-button type="text" @click="openAllPauseList">查看全部违规记录 →</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3. 资质审核弹窗 -->
    <el-dialog title="导游资质审核" v-model="auditDialogVisible" width="550px" v-if="isAdmin">
      <el-form :model="currentGuide" label-width="120px">
        <el-form-item label="导游姓名">
          <el-input v-model="currentGuide.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="资质编号">
          <el-input v-model="currentGuide.certNo" disabled></el-input>
        </el-form-item>
        <el-form-item label="资质证书">
          <el-image 
            :src="currentGuide.certImg" 
            style="width: 100px; height: 140px;" 
            :preview-src-list="[currentGuide.certImg]"
          ></el-image>
        </el-form-item>
        <el-form-item label="审核结果" prop="auditResult">
          <el-radio-group v-model="currentGuide.auditResult">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" v-if="currentGuide.auditResult">
          <el-input 
            v-model="currentGuide.auditOpinion" 
            type="textarea" 
            placeholder="请输入审核意见（驳回需说明原因）"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交审核</el-button>
      </template>
    </el-dialog>

    <!-- 4. 服务等级设置弹窗 -->
    <el-dialog title="设置导游服务等级" v-model="levelDialogVisible" width="450px" v-if="isAdmin">
      <el-form :model="currentGuide" label-width="120px">
        <el-form-item label="导游姓名">
          <el-input v-model="currentGuide.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前等级">
          <el-tag :type="getLevelTagType(currentGuide.level)">{{ currentGuide.level }}</el-tag>
        </el-form-item>
        <el-form-item label="新服务等级" prop="newLevel">
          <el-select v-model="currentGuide.newLevel" placeholder="选择新等级">
            <el-option label="初级导游" value="初级导游"></el-option>
            <el-option label="中级导游" value="中级导游"></el-option>
            <el-option label="高级导游" value="高级导游"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input 
            v-model="currentGuide.levelReason" 
            type="textarea" 
            placeholder="请说明等级调整原因（如服务评分达标、从业年限满足等）"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLevel">确认设置</el-button>
      </template>
    </el-dialog>

    <!-- 5. 违规暂停弹窗 -->
    <el-dialog title="违规导游暂停处理" v-model="pauseDialogVisible" width="450px" v-if="isAdmin">
      <el-form :model="currentGuide" label-width="120px">
        <el-form-item label="导游姓名">
          <el-input v-model="currentGuide.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="违规类型">
          <el-input v-model="currentGuide.violateType" disabled></el-input>
        </el-form-item>
        <el-form-item label="暂停时长" prop="pauseDays">
          <el-input 
            v-model="currentGuide.pauseDays" 
            type="number" 
            min="1" 
            placeholder="输入暂停天数（至少1天）"
          ></el-input>
        </el-form-item>
        <el-form-item label="暂停原因">
          <el-input 
            v-model="currentGuide.pauseReason" 
            type="textarea" 
            placeholder="请详细说明违规事实与暂停依据"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pauseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPause">执行暂停</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'guideQualificationManagement',
  data() {
    return {
      isAdmin: true, // 实际项目从登录态获取（如this.$store.state.user.role === 'admin'）
      searchKey: '',
      // 导游数据（模拟）
      pendingGuides: [], // 待审核导游
      allGuides: [], // 所有导游（用于等级设置）
      violateGuides: [], // 违规导游
      pendingCount: 0, // 待审核数量
      pausedCount: 0, // 已暂停数量
      // 弹窗控制
      auditDialogVisible: false,
      levelDialogVisible: false,
      pauseDialogVisible: false,
      // 当前操作导游
      currentGuide: {
        id: '',
        name: '',
        certNo: '',
        applyTime: '',
        certImg: 'https://via.placeholder.com/100x140?text=资质证书',
        level: '',
        score: 0,
        workYear: 0,
        violateType: '',
        isPaused: false,
        // 审核相关
        auditResult: '',
        auditOpinion: '',
        // 等级相关
        newLevel: '',
        levelReason: '',
        // 暂停相关
        pauseDays: 7,
        pauseReason: ''
      }
    }
  },
  mounted() {
    this.fetchGuides() // 初始化加载导游数据
  },
  methods: {
    // 获取导游数据（模拟接口）
    fetchGuides() {
      // 模拟待审核导游
      this.pendingGuides = [
        { id: 1, name: '张三', certNo: 'DY2024001', applyTime: '2024-09-01', certImg: 'https://via.placeholder.com/100x140?text=张三证书' },
        { id: 2, name: '李四', certNo: 'DY2024002', applyTime: '2024-09-02', certImg: 'https://via.placeholder.com/100x140?text=李四证书' }
      ].filter(guide => 
        !this.searchKey || 
        guide.name.includes(this.searchKey) || 
        guide.certNo.includes(this.searchKey)
      )
      this.pendingCount = this.pendingGuides.length

      // 模拟所有导游（等级设置用）
      this.allGuides = [
        { id: 1, name: '张三', level: '初级导游', score: 85, workYear: 2 },
        { id: 3, name: '王五', level: '中级导游', score: 92, workYear: 5 },
        { id: 4, name: '赵六', level: '高级导游', score: 96, workYear: 8 }
      ].filter(guide => 
        !this.searchKey || 
        guide.name.includes(this.searchKey)
      )

      // 模拟违规导游
      this.violateGuides = [
        { id: 5, name: '孙七', violateType: '服务态度差', isPaused: false },
        { id: 6, name: '周八', violateType: '虚假宣传', isPaused: true }
      ].filter(guide => 
        !this.searchKey || 
        guide.name.includes(this.searchKey)
      )
      this.pausedCount = this.violateGuides.filter(g => g.isPaused).length
    },

    // 打开资质审核弹窗
    openAuditDialog(guide) {
      this.currentGuide = { ...guide }
      this.auditDialogVisible = true
    },

    // 提交资质审核
    submitAudit() {
      if (!this.currentGuide.auditResult) {
        this.$message.warning('请选择审核结果')
        return
      }
      this.$confirm(`确定${this.currentGuide.auditResult === 'pass' ? '通过' : '驳回'}${this.currentGuide.name}的资质申请？`, '操作确认', {
        type: this.currentGuide.auditResult === 'pass' ? 'success' : 'warning'
      }).then(() => {
        this.$message.success(`审核${this.currentGuide.auditResult === 'pass' ? '通过' : '驳回'}成功`)
        this.auditDialogVisible = false
        this.fetchGuides() // 刷新数据
      })
    },

    // 打开等级设置弹窗
    openLevelDialog(guide) {
      this.currentGuide = { ...guide, newLevel: guide.level, levelReason: '' }
      this.levelDialogVisible = true
    },

    // 提交等级设置
    submitLevel() {
      if (!this.currentGuide.newLevel) {
        this.$message.warning('请选择新服务等级')
        return
      }
      this.$confirm(`确定将${this.currentGuide.name}的服务等级调整为${this.currentGuide.newLevel}？`, '操作确认', {
        type: 'info'
      }).then(() => {
        this.$message.success('服务等级设置成功')
        this.levelDialogVisible = false
        this.fetchGuides()
      })
    },

    // 打开违规暂停弹窗
    openPauseDialog(guide) {
      this.currentGuide = { ...guide, pauseDays: 7, pauseReason: '' }
      this.pauseDialogVisible = true
    },

    // 提交违规暂停
    submitPause() {
      if (!this.currentGuide.pauseDays || this.currentGuide.pauseDays < 1) {
        this.$message.warning('请输入有效的暂停天数（至少1天）')
        return
      }
      this.$confirm(`确定对${this.currentGuide.name}执行${this.currentGuide.pauseDays}天的服务暂停？`, '操作确认', {
        type: 'danger'
      }).then(() => {
        this.$message.success('违规暂停执行成功')
        this.pauseDialogVisible = false
        this.fetchGuides()
      })
    },

    // 根据等级获取标签类型
    getLevelTagType(level) {
      switch (level) {
        case '初级导游': return 'info'
        case '中级导游': return 'success'
        case '高级导游': return 'primary'
        default: return 'info'
      }
    },

    // 查看全部待审核列表（可扩展为新页面或抽屉）
    openAllAuditList() {
      this.$message.info('跳转至全部待审核导游列表（实际项目可扩展为新路由或抽屉组件）')
      // 实际项目中可添加：this.$router.push('/guide/audit-list')
    },

    // 查看全部等级管理列表
    openAllLevelList() {
      this.$message.info('跳转至全部导游等级管理列表（实际项目可扩展为新路由或抽屉组件）')
    },

    // 查看全部违规记录列表
    openAllPauseList() {
      this.$message.info('跳转至全部违规导游记录列表（实际项目可扩展为新路由或抽屉组件）')
    }
  }
};
</script>

<style scoped>
.guide-qualification-page {
  padding: 20px;
  /* background: #fafafa; */
  min-height: calc(100vh - 120px);
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 顶部栏样式 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.operation-area {
  display: flex;
  align-items: center;
}

.permission-tip {
  color: #666;
  font-size: 14px;
}

/* 三大功能卡片容器 */
.function-cards {
  margin-bottom: 30px;
}

/* 功能卡片样式 */
.function-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.function-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

/* 卡片头部（图标+标题+徽章） */
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-size: 20px;
  background-repeat: no-repeat;
  background-position: center;
}

.audit-icon {
  background-color: #e6f7ff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%231890ff' viewBox='0 0 16 16'%3E%3Cpath d='M11.75 1a.75.75 0 0 1 .75.75V3h1.5a.75.75 0 0 1 0 1.5h-11a.75.75 0 0 1 0-1.5h1.5V1.75A.75.75 0 0 1 4.25 1h7.5zm-1 4.5v7.25a.75.75 0 0 1-1.5 0V5.5h-5a.75.75 0 0 1 0-1.5h5a.75.75 0 0 1 1 0z'/%3E%3C/svg%3E");
}

.level-icon {
  background-color: #f0f9eb;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%2352c41a' viewBox='0 0 16 16'%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.25 7.69a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z'/%3E%3C/svg%3E");
}

.pause-icon {
  background-color: #fff2e8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23fa8c16' viewBox='0 0 16 16'%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM5 8a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H5.5A.5.5 0 0 1 5 8zm6 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 11 8z'/%3E%3C/svg%3E");
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.card-badge {
  margin-left: auto;
}

/* 卡片描述 */
.card-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
  padding-right: 8px;
}

/* 卡片内导游列表 */
.card-list {
  margin-bottom: 24px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 8px;
}

.guide-item {
  padding: 12px 8px;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.guide-item:hover {
  background: #f5f5f5;
}

.guide-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-info {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

/* 卡片底部按钮 */
.card-footer {
  text-align: right;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-footer ::v-deep .el-button {
  color: #1890ff;
  padding: 0;
  font-size: 13px;
}

.card-footer ::v-deep .el-button:hover {
  color: #096dd9;
  background: transparent;
}

/* 弹窗表单样式 */
::v-deep .el-dialog__body {
  padding: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-textarea__inner {
  min-height: 80px;
}

/* 响应式适配（小屏自动换行） */
@media (max-width: 1200px) {
  .function-cards {
    flex-direction: column;
  }

  .function-cards .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }
}
</style>