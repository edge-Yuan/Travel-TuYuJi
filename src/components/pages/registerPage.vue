<template>
    <div class="register-container">
        <div v-if="showCelebration" class="celebration-container">
            <div class="celebration-text">🎉 注册成功！🎉</div>
        </div>

        <el-card class="register-card" shadow="always">
            <el-row :gutter="0">
                <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
                    <div class="left-section">
                        <div class="logo-container">
                            <div class="logo-wrapper">
                                <img src="../../assets/logo/newlogo.png" alt="旅游管理系统" class="logo-img">
                            </div>
                            <h1 class="main-title">加入我们</h1>
                            <h2 class="brand-title">途遇纪旅游管理系统</h2>
                            <p class="subtitle">开启您的精彩旅程</p>
                            <div class="feature-list">
                                <div class="feature-item">
                                    <i class="el-icon-user"></i>
                                    <span>个性化服务</span>
                                </div>
                                <div class="feature-item">
                                    <i class="el-icon-location"></i>
                                    <span>智能路线推荐</span>
                                </div>
                                <div class="feature-item">
                                    <i class="el-icon-star-on"></i>
                                    <span>专业导游团队</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>

                <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
                    <div class="right-section">
                        <div class="form-container">
                            <h3 class="form-title">用户注册</h3>
                            <p class="form-subtitle">请填写您的详细信息</p>

                            <el-form :model="registerForm" :rules="rules" ref="registerForm" class="register-form">
                                <el-form-item prop="username">
                                    <el-input 
                                        v-model="registerForm.username" 
                                        placeholder="请输入用户名"
                                        prefix-icon="el-icon-user" 
                                        size="large" 
                                        class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="password">
                                    <el-input 
                                        v-model="registerForm.password" 
                                        type="password" 
                                        placeholder="请输入密码"
                                        prefix-icon="el-icon-lock" 
                                        show-password 
                                        size="large" 
                                        class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="confirmPassword">
                                    <el-input 
                                        v-model="registerForm.confirmPassword" 
                                        type="password" 
                                        placeholder="请确认密码"
                                        prefix-icon="el-icon-lock" 
                                        show-password 
                                        size="large" 
                                        class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="realName">
                                    <el-input 
                                        v-model="registerForm.realName" 
                                        placeholder="请输入真实姓名"
                                        prefix-icon="el-icon-edit" 
                                        size="large" 
                                        class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="phone">
                                    <el-input 
                                        v-model="registerForm.phone" 
                                        placeholder="请输入手机号码"
                                        prefix-icon="el-icon-phone" 
                                        size="large" 
                                        class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="email">
                                    <el-input 
                                        v-model="registerForm.email" 
                                        placeholder="请输入邮箱地址"
                                        prefix-icon="el-icon-message" 
                                        size="large" 
                                        class="custom-input">
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="userRole">
                                    <el-select 
                                        v-model="registerForm.userRole" 
                                        placeholder="请选择用户角色"
                                        size="large" 
                                        class="custom-select">
                                        <el-option label="游客" :value="1"></el-option>
                                        <!-- <el-option label="系统管理员" :value="2"></el-option>
                                        <el-option label="财务管理员" :value="3"></el-option> -->
                                        <el-option label="旅行商" :value="4"></el-option>
                                        <el-option label="导游" :value="5"></el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item>
                                    <el-row :gutter="20">
                                        <el-col :span="12">
                                            <el-checkbox v-model="registerForm.agreeTerms">我已阅读并同意</el-checkbox>
                                        </el-col>
                                        <el-col :span="12" class="terms-link">
                                            <a href="#" class="terms-text">《用户协议》</a>
                                        </el-col>
                                    </el-row>
                                </el-form-item>

                                <el-form-item>
                                    <el-button 
                                        type="primary" 
                                        size="large" 
                                        class="register-btn" 
                                        @click="handleRegister"
                                        :loading="loading">
                                        <span v-if="!loading">立即注册</span>
                                        <span v-else>注册中...</span>
                                    </el-button>
                                </el-form-item>

                                <el-form-item class="login-section">
                                    <div class="divider">
                                        <span>或</span>
                                    </div>
                                    <div class="login-link">
                                        <span>已有账户？</span>
                                        <router-link to="/auth/loginPage" class="login-btn">立即登录</router-link>
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
import request from '@/utils/request';
import router from '@/router';

