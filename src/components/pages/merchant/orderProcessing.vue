<template>
  <div class="order-processing">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">订单处理</h1>
      <p class="subtitle">管理游客订单，处理订单变更和退款申请</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-panel">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
            <div class="stat-icon pending">
              <i class="el-icon-time"></i>
            </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待确认</div>
            </div>
          </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
            <div class="stat-icon confirmed">
              <i class="el-icon-check"></i>
            </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.confirmed }}</div>
              <div class="stat-label">已确认</div>
            </div>
          </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
            <div class="stat-icon completed">
              <i class="el-icon-circle-check"></i>
            </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
            <div class="stat-icon refunding">
              <i class="el-icon-refresh"></i>
            </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.refunding }}</div>
              <div class="stat-label">退款中</div>
            </div>
          </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-container">
        <div class="filter-header">
          <div class="filter-title">
            <i class="el-icon-search"></i>
            <span>筛选条件</span>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="searchOrders" class="search-btn">
              <i class="el-icon-search"></i>
              搜索
            </el-button>
            <el-button @click="resetFilters" class="reset-btn">
              <i class="el-icon-refresh"></i>
              重置
            </el-button>
          </div>
        </div>
        
        <div class="filter-content">
          <div class="filter-row">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-s-order"></i>
                <span>订单状态</span>
              </div>
              <el-select v-model="filters.status" placeholder="请选择订单状态" clearable class="filter-select">
                <el-option label="全部状态" value=""></el-option>
                <el-option label="待确认" value="pending">
                  <span style="float: left">待确认</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">等待商家确认</span>
                </el-option>
                <el-option label="已确认" value="confirmed">
                  <span style="float: left">已确认</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">商家已确认</span>
                </el-option>
                <el-option label="已完成" value="completed">
                  <span style="float: left">已完成</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">订单已完成</span>
                </el-option>
                <el-option label="退款中" value="refunding">
                  <span style="float: left">退款中</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">正在处理退款</span>
                </el-option>
                <el-option label="已退款" value="refunded">
                  <span style="float: left">已退款</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">退款已完成</span>
                </el-option>
              </el-select>
            </div>
            
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-goods"></i>
                <span>产品类型</span>
              </div>
              <el-select v-model="filters.productType" placeholder="请选择产品类型" clearable class="filter-select">
                <el-option label="全部类型" value=""></el-option>
                <el-option label="酒店客房" value="hotel">
                  <span style="float: left">酒店客房</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">住宿服务</span>
                </el-option>
                <el-option label="旅行路线" value="route">
                  <span style="float: left">旅行路线</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">旅游套餐</span>
                </el-option>
                <el-option label="门票" value="ticket">
                  <span style="float: left">门票</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">景点门票</span>
                </el-option>
              </el-select>
            </div>
            
            <div class="filter-item date-filter-item">
              <div class="filter-label">
                <i class="el-icon-date"></i>
                <span>下单时间</span>
              </div>
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="filter-date-picker"
                style="width: 100%; min-width: 320px;">
              </el-date-picker>
            </div>
            
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-search"></i>
                <span>关键词搜索</span>
              </div>
              <el-input
                v-model="filters.keyword"
                placeholder="输入订单号或客户姓名"
                prefix-icon="el-icon-search"
                clearable
                class="filter-input">
              </el-input>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-buttons-row">
        <el-button type="success" @click="batchConfirm" class="action-btn">
        <i class="el-icon-check"></i> 批量确认
      </el-button>
        <el-button type="info" @click="exportOrders" class="action-btn">
        <i class="el-icon-download"></i> 导出订单
      </el-button>
        <el-button type="warning" @click="showRefundDialog = true" class="action-btn">
        <i class="el-icon-refresh"></i> 批量退款
      </el-button>
      </div>
      <div class="action-right" v-if="selectedOrders.length > 0">
        <span class="selected-count">已选择 {{ selectedOrders.length }} 项</span>
        <el-button size="small" @click="batchConfirm">批量确认</el-button>
        <el-button size="small" type="warning" @click="showRefundDialog = true">批量退款</el-button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <el-table 
        :data="filteredOrders" 
        v-loading="loading" 
        stripe 
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f8f9fa', color: '#495057', fontWeight: '600', textAlign: 'center' }"
        :cell-style="{ padding: '16px 12px', textAlign: 'center' }"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="180" fixed="left">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewOrderDetail(scope.row)">{{ scope.row.orderNo || 'ORD' + scope.row.orderId }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户姓名" width="120">
          <template slot-scope="scope">
            {{ scope.row.customerName || scope.row.receiverName || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="customerPhone" label="联系电话" width="130">
          <template slot-scope="scope">
            {{ scope.row.customerPhone || scope.row.receiverPhone || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="250" align="center">
          <template slot-scope="scope">
            <div class="product-info">
              <el-image 
                :src="scope.row.productImage || '/src/assets/images/travel.jpg'" 
                class="product-image"
                :preview-src-list="[scope.row.productImage || '/src/assets/images/travel.jpg']"
                fit="cover">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div class="product-details">
                <div class="product-name">{{ scope.row.productName }}</div>
                <div class="product-type">
                  <el-tag :type="getTypeTagType(scope.row.productType)" size="mini">
                    {{ getTypeName(scope.row.productType) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80">
          <template slot-scope="scope">
            {{ scope.row.productQuantity || scope.row.travellers || 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template slot-scope="scope">
            <span class="amount">¥{{ scope.row.totalAmount || scope.row.totalPrice || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" width="160">
          <template slot-scope="scope">
            {{ scope.row.createTime || scope.row.orderTime || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="useTime" label="使用时间" width="160">
          <template slot-scope="scope">
            {{ scope.row.useTime || scope.row.bookingDate || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.orderStatus || scope.row.status)" size="mini">
              {{ getStatusName(scope.row.orderStatus || scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button size="mini" @click="viewOrderDetail(scope.row)" class="action-btn detail-btn">
                <i class="el-icon-view"></i> 详情
              </el-button>
              <!-- 调试信息 -->
              <span style="font-size: 10px; color: #999; display: block;">
                状态: {{ scope.row.orderStatus || scope.row.status }} 
                (类型: {{ typeof (scope.row.orderStatus || scope.row.status) }})
              </span>
            <el-button 
              size="mini" 
              type="success" 
              v-if="(scope.row.orderStatus || scope.row.status) === 0 || (scope.row.orderStatus || scope.row.status) === 'pending'"
                @click="confirmOrder(scope.row)"
                class="action-btn confirm-btn">
                <i class="el-icon-check"></i> 确认
            </el-button>
            <el-button 
              size="mini" 
              type="warning" 
              v-if="(scope.row.orderStatus || scope.row.status) === 1 || (scope.row.orderStatus || scope.row.status) === 'confirmed'"
                @click="completeOrder(scope.row)"
                class="action-btn complete-btn">
                <i class="el-icon-circle-check"></i> 完成
            </el-button>
            <el-button 
              size="mini" 
              type="danger" 
              v-if="((scope.row.orderStatus || scope.row.status) === 0 || (scope.row.orderStatus || scope.row.status) === 'pending') || ((scope.row.orderStatus || scope.row.status) === 1 || (scope.row.orderStatus || scope.row.status) === 'confirmed')"
                @click="refundOrder(scope.row)"
                class="action-btn refund-btn">
                <i class="el-icon-refresh"></i> 退款
            </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="showOrderDialog" width="800px">
      <div v-if="selectedOrder" class="order-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="detail-section">
              <h3>订单信息</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">订单号：</span>
                    <span>{{ selectedOrder.orderNo }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">下单时间：</span>
                    <span>{{ selectedOrder.orderTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">订单状态：</span>
                    <el-tag :type="getStatusTagType(selectedOrder.status)">
                      {{ getStatusName(selectedOrder.status) }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">支付方式：</span>
                    <span>{{ selectedOrder.paymentMethod }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">总金额：</span>
                    <span class="amount">¥{{ selectedOrder.totalAmount }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">优惠金额：</span>
                    <span>¥{{ selectedOrder.discountAmount || 0 }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">实付金额：</span>
                    <span class="amount">¥{{ selectedOrder.paidAmount }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">使用时间：</span>
                    <span>{{ selectedOrder.useTime }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>

            <div class="detail-section">
              <h3>客户信息</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">客户姓名：</span>
                    <span>{{ selectedOrder.customerName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">联系电话：</span>
                    <span>{{ selectedOrder.customerPhone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">身份证号：</span>
                    <span>{{ selectedOrder.customerIdCard }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">邮箱：</span>
                    <span>{{ selectedOrder.customerEmail }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">紧急联系人：</span>
                    <span>{{ selectedOrder.emergencyContact }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">紧急联系电话：</span>
                    <span>{{ selectedOrder.emergencyPhone }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>

            <div class="detail-section">
              <h3>产品信息</h3>
              <div class="product-detail">
                <img :src="selectedOrder.productImage" class="product-detail-image" />
                <div class="product-detail-info">
                  <h4>{{ selectedOrder.productName }}</h4>
                  <p>{{ selectedOrder.productDescription }}</p>
                  <div class="product-specs">
                    <div v-if="selectedOrder.specialRequirements">
                      <span class="label">特殊需求：</span>
                      <span>{{ selectedOrder.specialRequirements }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="订单变更" name="changes">
            <div class="changes-section">
              <div v-if="selectedOrder.changes && selectedOrder.changes.length">
                <div v-for="change in selectedOrder.changes" :key="change.id" class="change-item">
                  <div class="change-header">
                    <span class="change-type">{{ change.type }}</span>
                    <span class="change-time">{{ change.time }}</span>
                    <el-tag :type="getChangeStatusTagType(change.status)" size="mini">
                      {{ getChangeStatusName(change.status) }}
                    </el-tag>
                  </div>
                  <div class="change-content">
                    <p><strong>变更原因：</strong>{{ change.reason }}</p>
                    <p><strong>变更内容：</strong>{{ change.content }}</p>
                    <div v-if="change.status === 'pending'" class="change-actions">
                      <el-button size="mini" type="success" @click="approveChange(change)">同意</el-button>
                      <el-button size="mini" type="danger" @click="rejectChange(change)">拒绝</el-button>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无订单变更记录"></el-empty>
            </div>
          </el-tab-pane>

          <el-tab-pane label="退款记录" name="refunds">
            <div class="refunds-section">
              <div v-if="selectedOrder.refunds && selectedOrder.refunds.length">
                <div v-for="refund in selectedOrder.refunds" :key="refund.id" class="refund-item">
                  <div class="refund-header">
                    <span class="refund-amount">¥{{ refund.amount }}</span>
                    <span class="refund-time">{{ refund.time }}</span>
                    <el-tag :type="getRefundStatusTagType(refund.status)" size="mini">
                      {{ getRefundStatusName(refund.status) }}
                    </el-tag>
                  </div>
                  <div class="refund-content">
                    <p><strong>退款原因：</strong>{{ refund.reason }}</p>
                    <p><strong>退款说明：</strong>{{ refund.description }}</p>
                    <div v-if="refund.status === 'pending'" class="refund-actions">
                      <el-button size="mini" type="success" @click="approveRefund(refund)">同意退款</el-button>
                      <el-button size="mini" type="danger" @click="rejectRefund(refund)">拒绝退款</el-button>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无退款记录"></el-empty>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showOrderDialog = false">关闭</el-button>
        <el-button type="primary" @click="printOrder">打印订单</el-button>
      </div>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog title="处理退款" :visible.sync="showRefundDialog" width="600px">
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="退款金额">
          <el-input-number v-model="refundForm.amount" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        <el-form-item label="退款原因">
          <el-select v-model="refundForm.reason" placeholder="选择退款原因">
            <el-option label="客户取消" value="customer_cancel"></el-option>
            <el-option label="产品问题" value="product_issue"></el-option>
            <el-option label="服务问题" value="service_issue"></el-option>
            <el-option label="其他原因" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="退款说明">
          <el-input type="textarea" v-model="refundForm.description" :rows="3" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showRefundDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRefund">确认退款</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'OrderProcessing',
  data() {
    return {
      loading: false,
      showOrderDialog: false,
      showRefundDialog: false,
      selectedOrder: null,
      activeTab: 'basic',
      selectedOrders: [],
      filters: {
        status: '',
        productType: '',
        dateRange: [],
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      refundForm: {
        amount: 0,
        reason: '',
        description: ''
      },
      stats: {
        pending: 0,
        confirmed: 0,
        completed: 0,
        refunding: 0
      },
      orders: []
    }
  },
  computed: {
    filteredOrders() {
      return this.orders;
    }
  },
  mounted() {
    this.loadOrderStatistics();
    this.loadOrders();
  },
  methods: {
    // API基础配置
    getApiBaseUrl() {
      return '/travel-admin';
    },

    // 加载订单统计信息
    async loadOrderStatistics() {
      try {
        const response = await request.get(`${this.getApiBaseUrl()}/order/statistics`);
        if (response.data.code === 1) {
          this.stats = {
            pending: response.data.data.pending || 0,
            confirmed: response.data.data.confirmed || 0,
            completed: response.data.data.completed || 0,
            refunding: response.data.data.refunding || 0
          };
        }
      } catch (error) {
        console.error('加载订单统计失败:', error);
        this.$message.error('加载统计信息失败');
      }
    },

    // 加载订单列表
    async loadOrders() {
      this.loading = true;
      try {
        const searchParams = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize,
          status: this.filters.status || null,
          productType: this.filters.productType || null,
          keyword: this.filters.keyword || null,
          startDate: this.filters.dateRange && this.filters.dateRange.length > 0 ? this.filters.dateRange[0] : null,
          endDate: this.filters.dateRange && this.filters.dateRange.length > 1 ? this.filters.dateRange[1] : null
        };

        const response = await request.post(`${this.getApiBaseUrl()}/order/page`, searchParams);
        if (response.data.code === 1) {
          this.orders = response.data.data.records || [];
          this.pagination.total = response.data.data.total || 0;
          // 调试：打印订单数据结构
          console.log('订单数据:', this.orders);
          if (this.orders.length > 0) {
            console.log('第一个订单的状态字段:', {
              orderStatus: this.orders[0].orderStatus,
              status: this.orders[0].status,
              allFields: Object.keys(this.orders[0])
            });
          }
        } else {
          this.$message.error(response.data.msg || '加载订单失败');
        }
      } catch (error) {
        console.error('加载订单失败:', error);
        this.$message.error('加载订单失败');
      } finally {
        this.loading = false;
      }
    },

    searchOrders() {
      this.pagination.currentPage = 1;
      this.loadOrders();
    },
    
    resetFilters() {
      this.filters = {
        status: '',
        productType: '',
        dateRange: [],
        keyword: ''
      };
      this.pagination.currentPage = 1;
      this.loadOrders();
    },
    
    getTypeName(type) {
      const typeMap = {
        hotel: '酒店客房',
        route: '旅行路线',
        ticket: '门票'
      };
      return typeMap[type] || type;
    },
    
    getTypeTagType(type) {
      const typeMap = {
        hotel: 'primary',
        route: 'success',
        ticket: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getStatusName(status) {
      if (typeof status === 'string') {
        const statusMap = {
          pending: '待确认',
          confirmed: '已确认',
          completed: '已完成',
          refunding: '退款中',
          refunded: '已退款'
        };
        return statusMap[status] || status;
      } else if (typeof status === 'number') {
        const statusMap = {
          0: '待确认',
          1: '已确认',
          2: '已完成',
          3: '已取消',
          4: '退款中'
        };
        return statusMap[status] || '未知';
      }
      return status;
    },
    
    getStatusTagType(status) {
      if (typeof status === 'string') {
        const statusMap = {
          pending: 'warning',
          confirmed: 'primary',
          completed: 'success',
          refunding: 'info',
          refunded: 'danger'
        };
        return statusMap[status] || 'info';
      } else if (typeof status === 'number') {
        const statusMap = {
          0: 'warning',
          1: 'primary',
          2: 'success',
          3: 'info',
          4: 'danger'
        };
        return statusMap[status] || 'info';
      }
      return 'info';
    },
    
    getChangeStatusName(status) {
      const statusMap = {
        pending: '待处理',
        approved: '已同意',
        rejected: '已拒绝'
      };
      return statusMap[status] || status;
    },
    
    getChangeStatusTagType(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    getRefundStatusName(status) {
      const statusMap = {
        pending: '待处理',
        approved: '已同意',
        rejected: '已拒绝',
        completed: '已完成'
      };
      return statusMap[status] || status;
    },
    
    getRefundStatusTagType(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        completed: 'info'
      };
      return statusMap[status] || 'info';
    },
    
    handleSelectionChange(selection) {
      this.selectedOrders = selection;
    },
    
    async viewOrderDetail(order) {
      try {
        const response = await request.get(`${this.getApiBaseUrl()}/order/detail/${order.orderId}`);
        if (response.data.code === 1) {
          this.selectedOrder = response.data.data;
          this.showOrderDialog = true;
          this.activeTab = 'basic';
        } else {
          this.$message.error(response.data.msg || '获取订单详情失败');
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        this.$message.error('获取订单详情失败');
      }
    },
    
    async confirmOrder(order) {
      this.$confirm('确定要确认这个订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await request.put(`${this.getApiBaseUrl()}/order/confirm/${order.orderId}`);
          if (response.data.code === 1) {
            this.$message.success('订单确认成功');
            this.loadOrders();
            this.loadOrderStatistics();
          } else {
            this.$message.error(response.data.msg || '订单确认失败');
          }
        } catch (error) {
          console.error('确认订单失败:', error);
          this.$message.error('订单确认失败');
        }
      });
    },
    
    async completeOrder(order) {
      this.$confirm('确定要完成这个订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await request.put(`${this.getApiBaseUrl()}/order/complete/${order.orderId}`);
          if (response.data.code === 1) {
            this.$message.success('订单完成');
            this.loadOrders();
            this.loadOrderStatistics();
          } else {
            this.$message.error(response.data.msg || '订单完成失败');
          }
        } catch (error) {
          console.error('完成订单失败:', error);
          this.$message.error('订单完成失败');
        }
      });
    },
    
    refundOrder(order) {
      this.refundForm.amount = order.totalAmount || order.paidAmount;
      this.selectedOrder = order;
      this.showRefundDialog = true;
    },
    
    async submitRefund() {
      this.$confirm('确定要处理这个退款申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const refundData = {
            orderId: this.selectedOrder.orderId,
            amount: this.refundForm.amount,
            reason: this.refundForm.reason,
            description: this.refundForm.description,
            refundType: this.refundForm.reason
          };

          const response = await request.post(`${this.getApiBaseUrl()}/order/refund`, refundData);
          if (response.data.code === 1) {
            this.showRefundDialog = false;
            this.$message.success('退款申请已提交');
            this.resetRefundForm();
            this.loadOrders();
            this.loadOrderStatistics();
          } else {
            this.$message.error(response.data.msg || '退款申请失败');
          }
        } catch (error) {
          console.error('提交退款失败:', error);
          this.$message.error('退款申请失败');
        }
      });
    },
    
    approveRefund(refund) {
      refund.status = 'approved';
      this.$message.success('退款申请已同意');
    },
    
    rejectRefund(refund) {
      refund.status = 'rejected';
      this.$message.success('退款申请已拒绝');
    },
    
    approveChange(change) {
      change.status = 'approved';
      this.$message.success('变更申请已同意');
    },
    
    rejectChange(change) {
      change.status = 'rejected';
      this.$message.success('变更申请已拒绝');
    },
    
    async batchConfirm() {
      if (this.selectedOrders.length === 0) {
        this.$message.warning('请选择要确认的订单');
        return;
      }
      
      this.$confirm(`确定要批量确认选中的 ${this.selectedOrders.length} 个订单吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const orderIds = this.selectedOrders.map(order => order.orderId);
          const response = await request.put(`${this.getApiBaseUrl()}/order/batch/confirm`, orderIds);
          if (response.data.code === 1) {
            this.$message.success('批量确认成功');
            this.loadOrders();
            this.loadOrderStatistics();
          } else {
            this.$message.error(response.data.msg || '批量确认失败');
          }
        } catch (error) {
          console.error('批量确认失败:', error);
          this.$message.error('批量确认失败');
        }
      });
    },
    
    async exportOrders() {
      try {
        const searchParams = {
          current: 1,
          size: 10000,
          status: this.filters.status || null,
          productType: this.filters.productType || null,
          keyword: this.filters.keyword || null,
          startDate: this.filters.dateRange && this.filters.dateRange.length > 0 ? this.filters.dateRange[0] : null,
          endDate: this.filters.dateRange && this.filters.dateRange.length > 1 ? this.filters.dateRange[1] : null
        };

        const response = await request.post(`${this.getApiBaseUrl()}/order/export`, searchParams);
        if (response.data.code === 1) {
          this.$message.success('订单导出成功');
          // 这里可以添加实际的导出逻辑，比如下载文件
        } else {
          this.$message.error(response.data.msg || '订单导出失败');
        }
      } catch (error) {
        console.error('导出订单失败:', error);
        this.$message.error('订单导出失败');
      }
    },
    
    printOrder() {
      this.$message.success('订单打印成功');
    },
    
    resetRefundForm() {
      this.refundForm = {
        amount: 0,
        reason: '',
        description: ''
      };
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
      this.loadOrders();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.loadOrders();
    }
  }
}
</script>

<style scoped>
.order-processing {
  padding: 24px;
  min-height: 100vh;
}


.page-header {
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 28px;
  color: #1f2d3d;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #8492a6;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}

/* 统计面板样式 */
.stats-panel {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 26px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.confirmed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.refunding {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #8492a6;
  font-weight: 500;
}

/* 操作栏样式 */
.action-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-buttons-row {
  display: flex;
  width: 100%;
  gap: 0;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  flex: 1;
  margin: 0 !important;
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  min-height: 44px;
  font-size: 14px;
}

.action-btn:not(:last-child) {
  margin-right: 12px !important;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn i {
  font-size: 16px;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  color: #409eff;
  font-weight: 600;
  font-size: 14px;
  background: #f0f9ff;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.filter-section {
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.filter-container {
  padding: 0;
}

.filter-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.filter-title i {
  font-size: 20px;
  color: white;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-btn,
.reset-btn {
  height: 40px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  padding: 0 20px;
  min-width: 100px;
}

.search-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.filter-content {
  padding: 24px;
  background: #fafbfc;
}

.filter-row {
  display: flex;
  gap: 16px;
  margin: 0;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  max-width: 280px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.filter-label i {
  color: #3b82f6;
  font-size: 16px;
}

.filter-select,
.filter-input,
.filter-date-picker {
  width: 100%;
}

.filter-select .el-input__inner,
.filter-input .el-input__inner,
.filter-date-picker .el-input__inner {
  border-radius: 10px;
  border: 2px solid #e1e6eb;
  transition: all 0.3s ease;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  background: #fafbfc;
}

.filter-select .el-input__inner:focus,
.filter-input .el-input__inner:focus,
.filter-date-picker .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.filter-select .el-input__inner:hover,
.filter-input .el-input__inner:hover,
.filter-date-picker .el-input__inner:hover {
  border-color: #c0c4cc;
  background: white;
}

/* 日期选择器特殊样式 */
.date-filter-item {
  flex: 1.5 !important;
  min-width: 320px !important;
  max-width: 400px !important;
}

.filter-date-picker {
  width: 100% !important;
  min-width: 320px !important;
}

.filter-date-picker .el-range-editor {
  width: 100% !important;
  min-width: 320px !important;
  height: 40px !important;
  line-height: 40px !important;
  border-radius: 8px !important;
  border: 1px solid #dcdfe6 !important;
  background: white !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 12px !important;
  box-sizing: border-box !important;
}

.filter-date-picker .el-range-editor:hover {
  border-color: #c0c4cc !important;
}

.filter-date-picker .el-range-editor.is-active,
.filter-date-picker .el-range-editor:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.filter-date-picker .el-range-input {
  font-size: 14px !important;
  color: #606266 !important;
  background: transparent !important;
  flex: 1 !important;
  min-width: 120px !important;
  height: 36px !important;
  line-height: 36px !important;
  border: none !important;
  outline: none !important;
}

.filter-date-picker .el-range-input::placeholder {
  color: #c0c4cc !important;
  font-size: 14px !important;
}

.filter-date-picker .el-range-separator {
  color: #606266 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  padding: 0 16px !important;
  line-height: 36px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  min-width: 32px !important;
  text-align: center !important;
  display: inline-block !important;
}

.filter-date-picker .el-range__close-icon {
  margin-left: 8px !important;
  flex-shrink: 0 !important;
}

.order-list {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.product-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
  justify-content: center;
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.product-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.product-details {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.product-name {
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2d3d;
  font-size: 15px;
  line-height: 1.4;
  text-align: center;
  width: 100%;
}

.product-type {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.product-type .el-tag {
  margin: 0;
  border-radius: 20px;
  padding: 4px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
}

.amount {
  font-weight: 600;
  color: #e6a23c;
  font-size: 15px;
}

.pagination {
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
}

.action-btn {
  margin: 0 !important;
  padding: 6px 10px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  min-width: auto !important;
  height: 28px !important;
  line-height: 1 !important;
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.action-btn i {
  margin-right: 4px;
  font-size: 12px;
}

/* 按钮类型样式 */
.detail-btn {
  background: #f8f9fa !important;
  color: #495057 !important;
  border-color: #dee2e6 !important;
}

.detail-btn:hover {
  background: #e9ecef !important;
  border-color: #adb5bd !important;
}

.confirm-btn {
  background: #28a745 !important;
  border-color: #28a745 !important;
}

.confirm-btn:hover {
  background: #218838 !important;
  border-color: #1e7e34 !important;
}

.complete-btn {
  background: #ffc107 !important;
  color: #212529 !important;
  border-color: #ffc107 !important;
}

.complete-btn:hover {
  background: #e0a800 !important;
  border-color: #d39e00 !important;
}

.refund-btn {
  background: #dc3545 !important;
  border-color: #dc3545 !important;
}

.refund-btn:hover {
  background: #c82333 !important;
  border-color: #bd2130 !important;
}

/* 弹窗样式 */
.order-detail {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 30px;
  padding: 24px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e1e6eb;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #e1e6eb;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 100px;
  color: #8492a6;
}

.product-detail {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e6eb;
}

.product-detail-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-detail-info {
  flex: 1;
}

.product-detail-info h4 {
  margin: 0 0 10px 0;
  color: #1f2d3d;
  font-weight: 600;
}

.product-detail-info p {
  color: #8492a6;
  margin-bottom: 15px;
  line-height: 1.5;
}

.product-specs {
  margin-top: 10px;
}

.changes-section,
.refunds-section {
  padding: 20px 0;
}

.change-item,
.refund-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.change-header,
.refund-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 12px;
}

.change-type,
.refund-amount {
  font-weight: 600;
  color: #1f2d3d;
  font-size: 16px;
}

.change-time,
.refund-time {
  color: #8492a6;
  font-size: 14px;
}

.change-content,
.refund-content {
  color: #2c3e50;
  line-height: 1.6;
}

.change-content p,
.refund-content p {
  margin-bottom: 10px;
}

.change-actions,
.refund-actions {
  margin-top: 15px;
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e1e6eb;
}

/* 表格行悬停效果 */
.el-table tbody tr:hover > td {
  background-color: #f8f9fa !important;
}

/* 强制表格内容居中 */
.el-table td {
  text-align: center !important;
}

.el-table th {
  text-align: center !important;
}

/* 筛选区域优化 */
.filter-section .el-select,
.filter-section .el-input,
.filter-section .el-date-editor {
  border-radius: 8px;
}

.filter-section .el-button {
  border-radius: 8px;
  font-weight: 500;
}

/* 统计卡片动画 */
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.stat-card:hover::before {
  left: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-processing {
    padding: 16px;
  }
  
  .page-header,
  .action-bar,
  .filter-section,
  .order-list,
  .pagination {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .stats-panel {
    margin-bottom: 16px;
  }
  
  .stats-panel .el-col {
    margin-bottom: 12px;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-buttons-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-btn {
    width: 100%;
    flex: none;
    margin-right: 0 !important;
  }
  
  .action-right {
    width: 100%;
    justify-content: center;
  }
  
  .filter-section .el-col {
    margin-bottom: 12px;
  }
  
  /* 移动端筛选区域优化 */
  .filter-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
    text-align: center;
  }
  
  .filter-title {
    font-size: 16px;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: center;
  }
  
  .search-btn,
  .reset-btn {
    flex: 1;
    min-width: 120px;
    height: 36px;
    font-size: 14px;
  }
  
  .filter-content {
    padding: 16px;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-item {
    min-width: auto;
    max-width: none;
  }
  
  .date-filter-item {
    min-width: auto !important;
    max-width: none !important;
    flex: none !important;
  }
  
  .filter-group {
    padding: 16px;
  }
  
  .filter-item {
    gap: 8px;
  }
  
  .filter-label {
    font-size: 13px;
  }
  
  .filter-select .el-input__inner,
  .filter-input .el-input__inner,
  .filter-date-picker .el-input__inner {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
  }
  
  /* 移动端日期选择器优化 */
  .filter-date-picker {
    min-width: auto !important;
  }
  
  .filter-date-picker .el-range-editor {
    min-width: auto !important;
    height: 36px !important;
    line-height: 36px !important;
    padding: 0 8px !important;
  }
  
  .filter-date-picker .el-range-separator {
    font-size: 13px !important;
    padding: 0 12px !important;
    line-height: 32px !important;
    min-width: 28px !important;
  }
  
  .filter-date-picker .el-range-input {
    font-size: 13px !important;
    height: 32px !important;
    line-height: 32px !important;
    min-width: 100px !important;
  }
  
  .filter-date-picker .el-range-input::placeholder {
    font-size: 13px !important;
  }
  
  .title {
    font-size: 24px;
  }
  
  .stat-content {
    padding: 16px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  /* 移动端操作按钮优化 */
  .action-buttons {
    gap: 4px;
    justify-content: center;
  }
  
  .action-btn {
    padding: 4px 8px !important;
    font-size: 11px !important;
    height: 24px !important;
  }
  
  .action-btn i {
    margin-right: 2px;
    font-size: 11px;
  }
  
  /* 移动端产品信息优化 */
  .product-info {
    flex-direction: column;
    text-align: center;
  }
  
  .product-image {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .product-details {
    width: 100%;
  }
  
  /* 移动端弹窗优化 */
  .detail-section {
    padding: 16px;
  }
  
  .product-detail {
    flex-direction: column;
    text-align: center;
  }
  
  .product-detail-image {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .change-header,
  .refund-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .change-actions,
  .refund-actions {
    flex-direction: column;
    gap: 8px;
}

.dialog-footer {
    flex-direction: column;
    gap: 12px;
  }
}

/* 弹窗输入框固定大小和去掉右下角图标 */
.fixed-textarea .el-textarea__inner {
  resize: none !important;
  width: 100% !important;
  min-height: 80px !important;
  max-height: 80px !important;
}

.fixed-textarea .el-textarea__inner::-webkit-resizer {
  display: none !important;
}

/* 所有弹窗中的输入框 */
.el-dialog .el-input__inner,
.el-dialog .el-textarea__inner {
  width: 100% !important;
  resize: none !important;
}

.el-dialog .el-textarea__inner::-webkit-resizer {
  display: none !important;
}
</style>
