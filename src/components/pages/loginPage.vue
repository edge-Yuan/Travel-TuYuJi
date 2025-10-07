<template>
    <div class="login-container">
        <div v-if="showCelebration" class="celebration-container">
            <div class="celebration-text">🎉🎉</div>
        </div>

        <el-card class="login-card" shadow="always">
            <el-row :gutter="0">
                <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
                    <div class="left-section">
                        <div class="logo-container">
                            <div class="logo-wrapper">
                                <img src="../../assets/logo/newlogo.png" alt="旅游管理系统" class="logo-img">
                            </div>
                            <h1 class="main-title">欢迎来到</h1>
                            <h2 class="brand-title">途遇纪旅游管理系统</h2>
                            <p class="subtitle">探索世界，记录美好时光</p>
                            <div class="feature-list">
                                <div class="feature-item">
                                    <i class="el-icon-location"></i>
                                    <span>智能路线规划</span>
                                </div>
                                <div class="feature-item">
                                    <i class="el-icon-star-on"></i>
                                    <span>个性化推荐</span>
                                </div>
                                <div class="feature-item">
                                    <i class="el-icon-user"></i>
                                    <span>专业导游服务</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>

                <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
                    <div class="right-section">
                        <div class="form-container">
                            <h3 class="form-title">用户登录</h3>
                            <p class="form-subtitle">请输入您的账户信息</p>

                            <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
                                <!-- 注意：后端登录接口用的是 username，这里若需用 email，需后端同步支持；若后端只认 username，需将 prop 和 v-model 改为 username -->
                                <el-form-item prop="username">
                                    <el-input v-model="loginForm.username" placeholder="请输入用户名"
                                        prefix-icon="el-icon-message" size="large" class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="password">
                                    <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"
                                        prefix-icon="el-icon-lock" show-password size="large" class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item>
                                    <el-row :gutter="20">
                                        <el-col :span="12">
                                            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
                                        </el-col>
                                        <el-col :span="12" class="forget-password">
                                            <a href="#" class="forget-link">忘记密码？</a>
                                        </el-col>
                                    </el-row>
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" size="large" class="login-btn" @click="handleLogin"
                                        :loading="loading">
                                        <span v-if="!loading">立即登录</span>
                                        <span v-else>登录中...</span>
                                    </el-button>
                                </el-form-item>

                                <el-form-item class="register-section">
                                    <div class="divider">
                                        <span>或</span>
                                    </div>
                                    <div class="register-link">
                                        <span>还没有账户？</span>
                                        <router-link to="/auth/registerPage" class="register-btn">立即注册</router-link>
                                    </div>
                                </el-form-item>

                            </el-form>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script>
// 1. 引入配置好的 axios 实例（request.js）
import request from '@/utils/request';
// 2. 引入路由（用于登录成功后跳转）
import router from '@/router';

