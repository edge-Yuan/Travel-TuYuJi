<template>
  <div class="personal-center">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <h1 class="page-title">个人中心</h1>
          <div class="breadcrumb">
            <span>首页</span>
            <i class="el-icon-arrow-right"></i>
            <span class="current">个人中心</span>
          </div>
        </div>
        <div class="navbar-right">
          <div class="user-quick-info">
            <div class="quick-stats">
              <div class="stat-item">
                <span class="stat-value">{{ stats.points }}</span>
                <span class="stat-label">积分</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.orders }}</span>
                <span class="stat-label">订单</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.favorites }}</span>
                <span class="stat-label">收藏</span>
              </div>
            </div>
            <div class="user-avatar-nav">
              <img :src="userInfo.avatar" alt="用户头像" class="nav-avatar">
              <div class="avatar-status-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-container">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="user-profile-section">
          <div class="profile-card">
            <div class="profile-avatar-container">
              <img :src="userInfo.avatar" alt="用户头像" class="profile-avatar">
              <div class="avatar-ring"></div>
              <div class="avatar-status"></div>
            </div>
            <div class="profile-details">
              <h3 class="profile-name">{{ userInfo.realName || userInfo.username }}</h3>
              <p class="profile-role">旅行达人</p>
              <div class="profile-level">
                <div class="level-progress">
                  <div class="progress-bar" :style="{width: '75%'}"></div>
                </div>
                <span class="level-text">Lv.5 资深旅行者</span>
              </div>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <h4 class="nav-section-title">账户管理</h4>
            <div class="nav-items">
              <div class="nav-item active">
                <div class="nav-icon">
                  <i class="el-icon-user"></i>
                </div>
                <span class="nav-text">个人信息</span>
                <div class="nav-indicator"></div>
              </div>
              <div class="nav-item">
                <div class="nav-icon">
                  <i class="el-icon-tickets"></i>
                </div>
                <span class="nav-text">我的订单</span>
                <div class="nav-badge" v-if="stats.orders > 0">{{ stats.orders }}</div>
              </div>
              <div class="nav-item">
                <div class="nav-icon">
                  <i class="el-icon-star-off"></i>
                </div>
                <span class="nav-text">我的收藏</span>
              </div>
            </div>
          </div>
          
          <div class="nav-section">
            <h4 class="nav-section-title">系统设置</h4>
            <div class="nav-items">
              <div class="nav-item">
                <div class="nav-icon">
                  <i class="el-icon-bell"></i>
                </div>
                <span class="nav-text">消息通知</span>
                <div class="nav-badge" v-if="stats.notifications > 0">{{ stats.notifications }}</div>
              </div>
              <div class="nav-item">
                <div class="nav-icon">
                  <i class="el-icon-setting"></i>
                </div>
                <span class="nav-text">账号设置</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 欢迎横幅 -->
        <div class="welcome-banner">
          <div class="banner-content">
            <div class="banner-left">
              <div class="welcome-text">
                <h2 class="welcome-title">欢迎回来，{{ userInfo.realName || userInfo.username }}！</h2>
                <p class="welcome-subtitle">今天是个旅行的好日子，让我们开始新的冒险吧</p>
              </div>
              <div class="quick-actions">
                <el-button type="primary" class="action-btn primary">
                  <i class="el-icon-plus"></i>
                  创建新行程
                </el-button>
                <el-button class="action-btn secondary">
                  <i class="el-icon-search"></i>
                  探索目的地
                </el-button>
              </div>
            </div>
            <div class="banner-right">
              <div class="welcome-illustration">
                <div class="illustration-circle">
                  <i class="el-icon-location-outline"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据统计仪表板 -->
        <div class="dashboard-section">
          <div class="dashboard-header">
            <h3 class="dashboard-title">我的数据仪表板</h3>
            <div class="dashboard-actions">
              <el-button type="text" class="refresh-btn">
                <i class="el-icon-refresh"></i>
                刷新数据
              </el-button>
            </div>
          </div>
          
          <div class="dashboard-grid">
            <div class="metric-card orders">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="el-icon-tickets"></i>
                </div>
                <div class="metric-trend positive">
                  <i class="el-icon-arrow-up"></i>
                  <span>+12%</span>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ stats.orders }}</div>
                <div class="metric-label">待处理订单</div>
                <div class="metric-description">比上月增长12%</div>
              </div>
            </div>

            <div class="metric-card favorites">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="el-icon-star-off"></i>
                </div>
                <div class="metric-trend positive">
                  <i class="el-icon-arrow-up"></i>
                  <span>+8%</span>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ stats.favorites }}</div>
                <div class="metric-label">我的收藏</div>
                <div class="metric-description">收藏了{{ stats.favorites }}个目的地</div>
              </div>
            </div>

            <div class="metric-card notifications">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="el-icon-bell"></i>
                </div>
                <div class="metric-trend negative">
                  <i class="el-icon-arrow-down"></i>
                  <span>-3%</span>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ stats.notifications }}</div>
                <div class="metric-label">未读消息</div>
                <div class="metric-description">需要处理的消息</div>
              </div>
            </div>

            <div class="metric-card points">
              <div class="metric-header">
                <div class="metric-icon">
                  <i class="el-icon-medal"></i>
                </div>
                <div class="metric-trend positive">
                  <i class="el-icon-arrow-up"></i>
                  <span>+25%</span>
                </div>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ stats.points }}</div>
                <div class="metric-label">旅行积分</div>
                <div class="metric-description">本月获得{{ Math.floor(stats.points * 0.25) }}积分</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近行程 -->
        <div class="recent-trips-section">
          <div class="section-header">
            <h2 class="section-title">最近行程</h2>
            <p class="section-subtitle">您的旅行记录</p>
          </div>
          <div class="trips-container">
            <div class="trip-card" v-for="(trip, index) in recentTrips" :key="index">
              <div class="trip-header">
                <div class="trip-destination">
                  <i class="el-icon-location-outline"></i>
                  <span>{{ trip.destination }}</span>
                </div>
                <el-tag :type="getStatusType(trip.status)" class="trip-status">{{ trip.status }}</el-tag>
              </div>
              <div class="trip-date">
                <i class="el-icon-date"></i>
                <span>{{ trip.date }}</span>
              </div>
              <div class="trip-actions">
                <el-button type="text" class="action-btn">
                  <i class="el-icon-view"></i>
                  查看详情
                </el-button>
                <el-button type="text" class="action-btn" v-if="trip.status === '待出发'">
                  <i class="el-icon-edit"></i>
                  修改行程
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 个人信息编辑 -->
        <div class="profile-section">
          <div class="section-header">
            <h2 class="section-title">个人信息</h2>
            <p class="section-subtitle">管理您的个人资料</p>
          </div>
          <div class="profile-card">
            <div class="profile-header">
              <div class="profile-avatar-section">
                <div class="profile-avatar-large">
                  <img :src="userInfo.avatar" alt="用户头像" class="avatar-large">
                  <div class="avatar-upload-overlay">
                    <i class="el-icon-camera"></i>
                  </div>
                </div>
                <div class="avatar-info">
                  <h3>{{ userInfo.realName || userInfo.username }}</h3>
                  <p>旅行者 · 注册于 {{ formatDate(userInfo.createTime) }}</p>
                </div>
              </div>
              <div class="profile-actions">
                <el-button type="primary" @click="editMode = !editMode" class="edit-btn">
                  <i class="el-icon-edit"></i>
                  {{ editMode ? '取消编辑' : '编辑资料' }}
                </el-button>
              </div>
            </div>
            <el-form :model="userInfo" :rules="userRules" ref="userForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="userInfo.username" :disabled="true" style="background: #f5f5f5;"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="userInfo.realName" :disabled="!editMode"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userInfo.phone" :disabled="!editMode"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userInfo.email" :disabled="!editMode"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="性别" prop="gender">
                    <el-select v-model="userInfo.gender" :disabled="!editMode" placeholder="请选择性别">
                      <el-option label="男" value="male"></el-option>
                      <el-option label="女" value="female"></el-option>
                      <el-option label="其他" value="other"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="生日" prop="birthday">
                    <el-date-picker
                      v-model="userInfo.birthday"
                      type="date"
                      placeholder="选择生日"
                      :disabled="!editMode"
                      style="width: 100%"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="个人简介" prop="introduction">
                <el-input
                  v-model="userInfo.introduction"
                  type="textarea"
                  :rows="3"
                  :disabled="!editMode"
                  placeholder="介绍一下自己吧"
                ></el-input>
              </el-form-item>
              <el-form-item v-if="editMode">
                <el-button type="primary" @click="saveUserInfo">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 密码修改 -->
        <div class="password-section">
          <el-card class="password-card">
            <div slot="header" class="card-header">
              <span class="card-title">密码修改</span>
            </div>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码"></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- 推荐目的地 -->
        <div class="recommendations-section">
          <div class="section-header">
            <h2 class="section-title">为您推荐</h2>
            <p class="section-subtitle">基于您的喜好推荐</p>
          </div>
          <div class="recommendations-grid">
            <div class="recommendation-card" v-for="(item, index) in recommendations" :key="index">
              <div class="recommendation-image-container">
                <img :src="item.image" :alt="item.name" class="recommendation-image" />
                <div class="recommendation-overlay">
                  <el-button type="primary" class="recommendation-btn">
                    <i class="el-icon-view"></i>
                    查看详情
                  </el-button>
                </div>
              </div>
              <div class="recommendation-content">
                <h4 class="recommendation-name">{{ item.name }}</h4>
                <div class="recommendation-rating">
                  <el-rate v-model="item.rating" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                </div>
                <div class="recommendation-tags">
                  <el-tag size="mini" type="success">热门</el-tag>
                  <el-tag size="mini" type="warning">推荐</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'myInfo',
  data() {
    return {
      userInfo: {
        userId: null,
        username: '',
        realName: '',
        phone: '',
        email: '',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        gender: '',
        birthday: '',
        introduction: '',
        userRole: 1,
        status: 1,
        createTime: null
      },
      editMode: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      userRules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      stats: {
        orders: 3,
        favorites: 12,
        notifications: 5,
        points: 2580
      },
      recentTrips: [
        {
          destination: '北京',
          date: '2023-10-15 至 2023-10-20',
          status: '已完成'
        },
        {
          destination: '上海',
          date: '2023-11-05 至 2023-11-10',
          status: '进行中'
        },
        {
          destination: '广州',
          date: '2023-12-20 至 2023-12-25',
          status: '待出发'
        }
      ],
      recommendations: [
        {
          name: '三亚',
          rating: 4.8,
          image: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
        },
        {
          name: '成都',
          rating: 4.7,
          image: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
        },
        {
          name: '杭州',
          rating: 4.6,
          image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        {
          name: '西安',
          rating: 4.5,
          image: 'https://cube.elemecdn.com/1/8e/aeffeb4de2f7b4da6ede945693ce3jpeg.jpeg'
        }
      ]
    }
  },
  mounted() {
    this.loadUserInfo();
    this.loadUserStats();
  },
  methods: {
    async loadUserInfo() {
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          this.$message.error('请先登录');
          return;
        }
        
        const response = await request({
          url: `/travel-portal/sysUser/profile/${userId}`,
          method: 'get'
        });
        
        // 处理响应数据
        if(response && response.data){
          this.userInfo = response.data;
        } else {
          this.userInfo = response;
        }
      } catch (error) {
        this.$message.error('用户信息加载失败');
        console.error('加载用户信息失败:', error);
      }
    },
    
    async loadUserStats() {
      try {
        const userId = this.getCurrentUserId();
        if (!userId) return;
        
        const response = await request({
          url: `/travel-portal/sysUser/statistics/${userId}`,
          method: 'get'
        });
        
        // 处理响应数据
        if(response && response.data){
          this.stats = response.data;
        } else {
          this.stats = response;
        }
      } catch (error) {
        console.error('加载用户统计失败:', error);
      }
    },
    
    getCurrentUserId() {
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        return JSON.parse(userInfo).userId;
      }
      return null;
    },
    
    getStatusType(status) {
      switch(status) {
        case '待出发':
          return 'primary';
        case '进行中':
          return 'success';
        case '已完成':
          return 'info';
        default:
          return 'default';
      }
    },
    
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    },
    
    async saveUserInfo() {
      try {
        this.$refs.userForm.validate(async (valid) => {
          if (valid) {
            const userId = this.getCurrentUserId();
            if (!userId) {
              this.$message.error('请先登录');
              return;
            }
            
            const response = await request({
              url: `/travel-portal/tourist/profile`,
              method: 'put',
              data: {
                userId: userId,
                realName: this.userInfo.realName,
                phone: this.userInfo.phone,
                email: this.userInfo.email,
                gender: this.userInfo.gender,
                birthday: this.userInfo.birthday,
                introduction: this.userInfo.introduction
              }
            });
            
            if (response && response.code === 200) {
              this.$message.success('个人信息更新成功');
              this.editMode = false;
            } else {
              this.$message.error('个人信息更新失败');
            }
          }
        });
      } catch (error) {
        this.$message.error('个人信息更新失败');
        console.error('更新个人信息失败:', error);
      }
    },
    
    cancelEdit() {
      this.editMode = false;
      this.loadUserInfo(); // 重新加载用户信息
    },
    
    async changePassword() {
      try {
        this.$refs.passwordForm.validate(async (valid) => {
          if (valid) {
            const userId = this.getCurrentUserId();
            if (!userId) {
              this.$message.error('请先登录');
              return;
            }
            
            const response = await request({
              url: `/travel-portal/tourist/password`,
              method: 'put',
              data: {
                userId: userId,
                oldPassword: this.passwordForm.oldPassword,
                newPassword: this.passwordForm.newPassword,
                confirmPassword: this.passwordForm.confirmPassword
              }
            });
            
            if (response && response.code === 200) {
              this.$message.success('密码修改成功');
              this.passwordForm = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
              };
            } else {
              this.$message.error('密码修改失败');
            }
          }
        });
      } catch (error) {
        this.$message.error('密码修改失败');
        console.error('修改密码失败:', error);
      }
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '退出登录成功'
        });
        // 这里可以添加退出登录的逻辑
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        });
      });
    },
    
    formatDate(date) {
      if (!date) return '未知';
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.personal-center {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.breadcrumb .current {
  color: #667eea;
  font-weight: 500;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-quick-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.quick-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(102, 126, 234, 0.1);
  padding: 12px 20px;
  border-radius: 25px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(102, 126, 234, 0.3);
}

.user-avatar-nav {
  position: relative;
}

.nav-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}

.avatar-status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #52c41a;
  border: 2px solid #fff;
  border-radius: 50%;
}