export default {
    name: 'registerPage',
    data() {
        // 自定义密码确认验证
        const validateConfirmPassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };

        // 自定义手机号验证
        const validatePhone = (rule, value, callback) => {
            const phoneReg = /^1[3-9]\d{9}$/;
            if (value === '') {
                callback(new Error('请输入手机号码'));
            } else if (!phoneReg.test(value)) {
                callback(new Error('请输入正确的手机号码'));
            } else {
                callback();
            }
        };

        // 自定义邮箱验证
        const validateEmail = (rule, value, callback) => {
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (value === '') {
                callback(new Error('请输入邮箱地址'));
            } else if (!emailReg.test(value)) {
                callback(new Error('请输入正确的邮箱格式'));
            } else {
                callback();
            }
        };

        return {
            loading: false,
            showCelebration: false,
            registerForm: {
                username: '',
                password: '',
                confirmPassword: '',
                realName: '',
                phone: '',
                email: '',
                userRole: null,
                agreeTerms: false
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
                ],
                realName: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' },
                    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
                ],
                phone: [
                    { required: true, validator: validatePhone, trigger: 'blur' }
                ],
                email: [
                    { required: true, validator: validateEmail, trigger: 'blur' }
                ],
                userRole: [
                    { required: true, message: '请选择用户角色', trigger: 'change' },
                    { type: 'number', message: '请选择有效的用户角色', trigger: 'change' }
                ]
            }
        }
    },
    methods: {
        async handleRegister() {
            // 检查是否同意条款
            if (!this.registerForm.agreeTerms) {
                this.$message.warning('请先阅读并同意用户协议');
                return;
            }

            // 表单验证
            this.$refs.registerForm.validate(async (valid) => {
                if (valid) {
                    this.loading = true;

                    try {
                        // 构造注册参数
                        const registerParams = {
                            username: this.registerForm.username,
                            password: this.registerForm.password,
                            realName: this.registerForm.realName,
                            phone: this.registerForm.phone,
                            email: this.registerForm.email,
                            userRole: this.registerForm.userRole
                        };

                        // 发送注册请求
                        const response = await request({
                            url: '/travel-portal/sysUser/register',
                            method: 'post',
                            data: registerParams
                        });

                        // 注册成功处理
                        // this.showCelebration = true;
                        // setTimeout(() => {
                        //     this.showCelebration = false;
                        // }, 3000);

                        this.$message.success(`注册成功！欢迎加入，${response.realName || '用户'}！🎉`);

                        // 延迟跳转到登录页面
                        setTimeout(() => {
                            router.push('/auth/loginPage');
                        }, 2000);

                    } catch (error) {
                        this.$message.error(error.message || '注册失败，请检查信息或网络状态');
                    } finally {
                        this.loading = false;
                    }
                } else {
                    this.$message.error('请检查输入信息是否符合要求');
                }
            });
        }
    }
}
</script>

<style scoped>
/* 主容器 */
.register-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    overflow: hidden;
    background-color: #ffffff;
}

/* 注册卡片 */
.register-card {
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

.register-card .el-card__body {
    padding: 0;
}

/* 左侧区域 */
.left-section {
    background-color: #ffffff;
    padding: 60px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 600px;
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

/* 右侧区域 */
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
.register-form {
    margin-top: 20px;
}

.register-form .el-form-item {
    margin-bottom: 20px;
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

/* 选择框样式 */
.custom-select {
    width: 100%;
}

.custom-select .el-input__inner {
    height: 50px;
    line-height: 50px;
    border-radius: 12px;
    border: 2px solid #e1e8ed;
    font-size: 14px;
    padding: 0 20px;
    transition: all 0.3s ease;
}

.custom-select .el-input__inner:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.terms-link {
    text-align: right;
}

.terms-text {
    color: #667eea;
    text-decoration: none;
    font-size: 13px;
    transition: color 0.3s ease;
}

.terms-text:hover {
    color: #5a67d8;
    text-decoration: underline;
}

/* 注册按钮 */
.register-btn {
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

.register-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.register-btn:active {
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

/* 登录链接 */
.login-section {
    text-align: center;
    margin-top: 0;
}

.login-link {
    font-size: 14px;
    color: #7f8c8d;
}

.login-btn {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
    transition: color 0.3s ease;
}

.login-btn:hover {
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

/* 庆祝效果 */
.celebration-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.celebration-text {
    font-size: 48px;
    font-weight: bold;
    color: #667eea;
    text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
    animation: celebrationBounce 2s ease-in-out;
}

@keyframes celebrationBounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-30px);
    }
    60% {
        transform: translateY(-15px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .register-container {
        padding: 10px;
    }

    .register-card {
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
.register-card {
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

/* 表单验证错误样式 */
.el-form-item.is-error .custom-input .el-input__inner,
.el-form-item.is-error .custom-select .el-input__inner {
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
</style>