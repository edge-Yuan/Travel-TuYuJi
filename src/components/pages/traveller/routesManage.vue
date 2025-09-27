<template>
    <div class="itinerary-management">
        <!-- 用户ID输入框（临时解决方案） -->
        <div v-if="!currentUserId" class="user-id-input">
            <el-alert title="请设置用户ID" type="warning" :closable="false" style="margin-bottom: 20px;">
                <p>请输入您登录的用户ID：</p>
                <el-input v-model="tempUserId" placeholder="请输入用户ID" style="width: 200px; margin-right: 10px;"></el-input>
                <el-button type="primary" @click="setUserId">确定</el-button>
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
                        <el-tag :type="getStatusTagType(itinerary.orderStatus)">{{ getStatusText(itinerary.orderStatus) }}</el-tag>
                    </div>

                    <div class="itinerary-actions">
                        <el-button type="text" @click="viewItineraryDetails(itinerary.orderId)" class="detail-btn">
                            查看详情
                        </el-button>

                        <template v-if="itinerary.orderStatus === 1 && canModifyItinerary(itinerary)">
                            <el-button type="text" @click="startModifyItinerary(itinerary.orderId)" class="modify-btn">
                                修改行程
                            </el-button>
                        </template>

                        <template v-if="itinerary.orderStatus === 1 && canCancelItinerary(itinerary)">
                            <el-button type="text" @click="openCancelDialog(itinerary.orderId)" class="cancel-btn">
                                取消行程
                            </el-button>
                        </template>
                    </div>
                </div>

                <div class="itinerary-basic-info">
                    <el-row :gutter="20">
                        <el-col :span="4">
                            <div class="info-item">
                                <span class="info-label">出行日期</span>
                                <span class="info-value">{{ formatDate(itinerary.bookingDate) }}</span>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="info-item">
                                <span class="info-label">天数</span>
                                <span class="info-value">{{ calculateDays(itinerary) }}天</span>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="info-item">
                                <span class="info-label">人数</span>
                                <span class="info-value">{{ itinerary.personCount }}人</span>
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
                        <el-col :span="6">
                            <div class="info-item">
                                <span class="info-label">总价</span>
                                <span class="info-value price">{{ itinerary.orderAmount | currency }}</span>
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
                                <span class="detail-value">{{ formatDate(currentItinerary.bookingDate) }}</span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="detail-item">
                                <span class="detail-label">出行人数</span>
                                <span class="detail-value">{{ currentItinerary.personCount }}人</span>
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
                                <span class="detail-value price">{{ currentItinerary.orderAmount | currency }}</span>
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
                    <p>预计退款金额: {{ refundInfo.refundAmount | currency }}</p>
                    <p>退款说明: {{ refundInfo.refundDescription }}</p>
                </el-alert>
            </div>
            <el-form :model="cancelForm" :rules="cancelRules" ref="cancelForm" label-width="100px">
                <el-form-item label="取消原因" prop="reason">
                    <el-select v-model="cancelForm.reason" placeholder="请选择取消原因" style="width: 100%;">
                        <el-option label="行程变更" value="schedule_change"></el-option>
                        <el-option label="个人原因" value="personal_reason"></el-option>
                        <el-option label="天气原因" value="weather"></el-option>
                        <el-option label="其他原因" value="other"></el-option>
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
    </div>
</template>

<script>
// 导入request实例
import request from '@/utils/request'

