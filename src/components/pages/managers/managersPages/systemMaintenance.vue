<template>
  <div class="system-maintenance">
    <h2>系统运维中心</h2>
    
    <!-- 功能选择区 - 趣味卡片布局 -->
    <div class="function-cards" v-if="step === 1">
      <div 
        class="fun-card" 
        :class="currentFunc === 'backup' ? 'active' : ''"
        @click="selectFunc('backup')"
      >
        <div class="icon-box">
          <i class="el-icon-download"></i>
        </div>
        <h3>数据备份</h3>
        <p>定期备份系统关键数据，保障数据安全</p>
        <el-button 
          type="primary" 
          size="mini"
          @click.stop="step = 2"
        >
          开始操作
        </el-button>
      </div>
      
      <div 
        class="fun-card" 
        :class="currentFunc === 'settings' ? 'active' : ''"
        @click="selectFunc('settings')"
      >
        <div class="icon-box">
          <i class="el-icon-setting"></i>
        </div>
        <h3>参数设置</h3>
        <p>配置系统运行参数，优化系统性能</p>
        <el-button 
          type="primary" 
          size="mini"
          @click.stop="step = 2"
        >
          开始操作
        </el-button>
      </div>
      
      <div 
        class="fun-card" 
        :class="currentFunc === 'update' ? 'active' : ''"
        @click="selectFunc('update')"
      >
        <div class="icon-box">
          <i class="el-icon-refresh"></i>
        </div>
        <h3>系统更新</h3>
        <p>检查并安装系统更新，获取最新功能</p>
        <el-button 
          type="primary" 
          size="mini"
          @click.stop="step = 2"
        >
          开始操作
        </el-button>
      </div>
    </div>

    <!-- 操作区 - 三级交互第二步 -->
    <div class="operation-area" v-if="step === 2">
      <div class="back-link" @click="step = 1">← 返回功能选择</div>
      
      <!-- 数据备份操作 -->
      <div v-if="currentFunc === 'backup'">
        <h3>数据备份设置</h3>
        <el-form :model="backupForm" label-width="120px">
          <el-form-item label="备份范围">
            <el-checkbox-group v-model="backupForm.scope">
              <el-checkbox label="用户数据">用户数据</el-checkbox>
              <el-checkbox label="订单数据">订单数据</el-checkbox>
              <el-checkbox label="系统配置">系统配置</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="备份方式">
            <el-radio-group v-model="backupForm.method">
              <el-radio label="auto">自动备份</el-radio>
              <el-radio label="manual">手动备份</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备份周期" v-if="backupForm.method === 'auto'">
            <el-select v-model="backupForm.period">
              <el-option label="每日" value="day"></el-option>
              <el-option label="每周" value="week"></el-option>
              <el-option label="每月" value="month"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="btn-group">
          <el-button type="primary" @click="step = 3">执行备份</el-button>
        </div>
      </div>
      
      <!-- 参数设置操作 -->
      <div v-if="currentFunc === 'settings'">
        <h3>系统参数配置</h3>
        <el-form :model="systemForm" label-width="120px">
          <el-form-item label="会话超时时间">
            <el-input v-model="systemForm.timeout" suffix="分钟"></el-input>
          </el-form-item>
          <el-form-item label="日志保留天数">
            <el-input v-model="systemForm.logDays"></el-input>
          </el-form-item>
          <el-form-item label="自动登出">
            <el-switch v-model="systemForm.autoLogout"></el-switch>
          </el-form-item>
        </el-form>
        <div class="btn-group">
          <el-button type="primary" @click="step = 3">保存设置</el-button>
        </div>
      </div>
      
      <!-- 系统更新操作 -->
      <div v-if="currentFunc === 'update'">
        <h3>系统更新维护</h3>
        <div class="update-info">
          <p>当前版本：v{{ currentVersion }}</p>
          <p v-if="hasUpdate" class="update-available">发现新版本：v{{ newVersion }}</p>
          <p v-else>当前已是最新版本</p>
        </div>
        <el-progress 
          v-if="updateProgress > 0 && updateProgress < 100"
          :percentage="updateProgress" 
          stroke-width="8"
        ></el-progress>
        <div class="btn-group" v-if="!updating">
          <el-button 
            type="primary" 
            @click="startUpdate"
            :disabled="!hasUpdate"
          >
            安装更新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 结果区 - 三级交互第三步 -->
    <div class="result-area" v-if="step === 3">
      <div class="result-icon">
        <i class="el-icon-circle-check success"></i>
      </div>
      <div class="result-text">
        <h3>{{ getResultTitle() }}</h3>
        <p v-if="currentFunc === 'backup'">
          备份范围：{{ backupForm.scope.join('、') }}<br>
          备份方式：{{ backupForm.method === 'auto' ? '自动备份（' + getPeriodText() + '）' : '手动备份' }}<br>
          备份时间：{{ new Date().toLocaleString() }}
        </p>
        <p v-if="currentFunc === 'settings'">
          会话超时：{{ systemForm.timeout }}分钟<br>
          日志保留：{{ systemForm.logDays }}天<br>
          自动登出：{{ systemForm.autoLogout ? '开启' : '关闭' }}
        </p>
        <p v-if="currentFunc === 'update'">
          已成功更新至版本：v{{ newVersion }}<br>
          更新内容：{{ updateContent }}
        </p>
      </div>
      <el-button 
        type="primary" 
        @click="resetProcess"
      >
        完成
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'systemMaintenance',
  data() {
    return {
      // 基础状态
      step: 1, // 1-选择功能 2-操作 3-结果
      currentFunc: 'backup', // 当前功能
      
      // 备份表单
      backupForm: {
        scope: ['用户数据', '订单数据'],
        method: 'manual',
        period: 'week'
      },
      
      // 系统设置表单
      systemForm: {
        timeout: 30,
        logDays: 30,
        autoLogout: true
      },
      
      // 系统更新相关
      currentVersion: '1.2.0',
      newVersion: '1.3.0',
      hasUpdate: true,
      updating: false,
      updateProgress: 0,
      updateContent: '1. 优化数据备份效率<br>2. 修复已知bug<br>3. 新增系统监控功能'
    };
  },
  methods: {
    // 选择功能
    selectFunc(func) {
      this.currentFunc = func;
    },
    
    // 开始系统更新
    startUpdate() {
      this.updating = true;
      this.updateProgress = 0;
      
      // 模拟更新进度
      const timer = setInterval(() => {
        this.updateProgress += 10;
        if (this.updateProgress >= 100) {
          clearInterval(timer);
          this.updating = false;
          this.step = 3;
        }
      }, 500);
    },
    
    // 获取周期文本
    getPeriodText() {
      const map = { day: '每日', week: '每周', month: '每月' };
      return map[this.backupForm.period];
    },
    
    // 获取结果标题
    getResultTitle() {
      const titles = {
        backup: '数据备份完成',
        settings: '系统参数设置已保存',
        update: '系统更新完成'
      };
      return titles[this.currentFunc];
    },
    
    // 重置流程
    resetProcess() {
      this.step = 1;
      this.updateProgress = 0;
      this.updating = false;
    }
  }
};
</script>

