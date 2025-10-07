<template>
    <div class="itinerary-management">
        <!-- 用户ID输入框（当无法自动获取用户ID时显示） -->
        <div v-if="!currentUserId" class="user-id-input">
            <el-alert title="无法自动获取用户信息" type="info" :closable="false" style="margin-bottom: 20px;">
                <p>系统无法自动获取您的用户信息，请手动输入用户ID：</p>
                <el-input v-model="tempUserId" placeholder="请输入用户ID" style="width: 200px; margin-right: 10px;"></el-input>
                <el-button type="primary" @click="setUserId">确定</el-button>
                <el-button type="text" @click="refreshUserInfo" style="margin-left: 10px;">重新获取</el-button>
            </el-alert>
        </div>

        <!-- 导航菜单 -->
        <el-menu v-if="currentUserId" :default-active="activeTab" class="el-menu-demo sticky-menu" mode="horizontal" @select="handleTabChange">
            <el-menu-item index="all">所有行程</el-menu-item>
            <el-menu-item index="upcoming">待出行</el-menu-item>
            <el-menu-item index="completed">已完成</el-menu-item>
            <el-menu-item index="cancelled">已取消</el-menu-item>
        </el-menu>

        <!-- 行程列表 -->
        <div v-if="currentUserId" class="itinerary-list">
            <el-card v-for="itinerary in itineraries" :key="itinerary.orderId" class="itinerary-card">
                <div class="itinerary-header">
                    <div class="itinerary-title">
                        <h3>{{ itinerary.title }}</h3>
                        <el-tag :type="getStatusTagType(getDisplayStatus(itinerary))">{{ getStatusText(getDisplayStatus(itinerary)) }}</el-tag>
                    </div>

                    <div class="itinerary-actions">
                        <el-button type="text" @click="viewItineraryDetails(itinerary.orderId)" class="detail-btn">
                            查看详情
                        </el-button>

                        <template v-if="getDisplayStatus(itinerary) === 1 && canModifyItinerary(itinerary)">
                            <el-button type="text" @click="startModifyItinerary(itinerary.orderId)" class="modify-btn">
                                修改行程
                            </el-button>
                        </template>

                        <template v-if="getDisplayStatus(itinerary) === 1 && canCancelItinerary(itinerary)">
                            <el-button type="text" @click="openCancelDialog(itinerary.orderId)" class="cancel-btn">
                                取消行程
                            </el-button>
                        </template>

                        <template v-if="getDisplayStatus(itinerary) === 2 && canEvaluateItinerary(itinerary)">
                            <el-button type="text" @click="openEvaluationDialog(itinerary)" class="evaluate-btn">
                                评价行程
                            </el-button>
                        </template>
                    </div>
                </div>

                <div class="itinerary-basic-info">
                    <el-row :gutter="16">
                        <el-col :span="6">
                            <div class="info-item">
                                <span class="info-label">出行日期</span>
                                <span class="info-value">{{ formatDate(itinerary.startDate) }}</span>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="info-item">
                                <span class="info-label">天数</span>
                                <span class="info-value">{{ calculateDays(itinerary.startDate,itinerary.endDate) }}天</span>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="info-item">
                                <span class="info-label">人数</span>
                                <span class="info-value">{{ itinerary.travellers }}人</span>
                            </div>
                        </el-col>
                        <el-col :span="6">
                            <div class="info-item">
                                <span class="info-label">导游</span>
                                <span class="info-value">
                                    <el-avatar :src="itinerary.guide?.avatar || '/default-avatar.png'" size="small" class="guide-avatar"></el-avatar>
                                    {{ itinerary.guide?.name || '未分配' }}
                                </span>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="info-item">
                                <span class="info-label">总价</span>
                                <span class="info-value price">{{ itinerary.totalPrice | currency }}</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-card>

            <!-- 空状态 -->
            <el-empty v-if="itineraries.length === 0 && !loading" description="暂无行程记录" class="empty-state">
                <el-button type="primary" @click="createNewItinerary">创建新行程</el-button>
            </el-empty>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="3" animated />
            </div>

            <!-- 分页 -->
            <el-pagination v-if="itineraries.length > 0" class="pagination" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 20]"
                :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="total"></el-pagination>
        </div>

        <!-- 行程详情弹窗 -->
        <el-dialog title="行程详情" :visible.sync="showDetailDialog" width="80%" @close="handleDetailClose">
            <div v-if="currentItinerary" class="itinerary-detail">
                <!-- 基本信息 -->
                <el-card class="detail-card">
                    <div slot="header" class="clearfix">
                        <span>基本信息</span>
                    </div>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">行程标题</span>
                                <span class="detail-value">{{ currentItinerary.title }}</span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">出行日期</span>
                                <span class="detail-value">{{ formatDate(currentItinerary.startDate) }}</span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">出行人数</span>
                                <span class="detail-value">{{ currentItinerary.travellers }}人</span>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20" style="margin-top: 15px;">
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">订单状态</span>
                                <el-tag :type="getStatusTagType(currentItinerary.orderStatus)">
                                    {{ getStatusText(currentItinerary.orderStatus) }}
                                </el-tag>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">支付状态</span>
                                <el-tag :type="currentItinerary.paymentStatus === 1 ? 'success' : 'warning'">
                                    {{ getPaymentStatusText(currentItinerary.paymentStatus) }}
                                </el-tag>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">订单金额</span>
                                <span class="detail-value price">{{ currentItinerary.totalPrice | currency }}</span>
                            </div>
                        </el-col>
                    </el-row>
                </el-card>

                <!-- 导游信息 -->
                <el-card class="detail-card" v-if="currentItinerary.guide">
                    <div slot="header" class="clearfix">
                        <span>导游信息</span>
                    </div>
                    <div class="guide-info">
                        <el-avatar :src="currentItinerary.guide.avatar || '/default-avatar.png'" size="large" class="guide-avatar"></el-avatar>
                        <div class="guide-details">
                            <h4>{{ currentItinerary.guide.name }}</h4>
                            <p>{{ getServiceTypeText(currentItinerary.guide.serviceType) }}</p>
                            <p>评分: {{ currentItinerary.guide.rating }}/5.0</p>
                            <p>服务次数: {{ currentItinerary.guide.serviceCount }}次</p>
                        </div>
                    </div>
                </el-card>

                <!-- 行程安排 -->
                <el-card class="detail-card" v-if="currentItinerary.itinerary && currentItinerary.itinerary.length > 0">
                    <div slot="header" class="clearfix">
                        <span>行程安排</span>
                    </div>
                    <el-collapse v-model="activeDay">
                        <el-collapse-item v-for="(day, index) in currentItinerary.itinerary" :key="index" :title="`第${index + 1}天`" :name="index">
                            <div class="day-itinerary">
                                <h4>{{ day.title }}</h4>
                                <p>{{ day.description }}</p>
                                <div class="day-attractions">
                                    <el-tag v-for="attraction in day.attractions" :key="attraction" size="small" style="margin-right: 8px;">
                                        {{ attraction }}
                                    </el-tag>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </el-card>
            </div>
        </el-dialog>

        <!-- 修改行程弹窗 -->
        <el-dialog title="修改行程" :visible.sync="showModifyDialog" width="600px">
            <el-form :model="modifiedItinerary" :rules="modifyRules" ref="modifyForm" label-width="100px">
                <el-form-item label="行程标题" prop="title">
                    <el-input v-model="modifiedItinerary.title" placeholder="请输入行程标题"></el-input>
                </el-form-item>
                <el-form-item label="开始日期" prop="startDate">
                    <el-date-picker v-model="modifiedItinerary.startDate" type="date" placeholder="选择开始日期" 
                        :picker-options="startDateOptions" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期" prop="endDate">
                    <el-date-picker v-model="modifiedItinerary.endDate" type="date" placeholder="选择结束日期" 
                        :picker-options="endDateOptions" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="出行人数" prop="travelers">
                    <el-input-number v-model="modifiedItinerary.travelers" :min="1" :max="20" style="width: 100%;"></el-input-number>
                </el-form-item>
                <el-form-item label="备注说明">
                    <el-input v-model="modifiedItinerary.notes" type="textarea" :rows="3" placeholder="请输入备注说明"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showModifyDialog = false">取消</el-button>
                <el-button type="primary" @click="submitItineraryModification" :loading="modifyLoading">确认修改</el-button>
            </div>
        </el-dialog>

        <!-- 取消行程弹窗 -->
        <el-dialog title="取消行程" :visible.sync="showCancelDialog" width="500px">
            <div v-if="refundInfo" class="refund-info">
                <el-alert title="退款信息" type="info" :closable="false" style="margin-bottom: 20px;">
                    <div class="refund-details">
                        <p><strong>距离出发天数:</strong> {{ refundInfo.daysBeforeDeparture }}天</p>
                        <p><strong>退款比例:</strong> {{ refundInfo.refundPercentage }}%</p>
                        <p><strong>可退金额:</strong> <span class="refund-amount">{{ refundInfo.refundAmount | currency }}</span></p>
                        <p><strong>退款到账:</strong> {{ refundInfo.refundDays }}个工作日内</p>
                        <p><strong>退款政策:</strong> {{ refundInfo.refundPolicy }}</p>
                    </div>
                </el-alert>
            </div>
            <el-form :model="cancelForm" :rules="cancelRules" ref="cancelForm" label-width="100px">
                <el-form-item label="取消原因" prop="reason">
                    <el-select v-model="cancelForm.reason" placeholder="请选择取消原因" style="width: 100%;">
                        <el-option label="行程变更" value="行程变更"></el-option>
                        <el-option label="个人原因" value="个人原因"></el-option>
                        <el-option label="天气原因" value="天气原因"></el-option>
                        <el-option label="其他原因" value="其他原因"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="详细说明" prop="description">
                    <el-input v-model="cancelForm.description" type="textarea" :rows="3" placeholder="请详细说明取消原因"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showCancelDialog = false">取消</el-button>
                <el-button type="danger" @click="confirmCancelItinerary" :loading="cancelLoading">确认取消</el-button>
            </div>
        </el-dialog>

        <!-- 成功提示弹窗 -->
        <el-dialog title="操作成功" :visible.sync="showSuccessDialog" width="400px">
            <div class="success-content">
                <i class="el-icon-success" style="color: #67C23A; font-size: 48px; margin-bottom: 20px;"></i>
                <p>{{ successMessage }}</p>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showSuccessDialog = false">确定</el-button>
            </div>
        </el-dialog>

        <!-- 行程评价组件 -->
        <order-evaluation
            :visible.sync="evaluationDialogVisible"
            :order-data="currentEvaluationItinerary"
            @evaluation-success="handleEvaluationSuccess"
        />
    </div>
