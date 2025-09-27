<template>
    <div class="guide-matcher">
        <el-row :gutter="30" class="guide-content">
            <!-- 左侧：筛选条件 -->
            <el-col :span="24" :md="9" :lg="8">
                <el-card shadow="hover" class="filter-card">
                    <div slot="header">
                        <h3 class="card-title">导游筛选</h3>
                    </div>

                    <el-form ref="filterForm" :model="filterParams" label-width="100px" class="filter-form">
                        <el-form-item label="语言能力">
                            <el-select v-model="filterParams.language" placeholder="选择语言" clearable
                                class="form-control">
                                <el-option label="中文" value="中文"></el-option>
                                <el-option label="英文" value="英文"></el-option>
                                <el-option label="日文" value="日文"></el-option>
                                <el-option label="韩文" value="韩文"></el-option>
                                <el-option label="法文" value="法文"></el-option>
                                <el-option label="西班牙文" value="西班牙文"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="专长领域">
                            <el-select v-model="filterParams.specialty" placeholder="选择专长" clearable
                                class="form-control">
                                <el-option label="历史文化" value="历史文化"></el-option>
                                <el-option label="美食探索" value="美食探索"></el-option>
                                <el-option label="户外探险" value="户外探险"></el-option>
                                <el-option label="城市观光" value="城市观光"></el-option>
                                <el-option label="购物指导" value="购物指导"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="价格范围">
                            <el-slider v-model="filterParams.priceRange" :min="200" :max="1000" :step="50" range
                                show-stops class="price-slider"></el-slider>
                            <div class="price-range-text">
                                ¥{{ filterParams.priceRange[0] }} - ¥{{ filterParams.priceRange[1] }} / 天
                            </div>
                        </el-form-item>

                        <el-form-item label="最低评分">
                            <el-rate v-model="filterParams.minRating" :max="5" :disabled="false" :allow-half="true"
                                show-score text-color="#1890ff" class="rating-control"></el-rate>
                        </el-form-item>

                        <el-form-item class="form-actions">
                            <el-button type="primary" @click="handleFilter" :loading="loading" class="filter-btn">
                                <i class="el-icon-search"></i> 查找导游
                            </el-button>
                            <el-button type="default" @click="resetFilter" class="reset-btn">
                                重置
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>

            <!-- 右侧：导游列表 -->
            <el-col :span="24" :md="15" :lg="16">
                <el-card shadow="hover" class="guides-list-card">
                    <div slot="header" class="list-header">
                        <h3 class="card-title">推荐导游</h3>
                        <div class="list-controls">
                            <span class="guide-count">找到 {{ filteredGuides.length }} 位导游</span>
                            <el-select v-model="sortBy" placeholder="排序方式" size="small" class="sort-select"
                                @change="handleSortChange">
                                <el-option label="评分从高到低" value="ratingDesc"></el-option>
                                <el-option label="价格从低到高" value="priceAsc"></el-option>
                                <el-option label="评价数量从高到低" value="reviewsDesc"></el-option>
                            </el-select>
                        </div>
                    </div>

                    <div v-if="loading" class="loading-container">
                        <el-loading-spinner class="loading-spinner"></el-loading-spinner>
                        <p class="loading-text">正在为您筛选最佳导游...</p>
                    </div>

                    <div v-else-if="filteredGuides.length > 0" class="guides-list">
                        <el-row :gutter="20" :xs="1" :sm="2" :md="2">
                            <el-col v-for="guide in filteredGuides" :key="guide.id" :span="12">
                                <el-card class="guide-card" hover>
                                    <div class="guide-info">
                                        <img :src="guide.avatar" :alt="guide.name" class="guide-avatar">
                                        <div class="guide-details">
                                            <div class="guide-name-rating">
                                                <h4 class="guide-name">{{ guide.name }}</h4>
                                                <el-rate :value="guide.rating" :max="5" :disabled="true"
                                                    :show-score="true" score-template="{value}"
                                                    class="guide-rating"></el-rate>
                                            </div>

                                            <div class="guide-meta">
                                                <el-tag class="specialty-tag">{{ guide.specialty }}</el-tag>
                                                <span class="guide-reviews">
                                                    <i class="el-icon-comment"></i> {{ guide.reviews }} 条评价
                                                </span>
                                            </div>

                                            <div class="guide-languages">
                                                <span class="meta-label">语言:</span>
                                                <span class="languages">{{ guide.languages.join('、') }}</span>
                                            </div>

                                            <div class="guide-price">
                                                <span class="price">¥{{ guide.price }}</span>
                                                <span class="price-unit">/ 天</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="guide-actions">
                                        <el-button type="primary" size="small" @click="handleBook(guide.id)"
                                            class="book-btn">
                                            立即预订
                                        </el-button>
                                        <el-button type="text" size="small" @click="handleViewDetail(guide.id)"
                                            class="detail-btn">
                                            查看详情
                                        </el-button>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                    </div>

                    <div v-else class="empty-state">
                        <el-empty description="没有找到符合条件的导游，请尝试调整筛选条件" :image="elEmptyImage"></el-empty>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'GuideMatcher',
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        availableGuides: {
            type: Array,
            default: () => []
        },
        filterOptions: {
            type: Object,
            default: () => ({
                language: '',
                specialty: '',
                priceRange: [300, 800],
                minRating: 4.5
            })
        }
    },
    data() {
        return {
            filterParams: {
                language: this.filterOptions.language,
                specialty: this.filterOptions.specialty,
                priceRange: this.filterOptions.priceRange,
                minRating: this.filterOptions.minRating
            },
            sortBy: 'ratingDesc',
            elEmptyImage: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'
        }
    },
    computed: {
        filteredGuides() {
            // 基础筛选
            let result = [...this.availableGuides]

            // 按语言筛选
            if (this.filterParams.language) {
                result = result.filter(guide =>
                    guide.languages.includes(this.filterParams.language)
                )
            }

            // 按专长筛选
            if (this.filterParams.specialty) {
                result = result.filter(guide =>
                    guide.specialty === this.filterParams.specialty
                )
            }

            // 按价格范围筛选
            result = result.filter(guide =>
                guide.price >= this.filterParams.priceRange[0] &&
                guide.price <= this.filterParams.priceRange[1]
            )

            // 按最低评分筛选
            result = result.filter(guide =>
                guide.rating >= this.filterParams.minRating
            )

            // 排序
            return this.sortGuides(result)
        }
    },
    methods: {
        sortGuides(guides) {
            switch (this.sortBy) {
                case 'ratingDesc':
                    return [...guides].sort((a, b) => b.rating - a.rating)
                case 'priceAsc':
                    return [...guides].sort((a, b) => a.price - b.price)
                case 'reviewsDesc':
                    return [...guides].sort((a, b) => b.reviews - a.reviews)
                default:
                    return guides
            }
        },

        handleSortChange() {
            // 排序变化时会自动触发computed属性更新
        },

        handleFilter() {
            this.$emit('filter-guides', this.filterParams)
        },

        resetFilter() {
            this.filterParams = {
                language: '',
                specialty: '',
                priceRange: [300, 800],
                minRating: 4.5
            }
            this.$emit('filter-guides', this.filterParams)
        },

        handleBook(guideId) {
            this.$emit('book-guide', guideId)
        },

        handleViewDetail(guideId) {
            this.$message.info(`查看导游 ${guideId} 的详细信息`)
            // 可以在这里添加查看详情的逻辑
        }
    }
}
</script>

