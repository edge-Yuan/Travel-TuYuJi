<template>
  <div class="order-management-container">
    <h3 class="page-title">订单管理</h3>

    <!-- 筛选区域 -->
    <el-card class="filter-card sticky-filter" shadow="never">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="selectedStatus" placeholder="订单状态" clearable @change="handleStatusChange">
            <el-option label="待确认" :value="0" />
            <el-option label="已确认" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
            <el-option label="修改待确认/退款中" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input v-model="searchKeyword" placeholder="搜索订单号/产品名称" clearable @keyup.enter.native="handleSearch" style="width: 100%; min-width: 240px;">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-col>
        <el-col :span="10" class="filter-actions">
          <el-button type="primary" @click="resetFilters" size="mini" class="reset-button">重置筛选</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="orders-card" shadow="never">
      <el-table :data="pagedOrders" border v-loading="loading" element-loading-text="加载中..." style="width: 100%;" :row-class-name="getOrderRowClass">
        <el-table-column prop="orderNumber" label="订单号" width="180" sortable header-align="center" align="center" />
        <el-table-column prop="productName" label="产品/服务名称" sortable header-align="center" align="center" />
        <el-table-column prop="totalPrice" label="支付金额" width="120" sortable header-align="center" align="center">
          <template slot-scope="scope">¥{{ formatAmount(scope.row.totalPrice) }}</template>
        </el-table-column>
        <el-table-column prop="provider" label="服务提供商" width="180" header-align="center" align="center">
          <template slot-scope="scope">{{ scope.row.supplier || '-' }}</template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="140" sortable header-align="center" align="center">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.orderStatus)" size="small">{{ statusText(scope.row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payStatus" label="支付状态" width="120" sortable header-align="center" align="center">
          <template slot-scope="scope">
            <el-tag :type="paymentStatusTagType(scope.row.payStatus || scope.row.paymentStatus)" size="small">
              {{ paymentStatusText(scope.row.payStatus || scope.row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable header-align="center" align="center">
          <template slot-scope="scope">{{ formatDateTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="320" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewOrderDetail(scope.row)">查看详情</el-button>
            <el-button type="text" size="small" @click="openEvaluationDialog(scope.row)" :disabled="!canEvaluate(scope.row)" style="color: #67C23A;">评价订单</el-button>
            <el-button type="text" size="small" @click="openRefundDialog(scope.row)" :disabled="!canApplyRefund(scope.row)" style="color: #F56C6C;">申请退款</el-button>
            <el-button type="text" size="small" @click="cancelOrder(scope.row)" :disabled="!canCancel(scope.row)">取消订单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="filteredOrders.length" layout="total, sizes, prev, pager, next, jumper" style="margin-top: 15px; text-align: right;"></el-pagination>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="70%" :close-on-click-modal="false">
      <div class="order-detail">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="detail-section">
              <h3>产品信息</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="产品名称">{{ currentOrder.productName }}</el-descriptions-item>
                <el-descriptions-item label="产品描述">{{ currentOrder.productDescription }}</el-descriptions-item>
                <el-descriptions-item label="人数">{{ currentOrder.travellers || 0 }}</el-descriptions-item>
                <el-descriptions-item label="出行日期">{{ formatDate(currentOrder.bookingDate) }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="detail-section">
              <h3>订单信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="订单号">{{ currentOrder.orderNumber }}</el-descriptions-item>
                <el-descriptions-item label="订单状态">
                  <el-tag :type="statusTagType(currentOrder.orderStatus)">{{ statusText(currentOrder.orderStatus) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="支付状态">
                  <el-tag :type="paymentStatusTagType(currentOrder.payStatus || currentOrder.paymentStatus)">
                    {{ paymentStatusText(currentOrder.payStatus || currentOrder.paymentStatus) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDateTime(currentOrder.createTime) }}</el-descriptions-item>
                <el-descriptions-item label="支付时间">{{ formatDateTime(currentOrder.payTime) || '-' }}</el-descriptions-item>
                <el-descriptions-item label="取消时间">{{ formatDateTime(currentOrder.cancelTime) || '-' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="detail-section">
              <h3>金额信息</h3>
              <el-card>
              <el-descriptions :column="1">
                  <el-descriptions-item label="总价">¥{{ formatAmount(currentOrder.totalPrice) }}</el-descriptions-item>
                  <el-descriptions-item label="退款金额">-¥{{ formatAmount(currentOrder.refundAmount) }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
            </div>

            <div class="detail-section">
              <h3>联系信息</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="服务提供商">{{ currentOrder.supplier || '-' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 退款申请对话框（展示退款信息并指引使用取消接口） -->
    <el-dialog title="申请退款" :visible.sync="refundDialogVisible" width="50%" :close-on-click-modal="false">
      <div v-if="refundInfoLoading" class="loading-container">
        <el-loading-spinner class="loading-spinner"></el-loading-spinner>
        <p class="loading-text">正在计算退款信息...</p>
      </div>
      <div v-else>
        <el-descriptions v-if="refundInfo" column="1" border>
          <el-descriptions-item label="预计退款比例">{{ refundInfo.refundPercentage }}%</el-descriptions-item>
          <el-descriptions-item label="预计退款金额">¥{{ formatAmount(refundInfo.refundAmount) }}</el-descriptions-item>
          <el-descriptions-item label="退款政策">{{ refundInfo.refundPolicy }}</el-descriptions-item>
          <el-descriptions-item label="预计到账天数">{{ refundInfo.refundDays }} 天</el-descriptions-item>
        </el-descriptions>

        <el-form :model="refundForm" :rules="refundRules" ref="refundForm" label-width="100px" style="margin-top: 12px;">
          <el-form-item label="订单号">
            <el-input v-model="refundForm.orderNumber" disabled />
          </el-form-item>
          <el-form-item label="退款原因" prop="reason">
            <el-select v-model="refundForm.reason" placeholder="请选择退款原因" style="width: 100%;">
              <el-option label="产品与描述不符" value="description_mismatch" />
              <el-option label="价格原因" value="price_issue" />
              <el-option label="行程变更" value="itinerary_change" />
              <el-option label="重复购买" value="duplicate_purchase" />
              <el-option label="其他原因" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细说明" prop="description">
            <el-input v-model="refundForm.description" type="textarea" rows="4" placeholder="请详细描述退款原因" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRefundApplication" :loading="submitRefundLoading" style="margin-left: 10px;">提交申请</el-button>
      </div>
    </el-dialog>

    <!-- 订单评价组件 -->
    <order-evaluation
      :visible.sync="evaluationDialogVisible"
      :order-data="currentEvaluationOrder"
      @evaluation-success="handleEvaluationSuccess"
    />
  </div>
</template>

<script>
import request from '@/utils/request'
import debugHelper from '@/utils/debugHelper'
import OrderEvaluation from './orderEvaluation.vue'

export default {
  name: 'OrderManagement',
  components: {
    OrderEvaluation
  },
  data() {
    return {
      loading: false,
      currentUserId: null,
      orders: [],
      filteredOrders: [],

      // 查询条件
      selectedStatus: '', // Byte 映射：0待确认 1已确认 2已完成 3已取消 4修改待确认/退款中
      searchKeyword: '',

      // 分页
      currentPage: 1,
      pageSize: 10,

      // 详情
      detailDialogVisible: false,
      currentOrder: {},

      // 退款
      refundDialogVisible: false,
      refundInfoLoading: false,
      refundInfo: null,
      refundForm: {
        orderId: null,
        orderNumber: '',
        reason: '',
        description: ''
      },
      refundRules: {
        reason: [{ required: true, message: '请选择退款原因', trigger: 'change' }],
        description: [
          { required: true, message: '请填写详细说明', trigger: 'blur' },
          { min: 10, message: '详细说明至少10个字符', trigger: 'blur' }
        ]
      },
      submitRefundLoading: false,
      highlightedOrderId: null, // 需要高亮的订单ID
      
      // 评价相关
      evaluationDialogVisible: false,
      currentEvaluationOrder: {}
    }
  },
  created() {
    this.initUserId()
    // 即使未登录也不弹错，页面空列表展示；需要操作时再校验
    this.loadOrders()
    
    // 检查是否需要高亮显示特定订单
    this.checkHighlightOrder()
  },
  computed: {
    pagedOrders() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredOrders.slice(start, end)
    }
  },
  methods: {
    unwrapResponse(res) {
      const body = res && (res.data || res)
      return body && (body.data || body.result || body)
    },
    initUserId() {
      try {
        const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } }
        const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || null

        // 1. 首先尝试从userInfo中获取
        const userInfo = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'))
        if (userInfo) {
          this.currentUserId = pickId(userInfo)
          console.log('[OrderManage] userInfo found -> currentUserId:', this.currentUserId)
        }
        
        // 2. 如果userInfo中没有，尝试从单独的userId存储中获取
        if (!this.currentUserId) {
          const storedId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || 
                          localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId')
          if (storedId) {
            this.currentUserId = Number(storedId)
            console.log('[OrderManage] stored userId found:', this.currentUserId)
          }
        }
        
        // 3. 如果还是没有，尝试从token中解析
        if (!this.currentUserId) {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token')
          if (token && token.includes('.')) {
            try {
              const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
              const payload = JSON.parse(atob(cleanToken.split('.')[1]))
              this.currentUserId = payload.userId || payload.id || payload.sub || payload.user_id || null
              console.log('[OrderManage] token payload -> currentUserId:', this.currentUserId)
            } catch (e) {
              console.warn('[OrderManage] token decode failed', e)
            }
          }
        }
        
        // 4. 如果获取到了userId，持久化存储
        if (this.currentUserId) {
          try { 
            localStorage.setItem('userId', String(this.currentUserId))
            localStorage.setItem('currentUserId', String(this.currentUserId))
          } catch (e) { 
            console.warn('[OrderManage] persist userId failed', e) 
          }
        } else {
          console.warn('[OrderManage] 无法获取用户ID，用户可能未登录')
        }
      } catch (e) {
        console.error('[OrderManage] 获取用户信息失败:', e)
        this.$message.error('获取用户信息失败')
      }
    },
    ensureLoggedIn() {
      if (!this.currentUserId) { this.$message.warning('请先登录后再进行操作'); return false }
      return true
    },
    // 加载订单数据
    async loadOrders() {
      this.loading = true
      try {
        // 优先按用户查
        if (!this.currentUserId) { this.orders = []; this.filteredOrders = []; return }
        
        // 使用调试工具
        debugHelper.checkUserId();
        
        console.log('开始加载订单列表，用户ID:', this.currentUserId);
        console.log('请求URL:', `/travel-portal/tourOrder/user/${this.currentUserId}`);
        
        debugHelper.logApiRequest(`/travel-portal/tourOrder/user/${this.currentUserId}`, {});
        
        const res = await request.get(`/travel-portal/tourOrder/user/${this.currentUserId}`)
        
        debugHelper.logApiResponse(res, '订单列表API响应');
        
        const payload = this.unwrapResponse(res)
        debugHelper.logDataParsing(res.data, payload, '订单数据解析');
        
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.records) ? payload.records : [])
        console.log('订单列表数据:', list);
        
        // 检查状态映射和字段
        if (Array.isArray(list) && list.length > 0) {
          const statusMaps = {
            '订单状态映射': {
              0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消', 4: '修改待确认/退款中'
            },
            '支付状态映射': {
              0: '未支付', 1: '已支付', 2: '支付失败', 3: '退款中', 4: '已退款'
            }
          };
          debugHelper.checkStatusMapping(list[0].orderStatus, statusMaps);
          debugHelper.checkFieldMapping(list[0], ['orderId', 'orderStatus', 'payStatus', 'paymentStatus', 'productId', 'totalPrice', 'createTime']);
          
          // 检查支付状态字段
          console.log('=== 订单支付状态字段检查 ===');
          console.log('订单数据:', list[0]);
          console.log('payStatus字段值:', list[0].payStatus);
          console.log('paymentStatus字段值:', list[0].paymentStatus);
          console.log('是否有payStatus字段:', 'payStatus' in list[0]);
          console.log('是否有paymentStatus字段:', 'paymentStatus' in list[0]);
          console.log('所有字段名:', Object.keys(list[0]));
          
          // 检查支付状态映射
          if (list[0].payStatus !== undefined) {
            console.log('使用payStatus字段，值:', list[0].payStatus, '映射为:', this.paymentStatusText(list[0].payStatus));
          } else if (list[0].paymentStatus !== undefined) {
            console.log('使用paymentStatus字段，值:', list[0].paymentStatus, '映射为:', this.paymentStatusText(list[0].paymentStatus));
          } else {
            console.log('警告：没有找到支付状态字段！');
          }
        }
        
        // 补充产品名称/供应商
        const enriched = await this.enrichOrdersWithProduct(list)
        this.orders = enriched.map(o => ({
          ...o,
          orderNumber: `TRIP${o.orderId}`
        }))
        this.filteredOrders = this.orders.slice()
        
        console.log('最终订单数据:', this.orders);
      } catch (e) {
        console.error('获取订单失败:', e);
        this.$message.error(e.message || '获取订单失败')
      } finally {
        this.loading = false
      }
    },

    async enrichOrdersWithProduct(orderList) {
      const results = []
      for (const order of orderList) {
        let productName = ''
        let productDescription = ''
        let supplier = ''
        if (order.productId) {
          try {
            const prodRes = await request.get(`/travel-portal/tourProduct/getProductDetail/${order.productId}`)
            const prod = this.unwrapResponse(prodRes)
            if (prod) {
              productName = prod.productName || prod.name || ''
              productDescription = prod.description || prod.desc || ''
              supplier = prod.supplier || prod.provider || ''
            }
          } catch (e) {
            // 获取产品详情失败时忽略，继续处理其他订单
            console.warn('获取产品详情失败', e);
          }
        }
        results.push({ ...order, productName, productDescription, supplier })
      }
      return results
    },

    formatAmount(v) {
      const n = Number(v || 0)
      return n.toFixed(2)
    },
    formatDate(d) {
      if (!d) return ''
      try { return String(d).slice(0, 10) } catch { return '' }
    },
    formatDateTime(dt) {
      if (!dt) return ''
      const s = String(dt)
      return s.length > 19 ? s.slice(0, 19).replace('T', ' ') : s.replace('T', ' ')
    },

    // 文本映射（与后端 Byte 状态对齐）
    statusText(status) {
      const map = {
        0: '待确认',
        1: '已确认',
        2: '已完成',
        3: '已取消',
        4: '修改待确认/退款中'
      }
      return map[status] || status
    },
    paymentStatusText(status) {
      const map = {
        0: '未支付',
        1: '已支付',
        2: '支付失败',
        3: '退款中',
        4: '已退款'
      }
      return map[status] || '未知'
    },
    paymentStatusTagType(status) {
      const typeMap = {
        0: 'warning',  // 未支付
        1: 'success',  // 已支付
        2: 'danger',   // 支付失败
        3: 'info',     // 退款中
        4: 'info'      // 已退款
      }
      return typeMap[status] || 'default'
    },
    statusTagType(status) {
      const map = { 0: 'warning', 1: 'info', 2: 'success', 3: 'danger', 4: 'warning' }
      return map[status] || 'default'
    },

    // 过滤与搜索
    handleStatusChange() {
      this.filterOrders()
      this.currentPage = 1
    },
    handleSearch() {
      this.filterOrders()
      this.currentPage = 1
    },
    resetFilters() {
      this.selectedStatus = ''
      this.searchKeyword = ''
      this.filterOrders()
      this.currentPage = 1
    },
    filterOrders() {
      let result = this.orders.slice()
      if (this.selectedStatus !== '' && this.selectedStatus !== null && this.selectedStatus !== undefined) {
        result = result.filter(o => Number(o.orderStatus) === Number(this.selectedStatus))
      }
      if (this.searchKeyword) {
        const kw = this.searchKeyword.toLowerCase()
        result = result.filter(o => String(o.orderNumber || '').toLowerCase().includes(kw) || String(o.productName || '').toLowerCase().includes(kw))
      }
      this.filteredOrders = result
    },

    // 分页
    handleSizeChange(val) { this.pageSize = val },
    handleCurrentChange(val) { this.currentPage = val },

    // 详情
    viewOrderDetail(order) {
      this.currentOrder = { ...order }
      this.detailDialogVisible = true
    },

    // 退款弹窗（先查退款计算）
    async openRefundDialog(order) {
      if (!this.ensureLoggedIn()) return
      this.refundDialogVisible = true
      this.refundInfo = null
      this.refundInfoLoading = true
      this.refundForm = { 
        orderId: order.orderId, 
        orderNumber: order.orderNumber, 
        reason: '', 
        description: '',
        refundAmount: order.totalPrice || 0
      }
      
      try {
        console.log('获取退款信息，订单ID:', order.orderId);
        const response = await request.get(`/travel-portal/itinerary/refund-info/${order.orderId}`, { 
          params: { userId: this.currentUserId } 
        });
        console.log('退款信息API响应:', response);
        
        // 解析响应数据
        const data = response.data || response;
        const refundData = data.data || data.result || data;
        
        // 根据后端接口格式解析数据
        this.refundInfo = {
          refundPercentage: 100, // 默认全额退款
          refundAmount: refundData.refundAmount || order.totalPrice || 0,
          refundPolicy: '根据退款政策，订单取消后可获得全额退款',
          refundDays: 3,
          auditStatus: refundData.auditStatus || 0,
          auditRemark: refundData.auditRemark || '',
          applyTime: refundData.applyTime || ''
        };
        
        console.log('解析后的退款信息:', this.refundInfo);
      } catch (e) {
        console.error('获取退款信息失败:', e);
        this.$message.warning('获取退款信息失败，使用默认退款信息');
        
        // 使用模拟退款信息
        this.refundInfo = {
          refundPercentage: 100,
          refundAmount: order.totalPrice || 0,
          refundPolicy: '根据退款政策，订单取消后可获得全额退款',
          refundDays: 3,
          auditStatus: 0,
          auditRemark: '',
          applyTime: ''
        };
      } finally {
        this.refundInfoLoading = false
      }
    },

    // 提交退款申请（使用专门的退款申请接口）
    submitRefundApplication() {
      this.$refs.refundForm.validate(async valid => {
        if (!valid) return
        if (!this.ensureLoggedIn()) return
        this.submitRefundLoading = true
        
        try {
          console.log('提交退款申请:', this.refundForm);
          
          // 使用退款申请接口
          const payload = {
            orderId: this.refundForm.orderId,
            userId: this.currentUserId,
            refundAmount: this.refundForm.refundAmount || this.refundInfo?.refundAmount || 0,
            refundReason: this.refundForm.reason,
            proofUrls: '', // 暂时为空，后续可扩展
            applyTime: new Date().toISOString()
          };
          
          console.log('退款申请数据:', payload);
          
          const response = await request.post('/travel-portal/refundApply/create', payload);
          console.log('退款申请响应:', response);
          
          this.$message.success('退款申请提交成功，请等待审核');
          this.refundDialogVisible = false
          await this.loadOrders()
        } catch (e) {
          console.error('退款申请失败:', e);
          this.$message.error(e.message || '退款申请提交失败')
        } finally {
          this.submitRefundLoading = false
        }
      })
    },

    // 取消订单（使用取消订单接口）
    async cancelOrder(order) {
      if (!this.canCancel(order)) return
      if (!this.ensureLoggedIn()) return
      
      try {
        console.log('取消订单:', order.orderId);
        
        // 使用取消订单接口
        const payload = { 
          orderId: order.orderId, 
          reason: 'user_cancel', 
          description: '用户主动取消' 
        };
        
        console.log('取消订单数据:', payload);
        
        const response = await request.post('/travel-portal/itinerary/cancel', payload, { 
          params: { userId: this.currentUserId } 
        });
        
        console.log('取消订单响应:', response);
        
        this.$message.success('订单取消成功');
        await this.loadOrders();
      } catch (e) {
        console.error('取消订单失败:', e);
        this.$message.error(e.message || '订单取消失败');
      }
    },

    // 资格判断
    canApplyRefund(order) {
      // 只有已支付且未完成的订单可以申请退款
      const orderStatus = Number(order.orderStatus)
      const payStatus = Number(order.payStatus || order.paymentStatus)
      
      // 已支付且订单状态为待确认或已确认时可以申请退款
      return payStatus === 1 && (orderStatus === 0 || orderStatus === 1)
    },
    canCancel(order) {
      // 未支付订单可以直接取消
      const orderStatus = Number(order.orderStatus)
      const payStatus = Number(order.payStatus || order.paymentStatus)
      
      // 未支付且未完成的订单可以直接取消
      return payStatus === 0 && (orderStatus === 0 || orderStatus === 1)
    },
    
    // 检查是否需要高亮显示特定订单
    checkHighlightOrder() {
      const query = this.$route.query;
      if (query.highlight === 'true' && query.orderId) {
        this.highlightedOrderId = query.orderId;
        
        // 3秒后取消高亮
        setTimeout(() => {
          this.highlightedOrderId = null;
        }, 3000);
      }
    },
    
    // 获取订单行的样式类
    getOrderRowClass(order) {
      if (this.highlightedOrderId && order.orderId == this.highlightedOrderId) {
        return 'highlighted-order';
      }
      return '';
    },
    
    // 评价相关方法
    canEvaluate(order) {
      // 只有已完成的订单才能评价
      const orderStatus = Number(order.orderStatus)
      const payStatus = Number(order.payStatus || order.paymentStatus)
      
      // 订单状态为已完成(2)且已支付(1)的订单可以评价
      return orderStatus === 2 && payStatus === 1
    },
    
    // 打开评价对话框
    openEvaluationDialog(order) {
      if (!this.canEvaluate(order)) {
        this.$message.warning('只有已完成的订单才能评价')
        return
      }
      
      if (!this.ensureLoggedIn()) return
      
      this.currentEvaluationOrder = { ...order }
      this.evaluationDialogVisible = true
    },
    
    // 评价成功回调
    handleEvaluationSuccess(data) {
      console.log('评价成功:', data)
      this.$message.success('评价提交成功！')
      this.evaluationDialogVisible = false
      
      // 重新加载订单列表
      this.loadOrders()
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

/* 高亮订单行样式 */
::v-deep .highlighted-order {
    background-color: #f0f9ff !important;
    border: 2px solid #3b82f6 !important;
    animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
    0% {
        background-color: #dbeafe;
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    50% {
        background-color: #f0f9ff;
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3);
    }
    100% {
        background-color: #f0f9ff;
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
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