<style scoped>
.system-maintenance {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  text-align: center;
}

/* 趣味卡片布局 */
.function-cards {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  justify-content: center;
}

.fun-card {
  width: 220px;
  padding: 20px;
  border-radius: 12px;
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.fun-card.active {
  background: #e6f7ff;
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.icon-box {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.fun-card h3 {
  margin: 0 0 10px;
  color: #333;
}

.fun-card p {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px;
  line-height: 1.5;
}

/* 操作区域 */
.operation-area {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: left;
}

.back-link {
  color: #1890ff;
  cursor: pointer;
  margin-bottom: 15px;
  display: inline-block;
}

.operation-area h3 {
  margin: 0 0 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.btn-group {
  margin-top: 20px;
  text-align: right;
}

.update-info {
  margin-bottom: 20px;
  line-height: 1.8;
}

.update-available {
  color: #f5222d;
  font-weight: 500;
}

/* 结果区域 */
.result-area {
  margin-top: 30px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.result-icon {
  margin-bottom: 20px;
}

.success {
  font-size: 60px;
  color: #52c41a;
}

.result-text {
  margin-bottom: 25px;
  line-height: 1.6;
}

.result-text h3 {
  margin: 0 0 15px;
  color: #333;
}

.result-text p {
  color: #666;
  margin: 0;
}
</style>