</template>

<script>
// 导入request实例
import request from '@/utils/request'
import OrderEvaluation from './orderEvaluation.vue'

export default {
    name: 'routesManage',
    components: {
        OrderEvaluation
    },
    filters: {
        currency(value) {
            if (!value) return '¥0.00';
            return `¥${value.toFixed(2)}`;
        }
    },
    data() {
        return {
            // 用户ID（动态获取）
            currentUserId: null,
            // 临时用户ID输入
            tempUserId: '',
            
            // 标签页状态
            activeTab: 'all',

            // 分页控制
            currentPage: 1,
            pageSize: 10,
            total: 0,

            // 加载状态
            loading: false,
            modifyLoading: false,
            cancelLoading: false,

            // 弹窗控制
            showDetailDialog: false,
            showModifyDialog: false,
            showCancelDialog: false,
            showSuccessDialog: false,
            successMessage: '',

            // 当前操作的订单ID
            currentOrderId: null,

            // 当前行程数据
            currentItinerary: null,

            // 行程列表数据
            itineraries: [],

            // 修改行程表单数据
            modifiedItinerary: {
                title: '',
                startDate: '',
                endDate: '',
                travelers: 1,
                notes: ''
            },

            // 取消行程表单数据
            cancelForm: {
                reason: '',
                description: ''
            },

            // 退款信息
            refundInfo: null,

            // 表单验证规则
            modifyRules: {
                title: [
                    { required: true, message: '请输入行程标题', trigger: 'blur' },
                    { max: 50, message: '行程标题不能超过50个字符', trigger: 'blur' }
                ],
                startDate: [
                    { required: true, message: '请选择开始日期', trigger: 'change' }
                ],
                endDate: [
                    { required: true, message: '请选择结束日期', trigger: 'change' }
                ],
                travelers: [
                    { required: true, message: '请输入出行人数', trigger: 'blur' }
                ]
            },

            cancelRules: {
                reason: [
                    { required: true, message: '请选择取消原因', trigger: 'change' }
                ],
                description: [
                    { max: 200, message: '详细说明不能超过200个字符', trigger: 'blur' }
                ]
            },

            // 日期选择器选项
            startDateOptions: {
                disabledDate: (time) => {
                    return time.getTime() < Date.now() - 8.64e7;
                }
            },

            // 折叠面板状态
            activeDay: 0,
            
            // 评价相关
            evaluationDialogVisible: false,
            currentEvaluationItinerary: {}
        };
    },
    computed: {
        // 结束日期选择限制
        endDateOptions() {
            return {
                disabledDate: (time) => {
                    if (!this.modifiedItinerary.startDate) {
                        return time.getTime() < Date.now() - 8.64e7;
                    }
                    return time.getTime() < new Date(this.modifiedItinerary.startDate).getTime() - 8.64e7;
                }
            };
        }
    },
    mounted() {
        this.initUserInfo();
    },
    methods: {
        // 判断记录是否属于当前标签
        isRecordInTab(record, tab) {
            if (!record) return false;
            const target = this.mapTabToStatus(tab);
            if (target === null) return true;
            
            // 获取实际显示状态
            const displayStatus = this.getDisplayStatus(record);
            
            // 如果显示状态为-1（不显示），则不显示在任何标签中
            if (displayStatus === -1) return false;
            
            // 直接比较显示状态与目标状态
            return displayStatus === target;
        },
        
        // 获取实际显示状态（检查订单状态和支付状态）
        getDisplayStatus(record) {
            const orderStatus = Number(record.orderStatus);
            const paymentStatus = Number(record.paymentStatus || record.payStatus);
            
            // 只有已确认且已支付的订单才能显示为行程
            if (orderStatus === 1 && paymentStatus === 1) {
                return 1; // 待出行
            } else if (orderStatus === 2 && paymentStatus === 1) {
                return 2; // 已完成
            } else if (orderStatus === 3) {
                return 3; // 已取消
            } else {
                // 其他情况不显示在行程管理中
                return -1; // 不显示
            }
        },
        // 标签到后端状态码的映射
        mapTabToStatus(tab) {
            // 0: 待确认, 1: 已确认(待出行), 2: 已完成, 3: 已取消, 4: 退款中
            const map = {
                all: null,
                upcoming: 1,
                completed: 2,
                cancelled: 3
            };
            return Object.prototype.hasOwnProperty.call(map, tab) ? map[tab] : null;
        },
        // 列表去重
        uniqueBy(list, key) {
            if (!Array.isArray(list)) return [];
            const seen = new Set();
            const result = [];
            for (const item of list) {
                const k = item && (item[key] ?? JSON.stringify(item));
                if (!seen.has(k)) {
                    seen.add(k);
                    result.push(item);
                }
            }
            return result;
        },
        // 初始化用户信息
        initUserInfo() {
            try {
                console.log('开始初始化用户信息...');
                
                // 使用与头部组件相同的用户ID获取逻辑
                const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } };
                const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || '';
                
                // 方法1：从localStorage获取用户信息
                const userInfo = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'));
                const idFromInfo = pickId(userInfo);
                
                // 方法2：从localStorage和sessionStorage获取userId
                const idFromLS = localStorage.getItem('userId') || '';
                const idFromSession = sessionStorage.getItem('userId') || '';
                
                // 方法3：从token中解析用户ID
                const idFromToken = this.decodeUserIdFromToken() || '';
                
                this.currentUserId = String(idFromInfo || idFromLS || idFromSession || idFromToken || '');
                
                if (this.currentUserId) {
                    console.log('成功获取用户ID:', this.currentUserId);
                    this.loadItineraries();
                } else {
                    console.log('未找到用户ID，需要手动输入');
                }
            } catch (error) {
                console.error('初始化用户信息失败:', error);
                this.$message.error('获取用户信息失败，请手动输入用户ID');
            }
        },

        // 从token中解析用户ID
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


        // 加载行程列表
        async loadItineraries() {
            if (!this.currentUserId) {
                console.warn('用户ID为空，无法加载行程列表');
                return;
            }

            this.loading = true;
            try {
                const statusCode = this.mapTabToStatus(this.activeTab);
                const params = {
                    userId: Number(this.currentUserId),
                    // 兼容多种分页参数命名
                    current: this.currentPage,
                    page: this.currentPage,
                    pageNum: this.currentPage,
                    size: this.pageSize,
                    pageSize: this.pageSize
                };
                // 仅在非"全部"时传状态，兼容字段名
                if (statusCode !== null) {
                    params.orderStatus = statusCode;
                    params.status = statusCode;
                }
                
                const response = await request.get('/travel-portal/itinerary/list', { params });
                
                const body = response && (response.data || response);
                const payload = body && (body.data || body.result || body);
                let records = payload && (payload.records || payload.list || []);
                let total = payload && (payload.total || (Array.isArray(records) ? records.length : 0));
                
                // 当后端未按状态过滤时，前端根据标签兜底
                if (Array.isArray(records)) {
                    const filtered = this.mapTabToStatus(this.activeTab) === null
                        ? records
                        : records.filter(r => this.isRecordInTab(r, this.activeTab));
                    
                    this.itineraries = this.uniqueBy(filtered, 'orderId');
                    total = filtered.length;
                    this.total = total;
                    console.log('行程列表加载成功:', this.itineraries);
                } else {
                    this.itineraries = [];
                    this.total = 0;
                    console.log('没有找到行程数据');
                }
            } catch (error) {
                console.error('获取行程列表失败:', error);
                this.$message.error('获取行程列表失败: ' + (error.message || '未知错误'));
                this.itineraries = [];
                this.total = 0;
            } finally {
                this.loading = false;
            }
        },

        // 切换标签页
        handleTabChange(tab) {
            this.activeTab = tab;
            this.currentPage = 1;
            this.itineraries = [];
            this.loadItineraries();
        },

        // 分页处理
        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.loadItineraries();
        },
        
        handleCurrentChange(val) {
            this.currentPage = val;
            this.loadItineraries();
        },

        // 查看行程详情
        async viewItineraryDetails(orderId) {
            try {
                console.log('查看行程详情，订单ID:', orderId);
                
                const response = await request.get(`/travel-portal/itinerary/detail/${orderId}`, {
                    params: { userId: this.currentUserId }
                });
                
                console.log('行程详情响应:', response);
                const body = response && (response.data || response);
                this.currentItinerary = body && (body.data || body.result || body) || null;
                this.showDetailDialog = true;
            } catch (error) {
                console.error('获取行程详情失败:', error);
                this.$message.error('获取行程详情失败: ' + (error.message || '未知错误'));
            }
        },

        // 关闭详情弹窗
        handleDetailClose() {
            this.showDetailDialog = false;
            this.currentItinerary = null;
            this.currentOrderId = null;
        },

        // 开始修改行程
        async startModifyItinerary(orderId) {
            this.currentOrderId = orderId;
            
            try {
                const response = await request.get(`/travel-portal/itinerary/detail/${orderId}`, {
                    params: { userId: this.currentUserId }
                });
                const body = response && (response.data || response);
                const detail = body && (body.data || body.result || body) || {};
                
                this.modifiedItinerary = {
                    title: detail.title,
                    startDate: detail.bookingDate ? new Date(detail.bookingDate) : '',
                    endDate: detail.bookingDate ? new Date(detail.bookingDate) : '',
                    travelers: detail.personCount,
                    notes: detail.notes || ''
                };
                this.showModifyDialog = true;
            } catch (error) {
                console.error('获取行程信息失败:', error);
                this.$message.error('获取行程信息失败: ' + (error.message || '未知错误'));
            }
        },

        // 提交行程修改
        async submitItineraryModification() {
            this.$refs.modifyForm.validate(async (valid) => {
                if (valid) {
                    if (new Date(this.modifiedItinerary.startDate) > new Date(this.modifiedItinerary.endDate)) {
                        this.$message.error('结束日期不能早于开始日期');
                        return;
                    }

                    this.modifyLoading = true;
                    try {
                        const modifyData = {
                            orderId: this.currentOrderId,
                            title: this.modifiedItinerary.title,
                            startDate: this.formatDateForAPI(this.modifiedItinerary.startDate),
                            endDate: this.formatDateForAPI(this.modifiedItinerary.endDate),
                            travelers: this.modifiedItinerary.travelers,
                            notes: this.modifiedItinerary.notes,
                            modifyReason: '用户申请修改行程'
                        };
                        
                        await request.post('/travel-portal/itinerary/modify', modifyData, {
                            params: { userId: this.currentUserId }
                        });
                        
                        this.showModifyDialog = false;
                        this.successMessage = '行程修改请求已提交';
                        this.showSuccessDialog = true;
                        this.loadItineraries();
                    } catch (error) {
                        console.error('修改行程失败:', error);
                        this.$message.error('修改行程失败: ' + (error.message || '未知错误'));
                    } finally {
                        this.modifyLoading = false;
                    }
                }
            });
        },

        // 显示取消行程弹窗
        async openCancelDialog(orderId) {
            this.currentOrderId = orderId;
            this.cancelForm = {
                reason: '',
                description: ''
            };
            
            try {
                // 先检查是否可以取消
                const canCancelResponse = await request.get(`/travel-portal/itinerary/can-cancel/${orderId}`, {
                    params: { userId: this.currentUserId }
                });
                
                const canCancel = canCancelResponse.data?.data || canCancelResponse.data?.result || canCancelResponse.data;
                if (!canCancel) {
                    this.$message.warning('当前行程不允许取消');
                    return;
                }
                
                // 获取退款信息
                const response = await request.get(`/travel-portal/itinerary/refund-info/${orderId}`, {
                    params: { userId: this.currentUserId }
                });
                const body = response && (response.data || response);
                this.refundInfo = body && (body.data || body.result || body) || null;
                
                console.log('退款信息:', this.refundInfo);
            } catch (error) {
                console.error('获取退款信息失败:', error);
                this.$message.error('获取退款信息失败: ' + (error.message || '未知错误'));
            }
            
            this.showCancelDialog = true;
        },

        // 确认取消行程
        async confirmCancelItinerary() {
            this.$refs.cancelForm.validate(async (valid) => {
                if (valid) {
                    this.cancelLoading = true;
                    try {
                        // 按照后端DTO要求构建请求数据
                        const cancelData = {
                            orderId: this.currentOrderId,
                            reason: this.cancelForm.reason,
                            description: this.cancelForm.description || '' // 确保description不为null
                        };
                        
                        console.log('提交取消行程数据:', cancelData);
                        
                        const response = await request.post('/travel-portal/itinerary/cancel', cancelData, {
                            params: { userId: this.currentUserId }
                        });
                        
                        console.log('取消行程响应:', response);
                        
                        // 检查响应结果
                        const body = response && (response.data || response);
                        
                        if (body && body.code === 1) {
                            this.showCancelDialog = false;
                            this.successMessage = '行程已成功取消';
                            this.showSuccessDialog = true;
                            this.loadItineraries();
                        } else {
                            this.$message.error(body?.msg || '取消行程失败');
                        }
                    } catch (error) {
                        console.error('取消行程失败:', error);
                        const errorMsg = error?.response?.data?.msg || error?.message || '未知错误';
                        this.$message.error('取消行程失败: ' + errorMsg);
                    } finally {
                        this.cancelLoading = false;
                    }
                }
            });
        },

        // 其他辅助方法
        canModifyItinerary(itinerary) {
            // 只有状态为"待出行"(1)且预订日期大于明天才能修改
            if (this.getDisplayStatus(itinerary) !== 1) return false;
            const bookingDate = itinerary.bookingDate || itinerary.startDate || itinerary.travelDate;
            if (!bookingDate) return false;
            
            const startDate = new Date(bookingDate);
            const today = new Date();
            return startDate - today > 24 * 60 * 60 * 1000;
        },

        canCancelItinerary(itinerary) {
            // 只有状态为"待出行"(1)且预订日期大于等于今天才能取消
            if (this.getDisplayStatus(itinerary) !== 1) return false;
            const bookingDate = itinerary.bookingDate || itinerary.startDate || itinerary.travelDate;
            if (!bookingDate) return false;
            
            const startDate = new Date(bookingDate);
            const today = new Date();
            return startDate >= today;
        },

        getStatusText(status) {
            const statusMap = {
                0: '待确认',
                1: '待出行',  // 已确认且已支付 → 待出行
                2: '已完成',  // 已完成且已支付 → 已完成
                3: '已取消',
                4: '退款中'
            };
            if (status === -1) return '不符合条件';  // 不显示在行程管理中
            return statusMap[status] || '未知状态';
        },

        getStatusTagType(status) {
            const typeMap = {
                0: 'warning',
                1: 'success',
                2: 'primary',
                3: 'danger',
                4: 'info'
            };
            if (status === -1) return 'info';  // 不符合条件的订单
            return typeMap[status] || 'default';
        },

        getPaymentStatusText(status) {
            const statusMap = {
                0: '未支付',
                1: '已支付',
                2: '已退款'
            };
            return statusMap[status] || '未知状态';
        },

        getServiceTypeText(type) {
            const typeMap = {
                'full-time': '全程陪同',
                'local': '当地向导',
                'translator': '翻译导游',
                'custom': '定制旅游'
            };
            return typeMap[type] || type;
        },

        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())}`;
        },

        formatDateTime(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())} ${this.padZero(d.getHours())}:${this.padZero(d.getMinutes())}`;
        },

        formatDateForAPI(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${this.padZero(d.getMonth() + 1)}-${this.padZero(d.getDate())}`;
        },

        padZero(num) {
            return num < 10 ? `0${num}` : num;
        },

        calculateDays(startDate, endDate) {
            if (!startDate || !endDate) return 0;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return days;
        },

        createNewItinerary() {
            this.$message.info('跳转到创建新行程页面');
        },

        // 设置用户ID
        setUserId() {
            if (!this.tempUserId) {
                this.$message.warning('请输入用户ID');
                return;
            }
            this.currentUserId = parseInt(this.tempUserId);
            console.log('手动设置用户ID:', this.currentUserId);
            this.loadItineraries();
        },
        
        // 重新获取用户信息
        refreshUserInfo() {
            console.log('重新获取用户信息...');
            this.initUserInfo();
        },
        
        // 评价相关方法
        canEvaluateItinerary(itinerary) {
            // 只有已完成的行程才能评价
            const orderStatus = Number(itinerary.orderStatus);
            const paymentStatus = Number(itinerary.paymentStatus || itinerary.payStatus);
            
            // 订单状态为已完成(2)且已支付(1)的行程可以评价
            return orderStatus === 2 && paymentStatus === 1;
        },
        
        // 打开评价对话框
        openEvaluationDialog(itinerary) {
            if (!this.canEvaluateItinerary(itinerary)) {
                this.$message.warning('只有已完成的行程才能评价');
                return;
            }
            
            this.currentEvaluationItinerary = { ...itinerary };
            this.evaluationDialogVisible = true;
        },
        
        // 评价成功回调
        handleEvaluationSuccess(data) {
            console.log('评价成功:', data);
            this.$message.success('评价提交成功！');
            this.evaluationDialogVisible = false;
            
            // 重新加载行程列表
            this.loadItineraries();
        }
    }
}
</script>
<style scoped>
.itinerary-management {
    padding: 10px;
    /* background-color: #f5f7fa; */
    min-height: calc(100vh - 60px);
}

/* 固定导航菜单样式 */
.sticky-menu {
    position: fixed;
    top: 60px;
    /* 固定在header下方 */
    left: 200px;
    /* 与sidebar宽度一致 */
    right: 0;
    z-index: 10;
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 0;
    padding: 0 20px;
}

.itinerary-list {
    margin-top: 60px;
    /* 为固定导航菜单留出空间 */
}

.itinerary-card {
    margin-bottom: 15px;
    transition: all 0.3s ease;
}

.itinerary-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.itinerary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.itinerary-title {
    display: flex;
    align-items: center;
}

.itinerary-title h3 {
    margin: 0 15px 0 0;
    font-size: 18px;
}

.itinerary-actions {
    display: flex;
}

.detail-btn {
    color: #409eff;
}

.modify-btn {
    color: #67c23a;
}

.cancel-btn {
    color: #f56c6c;
}

.evaluate-btn {
    color: #67c23a;
}

.itinerary-basic-info {
    padding: 10px 0;
}

.info-item {
    margin-bottom: 10px;
    white-space: nowrap;
}

.info-label {
    display: inline-block;
    width: 60px;
    color: #666;
    font-size: 14px;
    margin-right: 6px;
}

.info-value {
    color: #333;
    font-size: 14px;
    white-space: nowrap;
}

.price {
    color: #f56c6c;
    font-weight: bold;
}

.guide-avatar {
    vertical-align: middle;
    margin-right: 5px;
}

.empty-state {
    margin: 50px 0;
    text-align: center;
}

.pagination {
    text-align: center;
    margin: 30px 0;
}

/* 行程详情 */
.itinerary-detail {
    padding: 10px 0;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.detail-header h2 {
    margin: 0;
}

.detail-section {
    margin-bottom: 20px;
}

/* 行程详情内边距与元素间距优化 */
.detail-card {
    margin-bottom: 16px;
}

.detail-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    margin-bottom: 8px;
}

.detail-label {
    min-width: 90px;
    color: #666;
}

.detail-value {
    flex: 1;
    text-align: right;
}

.guide-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.guide-details > h4 {
    margin: 0 0 6px 0;
}

.section-title {
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
    color: #333;
}

.mt-30 {
    margin-top: 30px;
}

.guide-info-card {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
}

.guide-avatar-large {
    margin: 0 auto 15px;
    display: block;
}

.guide-personal-info {
    text-align: center;
    margin-bottom: 15px;
}

.guide-rating {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
}

.rating-value {
    margin-left: 5px;
    color: #f5a623;
}

.guide-contact {
    margin-top: 15px;
}

.notes-card {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
}

.notes-card p {
    margin: 0;
    color: #52c41a;
}

.activity-content h4 {
    margin: 0 0 5px 0;
}

.activity-content p {
    margin: 0 0 5px 0;
    color: #666;
    font-size: 14px;
}

/* 修改行程弹窗 */
/* 取消行程弹窗 */
.cancel-dialog-content {
    padding: 10px 0;
}

.warning-text {
    color: #e6a23c;
    padding: 10px;
    background-color: #fdf6ec;
    border-radius: 4px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.warning-text i {
    font-size: 20px;
    margin-right: 10px;
}

.refund-info {
    margin: 20px 0;
}

.days-left {
    color: #409eff;
    font-weight: bold;
}

.refund-percentage {
    color: #67c23a;
    font-weight: bold;
}

.refund-amount {
    color: #f56c6c;
    font-weight: bold;
}

.refund-details p {
    margin: 8px 0;
    line-height: 1.5;
}

.refund-details strong {
    color: #333;
    font-weight: 600;
}

.policy-alert {
    margin-top: 20px;
    font-size: 13px;
}

/* 操作成功弹窗 */
.success-content {
    text-align: center;
    padding: 20px 0;
}

.success-content i {
    font-size: 50px;
    color: #67c23a;
    margin-bottom: 15px;
}

.success-content p {
    font-size: 16px;
    margin: 0;
}
</style>