/* 主体容器 */
.main-container {
  display: flex;
  gap: 32px;
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 左侧边栏 */
.sidebar {
  width: 320px;
  flex-shrink: 0;
}

.user-profile-section {
  margin-bottom: 24px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}

.avatar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.avatar-status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #52c41a;
  border: 3px solid #fff;
  border-radius: 50%;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
}

.profile-details {
  text-align: center;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.profile-role {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.profile-level {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 12px;
}

.level-progress {
  height: 6px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.level-text {
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}

/* 侧边栏导航 */
.sidebar-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.nav-badge {
  background: #ff4d4f;
  color: #fff;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

.nav-indicator {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item.active .nav-indicator {
  opacity: 1;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 欢迎横幅 */
.welcome-banner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-left {
  flex: 1;
}

.welcome-text {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.action-btn.secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.banner-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-illustration {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 数据仪表板 */
.dashboard-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.refresh-btn {
  color: #667eea;
  font-weight: 500;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.metric-card.orders::before { background: linear-gradient(90deg, #1890ff, #40a9ff); }
.metric-card.favorites::before { background: linear-gradient(90deg, #52c41a, #73d13d); }
.metric-card.notifications::before { background: linear-gradient(90deg, #fa8c16, #ffa940); }
.metric-card.points::before { background: linear-gradient(90deg, #722ed1, #9254de); }

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.metric-card.orders .metric-icon { background: linear-gradient(135deg, #1890ff, #40a9ff); }
.metric-card.favorites .metric-icon { background: linear-gradient(135deg, #52c41a, #73d13d); }
.metric-card.notifications .metric-icon { background: linear-gradient(135deg, #fa8c16, #ffa940); }
.metric-card.points .metric-icon { background: linear-gradient(135deg, #722ed1, #9254de); }

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.metric-trend.positive {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.metric-trend.negative {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.metric-content {
  text-align: left;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1;
}

.metric-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.metric-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-container {
    flex-direction: column;
    gap: 24px;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
  
  .top-navbar {
    padding: 0 16px;
    height: 70px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .quick-stats {
    display: none;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>