export default {
    name: 'loginPage',
    data() {
        return {
            loading: false, // 登录按钮加载状态
            showCelebration: false, // 庆祝效果显示/隐藏
            loginForm: {
                username: '', // 邮箱（若后端用 username，需改为 username: ''）
                password: '', // 密码（明文，后端会自动 MD5 加密）
                remember: false // 记住密码
            },
            // 表单验证规则（保留原规则）
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { type: 'string', message: '请输入正确的用户名格式', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 4. 改造 handleLogin 方法：替换模拟请求为真实 axios 请求
        async handleLogin() {
            // 第一步：表单验证
            this.$refs.loginForm.validate(async (valid) => {
                if (valid) {
                    this.loading = true; // 开启加载状态

                    try {
                        // 第二步：构造请求参数（若后端需要 username，需将 email 改为 username）
                        const loginParams = {
                            // 注意：这里的参数名必须与后端 UserLoginDTO 的字段一致！
                            // 若后端 UserLoginDTO 是 username，需改为 username: this.loginForm.email
                            username: this.loginForm.username, 
                            password: this.loginForm.password // 明文密码，后端会 MD5 加密
                        };

                        // 第三步：发送真实登录请求（调用后端接口）
                        const response = await request({
                            url: '/travel-portal/sysUser/login', // 后端登录接口路径（与 request.js 的 baseURL 拼接）
                            method: 'post', // 请求方法（必须与后端一致）
                            data: loginParams // 请求体（对应后端 @RequestBody UserLoginDTO）
                        });

                        // 第四步：登录成功后的处理
                        // 4.1 显示庆祝效果（2秒后隐藏）
                        // this.showCelebration = true;
                        // setTimeout(() => {
                        //     this.showCelebration = false;
                        // }, 2000);

                        // 4.2 提示登录成功：从多种字段安全获取显示名
                        const userData = response?.data || response; 
                        const displayName = userData.realName || userData.nickName || userData.username || userData.userName || '用户';
                        this.$message.success(`欢迎回来，${displayName}！🎉🎉`);

                        // 4.3 记住密码：将用户信息/Token 存入 localStosrage
                        const token = userData?.token || userData?.data?.token || userData?.accessToken || '';
                        const role = userData?.userRole || userData?.role || userData?.data?.userRole;
                        
                        // 提取用户ID，尝试多种可能的字段名
                        const userId = userData?.userId || userData?.id || userData?.uid || 
                                      userData?.data?.userId || userData?.data?.id || userData?.data?.uid ||
                                      userData?.user?.id || userData?.user?.userId;
                        
                        // 如果从用户数据中无法获取userId，尝试从token中解析
                        let extractedUserId = userId;
                        if (!extractedUserId && token && token.includes('.')) {
                            try {
                                const payload = JSON.parse(atob(token.split('.')[1]));
                                extractedUserId = payload.userId || payload.id || payload.sub || payload.user_id;
                            } catch (e) {
                                console.warn('从token解析userId失败:', e);
                            }
                        }
                        
                        const normalizedUser = { 
                            ...userData, 
                            token, 
                            userRole: role,
                            userId: extractedUserId  // 确保userId字段存在
                        };
                        
                        console.log('登录成功，用户信息:', {
                            userId: extractedUserId,
                            userRole: role,
                            username: userData.username,
                            realName: userData.realName
                        });
                        
                        if (this.loginForm.remember) {
                            localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
                            if (token) localStorage.setItem('token', token);
                            if (extractedUserId) localStorage.setItem('userId', String(extractedUserId));
                        } else {
                            sessionStorage.setItem('userInfo', JSON.stringify(normalizedUser));
                            if (token) sessionStorage.setItem('token', token);
                            if (extractedUserId) sessionStorage.setItem('userId', String(extractedUserId));
                        }

                        // 4.4 延迟跳转首页（1.5秒后）//判断是什么角色对应进入不同首页
                        setTimeout(() => {
                            const userRole = role;
                            if (userRole === 5) {
                                router.push('/travellers/home');
                            } else if (userRole === 2 || userRole === 3) {
                                router.push('/managers/home');
                            } else if (userRole === 1) {
                                router.push('/travellers/home');
                            } else if (userRole === 4) {
                                router.push('/merchants/home');
                            } else {
                                router.push('/travellers/home');
                            }
                        }, 1500);

                    } catch (error) {
                        // 第五步：登录失败后的处理（捕获后端返回的错误）
                        // 错误信息优先取后端返回的 msg，若无则显示默认提示
                        this.$message.error(error.message || '登录失败，请检查账户信息或网络状态');
                    } finally {
                        // 第六步：无论成功/失败，都关闭加载状态
                        this.loading = false;
                    }
                } else {
                    // 表单验证失败
                    this.$message.error('请检查输入信息是否符合要求');
                }
            });
        },

        // 保留快速填充测试数据的方法（方便测试）
        fillTestData() {
            // 这里填充的是真实存在的后端账号（需替换为你数据库中的账号）
            this.loginForm.email = 'adddmm1'; // 若后端用 username，填数据库中的 username（如 adddmm1）
            this.loginForm.password = '123456'; // 数据库中对应的明文密码
        }
    }
}
</script>

<style scoped>
/* 原样式全部保留，无需修改 */
/* 主容器 - 白色背景 */
.login-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    overflow: hidden;
    background-color: #ffffff;
}

/* 登录卡片 */
.login-card {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1000px;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border: none;
    overflow: hidden;
    background: #ffffff;
}

.login-card .el-card__body {
    padding: 0;
}

/* 左侧区域 - 白色背景 */
.left-section {
    background-color: #ffffff;
    padding: 60px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    position: relative;
    overflow: hidden;
    border-radius: 24px;
}

.logo-container {
    text-align: center;
    color: #2c3e50;
    position: relative;
    z-index: 1;
}

.logo-wrapper {
    margin-bottom: 5px;
    display: inline-block;
    padding: 5px;
    /* background: rgba(238, 242, 246, 0.8); */
    border-radius: 50%;
    backdrop-filter: blur(10px);
    /* border: 1px solid rgba(226, 232, 240, 1); */
}

.logo-img {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: none;
}

.main-title {
    font-size: 28px;
    font-weight: 300;
    margin: 0 0 10px 0;
    opacity: 0.9;
    color: #2c3e50;
}

.brand-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 15px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #2c3e50;
}

