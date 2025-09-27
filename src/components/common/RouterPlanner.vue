<template>
    <div class="route-planner">
        <!-- 热门目的地推荐 -->
        <div class="popular-destinations">
            <h3 class="section-subtitle">热门目的地</h3>
            <el-carousel :interval="5000" type="card" height="180px" indicator-position="none"
                class="destinations-carousel">
                <el-carousel-item v-for="dest in popularDestinations" :key="dest.id">
                    <div class="destination-item" @click="selectDestination(dest.name)">
                        <img :src="dest.image" :alt="dest.name" class="dest-image">
                        <div class="dest-info">
                            <h4 class="dest-name">{{ dest.name }}</h4>
                            <div class="dest-rating">
                                <i class="el-icon-star-on"></i>
                                <span>{{ dest.rating }}</span>
                            </div>
                        </div>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </div>

        <el-row :gutter="30" class="route-content">
            <!-- 左侧：路线设置 -->
            <el-col :span="24" :md="9" :lg="8">
                <el-card shadow="hover" class="route-form-card">
                    <div slot="header">
                        <h3 class="card-title">路线设置</h3>
                    </div>

                    <el-form ref="routeForm" :model="routeParams" label-width="100px" class="route-form">
                        <el-form-item label="目的地">
                            <el-select v-model="routeParams.destination" placeholder="请选择目的地" clearable
                                class="form-control">
                                <el-option v-for="dest in popularDestinations" :key="dest.id" :label="dest.name"
                                    :value="dest.name"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="旅行天数">
                            <el-slider v-model="routeParams.duration" :min="1" :max="15" :step="1" show-input
                                class="form-control"></el-slider>
                        </el-form-item>

                        <el-form-item label="预算范围">
                            <el-radio-group v-model="routeParams.budget" class="budget-options">
                                <el-radio-button label="economic">经济型</el-radio-button>
                                <el-radio-button label="medium">舒适型</el-radio-button>
                                <el-radio-button label="luxury">豪华型</el-radio-button>
                            </el-radio-group>
                        </el-form-item>

                        <el-form-item label="兴趣偏好">
                            <el-checkbox-group v-model="routeParams.interests" class="interests-group">
                                <el-checkbox label="culture" class="interest-item">文化古迹</el-checkbox>
                                <el-checkbox label="nature" class="interest-item">自然风光</el-checkbox>
                                <el-checkbox label="food" class="interest-item">美食体验</el-checkbox>
                                <el-checkbox label="shopping" class="interest-item">购物血拼</el-checkbox>
                                <el-checkbox label="adventure" class="interest-item">冒险活动</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-form-item label="住宿类型">
                            <el-select v-model="routeParams.accommodation" placeholder="请选择住宿类型" class="form-control">
                                <el-option label="酒店" value="hotel"></el-option>
                                <el-option label="民宿" value="homestay"></el-option>
                                <el-option label="公寓" value="apartment"></el-option>
                                <el-option label="青旅" value="hostel"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item class="form-actions">
                            <el-button type="primary" @click="handleGenerate" :loading="loading" class="generate-btn">
                                <i class="el-icon-map-location"></i> 生成路线
                            </el-button>
                            <el-button type="success" @click="handleSave" :disabled="!routeGenerated" class="save-btn">
                                <i class="el-icon-save"></i> 保存路线
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>

            <!-- 右侧：路线预览 -->
            <el-col :span="24" :md="15" :lg="16">
                <el-card shadow="hover" class="route-preview-card">
                    <div slot="header" class="preview-header">
                        <h3 class="card-title">路线预览</h3>
                        <el-tag v-if="routeGenerated" type="success" class="generated-tag">可保存</el-tag>
                    </div>

                    <div v-if="loading" class="loading-container">
                        <el-loading-spinner class="loading-spinner"></el-loading-spinner>
                        <p class="loading-text">正在为您规划最佳路线...</p>
                    </div>

                    <div v-else-if="routeGenerated" class="route-preview">
                        <div class="route-header">
                            <h4 class="route-title">{{ routeParams.destination }} {{ routeParams.duration }}日游</h4>
                            <p class="route-meta">预算: {{ getBudgetText }} | 特色: {{ getInterestsText }}</p>
                        </div>

                        <el-timeline class="route-timeline">
                            <el-timeline-item v-for="(day, index) in routeParams.duration" :key="index"
                                :timestamp="`第${index + 1}天`" placement="top">
                                <el-card class="day-card">
                                    <div class="day-plan">
                                        <div class="plan-item">
                                            <span class="time-label">上午</span>
                                            <p>参观当地著名景点，了解文化历史</p>
                                        </div>
                                        <div class="plan-item">
                                            <span class="time-label">中午</span>
                                            <p>品尝当地特色美食</p>
                                        </div>
                                        <div class="plan-item">
                                            <span class="time-label">下午</span>
                                            <p>探索城市地标和自然风光</p>
                                        </div>
                                        <div class="plan-item">
                                            <span class="time-label">晚上</span>
                                            <p>体验当地夜生活或自由活动</p>
                                        </div>
                                    </div>
                                </el-card>
                            </el-timeline-item>
                        </el-timeline>
                    </div>

                    <div v-else class="empty-state">
                        <el-empty description="请设置您的旅行偏好并生成路线" :image="elEmptyImage"></el-empty>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'RoutePlanner',
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        popularDestinations: {
            type: Array,
            default: () => []
        },
        routeOptions: {
            type: Object,
            default: () => ({
                duration: 3,
                budget: 'medium',
                interests: ['culture', 'food'],
                accommodation: 'hotel'
            })
        }
    },
    data() {
        return {
            routeParams: {
                destination: '',
                duration: this.routeOptions.duration,
                budget: this.routeOptions.budget,
                interests: this.routeOptions.interests,
                accommodation: this.routeOptions.accommodation
            },
            routeGenerated: false,
            elEmptyImage: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        }
    },
    computed: {
        getBudgetText() {
            const budgetMap = {
                economic: '经济型 (¥500以下/天)',
                medium: '舒适型 (¥500-1500/天)',
                luxury: '豪华型 (¥1500以上/天)'
            }
            return budgetMap[this.routeParams.budget] || '未设置'
        },
        getInterestsText() {
            if (!this.routeParams.interests.length) return '未设置'

            const interestMap = {
                culture: '文化古迹',
                nature: '自然风光',
                food: '美食体验',
                shopping: '购物血拼',
                adventure: '冒险活动'
            }

            return this.routeParams.interests.map(interest => interestMap[interest]).join('、')
        }
    },
    methods: {
        selectDestination(destName) {
            this.routeParams.destination = destName;
        },

        handleGenerate() {
            if (!this.routeParams.destination) {
                this.$message.warning('请选择目的地')
                return
            }

            if (!this.routeParams.interests.length) {
                this.$message.warning('请至少选择一个兴趣偏好')
                return
            }

            this.$emit('generate-route', this.routeParams)
            // 生成路线后设置标志
            setTimeout(() => {
                this.routeGenerated = true
            }, 1500)
        },

        handleSave() {
            this.$emit('save-route', {
                ...this.routeParams,
                createdAt: new Date()
            })
        }
    }
}
</script>

