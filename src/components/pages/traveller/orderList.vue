<template>
  <div class="order-list">
    <div class="page-header">
      <h1 class="title">我的订单</h1>
      <p class="subtitle">查看和管理您的旅游订单</p>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filters.status" placeholder="订单状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待确认" :value="0"></el-option>
            <el-option label="已确认" :value="1"></el-option>
            <el-option label="已完成" :value="2"></el-option>
            <el-option label="已取消" :value="3"></el-option>
            <el-option label="退款中" :value="4"></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索订单号或产品名称"
            prefix-icon="el-icon-search"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchOrders">搜索</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 订单列表 -->
    <div class="order-list-content">
      <el-table :data="filteredOrders" v-loading="loading" stripe>
        <el-table-column prop="orderId" label="订单号" width="160"></el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="200">
          <template slot-scope="scope">
            <div class="product-info">
              <img :src="scope.row.productImage || '/src/assets/images/travel.jpg'" class="product-image" />
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
        <el-table-column prop="orderAmount" label="金额" width="120">
          <template slot-scope="scope">
            <span class="price">￥{{ scope.row.orderAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="personCount" label="人数" width="80"></el-table-column>
        <el-table-column prop="orderStatus" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.orderStatus)" size="mini">
              {{ getStatusName(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bookingDate" label="出行日期" width="120"></el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewOrderDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="success" @click="payOrder(scope.row)" v-if="scope.row.orderStatus === 0">支付</el-button>
            <el-button size="mini" type="warning" @click="cancelOrder(scope.row)" v-if="scope.row.orderStatus === 0">取消</el-button>
            <el-button size="mini" type="danger" @click="applyRefund(scope.row)" v-if="scope.row.orderStatus === 1 || scope.row.orderStatus === 2">退款</el-button>
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
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'OrderList',
  data() {
    return {
      loading: false,
      filters: {
        status: '',
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      orders: []
    }
  },
  created() {
    this.loadOrders();
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;
      
      if (this.filters.status !== '') {
        filtered = filtered.filter(order => order.orderStatus === this.filters.status);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(order => 
          order.orderId.toString().includes(this.filters.keyword) ||
          (order.productName && order.productName.toLowerCase().includes(this.filters.keyword.toLowerCase()))
        );
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
    async loadOrders() {
      this.loading = true;
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          this.$message.error('请先登录');
          return;
        }
        
        const response = await request({
          url: '/travel-portal/tourOrder/search',
          method: 'get',
          params: {
            userId: userId
          }
        });
        // 处理响应数据
        if(response && response.data){
          this.orders = response.data;
        } else {
          this.orders = response;
        }
        this.$message.success('订单列表加载成功');
      } catch (error) {
        this.$message.error('订单列表加载失败');
        console.error('加载订单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    getCurrentUserId() {
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        return JSON.parse(userInfo).userId;
      }
      return null;
    },
    
    getTypeName(type) {
      const typeMap = {
        1: '旅行路线',
        2: '酒店客房',
        3: '景区门票'
      };
      return typeMap[type] || type;
    },
    
    getTypeTagType(type) {
      const typeMap = {
        1: 'success',
        2: 'primary',
        3: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getStatusName(status) {
      const statusMap = {
        0: '待确认',
        1: '已确认',
        2: '已完成',
        3: '已取消',
        4: '退款中'
      };
      return statusMap[status] || status;
    },
    
    getStatusTagType(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'success',
        3: 'danger',
        4: 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    searchOrders() {
      // 搜索逻辑已在computed中实现
    },
    
    viewOrderDetail(order) {
      this.$message.info(`查看订单详情: ${order.orderId}`);
      // 这里可以跳转到订单详情页面
    },
    
    async payOrder(order) {
      try {
        await request({
          url: `/travel-portal/tourOrder/confirm/${order.orderId}`,
          method: 'put'
        });
        this.$message.success('订单支付成功');
        this.loadOrders(); // 重新加载订单列表
      } catch (error) {
        this.$message.error('订单支付失败');
        console.error('支付订单失败:', error);
      }
    },
    
    async cancelOrder(order) {
      this.$confirm('确定要取消这个订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await request({
            url: `/travel-portal/tourOrder/refund/${order.orderId}`,
            method: 'put'
          });
          this.$message.success('订单已取消');
          this.loadOrders(); // 重新加载订单列表
        } catch (error) {
          this.$message.error('取消订单失败');
          console.error('取消订单失败:', error);
        }
      });
    },
    
    applyRefund(order) {
      this.$message.info(`申请退款: ${order.orderId}`);
      // 这里可以跳转到退款申请页面
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
.order-list {
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

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-list-content {
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

.price {
  font-weight: bold;
  color: #e6a23c;
}

.pagination {
  text-align: center;
}
</style>
