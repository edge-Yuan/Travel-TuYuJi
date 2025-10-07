<template>
    <div>
        <div class="tour-guide-service">
            <div class="nav-buttons">
                <el-button type="primary" v-if="!showDetail && !showMatchingResult" @click="activeMenu = 'list'">导游列表</el-button>
                <el-button type="success" v-if="!showDetail && !showMatchingResult" @click="activeMenu = 'request'">发起匹配需求</el-button>
                <el-button type="info" v-if="showDetail || showMatchingResult" @click="handleBack">返回</el-button>
            </div>

            <div v-if="activeMenu === 'list' && !showDetail && !showMatchingResult">
                <el-card class="filter-card">
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-select v-model="filter.destination" placeholder="请选择目的地" clearable @change="handleFilterChange">
                                <el-option v-for="city in destinations" :key="city.value" :label="city.label" :value="city.value"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="6">
                            <el-input v-model="filter.keyword" placeholder="搜索导游姓名或专长" clearable @change="handleFilterChange">
                                <el-button slot="append" icon="el-icon-search" @click="handleFilterChange"></el-button>
                            </el-input>
                        </el-col>
                        <el-col :span="12" class="text-right">
                            <el-button type="primary" @click="loadGuides">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>

                <!-- 骨架屏 -->
                <div v-if="loading" class="skeleton-container">
                    <el-row :gutter="20" class="guides-list">
                        <el-col :span="12" v-for="n in 4" :key="n" class="guide-card-item">
                            <el-card class="guide-card" shadow="hover">
                                <el-skeleton :rows="4" animated />
                            </el-card>
                        </el-col>
                    </el-row>
                </div>

                <el-row :gutter="20" class="guides-list" v-else>
                    <el-col :span="12" v-for="guide in pagedGuides" :key="guide.guideId" class="guide-card-item">
                        <el-card class="guide-card" shadow="hover">
                            <div class="guide-card-content">
                                <div class="guide-avatar">
                                    <el-avatar :size="88" :src="guide.avatar || guide.headImg || 'https://picsum.photos/seed/guide/120/120'" />
                                </div>
                                <div class="guide-middle">
                                    <div class="name-row">
                                        <h3 class="guide-name">{{ guide.realName || '匿名导游' }}</h3>
                                    </div>
                                    <div class="lang-row" v-if="guide.serviceLang">
                                        <el-tag v-for="(l,idx) in formatServiceLang(guide.serviceLang).split('、')" :key="idx" size="mini" type="info" effect="plain">{{ l }}</el-tag>
                                    </div>
                                    <div class="loc-row">
                                        <i class="el-icon-location-outline"></i>
                                        <span>{{ guide.location || guide.goodAtArea || '未知地区' }}</span>
                                    </div>
                                    <div class="rate-row">
                                        <el-rate :value="toNumber(guide.serviceScore)" disabled :max="5" :allow-half="true"></el-rate>
                                        <span class="rating-value">{{ toNumber(guide.serviceScore).toFixed(1) }}</span>
                                    </div>
                                </div>
                                <div class="guide-right">
                                    <div class="price">¥{{ guide.baseFee || 0 }}<small>/天</small></div>
                                    <div class="actions">
                                        <el-button type="primary" size="small" @click="startMatchingWithGuide(guide.guideId)">预订</el-button>
                                        <el-button size="small" plain @click="showGuideDetail(guide.guideId)">查看详情</el-button>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-sizes="[4, 8, 12, 16]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="filteredGuides.length"></el-pagination>
            </div>

            <div v-if="showDetail">
                <el-card class="guide-detail-card">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <div class="guide-basic-info">
                                <h2>{{ currentGuide.realName || '匿名导游' }}</h2>
                                <div class="detail-rating">
                                    <el-rate :value="toNumber(currentGuide.serviceScore)" disabled :max="5" :allow-half="true"></el-rate>
                                    <span class="rating-value">{{ toNumber(currentGuide.serviceScore).toFixed(1) }}</span>
                                </div>
                                <div class="detail-info-item">
                                    <p><strong>主要服务地：</strong>{{ currentGuide.location || currentGuide.goodAtArea || '-' }}</p>
                                    <p><strong>服务语言：</strong>{{ formatServiceLang(currentGuide.serviceLang) }}</p>
                                    <p><strong>基础服务费：</strong>¥{{ currentGuide.baseFee || 0 }}</p>
                                </div>
                                <el-button type="primary" size="medium" class="book-now-btn" @click="startMatchingWithGuide(currentGuide.guideId)">立即预约</el-button>
                            </div>
                        </el-col>
                        <el-col :span="16">
                            <el-descriptions title="导游信息" :column="2" border>
                                <el-descriptions-item label="导游证号">{{ currentGuide.guideCard || '-' }}</el-descriptions-item>
                                <el-descriptions-item label="手机号">{{ currentGuide.phone || '-' }}</el-descriptions-item>
                                <el-descriptions-item label="资质状态">{{ getQualificationText(currentGuide.qualificationStatus) }}</el-descriptions-item>
                                <el-descriptions-item label="节假日加价比例">{{ currentGuide.holidayFeeRate || 0 }}</el-descriptions-item>
                            </el-descriptions>
                        </el-col>
                    </el-row>
                </el-card>
            </div>

            <div v-if="activeMenu === 'request' && !showDetail && !showMatchingResult">
                <el-card class="matching-request-card">
                    <h2>发起导游匹配需求</h2>
                    <el-form :model="matchingRequest" :rules="requestRules" ref="requestForm" label-width="120px">
                        <el-form-item label="目的地" prop="destination">
                            <el-input v-model="matchingRequest.destination" placeholder="请输入目的地(与后端保持一致)" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="出行日期" prop="startDate">
                            <el-date-picker v-model="matchingRequest.startDate" type="date" placeholder="选择开始日期" :picker-options="startDateOptions"></el-date-picker>
                        </el-form-item>
                        <el-form-item label="结束日期" prop="endDate">
                            <el-date-picker v-model="matchingRequest.endDate" type="date" placeholder="选择结束日期" :picker-options="endDateOptions"></el-date-picker>
                        </el-form-item>
                        <el-form-item label="旅行人数" prop="travelers">
                            <el-input-number v-model="matchingRequest.travelers" :min="1" :max="50" label="人数"></el-input-number>
                        </el-form-item>
                        <el-form-item label="预算(元/天)">
                            <el-input-number v-model="matchingRequest.budget" :min="0" :step="100"></el-input-number>
                        </el-form-item>
                        <el-form-item label="特殊需求" prop="specialRequirements">
                            <el-input v-model="matchingRequest.specialRequirements" type="textarea" :rows="4" placeholder="请描述您的特殊需求"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitMatchingRequest">提交匹配请求</el-button>
                            <el-button @click="resetForm('requestForm')">重置</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </div>

            <div v-if="showMatchingResult">
                <el-card class="matching-result-card">
                    <h2>为您匹配到的导游</h2>
                    <div class="result-guide-card" v-if="matchingResult.guide">
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <div class="result-guide-info">
                                    <h3>{{ matchingResult.guide.realName }}</h3>
                                    <div class="result-rating">
                                        <el-rate :value="toNumber(matchingResult.guide.serviceScore)" disabled :max="5" :allow-half="true"></el-rate>
                                        <span>{{ toNumber(matchingResult.guide.serviceScore).toFixed(1) }}</span>
                                    </div>
                                    <p>¥{{ matchingResult.guide.baseFee }}/天</p>
                                </div>
                            </el-col>
                            <el-col :span="16">
                                <div class="matching-details">
                                    <el-descriptions column="1" border>
                                        <el-descriptions-item label="服务日期">{{ formatDate(matchingRequest.startDate) }} 至 {{ formatDate(matchingRequest.endDate) }}</el-descriptions-item>
                                        <el-descriptions-item label="服务天数">{{ calculateDays() }}天</el-descriptions-item>
                                        <el-descriptions-item label="旅行人数">{{ matchingRequest.travelers }}人</el-descriptions-item>
                                        <el-descriptions-item label="总价估算">¥{{ calculateTotalPrice() }}</el-descriptions-item>
                                        <el-descriptions-item label="定金金额">¥{{ calculateDeposit() }} (总价的30%)</el-descriptions-item>
                                    </el-descriptions>
                                </div>
                            </el-col>
                        </el-row>
                        <el-divider></el-divider>
                        <div class="payment-section">
                            <h4>支付定金</h4>
                            <el-radio-group v-model="paymentMethod" class="payment-methods">
                                <el-radio label="alipay">支付宝</el-radio>
                                <el-radio label="wechat">微信支付</el-radio>
                            </el-radio-group>
                            <div class="payment-actions">
                                <el-button type="primary" size="large" @click="confirmPayment">确认支付 ¥{{ calculateDeposit() }}</el-button>
                                <el-button type="info" @click="chooseOtherGuide">选择其他导游</el-button>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <el-empty description="暂无匹配的导游，请修改您的需求条件"></el-empty>
                        <el-button type="primary" @click="handleBack" style="margin-top: 20px;">修改需求</el-button>
                    </div>
                </el-card>
            </div>

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
import request from '@/utils/request'
export default {
    name: 'guidesAbout',
    data() {
        return {
            activeMenu: 'list',
            showDetail: false,
            showMatchingResult: false,
            currentUserId: null,
            loading: false,
            filter: { destination: '', keyword: '' },
            currentPage: 1,
            pageSize: 4,
            destinations: [
                { label: '北京', value: '北京' },
                { label: '上海', value: '上海' },
                { label: '广州', value: '广州' },
                { label: '深圳', value: '深圳' },
                { label: '成都', value: '成都' },
                { label: '杭州', value: '杭州' },
                { label: '西安', value: '西安' },
                { label: '三亚', value: '三亚' }
            ],
            guides: [],
            currentGuide: {},
            matchingRequest: {
                destination: '',
                startDate: '',
                endDate: '',
                travelers: 1,
                budget: 500,
                specialRequirements: '',
                guideId: null
            },
            requestRules: {
                destination: [{ required: true, message: '请填写目的地', trigger: 'blur' }],
                startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
                endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
                travelers: [{ required: true, message: '请填写旅行人数', trigger: 'blur' }],
                specialRequirements: [{ max: 500, message: '特殊需求不能超过500个字符', trigger: 'blur' }]
            },
            startDateOptions: { disabledDate: (time) => time.getTime() < Date.now() - 8.64e7 },
            matchingResult: { guide: null },
            paymentMethod: 'alipay',
            paymentSuccess: false,
            orderNumber: ''
        };
    },
    computed: {
        filteredGuides() {
            return this.guides.filter(g => {
                if (this.filter.destination && !(g.location?.includes(this.filter.destination) || g.goodAtArea?.includes(this.filter.destination))) return false;
                if (this.filter.keyword) {
                    const k = this.filter.keyword.toLowerCase();
                    const fields = [g.realName, g.location, g.goodAtArea, g.serviceLang].filter(Boolean).join(' ').toLowerCase();
                    if (!fields.includes(k)) return false;
                }
                return true;
            });
        },
        pagedGuides() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.filteredGuides.slice(start, start + this.pageSize);
        },
        endDateOptions() {
            return {
                disabledDate: (time) => {
                    if (!this.matchingRequest.startDate) return time.getTime() < Date.now() - 8.64e7;
                    return time.getTime() < new Date(this.matchingRequest.startDate).getTime() - 8.64e7;
                }
            };
        }
    },
    mounted() {
        this.initUserId();
        // 列表不依赖登录，始终可加载
        this.loadGuides();
    },
    methods: {
        initUserId() {
            try {
                const tryParse = (val) => { try { return JSON.parse(val) } catch { return null } }
                const pickId = (obj) => obj && (obj.userId || obj.id || obj.uid || obj.user?.id || obj.user?.userId) || null

                const userInfo = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'))
                if (userInfo) this.currentUserId = pickId(userInfo)

                if (!this.currentUserId) {
                    const storedId = localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId')
                    if (storedId) this.currentUserId = Number(storedId)
                }
                if (!this.currentUserId) {
                    const token = localStorage.getItem('token');
                    if (token && token.includes('.')) {
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            this.currentUserId = payload.userId || payload.sub || null;
                        } catch (e) {
                            // ignore decode error
                        }
                    }
                }
                // 未登录也可浏览列表；仅在下单/提交等需要userId时再校验
            } catch (e) {
                this.$message.error('获取用户信息失败');
            }
        },
        ensureLoggedIn() {
            if (!this.currentUserId) {
                this.$message.warning('请先登录后再进行操作');
                return false;
            }
            return true;
        },
        toNumber(v) { return v ? Number(v) : 0; },
        formatServiceLang(lang) { return lang ? lang.split(',').join('、') : '-'; },
        getQualificationText(status) {
            const map = { 0: '待审核', 1: '已通过', 2: '已驳回' };
            return map[status] || '未知';
        },
        handleBack() {
            if (this.showDetail) { this.showDetail = false; this.activeMenu = 'list'; }
            else if (this.showMatchingResult) { this.showMatchingResult = false; this.activeMenu = 'list'; }
        },
        handleBackToHome() { this.showMatchingResult = false; this.activeMenu = 'list'; },
        handleFilterChange() { this.currentPage = 1; },
        handleSizeChange(val) { this.pageSize = val; this.currentPage = 1; },
        handleCurrentChange(val) { this.currentPage = val; },
        async loadGuides() {
            this.loading = true;
            try {
                const res = await request.get('/travel-portal/guideExtend/list');
                const body = res && (res.data || res);
                const list = body?.data || body?.result || body?.records || body;
                this.guides = Array.isArray(list) ? list : [];
            } catch (e) {
                this.$message.error(e.message || '获取导游列表失败');
            } finally {
                this.loading = false;
            }
        },
        async showGuideDetail(id) {
            try {
                const res = await request.get(`/travel-portal/guideExtend/${id}`);
                const body = res && (res.data || res);
                this.currentGuide = body?.data || body?.result || body || {};
                this.showDetail = true;
            } catch (e) {
                this.$message.error(e.message || '获取导游详情失败');
            }
        },
        startMatchingWithGuide(guideId) {
            this.matchingRequest.guideId = guideId;
            const guide = this.guides.find(g => g.guideId === guideId);
            if (guide) {
                this.matchingRequest.destination = guide.location || guide.goodAtArea || '';
            }
            this.activeMenu = 'request';
        },
        async submitMatchingRequest() {
            this.$refs.requestForm.validate(async (valid) => {
                if (!valid) return;
                if (!this.ensureLoggedIn()) return;
                if (this.matchingRequest.startDate && this.matchingRequest.endDate && new Date(this.matchingRequest.startDate) > new Date(this.matchingRequest.endDate)) {
                    this.$message.error('结束日期不能早于开始日期');
                    return;
                }
                try {
                    const payload = {
                        userId: this.currentUserId,
                        destination: this.matchingRequest.destination,
                        travelDate: this.formatDateForAPI(this.matchingRequest.startDate),
                        travelDays: this.calculateDays(),
                        personCount: this.matchingRequest.travelers,
                        budget: this.matchingRequest.budget,
                        serviceRequire: this.matchingRequest.specialRequirements,
                        guideId: this.matchingRequest.guideId || undefined,
                        matchStatus: 0
                    };
                    await request.post('/travel-portal/guideMatch/create', payload);
                    // 简单的本地匹配逻辑：若指定guideId则取该导游，否则按目的地模糊匹配
                    let matched = null;
                    if (this.matchingRequest.guideId) {
                        matched = this.guides.find(g => g.guideId === this.matchingRequest.guideId) || null;
                    } else {
                        matched = this.guides.find(g => (g.location || g.goodAtArea || '').includes(this.matchingRequest.destination));
                    }
                    this.matchingResult.guide = matched || null;
                    this.showMatchingResult = true;
                } catch (e) {
                    this.$message.error(e.message || '提交匹配失败');
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.matchingRequest.guideId = null;
        },
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())}`;
        },
        formatDateForAPI(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())}`;
        },
        padZero(num) { return num < 10 ? `0${num}` : num; },
        calculateDays() {
            if (!this.matchingRequest.startDate || !this.matchingRequest.endDate) return 0;
            const start = new Date(this.matchingRequest.startDate);
            const end = new Date(this.matchingRequest.endDate);
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        },
        calculateTotalPrice() {
            if (!this.matchingResult.guide) return 0;
            const perDay = Number(this.matchingResult.guide.baseFee || 0);
            return perDay * this.calculateDays();
        },
        calculateDeposit() { return Math.ceil(this.calculateTotalPrice() * 0.3); },
        async confirmPayment() {
            try {
                if (!this.ensureLoggedIn()) return;
                // 创建订单
                const orderPayload = {
                    userId: this.currentUserId,
                    productId: null,
                    guideId: this.matchingResult.guide?.guideId,
                    totalPrice: this.calculateDeposit(),
                    payType: this.paymentMethod === 'wechat' ? 1 : 2,
                    payStatus: 1,
                    orderStatus: 0,
                    bookingDate: this.formatDateForAPI(this.matchingRequest.startDate),
                    travellers: this.matchingRequest.travelers,
                    specialNeeds: this.matchingRequest.specialRequirements
                };
                await request.post('/travel-portal/tourOrder/create', orderPayload);
                this.orderNumber = 'ORD' + Date.now();
                this.paymentSuccess = true;
            } catch (e) {
                this.$message.error(e.message || '创建订单失败');
            }
        },
        chooseOtherGuide() {
            this.matchingRequest.guideId = null;
            this.submitMatchingRequest();
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
    transition: all 0.3s ease;
}

