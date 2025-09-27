<template>
    <el-row>
        <el-col :span="24" v-if="singlePackage">
            <el-card class="box-card" v-loading.fullscreen.lock="fullscreenLoading">
                <div class="grid-content bg-purple-dark">
                    <div class="title-row">
                        <div class="title">{{ singlePackage.productName }}</div>
                        <div class="button-buy">
                            <el-button type="primary" round @click="openFullScreenAndBuy">立即购买</el-button>
                        </div>
                    </div>
                    <div class="discriptions">
                        {{ singlePackage.description }}
                        <br />
                        <div class="span-container" v-for="(tag, index) in splitProductTags" :key="index">
                            <span class="span1">{{ tag }}</span>
                        </div>
                        <div class="price-row">
                            <div class="price">
                                <span class="price-symbol">￥</span>
                                <span class="price-text">{{ formatPrice(singlePackage.price) }}</span>
                            </div>
                            <div class="salesDesc">
                                已售出{{ singlePackage.soldCount }}件
                            </div>
                        </div>
                    </div>
                </div>
                <el-row :gutter="20" class="image-row">
                    <el-col :span="6" v-for="(img, index) in productImages" :key="index">
                        <div class="image-container">
                            <img 
                                :src="img" 
                                :alt="`景点图片${index + 1}`" 
                                @error="handleImageError($event, index)"
                                @load="handleImageLoad($event, index)"
                                class="product-image"
                            />
                        </div>
                    </el-col>
                </el-row>
                <div class="sales-details">
                    <span class="service-guarantee">服务保障:</span>
                    <span class="service-guarantee-content" v-for="(guarantees, index) in splitserviceGuarantees"
                        :key="index">
                        <i class="el-icon-circle-check"></i>
                        <span class="service-guarantee-content-text">{{ guarantees }}</span>
                    </span>
                </div>
                <div class="sales-details">
                    <span class="service-guarantee">供应商:</span>
                    <span class="service-guarantee-content">
                        <span class="service-guarantee-content-text">{{ singlePackage.supplier }}</span>
                    </span>
                </div>
                <div class="sales-details product-features">
                    <span class="service-guarantee">产品卖点:</span>
                    <div class="service-guarantee-content product-features-content">
                        <p class="service-guarantee-content-text product-features-text">★ 💎〖多重选择〗
                            {{ singlePackage.productSellingPoints }}
                        </p>
                    </div>
                </div>
            </el-card>
            <el-card class="box-card1" style="margin-top: 20px;">
                <div class="order-details">
                    <el-tabs v-model="activeName" @tab-click="handleClick">
                        <el-tab-pane label="产品特色" name="first">
                            <div>
                                <el-row :gutter="20">
                                    <el-col :span="16">
                                        <div class="grid-content bg-purple">
                                            <p>{{ singlePackage.description }}</p>
                                        </div>
                                    </el-col>
                                    <el-col :span="8">
                                        <div class="grid-content bg-purple">
                                            <img :src="singlePackage.mainImgUrl || '@/assets/logo/logo1.jpg'" alt="" class="picDesc">
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="每日行程" name="second">
                            <div class="block">
                                <div v-if="groupedItineraries.length > 0">
                                    <div v-for="dayGroup in groupedItineraries" :key="dayGroup.day" class="day-group">
                                        <div class="day-header">
                                            <h3 class="day-title">第{{ dayGroup.day }}天</h3>
                                            <div class="day-summary">{{ dayGroup.itineraries.length }}个安排</div>
                                        </div>
                                        
                                        <el-timeline class="day-timeline">
                                            <el-timeline-item 
                                                v-for="(itinerary, timeIndex) in dayGroup.itineraries" 
                                                :key="itinerary.itineraryId"
                                                :timestamp="getTimeTag(itinerary, timeIndex)" 
                                                placement="top">
                                                <el-card class="itinerary-card">
                                                    <div class="itinerary-header">
                                                        <!-- <el-tag class="time-tag" :type="getTimeTagType(itinerary.timePeriod)">
                                                            {{ getTimeTag(itinerary, timeIndex) }}
                                                        </el-tag> -->
                                                        <h4 class="itinerary-title">{{ itinerary.title }}</h4>
                                                    </div>
                                                    <p class="itinerary-description">{{ itinerary.description }}</p>
                                                    <div class="itinerary-details">
                                                        <div v-if="itinerary.meals" class="itinerary-detail">
                                                            <i class="el-icon-food"></i>
                                                            <strong>餐饮安排：</strong>{{ itinerary.meals }}
                                                        </div>
                                                        <div v-if="itinerary.traffic" class="itinerary-detail">
                                                            <i class="el-icon-truck"></i>
                                                            <strong>交通方式：</strong>{{ itinerary.traffic }}
                                                        </div>
                                                        <div v-if="itinerary.accommodation" class="itinerary-detail">
                                                            <i class="el-icon-house"></i>
                                                            <strong>住宿安排：</strong>{{ itinerary.accommodation }}
                                                        </div>
                                                    </div>
                                                </el-card>
                                            </el-timeline-item>
                                        </el-timeline>
                                    </div>
                                </div>
                                <div v-else class="empty-state">
                                    <el-empty description="暂无行程安排"></el-empty>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="费用说明" name="third">
                            <h3 class="fee-title">费用说明</h3>
                            <div v-if="costExplanation">
                                <div class="cost-section">
                                    <h4>费用包含</h4>
                                    <div class="cost-content" v-html="formatCostContent(costExplanation.includeItems)"></div>
                                </div>
                                <div class="cost-section">
                                    <h4>费用不含</h4>
                                    <div class="cost-content" v-html="formatCostContent(costExplanation.excludeItems)"></div>
                                </div>
                                <div class="cost-section">
                                    <h4>退改政策</h4>
                                    <div class="cost-content" v-html="formatCostContent(costExplanation.refundPolicy)"></div>
                                </div>
                            </div>
                            <div v-else class="empty-state">
                                <el-empty description="暂无费用说明"></el-empty>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="预订须知" name="fourth">
                            <div class="booking-notice-container" v-if="bookingNotice">
                                <h2 class="title">预订须知</h2>
                                <div class="notice-content">
                                    <div class="notice-section">
                                        <h3 class="section-title">预订条件</h3>
                                        <div class="notice-content-text" v-html="formatNoticeContent(bookingNotice.bookingConditions)"></div>
                                    </div>
                                    <div class="notice-section">
                                        <h3 class="section-title">有效期</h3>
                                        <div class="notice-content-text">{{ bookingNotice.validityPeriod }}</div>
                                    </div>
                                    <div class="notice-section" v-if="bookingNotice.notes">
                                        <h3 class="section-title">其他注意事项</h3>
                                        <div class="notice-content-text" v-html="formatNoticeContent(bookingNotice.notes)"></div>
                                    </div>
                                    </div>
                                </div>
                            <div v-else class="empty-state">
                                <el-empty description="暂无预订须知"></el-empty>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="点评" name="fifth">
                            <div class="tourist-review">
                                <!-- 左侧标签 -->
                                <div class="review-tag">
                                    <div class="tag-content">游客评价</div>
                                </div>
                                <!-- 右侧内容 -->
                                <div class="review-content">
                                    <!-- 整体满意度 -->
                                    <div class="overall-satisfaction">
                                        <div class="satisfaction-percentage">
                                            <span class="percentage">{{ evaluationSummary.satisfactionRate }}%</span>
                                            <span class="review-count">基于{{ evaluationSummary.totalReviews }}条游客评价</span>
                                        </div>
                                        <!-- 满意度分布 -->
                                        <div class="satisfaction-distribution">
                                            <div class="distribution-item" v-for="item in evaluationSummary.distributionItems"
                                                :key="item.type">
                                                <span class="item-label">{{ item.label }} ({{ item.count }})</span>
                                                <el-progress :percentage="item.percentage"
                                                    :color="getProgressColor(item.type)"
                                                    :show-text="false"></el-progress>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- 分项评分 -->
                                    <div class="item-scores">
                                        <div class="score-item" v-for="item in evaluationSummary.scoreItems" :key="item.type">
                                            <span class="item-type">{{ item.type }}</span>
                                            <span class="item-score">{{ item.score }}/5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="reviews-container">
                                <div class="reviews-header">
                                    <h3 class="reviews-title">
                                        <i class="el-icon-star-on"></i>
                                        用户评价
                                    </h3>
                                    <div class="reviews-summary">
                                        <span class="summary-text">共{{ evaluationSummary.totalReviews }}条评价</span>
                                                    </div>
                                                </div>
                                
                                <div class="reviews-list">
                                    <div class="review-item" v-for="review in productEvaluations" :key="review.evalId" >
                                        <div class="review-header">
                                            <div class="user-profile">
                                                <div class="avatar-container">
                                                    <img :src="review.userAvatar" alt="用户头像" class="user-avatar">
                                                    <div class="avatar-badge">
                                                        <i class="el-icon-check"></i>
                                                </div>
                                                </div>
                                                <div class="user-details">
                                                    <div class="user-name">{{ review.userName }}</div>
                                                    <div class="user-type-badge">{{ review.userType }}</div>
                                                </div>
                                                </div>
                                            <div class="review-meta">
                                                <div class="review-date">{{ formatDate(review.evalTime) }}</div>
                                                <div class="review-source">{{ review.source }}</div>
                                            </div>
                                        </div>
                                        
                                        <div class="review-ratings">
                                            <div class="rating-item">
                                                <span class="rating-label">总体评价</span>
                                                <el-rate v-model="review.overallScore" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                                                    </div>
                                            <div class="rating-item" v-if="review.serviceScore">
                                                <span class="rating-label">导游服务</span>
                                                <el-rate v-model="review.serviceScore" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                                                </div>
                                            <div class="rating-item" v-if="review.environmentScore">
                                                <span class="rating-label">行程安排</span>
                                                <el-rate v-model="review.environmentScore" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                                                </div>
                                            <div class="rating-item" v-if="review.costEffScore">
                                                <span class="rating-label">餐饮住宿</span>
                                                <el-rate v-model="review.costEffScore" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                                                </div>
                                        </div>
                                        
                                        <div class="review-text" v-if="review.content">
                                            <div class="review-summary">
                                                <i class="el-icon-quote-left quote-icon"></i>
                                                <span class="summary-content">{{ review.content }}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="review-gallery" v-if="review.imgUrls">
                                            <div class="gallery-header">
                                                <span class="gallery-title">旅行照片</span>
                                                <span class="gallery-count">{{ getImageCount(review.imgUrls) }}张</span>
                                            </div>
                                            <el-carousel :interval="4000" type="card" height="180px" indicator-position="outside">
                                                <el-carousel-item v-for="(img, imgIndex) in getImageList(review.imgUrls)" :key="imgIndex">
                                                    <div class="gallery-item">
                                                        <img :src="img" alt="旅行图片" class="gallery-img">
                                                        <div class="gallery-overlay">
                                                            <i class="el-icon-zoom-in"></i>
                                                        </div>
                                                    </div>
                                                        </el-carousel-item>
                                                    </el-carousel>
                                                </div>
                                        
                                                <div class="review-footer">
                                            <div class="review-actions">
                                                <el-button type="text" class="action-btn">
                                                    <i class="el-icon-thumb"></i>
                                                    有用 ({{ review.usefulCount || 0 }})
                                                </el-button>
                                                <el-button type="text" class="action-btn" v-if="review.replyContent">
                                                    <i class="el-icon-chat-dot-round"></i>
                                                    回复
                                                </el-button>
                                                </div>
                                            <div class="coupon-reward">
                                                <el-button type="primary" class="coupon-btn">
                                                    <i class="el-icon-present"></i>
                                                    点评赠送抵用券 ¥20
                                                </el-button>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                
                                <div v-if="productEvaluations.length === 0" class="empty-state">
                                    <el-empty description="暂无用户评价"></el-empty>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
