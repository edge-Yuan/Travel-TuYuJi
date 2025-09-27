<template>
  <div class="edit-profile">
    <h2>编辑个人主页</h2>
    <form class="profile-form" @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="name">导游姓名</label>
        <input type="text" id="name" v-model="profile.name" required>
      </div>
      
      <div class="form-group">
        <label for="id">导游编号</label>
        <input type="text" id="id" v-model="profile.id" disabled>
        <p class="form-hint">编号由系统自动生成，不可修改</p>
      </div>
      
      <div class="form-group">
        <label for="gender">性别</label>
        <div class="radio-group">
          <label>
            <input type="radio" value="male" v-model="profile.gender"> 男
          </label>
          <label>
            <input type="radio" value="female" v-model="profile.gender"> 女
          </label>
        </div>
      </div>
      
      <div class="form-group">
        <label for="introduction">个人简介</label>
        <textarea id="introduction" v-model="profile.introduction" rows="5" 
                  placeholder="请输入您的个人简介，包括从业经验、擅长领域等"></textarea>
        <p class="form-hint">简介长度建议不超过500字</p>
      </div>
      
      <div class="form-group">
        <label>资质证明状态</label>
        <div class="status-indicator" :class="profile.certificationStatus === 'sufficient' ? 'sufficient' : 'insufficient'">
          {{ profile.certificationStatus === 'sufficient' ? '资质证明充足' : '资质证明不足' }}
        </div>
        <p class="form-hint" v-if="profile.certificationStatus === 'insufficient'">
          请先到"提交材料"页面上传足够的资质证明文件
        </p>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn cancel-btn" @click="resetForm">重置</button>
        <button type="submit" class="btn save-btn">保存修改</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'EditProfile',
  data() {
    return {
      profile: {
        id: '',
        name: '',
        gender: 'male',
        introduction: '',
        certificationStatus: 'insufficient' // 'sufficient' or 'insufficient'
      },
      originalProfile: {}
    }
  },
  mounted() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        // 模拟从API加载个人资料
        // const response = await this.$axios.get('/api/profile')
        // this.profile = response.data
        
        // 模拟数据
        setTimeout(() => {
          this.profile = {
            id: 'GD' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            name: '张导游',
            gender: 'male',
            introduction: '从事导游工作5年，熟悉国内各大旅游景点，尤其擅长历史文化类景点讲解。曾多次获得"优秀导游"称号，服务热情周到，得到游客一致好评。',
            certificationStatus: 'sufficient'
          }
          // 保存原始数据用于重置
          this.originalProfile = JSON.parse(JSON.stringify(this.profile))
        }, 500)
      } catch (error) {
        this.$message.error('加载个人资料失败')
        console.error('加载失败:', error)
      }
    },
    
    saveProfile() {
      try {
        // 模拟保存到API
        // await this.$axios.put('/api/profile', this.profile)
        
        // 模拟API延迟
        setTimeout(() => {
          this.$message.success('个人资料保存成功')
          // 更新原始数据
          this.originalProfile = JSON.parse(JSON.stringify(this.profile))
        }, 800)
      } catch (error) {
        this.$message.error('保存失败，请重试')
        console.error('保存失败:', error)
      }
    },
    
    resetForm() {
      this.profile = JSON.parse(JSON.stringify(this.originalProfile))
      this.$message.info('已重置为原始数据')
    }
  }
}
</script>

<style scoped>
.edit-profile {
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
}

.profile-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
  color: #777;
}

.form-hint {
  margin-top: 5px;
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 0;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.status-indicator {
  display: inline-block;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 500;
}

.status-indicator.sufficient {
  background-color: rgba(46, 204, 113, 0.1);
  color: #27ae60;
}

.status-indicator.insufficient {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
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
