<template>
    <div>
        <div class="tour-guide-service">
            <!-- 导航按钮 -->
            <div class="nav-buttons">
                <el-button type="primary" v-if="!showDetail && !showMatchingResult" @click="activeMenu = 'list'">导游列表</el-button>
                <el-button type="success" v-if="!showDetail && !showMatchingResult" @click="activeMenu = 'request'">发起匹配需求</el-button>
                <el-button type="info" v-if="showDetail || showMatchingResult" @click="handleBack">返回</el-button>
            </div>

            <!-- 导游列表与筛选区域 -->
            <div v-if="activeMenu === 'list' && !showDetail && !showMatchingResult">
                <!-- 筛选条件 -->
                <el-card class="filter-card">
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-select v-model="filter.destination" placeholder="请选择目的地" clearable
                                @change="handleFilterChange">
                                <el-option v-for="city in destinations" :key="city.value" :label="city.label"
                                    :value="city.value"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="6">
                            <el-select v-model="filter.serviceType" placeholder="请选择服务类型" clearable
                                @change="handleFilterChange">
                                <el-option label="全程陪同" value="full-time"></el-option>
                                <el-option label="当地向导" value="local"></el-option>
                                <el-option label="翻译导游" value="translator"></el-option>
                                <el-option label="定制旅游" value="custom"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="6">
                            <el-select v-model="filter.minRating" placeholder="最低评分" clearable
                                @change="handleFilterChange">
                                <el-option label="不限" value="0"></el-option>
                                <el-option label="4分及以上" value="4"></el-option>
                                <el-option label="4.5分及以上" value="4.5"></el-option>
                                <el-option label="5分" value="5"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="6">
                            <el-input v-model="filter.keyword" placeholder="搜索导游姓名或专长" clearable
                                @change="handleFilterChange">
                                <el-button slot="append" icon="el-icon-search" @click="handleFilterChange"></el-button>
                            </el-input>
                        </el-col>
                    </el-row>
                </el-card>

                <!-- 导游列表 -->
                <el-row :gutter="20" class="guides-list">
                    <el-col :span="6" v-for="guide in filteredGuides" :key="guide.id" class="guide-card-item">
                        <el-card class="guide-card" hover-shadow @click.native="showGuideDetail(guide.id)">
                            <div slot="header" class="guide-header">
                                <div class="guide-avatar">
                                    <el-avatar :src="guide.avatar" size="large"></el-avatar>
                                </div>
                                <div class="guide-info">
                                    <h3>{{ guide.name }}</h3>
                                    <div class="guide-rating">
                                        <el-rate v-model="guide.rating" disabled :max="5" :precision="0.5"></el-rate>
                                        <span class="rating-value">{{ guide.rating }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="guide-details">
                                <p><i class="el-icon-map-marker"></i> {{ guide.mainDestination }}</p>
                                <p><i class="el-icon-briefcase"></i> {{ getServiceTypeText(guide.serviceType) }}</p>
                                <p><i class="el-icon-trophy"></i> 带团{{ guide.tourCount }}次</p>
                            </div>
                            <div class="guide-price">
                                <span class="price">¥{{ guide.pricePerDay }}<small>/天</small></span>
                                <el-button type="primary" size="small" class="view-detail-btn">查看详情</el-button>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <!-- 分页 -->
                <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-sizes="[4, 8, 12, 16]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="filteredGuides.length"></el-pagination>
            </div>

            <!-- 导游详情 -->
            <div v-if="showDetail">
                <el-card class="guide-detail-card">
                    <el-row :gutter="20">
                        <!-- 左侧基本信息 -->
                        <el-col :span="8">
                            <div class="guide-basic-info">
                                <el-avatar :src="currentGuide.avatar" size="xl"></el-avatar>
                                <h2>{{ currentGuide.name }}</h2>
                                <div class="detail-rating">
                                    <el-rate v-model="currentGuide.rating" disabled :max="5" :precision="0.5"></el-rate>
                                    <span class="rating-value">{{ currentGuide.rating }}</span>
                                    <span class="review-count">({{ currentGuide.reviewCount }}条评价)</span>
                                </div>

                                <div class="detail-info-item">
                                    <p><strong>主要服务地：</strong>{{ currentGuide.mainDestination }}</p>
                                    <p><strong>服务类型：</strong>{{ getServiceTypeText(currentGuide.serviceType) }}</p>
                                    <p><strong>带团次数：</strong>{{ currentGuide.tourCount }}次</p>
                                    <p><strong>价格：</strong>¥{{ currentGuide.pricePerDay }}/天</p>
                                    <p><strong>语言能力：</strong>{{ currentGuide.languages.join('、') }}</p>
                                </div>

                                <el-button type="primary" size="medium" class="book-now-btn"
                                    @click="startMatchingWithGuide(currentGuide.id)">
                                    立即预约
                                </el-button>
                            </div>
                        </el-col>

                        <!-- 右侧详情 -->
                        <el-col :span="16">
                            <el-tabs v-model="activeTab" type="border-card">
                                <el-tab-pane label="个人简介" name="profile">
                                    <div class="profile-content">
                                        <h3>自我介绍</h3>
                                        <p>{{ currentGuide.introduction }}</p>

                                        <h3 class="mt-4">专长领域</h3>
                                        <el-tag v-for="specialty in currentGuide.specialties" :key="specialty"
                                            class="specialty-tag">
                                            {{ specialty }}
                                        </el-tag>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="资质证书" name="certificates">
                                    <div class="certificates">
                                        <el-row :gutter="15">
                                            <el-col :span="8" v-for="cert in currentGuide.certificates" :key="cert.id">
                                                <el-card class="cert-card">
                                                    <img :src="cert.image" :alt="cert.name" class="cert-image">
                                                    <div class="cert-info">
                                                        <h4>{{ cert.name }}</h4>
                                                        <p>获得时间：{{ cert.issueDate }}</p>
                                                    </div>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="带团案例" name="cases">
                                    <div class="tour-cases">
                                        <el-collapse>
                                            <el-collapse-item v-for="caseItem in currentGuide.tourCases"
                                                :key="caseItem.id"
                                                :title="`${caseItem.destination} · ${caseItem.duration}天 · ${caseItem.date}`">
                                                <div class="case-content">
                                                    <p>{{ caseItem.description }}</p>
                                                    <el-image v-for="img in caseItem.images" :key="img" :src="img"
                                                        :alt="caseItem.destination" class="case-image"></el-image>
                                                </div>
                                            </el-collapse-item>
                                        </el-collapse>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="游客评价" name="reviews">
                                    <div class="reviews">
                                        <el-rate v-model="averageRating" disabled :max="5" :precision="0.5"
                                            class="average-rating"></el-rate>
                                        <span class="average-rating-value">{{ averageRating }}</span>
                                        <span class="total-reviews">(共{{ currentGuide.reviewCount }}条评价)</span>

                                        <el-divider></el-divider>

                                        <div class="review-item" v-for="review in currentGuide.reviews"
                                            :key="review.id">
                                            <div class="review-header">
                                                <el-avatar :src="review.userAvatar" size="small"></el-avatar>
                                                <span class="review-user">{{ review.userName }}</span>
                                                <el-rate v-model="review.rating" disabled :max="5" :precision="0.5"
                                                    class="review-rating"></el-rate>
                                                <span class="review-date">{{ review.date }}</span>
                                            </div>
                                            <p class="review-content">{{ review.content }}</p>
                                            <el-image v-for="img in review.images" :key="img" :src="img"
                                                :alt="`用户评价图片${img}`" class="review-image"></el-image>
                                        </div>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </el-col>
                    </el-row>
                </el-card>
            </div>

            <!-- 发起匹配需求 -->
            <div v-if="activeMenu === 'request' && !showDetail && !showMatchingResult">
                <el-card class="matching-request-card">
                    <h2>发起导游匹配需求</h2>
                    <el-form :model="matchingRequest" :rules="requestRules" ref="requestForm" label-width="120px">
                        <el-form-item label="目的地" prop="destination">
                            <el-select v-model="matchingRequest.destination" placeholder="请选择目的地" clearable>
                                <el-option v-for="city in destinations" :key="city.value" :label="city.label"
                                    :value="city.value"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="出行日期" prop="startDate">
                            <el-date-picker v-model="matchingRequest.startDate" type="date" placeholder="选择开始日期"
                                :picker-options="startDateOptions"></el-date-picker>
                        </el-form-item>

                        <el-form-item label="结束日期" prop="endDate">
                            <el-date-picker v-model="matchingRequest.endDate" type="date" placeholder="选择结束日期"
                                :picker-options="endDateOptions"></el-date-picker>
                        </el-form-item>

                        <el-form-item label="旅行人数" prop="travelers">
                            <el-input-number v-model="matchingRequest.travelers" :min="1" :max="50"
                                label="人数"></el-input-number>
                        </el-form-item>

                        <el-form-item label="服务类型" prop="serviceType">
                            <el-checkbox-group v-model="matchingRequest.serviceType">
                                <el-checkbox label="full-time" name="type">全程陪同</el-checkbox>
                                <el-checkbox label="local" name="type">当地向导</el-checkbox>
                                <el-checkbox label="translator" name="type">翻译导游</el-checkbox>
                                <el-checkbox label="custom" name="type">定制旅游</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-form-item label="预算范围(元/天)" prop="budget">
                            <el-slider v-model="matchingRequest.budget" :min="200" :max="2000" :step="100"
                                show-input></el-slider>
                        </el-form-item>

                        <el-form-item label="语言需求">
                            <el-checkbox-group v-model="matchingRequest.languages">
                                <el-checkbox label="中文" name="language"></el-checkbox>
                                <el-checkbox label="英语" name="language"></el-checkbox>
                                <el-checkbox label="日语" name="language"></el-checkbox>
                                <el-checkbox label="韩语" name="language"></el-checkbox>
                                <el-checkbox label="法语" name="language"></el-checkbox>
                                <el-checkbox label="西班牙语" name="language"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-form-item label="特殊需求" prop="specialRequirements">
                            <el-input v-model="matchingRequest.specialRequirements" type="textarea" :rows="4"
                                placeholder="请描述您的特殊需求，如景点偏好、饮食禁忌等"></el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="submitMatchingRequest">提交匹配请求</el-button>
                            <el-button @click="resetForm('requestForm')">重置</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </div>

            <!-- 匹配结果与支付 -->
            <div v-if="showMatchingResult">
                <el-card class="matching-result-card">
                    <h2>为您匹配到的导游</h2>

                    <div class="result-guide-card" v-if="matchingResult.guide">
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-avatar :src="matchingResult.guide.avatar" size="large"></el-avatar>
                                <div class="result-guide-info">
                                    <h3>{{ matchingResult.guide.name }}</h3>
                                    <div class="result-rating">
                                        <el-rate v-model="matchingResult.guide.rating" disabled :max="5"
                                            :precision="0.5"></el-rate>
                                        <span>{{ matchingResult.guide.rating }}</span>
                                    </div>
                                    <p>¥{{ matchingResult.guide.pricePerDay }}/天</p>
                                </div>
                            </el-col>

                            <el-col :span="18">
                                <div class="matching-details">
                                    <h4>匹配详情</h4>
                                    <el-descriptions column="1" border>
                                        <el-descriptions-item label="服务日期">{{ formatDate(matchingRequest.startDate) }} 至
                                            {{ formatDate(matchingRequest.endDate) }}</el-descriptions-item>
                                        <el-descriptions-item label="服务天数">{{ calculateDays() }}天</el-descriptions-item>
                                        <el-descriptions-item label="旅行人数">{{ matchingRequest.travelers
                                            }}人</el-descriptions-item>
                                        <el-descriptions-item label="服务类型">{{matchingRequest.serviceType.map(type =>
                                            getServiceTypeText(type)).join('、')}}</el-descriptions-item>
                                        <el-descriptions-item label="总价估算">¥{{ calculateTotalPrice()
                                            }}</el-descriptions-item>
                                        <el-descriptions-item label="定金金额">¥{{ calculateDeposit() }}
                                            (总价的30%)</el-descriptions-item>
                                    </el-descriptions>
                                </div>
                            </el-col>
                        </el-row>

                        <el-divider></el-divider>

                        <div class="payment-section">
                            <h4>支付定金</h4>
                            <el-radio-group v-model="paymentMethod" class="payment-methods">
                                <el-radio label="alipay">
                                    <i class="el-icon-alipay"></i> 支付宝
                                </el-radio>
                                <el-radio label="wechat">
                                    <i class="el-icon-wechat"></i> 微信支付
                                </el-radio>
                                <el-radio label="creditcard">
                                    <i class="el-icon-credit-card"></i> 银行卡
                                </el-radio>
                            </el-radio-group>

                            <div class="payment-actions">
                                <el-button type="primary" size="large" @click="confirmPayment">
                                    确认支付 ¥{{ calculateDeposit() }}
                                </el-button>
                                <el-button type="info" @click="chooseOtherGuide">
                                    选择其他导游
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <div v-else>
                        <el-empty description="暂无匹配的导游，请修改您的需求条件"></el-empty>
                        <el-button type="primary" @click="handleBack" style="margin-top: 20px;">
                            修改需求
                        </el-button>
                    </div>
                </el-card>
            </div>

            <!-- 支付成功提示 -->
            <el-dialog title="支付成功" :visible.sync="paymentSuccess" :show-close="false" width="30%">
                <div class="success-message">
                    <i class="el-icon-success success-icon"></i>
                    <p>恭喜您，定金支付成功！</p>
                    <p>导游将在24小时内与您联系确认行程</p>
                    <p>订单编号：{{ orderNumber }}</p>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="paymentSuccess = false; handleBackToHome()">完成</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
export default {
    name: 'guidesAbout',
    data() {
        return {
            // 菜单状态
            activeMenu: 'list',
            showDetail: false,
            showMatchingResult: false,

            // 筛选条件
            filter: {
                destination: '',
                serviceType: '',
                minRating: 0,
                keyword: ''
            },

            // 分页
            currentPage: 1,
            pageSize: 4,

            // 目的地列表
            destinations: [
                { label: '北京', value: 'beijing' },
                { label: '上海', value: 'shanghai' },
                { label: '广州', value: 'guangzhou' },
                { label: '深圳', value: 'shenzhen' },
                { label: '成都', value: 'chengdu' },
                { label: '杭州', value: 'hangzhou' },
                { label: '西安', value: 'xian' },
                { label: '三亚', value: 'sanya' }
            ],

            // 导游列表数据
            guides: [
                {
                    id: 1,
                    name: '张明',
                    avatar: 'https://picsum.photos/id/1012/200/200',
                    rating: 4.8,
                    reviewCount: 126,
                    mainDestination: '北京',
                    serviceType: 'full-time',
                    tourCount: 156,
                    pricePerDay: 800,
                    languages: ['中文', '英语'],
                    introduction: '从事导游工作8年，熟悉北京所有景点和历史文化，性格开朗，服务热情，善于讲解历史故事，让您的北京之旅更加生动有趣。',
                    specialties: ['历史讲解', '文化体验', '美食推荐'],
                    certificates: [
                        { id: 1, name: '高级导游证', image: 'https://picsum.photos/id/20/300/200', issueDate: '2016-05-10' },
                        { id: 2, name: '英语导游证', image: 'https://picsum.photos/id/21/300/200', issueDate: '2015-03-15' }
                    ],
                    tourCases: [
                        {
                            id: 1,
                            destination: '北京5日游',
                            duration: 5,
                            date: '2023-05-10',
                            description: '带团游览故宫、长城、颐和园等著名景点，安排了特色烤鸭晚宴和京剧表演，游客反馈非常满意。',
                            images: ['https://picsum.photos/id/42/400/300', 'https://picsum.photos/id/43/400/300']
                        }
                    ],
                    reviews: [
                        {
                            id: 1,
                            userName: '李游客',
                            userAvatar: 'https://picsum.photos/id/1005/100/100',
                            rating: 5,
                            date: '2023-06-15',
                            content: '张导游非常专业，讲解详细生动，行程安排合理，推荐的餐厅也很美味，下次来北京还会找他！',
                            images: ['https://picsum.photos/id/65/200/200']
                        }
                    ]
                },
                {
                    id: 2,
                    name: '李娜',
                    avatar: 'https://picsum.photos/id/1027/200/200',
                    rating: 4.9,
                    reviewCount: 98,
                    mainDestination: '上海',
                    serviceType: 'local',
                    tourCount: 124,
                    pricePerDay: 750,
                    languages: ['中文', '英语', '日语'],
                    introduction: '上海本地导游，熟悉上海的历史与现代文化，擅长带游客体验上海的弄堂文化和现代都市风情，美食推荐是我的强项。',
                    specialties: ['都市观光', '美食探索', '摄影指导'],
                    certificates: [
                        { id: 1, name: '中级导游证', image: 'https://picsum.photos/id/22/300/200', issueDate: '2017-08-22' },
                        { id: 2, name: '日语导游证', image: 'https://picsum.photos/id/23/300/200', issueDate: '2018-04-10' }
                    ],
                    tourCases: [],
                    reviews: []
                },
                {
                    id: 3,
                    name: '王强',
                    avatar: 'https://picsum.photos/id/1074/200/200',
                    rating: 4.7,
                    reviewCount: 85,
                    mainDestination: '成都',
                    serviceType: 'custom',
                    tourCount: 96,
                    pricePerDay: 900,
                    languages: ['中文', '英语', '西班牙语'],
                    introduction: '专注于定制旅游服务，可根据游客需求量身打造独特的旅行体验，尤其擅长四川深度游和美食之旅。',
                    specialties: ['定制行程', '美食之旅', '摄影指导'],
                    certificates: [],
                    tourCases: [],
                    reviews: []
                },
                {
                    id: 4,
                    name: '刘芳',
                    avatar: 'https://picsum.photos/id/1062/200/200',
                    rating: 4.6,
                    reviewCount: 76,
                    mainDestination: '三亚',
                    serviceType: 'local',
                    tourCount: 112,
                    pricePerDay: 850,
                    languages: ['中文', '英语', '俄语'],
                    introduction: '三亚本地导游，熟悉各个海滩和景点，了解最佳游览时间，能帮助游客避开人群，享受完美假期。',
                    specialties: ['海岛游', '水上活动', '酒店推荐'],
                    certificates: [],
                    tourCases: [],
                    reviews: []
                },
                {
                    id: 5,
                    name: '赵伟',
                    avatar: 'https://picsum.photos/id/1025/200/200',
                    rating: 4.5,
                    reviewCount: 63,
                    mainDestination: '西安',
                    serviceType: 'full-time',
                    tourCount: 89,
                    pricePerDay: 700,
                    languages: ['中文', '英语', '法语'],
                    introduction: '历史专业毕业，对西安的历史文化有深入研究，能为游客提供专业的历史讲解，让您深入了解十三朝古都的魅力。',
                    specialties: ['历史讲解', '文化体验', '考古知识'],
                    certificates: [],
                    tourCases: [],
                    reviews: []
                }
            ],

            // 当前选中的导游
            currentGuide: {},

            // 匹配需求表单
            matchingRequest: {
                destination: '',
                startDate: '',
                endDate: '',
                travelers: 1,
                serviceType: [],
                budget: 500,
                languages: ['中文'],
                specialRequirements: '',
                guideId: null // 用于直接预约特定导游
            },

            // 表单验证规则
            requestRules: {
                destination: [
                    { required: true, message: '请选择目的地', trigger: 'change' }
                ],
                startDate: [
                    { required: true, message: '请选择开始日期', trigger: 'change' }
                ],
                endDate: [
                    { required: true, message: '请选择结束日期', trigger: 'change' }
                ],
                travelers: [
                    { required: true, message: '请填写旅行人数', trigger: 'blur' }
                ],
                serviceType: [
                    { required: true, message: '请至少选择一种服务类型', trigger: 'change' }
                ],
                specialRequirements: [
                    { max: 500, message: '特殊需求不能超过500个字符', trigger: 'blur' }
                ]
            },

            // 日期选择器选项
            startDateOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7;
                }
            },

            // 匹配结果
            matchingResult: {
                guide: null
            },

            // 支付相关
            paymentMethod: 'alipay',
            paymentSuccess: false,
            orderNumber: '',

            // 标签页状态
            activeTab: 'profile',
            averageRating: 0
        };
    },
    computed: {
        // 筛选后的导游列表
        filteredGuides() {
            return this.guides.filter(guide => {
                // 目的地筛选
                if (this.filter.destination && guide.mainDestination !== this.getDestinationLabel(this.filter.destination)) {
                    return false;
                }

                // 服务类型筛选
                if (this.filter.serviceType && guide.serviceType !== this.filter.serviceType) {
                    return false;
                }

                // 评分筛选
                if (this.filter.minRating && guide.rating < this.filter.minRating) {
                    return false;
                }

                // 关键词搜索
                if (this.filter.keyword) {
                    const keyword = this.filter.keyword.toLowerCase();
                    if (!guide.name.toLowerCase().includes(keyword) &&
                        !guide.specialties.some(s => s.toLowerCase().includes(keyword))) {
                        return false;
                    }
                }

                return true;
            });
        }
    },
    watch: {
        // 当显示导游详情时，计算平均评分
        showDetail(newVal) {
            if (newVal && this.currentGuide.reviews && this.currentGuide.reviews.length > 0) {
                const sum = this.currentGuide.reviews.reduce((total, review) => total + review.rating, 0);
                this.averageRating = (sum / this.currentGuide.reviews.length).toFixed(1) * 1;
            }
        }
    },
    methods: {
        // 菜单选择处理
        handleMenuSelect(key) {
            this.activeMenu = key;
        },

        // 返回处理
        handleBack() {
            if (this.showDetail) {
                this.showDetail = false;
                this.activeMenu = 'list'; // 返回后显示导游列表
            } else if (this.showMatchingResult) {
                this.showMatchingResult = false;
                this.activeMenu = 'list'; // 返回后显示导游列表
            }
        },

        // 返回首页
        handleBackToHome() {
            this.showMatchingResult = false;
            this.activeMenu = 'list';
        },

        // 筛选条件变化
        handleFilterChange() {
            this.currentPage = 1; // 重置到第一页
        },

        // 分页处理
        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
        },
        handleCurrentChange(val) {
            this.currentPage = val;
        },

        // 显示导游详情
        showGuideDetail(id) {
            this.currentGuide = this.guides.find(guide => guide.id === id) || {};
            this.showDetail = true;
        },

        // 获取服务类型文本
        getServiceTypeText(type) {
            const typeMap = {
                'full-time': '全程陪同',
                'local': '当地向导',
                'translator': '翻译导游',
                'custom': '定制旅游'
            };
            return typeMap[type] || type;
        },

        // 获取目的地标签
        getDestinationLabel(value) {
            const city = this.destinations.find(item => item.value === value);
            return city ? city.label : '';
        },

        // 开始与特定导游匹配
        startMatchingWithGuide(guideId) {
            this.matchingRequest.guideId = guideId;
            this.activeMenu = 'request';
            // 自动填充目的地
            const guide = this.guides.find(g => g.id === guideId);
            if (guide) {
                const dest = this.destinations.find(d => d.label === guide.mainDestination);
                if (dest) {
                    this.matchingRequest.destination = dest.value;
                }
                this.matchingRequest.serviceType = [guide.serviceType];
            }
        },

        // 提交匹配请求
        submitMatchingRequest() {
            this.$refs.requestForm.validate(valid => {
                if (valid) {
                    // 检查日期是否有效
                    if (this.matchingRequest.startDate && this.matchingRequest.endDate &&
                        new Date(this.matchingRequest.startDate) > new Date(this.matchingRequest.endDate)) {
                        this.$message.error('结束日期不能早于开始日期');
                        return;
                    }

                    // 模拟匹配过程
                    this.$message.loading('正在为您匹配最合适的导游...', 1.5);

                    setTimeout(() => {
                        // 如果指定了导游ID，则直接匹配该导游
                        let matchedGuide = null;
                        if (this.matchingRequest.guideId) {
                            matchedGuide = this.guides.find(g => g.id === this.matchingRequest.guideId);
                        } else {
                            // 简单匹配逻辑：匹配目的地和服务类型
                            matchedGuide = this.guides.find(guide => {
                                const destMatch = guide.mainDestination === this.getDestinationLabel(this.matchingRequest.destination);
                                const serviceMatch = this.matchingRequest.serviceType.includes(guide.serviceType);
                                return destMatch && serviceMatch;
                            });
                        }

                        this.matchingResult.guide = matchedGuide;
                        this.showMatchingResult = true;
                    }, 1500);
                }
            });
        },

        // 重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.matchingRequest.languages = ['中文'];
            this.matchingRequest.guideId = null;
        },

        // 格式化日期
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())}`;
        },

        // 数字补零
        padZero(num) {
            return num < 10 ? `0${num}` : num;
        },

        // 计算天数
        calculateDays() {
            if (!this.matchingRequest.startDate || !this.matchingRequest.endDate) return 0;
            const start = new Date(this.matchingRequest.startDate);
            const end = new Date(this.matchingRequest.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return days;
        },

        // 计算总价
        calculateTotalPrice() {
            if (!this.matchingResult.guide) return 0;
            return this.matchingResult.guide.pricePerDay * this.calculateDays();
        },

        // 计算定金（总价的30%）
        calculateDeposit() {
            return Math.ceil(this.calculateTotalPrice() * 0.3);
        },

        // 确认支付
        confirmPayment() {
            // 模拟支付过程
            this.$message.loading('正在处理支付...', 1.5);

            setTimeout(() => {
                // 生成订单号
                this.orderNumber = 'ORD' + Date.now();
                this.paymentSuccess = true;
            }, 1500);
        },

        // 选择其他导游
        chooseOtherGuide() {
            // 清除指定的导游ID，重新匹配
            this.matchingRequest.guideId = null;
            this.submitMatchingRequest();
        },

        // 结束日期选择限制
        endDateOptions() {
            return {
                disabledDate: (time) => {
                    if (!this.matchingRequest.startDate) {
                        return time.getTime() < Date.now() - 8.64e7;
                    }
                    return time.getTime() < new Date(this.matchingRequest.startDate).getTime() - 8.64e7;
                }
            };
        }
    }
}
</script>

<style scoped>
.tour-guide-service {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.nav-buttons {
    margin-bottom: 20px;
    text-align: left;
}

.nav-buttons .el-button {
    margin-right: 10px;
}

.filter-card {
    margin-bottom: 20px;
    padding: 15px;
}

.guides-list {
    margin-bottom: 30px;
}

.guide-card-item {
    margin-bottom: 20px;
}

.guide-card {
    height: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.guide-card:hover {
    transform: translateY(-5px);
}

.guide-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.guide-avatar {
    margin-right: 15px;
}

.guide-info h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
}

.guide-rating {
    display: flex;
    align-items: center;
}

.rating-value {
    margin-left: 5px;
    font-size: 14px;
    color: #f5a623;
}

.guide-details p {
    margin: 5px 0;
    font-size: 13px;
    color: #666;
}

.guide-details i {
    margin-right: 5px;
    color: #409eff;
}

.guide-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #eee;
}

.price {
    font-size: 18px;
    color: #f56c6c;
    font-weight: bold;
}

.price small {
    font-size: 12px;
    font-weight: normal;
}

.pagination {
    text-align: center;
    margin-top: 20px;
}

/* 导游详情 */
.guide-detail-card {
    padding: 20px;
}

.guide-basic-info {
    text-align: center;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.guide-basic-info .el-avatar {
    margin-bottom: 15px;
}

.detail-rating {
    margin: 10px 0 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.review-count {
    margin-left: 10px;
    color: #666;
    font-size: 14px;
}

.detail-info-item {
    text-align: left;
    margin-bottom: 20px;
}

.detail-info-item p {
    margin: 10px 0;
}

.book-now-btn {
    width: 100%;
}

.profile-content {
    padding: 10px;
}

.specialty-tag {
    margin: 5px;
}

.certificates {
    padding: 10px;
}

.cert-card {
    margin-bottom: 15px;
}

.cert-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
}

.cert-info {
    padding: 10px 0;
}

.tour-cases {
    padding: 10px;
}

.case-content {
    padding: 10px;
}

.case-image {
    width: 100px;
    height: 100px;
    margin: 10px 10px 0 0;
    border-radius: 4px;
}

.reviews {
    padding: 10px;
}

.average-rating {
    font-size: 24px;
}

.average-rating-value {
    font-size: 24px;
    margin: 0 10px;
    color: #f5a623;
}

.total-reviews {
    color: #666;
}

.review-item {
    padding: 15px 0;
    border-bottom: 1px solid #eee;
}

.review-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.review-user {
    margin: 0 10px;
    font-weight: 500;
}

.review-rating {
    margin-right: 10px;
}

.review-date {
    margin-left: auto;
    color: #999;
    font-size: 12px;
}

.review-content {
    margin-bottom: 10px;
}

.review-image {
    width: 80px;
    height: 80px;
    margin: 0 10px 10px 0;
    border-radius: 4px;
}

/* 匹配需求表单 */
.matching-request-card {
    padding: 20px;
}

.matching-request-card h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
}

/* 匹配结果 */
.matching-result-card {
    padding: 20px;
}

.result-guide-card {
    margin-top: 20px;
}

.result-guide-info {
    margin-top: 15px;
    text-align: center;
}

.result-guide-info h3 {
    margin: 0 0 10px 0;
}

.result-rating {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.result-rating span {
    margin-left: 5px;
    color: #f5a623;
}

.matching-details {
    margin-top: 15px;
}

.payment-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.payment-methods {
    margin: 20px 0;
}

.payment-methods .el-radio {
    margin-right: 20px;
    font-size: 16px;
}

.payment-methods i {
    font-size: 20px;
    margin-right: 5px;
}

.el-icon-alipay {
    color: #1677ff;
}

.el-icon-wechat {
    color: #07c160;
}

.payment-actions {
    margin-top: 30px;
    text-align: right;
}

.payment-actions .el-button {
    margin-left: 10px;
}

/* 支付成功提示 */
.success-message {
    text-align: center;
    padding: 20px 0;
}

.success-icon {
    font-size: 50px;
    color: #67c23a;
    margin-bottom: 20px;
}

.success-message p {
    margin: 10px 0;
}
</style>