export default {
    name: 'routesManage',
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
            activeDay: 0
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
        // 初始化用户信息
        initUserInfo() {
            try {
                console.log('开始初始化用户信息...');
                
                // 方法1：从localStorage获取用户信息
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const user = JSON.parse(userInfo);
                    this.currentUserId = user.userId || user.id;
                    console.log('从localStorage获取用户ID:', this.currentUserId);
                    this.loadItineraries();
                    return;
                }

                // 方法2：从token中解析用户ID
                const token = localStorage.getItem('token');
                if (token) {
                    console.log('尝试从token解析用户ID...');
                    this.parseUserIdFromToken(token);
                } else {
                    // 方法3：直接使用您登录的用户ID（临时解决方案）
                    console.log('未找到token，使用默认用户ID进行测试');
                    this.currentUserId = 10003; // 请根据您实际登录的用户ID修改这个值
                    console.log('使用默认用户ID:', this.currentUserId);
                    this.loadItineraries();
                }
            } catch (error) {
                console.error('初始化用户信息失败:', error);
                // 出错时也使用默认用户ID
                this.currentUserId = 10003;
                console.log('出错时使用默认用户ID:', this.currentUserId);
                this.loadItineraries();
            }
        },

        // 从token中解析用户ID
        parseUserIdFromToken(token) {
            try {
                // 如果您的token是JWT格式，可以这样解析
                // 注意：这里只是示例，实际解析方式取决于您的token格式
                if (token.includes('.')) {
                    // JWT格式：header.payload.signature
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    this.currentUserId = payload.userId || payload.sub;
                    console.log('从JWT token解析用户ID:', this.currentUserId);
                } else {
                    // 如果不是JWT格式，尝试调用API获取用户信息
                    console.log('token不是JWT格式，调用API获取用户信息');
                    this.getCurrentUserInfo();
                    return;
                }
                
                if (this.currentUserId) {
                    this.loadItineraries();
                } else {
                    console.warn('无法从token解析用户ID');
                    this.getCurrentUserInfo();
                }
            } catch (error) {
                console.error('解析token失败:', error);
                this.getCurrentUserInfo();
            }
        },

        // 调用API获取当前用户信息
        async getCurrentUserInfo() {
            try {
                console.log('调用API获取当前用户信息...');
                
                // 如果后端有获取当前用户信息的API，可以调用
                // 这里先尝试从token中获取，如果没有相关API，可以临时使用默认值
                const token = localStorage.getItem('token');
                if (token) {
                    // 临时方案：如果无法解析token，使用默认用户ID进行测试
                    // 您可以根据实际情况调整
                    this.currentUserId = 10003; // 临时使用，实际应该从API获取
                    console.log('使用临时用户ID:', this.currentUserId);
                    this.loadItineraries();
                } else {
                    console.warn('未找到token');
                    this.$message.error('请先登录');
                }
            } catch (error) {
                console.error('获取当前用户信息失败:', error);
                this.$message.error('获取用户信息失败: ' + (error.message || '未知错误'));
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
                console.log('开始加载行程列表，用户ID:', this.currentUserId);
                
                const response = await request.get('/travel-portal/itinerary/list', {
                    params: {
                        userId: this.currentUserId,
                        status: this.activeTab,
                        page: this.currentPage,
                        size: this.pageSize
                    }
                });
                
                console.log('API响应数据:', response);
                
                if (response && response.records) {
                    this.itineraries = response.records;
                    this.total = response.total || 0;
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
                
                this.currentItinerary = response;
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
                
                this.modifiedItinerary = {
                    title: response.title,
                    startDate: new Date(response.bookingDate),
                    endDate: new Date(response.bookingDate),
                    travelers: response.personCount,
                    notes: response.notes || ''
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
                const response = await request.get(`/travel-portal/itinerary/refund-info/${orderId}`, {
                    params: { userId: this.currentUserId }
                });
                
                this.refundInfo = response;
            } catch (error) {
                console.error('获取退款信息失败:', error);
            }
            
            this.showCancelDialog = true;
        },

        // 确认取消行程
        async confirmCancelItinerary() {
            this.$refs.cancelForm.validate(async (valid) => {
                if (valid) {
                    this.cancelLoading = true;
                    try {
                        const cancelData = {
                            orderId: this.currentOrderId,
                            reason: this.cancelForm.reason,
                            description: this.cancelForm.description
                        };
                        
                        await request.post('/travel-portal/itinerary/cancel', cancelData, {
                            params: { userId: this.currentUserId }
                        });
                        
                        this.showCancelDialog = false;
                        this.successMessage = '行程已取消';
                        this.showSuccessDialog = true;
                        this.loadItineraries();
                    } catch (error) {
                        console.error('取消行程失败:', error);
                        this.$message.error('取消行程失败: ' + (error.message || '未知错误'));
                    } finally {
                        this.cancelLoading = false;
                    }
                }
            });
        },

        // 其他辅助方法
        canModifyItinerary(itinerary) {
            if (itinerary.orderStatus !== 1) return false;
            const startDate = new Date(itinerary.bookingDate);
            const today = new Date();
            return startDate - today > 24 * 60 * 60 * 1000;
        },

        canCancelItinerary(itinerary) {
            if (itinerary.orderStatus !== 1) return false;
            const startDate = new Date(itinerary.bookingDate);
            const today = new Date();
            return startDate >= today;
        },

        getStatusText(status) {
            const statusMap = {
                0: '待确认',
                1: '已确认',
                2: '已完成',
                3: '已取消',
                4: '退款中'
            };
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

        calculateDays(itinerary) {
            if (!itinerary || !itinerary.bookingDate) return 0;
            return 1;
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

.itinerary-basic-info {
    padding: 10px 0;
}

.info-item {
    margin-bottom: 10px;
}

.info-label {
    display: inline-block;
    width: 70px;
    color: #666;
    font-size: 14px;
}

.info-value {
    color: #333;
    font-size: 14px;
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