<style scoped>
.route-planner {
    width: 100%;
}

/* 热门目的地样式 */
.popular-destinations {
    margin-bottom: 30px;
}

.section-subtitle {
    font-size: 18px;
    color: #2c3e50;
    margin: 0 0 15px 0;
    display: flex;
    align-items: center;
}

.section-subtitle:before {
    content: '';
    width: 4px;
    height: 18px;
    background-color: #1890ff;
    margin-right: 8px;
    border-radius: 2px;
}

.destinations-carousel {
    width: 100%;
}

.destination-item {
    height: 180px;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.destination-item:hover {
    transform: translateY(-5px);
}

.dest-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.destination-item:hover .dest-image {
    transform: scale(1.05);
}

.dest-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
}

.dest-name {
    margin: 0 0 5px 0;
    font-size: 16px;
}

.dest-rating {
    display: flex;
    align-items: center;
    font-size: 14px;
}

.dest-rating i {
    color: #ffd700;
    margin-right: 5px;
}

/* 路线内容布局 */
.route-content {
    margin-top: 10px;
}

/* 卡片样式 */
.route-form-card,
.route-preview-card {
    height: 700px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
}

.route-form-card:hover,
.route-preview-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-title {
    font-size: 18px;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    font-weight: 600;
    padding: 8px 0;
}

