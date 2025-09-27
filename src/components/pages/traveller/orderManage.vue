<template>
    <div class="order-management-container">
        <!-- 页面标题 -->
        <h3 class="page-title">订单管理</h3>

        <!-- 筛选区域 -->
        <el-card class="filter-card sticky-filter" shadow="never">
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-select v-model="selectedStatus" placeholder="订单状态" clearable @change="handleStatusChange">
                        <el-option label="待支付" value="pending_payment"></el-option>
                        <el-option label="待确认" value="pending_confirmation"></el-option>
                        <el-option label="已完成" value="completed"></el-option>
                        <el-option label="已取消" value="cancelled"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="8">
                    <el-input v-model="searchKeyword" placeholder="搜索订单号/产品名称" clearable
                        @keyup.enter.native="handleSearch" style="width: 100%; min-width: 240px;">
                        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="10" class="filter-actions">
                    <el-button type="primary" @click="resetFilters" size="mini" class="reset-button">
                        重置筛选
                    </el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 订单列表 -->
        <el-card class="orders-card" shadow="never">
            <el-table :data="filteredOrders" border v-loading="loading" element-loading-text="加载中..."
                style="width: 100%;">
                <el-table-column prop="orderNo" label="订单号" width="180" sortable header-align="center"
                    align="center"></el-table-column>
                <el-table-column prop="productName" label="产品/服务名称" sortable header-align="center"
                    align="center"></el-table-column>
                <el-table-column prop="amount" label="支付金额" width="120" sortable header-align="center" align="center">
                    <template slot-scope="scope">
                        ¥{{ scope.row.amount ? scope.row.amount.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>
                <el-table-column prop="provider" label="服务提供商" width="180" header-align="center"
                    align="center"></el-table-column>
                <el-table-column prop="status" label="订单状态" width="120" sortable header-align="center" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="statusTagType(scope.row.status)" size="small">
                            {{ statusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" sortable header-align="center"
                    align="center"></el-table-column>
                <el-table-column label="操作" width="220" header-align="center" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="viewOrderDetail(scope.row)">
                            查看详情
                        </el-button>

                        <el-button type="text" size="small" @click="downloadVoucher(scope.row)"
                            :disabled="!canDownloadVoucher(scope.row)">
                            下载凭证
                        </el-button>

                        <el-button type="text" size="small" @click="openRefundDialog(scope.row)"
                            :disabled="!canApplyRefund(scope.row)" style="color: #F56C6C;">
                            申请退款
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="currentPage" :page-sizes="[10, 20, 50]" :page-size="pageSize"
                :total="filteredOrders.length" layout="total, sizes, prev, pager, next, jumper"
                style="margin-top: 15px; text-align: right;"></el-pagination>
        </el-card>

        <!-- 订单详情对话框 -->
        <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="70%" :close-on-click-modal="false">
            <div class="order-detail">
                <el-row :gutter="20">
                    <el-col :span="16">
                        <div class="detail-section">
                            <h3>产品信息</h3>
                            <el-descriptions column="1" border>
                                <el-descriptions-item label="产品名称">{{ currentOrder.productName }}</el-descriptions-item>
                                <el-descriptions-item label="产品描述">{{ currentOrder.productDescription
                                }}</el-descriptions-item>
                                <el-descriptions-item label="数量">{{ currentOrder.quantity }}</el-descriptions-item>
                                <el-descriptions-item label="服务时间">{{ currentOrder.serviceTime }}</el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <div class="detail-section">
                            <h3>订单信息</h3>
                            <el-descriptions column="2" border>
                                <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
                                <el-descriptions-item label="订单状态">
                                    <el-tag :type="statusTagType(currentOrder.status)">{{
                                        statusText(currentOrder.status)
                                    }}</el-tag>
                                </el-descriptions-item>
                                <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
                                <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-'
                                }}</el-descriptions-item>
                                <el-descriptions-item label="完成时间">{{ currentOrder.completeTime || '-'
                                }}</el-descriptions-item>
                                <el-descriptions-item label="取消时间">{{ currentOrder.cancelTime || '-'
                                }}</el-descriptions-item>
                            </el-descriptions>
                        </div>
                    </el-col>

                    <el-col :span="8">
                        <div class="detail-section">
                            <h3>金额信息</h3>
                            <el-card>
                                <el-descriptions column="1">
                                    <el-descriptions-item label="单价">
                                        ¥{{ currentOrder.unitPrice ? currentOrder.unitPrice.toFixed(2) : '0.00' }}
                                    </el-descriptions-item>
                                    <el-descriptions-item label="数量">{{ currentOrder.quantity || 0
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="小计">
                                        ¥{{ currentOrder.unitPrice && currentOrder.quantity
                                            ? (currentOrder.unitPrice * currentOrder.quantity).toFixed(2)
                                            : '0.00' }}
                                    </el-descriptions-item>
                                    <el-descriptions-item label="优惠金额">
                                        -¥{{ currentOrder.discount ? currentOrder.discount.toFixed(2) : '0.00' }}
                                    </el-descriptions-item>
                                    <el-descriptions-item label="实付金额" style="color: #E6A23C; font-weight: bold;">
                                        ¥{{ currentOrder.amount ? currentOrder.amount.toFixed(2) : '0.00' }}
                                    </el-descriptions-item>
                                </el-descriptions>
                            </el-card>
                        </div>

                        <div class="detail-section">
                            <h3>联系信息</h3>
                            <el-descriptions column="1" border>
                                <el-descriptions-item label="联系人">{{ currentOrder.contactPerson
                                }}</el-descriptions-item>
                                <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone
                                }}</el-descriptions-item>
                                <el-descriptions-item label="服务提供商">{{ currentOrder.provider }}</el-descriptions-item>
                                <el-descriptions-item label="商家联系方式">{{ currentOrder.providerContact
                                }}</el-descriptions-item>
                            </el-descriptions>
                        </div>
                    </el-col>
                </el-row>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button @click="detailDialogVisible = false">关闭</el-button>
                <el-button type="primary" @click="downloadVoucher(currentOrder)"
                    :disabled="!canDownloadVoucher(currentOrder)" style="margin-left: 10px;">
                    下载订单凭证
                </el-button>
            </div>
        </el-dialog>

        <!-- 退款申请对话框 -->
        <el-dialog title="申请退款" :visible.sync="refundDialogVisible" width="50%" :close-on-click-modal="false">
            <el-form :model="refundForm" :rules="refundRules" ref="refundForm" label-width="100px">
                <el-form-item label="订单号" prop="orderNo">
                    <el-input v-model="refundForm.orderNo" disabled></el-input>
                </el-form-item>
                <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="refundForm.productName" disabled></el-input>
                </el-form-item>
                <el-form-item label="退款金额" prop="refundAmount">
                    <el-input v-model="refundForm.refundAmount" disabled prefix-icon="el-icon-money"></el-input>
                </el-form-item>
                <el-form-item label="退款原因" prop="reason">
                    <el-select v-model="refundForm.reason" placeholder="请选择退款原因" style="width: 100%;">
                        <el-option label="产品与描述不符" value="description_mismatch"></el-option>
                        <el-option label="价格原因" value="price_issue"></el-option>
                        <el-option label="行程变更" value="itinerary_change"></el-option>
                        <el-option label="重复购买" value="duplicate_purchase"></el-option>
                        <el-option label="其他原因" value="other"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="详细说明" prop="description">
                    <el-input v-model="refundForm.description" type="textarea" rows="4"
                        placeholder="请详细描述退款原因"></el-input>
                </el-form-item>
                <el-form-item label="上传凭证">
                    <el-upload class="upload-demo" action="" :auto-upload="false" :on-change="handleVoucherUpload"
                        :file-list="refundForm.vouchers" list-type="picture-card">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <div style="color: #606266; font-size: 12px; margin-top: 10px;">
                        请上传能证明您退款理由的凭证（如照片、截图等），最多3张
                    </div>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="refundDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitRefundApplication" style="margin-left: 10px;">
                    提交申请
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'orderManage',
    data() {
        return {
            // 订单数据
            orders: [],
            filteredOrders: [],
            loading: true,

            // 筛选条件
            selectedStatus: '',
            searchKeyword: '',

            // 分页
            currentPage: 1,
            pageSize: 10,

            // 订单详情相关
            detailDialogVisible: false,
            currentOrder: {},

            // 退款相关
            refundDialogVisible: false,
            refundForm: {
                orderNo: '',
                productName: '',
                refundAmount: 0,
                reason: '',
                description: '',
                vouchers: []
            },
            refundRules: {
                reason: [
                    { required: true, message: '请选择退款原因', trigger: 'change' }
                ],
                description: [
                    { required: true, message: '请填写详细说明', trigger: 'blur' },
                    { min: 10, message: '详细说明至少10个字符', trigger: 'blur' }
                ]
            }
        };
    },
    created() {
        // 模拟加载订单数据
        this.loadOrders();
    },
    methods: {
        // 返回上一级
        handleBack() {
            this.$emit('back');
            // 或者使用路由返回: this.$router.go(-1);
        },

        // 加载订单数据
        loadOrders() {
            // 模拟API请求
            setTimeout(() => {
                // 模拟订单数据
                this.orders = [
                    {
                        id: 1,
                        orderNo: 'ORD20230512001',
                        productName: '北京一日游',
                        productDescription: '包含故宫、天安门广场、颐和园等景点门票及导游服务',
                        unitPrice: 299,
                        quantity: 2,
                        discount: 50,
                        amount: 548,
                        provider: '快乐旅行有限公司',
                        providerContact: '400-123-4567',
                        status: 'pending_payment',
                        createTime: '2023-05-12 09:30:25',
                        payTime: '',
                        completeTime: '',
                        cancelTime: '',
                        contactPerson: '张三',
                        contactPhone: '13800138000',
                        serviceTime: '2023-05-20 08:00-18:00',
                        hasVoucher: true,
                        voucherUrl: '/vouchers/ORD20230512001.pdf'
                    },
                    {
                        id: 2,
                        orderNo: 'ORD20230512002',
                        productName: '上海迪士尼门票',
                        productDescription: '上海迪士尼乐园一日票，含所有游乐项目',
                        unitPrice: 499,
                        quantity: 1,
                        discount: 0,
                        amount: 499,
                        provider: '迪士尼旅游发展有限公司',
                        providerContact: '400-888-8888',
                        status: 'pending_confirmation',
                        createTime: '2023-05-12 10:15:42',
                        payTime: '2023-05-12 10:18:30',
                        completeTime: '',
                        cancelTime: '',
                        contactPerson: '李四',
                        contactPhone: '13900139000',
                        serviceTime: '2023-05-25 09:00-21:00',
                        hasVoucher: true,
                        voucherUrl: '/vouchers/ORD20230512002.pdf'
                    },
                    {
                        id: 3,
                        orderNo: 'ORD20230510001',
                        productName: '广州长隆野生动物世界门票',
                        productDescription: '长隆野生动物世界一日票，含园区内小火车',
                        unitPrice: 350,
                        quantity: 3,
                        discount: 50,
                        amount: 1000,
                        provider: '长隆旅游集团',
                        providerContact: '400-666-6666',
                        status: 'completed',
                        createTime: '2023-05-10 14:22:18',
                        payTime: '2023-05-10 14:25:05',
                        completeTime: '2023-05-15 18:30:00',
                        cancelTime: '',
                        contactPerson: '王五',
                        contactPhone: '13700137000',
                        serviceTime: '2023-05-15 09:00-18:00',
                        hasVoucher: true,
                        voucherUrl: '/vouchers/ORD20230510001.pdf'
                    },
                    {
                        id: 4,
                        orderNo: 'ORD20230509003',
                        productName: '杭州西湖游船票',
                        productDescription: '西湖环湖游船票，含三潭印月登岛门票',
                        unitPrice: 60,
                        quantity: 2,
                        discount: 0,
                        amount: 120,
                        provider: '杭州西湖旅游有限公司',
                        providerContact: '400-777-7777',
                        status: 'cancelled',
                        createTime: '2023-05-09 08:55:33',
                        payTime: '2023-05-09 08:57:12',
                        completeTime: '',
                        cancelTime: '2023-05-09 10:20:45',
                        contactPerson: '赵六',
                        contactPhone: '13600136000',
                        serviceTime: '2023-05-16 10:00-12:00',
                        hasVoucher: false,
                        voucherUrl: ''
                    },
                    {
                        id: 5,
                        orderNo: 'ORD20230511005',
                        productName: '成都火锅美食套餐',
                        productDescription: '双人火锅套餐，含特色菜品及饮品',
                        unitPrice: 168,
                        quantity: 1,
                        discount: 18,
                        amount: 150,
                        provider: '蜀韵餐饮管理有限公司',
                        providerContact: '400-999-9999',
                        status: 'pending_confirmation',
                        createTime: '2023-05-11 16:40:15',
                        payTime: '2023-05-11 16:42:08',
                        completeTime: '',
                        cancelTime: '',
                        contactPerson: '钱七',
                        contactPhone: '13500135000',
                        serviceTime: '2023-05-22 18:00-20:00',
                        hasVoucher: true,
                        voucherUrl: '/vouchers/ORD20230511005.pdf'
                    }
                ];

                this.filteredOrders = [...this.orders];
                this.loading = false;
            }, 800);
        },

        // 状态文本转换
        statusText(status) {
            const statusMap = {
                'pending_payment': '待支付',
                'pending_confirmation': '待确认',
                'completed': '已完成',
                'cancelled': '已取消'
            };
            return statusMap[status] || status;
        },

        // 状态标签样式
        statusTagType(status) {
            const typeMap = {
                'pending_payment': 'warning',
                'pending_confirmation': 'info',
                'completed': 'success',
                'cancelled': 'danger'
            };
            return typeMap[status] || 'default';
        },

        // 处理状态筛选变化
        handleStatusChange() {
            this.filterOrders();
            this.currentPage = 1; // 重置到第一页
        },

        // 处理搜索
        handleSearch() {
            this.filterOrders();
            this.currentPage = 1; // 重置到第一页
        },

        // 重置筛选条件
        resetFilters() {
            this.selectedStatus = '';
            this.searchKeyword = '';
            this.filterOrders();
            this.currentPage = 1; // 重置到第一页
        },

        // 筛选订单
        filterOrders() {
            let result = [...this.orders];

            // 按状态筛选
            if (this.selectedStatus) {
                result = result.filter(order => order.status === this.selectedStatus);
            }

            // 按关键词搜索
            if (this.searchKeyword) {
                const keyword = this.searchKeyword.toLowerCase();
                result = result.filter(order =>
                    order.orderNo.toLowerCase().includes(keyword) ||
                    order.productName.toLowerCase().includes(keyword)
                );
            }

            this.filteredOrders = result;
        },

        // 分页大小变化
        handleSizeChange(val) {
            this.pageSize = val;
        },

        // 当前页变化
        handleCurrentChange(val) {
            this.currentPage = val;
        },

        // 查看订单详情
        viewOrderDetail(order) {
            this.currentOrder = { ...order };
            this.detailDialogVisible = true;
        },

        // 打开退款申请对话框
        openRefundDialog(order) {
            this.refundForm = {
                orderNo: order.orderNo,
                productName: order.productName,
                refundAmount: order.amount,
                reason: '',
                description: '',
                vouchers: []
            };
            this.refundDialogVisible = true;
        },

        // 处理凭证上传
        handleVoucherUpload(file, fileList) {
            // 限制最多3张图片
            if (fileList.length > 3) {
                this.$message.warning('最多只能上传3张凭证图片');
                fileList.pop();
            }
            this.refundForm.vouchers = fileList;
        },

        // 提交退款申请
        submitRefundApplication() {
            this.$refs.refundForm.validate((valid) => {
                if (valid) {
                    // 模拟API请求提交退款申请
                    this.loading = true;
                    setTimeout(() => {
                        this.loading = false;
                        this.refundDialogVisible = false;
                        this.$message.success('退款申请已提交，将在1-3个工作日内处理');

                        // 更新订单状态（实际项目中应该是后端处理后返回新状态）
                        const orderIndex = this.orders.findIndex(order => order.orderNo === this.refundForm.orderNo);
                        if (orderIndex !== -1) {
                            this.orders[orderIndex].status = 'pending_refund';
                            this.filterOrders();
                        }
                    }, 1000);
                }
            });
        },

        // 下载订单凭证
        downloadVoucher(order) {
            if (!order.voucherUrl) {
                this.$message.warning('该订单没有可下载的凭证');
                return;
            }

            // 模拟下载
            this.$message.success(`正在下载${order.productName}的订单凭证`);

            // 实际项目中应该使用如下代码触发下载
            /*
            const link = document.createElement('a');
            link.href = order.voucherUrl;
            link.download = `${order.orderNo}_凭证.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            */
        },

        // 判断是否可以申请退款
        canApplyRefund(order) {
            // 只有待确认和已支付但未使用的订单可以申请退款
            return ['pending_confirmation'].includes(order.status) &&
                new Date(order.serviceTime) > new Date();
        },

        // 判断是否可以下载凭证
        canDownloadVoucher(order) {
            // 已支付且有凭证的订单可以下载
            return order.hasVoucher &&
                ['pending_confirmation', 'completed'].includes(order.status);
        }
    }
}
</script>

<style scoped>
.page-title {
    font-size: 24px;
    font-weight: light;
    margin-bottom: 20px;
}

.order-management-container {
    padding: 20px;
    /* background-color: #f5f7fa; */
    min-height: calc(100vh - 60px);
}

.filter-card {
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: #fff;
}

.orders-card {
    background-color: #fff;
}

.filter-actions {
    text-align: right;
}

.order-detail {
    margin-top: 20px;
}

.detail-section {
    margin-bottom: 25px;
}

.detail-section h3 {
    font-size: 16px;
    color: #303133;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e4e7ed;
}

.el-upload--picture-card {
    width: 100px;
    height: 100px;
}

.el-upload-list--picture-card .el-upload-list__item {
    width: 100px;
    height: 100px;
}

::v-deep .el-input__inner {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

@media screen and (max-width: 768px) {
    .filter-card .el-col {
        margin-bottom: 10px;
    }
}

.reset-button {
    margin-top: 6px;
}

/* 让筛选区域在 el-main 内固定 */
.sticky-filter {
    position: sticky;
    top: 0;
    /* 吸顶到 el-main 顶部 */
    z-index: 99;
    /* 保证在表格之上 */
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>