.guide-card:hover {
    transform: translateY(-5px);
}

.guide-card-content {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 20px;
    padding: 20px;
    align-items: start;
    min-width: 0;
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
    display: none;
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

/* 新布局细化 */
.guide-middle {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}

.guide-name { 
    font-size: 18px; 
    font-weight: 700; 
    color: #1a1a1a; 
    margin: 0; 
    line-height: 1.3;
}
.lang-row { 
    display: flex; 
    gap: 4px; 
    margin: 0; 
    flex-wrap: nowrap;
    min-width: 0;
}
.loc-row { 
    display: flex; 
    align-items: center; 
    gap: 4px; 
    color: #666; 
    font-size: 13px; 
    margin: 0; 
    line-height: 1.4;
}
.rate-row { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    margin: 0; 
    flex-wrap: nowrap; 
}
.rate-row >>> .el-rate { white-space: nowrap; line-height: 1; }
.rating-value { 
    white-space: nowrap; 
    font-weight: 500;
    color: #ff6b35;
    font-size: 13px;
}
.guide-right { 
    display: flex; 
    flex-direction: column; 
    align-items: flex-end; 
    justify-content: space-between;
    gap: 12px; 
    min-width: 100px;
    height: 100%;
}
.guide-right .actions { 
    display: flex; 
    gap: 6px; 
    flex-wrap: nowrap;
}
.guide-right .price { 
    font-size: 20px; 
    font-weight: 600;
    color: #ff4757;
    margin: 0;
    line-height: 1.2;
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