.card-title:before {
    content: '';
    width: 4px;
    height: 18px;
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    margin-right: 12px;
    border-radius: 2px;
}

/* 表单样式 */
.route-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 10px 10px 0;
    /* 上下左右留白 */
    height: 100%;
    gap: 18px;
    /* 表单项之间留出空隙 */
}

.form-control {
    width: 100%;
}

.budget-options {
    width: 100%;
    display: flex;
}

.budget-options ::v-deep .el-radio-button {
    flex: 1;
    text-align: center;
}

.interests-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.interest-item {
    margin-bottom: 5px;
}

.form-actions {
    display: flex;
    justify-content: center;
    /* 按钮居中 */
    align-items: center;
    margin-top: auto;
    /* 推到底部 */
    padding: 15px 0 10px 0;
    gap: 20px;
    /* 按钮之间间距 */
    border-top: 1px solid #f0f0f0;
}


.generate-btn,
.save-btn {
    flex: none;
    min-width: 140px;
    /* 稍微加宽按钮 */
    height: 42px;
    font-weight: 500;
    border-radius: 8px;
}

.generate-btn {
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.generate-btn:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.save-btn {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.save-btn:hover {
    background: linear-gradient(135deg, #389e0d 0%, #52c41a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}

/* 预览区域样式 */
.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.generated-tag {
    margin-top: 5px;
}

.loading-container {
    text-align: center;
    padding: 60px 0;
}

.loading-spinner {
    font-size: 36px;
}

.loading-text {
    margin-top: 20px;
    color: #666;
    font-size: 16px;
}

.route-preview {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.route-header {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.route-title {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 18px;
    font-weight: 500;
}

.route-meta {
    margin: 0;
    color: #7f8c8d;
    font-size: 14px;
}

.route-timeline {
    margin-left: 10px;
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
}

.day-card {
    border-radius: 6px;
    border-left: 3px solid #1890ff;
    transition: all 0.3s ease;
}

.day-card:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.day-plan {
    padding: 10px 0;
}

.plan-item {
    margin-bottom: 18px;
    padding-left: 15px;
    position: relative;
}

.plan-item:last-child {
    margin-bottom: 0;
}

.plan-item:before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #1890ff;
}

.time-label {
    display: inline-block;
    width: 70px;
    color: #1890ff;
    font-weight: 500;
    font-size: 14px;
}

.plan-item p {
    display: inline;
    margin: 0;
    color: #333;
    font-size: 14px;
}

.empty-state {
    padding: 60px 0;
}

::v-deep .el-timeline-item__timestamp {
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;
}

::v-deep .el-timeline-item__node {
    background-color: #1890ff;
    width: 12px;
    height: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .section-subtitle {
        font-size: 16px;
    }

    .form-actions {
        flex-direction: column;
        gap: 10px;
    }

    .generate-btn,
    .save-btn {
        width: 100%;
    }

    .route-title {
        font-size: 16px;
    }

    .loading-container {
        padding: 40px 0;
    }

    .empty-state {
        padding: 40px 0;
    }
}
</style>