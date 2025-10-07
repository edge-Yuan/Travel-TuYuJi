<template>
  <div class="order-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/traveller/packageDetail' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="getPackageDetailRoute()">套餐内容</el-breadcrumb-item>
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
            <i class="el-icon-wallet"></i> 支付方式
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

        <!-- 出行信息 -->
        <div class="order-section travel-section">
          <h2 class="section-title">
            <i class="el-icon-user"></i> 出行信息
          </h2>

          <div class="travel-item">
            <span class="label">出行人数</span>
            <el-input-number v-model="travellers" :min="1" :max="99"></el-input-number>
            <span class="unit">人</span>
          </div>
        </div>

        <!-- 备注信息 -->
        <div class="order-section remark-section">
          <h2 class="section-title">
            <i class="el-icon-chat-line-round"></i> 订单备注
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
          <i class="el-icon-success"></i>
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
        <el-button @click="viewOrder">
          查看订单
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'purchasePages',
  data() {
    return {
      // 用户ID建议从登录态获取，这里先占位
      userId: 10003,

      // 收货地址相关
      addresses: [],
      selectedAddress: null,
      showAddressDialog: false,

      // 商品信息（建议从路由或购物车接口注入，这里保留原始结构作为兜底）
      orderProducts: [
        // 示例：如果外部已注入，可在 mounted 覆盖
        // { id: 123, name: '某线路', image: '...', price: 1999, quantity: 1, attrs: [] }
      ],

      // 支付方式（对齐后端：仅微信/支付宝）
      paymentMethods: [
        { value: 'wechat', name: '微信支付', icon: 'el-icon-wechat', promotion: '首单立减5元' },
        { value: 'alipay', name: '支付宝', icon: 'el-icon-ali-pay', promotion: '' }
      ],
      selectedPayment: 'wechat',

      // 订单备注
      orderRemark: '',

      // 优惠券相关
      coupons: [],
      selectedCoupon: null,
      selectedCouponId: '',
      showCouponDialog: false,

      // 订单金额相关
      shippingFee: 0,
      discount: 0,

      // 协议同意
      agreeAgreement: true,

      // 提交成功相关
      showSuccessDialog: false,
      orderNumber: '',
      orderId: null,

      // 可能需要的下单上下文（如产品ID/出行日期/人数），请按你的实际来源赋值
      productId: null,
      bookingDate: null,   // '2025-10-03'
      travellers: 1,       // 出行人数
      specialNeeds: null   // 特殊需求
    };
  },
  computed: {
    totalPrice() {
      return this.orderProducts.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);
    },
    totalQuantity() {
      return this.orderProducts.reduce((sum, product) => sum + product.quantity, 0);
    }
  },
  watch: {
    selectedCoupon(newVal) {
      this.discount = newVal ? Number(newVal.discountValue || newVal.value || 0) : 0;
    },
    totalPrice(newVal) {
      this.shippingFee = newVal >= 2000 ? 0 : 15;
    },
    // 当仅有单个商品时，将出行人数同步到商品数量，保持金额一致
    travellers(newVal) {
      const count = Number(newVal) || 1;
      if (Array.isArray(this.orderProducts) && this.orderProducts.length === 1) {
        this.$set(this.orderProducts[0], 'quantity', count);
      }
    }
  },
  mounted() {
    // 加载地址与优惠券
    this.fetchAddresses();
    this.fetchAvailableCoupons();

    // 尝试从路由/本地存储恢复商品信息
    this.loadOrderProductsFromRoute();
    if (!this.orderProducts || this.orderProducts.length === 0) {
      this.loadOrderProductsFromStorage();
    }

    // 默认选中默认地址（接口已按 isDefault 排序）
    // 运费初始化
    this.shippingFee = this.totalPrice >= 2000 ? 0 : 15;
  },
  methods: {
    // 统一判断后端返回是否成功
    isSuccess(res) {
      if (!res) return false;
      // 常见兼容：code === 200 | code === 1 | success === true
      return res.code === 200 || res.code === 1 || res.success === true;
    },
    // 规范化商品结构
    normalizeProducts(list) {
      if (!Array.isArray(list)) return [];
      return list
        .filter(Boolean)
        .map((p) => ({
          id: p.id || p.productId || p.spuId || p.packageId || null,
          name: p.name || p.title || p.productName || '商品',
          image: p.image || p.cover || p.imgUrl || '',
          price: Number(p.price || p.salePrice || p.finalPrice || 0),
          quantity: Number(p.quantity || p.count || 1),
          attrs: Array.isArray(p.attrs) ? p.attrs : (p.specs ? [].concat(p.specs) : [])
        }))
        .filter((p) => p.id);
    },
    // 从路由参数/查询获取商品
    loadOrderProductsFromRoute() {
      try {
        const qp = this.$route?.query || {};
        const pp = this.$route?.params || {};
        let incoming = [];
        if (pp.orderProducts) {
          incoming = Array.isArray(pp.orderProducts)
            ? pp.orderProducts
            : JSON.parse(pp.orderProducts || '[]');
        } else if (qp.orderProducts) {
          incoming = Array.isArray(qp.orderProducts)
            ? qp.orderProducts
            : JSON.parse(qp.orderProducts || '[]');
        } else if (qp.productId) {
          // 单商品快速下单（通过 query 传参）
          const one = {
            id: qp.productId,
            name: qp.name || '商品',
            image: qp.image || '',
            price: Number(qp.price || 0),
            quantity: Number(qp.quantity || 1),
            attrs: []
          };
          incoming = [one];
        }
        const normalized = this.normalizeProducts(incoming);
        if (normalized.length) {
          this.orderProducts = normalized;
          this.productId = normalized[0].id;
          // 缓存一份，便于刷新恢复
          localStorage.setItem('purchaseProducts', JSON.stringify(normalized));
        }

        // 预填下单上下文（可选）
        if (qp.bookingDate) this.bookingDate = qp.bookingDate;
        if (qp.travellers) this.travellers = Number(qp.travellers) || this.totalQuantity || 1;
        if (qp.specialNeeds) this.specialNeeds = qp.specialNeeds;
        if (qp.payType) {
          const pt = Number(qp.payType);
          this.selectedPayment = pt === 2 ? 'alipay' : 'wechat';
        }
      } catch (e) {
        // ignore
      }
    },
    // 从本地存储恢复
    loadOrderProductsFromStorage() {
      try {
        const raw = localStorage.getItem('purchaseProducts') || sessionStorage.getItem('purchaseProducts');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const normalized = this.normalizeProducts(parsed);
        if (normalized.length) {
          this.orderProducts = normalized;
          this.productId = normalized[0].id;
        }
      } catch (e) {
        // ignore
      }
    },
    // 统一获取 message
    getMessage(res, fallback = '请求失败') {
      return (res && (res.message || res.msg)) || fallback;
    },
    // 映射支付方式到后端枚举
    mapPayType() {
      return this.selectedPayment === 'wechat' ? 1 : 2;
    },

    // 地址：获取当前用户地址
    async fetchAddresses() {
      try {
        const { data } = await request.get(`/travel-portal/userAddress/user/${this.userId}`);
        if (this.isSuccess(data)) {
          // 后端字段: receiverName/receiverPhone/province/city/district/detailAddress/isDefault
          const list = data.data || data.result || [];
          this.addresses = list.map(a => ({
            id: a.addressId,
            name: a.receiverName,
            phone: a.receiverPhone,
            province: a.province,
            city: a.city,
            district: a.district,
            detail: a.detailAddress,
            isDefault: !!a.isDefault,
            raw: a
          }));
          this.selectedAddress = this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
        } else {
          this.$message.error(this.getMessage(data, '获取地址失败'));
        }
      } catch (e) {
        this.$message.error('获取地址失败');
      }
    },
    selectAddress(address) {
      this.selectedAddress = address;
    },
    editAddress(address) {
      this.$message.info(`编辑地址: ${address.name}`);
    },
    async deleteAddress(id) {
      try {
        await this.$confirm('确定要删除这个地址吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        const { data } = await request.delete(`/travel-portal/userAddress/${id}`);
        if (this.isSuccess(data)) {
          this.$message.success('地址已删除');
          await this.fetchAddresses();
        } else {
          this.$message.error(this.getMessage(data, '删除失败'));
        }
      } catch {
        // 取消
      }
    },
    addNewAddress() {
      this.$message.info('打开新增地址表单');
    },

    // 优惠券
    async fetchAvailableCoupons() {
      try {
        const { data } = await request.get('/travel-portal/coupon/available');
        if (this.isSuccess(data)) {
          // 映射：couponId/couponName/discountValue/minSpend/start_date/end_date
          const list = data.data || data.result || [];
          this.coupons = list.map(c => ({
            id: c.couponId,
            name: c.couponName,
            value: Number(c.discountValue || 0),
            minSpend: Number(c.minSpend || 0),
            expiryDate: c.endDate
          }));
        }
      } catch {
        // 忽略
      }
    },
    async checkCoupon(coupon) {
      try {
        const orderAmount = (this.totalPrice + this.shippingFee).toFixed(2);
        const { data } = await request.get(`/travel-portal/coupon/check/${coupon.id}`, {
          params: { orderAmount }
        });
        return this.isSuccess(data);
      } catch {
        return false;
      }
    },
    async selectCoupon(coupon) {
      const ok = await this.checkCoupon(coupon);
      if (ok && this.totalPrice >= coupon.minSpend) {
        this.selectedCoupon = coupon;
        this.selectedCouponId = coupon.id;
      } else {
        this.$message.warning('所选优惠券不满足使用条件或已失效');
      }
    },
    async confirmCoupon() {
      if (this.selectedCouponId) {
        const coupon = this.coupons.find(c => c.id === this.selectedCouponId);
        const ok = coupon ? await this.checkCoupon(coupon) : false;
        if (ok && coupon && this.totalPrice >= coupon.minSpend) {
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
    async submitOrder() {
      if (!this.selectedAddress) {
        this.$message.error('请选择收货地址');
        return;
      }
      if (!this.agreeAgreement) {
        this.$message.error('请同意用户服务协议和隐私政策');
        return;
      }
      // 选择有效支付方式
      const payType = this.mapPayType();

      const loading = this.$loading({
        lock: true,
        text: '提交订单中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      try {
        // 这里 productId 的来源需按你的业务填充：
        // - 如果是单商品详情页下单：外部应设置 this.productId
        // - 如果是购物车多商品：后端当前模型是单 productId，可按业务改为批量，或此处暂取第一个
        const firstItem = this.orderProducts[0];
        const productId = this.productId || (firstItem && firstItem.id);
        const productQuantity = this.totalQuantity;

        if (!productId) {
          this.$message.error('缺少 productId，无法提交订单');
          return;
        }

        const payload = {
          userId: this.userId,
          productId,
          totalPrice: (this.totalPrice + this.shippingFee - (this.discount || 0)).toFixed(2),
          payType,
          bookingDate: this.bookingDate,              // 如需必填，请确保外部传入
          travellers: this.travellers || 1,
          specialNeeds: this.specialNeeds || null,

          // 地址信息（后端字段名）
          receiverName: this.selectedAddress.name,
          receiverPhone: this.selectedAddress.phone,
          receiverProvince: this.selectedAddress.province,
          receiverCity: this.selectedAddress.city,
          receiverDistrict: this.selectedAddress.district,
          receiverAddress: this.selectedAddress.detail,

          // 备注
          orderRemark: this.orderRemark || null,

          // 优惠
          couponId: this.selectedCoupon ? this.selectedCoupon.id : null,
          couponDiscount: this.selectedCoupon ? Number(this.selectedCoupon.value || 0) : 0,

          // 运费与数量
          shippingFee: Number(this.shippingFee || 0),
          productQuantity
        };

        const { data } = await request.post('/travel-portal/tourOrder/submit', payload);
        if (this.isSuccess(data) && (data.data || data.result)) {
          const body = data.data || data.result;
          this.orderId = body.orderId;
          this.orderNumber = body.orderNumber || '';
          this.showSuccessDialog = true;
        } else {
          this.$message.error(this.getMessage(data, '提交订单失败'));
        }
      } catch (e) {
        this.$message.error('提交订单失败');
      } finally {
        loading.close();
      }
    },

    gotoPayment() {
      this.showSuccessDialog = false;
      const amount = (this.totalPrice + this.shippingFee - (this.discount || 0)).toFixed(2);
      const payType = this.mapPayType();
      this.$router.push({
        path: '/payment',
        query: {
          orderId: String(this.orderId || ''),
          orderNumber: String(this.orderNumber || ''),
          amount: String(amount),
          payType: String(payType)
        }
      });
    },
    viewOrder() {
      this.showSuccessDialog = false;
      this.$router.push({
        path: '/traveller/order',
        query: { orderId: String(this.orderId || '') }
      });
    },

    // 获取套餐内容页面路由
    getPackageDetailRoute() {
      // 如果有产品ID，返回到套餐内容页面并携带产品ID参数
      if (this.productId) {
        return {
          path: '/traveller/order',
          query: { productId: this.productId }
        };
      }
      
      // 如果没有产品ID，返回到首页
      return { path: '/' };
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

/* 出行信息样式优化 */
.travel-section .travel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, #f9fafc, #ffffff);
  transition: all 0.3s ease;
}

.travel-section .travel-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-light);
  transform: translateY(-1px);
}

.travel-section .label {
  min-width: 80px;
  color: var(--text-primary);
  font-weight: 600;
}

.travel-section .unit {
  color: var(--text-secondary);
}

.travel-section ::v-deep .el-input-number {
  border-radius: 8px;
}

.travel-section ::v-deep .el-input-number .el-input__inner {
  text-align: center;
}

/* 备注信息样式优化 */
.remark-input::v-deep .el-textarea__inner {
  border-radius: var(--border-radius);
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  height: 120px;
  resize: none;
  background-color: #f9fafc;
  outline: none;
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
  color: #67c23a;
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
