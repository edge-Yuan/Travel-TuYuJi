<template>
  <div 
    class="welcome-container" 
    v-if="showWelcome"
    :class="{ 'fade-out': isFading }"
  >
    <div class="welcome-content">
      <div class="welcome-icon">👏</div>
      <div class="welcome-text">
        蓬门今始为君开！<br/>
        欢迎来到途遇纪旅游管理系统（旅行商端）
      </div>
      <div class="welcome-subtext">
        请点击下方按钮开始吧！
      </div>
      <button 
        class="start-button" 
        @click="handleStartClick"
      >
        开始使用
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminWelcome',
  data() {
    return {
      showWelcome: true,
      isFading: false
    }
  },
  created() {
    // 检查是否是首次加载或刷新到主页
    const currentPath = this.$route.path;
    if (currentPath !== '/merchants/home') {
      this.showWelcome = false;
    }
  },
  methods: {
    handleStartClick() {
      // 添加淡出动画
      this.isFading = true;
      
      // 动画结束后隐藏组件
      setTimeout(() => {
        this.showWelcome = false;
        // 可以在这里添加点击按钮后的其他逻辑，如跳转到第一个菜单页面
        // this.$router.push('/managers/dashboard');
      }, 500);
    }
  },
  watch: {
    // 监听路由变化，如果回到主页则重新显示欢迎信息
    '$route.path'(newPath) {
      if (newPath === '/merchants/home') {
        this.showWelcome = true;
        this.isFading = false;
      } else {
        this.showWelcome = false;
      }
    }
  }
}
</script>

<style scoped>
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 999;
  transition: opacity 0.5s ease;
}

.welcome-content {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
  max-width: 600px;
  width: 90%;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

.welcome-text {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.welcome-subtext {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
}

.start-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.start-button:hover {
  background-color: #359e75;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.start-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

.fade-out {
  opacity: 0;
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}
</style>

