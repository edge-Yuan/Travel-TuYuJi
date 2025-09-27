<template>
  <div class="order-processing">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">订单处理</h1>
      <p class="subtitle">管理游客订单，处理订单变更和退款申请</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon pending">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待确认</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon confirmed">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.confirmed }}</div>
              <div class="stat-label">已确认</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon completed">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon refunding">
              <i class="el-icon-refresh"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.refunding }}</div>
              <div class="stat-label">退款中</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-select v-model="filters.status" placeholder="订单状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待确认" value="pending"></el-option>
            <el-option label="已确认" value="confirmed"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="退款中" value="refunding"></el-option>
            <el-option label="已退款" value="refunded"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.productType" placeholder="产品类型" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="酒店客房" value="hotel"></el-option>
            <el-option label="旅行路线" value="route"></el-option>
            <el-option label="门票" value="ticket"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索订单号或客户姓名"
            prefix-icon="el-icon-search"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchOrders">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="success" @click="batchConfirm">
        <i class="el-icon-check"></i> 批量确认
      </el-button>
      <el-button type="info" @click="exportOrders">
        <i class="el-icon-download"></i> 导出订单
      </el-button>
      <el-button type="warning" @click="showRefundDialog = true">
        <i class="el-icon-refresh"></i> 批量退款
      </el-button>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <el-table :data="filteredOrders" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="180" fixed="left">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewOrderDetail(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户姓名" width="120"></el-table-column>
        <el-table-column prop="customerPhone" label="联系电话" width="130"></el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="200">
          <template slot-scope="scope">
            <div class="product-info">
              <img :src="scope.row.productImage" class="product-image" />
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
        <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template slot-scope="scope">
            <span class="amount">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" width="160"></el-table-column>
        <el-table-column prop="useTime" label="使用时间" width="160"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewOrderDetail(scope.row)">详情</el-button>
            <el-button 
              size="mini" 
              type="success" 
              v-if="scope.row.status === 'pending'"
              @click="confirmOrder(scope.row)">
              确认
            </el-button>
            <el-button 
              size="mini" 
              type="warning" 
              v-if="scope.row.status === 'confirmed'"
              @click="completeOrder(scope.row)">
              完成
            </el-button>
            <el-button 
              size="mini" 
              type="danger" 
              v-if="scope.row.status === 'pending' || scope.row.status === 'confirmed'"
              @click="refundOrder(scope.row)">
              退款
            </el-button>
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
          <el-input type="textarea" v-model="refundForm.description" :rows="3"></el-input>
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
        pending: 12,
        confirmed: 45,
        completed: 156,
        refunding: 8
      },
      orders: [
        {
          id: 1,
          orderNo: 'ORD202401150001',
          customerName: '张三',
          customerPhone: '138****1234',
          customerEmail: 'zhangsan@email.com',
          customerIdCard: '110101199001011234',
          emergencyContact: '李四',
          emergencyPhone: '139****5678',
          productName: '豪华海景套房',
          productType: 'hotel',
          productImage: '/src/assets/images/travel.jpg',
          productDescription: '面朝大海的豪华套房，享受无敌海景',
          quantity: 2,
          totalAmount: 2576,
          discountAmount: 200,
          paidAmount: 2376,
          orderTime: '2024-01-15 10:30:00',
          useTime: '2024-01-20 14:00:00',
          status: 'pending',
          paymentMethod: '微信支付',
          specialRequirements: '需要无烟房，高层海景',
          changes: [
            {
              id: 1,
              type: '修改入住日期',
              reason: '行程变更',
              content: '从2024-01-20改为2024-01-22',
              time: '2024-01-16 09:15:00',
              status: 'pending'
            }
          ],
          refunds: []
        },
        {
          id: 2,
          orderNo: 'ORD202401150002',
          customerName: '李四',
          customerPhone: '139****5678',
          customerEmail: 'lisi@email.com',
          customerIdCard: '110101199002021234',
          emergencyContact: '王五',
          emergencyPhone: '137****9012',
          productName: '三亚三日游',
          productType: 'route',
          productImage: '/src/assets/images/travel2.jpg',
          productDescription: '经典三亚三日游，包含主要景点',
          quantity: 1,
          totalAmount: 2588,
          discountAmount: 0,
          paidAmount: 2588,
          orderTime: '2024-01-15 14:20:00',
          useTime: '2024-01-25 08:00:00',
          status: 'confirmed',
          paymentMethod: '支付宝',
          specialRequirements: '需要英文导游',
          changes: [],
          refunds: []
        },
        {
          id: 3,
          orderNo: 'ORD202401150003',
          customerName: '王五',
          customerPhone: '137****9012',
          customerEmail: 'wangwu@email.com',
          customerIdCard: '110101199003031234',
          emergencyContact: '赵六',
          emergencyPhone: '136****3456',
          productName: '故宫门票',
          productType: 'ticket',
          productImage: '/src/assets/images/travel3.jpg',
          productDescription: '故宫博物院门票，感受皇家文化',
          quantity: 4,
          totalAmount: 240,
          discountAmount: 0,
          paidAmount: 240,
          orderTime: '2024-01-15 16:45:00',
          useTime: '2024-01-18 09:00:00',
          status: 'completed',
          paymentMethod: '银行卡',
          specialRequirements: '',
          changes: [],
          refunds: []
        }
      ]
    }
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;
      
      if (this.filters.status) {
        filtered = filtered.filter(order => order.status === this.filters.status);
      }
      
      if (this.filters.productType) {
        filtered = filtered.filter(order => order.productType === this.filters.productType);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(order => 
          order.orderNo.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
          order.customerName.toLowerCase().includes(this.filters.keyword.toLowerCase())
        );
      }
      
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        const startDate = new Date(this.filters.dateRange[0]);
        const endDate = new Date(this.filters.dateRange[1]);
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.orderTime);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }
      
      return filtered;
    }
  },
  watch: {
    filteredOrders: {
      handler(newVal) {
        this.pagination.total = newVal.length;
      },
      immediate: true
    }
  },
  methods: {
    searchOrders() {
      // 搜索逻辑已在computed中实现
    },
    
    resetFilters() {
      this.filters = {
        status: '',
        productType: '',
        dateRange: [],
        keyword: ''
      };
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
      const statusMap = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        refunding: '退款中',
        refunded: '已退款'
      };
      return statusMap[status] || status;
    },
    
    getStatusTagType(status) {
      const statusMap = {
        pending: 'warning',
        confirmed: 'primary',
        completed: 'success',
        refunding: 'info',
        refunded: 'danger'
      };
      return statusMap[status] || 'info';
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
    
    viewOrderDetail(order) {
      this.selectedOrder = order;
      this.showOrderDialog = true;
      this.activeTab = 'basic';
    },
    
    confirmOrder(order) {
      this.$confirm('确定要确认这个订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        order.status = 'confirmed';
        this.$message.success('订单确认成功');
      });
    },
    
    completeOrder(order) {
      this.$confirm('确定要完成这个订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        order.status = 'completed';
        this.$message.success('订单完成');
      });
    },
    
    refundOrder(order) {
      this.refundForm.amount = order.paidAmount;
      this.selectedOrder = order;
      this.showRefundDialog = true;
    },
    
    submitRefund() {
      this.$confirm('确定要处理这个退款申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const refund = {
          id: Date.now(),
          amount: this.refundForm.amount,
          reason: this.refundForm.reason,
          description: this.refundForm.description,
          time: new Date().toLocaleString(),
          status: 'pending'
        };
        
        if (!this.selectedOrder.refunds) {
          this.selectedOrder.refunds = [];
        }
        this.selectedOrder.refunds.push(refund);
        this.selectedOrder.status = 'refunding';
        
        this.showRefundDialog = false;
        this.$message.success('退款申请已提交');
        this.resetRefundForm();
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
    
    batchConfirm() {
      if (this.selectedOrders.length === 0) {
        this.$message.warning('请选择要确认的订单');
        return;
      }
      
      this.$confirm(`确定要批量确认选中的 ${this.selectedOrders.length} 个订单吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedOrders.forEach(order => {
          order.status = 'confirmed';
        });
        this.$message.success('批量确认成功');
      });
    },
    
    exportOrders() {
      this.$message.success('订单导出成功');
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
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    }
  }
}
</script>

<style scoped>
.order-processing {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin: 0;
}

.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #d63384;
}

.stat-icon.confirmed {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #20c997;
}

.stat-icon.completed {
  background: linear-gradient(135deg, #d299c2, #fef9d7);
  color: #28a745;
}

.stat-icon.refunding {
  background: linear-gradient(135deg, #89f7fe, #66a6ff);
  color: #6f42c1;
}

.stat-icon i {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.action-bar .el-button {
  margin-right: 10px;
}

.order-list {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-type {
  margin-top: 4px;
}

.amount {
  font-weight: bold;
  color: #e6a23c;
}

.pagination {
  text-align: center;
}

.order-detail {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
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
  color: #666;
}

.product-detail {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-detail-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.product-detail-info {
  flex: 1;
}

.product-detail-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.product-detail-info p {
  color: #666;
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
  border-left: 4px solid #007bff;
}

.change-header,
.refund-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.change-type,
.refund-amount {
  font-weight: 500;
  margin-right: 15px;
  color: #333;
}

.change-time,
.refund-time {
  margin-right: 15px;
  color: #666;
  font-size: 14px;
}

.change-content,
.refund-content {
  color: #333;
  line-height: 1.5;
}

.change-content p,
.refund-content p {
  margin-bottom: 10px;
}

.change-actions,
.refund-actions {
  margin-top: 15px;
}

.change-actions .el-button,
.refund-actions .el-button {
  margin-right: 10px;
}

.dialog-footer {
  text-align: right;
}
</style>
