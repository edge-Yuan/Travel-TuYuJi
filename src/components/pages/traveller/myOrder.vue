<template>
    <el-row>
        <el-col :span="24" style="margin-bottom: 10px;">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item to="/traveller/packageDetail">套餐详情</el-breadcrumb-item>
                <el-breadcrumb-item>套餐内容</el-breadcrumb-item>
            </el-breadcrumb>
        </el-col>
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
                            <img :src="img" :alt="`景点图片${index + 1}`" @error="handleImageError($event, index)"
                                @load="handleImageLoad($event, index)" class="product-image" />
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
                                            <img :src="singlePackage.mainImgUrl || '@/assets/logo/logo1.jpg'" alt=""
                                                class="picDesc">
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
                                            <el-timeline-item v-for="(itinerary, timeIndex) in dayGroup.itineraries"
                                                :key="itinerary.itineraryId"
                                                :timestamp="getTimeTag(itinerary, timeIndex)" placement="top">
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
                                <el-collapse v-model="activeNames" @change="handleChange">
                                    <!-- 价格明细 -->
                                    <el-collapse-item title="💰 价格明细" name="1">
                                        <el-row :gutter="20" class="price-cards-container">
                                            <!-- 成人价格卡片 -->
                                            <el-col :span="12" :md="6">
                                                <el-card class="price-card adult-price" shadow="hover">
                                                    <div class="price-card-content">
                                                        <div class="price-info">
                                                            <h4 class="price-title">成人价格</h4>
                                                            <p class="price-desc">标准成人费用</p>
                                                        </div>
                                                        <div class="price-amount">
                                                            <span class="price-symbol">¥</span>
                                                            <span class="price-value">{{ formatPrice(costExplanation.adultPrice) }}</span>
                                                        </div>
                                                    </div>
                                                </el-card>
                                            </el-col>
                                            
                                            <!-- 儿童价格卡片 -->
                                            <el-col :span="12" :md="6">
                                                <el-card class="price-card child-price" shadow="hover">
                                                    <div class="price-card-content">
                                                        <div class="price-info">
                                                            <h4 class="price-title">儿童价格</h4>
                                                            <p class="price-desc">2-12岁儿童</p>
                                                        </div>
                                                        <div class="price-amount">
                                                            <span class="price-symbol">¥</span>
                                                            <span class="price-value">{{ formatPrice(costExplanation.childPrice) }}</span>
                                                        </div>
                                                    </div>
                                                </el-card>
                                            </el-col>
                                            
                                            <!-- 婴儿价格卡片 -->
                                            <el-col :span="12" :md="6">
                                                <el-card class="price-card infant-price" shadow="hover">
                                                    <div class="price-card-content">
                                                        <div class="price-info">
                                                            <h4 class="price-title">婴儿价格</h4>
                                                            <p class="price-desc">2岁以下婴儿</p>
                                                        </div>
                                                        <div class="price-amount">
                                                            <span class="price-symbol">¥</span>
                                                            <span class="price-value">{{ formatPrice(costExplanation.infantPrice) }}</span>
                                                        </div>
                                                    </div>
                                                </el-card>
                                            </el-col>
                                            
                                            <!-- 单房差卡片 -->
                                            <el-col :span="12" :md="6">
                                                <el-card class="price-card supplement-price" shadow="hover">
                                                    <div class="price-card-content">
                                                        <div class="price-info">
                                                            <h4 class="price-title">单房差</h4>
                                                            <p class="price-desc">单人住宿补差</p>
                                                        </div>
                                                        <div class="price-amount">
                                                            <span class="price-symbol">¥</span>
                                                            <span class="price-value">{{ formatPrice(costExplanation.singleRoomSupplement) }}</span>
                                                        </div>
                                                    </div>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        
                                        <!-- 价格说明 -->
                                        <el-alert
                                            v-if="costExplanation.priceNotes"
                                            :title="costExplanation.priceNotes"
                                            type="info"
                                            :closable="false"
                                            class="price-notes-alert">
                                        </el-alert>
                                    </el-collapse-item>
                                    
                                    <!-- 费用包含 -->
                                    <el-collapse-item title="✅ 费用包含" name="2">
                                        <el-card class="include-card" shadow="never">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-check"></i>
                                                <span>包含项目</span>
                                            </div>
                                            <div class="card-content">
                                                {{ costExplanation.includeItems }}
                                            </div>
                                        </el-card>
                                    </el-collapse-item>
                                    
                                    <!-- 费用不含 -->
                                    <el-collapse-item title="❌ 费用不含" name="3">
                                        <el-card class="exclude-card" shadow="never">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-close"></i>
                                                <span>不含项目</span>
                                            </div>
                                            <div class="card-content">
                                                {{ costExplanation.excludeItems }}
                                            </div>
                                        </el-card>
                                    </el-collapse-item>
                                    
                                    <!-- 可选项目 -->
                                    <el-collapse-item title="🔧 可选项目" name="4">
                                        <el-card class="optional-card" shadow="never">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-setting"></i>
                                                <span>可选项目</span>
                                            </div>
                                            <div class="card-content">
                                                {{ costExplanation.optionalItems }}
                                            </div>
                                        </el-card>
                                    </el-collapse-item>
                                    
                                    <!-- 支付方式 -->
                                    <el-collapse-item title="💳 支付方式" name="5">
                                        <el-card class="payment-card" shadow="never">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-credit-card"></i>
                                                <span>支付方式</span>
                                            </div>
                                            <div class="card-content">
                                                {{ costExplanation.paymentTerms }}
                                            </div>
                                        </el-card>
                                    </el-collapse-item>
                                    
                                    <!-- 退款政策 -->
                                    <el-collapse-item title="🔄 退款政策" name="6">
                                        <div class="refund-policy-container">
                                            <!-- 退款政策表格 -->
                                            <el-table :data="refundPolicyData" stripe border class="refund-table">
                                                <el-table-column prop="time" label="取消时间" width="200"></el-table-column>
                                                <el-table-column prop="rate" label="退款比例" width="150">
                                                    <template slot-scope="scope">
                                                        <el-tag :type="getRefundTagType(scope.row.rate)">
                                                            {{ scope.row.rate }}
                                                        </el-tag>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column prop="fee" label="手续费"></el-table-column>
                                            </el-table>
                                            
                                            <!-- 退款说明 -->
                                            <el-alert
                                                :title="costExplanation.refundPolicy"
                                                type="warning"
                                                :closable="false"
                                                class="refund-alert">
                                            </el-alert>
                                        </div>
                                    </el-collapse-item>
                                </el-collapse>
                            </div>
                            <div v-else class="empty-state">
                                <el-empty description="暂无费用说明"></el-empty>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="预订须知" name="fourth">
                            <div class="booking-notice-container" v-if="bookingNotice">
                                <h2 class="notice-main-title">预订须知</h2>
                                
                                <!-- 基本信息区域 -->
                                <el-row :gutter="20" class="notice-row">
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-document"></i>
                                                <span>预订条件</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.bookingConditions)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-time"></i>
                                                <span>有效期</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text">{{ bookingNotice.validityPeriod || '请咨询客服' }}</div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>

                                <!-- 预订政策区域 -->
                                <el-row :gutter="20" class="notice-row">
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-warning"></i>
                                                <span>预订截止时间</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text">{{ bookingNotice.bookingDeadline || '请咨询客服' }}</div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-close"></i>
                                                <span>取消政策</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.cancellationPolicy)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>

                                <!-- 退款政策区域 -->
                                <el-row :gutter="20" class="notice-row">
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-money"></i>
                                                <span>退款政策</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.refundPolicy)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-star-on"></i>
                                                <span>特殊要求</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.specialRequirements)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>

                                <!-- 联系信息区域 -->
                                <el-row :gutter="20" class="notice-row">
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-phone"></i>
                                                <span>联系信息</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.contactInfo)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-card class="notice-card" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-warning-outline"></i>
                                                <span>紧急联系</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.emergencyContact)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>

                                <!-- 其他注意事项 -->
                                <el-row v-if="bookingNotice.notes" class="notice-row">
                                    <el-col :span="24">
                                        <el-card class="notice-card full-width" shadow="hover">
                                            <div slot="header" class="card-header">
                                                <i class="el-icon-info"></i>
                                                <span>其他注意事项</span>
                                            </div>
                                            <div class="card-content">
                                                <div class="notice-content-text" 
                                                     v-html="formatNoticeContent(bookingNotice.notes)">
                                                </div>
                                            </div>
                                        </el-card>
                                    </el-col>
                                </el-row>
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
                                            <span class="review-count">基于{{ evaluationSummary.totalReviews
                                            }}条游客评价</span>
                                        </div>
                                        <!-- 满意度分布 -->
                                        <div class="satisfaction-distribution">
                                            <div class="distribution-item"
                                                v-for="item in evaluationSummary.distributionItems" :key="item.type">
                                                <span class="item-label">{{ item.label }} ({{ item.count }})</span>
                                                <el-progress :percentage="item.percentage"
                                                    :color="getProgressColor(item.type)"
                                                    :show-text="false"></el-progress>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- 分项评分 -->
                                    <div class="item-scores">
                                        <div class="score-item" v-for="item in evaluationSummary.scoreItems"
                                            :key="item.type">
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
                                    <div class="review-item" v-for="review in validProductEvaluations" :key="review.evalId">
                                        <div class="review-header">
                                            <div class="user-profile">
                                                <div class="avatar-container">
                                                    <img :src="getUserAvatar(review)" alt="用户头像" class="user-avatar"
                                                         @error="handleAvatarError($event)">
                                                    <div class="avatar-badge">
                                                        <i class="el-icon-check"></i>
                                                    </div>
                                                </div>
                                            <div class="user-details">
                                                <div class="user-name">{{ getUserDisplayName(review) }}</div>
                                                <div class="user-type-badge">{{ '游客' }}</div>
                                            </div>
                                            </div>
                                            <div class="review-meta">
                                                <div class="review-date">{{ formatDate(review.evalTime) }}</div>
                                                <div class="review-source">官方平台</div>
                                            </div>
                                        </div>

                                        <div class="review-ratings">
                                            <div class="rating-item">
                                                <span class="rating-label">总体评价</span>
                                                <el-rate v-model="review.overallScore" disabled show-score
                                                    text-color="#ff9900" score-template="{value}"></el-rate>
                                            </div>
                                            <div class="rating-item" v-if="review.serviceScore">
                                                <span class="rating-label">导游服务</span>
                                                <el-rate v-model="review.serviceScore" disabled show-score
                                                    text-color="#ff9900" score-template="{value}"></el-rate>
                                            </div>
                                            <div class="rating-item" v-if="review.environmentScore">
                                                <span class="rating-label">行程安排</span>
                                                <el-rate v-model="review.environmentScore" disabled show-score
                                                    text-color="#ff9900" score-template="{value}"></el-rate>
                                            </div>
                                            <div class="rating-item" v-if="review.costEffScore">
                                                <span class="rating-label">餐饮住宿</span>
                                                <el-rate v-model="review.costEffScore" disabled show-score
                                                    text-color="#ff9900" score-template="{value}"></el-rate>
                                            </div>
                                        </div>

                                        <div class="review-text" v-if="review.content">
                                            <div class="review-summary">
                                                <i class="el-icon-quote-left quote-icon"></i>
                                                <span class="summary-content">{{ review.content }}</span>
                                            </div>
                                        </div>

                                        <div class="review-gallery" v-if="review.imgUrls && review.imgUrls.trim()">
                                            <div class="gallery-header">
                                                <span class="gallery-title">旅行照片</span>
                                                <span class="gallery-count">{{ getImageCount(review.imgUrls) }}张</span>
                                            </div>
                                            <el-carousel :interval="4000" type="card" height="180px"
                                                indicator-position="outside">
                                                <el-carousel-item
                                                    v-for="(img, imgIndex) in getImageList(review.imgUrls)"
                                                    :key="imgIndex">
                                                    <div class="gallery-item" @click="previewImage(img, getImageList(review.imgUrls))">
                                                        <img :src="getImageUrl(img)" alt="旅行图片" class="gallery-img" 
                                                             @error="handleGalleryImageError($event)">
                                                        <div class="gallery-overlay">
                                                            <i class="el-icon-zoom-in"></i>
                                                        </div>
                                                    </div>
                                                </el-carousel-item>
                                            </el-carousel>
                                        </div>

                                        <!-- 回复内容显示 -->
                                        <div v-if="review.replyContent" class="review-reply">
                                            <div class="reply-header">
                                                <i class="el-icon-service"></i>
                                                <span class="reply-label">商家回复</span>
                                                <span class="reply-time">{{ formatDate(review.replyTime) }}</span>
                                            </div>
                                            <div class="reply-content">
                                                {{ review.replyContent }}
                                            </div>
                                        </div>

                                        <div class="review-footer">
                                            <div class="review-actions">
                                                <el-button 
                                                    type="text" 
                                                    class="action-btn"
                                                    :class="{ 'useful-active': review.isUseful }"
                                                    @click="toggleUseful(review)"
                                                    :loading="review.usefulLoading"
                                                >
                                                    <i class="el-icon-thumb"></i>
                                                    有用 ({{ review.usefulCount || 0 }})
                                                </el-button>
                                                <el-button 
                                                    type="text" 
                                                    class="action-btn"
                                                    @click="showReplyDialog(review)"
                                                    v-if="canReply(review)"
                                                >
                                                    <i class="el-icon-chat-dot-round"></i>
                                                    {{ review.replyContent ? '查看回复' : '回复' }}
                                                </el-button>
                                            </div>
                                            <div class="coupon-reward">
                                                <el-button 
                                                    type="primary" 
                                                    class="coupon-btn"
                                                    @click="claimCoupon(review)"
                                                    :disabled="review.couponClaimed"
                                                >
                                                    <i class="el-icon-present"></i>
                                                    {{ review.couponClaimed ? '已领取' : '点评赠送抵用券 ¥20' }}
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
        
        <!-- 图片预览 - 使用自定义弹窗方案 -->
        <div v-if="imageViewerVisible" class="image-preview-modal">
            <div class="preview-overlay" @click="imageViewerVisible = false">
                <div class="preview-content" @click.stop>
                    <div class="preview-header">
                        <span class="preview-title">图片预览 ({{ previewIndex + 1 }}/{{ previewImages.length }})</span>
                        <button @click="imageViewerVisible = false" class="close-btn">×</button>
                    </div>
                    <div class="preview-body">
                        <img 
                            :src="previewImages[previewIndex]" 
                            alt="预览图片" 
                            class="preview-image"
                            @error="handlePreviewImageError"
                        />
                    </div>
                    <div class="preview-footer" v-if="previewImages.length > 1">
                        <button 
                            @click="prevImage" 
                            :disabled="previewIndex === 0"
                            class="nav-btn prev-btn"
                        >
                            ← 上一张
                        </button>
                        <button 
                            @click="nextImage" 
                            :disabled="previewIndex === previewImages.length - 1"
                            class="nav-btn next-btn"
                        >
                            下一张 →
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 回复对话框 -->
        <el-dialog
            :title="replyDialog.title"
            :visible.sync="replyDialog.visible"
            width="600px"
            :before-close="handleReplyDialogClose"
        >
            <div class="reply-dialog-content">
                <!-- 原评价内容 -->
                <div class="original-review">
                    <div class="review-user-info" v-if="replyDialog.review">
                        <img :src="getUserAvatar(replyDialog.review)" alt="用户头像" class="user-avatar-small">
                        <div class="user-info">
                            <div class="user-name">{{ getUserDisplayName(replyDialog.review) }}</div>
                            <div class="review-time">{{ formatDate(replyDialog.review.evalTime) }}</div>
                        </div>
                    </div>
                    <div class="review-content-preview" v-if="replyDialog.review">
                        {{ replyDialog.review.content }}
                    </div>
                </div>

                <!-- 回复表单 -->
                <div class="reply-form">
                    <el-form :model="replyForm" :rules="replyRules" ref="replyForm" label-width="80px">
                        <el-form-item label="回复内容" prop="content">
                            <el-input
                                v-model="replyForm.content"
                                type="textarea"
                                :rows="4"
                                placeholder="请输入回复内容..."
                                maxlength="500"
                                show-word-limit
                            ></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button @click="handleReplyDialogClose">取消</el-button>
                <el-button type="primary" @click="submitReply" :loading="replyDialog.loading">
                    提交回复
                </el-button>
            </div>
        </el-dialog>
    </el-row>
