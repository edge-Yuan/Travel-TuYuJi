<template>
  <div class="merchant-info">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="title">个人中心</h1>
          <p class="subtitle">管理个人信息和账户设置</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-edit" @click="editBasicInfo">编辑信息</el-button>
          <el-button type="success" icon="el-icon-setting" @click="activeTab = 'account'">账户设置</el-button>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧个人信息 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <img :src="merchantInfo.avatar" class="avatar" />
              <el-upload
                class="avatar-uploader"
                action="https://jsonplaceholder.typicode.com/posts/"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
                <i class="el-icon-camera avatar-uploader-icon"></i>
              </el-upload>
            </div>
            <div class="profile-info">
              <h2>{{ merchantInfo.name }}</h2>
              <p class="merchant-level">
                <el-tag :type="getLevelTagType(merchantInfo.level)" size="medium">
                  {{ getLevelName(merchantInfo.level) }}
                </el-tag>
              </p>
              <p class="merchant-id">商户ID: {{ merchantInfo.merchantId }}</p>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon products">
                <i class="el-icon-goods"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ merchantInfo.totalProducts }}</div>
                <div class="stat-label">产品数量</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon orders">
                <i class="el-icon-tickets"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ merchantInfo.totalOrders }}</div>
                <div class="stat-label">订单数量</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon revenue">
                <i class="el-icon-money"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ merchantInfo.totalRevenue }}</div>
                <div class="stat-label">总收入</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="quick-actions">
          <div slot="header" class="actions-header">
            <i class="el-icon-menu"></i>
            <span>快捷操作</span>
          </div>
          <div class="actions-content">
            <el-button type="primary" @click="goToProductManagement" class="action-btn">
              <i class="el-icon-goods"></i> 产品管理
            </el-button>
            <el-button type="success" @click="goToOrderProcessing" class="action-btn">
              <i class="el-icon-tickets"></i> 订单处理
            </el-button>
            <el-button type="info" @click="goToDataCenter" class="action-btn">
              <i class="el-icon-data-analysis"></i> 数据中心
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详细信息 -->
      <el-col :span="16">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <div class="info-section">
              <div class="section-header">
                <h3>基本信息</h3>
                <el-button type="primary" size="small" @click="showEditDialog = true">编辑</el-button>
              </div>
              <div class="info-display">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="info-item">
                      <span class="info-label">商户名称：</span>
                      <span class="info-value">{{ merchantInfo.name }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="info-item">
                      <span class="info-label">商户类型：</span>
                      <span class="info-value">{{ getTypeName(merchantInfo.type) }}</span>
                    </div>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="info-item">
                      <span class="info-label">联系人：</span>
                      <span class="info-value">{{ merchantInfo.contactPerson }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="info-item">
                      <span class="info-label">联系电话：</span>
                      <span class="info-value">{{ merchantInfo.phone }}</span>
                    </div>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="info-item">
                      <span class="info-label">邮箱：</span>
                      <span class="info-value">{{ merchantInfo.email }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="info-item">
                      <span class="info-label">营业执照号：</span>
                      <span class="info-value">{{ merchantInfo.licenseNumber }}</span>
                    </div>
                  </el-col>
                </el-row>
                
                <div class="info-item">
                  <span class="info-label">详细地址：</span>
                  <span class="info-value">{{ merchantInfo.address }}</span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">商户简介：</span>
                  <div class="info-description">{{ merchantInfo.description }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 账户设置 -->
          <el-tab-pane label="账户设置" name="account">
            <div class="info-section">
              <div class="section-header">
                <h3>账户设置</h3>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>修改密码</h4>
                  <p>定期修改密码有助于保护账户安全</p>
                </div>
                <el-button @click="showChangePasswordDialog = true">修改密码</el-button>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>手机验证</h4>
                  <p>当前手机号: {{ merchantInfo.phone }}</p>
                </div>
                <el-button @click="verifyPhone">验证手机</el-button>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>邮箱验证</h4>
                  <p>当前邮箱: {{ merchantInfo.email }}</p>
                </div>
                <el-button @click="verifyEmail">验证邮箱</el-button>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>登录日志</h4>
                  <p>查看最近的登录记录</p>
                </div>
                <el-button @click="viewLoginLogs">查看日志</el-button>
              </div>
            </div>
          </el-tab-pane>

          <!-- 财务信息 -->
          <el-tab-pane label="财务信息" name="finance">
            <div class="info-section">
              <div class="section-header">
                <h3>财务信息</h3>
              </div>
              
              <div class="finance-overview">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="finance-card">
                      <div class="finance-icon">
                        <i class="el-icon-money"></i>
                      </div>
                      <div class="finance-content">
                        <div class="finance-amount">¥{{ merchantInfo.balance }}</div>
                        <div class="finance-label">账户余额</div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="finance-card">
                      <div class="finance-icon">
                        <i class="el-icon-tickets"></i>
                      </div>
                      <div class="finance-content">
                        <div class="finance-amount">¥{{ merchantInfo.pendingAmount }}</div>
                        <div class="finance-label">待结算</div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="finance-card">
                      <div class="finance-icon">
                        <i class="el-icon-bank-card"></i>
                      </div>
                      <div class="finance-content">
                        <div class="finance-amount">{{ merchantInfo.bankCards.length }}</div>
                        <div class="finance-label">银行卡</div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <div class="bank-cards">
                <div class="section-subheader">
                  <h4>银行卡管理</h4>
                  <el-button type="primary" size="small" @click="addBankCard">添加银行卡</el-button>
                </div>
                <div class="card-list">
                  <div v-for="card in merchantInfo.bankCards" :key="card.id" class="bank-card">
                    <div class="card-info">
                      <div class="card-number">{{ card.maskedNumber }}</div>
                      <div class="card-bank">{{ card.bankName }}</div>
                    </div>
                    <div class="card-actions">
                      <el-button size="mini" @click="editBankCard(card)">编辑</el-button>
                      <el-button size="mini" type="danger" @click="deleteBankCard(card)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 通知设置 -->
          <el-tab-pane label="通知设置" name="notifications">
            <div class="info-section">
              <div class="section-header">
                <h3>通知设置</h3>
              </div>
              
              <div class="notification-settings">
                <div class="setting-group">
                  <h4>订单通知</h4>
                  <div class="setting-item">
                    <span>新订单通知</span>
                    <el-switch v-model="notificationSettings.newOrder"></el-switch>
                  </div>
                  <div class="setting-item">
                    <span>订单状态变更</span>
                    <el-switch v-model="notificationSettings.orderStatus"></el-switch>
                  </div>
                  <div class="setting-item">
                    <span>退款申请</span>
                    <el-switch v-model="notificationSettings.refundRequest"></el-switch>
                  </div>
                </div>
                
                <div class="setting-group">
                  <h4>系统通知</h4>
                  <div class="setting-item">
                    <span>系统维护</span>
                    <el-switch v-model="notificationSettings.systemMaintenance"></el-switch>
                  </div>
                  <div class="setting-item">
                    <span>功能更新</span>
                    <el-switch v-model="notificationSettings.featureUpdate"></el-switch>
                  </div>
                  <div class="setting-item">
                    <span>安全提醒</span>
                    <el-switch v-model="notificationSettings.securityAlert"></el-switch>
                  </div>
                </div>
                
                <div class="setting-group">
                  <h4>营销通知</h4>
                  <div class="setting-item">
                    <span>促销活动</span>
                    <el-switch v-model="notificationSettings.promotion"></el-switch>
                  </div>
                  <div class="setting-item">
                    <span>市场动态</span>
                    <el-switch v-model="notificationSettings.marketNews"></el-switch>
                  </div>
                </div>
                
                <div class="setting-actions">
                  <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" :visible.sync="showChangePasswordDialog" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input type="password" v-model="passwordForm.currentPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showChangePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑基本信息对话框 -->
    <el-dialog title="编辑基本信息" :visible.sync="showEditDialog" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商户名称" prop="name">
              <el-input v-model="editForm.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商户类型" prop="type">
              <el-select v-model="editForm.type" placeholder="请选择商户类型">
                <el-option label="酒店" value="hotel"></el-option>
                <el-option label="旅行社" value="travel_agency"></el-option>
                <el-option label="景区" value="attraction"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="editForm.contactPerson"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="editForm.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照号" prop="licenseNumber">
              <el-input v-model="editForm.licenseNumber"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="editForm.address"></el-input>
        </el-form-item>
        
        <el-form-item label="商户简介" prop="description">
          <el-input type="textarea" v-model="editForm.description" :rows="4" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEditInfo">保存</el-button>
      </div>
    </el-dialog>

    <!-- 添加银行卡对话框 -->
    <el-dialog title="添加银行卡" :visible.sync="showAddCardDialog" width="500px">
      <el-form :model="bankCardForm" :rules="bankCardRules" ref="bankCardForm" label-width="100px">
        <el-form-item label="持卡人姓名" prop="cardholderName">
          <el-input v-model="bankCardForm.cardholderName"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号" prop="cardNumber">
          <el-input v-model="bankCardForm.cardNumber"></el-input>
        </el-form-item>
        <el-form-item label="开户银行" prop="bankName">
          <el-input v-model="bankCardForm.bankName"></el-input>
        </el-form-item>
        <el-form-item label="开户支行" prop="branchName">
          <el-input v-model="bankCardForm.branchName"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddCardDialog = false">取消</el-button>
        <el-button type="primary" @click="addBankCard">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MerchantInfo',
  data() {
    return {
      activeTab: 'basic',
      isEditing: false,
      showChangePasswordDialog: false,
      showAddCardDialog: false,
      showEditDialog: false,
      merchantInfo: {
        name: '三亚海景酒店',
        merchantId: 'M202401150001',
        level: 'premium',
        type: 'hotel',
        contactPerson: '张经理',
        phone: '138****1234',
        email: 'zhang@hotel.com',
        licenseNumber: '91460000MA5ABC123D',
        address: '海南省三亚市天涯区海景路123号',
        description: '位于三亚市中心的豪华海景酒店，拥有无敌海景和优质服务。',
        avatar: '/src/assets/logo/logo1.jpg',
        totalProducts: 25,
        totalOrders: 1234,
        totalRevenue: '2,345,678',
        balance: '156,789',
        pendingAmount: '23,456',
        bankCards: [
          {
            id: 1,
            cardholderName: '张经理',
            cardNumber: '6222****1234',
            maskedNumber: '6222****1234',
            bankName: '中国工商银行',
            branchName: '三亚分行'
          },
          {
            id: 2,
            cardholderName: '张经理',
            cardNumber: '6228****5678',
            maskedNumber: '6228****5678',
            bankName: '中国建设银行',
            branchName: '三亚分行'
          }
        ]
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        currentPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      bankCardForm: {
        cardholderName: '',
        cardNumber: '',
        bankName: '',
        branchName: ''
      },
      bankCardRules: {
        cardholderName: [
          { required: true, message: '请输入持卡人姓名', trigger: 'blur' }
        ],
        cardNumber: [
          { required: true, message: '请输入银行卡号', trigger: 'blur' }
        ],
        bankName: [
          { required: true, message: '请输入开户银行', trigger: 'blur' }
        ]
      },
      notificationSettings: {
        newOrder: true,
        orderStatus: true,
        refundRequest: true,
        systemMaintenance: true,
        featureUpdate: false,
        securityAlert: true,
        promotion: false,
        marketNews: false
      },
      editForm: {
        name: '',
        type: '',
        contactPerson: '',
        phone: '',
        email: '',
        licenseNumber: '',
        address: '',
        description: ''
      },
      editRules: {
        name: [
          { required: true, message: '请输入商户名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择商户类型', trigger: 'change' }
        ],
        contactPerson: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getLevelName(level) {
      const levelMap = {
        basic: '基础商户',
        premium: '高级商户',
        vip: 'VIP商户'
      };
      return levelMap[level] || level;
    },
    
    getLevelTagType(level) {
      const typeMap = {
        basic: 'info',
        premium: 'primary',
        vip: 'danger'
      };
      return typeMap[level] || 'info';
    },
    
    getTypeName(type) {
      const typeMap = {
        hotel: '酒店',
        travel_agency: '旅行社',
        attraction: '景区',
        other: '其他'
      };
      return typeMap[type] || type;
    },
    
    handleAvatarSuccess(response, file) {
      this.merchantInfo.avatar = URL.createObjectURL(file.raw);
    },
    
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    
    editBasicInfo() {
      this.showEditDialog = true;
      this.editForm = { ...this.merchantInfo };
    },
    
    saveEditInfo() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.merchantInfo = { ...this.editForm };
          this.$message.success('基本信息保存成功');
          this.showEditDialog = false;
        }
      });
    },
    
    changePassword() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          this.$message.success('密码修改成功');
          this.showChangePasswordDialog = false;
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        }
      });
    },
    
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    },
    
    verifyPhone() {
      this.$message.success('手机验证码已发送');
    },
    
    verifyEmail() {
      this.$message.success('邮箱验证码已发送');
    },
    
    viewLoginLogs() {
      this.$message.info('登录日志功能开发中');
    },
    
    addBankCard() {
      this.bankCardForm = {
        cardholderName: '',
        cardNumber: '',
        bankName: '',
        branchName: ''
      };
      this.showAddCardDialog = true;
    },
    
    submitBankCard() {
      this.$refs.bankCardForm.validate((valid) => {
        if (valid) {
          const newCard = {
            id: Date.now(),
            cardholderName: this.bankCardForm.cardholderName,
            cardNumber: this.bankCardForm.cardNumber,
            maskedNumber: this.bankCardForm.cardNumber.replace(/(\d{4})\d+(\d{4})/, '$1****$2'),
            bankName: this.bankCardForm.bankName,
            branchName: this.bankCardForm.branchName
          };
          this.merchantInfo.bankCards.push(newCard);
          this.$message.success('银行卡添加成功');
          this.showAddCardDialog = false;
        }
      });
    },
    
    editBankCard() {
      this.$message.info('编辑银行卡功能开发中');
    },
    
    deleteBankCard(card) {
      this.$confirm('确定要删除这张银行卡吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.merchantInfo.bankCards.findIndex(c => c.id === card.id);
        if (index > -1) {
          this.merchantInfo.bankCards.splice(index, 1);
          this.$message.success('银行卡删除成功');
        }
      });
    },
    
    saveNotificationSettings() {
      this.$message.success('通知设置保存成功');
    },
    
    goToProductManagement() {
      this.$router.push('/merchant/productManagement');
    },
    
    goToOrderProcessing() {
      this.$router.push('/merchant/orderProcessing');
    },
    
    goToDataCenter() {
      this.$router.push('/merchant/dataCenter');
    }
  }
}
</script>

