<template>
  <div class="order-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/cart' }">购物车</el-breadcrumb-item>
        <el-breadcrumb-item>确认订单</el-breadcrumb-item>
      </el-breadcrumb>
      <h1 class="title">确认订单</h1>
    </div>

    <div class="order-container">
      <!-- 左侧订单信息 -->
      <div class="order-main">
        <!-- 收货地址 -->
        <div class="order-section address-section">
          <h2 class="section-title">
            <i class="el-icon-location-outline"></i> 收货地址
            <el-button type="text" class="edit-btn address-edit-btn" @click="showAddressDialog = true">
              <i class="el-icon-edit"></i> 选择/修改地址
            </el-button>
          </h2>

          <div class="address-card" v-if="selectedAddress">
            <div class="address-header">
              <span class="name">{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
              <el-tag v-if="selectedAddress.isDefault" size="mini" type="primary">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{
                selectedAddress.detail }}
            </div>
          </div>

          <div class="no-address" v-else>
            <el-empty description="请添加收货地址" @click="showAddressDialog = true">
              <el-button slot="bottom" type="primary" @click="showAddressDialog = true">
                <i class="el-icon-plus"></i> 添加地址
              </el-button>
            </el-empty>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="order-section product-section">
          <h2 class="section-title">
            <i class="el-icon-shopping-cart-full"></i> 商品信息
          </h2>

          <el-table :data="orderProducts" border stripe :show-header="false" class="product-table">
            <el-table-column prop="image" width="100">
              <template slot-scope="scope">
                <el-image :src="scope.row.image" fit="cover" class="product-image"></el-image>
              </template>
            </el-table-column>
            <el-table-column prop="name" width="300">
              <template slot-scope="scope">
                <div class="product-name">{{ scope.row.name }}</div>
                <div class="product-attrs" v-if="scope.row.attrs.length">
                  {{ scope.row.attrs.join('; ') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" align="center">
              <template slot-scope="scope">
                ¥{{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" align="center">
              <template slot-scope="scope">
                ×{{ scope.row.quantity }}
              </template>
            </el-table-column>
            <el-table-column prop="total" align="right">
              <template slot-scope="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 支付方式 -->
        <div class="order-section payment-section">
          <h2 class="section-title">
            <i class="el-icon-credit-card"></i> 支付方式
          </h2>

          <div class="payment-methods">
            <el-radio-group v-model="selectedPayment">
              <el-radio v-for="method in paymentMethods" :key="method.value" :label="method.value"
                class="payment-method">
                <i :class="method.icon" class="payment-icon"></i>
                <span class="payment-name">{{ method.name }}</span>
                <el-tooltip v-if="method.promotion" effect="dark" placement="top">
                  <div slot="content">{{ method.promotion }}</div>
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 备注信息 -->
        <div class="order-section remark-section">
          <h2 class="section-title">
            <i class="el-icon-comment"></i> 订单备注
          </h2>

          <el-input type="textarea" placeholder="请输入订单备注信息，如特殊的收货要求等" v-model="orderRemark" :rows="3"
            class="remark-input"></el-input>
        </div>
      </div>

      <!-- 右侧订单摘要 -->
      <div class="order-sidebar">
        <div class="summary-card">
          <h3 class="summary-title">订单摘要</h3>

          <div class="summary-item">
            <span>商品总价</span>
            <span>¥{{ totalPrice.toFixed(2) }}</span>
          </div>

          <div class="summary-item">
            <span>运费</span>
            <span>{{ shippingFee > 0 ? '¥' + shippingFee.toFixed(2) : '免运费' }}</span>
          </div>

          <div class="summary-item discount-item">
            <span>优惠</span>
            <span class="discount">-¥{{ discount.toFixed(2) }}</span>
          </div>

          <div class="summary-total">
            <span>实付款</span>
            <span class="total-amount">¥{{ (totalPrice + shippingFee - discount).toFixed(2) }}</span>
          </div>

          <div class="coupon-section">
            <el-button type="text" class="coupon-btn" @click="showCouponDialog = true">
              <i class="el-icon-ticket"></i>
              优惠券
              <span v-if="selectedCoupon">已选: {{ selectedCoupon.name }}</span>
              <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>

           <el-button 
             type="primary" 
             round 
             class="submit-btn"
             @click="submitOrder"
             :disabled="!selectedAddress"
           >
             提交订单
           </el-button>

          <div class="agreement">
            <el-checkbox v-model="agreeAgreement" checked>
              提交订单即表示同意<a href="#" class="agreement-link">《用户服务协议》</a>和<a href="#" class="agreement-link">《隐私政策》</a>
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>

    <!-- 地址选择对话框 -->
    <el-dialog title="选择收货地址" :visible.sync="showAddressDialog" width="600px" custom-class="address-dialog">
      <div class="address-list">
        <div v-for="address in addresses" :key="address.id" class="address-item"
          :class="{ 'selected': selectedAddress && address.id === selectedAddress.id }" @click="selectAddress(address)">
          <div class="address-info">
            <div class="address-name-phone">
              <span class="addr-name">{{ address.name }}</span>
              <span class="addr-phone">{{ address.phone }}</span>
              <el-tag v-if="address.isDefault" size="mini" type="primary">默认</el-tag>
            </div>
            <div class="addr-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
            </div>
          </div>
          <div class="address-actions">
            <el-button type="text" size="mini" @click.stop="editAddress(address)">
              编辑
            </el-button>
            <el-button type="text" size="mini" @click.stop="deleteAddress(address.id)" v-if="!address.isDefault">
              删除
            </el-button>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="addNewAddress">
          <i class="el-icon-plus"></i> 新增地址
        </el-button>
      </div>
    </el-dialog>

    <!-- 优惠券选择对话框 -->
    <el-dialog title="选择优惠券" :visible.sync="showCouponDialog" width="500px" custom-class="coupon-dialog">
      <div class="coupon-list">
        <div v-for="coupon in coupons" :key="coupon.id" class="coupon-item"
          :class="{ 'selected': selectedCoupon && coupon.id === selectedCoupon.id }" @click="selectCoupon(coupon)">
          <div class="coupon-info">
            <div class="coupon-value">
              ¥{{ coupon.value }}
            </div>
            <div class="coupon-desc">
              <div class="coupon-name">{{ coupon.name }}</div>
              <div class="coupon-requirement">满{{ coupon.minSpend }}元可用</div>
              <div class="coupon-expiry">有效期至 {{ coupon.expiryDate }}</div>
            </div>
          </div>
          <el-radio v-model="selectedCouponId" :label="coupon.id" class="coupon-radio"></el-radio>
        </div>

        <div v-if="coupons.length === 0" class="no-coupons">
          <el-empty description="暂无可用优惠券"></el-empty>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showCouponDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCoupon">确定</el-button>
      </div>
    </el-dialog>

    <!-- 提交成功提示 -->
    <el-dialog title="提交成功" :visible.sync="showSuccessDialog" width="400px" :show-close="false"
      custom-class="success-dialog">
      <div class="success-content">
        <div class="success-icon">
          <i class="el-icon-check-circle"></i>
        </div>
        <div class="success-message">
          订单提交成功！
        </div>
        <div class="order-number">
          订单编号：<span>{{ orderNumber }}</span>
        </div>
        <div class="payment-note">
          请在 <span class="countdown">15:00</span> 内完成支付，超时订单将自动取消
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="gotoPayment">
          去支付
        </el-button>
        <el-button @click="showSuccessDialog = false">
          查看订单
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'purchasePages',
  data() {
    return {
      // 收货地址相关
      addresses: [
        {
          id: 1,
          name: '张先生',
          phone: '138****6789',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '建国路88号现代城5号楼1203室',
          isDefault: true
        },
        {
          id: 2,
          name: '张先生',
          phone: '138****6789',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail: '张江高科技园区博云路2号',
          isDefault: false
        }
      ],
      selectedAddress: null,
      showAddressDialog: false,

      // 商品信息
      orderProducts: [
        {
          id: 1,
          name: 'Apple iPhone 13 Pro 256GB 星光色',
          image: 'https://picsum.photos/id/1/80/80',
          price: 7999,
          quantity: 1,
          attrs: ['颜色: 星光色', '容量: 256GB']
        },
        {
          id: 2,
          name: 'Apple AirPods Pro 主动降噪无线蓝牙耳机',
          image: 'https://picsum.photos/id/2/80/80',
          price: 1799,
          quantity: 1,
          attrs: ['标准版']
        }
      ],

      // 支付方式
      paymentMethods: [
        {
          value: 'wechat',
          name: '微信支付',
          icon: 'el-icon-wechat',
          promotion: '首单立减5元'
        },
        {
          value: 'alipay',
          name: '支付宝',
          icon: 'el-icon-ali-pay',
          promotion: ''
        },
        {
          value: 'unionpay',
          name: '银联支付',
          icon: 'el-icon-credit-card',
          promotion: '满2000减30'
        }
      ],
      selectedPayment: 'wechat',

      // 订单备注
      orderRemark: '',

      // 优惠券相关
      coupons: [
        {
          id: 1,
          name: '满1000减50',
          value: 50,
          minSpend: 1000,
          expiryDate: '2023-12-31'
        },
        {
          id: 2,
          name: '满5000减300',
          value: 300,
          minSpend: 5000,
          expiryDate: '2023-11-30'
        }
      ],
      selectedCoupon: null,
      selectedCouponId: '',
      showCouponDialog: false,

      // 订单金额相关
      shippingFee: 0, // 满一定金额免运费
      discount: 0,

      // 协议同意
      agreeAgreement: true,

      // 提交成功相关
      showSuccessDialog: false,
      orderNumber: ''
    };
  },
  computed: {
    // 计算商品总价
    totalPrice() {
      return this.orderProducts.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);
    }
  },
  watch: {
    // 监听优惠券变化，更新折扣
    selectedCoupon(newVal) {
      this.discount = newVal ? newVal.value : 0;
    },
    // 监听商品总价变化，更新运费
    totalPrice(newVal) {
      // 满2000免运费
      this.shippingFee = newVal >= 2000 ? 0 : 15;
    }
  },
  mounted() {
    // 默认选中默认地址
    this.selectedAddress = this.addresses.find(addr => addr.isDefault) || this.addresses[0];

    // 计算初始运费
    this.shippingFee = this.totalPrice >= 2000 ? 0 : 15;
  },
  methods: {
    // 选择地址
    selectAddress(address) {
      this.selectedAddress = address;
    },
    // 编辑地址（实际项目中会打开编辑表单）
    editAddress(address) {
      this.$message.info(`编辑地址: ${address.name}`);
    },
    // 删除地址
    deleteAddress(id) {
      this.$confirm('确定要删除这个地址吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.addresses = this.addresses.filter(addr => addr.id !== id);
        // 如果删除的是选中的地址，自动选择默认地址或第一个地址
        if (this.selectedAddress && this.selectedAddress.id === id) {
          this.selectedAddress = this.addresses.find(addr => addr.isDefault) || this.addresses[0];
        }
        this.$message.success('地址已删除');
      }).catch(() => {
        // 取消删除
      });
    },
    // 添加新地址（实际项目中会打开添加表单）
    addNewAddress() {
      this.$message.info('打开新增地址表单');
    },

    // 选择优惠券
    selectCoupon(coupon) {
      // 检查是否满足使用条件
      if (this.totalPrice >= coupon.minSpend) {
        this.selectedCoupon = coupon;
        this.selectedCouponId = coupon.id;
      } else {
        this.$message.warning(`满${coupon.minSpend}元才能使用该优惠券`);
      }
    },
    // 确认选择优惠券
    confirmCoupon() {
      if (this.selectedCouponId) {
        const coupon = this.coupons.find(c => c.id === this.selectedCouponId);
        if (coupon && this.totalPrice >= coupon.minSpend) {
          this.selectedCoupon = coupon;
        } else {
          this.selectedCoupon = null;
          this.selectedCouponId = '';
          this.$message.warning('所选优惠券不满足使用条件');
        }
      } else {
        this.selectedCoupon = null;
      }
      this.showCouponDialog = false;
    },

    // 提交订单
    submitOrder() {
      if (!this.selectedAddress) {
        this.$message.error('请选择收货地址');
        return;
      }

      if (!this.agreeAgreement) {
        this.$message.error('请同意用户服务协议和隐私政策');
        return;
      }

      // 模拟提交订单
      this.$loading({
        lock: true,
        text: '提交订单中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      // 模拟API请求延迟
      setTimeout(() => {
        this.$loading().close();
        // 生成随机订单号
        this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
        this.showSuccessDialog = true;
      }, 1500);
    },

    // 前往支付
    gotoPayment() {
      this.showSuccessDialog = false;
      this.$message.success('前往支付页面');
      // 实际项目中会跳转到支付页面
      // this.$router.push(`/payment/${this.orderNumber}`);
    }
  }
};
</script>

<style scoped>
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #dcdfe6;
  --background-color: #f5f7fa;
  --shadow-light: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.12);
  --border-radius: 12px;
}

.order-page {
  padding: 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--background-color);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.page-header {
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  color: var(--text-primary);
  margin-top: 16px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.order-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.order-main {
  flex: 1;
  min-width: 0;
}

.order-sidebar {
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
}

.order-section {
  background: #ffffff;
  border-radius: var(--border-radius);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
}

.order-section:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.section-title {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.section-title i {
  margin-right: 10px;
  color: var(--primary-color);
  font-size: 20px;
}

.edit-btn {
  font-size: 14px;
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 1;
  visibility: visible;
}

.edit-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
  opacity: 1;
  visibility: visible;
}

.address-edit-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* 地址部分样式优化 */
.address-card {
  padding: 20px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, #f9fafc, #ffffff);
  transition: all 0.3s ease;
  cursor: pointer;
}

.address-card:hover {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f7ff, #ffffff);
  transform: translateY(-1px);
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.name {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.phone {
  color: var(--text-regular);
  font-size: 14px;
}

.address-detail {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
}

.no-address {
  padding: 40px 0;
  text-align: center;
}

/* 商品信息样式优化 */
.product-table {
  width: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.product-table::v-deep .el-table__row {
  transition: all 0.2s ease;
}

.product-table::v-deep .el-table__row:hover {
  background-color: #f5f7ff !important;
  transform: scale(1.01);
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-medium);
}

.product-name {
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  font-weight: 500;
  font-size: 14px;
}

.product-attrs {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 支付方式样式优化 */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
}

.payment-method:hover {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f7ff, #ffffff);
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.payment-method.is-checked {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f7ff, #ffffff);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.payment-icon {
  font-size: 24px;
  margin-right: 12px;
  color: var(--primary-color);
}

.payment-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
}

/* 备注信息样式优化 */
.remark-input::v-deep .el-textarea__inner {
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.remark-input::v-deep .el-textarea__inner:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 订单摘要样式优化 */
.summary-card {
  background: linear-gradient(135deg, #ffffff, #f9fafc);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--border-color);
}

.summary-title {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 24px;
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  color: var(--text-regular);
  font-size: 14px;
  border-bottom: 1px dashed var(--border-color);
}

.discount-item .discount {
  color: var(--success-color);
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  margin: 16px 0;
  border-top: 2px dashed var(--border-color);
  border-bottom: 2px dashed var(--border-color);
}

.summary-total span:first-child {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--danger-color);
  text-shadow: 0 2px 4px rgba(245, 108, 108, 0.1);
}

.coupon-section {
  margin: 20px 0;
}

.coupon-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--primary-color);
  border: 2px dashed var(--primary-color);
  padding: 12px 16px;
  border-radius: var(--border-radius);
  background: rgba(64, 158, 255, 0.05);
  transition: all 0.3s ease;
  font-weight: 500;
}

.coupon-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.submit-btn {
  width: 100%;
  height: 50px;
  margin-bottom: 20px;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.agreement {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}

.agreement-link {
  color: var(--primary-color);
  margin: 0 3px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 对话框样式优化 */
.address-dialog::v-deep .el-dialog {
  border-radius: var(--border-radius);
  overflow: hidden;
}

.address-dialog::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #f9fafc, #ffffff);
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.address-item {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #ffffff;
}

.address-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.address-item.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f7ff, #ffffff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.address-item.selected::after {
  content: "✓";
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
  font-size: 16px;
  font-weight: bold;
}

.address-name-phone {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.addr-name {
  font-weight: 600;
  color: var(--text-primary);
}

.addr-phone {
  color: var(--text-regular);
  margin-right: 12px;
}

.addr-detail {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
}

.address-actions {
  margin-top: 12px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .order-container {
    flex-direction: column;
  }

  .order-sidebar {
    width: 100%;
    position: static;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .order-page {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .order-section {
    padding: 20px;
    margin-bottom: 20px;
  }

  .summary-card {
    padding: 20px;
  }

  .summary-title {
    font-size: 18px;
  }

  .total-amount {
    font-size: 20px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.order-section {
  animation: fadeIn 0.5s ease-out;
}

.order-section:nth-child(1) {
  animation-delay: 0.1s;
}

.order-section:nth-child(2) {
  animation-delay: 0.2s;
}

.order-section:nth-child(3) {
  animation-delay: 0.3s;
}

.order-section:nth-child(4) {
  animation-delay: 0.4s;
}

/* 滚动条美化 */
.address-list::-webkit-scrollbar,
.coupon-list::-webkit-scrollbar {
  width: 6px;
}

.address-list::-webkit-scrollbar-track,
.coupon-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.address-list::-webkit-scrollbar-thumb,
.coupon-list::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

.address-list::-webkit-scrollbar-thumb:hover,
.coupon-list::-webkit-scrollbar-thumb:hover {
  background: #2979ff;
}
</style>

<style>
/* 全局对话框样式优化 */
.address-dialog .el-dialog__header,
.coupon-dialog .el-dialog__header,
.success-dialog .el-dialog__header {
  background: linear-gradient(135deg, #f9fafc, #ffffff);
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.address-dialog .el-dialog__title,
.coupon-dialog .el-dialog__title,
.success-dialog .el-dialog__title {
  color: var(--text-primary);
  font-weight: 600;
}

.success-dialog .el-dialog__body {
  padding: 30px;
}

.success-content {
  text-align: center;
}

.success-icon {
  font-size: 64px;
  color: var(--success-color);
  margin-bottom: 20px;
  animation: bounceIn 0.6s ease;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-message {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 16px;
  font-weight: 600;
}

.order-number {
  color: var(--text-regular);
  margin-bottom: 16px;
  font-size: 14px;
}

.order-number span {
  color: var(--text-primary);
  font-weight: 600;
}

.payment-note {
  color: var(--text-secondary);
  font-size: 13px;
}

.countdown {
  color: var(--danger-color);
  font-weight: 600;
}
</style>
