<template>
    <div class="container">
        <div class="l-container" @click="goToHome">
            <img src="../../assets/logo/newlogo.png" alt="logo" class="logo-img">
            <span class="title">途遇纪旅游管理系统</span>
        </div>
        <div class="r-container">
            <el-dropdown>
                <span class="el-dropdown-link">
                    <img v-if="userInfo.avatar" :src="getFullAvatarUrl(userInfo.avatar)" class="avatar" @error="handleAvatarError" @load="handleAvatarLoad">
                    <div v-else class="default-avatar">
                        <i class="el-icon-user-solid"></i>
                    </div>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="goToProfile">个人信息</el-dropdown-item>
                    <el-dropdown-item @click.native="handleLogout">退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>

</template>

<script>
import request from '@/utils/request';

export default {
    name: 'travellersMainHeader',
    data() {
        return {
            userInfo: {
                id: '',
                name: '',
                avatar: '',
                status: 'online'
            }
        };
    },
    computed: {
        apiBase() {
            return 'http://localhost:8086/travelManagementSystem/travel-portal';
        },
        currentUserId() {
            try {
                const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } };
                const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || '';
                const info = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'));
                const idFromInfo = pickId(info);
                const idFromLS = localStorage.getItem('userId') || '';
                const idFromSession = sessionStorage.getItem('userId') || '';
                const idFromToken = this.decodeUserIdFromToken() || '';
                return String(idFromInfo || idFromLS || idFromSession || idFromToken || this.userInfo.id || '');
            } catch {
                return this.userInfo.id || '';
            }
        },
        authHeaders() {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            return token ? { Authorization: `Bearer ${token}` } : {};
        }
    },
    created() {
        this.initCurrentUserSkeleton();
        this.loadUserAvatar();
    },
    methods: {
        decodeUserIdFromToken() {
            const raw = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!raw) return '';
            try {
                const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
                const base64url = token.split('.')[1];
                if (!base64url) return '';
                const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
                const json = decodeURIComponent(escape(window.atob(base64)));
                const payload = JSON.parse(json);
                const candidateKeys = ['userId', 'user_id', 'uid', 'id', 'sub', 'subject'];
                let found = '';
                for (const key of candidateKeys) {
                    if (payload && payload[key] != null && payload[key] !== '') {
                        found = String(payload[key]);
                        break;
                    }
                }
                if (!found && payload && payload.user) {
                    const nested = payload.user;
                    for (const key of candidateKeys) {
                        if (nested && nested[key] != null && nested[key] !== '') {
                            found = String(nested[key]);
                            break;
                        }
                    }
                }
                return found || '';
            } catch (e) {
                return '';
            }
        },
        initCurrentUserSkeleton() {
            const userIdFromLS = localStorage.getItem('userId') || '';
            const userIdFromSession = sessionStorage.getItem('userId') || '';
            const userIdFromToken = this.decodeUserIdFromToken() || '';
            const userId = userIdFromLS || userIdFromSession || userIdFromToken;
            const username = localStorage.getItem('username') || '';
            if (userId) {
                if (!userIdFromLS) localStorage.setItem('userId', String(userId));
                if (!userIdFromSession) sessionStorage.setItem('userId', String(userId));
            }
            this.userInfo.id = userId;
            this.userInfo.name = username;
        },
        async loadUserAvatar() {
            try {
                console.log('开始获取用户头像信息，用户ID:', this.currentUserId);
                
                const response = await request.get(`${this.apiBase}/user/${this.currentUserId}/avatar`);
                console.log('获取用户头像信息响应:', response);
                
                const data = response.data || response;
                const avatarData = data.data || data.result || data;
                
                if (avatarData && avatarData.hasAvatar && avatarData.avatarUrl) {
                    console.log('用户有头像，URL:', avatarData.avatarUrl);
                    this.userInfo.avatar = avatarData.avatarUrl;
                    return avatarData.avatarUrl;
                } else {
                    console.log('用户无头像或头像URL为空');
                    return null;
                }
            } catch (error) {
                console.error('获取用户头像信息失败:', error);
                return null;
            }
        },
        getFullAvatarUrl(url) {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            console.log('原始头像URL:', url);
            
            let cleanUrl = url;
            cleanUrl = cleanUrl.replace(/\/+/g, '/');
            console.log('清理双斜杠后:', cleanUrl);
            
            if (cleanUrl.includes('/uploads/uploads/')) {
                cleanUrl = cleanUrl.replace('/uploads/uploads/', '/uploads/');
                console.log('检测到重复的uploads路径，已清理:', cleanUrl);
            }
            
            if (cleanUrl.includes('/files/uploads/')) {
                cleanUrl = cleanUrl.replace('/files/uploads/', '/uploads/');
                console.log('检测到错误的files路径，已清理:', cleanUrl);
            }
            
            if (cleanUrl.includes('/resources/uploads/')) {
                cleanUrl = cleanUrl.replace('/resources/uploads/', '/uploads/');
                console.log('检测到错误的resources路径，已清理:', cleanUrl);
            }
            
            if (!cleanUrl.startsWith('/')) {
                cleanUrl = '/' + cleanUrl;
            }
            
            const fullUrl = `http://localhost:8086/travelManagementSystem${cleanUrl}`;
            console.log('最终头像URL:', fullUrl);
            
            return fullUrl;
        },
        handleAvatarLoad(event) {
            console.log('头像加载成功:', event.target.src);
        },
        handleAvatarError(event) {
            console.error('头像加载失败:', event.target.src);
            console.log('当前头像URL:', this.userInfo.avatar);
            
            // 如果头像加载失败，尝试从本地存储获取
            const localUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const sessionUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            const fallbackAvatar = localUserInfo.avatar || sessionUserInfo.avatar;
            
            if (fallbackAvatar) {
                this.userInfo.avatar = fallbackAvatar;
                console.log('使用本地存储的头像:', fallbackAvatar);
            } else {
                console.log('无可用头像，使用默认头像');
                this.userInfo.avatar = '';
            }
        },
        goToProfile() {
            this.$router.push('/traveller/myInfo');
        },
        goToHome() {
            window.location.href = 'http://localhost:8081/travellers/home';
        },
        handleLogout() {
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定', 
                cancelButtonText: '取消', 
                type: 'warning'
            }).then(() => {
                // 清除本地存储
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('userInfo');
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('username');
                
                this.$message.success('退出登录成功');
                
                // 跳转到登录页面
                window.location.href = 'http://localhost:8081/auth/loginPage';
            }).catch(() => {
                // 用户取消退出
            });
        }
    }
}
</script>