import request from '@/utils/request';

export default {
    name: 'ProductDetail',
    data() {
        return {
            activeName: 'second',
            fullscreenLoading: false,
            singlePackage: null,
            dailyItineraries: [],
            costExplanation: null,
            bookingNotice: null,
            evaluationSummary: {
                satisfactionRate: 0,
                totalReviews: 0,
                distributionItems: [],
                scoreItems: []
            },
            productEvaluations: [],
            // 默认图片
            defaultImages: [
                require('@/assets/images/travel.jpg'),
                require('@/assets/images/travel2.jpg'),
                require('@/assets/images/travel3.jpg'),
                require('@/assets/images/travel4.jpg')
            ]
        };
    },
    created() {
        this.loadSinglePackageData();
    },
    methods: {
        handleClick(tab, event) {
            console.log(tab, event);
        },
        
        // 处理图片加载错误
        handleImageError(event, index) {
            console.log(`图片 ${index + 1} 加载失败，使用默认图片`);
            event.target.src = this.defaultImages[index % this.defaultImages.length];
        },
        
        // 处理图片加载成功
        handleImageLoad(event, index) {
            console.log(`图片 ${index + 1} 加载成功`);
        },
        
        openFullScreenAndBuy() {
            this.fullscreenLoading = true;
            setTimeout(() => {
                this.$router.push('/purchasePages');
                this.fullscreenLoading = false;
            }, 800);
        },

        // 根据满意度类型获取进度条颜色
        getProgressColor(type) {
            if (type === 'satisfied') {
                return '#f56c6c';
            } else if (type === 'moderate') {
                return '#e6a23c';
            } else {
                return '#67c23a';
            }
        },

        // 获取时间标签
        getTimeTag(itinerary, index) {
            // 如果数据库中有时间字段，优先使用数据库的值
            if (itinerary && itinerary.timePeriod) {
                return itinerary.timePeriod;
            }
            // 否则使用默认的时间标签
            const tags = ['早上', '中午', '下午', '晚上'];
            return tags[index % tags.length];
        },

        // 获取时间标签类型（用于颜色区分）
        getTimeTagType(timePeriod) {
            const typeMap = {
                '早上': 'success',
                '中午': 'warning', 
                '下午': 'primary',
                '晚上': 'info',
                '全天': 'danger'
            };
            return typeMap[timePeriod] || 'default';
        },

        // 格式化费用内容
        formatCostContent(content) {
            if (!content) return '';
            return content.replace(/\n/g, '<br>');
        },

        // 格式化通知内容
        formatNoticeContent(content) {
            if (!content) return '';
            return content.replace(/\n/g, '<br>');
        },

        // 格式化日期
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN');
        },

        // 获取图片数量
        getImageCount(imgUrls) {
            if (!imgUrls) return 0;
            return imgUrls.split(',').length;
        },

        // 获取图片列表
        getImageList(imgUrls) {
            if (!imgUrls) return [];
            return imgUrls.split(',').map(url => url.trim());
        },

        // 加载产品详情
        async loadSinglePackageData() {
            const productId = this.$route.query.productId;
            if (!productId) {
                this.$message.error('无效的套餐ID！');
                return;
            }
            this.fullscreenLoading = true;
            try {
                const response = await request({
                    url: `/travel-portal/tourProduct/getProductDetail/${productId}`,
                    method: 'get',
                });
                
                if (response && response.data) {
                    this.singlePackage = response.data;
                } else {
                    this.singlePackage = response;
                }
                
                // 加载产品评价汇总信息
                await this.loadProductEvaluationSummary(productId);
                
                // 加载产品评价列表
                await this.loadProductEvaluations(productId);
                
                // 加载产品每日行程
                await this.loadProductDailyItineraries(productId);
                
                // 加载产品费用说明
                await this.loadProductCostExplanation(productId);
                
                // 加载产品预订须知
                await this.loadProductBookingNotice(productId);
                
                this.$message.success('套餐详情加载成功！');
            } catch (error) {
                this.$message.error(error.message || '套餐详情加载失败！');
                console.error('套餐详情加载失败:', error);
            } finally {
                this.fullscreenLoading = false;
            }
        },

        // 加载产品评价汇总信息
        async loadProductEvaluationSummary(productId) {
            try {
                const response = await request({
                    url: `/travel-portal/productEvaluation/summary/${productId}`,
                    method: 'get',
                });
                
                if (response && response.data) {
                    this.evaluationSummary = response.data;
                } else {
                    this.evaluationSummary = response;
                }
            } catch (error) {
                console.error('加载产品评价汇总失败:', error);
                // 设置默认值
                this.evaluationSummary = {
                    satisfactionRate: 96.5,
                    totalReviews: 620,
                    distributionItems: [
                        { type: 'satisfied', label: '很满意', count: 530, percentage: 85.5 },
                        { type: 'moderate', label: '还不错', count: 60, percentage: 9.7 },
                        { type: 'dissatisfied', label: '不满意', count: 30, percentage: 4.8 },
                    ],
                    scoreItems: [
                        { type: '导游服务', score: 4.7 },
                        { type: '行程规划', score: 4.6 },
                        { type: '住宿体验', score: 4.5 },
                        { type: '交通出行', score: 4.9 },
                    ]
                };
            }
        },

        // 加载产品评价列表
        async loadProductEvaluations(productId) {
            try {
                const response = await request({
                    url: `/travel-portal/productEvaluation/list/${productId}`,
                    method: 'get',
                    params: {
                        page: 1,
                        size: 10
                    }
                });
                
                if (response && response.data) {
                    this.productEvaluations = response.data;
                } else {
                    this.productEvaluations = response || [];
                }
            } catch (error) {
                console.error('加载产品评价列表失败:', error);
                this.productEvaluations = [];
            }
        },

        // 加载产品每日行程
        async loadProductDailyItineraries(productId) {
            try {
                const response = await request({
                    url: `/travel-portal/productDailyItinerary/list/${productId}`,
                    method: 'get',
                });
                
                if (response && response.data) {
                    this.dailyItineraries = response.data;
                } else {
                    this.dailyItineraries = response || [];
                }
            } catch (error) {
                console.error('加载产品每日行程失败:', error);
                this.dailyItineraries = [];
            }
        },

        // 加载产品费用说明
        async loadProductCostExplanation(productId) {
            try {
                const response = await request({
                    url: `/travel-portal/productCostExplanation/get/${productId}`,
                    method: 'get',
                });
                
                if (response && response.data) {
                    this.costExplanation = response.data;
                } else {
                    this.costExplanation = response;
                }
            } catch (error) {
                console.error('加载产品费用说明失败:', error);
                this.costExplanation = null;
            }
        },

        // 加载产品预订须知
        async loadProductBookingNotice(productId) {
            try {
                const response = await request({
                    url: `/travel-portal/productBookingNotice/get/${productId}`,
                    method: 'get',
                });
                
                if (response && response.data) {
                    this.bookingNotice = response.data;
                } else {
                    this.bookingNotice = response;
                }
            } catch (error) {
                console.error('加载产品预订须知失败:', error);
                this.bookingNotice = null;
            }
        },

        formatPrice(price) {
            if (!price) return '0.00';
            return Number(price).toFixed(2);
        }
    },
    computed: {
        splitProductTags() {
            if (!this.singlePackage || !this.singlePackage.productTags) return [];
            return this.singlePackage.productTags.split('，').map(tag => tag.trim());
        },
        splitserviceGuarantees() {
            if (!this.singlePackage || !this.singlePackage.serviceGuarantees) return [];
            return this.singlePackage.serviceGuarantees.split('，').map(tag => tag.trim());
        },
        productImages() {
            if (!this.singlePackage || !this.singlePackage.imgUrls) return this.defaultImages;
            
            try {
                const images = this.singlePackage.imgUrls.split(',').map(url => {
                    const trimmedUrl = url.trim();
                    // 如果是相对路径，添加完整路径
                    if (trimmedUrl && !trimmedUrl.startsWith('http')) {
                        return trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
                    }
                    return trimmedUrl;
                }).filter(url => url); // 过滤空字符串
                
                // 确保至少有4张图片
                while (images.length < 4) {
                    images.push(this.defaultImages[images.length % this.defaultImages.length]);
                }
                return images.slice(0, 4);
            } catch (error) {
                console.error('处理图片URL时出错:', error);
                return this.defaultImages;
            }
        },

        // 按天分组行程数据
        groupedItineraries() {
            if (!this.dailyItineraries || this.dailyItineraries.length === 0) {
                return [];
            }

            // 按天分组
            const grouped = {};
            this.dailyItineraries.forEach(itinerary => {
                const day = itinerary.daySeq || 1;
                if (!grouped[day]) {
                    grouped[day] = {
                        day: day,
                        itineraries: []
                    };
                }
                grouped[day].itineraries.push(itinerary);
            });

            // 按时间段排序每天的行程
            Object.keys(grouped).forEach(day => {
                grouped[day].itineraries.sort((a, b) => {
                    const timeOrder = { '早上': 1, '中午': 2, '下午': 3, '晚上': 4, '全天': 0 };
                    const aOrder = timeOrder[a.timePeriod] || 5;
                    const bOrder = timeOrder[b.timePeriod] || 5;
                    return aOrder - bOrder;
                });
            });

            // 转换为数组并按天数排序
            return Object.values(grouped).sort((a, b) => a.day - b.day);
        }
    }
};
</script>
<style scoped>
.title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.title {
    font-size: 20px;
    font-weight: 600;
    font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.button-buy {
    flex-shrink: 0;
}

.button-buy ::v-deep .el-button {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    border: none;
    border-radius: 20px;
    padding: 10px 25px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.button-buy ::v-deep .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.discriptions {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;


}

/* 移除span的单独样式，让span-container统一控制 */
.span-container {
    display: inline-block;
    margin-top: 10px;
    margin-right: 10px;
    background-color: rgb(247, 247, 247);
    border-radius: 10px;
    padding: 5px 10px;
    color: rgb(122, 122, 122);
    font-size: 12px;
    font-weight: 600;
}

/* 确保span继承容器的样式 */
.span-container span {
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    margin: 0;
}

/* 价格和销售信息行布局 */
.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    width: 100%;
}

.price {
    display: flex;
    align-items: baseline;
    font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.price-symbol {
    font-size: 16px;
    color: rgb(255, 80, 0);
    margin-right: 2px;
}

.price-text {
    color: rgb(255, 80, 0);
    font-size: 28px;
    font-weight: 600;
}

.salesDesc {
    font-size: 14px;
    color: #666;
    font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    white-space: nowrap;
}

/* 图片展示区域样式 */
.image-row {
    margin-top: 20px;
}

.image-container {
    width: 100%;
    height: 150px;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.image-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-container img,
.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
}

.image-container:hover img {
    transform: scale(1.05);
}

.sales-details {
    display: flex;
    align-items: center;
    margin-top: 20px;
    gap: 15px;
}

.sales-details.product-features {
    align-items: flex-start;
}

.service-guarantee {
    font-size: 14px;
    color: #666;
    font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    white-space: nowrap;
    flex-shrink: 0;
}

.service-guarantee-content {
    display: flex;
    align-items: center;
    gap: 5px;
}

.service-guarantee-content.product-features-content {
    align-items: flex-start;
    flex: 1;
}

.service-guarantee-content i {
    color: #67c23a;
    font-size: 16px;
}

.service-guarantee-content-text {
    font-size: 14px;
    color: #666;
    font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    white-space: nowrap;
}

.service-guarantee-content-text.product-features-text {
    white-space: normal;
    line-height: 1.6;
    word-wrap: break-word;
    word-break: break-all;
}

.picDesc {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
}

.fee-title {
    display: block;
    font-size: 20px;
    font-weight: 700;
    font-stretch: 100%;
    line-height: 26px;
    font-family: "microsoft yahei", Arial, sans-serif;
    margin-bottom: 17px;
}

.tag {
    display: inline-block;
    margin-bottom: 15px;
}

/* 表头文字颜色 */
.el-table th.el-table__cell .cell {
    color: #333 !important;
    /* 深黑色，!important 确保优先级 */
}

/* 表格内容文字颜色 */
.el-table td.el-table__cell .cell {
    color: #333 !important;
}

.booking-notice-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
}

.title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
}

