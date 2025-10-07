<template>
    <div class="package-detail">
        <el-row :gutter="20" class="card-row">
            <el-col :span="8" v-for="(item, index) in packageData" :key="item && (item.productId || item.id) || index" :index="index">
                <div class="card-fixed-container" style="margin-bottom:20px">
                    <el-card class="box-card">
                        <div class="pic">
                            <img src="../../../assets/logo/test.png" alt="">
                        </div>
                        <div class="content">
                            <span class="title">{{ item.productName }}</span>
                            <div class="price-row">
                                <span class="price">{{ formatPrice(item.price) }}</span>
                                <span class="sales-info">已售出{{ item.soldCount }}件</span>
                            </div>
                        </div>
                        <div class="button">
                            <el-button type="primary" round @click="handleViewDetail(item.productId)">查看详情</el-button>
                        </div>
                    </el-card>
                </div>
            </el-col>
        </el-row>
        <!-- 空状态：当没有数据时显示 -->
        <div v-if="packageData.length === 0 && !showSkeleton" class="empty-state">
            <el-empty description="暂无旅游产品数据"></el-empty>
        </div>
        <div v-if="showSkeleton" class="skeleton-overlay">
            <div class="skeleton-inner">
                <el-skeleton :rows="6" animated />
            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/request';
import router from '@/router';
export default {
    name: 'packageDetail',
    data() {
        return {
            packageData: [],
            showSkeleton: false,
        }
    },
    created() {
        // 页面创建时检查登录状态并加载数据
        this.checkLoginStatus();
    },
    methods: {
        checkLoginStatus() {
            // 检查登录状态
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                // 未登录，跳转到登录页面
                this.$message.warning('请先登录');
                router.push({
                    path: 'auth/loginPage',
                    query: { redirect: router.currentRoute.value.fullPath }
                });
                return false;
            } else {
                // 已登录，加载数据
                this.loadPackageData();
                return true;
            }
        },
        toMyOrder() {
            this.$router.push('/traveller/order');
        },
        handleViewDetail(productId) {
            this.showSkeleton = true;
            setTimeout(() => {
                this.$router.push({
                    path: '/traveller/order',
                    query: { productId: productId }
                });
                this.showSkeleton = false;
            }, 800);
        },
        async loadPackageData() {
            this.showSkeleton = true;
            try {
                const data = await request({
                    url: '/travel-portal/tourProduct/getAllProducts',
                    method: 'get',
                });
                // 处理响应数据（兼容后端 {code, message, data} 或直接数组）
                let list = [];
                if (data && data.data) {
                    const body = data.data;
                    list = body && (body.data || body.result || body);
                } else {
                    list = data;
                }
                this.packageData = Array.isArray(list) ? list.filter(Boolean) : [];
                this.$message.success('套餐数据加载成功')
            } catch (error) {
                this.$message.error(error.message || '产品数据加载失败');
                console.error('加载产品数据出错:', error);
            } finally {
                this.showSkeleton = false;
            }
        },
        formatPrice(price) {
            if (!price) return '0.00';
            // 处理数字或字符串类型的价格
            return Number(price).toFixed(2);
        }
    }
}
</script>
<style scoped>
.card-fixed-container {
    width: 100%;
    height: 350px;
    min-height: 350px;
    /* 确保最小高度固定 */
}

.box-card {
    padding: 15px;
    height: 100%;
    width: 100%;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow: hidden;
    box-sizing: border-box;
    padding-bottom: 15px;
    min-height: 350px;
    border-radius: 20px;
    /* 确保卡片最小高度固定 */
}

.pic {
    width: 100%;
    height: 160px;
    overflow: hidden;
    border-radius: 8px;
    flex-shrink: 0;
    /* 防止图片区域被压缩 */
}

.pic img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    /* 添加过渡效果 */
}

.pic:hover img {
    transform: scale(1.05);
}

.content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-grow: 1;
    min-height: 60px;
    /* 确保内容区域有最小高度 */
    margin-top: 15px;
    /* 增加内容区域与图片的距离 */
}

.title {
    font-size: 17px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    margin-top: 0;
    /* 移除额外的上边距 */
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
}

.price {
    font-size: 25px;
    color: #f56c6c;
    font-weight: bold;
    line-height: 1.2;
}

.sales-info {
    font-size: 12px;
    color: #999;
    font-weight: 400;
    margin-left: 10px;
}

.button {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: auto;
    /* 将按钮推到底部 */
    padding-top: 10px;
}

.button ::v-deep .el-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.button ::v-deep .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.package-detail {
    display: flex;
    justify-content: space-evenly;
    padding: 0 20px 20px 20px;
    /* 上边距设为0，其他边距保持20px */
    margin-top: 0;
    /* 明确设置上边距为0 */
    position: relative;
    /* 让骨架层限制在内容区域内 */
}

.card-row {
    align-items: flex-start;
}

.skeleton-overlay {
    position: absolute;
    /* 仅覆盖内容区域 */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.skeleton-inner {
    width: 680px;
    max-width: 90vw;
}
</style>