<style scoped>
.guide-matcher {
    width: 100%;
}

.guide-content {
    margin-top: 10px;
}

/* 卡片样式 */
.filter-card,
.guides-list-card {
    height: 700px;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
}

.filter-card:hover,
.guides-list-card:hover {
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

/* 筛选表单样式 */
.filter-form {
    padding: 20px 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.form-control {
    width: 100%;
}

.price-slider {
    margin-top: 10px;
}

.price-range-text {
    text-align: center;
    margin-top: 10px;
    color: #666;
    font-size: 14px;
    padding: 5px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.rating-control {
    margin-top: 5px;
}

.form-actions {
    display: flex;
    justify-content: center;
    margin-top: auto;
    padding: 20px 0 0 0;
    gap: 15px;
    border-top: 1px solid #f0f0f0;
}

.filter-btn,
.reset-btn {
    flex: 1;
    min-width: 100px;
    height: 40px;
    font-weight: 500;
    border-radius: 6px;
}

.filter-btn {
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.filter-btn:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.reset-btn {
    background: #f5f5f5;
    border: 1px solid #d9d9d9;
    color: #666;
}

.reset-btn:hover {
    background: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
}

/* 导游列表样式 */
.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.guide-count {
    color: #666;
    font-size: 14px;
}

.sort-select {
    width: 180px;
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

.guides-list {
    padding: 0;
    height: 100%;
    overflow-y: auto;
}

.guide-card {
    height: 320px;
    transition: all 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    margin-bottom: 20px;
}

.guide-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.guide-info {
    display: flex;
    padding: 20px;
    flex: 1;
    gap: 15px;
}

.guide-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f0f0f0;
    transition: transform 0.3s ease;
    flex-shrink: 0;
}

.guide-card:hover .guide-avatar {
    transform: scale(1.05);
}

.guide-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.guide-name-rating {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 10px;
}

.guide-name {
    margin: 0;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 500;
}

.guide-rating {
    font-size: 14px !important;
}

.guide-meta {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 24px;
}

.specialty-tag {
    background-color: #e6f7ff;
    color: #1890ff;
    border-color: #91d5ff;
}

.guide-reviews {
    color: #666;
    font-size: 13px;
    display: flex;
    align-items: center;
}

.guide-reviews i {
    margin-right: 3px;
    font-size: 12px;
}

.guide-languages {
    margin-bottom: 12px;
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    min-height: 20px;
}

.meta-label {
    color: #999;
    margin-right: 5px;
}

.languages {
    flex-wrap: wrap;
    display: inline-block;
}

.guide-price {
    margin-bottom: 12px;
    min-height: 24px;
    display: flex;
    align-items: center;
}

.price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
}

.price-unit {
    color: #999;
    font-size: 14px;
}

.guide-actions {
    display: flex;
    justify-content: space-between;
    padding: 15px 20px 20px 20px;
    border-top: 1px solid #f0f0f0;
    margin-top: auto;
    gap: 10px;
    background: #fafafa;
}

.book-btn {
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    border: none;
    flex: 1;
    height: 36px;
    font-weight: 500;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

.book-btn:hover {
    background: linear-gradient(135deg, #096dd9 0%, #1890ff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(24, 144, 255, 0.4);
}

.detail-btn {
    color: #1890ff;
    flex: 1;
    height: 36px;
    font-weight: 500;
    border-radius: 6px;
    background: #f0f9ff;
    border: 1px solid #bae7ff;
}

.detail-btn:hover {
    color: #096dd9;
    background: #e6f7ff;
    border-color: #91d5ff;
    transform: translateY(-1px);
}

.empty-state {
    padding: 60px 0;
}

::v-deep .el-card__header {
    padding: 15px 20px;
}

::v-deep .el-rate {
    display: inline-flex;
}

::v-deep .el-rate__text {
    margin-left: 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .list-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .list-controls {
        width: 100%;
        justify-content: space-between;
    }

    .sort-select {
        width: 140px;
    }

    .form-actions {
        flex-direction: column;
    }

    .loading-container,
    .empty-state {
        padding: 40px 0;
    }

    .guide-name-rating {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .guide-actions {
        flex-direction: column;
        gap: 8px;
    }

    .book-btn,
    .detail-btn {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .guide-info {
        flex-direction: column;
        text-align: center;
    }

    .guide-avatar {
        margin: 0 auto 10px;
    }

    .guide-details {
        text-align: left;
    }
}
</style>