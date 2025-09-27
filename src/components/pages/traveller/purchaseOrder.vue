<template>
  <div class="purchase-order">
    <div class="page-header">
      <h1 class="title">确认订单</h1>
      <p class="subtitle">请确认您的订单信息</p>
    </div>

    <el-card class="order-card" v-loading="loading">
      <!-- 产品信息 -->
      <div class="product-section">
        <h3>产品信息</h3>
        <div class="product-info" v-if="productDetail">
          <img :src="productDetail.mainImgUrl || '/src/assets/images/travel.jpg'" class="product-image" />
          <div class="product-details">
            <h4>{{ productDetail.productName }}</h4>
            <p class="product-description">{{ productDetail.description }}</p>
            <div class="product-tags">
              <el-tag v-for="tag in splitTags" :key="tag" size="mini" style="margin-right: 5px;">
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="product-price">
            <span class="price-symbol">￥</span>
            <span class="price-amount">{{ productDetail.price }}</span>
          </div>
        </div>
      </div>

      <!-- 订单表单 -->
      <el-form :model="orderForm" :rules="orderRules" ref="orderForm" label-width="100px">
        <h3>订单信息</h3>
        
        <el-form-item label="出行日期" prop="bookingDate">
          <el-date-picker
            v-model="orderForm.bookingDate"
            type="date"
            placeholder="选择出行日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="出行人数" prop="personCount">
          <el-input-number v-model="orderForm.personCount" :min="1" :max="10"></el-input-number>
        </el-form-item>
        
        <el-form-item label="支付方式" prop="payType">
          <el-radio-group v-model="orderForm.payType">
            <el-radio :label="1">微信支付</el-radio>
            <el-radio :label="2">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="特殊需求">
          <el-input
            v-model="orderForm.specialNeeds"
            type="textarea"
            :rows="3"
            placeholder="请输入您的特殊需求（可选）">
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 费用明细 -->
      <div class="cost-breakdown">
        <h3>费用明细</h3>
        <div class="cost-item">
          <span>产品单价</span>
          <span>￥{{ productDetail ? productDetail.price : 0 }}</span>
        </div>
        <div class="cost-item">
          <span>出行人数</span>
          <span>{{ orderForm.personCount }}人</span>
        </div>
        <div class="cost-item total">
          <span>总计</span>
          <span class="total-amount">￥{{ totalAmount }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="submitOrder" :loading="submitting">
          确认下单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'PurchaseOrder',
  data() {
    return {
      loading: false,
      submitting: false,
      productDetail: null,
      orderForm: {
        productId: null,
        bookingDate: '',
        personCount: 1,
        payType: 1,
        specialNeeds: ''
      },
      orderRules: {
        bookingDate: [
          { required: true, message: '请选择出行日期', trigger: 'change' }
        ],
        personCount: [
          { required: true, message: '请输入出行人数', trigger: 'blur' }
        ],
        payType: [
          { required: true, message: '请选择支付方式', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    totalAmount() {
      if (this.productDetail && this.orderForm.personCount) {
        return (this.productDetail.price * this.orderForm.personCount).toFixed(2);
      }
      return '0.00';
    },
    splitTags() {
      if (this.productDetail && this.productDetail.productTags) {
        return this.productDetail.productTags.split('，').map(tag => tag.trim());
      }
      return [];
    }
  },
  created() {
    this.loadProductDetail();
  },
  methods: {
    async loadProductDetail() {
      const productId = this.$route.query.productId;
      if (!productId) {
        this.$message.error('无效的产品ID');
        this.goBack();
        return;
      }
      
      this.loading = true;
      try {
        const response = await request({
          url: `/travel-portal/tourProduct/getProductDetail/${productId}`,
          method: 'get'
        });
        // 处理响应数据
        if(response && response.data){
          this.productDetail = response.data;
        } else {
          this.productDetail = response;
        }
        this.orderForm.productId = productId;
        this.$message.success('产品信息加载成功');
      } catch (error) {
        this.$message.error('产品信息加载失败');
        console.error('加载产品详情失败:', error);
        this.goBack();
      } finally {
        this.loading = false;
      }
    },
    
    async submitOrder() {
      this.$refs.orderForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true;
          try {
            const orderData = {
              ...this.orderForm,
              userId: this.getCurrentUserId(),
              orderAmount: parseFloat(this.totalAmount),
              payStatus: 0, // 待支付
              orderStatus: 0 // 待确认
            };
            
            await request({
              url: '/travel-portal/tourOrder/create',
              method: 'post',
              data: orderData
            });
            
            this.$message.success('订单创建成功！');
            this.$router.push('/traveller/order');
          } catch (error) {
            this.$message.error('订单创建失败');
            console.error('创建订单失败:', error);
          } finally {
            this.submitting = false;
          }
        }
      });
    },
    
    getCurrentUserId() {
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        return JSON.parse(userInfo).userId;
      }
      return null;
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.purchase-order {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
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

.order-card {
  margin-bottom: 20px;
}

.product-section {
  margin-bottom: 30px;
}

.product-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.product-info {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.product-details {
  flex: 1;
}

.product-details h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.product-tags {
  margin-bottom: 10px;
}

.product-price {
  text-align: right;
}

.price-symbol {
  font-size: 16px;
  color: #e6a23c;
}

.price-amount {
  font-size: 24px;
  font-weight: bold;
  color: #e6a23c;
}

.cost-breakdown {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.cost-breakdown h3 {
  margin-bottom: 15px;
  color: #333;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.cost-item.total {
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
  font-weight: bold;
}

.total-amount {
  color: #e6a23c;
  font-size: 18px;
}

.action-buttons {
  text-align: center;
  margin-top: 30px;
}

.action-buttons .el-button {
  margin: 0 10px;
  min-width: 120px;
}
</style>