.subtitle {
    font-size: 16px;
    margin: 0 0 40px 0;
    opacity: 0.8;
    font-weight: 300;
    color: #7f8c8d;
}

.feature-list {
    text-align: left;
}

.feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;
    opacity: 0.9;
    color: #4a5568;
}

.feature-item i {
    margin-right: 12px;
    font-size: 18px;
    width: 20px;
    color: #667eea;
}

/* 右侧区域 - 白色背景 */
.right-section {
    padding: 60px 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
}

.form-container {
    width: 100%;
    max-width: 400px;
}

.form-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
    text-align: center;
}

.form-subtitle {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0 0 40px 0;
    text-align: center;
}

/* 表单样式 */
.login-form {
    margin-top: 20px;
}

.login-form .el-form-item {
    margin-bottom: 24px;
}

.custom-input {
    border-radius: 12px;
}

.custom-input .el-input__inner {
    height: 50px;
    line-height: 50px;
    border-radius: 12px;
    border: 2px solid #e1e8ed;
    font-size: 14px;
    padding: 0 20px;
    transition: all 0.3s ease;
}

.custom-input .el-input__inner:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.custom-input .el-input__prefix {
    left: 15px;
    color: #a0aec0;
}

.forget-password {
    text-align: right;
}

.forget-link {
    color: #667eea;
    text-decoration: none;
    font-size: 13px;
    transition: color 0.3s ease;
}

.forget-link:hover {
    color: #5a67d8;
    text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
    width: 100%;
    height: 50px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
    transform: translateY(0);
}

/* 分割线 */
.divider {
    text-align: center;
    margin: 30px 0 20px 0;
    position: relative;
}

.divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e8ed;
}

.divider span {
    background: #ffffff;
    padding: 0 20px;
    color: #a0aec0;
    font-size: 13px;
    position: relative;
    z-index: 1;
}

/* 注册链接 */
.register-section {
    text-align: center;
    margin-top: 0;
}

.register-link {
    font-size: 14px;
    color: #7f8c8d;
}

.register-btn {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
    transition: color 0.3s ease;
}

.register-btn:hover {
    color: #5a67d8;
    text-decoration: underline;
}

/* 复选框样式 */
.el-checkbox {
    color: #7f8c8d;
    font-size: 13px;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #667eea;
    border-color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .login-container {
        padding: 10px;
    }

    .login-card {
        border-radius: 16px;
    }

    .left-section {
        padding: 40px 30px;
        min-height: 300px;
    }

    .right-section {
        padding: 40px 30px;
    }

    .logo-img {
        width: 60px;
        height: 60px;
    }

    .main-title {
        font-size: 24px;
    }

    .brand-title {
        font-size: 28px;
    }

    .form-title {
        font-size: 24px;
    }

    .feature-list {
        display: none;
    }
}

@media (max-width: 480px) {
    .left-section {
        padding: 30px 20px;
        min-height: 250px;
    }

    .right-section {
        padding: 30px 20px;
    }

    .main-title {
        font-size: 20px;
    }

    .brand-title {
        font-size: 24px;
    }

    .form-title {
        font-size: 20px;
    }
}