</template>

<script>
import request from '@/utils/request';
import UnifiedEvaluationAPI from '@/utils/evaluationAPI';
import { imageMixin } from '@/utils/imageUtils';

export default {
    name: 'ProductDetail',
    mixins: [imageMixin],
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
            ],
            activeNames: ['1'],
            // 退款政策数据
            refundPolicyData: [
                { time: '出发前7天以上', rate: '100%', fee: '免费' },
                { time: '出发前3-6天', rate: '80%', fee: '20%手续费' },
                { time: '出发前1-2天', rate: '50%', fee: '50%手续费' },
                { time: '出发当天', rate: '0%', fee: '不予退款' }
            ],
            // 图片预览相关
            imageViewerVisible: false,
            previewImages: [],
            previewIndex: 0,
            // 回复对话框相关
            replyDialog: {
                visible: false,
                loading: false,
                title: '回复评价',
                review: null
            },
            // 回复表单
            replyForm: {
                content: ''
            },
            // 回复表单验证规则
            replyRules: {
                content: [
                    { required: true, message: '请输入回复内容', trigger: 'blur' },
                    { min: 5, message: '回复内容至少5个字符', trigger: 'blur' },
                    { max: 500, message: '回复内容不能超过500个字符', trigger: 'blur' }
                ]
            }
        };
    },
    created() {
        this.loadSinglePackageData();
        // 调试用户存储信息
        this.debugUserStorage();
    },
    methods: {
        // 统一成功判断
        isSuccess(res) {
            if (!res) return false;
            const body = res.data || res;
            return body && (body.code === 200 || body.code === 1 || body.success === true);
        },
        // 统一取数据体
        extractData(res, fallback = null) {
            if (!res) return fallback;
            // axios 响应对象
            if (res.data && (res.data.data !== undefined || res.data.result !== undefined)) {
                return res.data.data !== undefined ? res.data.data : res.data.result;
            }
            // 直接 body
            if (res.data !== undefined) return res.data;
            return fallback;
        },
        handleChange(val) {
            console.log(val);
        },
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
                const p = this.singlePackage || {};
                const firstImage = (p.mainImgUrl || (p.imgUrls ? String(p.imgUrls).split(',')[0] : '') || '').trim();
                const orderProducts = [
                    {
                        id: p.productId || p.id || this.$route.query.productId,
                        name: p.productName || p.title || '商品',
                        image: firstImage && !firstImage.startsWith('http') ? `/${firstImage.replace(/^\//,'')}` : firstImage,
                        price: Number(p.price || p.finalPrice || p.salePrice || 0),
                        quantity: 1,
                        attrs: []
                    }
                ].filter(item => item.id);

                this.$router.push({
                    path: '/purchasePages',
                    query: {
                        orderProducts: JSON.stringify(orderProducts)
                    }
                });
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
            if (!imgUrls || !imgUrls.trim()) return 0;
            return imgUrls.split(',')
                .map(url => url ? url.trim() : '')
                .filter(url => url && url.length > 0).length;
        },

        // 获取图片列表
        getImageList(imgUrls) {
            if (!imgUrls || !imgUrls.trim()) {
                return [];
            }
            return imgUrls.split(',')
                .map(url => url ? url.trim() : '')
                .filter(url => url && url.length > 0);
        },

        // 获取用户头像
        getUserAvatar(review) {
            // 优先使用userAvatar字段
            if (review && review.userAvatar && review.userAvatar.trim()) {
                return this.processImageUrl(review.userAvatar, 'avatar');
            }
            
            // 如果没有头像，使用默认头像
            return this.getDefaultImage('avatar');
        },

        // 处理图片URL
        getImageUrl(url) {
            if (!url || !url.trim()) {
                return this.getDefaultImage('evaluation');
            }
            return this.processImageUrl(url, 'evaluation');
        },

        // 处理头像加载错误
        handleAvatarError(event) {
            // 避免重复设置默认图片和重复日志
            const defaultAvatar = this.getDefaultImage('avatar');
            if (event.target.src === defaultAvatar) {
                return;
            }
            // 静默处理，不输出日志
            event.target.src = defaultAvatar;
        },

        // 处理评价图片加载错误
        handleGalleryImageError(event) {
            // 避免重复设置默认图片和重复日志
            const defaultImage = this.getDefaultImage('evaluation');
            if (event.target.src === defaultImage) {
                return;
            }
            // 静默处理，不输出日志
            event.target.src = defaultImage;
        },

        // 预览图片
        previewImage(currentImg, allImages) {
            console.log('=== 开始预览图片 ===');
            console.log('点击的图片:', currentImg);
            console.log('图片列表:', allImages);
            
            if (!allImages || allImages.length === 0) {
                console.log('图片列表为空，无法预览');
                return;
            }
            
            this.previewImages = allImages.map(img => this.getImageUrl(img));
            this.previewIndex = allImages.indexOf(currentImg);
            this.imageViewerVisible = true;
            
            console.log('处理后的图片列表:', this.previewImages);
            console.log('预览图片索引:', this.previewIndex);
            console.log('图片查看器可见性:', this.imageViewerVisible);
        },
        
        // 上一张图片
        prevImage() {
            if (this.previewIndex > 0) {
                this.previewIndex--
                console.log('切换到上一张图片，索引:', this.previewIndex)
            }
        },
        
        // 下一张图片
        nextImage() {
            if (this.previewIndex < this.previewImages.length - 1) {
                this.previewIndex++
                console.log('切换到下一张图片，索引:', this.previewIndex)
            }
        },
        
        // 预览图片加载错误处理
        handlePreviewImageError(event) {
            console.error('预览图片加载失败:', event.target.src)
            event.target.src = this.getDefaultImage('evaluation')
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

                this.singlePackage = this.extractData(response, null);

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
                console.log('开始加载产品评价汇总信息，产品ID:', productId);
                
                // 使用统一API获取产品评价汇总
                const response = await UnifiedEvaluationAPI.getProductEvaluationSummary(productId);
                console.log('统一评价汇总API响应:', response);
                
                if (response && response.code === 1) {
                    const apiData = response.data || {
                        satisfactionRate: 0,
                        totalReviews: 0,
                        distributionItems: [],
                        scoreItems: []
                    };
                    
                    // 格式化API返回的数据，确保数字格式正确
                    this.evaluationSummary = {
                        satisfactionRate: parseFloat(apiData.satisfactionRate?.toFixed(1) || 0),
                        totalReviews: apiData.totalReviews || 0,
                        distributionItems: (apiData.distributionItems || []).map(item => ({
                            ...item,
                            percentage: parseFloat((item.percentage || 0).toFixed(1))
                        })),
                        scoreItems: (apiData.scoreItems || []).map(item => ({
                            ...item,
                            score: parseFloat((item.score || 0).toFixed(1))
                        }))
                    };
                    console.log('统一评价汇总数据:', this.evaluationSummary);
                    console.log('满意度百分比:', this.evaluationSummary.satisfactionRate);
                    console.log('分项评分:', this.evaluationSummary.scoreItems);
                } else {
                    // 如果统一API失败，尝试使用旧版API
                    try {
                        console.log('尝试使用旧版API获取评价汇总');
                        const fallbackResponse = await request({
                            url: `/travel-portal/tourEvaluation/byProduct/${productId}`,
                            method: 'get',
                        });

                        console.log('旧版评价数据API响应:', fallbackResponse);
                        
                        const evaluations = this.extractData(fallbackResponse, []);
                        console.log('解析后的评价数据:', evaluations);
                        
                        this.evaluationSummary = this.calculateEvaluationSummary(evaluations);
                        console.log('计算后的评价汇总:', this.evaluationSummary);
                    } catch (fallbackError) {
                        console.error('旧版API也失败:', fallbackError);
                        this.$message.warning('获取评价数据失败，请稍后重试');
                        
                        // 使用空数据而不是默认数据
                        this.evaluationSummary = {
                            satisfactionRate: 0,
                            totalReviews: 0,
                            distributionItems: [],
                            scoreItems: []
                        };
                    }
                }
            } catch (error) {
                console.error('加载产品评价汇总失败:', error);
                this.$message.warning('获取评价数据失败，请稍后重试');
                
                // 使用空数据而不是默认数据
                this.evaluationSummary = {
                    satisfactionRate: 0,
                    totalReviews: 0,
                    distributionItems: [],
                    scoreItems: []
                };
            }
        },

        // 加载产品评价列表
        async loadProductEvaluations(productId) {
            try {
                console.log('开始加载产品评价列表，产品ID:', productId);
                
                // 使用统一API获取产品评价列表
                const response = await UnifiedEvaluationAPI.getProductEvaluations(productId, 1, 20);
                console.log('统一评价列表API响应:', response);
                
                if (response && response.code === 1) {
                    const evaluations = Array.isArray(response.data) ? response.data : [];
                    // 验证和清理评价数据
                    this.productEvaluations = evaluations
                        .filter(evaluation => evaluation && evaluation.evalId) // 过滤掉null或无效数据
                        .map(evaluation => {
                            // 确保imgUrls字段是字符串
                            if (evaluation.imgUrls && typeof evaluation.imgUrls !== 'string') {
                                evaluation.imgUrls = String(evaluation.imgUrls);
                            }
                            // 确保userAvatar字段是字符串
                            if (evaluation.userAvatar && typeof evaluation.userAvatar !== 'string') {
                                evaluation.userAvatar = String(evaluation.userAvatar);
                            }
                            // 初始化有用状态相关字段
                            evaluation.isUseful = evaluation.isUseful || false;
                            // 保持后端返回的有用数，如果没有则默认为0
                            if (evaluation.usefulCount === undefined || evaluation.usefulCount === null) {
                                evaluation.usefulCount = 0;
                            }
                            evaluation.usefulLoading = false;
                            evaluation.couponClaimed = evaluation.couponClaimed || false;
                            return evaluation;
                        });
                    console.log('统一评价列表数据:', this.productEvaluations);
                    
                    // 打印每个评价的有用数
                    this.productEvaluations.forEach(evaluation => {
                        console.log(`评价 ${evaluation.evalId} 初始有用数:`, evaluation.usefulCount);
                    });
                    
                    // 加载每个评价的有用状态
                    await this.loadUsefulStatusForEvaluations();
                } else {
                    // 如果统一API失败，尝试使用旧版API
                    try {
                        console.log('尝试使用旧版API获取评价列表');
                        const fallbackResponse = await request({
                            url: `/travel-portal/tourEvaluation/byProduct/${productId}`,
                            method: 'get',
                        });

                        console.log('旧版评价列表API响应:', fallbackResponse);
                        
                        const list = this.extractData(fallbackResponse, []);
                        console.log('解析后的评价列表:', list);
                        
                        const evaluations = Array.isArray(list) ? list : [];
                        // 验证和清理评价数据
                        this.productEvaluations = evaluations
                            .filter(evaluation => evaluation && evaluation.evalId) // 过滤掉null或无效数据
                            .map(evaluation => {
                                // 确保imgUrls字段是字符串
                                if (evaluation.imgUrls && typeof evaluation.imgUrls !== 'string') {
                                    evaluation.imgUrls = String(evaluation.imgUrls);
                                }
                                // 确保userAvatar字段是字符串
                                if (evaluation.userAvatar && typeof evaluation.userAvatar !== 'string') {
                                    evaluation.userAvatar = String(evaluation.userAvatar);
                                }
                                // 初始化有用状态相关字段
                                evaluation.isUseful = evaluation.isUseful || false;
                                // 保持后端返回的有用数，如果没有则默认为0
                                if (evaluation.usefulCount === undefined || evaluation.usefulCount === null) {
                                    evaluation.usefulCount = 0;
                                }
                                evaluation.usefulLoading = false;
                                evaluation.couponClaimed = evaluation.couponClaimed || false;
                                return evaluation;
                            });
                        console.log('旧版评价列表数据:', this.productEvaluations);
                    } catch (fallbackError) {
                        console.error('旧版API也失败:', fallbackError);
                        this.$message.warning('获取评价列表失败，请稍后重试');
                        this.productEvaluations = [];
                    }
                }
            } catch (error) {
                console.error('加载产品评价列表失败:', error);
                this.$message.warning('获取评价列表失败，请稍后重试');
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

                const list = this.extractData(response, []);
                this.dailyItineraries = Array.isArray(list) ? list : [];
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

                this.costExplanation = this.extractData(response, null);
            } catch (error) {
                console.error('加载产品费用说明失败:', error);
                // 设置默认数据用于测试
                this.costExplanation = {
                    costId: 1,
                    productId: productId,
                    includeItems: "交通费、住宿费、餐费、门票费、导游服务费",
                    excludeItems: "个人消费、自费项目、保险费用、小费",
                    refundPolicy: "出发前7天可全额退款，3-6天退款80%，1-2天退款50%，当天不退",
                    adultPrice: 2999.00,
                    childPrice: 1999.00,
                    infantPrice: 0.00,
                    singleRoomSupplement: 500.00,
                    optionalItems: "保险、自费景点、购物",
                    priceNotes: "价格包含所有基础服务，不含个人消费",
                    paymentTerms: "支持支付宝、微信、银行卡支付，支持分期付款",
                    cancellationPolicy: "提前7天取消免费，3-6天收取20%手续费，1-2天收取50%手续费",
                    refundDeadline: "出发前24小时",
                    refundRate: "根据取消时间确定退款比例"
                };
            }
        },

        // 加载产品预订须知
        async loadProductBookingNotice(productId) {
            try {
                const response = await request({
                    url: `/travel-portal/productBookingNotice/get/${productId}`,
                    method: 'get',
                });

                this.bookingNotice = this.extractData(response, null);
            } catch (error) {
                console.error('加载产品预订须知失败:', error);
                // 设置默认数据用于测试
                this.bookingNotice = {
                    noticeId: 1,
                    productId: productId,
                    bookingConditions: "1. 年龄要求：18-65岁<br/>2. 身体健康，无严重疾病<br/>3. 提供有效身份证件<br/>4. 遵守旅游纪律",
                    validityPeriod: "产品有效期为购买后6个月内",
                    notes: "请仔细阅读以上条款，如有疑问请及时联系客服",
                    bookingDeadline: "出发前3天截止预订",
                    cancellationPolicy: "出发前7天可免费取消<br/>出发前3-6天收取20%手续费<br/>出发前1-2天收取50%手续费<br/>出发当天不予退款",
                    refundPolicy: "退款将在3-7个工作日内原路返回<br/>手续费将按比例扣除",
                    specialRequirements: "1. 请携带常用药品<br/>2. 注意防晒和保暖<br/>3. 遵守当地法律法规",
                    contactInfo: "客服电话：400-123-4567<br/>工作时间：9:00-18:00<br/>邮箱：service@travel.com",
                    emergencyContact: "紧急联系电话：138-0000-0000<br/>24小时服务热线",
                    title: "产品预订须知",
                    status: 1,
                    sortOrder: 1
                };
            }
        },

        formatPrice(price) {
            if (!price) return '0.00';
            return Number(price).toFixed(2);
        },

        // 获取退款标签类型
        getRefundTagType(rate) {
            if (rate === '100%') return 'success';
            if (rate === '80%') return 'warning';
            if (rate === '50%') return 'warning';
            if (rate === '0%') return 'danger';
            return 'info';
        },

        // 计算评价汇总信息
        calculateEvaluationSummary(evaluations) {
            if (!evaluations || evaluations.length === 0) {
                console.log('没有评价数据，返回空汇总信息');
                return {
                    satisfactionRate: 0,
                    totalReviews: 0,
                    distributionItems: [],
                    scoreItems: []
                };
            }

            const totalReviews = evaluations.length;
            // 使用overallScore作为主要评分
            const ratings = evaluations.map(e => e.overallScore || 0);
            const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews;
            const satisfactionRate = parseFloat(((avgRating / 5) * 100).toFixed(1));
            console.log('计算满意度百分比:', satisfactionRate);

            // 计算满意度分布
            const satisfied = ratings.filter(r => r >= 4).length;
            const moderate = ratings.filter(r => r === 3).length;
            const dissatisfied = ratings.filter(r => r <= 2).length;

            const distributionItems = [
                { 
                    type: 'satisfied', 
                    label: '很满意', 
                    count: satisfied, 
                    percentage: parseFloat(((satisfied / totalReviews) * 100).toFixed(1)) 
                },
                { 
                    type: 'moderate', 
                    label: '还不错', 
                    count: moderate, 
                    percentage: parseFloat(((moderate / totalReviews) * 100).toFixed(1)) 
                },
                { 
                    type: 'dissatisfied', 
                    label: '不满意', 
                    count: dissatisfied, 
                    percentage: parseFloat(((dissatisfied / totalReviews) * 100).toFixed(1)) 
                }
            ];

            // 计算分项评分
            const serviceScores = evaluations.map(e => e.serviceScore || 0).filter(s => s > 0);
            const environmentScores = evaluations.map(e => e.environmentScore || 0).filter(s => s > 0);
            const costEffScores = evaluations.map(e => e.costEffScore || 0).filter(s => s > 0);

            const avgServiceScore = serviceScores.length > 0 ? 
                (serviceScores.reduce((sum, score) => sum + score, 0) / serviceScores.length).toFixed(1) : avgRating.toFixed(1);
            const avgEnvironmentScore = environmentScores.length > 0 ? 
                (environmentScores.reduce((sum, score) => sum + score, 0) / environmentScores.length).toFixed(1) : avgRating.toFixed(1);
            const avgCostEffScore = costEffScores.length > 0 ? 
                (costEffScores.reduce((sum, score) => sum + score, 0) / costEffScores.length).toFixed(1) : avgRating.toFixed(1);

            const scoreItems = [
                { type: '导游服务', score: parseFloat(avgServiceScore) },
                { type: '行程规划', score: parseFloat(avgEnvironmentScore) },
                { type: '住宿体验', score: parseFloat(avgCostEffScore) },
                { type: '交通出行', score: parseFloat(avgRating.toFixed(1)) }
            ];
            console.log('计算分项评分:', scoreItems);

            return {
                satisfactionRate,
                totalReviews,
                distributionItems,
                scoreItems
            };
        },

        // 获取用户显示名称
        getUserDisplayName(review) {
            // 检查review是否为null或undefined
            if (!review) {
                console.warn('getUserDisplayName: review参数为空')
                return '匿名用户'
            }
            
            console.log('=== myOrder用户名显示调试 ===')
            console.log('评价数据:', review)
            console.log('评价用户ID:', review.userId, typeof review.userId)
            
            const currentUserId = this.getCurrentUserId()
            console.log('当前用户ID:', currentUserId, typeof currentUserId)
            
            // 如果是当前用户自己的评价，尝试获取完整用户名
            const evalUserId = Number(review.userId)
            const currentUserIdNum = Number(currentUserId)
            
            console.log('转换后评价用户ID:', evalUserId)
            console.log('转换后当前用户ID:', currentUserIdNum)
            console.log('ID是否相等:', evalUserId === currentUserIdNum)
            
            // 如果当前用户ID获取失败，提供临时解决方案
            if (!currentUserId || currentUserIdNum === 0) {
                console.log('当前用户ID获取失败，检查是否可以通过其他方式识别')
                
                // 尝试通过用户名匹配（临时方案）
                const currentUserName = this.getCurrentUserFullName()
                const reviewUserName = review.userName || ''
                
                console.log('当前用户名:', currentUserName)
                console.log('评价用户名:', reviewUserName)
                
                // 如果用户名匹配且不是脱敏格式，可能是当前用户
                if (currentUserName && reviewUserName && 
                    currentUserName !== '匿名用户' && 
                    !reviewUserName.includes('*') &&
                    currentUserName === reviewUserName) {
                    console.log('通过用户名匹配识别为当前用户')
                    return currentUserName
                }
            }
            
            if (review.userId && currentUserId && evalUserId === currentUserIdNum) {
                console.log('检测到是当前用户的评价，尝试获取完整用户名')
                // 尝试从本地存储获取完整用户名
                const fullUserName = this.getCurrentUserFullName()
                console.log('从本地存储获取的完整用户名:', fullUserName)
                
                if (fullUserName && fullUserName !== '匿名用户') {
                    console.log('使用完整用户名:', fullUserName)
                    return fullUserName
                } else {
                    console.log('无法获取完整用户名，使用评价数据中的用户名')
                    // 如果是当前用户的评价，直接返回评价数据中的用户名（不进行脱敏）
                    const userName = review.userName || '匿名用户'
                    console.log('当前用户评价，直接返回完整用户名:', userName)
                    return userName
                }
            }
            
            // 使用评价数据中的用户名（可能已经被脱敏）
            const userName = review.userName || '匿名用户'
            console.log('评价数据中的用户名:', userName)
            
            // 如果是匿名用户，直接返回
            if (userName === '匿名用户') {
                console.log('返回匿名用户')
                return userName
            }
            
            // 如果用户名已经被脱敏（包含*），直接返回
            if (userName.includes('*')) {
                console.log('用户名已被脱敏，直接返回:', userName)
                return userName
            }
            
            // 如果用户名没有被脱敏，进行脱敏处理
            let maskedName
            if (userName.length <= 1) {
                maskedName = userName
            } else if (userName.length === 2) {
                maskedName = userName.charAt(0) + '*'
            } else {
                maskedName = userName.charAt(0) + '*'.repeat(userName.length - 2) + userName.charAt(userName.length - 1)
            }
            
            console.log('进行脱敏处理，结果:', maskedName)
            return maskedName
        },
        
        // 获取当前用户的完整用户名
        getCurrentUserFullName() {
            try {
                console.log('=== 开始获取用户完整用户名 ===')
                
                // 从localStorage获取用户信息
                const localStorageUserInfo = localStorage.getItem('userInfo')
                console.log('localStorage userInfo:', localStorageUserInfo)
                
                if (localStorageUserInfo) {
                    const userInfo = JSON.parse(localStorageUserInfo)
                    console.log('解析后的localStorage userInfo:', userInfo)
                    
                    // 检查嵌套结构 data.username
                    if (userInfo && userInfo.data && userInfo.data.username) {
                        console.log('从localStorage.data.username获取到:', userInfo.data.username)
                        return userInfo.data.username
                    }
                    
                    // 检查直接结构 username
                    if (userInfo && userInfo.username) {
                        console.log('从localStorage.username获取到:', userInfo.username)
                        return userInfo.username
                    }
                }
                
                // 从sessionStorage获取用户信息
                const sessionStorageUserInfo = sessionStorage.getItem('userInfo')
                console.log('sessionStorage userInfo:', sessionStorageUserInfo)
                
                if (sessionStorageUserInfo) {
                    const sessionUserInfo = JSON.parse(sessionStorageUserInfo)
                    console.log('解析后的sessionStorage userInfo:', sessionUserInfo)
                    
                    // 检查嵌套结构 data.username
                    if (sessionUserInfo && sessionUserInfo.data && sessionUserInfo.data.username) {
                        console.log('从sessionStorage.data.username获取到:', sessionUserInfo.data.username)
                        return sessionUserInfo.data.username
                    }
                    
                    // 检查直接结构 username
                    if (sessionUserInfo && sessionUserInfo.username) {
                        console.log('从sessionStorage.username获取到:', sessionUserInfo.username)
                        return sessionUserInfo.username
                    }
                }
                
                // 从localStorage直接获取用户名
                const storedUsername = localStorage.getItem('username')
                if (storedUsername) {
                    console.log('从localStorage直接获取到username:', storedUsername)
                    return storedUsername
                }
                
                // 从sessionStorage直接获取用户名
                const sessionUsername = sessionStorage.getItem('username')
                if (sessionUsername) {
                    console.log('从sessionStorage直接获取到username:', sessionUsername)
                    return sessionUsername
                }
                
                console.log('所有方法都失败，返回null')
                return null
            } catch (error) {
                console.error('获取用户完整用户名失败:', error)
                return null
            }
        },

        // 获取当前用户ID
        getCurrentUserId() {
            try {
                console.log('=== 开始获取当前用户ID ===')
                
                const tryParse = (v) => { 
                    try { 
                        const parsed = JSON.parse(v)
                        console.log('解析成功:', parsed)
                        return parsed 
                    } catch (e) { 
                        console.log('解析失败:', v, e)
                        return null 
                    } 
                }
                
                const pickId = (o) => {
                    if (!o) return null
                    const id = o.userId || o.id || o.uid || o.user?.id || o.user?.userId
                    console.log('从对象中提取ID:', o, '->', id)
                    return id
                }

                // 方法1: 从userInfo中获取
                console.log('方法1: 尝试从userInfo获取')
                const localStorageUserInfo = localStorage.getItem('userInfo')
                const sessionStorageUserInfo = sessionStorage.getItem('userInfo')
                console.log('localStorage userInfo:', localStorageUserInfo)
                console.log('sessionStorage userInfo:', sessionStorageUserInfo)
                
                const userInfo = tryParse(localStorageUserInfo) || tryParse(sessionStorageUserInfo)
                if (userInfo) {
                    const id = pickId(userInfo)
                    if (id) {
                        console.log('从userInfo获取到ID:', id)
                        return Number(id)
                    }
                }
                
                // 方法2: 从currentUserId中获取
                console.log('方法2: 尝试从currentUserId获取')
                const localStorageCurrentUserId = localStorage.getItem('currentUserId')
                const sessionStorageCurrentUserId = sessionStorage.getItem('currentUserId')
                console.log('localStorage currentUserId:', localStorageCurrentUserId)
                console.log('sessionStorage currentUserId:', sessionStorageCurrentUserId)
                
                const storedId = localStorageCurrentUserId || sessionStorageCurrentUserId
                if (storedId) {
                    console.log('从currentUserId获取到ID:', storedId)
                    return Number(storedId)
                }
                
                // 方法3: 从token中获取
                console.log('方法3: 尝试从token获取')
                const token = localStorage.getItem('token') || sessionStorage.getItem('token')
                console.log('token:', token ? '存在' : '不存在')
                
                if (token && token.includes('.')) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        console.log('token payload:', payload)
                        const id = payload.userId || payload.sub
                        if (id) {
                            console.log('从token获取到ID:', id)
                            return Number(id)
                        }
                    } catch (e) {
                        console.warn('token decode failed', e)
                    }
                }
                
                // 方法4: 检查其他可能的存储位置
                console.log('方法4: 检查其他存储位置')
                const possibleKeys = ['userId', 'user_id', 'currentUser', 'loginUser']
                for (const key of possibleKeys) {
                    const value = localStorage.getItem(key) || sessionStorage.getItem(key)
                    if (value) {
                        console.log(`从${key}获取到值:`, value)
                        const parsed = tryParse(value)
                        if (parsed) {
                            const id = pickId(parsed)
                            if (id) {
                                console.log(`从${key}获取到ID:`, id)
                                return Number(id)
                            }
                        } else if (!isNaN(Number(value))) {
                            console.log(`从${key}获取到数字ID:`, value)
                            return Number(value)
                        }
                    }
                }
                
                console.log('所有方法都失败，返回null')
                return null
            } catch (e) {
                console.error('获取用户ID失败:', e)
                return null
            }
        },

        // 调试工具：检查所有存储的用户信息
        debugUserStorage() {
            console.log('=== 用户存储信息调试 ===')
            console.log('localStorage 所有键:', Object.keys(localStorage))
            console.log('sessionStorage 所有键:', Object.keys(sessionStorage))
            
            const userRelatedKeys = ['userInfo', 'currentUserId', 'userId', 'user_id', 'currentUser', 'loginUser', 'token', 'username']
            
            userRelatedKeys.forEach(key => {
                const localValue = localStorage.getItem(key)
                const sessionValue = sessionStorage.getItem(key)
                if (localValue) {
                    console.log(`localStorage.${key}:`, localValue)
                }
                if (sessionValue) {
                    console.log(`sessionStorage.${key}:`, sessionValue)
                }
            })
            
            // 检查所有localStorage中的值
            console.log('=== localStorage 所有内容 ===')
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                const value = localStorage.getItem(key)
                console.log(`${key}:`, value)
            }
            
            console.log('=== sessionStorage 所有内容 ===')
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                const value = sessionStorage.getItem(key)
                console.log(`${key}:`, value)
            }
        },

        // 判断是否可以回复
        canReply(review) {
            // 只有商家或管理员可以回复
            const currentUserRole = this.getCurrentUserRole()
            
            // 检查评价是否已有回复，如果已有回复则不允许再次回复
            if (review && review.replyContent) {
                return false
            }
            
            return currentUserRole === 'merchant' || currentUserRole === 'admin'
        },

        // 获取当前用户角色
        getCurrentUserRole() {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
                if (userInfo && userInfo.data && userInfo.data.userRole !== undefined) {
                    const roleMap = {
                        0: 'tourist',    // 游客
                        1: 'merchant',   // 商家
                        2: 'guide',      // 导游
                        3: 'admin'       // 管理员
                    }
                    return roleMap[userInfo.data.userRole] || 'tourist'
                }
                return 'tourist'
            } catch (error) {
                console.error('获取用户角色失败:', error)
                return 'tourist'
            }
        },

        // 显示回复对话框
        showReplyDialog(review) {
            this.replyDialog.review = review
            this.replyDialog.visible = true
            this.replyDialog.title = review.replyContent ? '查看回复' : '回复评价'
            this.replyForm.content = review.replyContent || ''
        },

        // 关闭回复对话框
        handleReplyDialogClose() {
            this.replyDialog.visible = false
            this.replyDialog.review = null
            this.replyForm.content = ''
            if (this.$refs.replyForm) {
                this.$refs.replyForm.resetFields()
            }
        },

        // 提交回复
        async submitReply() {
            try {
                await this.$refs.replyForm.validate()
                
                this.replyDialog.loading = true
                
                // 获取当前用户信息
                const currentUserId = this.getCurrentUserId()
                const currentUserName = this.getCurrentUserFullName()
                const currentUserRole = this.getCurrentUserRole()
                
                if (!currentUserId) {
                    this.$message.error('请先登录')
                    return
                }
                
                const response = await UnifiedEvaluationAPI.replyEvaluation(
                    this.replyDialog.review.evalId,
                    this.replyForm.content,
                    currentUserId,
                    currentUserName || '用户',
                    currentUserRole
                )
                
                if (response && response.code === 1) {
                    this.$message.success('回复成功！')
                    
                    // 更新评价数据
                    this.replyDialog.review.replyContent = this.replyForm.content
                    this.replyDialog.review.replyTime = new Date().toISOString()
                    
                    this.handleReplyDialogClose()
                } else {
                    this.$message.error(response?.msg || '回复失败，请重试')
                }
            } catch (error) {
                console.error('提交回复失败:', error)
                this.$message.error('回复失败，请重试')
            } finally {
                this.replyDialog.loading = false
            }
        },

        // 加载所有评价的有用状态
        async loadUsefulStatusForEvaluations() {
            const currentUserId = this.getCurrentUserId();
            if (!currentUserId) {
                console.log('用户未登录，跳过加载有用状态');
                return;
            }

            console.log('=== 开始加载有用状态 ===');
            console.log('当前用户ID:', currentUserId);
            console.log('评价数量:', this.productEvaluations.length);

            for (const evaluation of this.productEvaluations) {
                try {
                    console.log(`加载评价 ${evaluation.evalId} 的有用状态`);
                    const response = await UnifiedEvaluationAPI.getUsefulStatus(evaluation.evalId, currentUserId);
                    
                    if (response && response.code === 1) {
                        evaluation.isUseful = response.data.isUseful;
                        evaluation.usefulCount = response.data.usefulCount;
                        console.log(`评价 ${evaluation.evalId} 有用状态:`, {
                            isUseful: evaluation.isUseful,
                            usefulCount: evaluation.usefulCount
                        });
                    }
                } catch (error) {
                    console.warn(`获取评价 ${evaluation.evalId} 有用状态失败:`, error);
                    // 如果获取失败，保持默认值
                    evaluation.isUseful = false;
                    evaluation.usefulCount = evaluation.usefulCount || 0;
                }
            }
            
            console.log('=== 有用状态加载完成 ===');
        },

        // 切换有用状态
        async toggleUseful(review) {
            try {
                review.usefulLoading = true
                
                console.log('=== 前端调用切换有用状态 ===')
                console.log('评价对象:', review)
                console.log('评价ID:', review.evalId)
                
                const currentUserId = this.getCurrentUserId()
                console.log('当前用户ID:', currentUserId)
                
                if (!currentUserId) {
                    this.$message.error('请先登录')
                    return
                }
                
                const response = await UnifiedEvaluationAPI.toggleUseful(review.evalId, currentUserId)
                
                console.log('前端收到响应:', response)
                
                if (response && response.code === 1) {
                    review.isUseful = response.data.isUseful
                    review.usefulCount = response.data.usefulCount
                    
                    this.$message.success(review.isUseful ? '已标记为有用' : '已取消有用标记')
                } else {
                    this.$message.error(response?.msg || '操作失败，请重试')
                }
            } catch (error) {
                console.error('切换有用状态失败:', error)
                console.error('错误响应数据:', error.response?.data)
                this.$message.error('操作失败，请重试')
            } finally {
                review.usefulLoading = false
            }
        },

        // 领取优惠券
        async claimCoupon(review) {
            try {
                const currentUserId = this.getCurrentUserId()
                
                if (!currentUserId) {
                    this.$message.error('请先登录')
                    return
                }
                
                const response = await UnifiedEvaluationAPI.claimCoupon(review.evalId, currentUserId)
                
                if (response && response.code === 1) {
                    review.couponClaimed = true
                    this.$message.success('优惠券领取成功！')
                } else {
                    this.$message.error(response?.msg || '领取失败，请重试')
                }
            } catch (error) {
                console.error('领取优惠券失败:', error)
                this.$message.error('领取失败，请重试')
            }
        },

    },
    computed: {
        // 过滤有效的评价数据
        validProductEvaluations() {
            return this.productEvaluations.filter(evaluation => 
                evaluation && 
                evaluation.evalId && 
                evaluation.userId &&
                evaluation.evalTime
            );
        },
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
                    // 使用 processImageUrl 处理图片URL
                    return this.processImageUrl(trimmedUrl, 'product');
                }).filter(url => url); // 过滤空字符串

                // 确保至少有4张图片
                while (images.length < 4) {
                    images.push(this.getDefaultImage('product'));
                }
                return images.slice(0, 4);
            } catch (error) {
                console.error('处理图片URL时出错:', error);
                return this.defaultImages;
            }
        },

        // 按天分组行程数据
        groupedItineraries() {
            const list = Array.isArray(this.dailyItineraries) ? this.dailyItineraries : [];
            if (list.length === 0) {
                return [];
            }

            // 按天分组
            const grouped = {};
            list.forEach(itinerary => {
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

.notice-main-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 30px;
    color: #333;
    text-align: center;
    position: relative;
}

.notice-main-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
}

.notice-row {
    margin-bottom: 20px;
}

.notice-card {
    height: 100%;
    transition: all 0.3s ease;
    border: 1px solid #e4e7ed;
}

.notice-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notice-card.full-width {
    margin-bottom: 0;
}

.notice-card .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
    /* background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); */
    /* border-bottom: 1px solid #e4e7ed; */
}