.section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 10px;
    color: #333;
}

.notice-content {
    line-height: 1.6;
    color: #666;
}

.notice-item {
    margin-bottom: 15px;
}

.delegation-info {
    margin-bottom: 15px;
}

.el-table {
    margin-bottom: 20px;
}

.tourist-review {
    display: flex;
    align-items: flex-start;
    border: 1px solid #e4e7ed;
    padding: 20px;
    border-radius: 4px;
}

.review-tag {
    background-color: #67c23a;
    color: #fff;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    position: relative;
}

.tag-content {
    transform: rotate(-45deg);
    font-weight: bold;
}

.review-content {
    flex: 1;
}

.overall-satisfaction {
    display: flex;
    margin-bottom: 20px;
}

.satisfaction-percentage {
    margin-right: 30px;
}

.percentage {
    font-size: 36px;
    color: #f56c6c;
    font-weight: bold;
}

.review-count {
    display: block;
    font-size: 14px;
    color: #909399;
    margin-top: 5px;
}

.satisfaction-distribution {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.distribution-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.item-label {
    min-width: 80px;
    margin-right: 10px;
    font-size: 14px;
    display: inline-block;
    vertical-align: middle;
    white-space: nowrap;
}

.el-progress {
    width: 200px;
    margin-left: 26px;
    flex: 1;
}

.item-scores {
    display: flex;
    flex-wrap: wrap;
}

.score-item {
    margin-right: 30px;
    margin-bottom: 10px;
}

.item-type {
    font-size: 14px;
    color: #606266;
    margin-right: 5px;
}

.item-score {
    font-size: 14px;
    color: #f56c6c;
}

/* 评论容器样式 */
.reviews-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.reviews-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reviews-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviews-title i {
  font-size: 20px;
  color: #ffd700;
}

.reviews-summary {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.reviews-list {
  padding: 0;
}

/* 单个评论项样式 */
.review-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 24px;
  transition: all 0.3s ease;
}

.review-item:last-child {
  border-bottom: none;
}

.review-item:hover {
  background: #fafbfc;
}

/* 评论头部 */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.avatar-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.avatar-badge i {
  font-size: 10px;
  color: #fff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-type-badge {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.review-meta {
  text-align: right;
  color: #999;
  font-size: 13px;
}

.review-date {
  font-weight: 500;
  margin-bottom: 2px;
}

.review-source {
  opacity: 0.8;
}

/* 评分区域 */
.review-ratings {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
  font-weight: 500;
}

/* 评论内容 */
.review-text {
  margin-bottom: 20px;
}

.review-summary {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  border-left: 4px solid #fdcb6e;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 20px;
  color: #e17055;
  opacity: 0.6;
}

.summary-content {
  font-size: 15px;
  color: #2d3436;
  font-weight: 500;
  line-height: 1.6;
  margin-left: 24px;
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.detail-label {
  font-weight: 600;
  color: #2d3436;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-content {
  color: #636e72;
  line-height: 1.6;
  flex: 1;
}

/* 图片画廊 */
.review-gallery {
  margin-bottom: 20px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gallery-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.gallery-count {
  font-size: 13px;
  color: #999;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.02);
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-item:hover .gallery-img {
  filter: brightness(0.8);
}

.gallery-overlay i {
  color: #fff;
  font-size: 24px;
}

/* 评论底部 */
.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.review-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  color: #666 !important;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: #409eff !important;
  background: #ecf5ff;
}

.action-btn i {
  margin-right: 4px;
}

.coupon-reward {
  flex-shrink: 0;
}

.coupon-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.coupon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.coupon-btn i {
  margin-right: 4px;
}

/* 每日行程分组样式 */
.day-group {
  margin-bottom: 30px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.day-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.day-summary {
  font-size: 14px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
}

.day-timeline {
  padding: 20px;
  margin: 0;
}

.itinerary-card {
  margin-bottom: 0;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.itinerary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.itinerary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.time-tag {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
}

.itinerary-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.itinerary-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.itinerary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.itinerary-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.itinerary-detail i {
  color: #409eff;
  font-size: 16px;
}

.itinerary-detail strong {
  color: #333;
  font-weight: 600;
}

/* 时间轴样式优化 */
.day-timeline .el-timeline-item__timestamp {
  font-weight: 600;
  color: #409eff;
  font-size: 13px;
}

.day-timeline .el-timeline-item__node {
  background-color: #409eff;
  border-color: #409eff;
}

.day-timeline .el-timeline-item__tail {
  border-left-color: #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .day-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .itinerary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .itinerary-details {
    gap: 6px;
  }
  
  .review-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .review-meta {
    text-align: left;
  }
  
  .review-ratings {
    grid-template-columns: 1fr;
  }
  
  .review-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .review-actions {
    justify-content: center;
  }
}
</style>