<style scoped>
.merchant-info {
  padding: 24px;
  min-height: 100vh;
}


/* 页面标题 */
.page-header {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-section {
  position: relative;
  margin-right: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-uploader-icon {
  color: white;
  font-size: 16px;
}

.profile-info h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.merchant-level {
  margin: 0 0 5px 0;
}

.merchant-id {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  border-radius: 8px;
}

.stat-icon.products {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon i {
  font-size: 18px;
  position: relative;
  z-index: 1;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2px;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
}

.quick-actions {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.actions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.actions-header i {
  color: #3b82f6;
}

.actions-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
}

.action-btn {
  width: 100% !important;
  height: 44px !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

.action-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.action-btn i {
  font-size: 16px !important;
}

.info-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
  border: none;
}

.info-display {
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  margin-right: 15px;
  flex-shrink: 0;
}

.info-value {
  color: #495057;
  flex: 1;
  word-break: break-all;
}

.info-description {
  color: #495057;
  flex: 1;
  line-height: 1.6;
  word-break: break-all;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.info-form {
  max-width: 600px;
}

.form-actions {
  text-align: right;
  margin-top: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.setting-label p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.finance-overview {
  margin-bottom: 30px;
}

.finance-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.finance-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.finance-icon i {
  color: white;
  font-size: 20px;
}

.finance-content {
  flex: 1;
}

.finance-amount {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.finance-label {
  font-size: 14px;
  color: #666;
}

.section-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-subheader h4 {
  margin: 0;
  color: #333;
}

.card-list {
  space-y: 15px;
}

.bank-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.card-info {
  flex: 1;
}

.card-number {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.card-bank {
  color: #666;
  font-size: 14px;
}

.card-actions .el-button {
  margin-left: 10px;
}

.notification-settings {
  max-width: 600px;
}

.setting-group {
  margin-bottom: 30px;
}

.setting-group h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.setting-actions {
  text-align: right;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.dialog-footer {
  text-align: right;
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