/* 动画效果 */
.login-card {
    animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 输入框聚焦效果 */
.custom-input.is-focus .el-input__inner {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 按钮加载状态 */
.login-btn.is-loading {
    pointer-events: none;
}

/* 表单验证错误样式 */
.el-form-item.is-error .custom-input .el-input__inner {
    border-color: #f56565;
    box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
}

/* 滚动条样式 */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 庆祝效果容器 */
.celebration-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
}

/* 烟花效果样式 */
.fireworks-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.firework {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation: firework-explode 2s ease-out var(--delay) both;
}

.firework:nth-child(1) {
    top: 20%;
    left: 20%;
}

.firework:nth-child(2) {
    top: 30%;
    left: 80%;
}

.firework:nth-child(3) {
    top: 60%;
    left: 15%;
}

.firework:nth-child(4) {
    top: 70%;
    left: 85%;
}

.firework:nth-child(5) {
    top: 15%;
    left: 50%;
}

.firework:nth-child(6) {
    top: 80%;
    left: 30%;
}

.firework:nth-child(7) {
    top: 40%;
    left: 70%;
}

.firework:nth-child(8) {
    top: 90%;
    left: 60%;
}

.firework-particle {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    animation: particle-explode 1.5s ease-out var(--particle-delay) both;
}

/* 烟花爆炸动画 */
@keyframes firework-explode {
    0% {
        transform: scale(0);
        opacity: 1;
    }

    50% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

/* 粒子爆炸动画 */
@keyframes particle-explode {
    0% {
        transform: translate(0, 0) scale(0);
        opacity: 1;
    }

    100% {
        transform: translate(var(--random-x, 0), var(--random-y, 0)) scale(1);
        opacity: 0;
    }
}

/* 为每个烟花设置不同的颜色和位置 */
.firework:nth-child(1) .firework-particle {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    --random-x: calc((var(--particle-delay) * 100) - 50px);
    --random-y: calc((var(--particle-delay) * 80) - 40px);
}

.firework:nth-child(2) .firework-particle {
    background: linear-gradient(45deg, #4ecdc4, #7fdbda);
    --random-x: calc((var(--particle-delay) * 120) - 60px);
    --random-y: calc((var(--particle-delay) * 90) - 45px);
}

.firework:nth-child(3) .firework-particle {
    background: linear-gradient(45deg, #45b7d1, #6bc5d8);
    --random-x: calc((var(--particle-delay) * 110) - 55px);
    --random-y: calc((var(--particle-delay) * 70) - 35px);
}

.firework:nth-child(4) .firework-particle {
    background: linear-gradient(45deg, #96ceb4, #a8d5ba);
    --random-x: calc((var(--particle-delay) * 130) - 65px);
    --random-y: calc((var(--particle-delay) * 100) - 50px);
}

.firework:nth-child(5) .firework-particle {
    background: linear-gradient(45deg, #feca57, #fed976);
    --random-x: calc((var(--particle-delay) * 90) - 45px);
    --random-y: calc((var(--particle-delay) * 110) - 55px);
}

.firework:nth-child(6) .firework-particle {
    background: linear-gradient(45deg, #ff9ff3, #f368e0);
    --random-x: calc((var(--particle-delay) * 140) - 70px);
    --random-y: calc((var(--particle-delay) * 60) - 30px);
}

.firework:nth-child(7) .firework-particle {
    background: linear-gradient(45deg, #54a0ff, #74b9ff);
    --random-x: calc((var(--particle-delay) * 80) - 40px);
    --random-y: calc((var(--particle-delay) * 120) - 60px);
}

.firework:nth-child(8) .firework-particle {
    background: linear-gradient(45deg, #5f27cd, #7c4dff);
    --random-x: calc((var(--particle-delay) * 150) - 75px);
    --random-y: calc((var(--particle-delay) * 85) - 42px);
}

/* 烟花中心点 */
.firework::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: radial-gradient(circle, #fff 0%, #ffd700 50%, #ff6b6b 100%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: center-glow 2s ease-out var(--delay) both;
}

@keyframes center-glow {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8);
    }

    50% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.4);
    }

    100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
        box-shadow: 0 0 40px 20px rgba(255, 255, 255, 0);
    }
}

/* 添加闪烁效果 */
.firework-particle::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: inherit;
    border-radius: 50%;
    filter: blur(2px);
    opacity: 0.6;
    animation: particle-glow 1.5s ease-out var(--particle-delay) both;
}

@keyframes particle-glow {
    0% {
        transform: scale(0.5);
        opacity: 0.6;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.3;
    }

    100% {
        transform: scale(2);
        opacity: 0;
    }
}

/* 彩带效果 */
.confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    left: var(--x);
    top: -10px;
    animation: confetti-fall 3s linear var(--delay) infinite;
}

.confetti:nth-child(odd) {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    transform: rotate(45deg);
}

.confetti:nth-child(even) {
    background: linear-gradient(45deg, #4ecdc4, #7fdbda);
    transform: rotate(-45deg);
}

.confetti:nth-child(3n) {
    background: linear-gradient(45deg, #feca57, #fed976);
    width: 8px;
    height: 8px;
}

.confetti:nth-child(4n) {
    background: linear-gradient(45deg, #ff9ff3, #f368e0);
    width: 12px;
    height: 12px;
}

.confetti:nth-child(5n) {
    background: linear-gradient(45deg, #54a0ff, #74b9ff);
    transform: rotate(90deg);
}

@keyframes confetti-fall {
    0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
    }

    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}

/* 让彩带持续飘落 */
.confetti {
    animation: confetti-fall 4s linear var(--delay) infinite;
}


/* 响应式设计 - 庆祝效果 */
@media (max-width: 768px) {
    .confetti {
        width: 8px;
        height: 8px;
    }
}

@media (max-width: 480px) {
    .confetti {
        width: 6px;
        height: 6px;
    }
}
</style>