.notice-card .card-header i {
    font-size: 16px;
    /* color: #409eff; */
}

.notice-card .card-content {
    padding: 16px 0;
    line-height: 1.6;
    color: #666;
    font-size: 14px;
}

.notice-content-text {
    line-height: 1.8;
    color: #555;
    word-wrap: break-word;
    word-break: break-all;
}

/* 移除所有预订须知卡片的左侧竖线 */
.notice-card .card-header {
    border-left: none !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .notice-row {
        margin-bottom: 15px;
    }
    
    .notice-card {
        margin-bottom: 15px;
    }
    
    .notice-main-title {
        font-size: 20px;
        margin-bottom: 20px;
    }
    
    .notice-card .card-content {
        padding: 12px 0;
        font-size: 13px;
    }
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

.gallery-item:hover .gallery-overlay {
    opacity: 1;
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

/* 费用说明样式 */
.price-cards-container {
    margin-bottom: 20px;
}

.price-card {
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.price-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.price-card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.price-info {
    flex: 1;
}

.price-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 5px 0;
    color: #333;
}

.price-desc {
    font-size: 12px;
    color: #666;
    margin: 0;
}

.price-amount {
    text-align: right;
}

.price-symbol {
    font-size: 14px;
    color: #ff6b6b;
    margin-right: 2px;
}

.price-value {
    font-size: 24px;
    font-weight: 700;
    color: #ff6b6b;
}

/* 价格卡片主题色 */
.adult-price {
    border-left: 4px solid #409eff;
}

.child-price {
    border-left: 4px solid #67c23a;
}

.infant-price {
    border-left: 4px solid #e6a23c;
}

.supplement-price {
    border-left: 4px solid #f56c6c;
}

.price-notes-alert {
    margin-top: 20px;
}

/* 卡片样式 */
.include-card {
    border-left: 4px solid #67c23a;
}

.exclude-card {
    border-left: 4px solid #f56c6c;
}

.optional-card {
    border-left: 4px solid #e6a23c;
}

.payment-card {
    border-left: 4px solid #409eff;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
}

.card-header i {
    font-size: 16px;
}

.include-card .card-header i {
    color: #67c23a;
}

.exclude-card .card-header i {
    color: #f56c6c;
}

.optional-card .card-header i {
    color: #e6a23c;
}

.payment-card .card-header i {
    color: #409eff;
}

.card-content {
    line-height: 1.6;
    color: #666;
    font-size: 14px;
}

/* 退款政策样式 */
.refund-policy-container {
    margin-top: 20px;
}

.refund-table {
    margin-bottom: 20px;
}

.refund-alert {
    margin-top: 20px;
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

    .price-card-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .price-amount {
        text-align: left;
    }
}

/* 图片预览模态框样式 */
.image-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3000;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.preview-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
}

.preview-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.close-btn {
    background: #f56c6c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.close-btn:hover {
    background: #f78989;
}

.preview-body {
    padding: 20px;
    text-align: center;
}

.preview-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 4px;
}