<style scoped>
.title {
    text-align: left;
}

.title-small {
    font-size: 20px !important;
    font-weight: 400;
    font-family: "STXingKai", "KaiTi", sans-serif; /* 英文字体 */
    color: #748485;
    line-height: 1.4;
}

.container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: white;
    height: 60px;
    align-items: center; 
}

.container .l-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: opacity 0.3s ease;
    /* padding-left: 2px; */
}

.container .l-container:hover {
    opacity: 0.8;
}

.container .l-container .logo-img {
    width: 55px;    /* 宽度与右侧头像一致，视觉平衡 */
    height: 55px;   /* 高度与右侧头像一致 */
    object-fit: cover; /* 保持图片比例，避免拉伸变形 */
}

.container .l-container span {
    font-size: 20px;
    margin-left: 10px;
}

.container .r-container .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.container .r-container .default-avatar {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #f5f5f5;
    border: 2px dashed #d9d9d9;
    color: #999;
    font-size: 20px;
}

.container .r-container .el-dropdown-link {
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
}

.container .r-container {
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: flex-end;
    /* 水平方向靠右（同时保证头像在容器内居中） */
    /* 可选：设置容器高度，确保垂直居中生效（根据整体布局调整） */
    height: 60px;
    /* 例如与左侧标题栏高度一致 */
    padding-right: 16px;
    /* 靠右留出一点边距，避免贴边 */
}


/* 关键：调整下拉菜单的偏移量，使其与头像垂直居中 */
::v-deep .el-dropdown-menu {
    /* 向左偏移 50%，配合 transform 实现水平居中 */
    left: 50% !important;
    transform: translateX(-50%) !important;
    /* 取消默认的 left: 0 定位 */
    right: auto !important;
}

/* 可选：调整下拉菜单与头像的距离 */
::v-deep .el-dropdown-menu__wrap {
    margin-top: 10px !important;
    /* 增加一点顶部间距 */
}
</style>