.preview-footer {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding: 15px 20px;
    background: #f5f7fa;
    border-top: 1px solid #e4e7ed;
}

.nav-btn {
    padding: 8px 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: white;
    color: #606266;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
    border-color: #409eff;
    color: #409eff;
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 回复相关样式 */
.review-reply {
    background: #f8f9fa;
    border-left: 4px solid #409eff;
    padding: 16px;
    margin: 16px 0;
    border-radius: 0 8px 8px 0;
}

.reply-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.reply-header i {
    color: #409eff;
    font-size: 16px;
}

.reply-label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.reply-time {
    color: #999;
    font-size: 12px;
    margin-left: auto;
}

.reply-content {
    color: #666;
    line-height: 1.6;
    font-size: 14px;
}

/* 有用按钮激活状态 */
.action-btn.useful-active {
    color: #409eff !important;
    background: #ecf5ff;
}

.action-btn.useful-active i {
    color: #409eff;
}

/* 回复对话框样式 */
.reply-dialog-content {
    max-height: 60vh;
    overflow-y: auto;
}

.original-review {
    background: #f8f9fa;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
}

.review-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.user-avatar-small {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.user-info {
    flex: 1;
}

.user-info .user-name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.user-info .review-time {
    color: #999;
    font-size: 12px;
}

.review-content-preview {
    color: #666;
    line-height: 1.6;
    font-size: 14px;
    background: #fff;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
}

.reply-form {
    margin-top: 20px;
}

/* 优惠券按钮状态 */
.coupon-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .reply-dialog-content {
        max-height: 50vh;
    }
    
    .original-review {
        padding: 12px;
    }
    
    .review-user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .user-avatar-small {
        width: 28px;
        height: 28px;
    }
}
</style>