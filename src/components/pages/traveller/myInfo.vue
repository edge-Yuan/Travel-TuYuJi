<template>
  <div class="personal-center">
    <el-header class="header">
      <div class="logo">个人中心</div>
      <el-menu 
        mode="horizontal" 
        :default-active="activeMenu" 
        class="nav-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="profile">个人资料</el-menu-item>
        <el-menu-item index="security">安全设置</el-menu-item>
        <el-menu-item index="notifications">通知管理</el-menu-item>
        <el-menu-item index="help">帮助中心</el-menu-item>
      </el-menu>
      <div class="user-actions">
        <el-button type="text" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="300px" class="user-info-card">
        <div class="avatar-container">
          <el-upload
            class="avatar-uploader"
            :action="avatarUploadAction"
            :headers="authHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadAvatarManually"
          >
            <img v-if="userInfo.avatar" :src="getFullAvatarUrl(userInfo.avatar)" class="avatar" @error="handleAvatarError" @load="handleAvatarLoad">
            <div v-else class="default-avatar">
              <i class="el-icon-user-solid"></i>
            </div>
          </el-upload>
          <div class="user-name">{{ userInfo.name }}</div>
          <div class="user-id">ID: {{ userInfo.id }}</div>
          <div class="user-status" :class="userInfo.status === 'online' ? 'status-online' : 'status-offline'">
            {{ userInfo.status === 'online' ? '在线' : '离线' }}
          </div>
        </div>
        
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.stats.routes }}</div>
            <div class="stat-label">规划行程</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.stats.orders }}</div>
            <div class="stat-label">订单</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.stats.evaluations }}</div>
            <div class="stat-label">评价</div>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <div class="membership-info">
          <p class="membership-note">{{ userInfo.membership.level }}，感谢您的支持。完善个人资料、积极互动即可解锁更多权益与专属服务。</p>
        </div>
      </el-aside>

      <el-main class="content-area">
        <!-- 骨架屏 -->
        <div v-if="loading" class="skeleton-container">
          <el-card class="content-card">
            <el-skeleton :rows="8" animated />
          </el-card>
        </div>
        
        <el-card v-else-if="activeMenu === 'profile'" class="content-card profile-card">
          <div slot="header" class="card-header">
            <span>个人资料</span>
            <el-button 
              type="primary" 
              size="mini" 
              class="edit-btn"
              @click="openEditProfileDialog"
            >
              编辑资料
            </el-button>
          </div>
          
          <div class="profile-info">
            <div class="info-row">
              <div class="info-label">用户名</div>
              <div class="info-value">{{ userProfile.username }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">昵称</div>
              <div class="info-value">{{ userProfile.realname }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">性别</div>
              <div class="info-value">{{ genderMap[userProfile.gender] || '未设置' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">出生日期</div>
              <div class="info-value">{{ userProfile.birthday }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">邮箱</div>
              <div class="info-value">{{ userProfile.email }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">手机号码</div>
              <div class="info-value">{{ userProfile.phone }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">所在地</div>
              <div class="info-value">{{ (userProfile.location || []).join(' ') }}</div>
            </div>
            <div class="info-row bio-row">
              <div class="info-label">个人简介</div>
              <div class="info-value bio-value">{{ userProfile.bio }}</div>
            </div>
          </div>
        </el-card>
        
        <el-card v-if="activeMenu === 'security'" class="content-card">
          <div slot="header" class="card-header">
            <span>安全设置</span>
          </div>
          <div class="security-item">
            <div class="security-label">
              <i class="el-icon-lock"></i>
              <span>登录密码</span>
            </div>
            <div class="security-status">
              <span class="status-text">已设置</span>
              <el-button type="text" @click="showChangePwdDialog">修改</el-button>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="security-item">
            <div class="security-label">
              <i class="el-icon-phone"></i>
              <span>手机号码</span>
            </div>
            <div class="security-status">
              <span class="status-text">{{ userProfile.phone ? '已绑定' : '未绑定' }}</span>
              <el-button type="text" @click="showBindPhoneDialog">
                {{ userProfile.phone ? '更换' : '绑定' }}
              </el-button>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="security-item">
            <div class="security-label">
              <i class="el-icon-envelope"></i>
              <span>邮箱地址</span>
            </div>
            <div class="security-status">
              <span class="status-text">{{ userProfile.email ? '已验证' : '未验证' }}</span>
              <el-button type="text" @click="showBindEmailDialog">
                {{ userProfile.email ? '更换' : '绑定' }}
              </el-button>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="security-item">
            <div class="security-label">
              <i class="el-icon-shield"></i>
              <span>二次验证</span>
            </div>
            <div class="security-status">
              <span class="status-text">{{ twoFactorEnabled ? '已开启' : '未开启' }}</span>
              <el-switch 
                v-model="twoFactorEnabled" 
                active-text="开启" 
                inactive-text="关闭"
                @change="handleTwoFactorChange"
              ></el-switch>
            </div>
          </div>
        </el-card>
        
        <el-card v-if="activeMenu === 'notifications'" class="content-card">
          <div slot="header" class="card-header">
            <span>通知管理</span>
          </div>
          
          <el-form :model="notificationSettings" class="notification-form">
            <el-form-item label="系统通知">
              <el-switch v-model="notificationSettings.system" active-text="开启" inactive-text="关闭"></el-switch>
            </el-form-item>
            <el-form-item label="消息通知">
              <el-switch v-model="notificationSettings.messages" active-text="开启" inactive-text="关闭"></el-switch>
            </el-form-item>
            <el-form-item label="活动通知">
              <el-switch v-model="notificationSettings.events" active-text="开启" inactive-text="关闭"></el-switch>
            </el-form-item>
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.email" active-text="开启" inactive-text="关闭"></el-switch>
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="notificationSettings.sms" active-text="开启" inactive-text="关闭"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
          
          <el-divider></el-divider>
          
          <div class="notification-history">
            <div class="history-header">
              <span>通知历史</span>
              <el-button type="text" @click="markAllAsRead">全部标为已读</el-button>
            </div>

            <el-list v-for="(notification, index) in notifications" :key="index" class="notification-item">
              <el-list-item :class="{ 'unread': !notification.read }">
                <el-list-item__avatar>
                  <i :class="notification.icon" class="notification-icon"></i>
                </el-list-item__avatar>
                <el-list-item__content>
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-desc">{{ notification.content }}</div>
                </el-list-item__content>
                <el-list-item__extra class="notification-time">
                  {{ formatTime(notification.time) }}
                </el-list-item__extra>
              </el-list-item>
            </el-list>
            
            <el-pagination
              class="pagination"
              layout="prev, pager, next"
              :total="notifications.length"
              :page-size="5"
            ></el-pagination>
          </div>
        </el-card>
        
        <el-card v-if="activeMenu === 'help'" class="content-card">
          <div slot="header" class="card-header">
            <span>帮助中心</span>
          </div>

          <div class="help-center">
            <el-collapse accordion>
              <el-collapse-item title="如何修改个人资料？" name="1">
                <div class="help-content">
                  进入"个人资料"页面，点击"编辑资料"按钮即可修改您的个人信息，修改完成后点击"保存"按钮提交更改。
                </div>
              </el-collapse-item>
              <el-collapse-item title="如何更改登录密码？" name="2">
                <div class="help-content">
                  进入"安全设置"页面，找到"登录密码"选项，点击"修改"按钮，按照提示输入原密码和新密码即可完成密码修改。
                </div>
              </el-collapse-item>
              <el-collapse-item title="如何开启二次验证？" name="3">
                <div class="help-content">
                  进入"安全设置"页面，找到"二次验证"选项，开启开关后按照系统提示完成验证设置即可。
                </div>
              </el-collapse-item>
              <el-collapse-item title="如何更改绑定的手机号？" name="4">
                <div class="help-content">
                  进入"安全设置"页面，找到"手机号码"选项，点击"更换"按钮，按照提示完成手机验证和新号码绑定即可。
                </div>
              </el-collapse-item>
              <el-collapse-item title="如何设置通知偏好？" name="5">
                <div class="help-content">
                  进入"通知管理"页面，可以开启或关闭不同类型的通知，设置完成后点击"保存设置"按钮即可生效。
                </div>
              </el-collapse-item>
            </el-collapse>
            
            <div class="contact-support">
              <el-divider content-position="left">联系客服</el-divider>
              <el-button type="primary" icon="el-icon-headset" @click="showContactDialog">
                在线客服
              </el-button>
              <el-button type="default" icon="el-icon-message" style="margin-left: 10px;">
                发送邮件
              </el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <el-footer class="footer">
      <div class="footer-content">
        <p>© 2025 途遇记旅游管理系统 版权所有</p>
        <div class="footer-links">
          <a href="#" class="footer-link">隐私政策</a>
          <a href="#" class="footer-link">用户协议</a>
          <a href="#" class="footer-link">帮助中心</a>
        </div>
      </div>
    </el-footer>

    <el-dialog title="编辑个人资料" :visible.sync="editProfileDialogVisible" width="520px" custom-class="edit-profile-dialog">
      <el-form 
        :model="editProfileForm" 
        ref="editProfileForm"
        :rules="profileRules"
        label-width="100px"
        class="edit-profile-form"
      >
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="editProfileForm.username"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="realname">
              <el-input v-model="editProfileForm.realname"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="editProfileForm.gender" size="small" class="gender-group">
                <el-radio-button label="male">男</el-radio-button>
                <el-radio-button label="female">女</el-radio-button>
                <el-radio-button label="other">保密</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="editProfileForm.birthday"
                type="date"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editProfileForm.email" type="email"></el-input>
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="editProfileForm.phone" type="tel"></el-input>
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editProfileForm.bio" 
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 4 }"
            class="no-resize"
            placeholder="请输入个人简介"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="所在地" prop="location">
          <el-cascader
            v-model="editProfileForm.location"
            :options="locationOptions"
            :props="locationProps"
            placeholder="选择省/市/区"
            style="width: 100%;"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editProfileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditProfileForm">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改密码" :visible.sync="changePwdDialogVisible" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm">
        <el-form-item label="原密码" prop="oldPwd">
          <el-input type="password" v-model="passwordForm.oldPwd"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input type="password" v-model="passwordForm.newPwd"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPwd">
          <el-input type="password" v-model="passwordForm.confirmPwd"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="changePwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordForm">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog 
      :title="userProfile.phone ? '更换手机号码' : '绑定手机号码'" 
      :visible.sync="bindPhoneDialogVisible" 
      width="400px"
    >
      <el-form :model="phoneForm" :rules="phoneRules" ref="phoneForm">
        <el-form-item label="手机号码" prop="phone">
          <el-input type="tel" v-model="phoneForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="14">
              <el-input v-model="phoneForm.code"></el-input>
            </el-col>
            <el-col :span="10">
              <el-button 
                type="text" 
                @click="sendCode('phone')"
                :disabled="codeSending.phone"
              >
                {{ codeSending.phone ? `${countdown.phone}秒后重发` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="bindPhoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPhoneForm">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog 
      :title="userProfile.email ? '更换邮箱地址' : '绑定邮箱地址'" 
      :visible.sync="bindEmailDialogVisible" 
      width="400px"
    >
      <el-form :model="emailForm" :rules="emailRules" ref="emailForm">
        <el-form-item label="邮箱地址" prop="email">
          <el-input type="email" v-model="emailForm.email"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="14">
              <el-input v-model="emailForm.code"></el-input>
            </el-col>
            <el-col :span="10">
              <el-button 
                type="text" 
                @click="sendCode('email')"
                :disabled="codeSending.email"
              >
                {{ codeSending.email ? `${countdown.email}秒后重发` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="bindEmailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEmailForm">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="在线客服" :visible.sync="contactDialogVisible" width="500px">
      <div class="customer-service">
        <div class="service-message">
          <div class="service-avatar">
            <i class="el-icon-user"></i>
          </div>
          <div class="service-text">
            您好！有什么可以帮助您的吗？
          </div>
        </div>
        
        <div class="message-input">
          <el-input 
            type="textarea" 
            v-model="serviceMessage" 
            placeholder="请输入您的问题..."
            rows="3"
          ></el-input>
          <el-button 
            type="primary" 
            class="send-btn"
            @click="sendServiceMessage"
            :disabled="!serviceMessage.trim()"
          >
            发送
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'myInfo',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') return callback(new Error('请输入密码'));
      if (value.length < 6) return callback(new Error('密码长度不能少于6位'));
      if (this.passwordForm.confirmPwd !== '') this.$refs.passwordForm.validateField('confirmPwd');
      callback();
    };
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') return callback(new Error('请确认密码'));
      if (value !== this.passwordForm.newPwd) return callback(new Error('两次输入的密码不一致'));
      callback();
    };
    const validatePhone = (rule, value, callback) => {
      const digits = String(value || '').replace(/\D/g, '');
      if (!digits) return callback(new Error('请输入手机号码'));
      if (!/^1[3-9]\d{9}$/.test(digits)) return callback(new Error('请输入正确的手机号码'));
      callback();
    };
    return {
      activeMenu: 'profile',
      loading: false,
      userInfo: {
        id: '',
        name: '',
        avatar: '',
        status: 'online',
        stats: { routes: 0, orders: 0, evaluations: 0 },
        membership: { level: '黄金会员', icon: 'el-icon-crown', progress: 68, color: '#e6a23c' }
      },
      genderMap: { male: '男', female: '女', other: '保密', '': '未设置', null: '未设置', undefined: '未设置' },
      userProfile: {
        username: '',
        realname: '',
        gender: 'other',
        birthday: '',
        email: '',
        phone: '',
        bio: '',
        location: []
      },
      editProfileForm: {
        username: '',
        realname: '',
        gender: 'other',
        birthday: '',
        email: '',
        phone: '',
        bio: '',
        location: []
      },
      // 让级联返回 label 值，避免提交数字编码
      locationProps: { value: 'label', label: 'label', children: 'children', checkStrictly: false, emitPath: true },
      editProfileDialogVisible: false,
      profileRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        realname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { validator: validatePhone, trigger: 'blur' }
        ]
      },
      // 全国省市区数据（启动后自动加载完整数据集，失败则回退为空）
      locationOptions: [],
      twoFactorEnabled: false,
      changePwdDialogVisible: false,
      passwordForm: { oldPwd: '', newPwd: '', confirmPwd: '' },
      passwordRules: {
        oldPwd: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
        newPwd: [{ validator: validatePassword, trigger: 'blur' }],
        confirmPwd: [{ validator: validateConfirmPassword, trigger: 'blur' }]
      },
      bindPhoneDialogVisible: false,
      phoneForm: { phone: '', code: '' },
      phoneRules: {
        phone: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
      },
      bindEmailDialogVisible: false,
      emailForm: { email: '', code: '' },
      emailRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
      },
      codeSending: { phone: false, email: false },
      countdown: { phone: 60, email: 60 },
      notificationSettings: { system: true, messages: true, events: false, email: true, sms: false },
      notifications: [
        { id: 1, title: '系统通知', content: '您的账户已成功升级为黄金会员', time: '2023-06-15 10:30:00', read: false, icon: 'el-icon-info' },
        { id: 2, title: '新消息提醒', content: '李四给您发送了一条新消息', time: '2023-06-14 16:45:22', read: false, icon: 'el-icon-message' },
        { id: 3, title: '活动通知', content: '端午节活动即将开始，快来参与吧', time: '2023-06-10 09:15:33', read: true, icon: 'el-icon-gift' },
        { id: 4, title: '账户安全提醒', content: '您的账户于异地登录，请注意账户安全', time: '2023-06-05 22:10:45', read: true, icon: 'el-icon-warning' }
      ],
      contactDialogVisible: false,
      serviceMessage: ''
    };
  },
  computed: {
    apiBase() {
      return 'http://localhost:8086/travelManagementSystem/travel-portal';
    },
    currentUserId() {
      // 多源获取：userInfo -> 显式 userId -> token
      try {
        const tryParse = (v) => { try { return JSON.parse(v) } catch { return null } };
        const pickId = (o) => o && (o.userId || o.id || o.uid || o.user?.id || o.user?.userId) || '';
        const info = tryParse(localStorage.getItem('userInfo')) || tryParse(sessionStorage.getItem('userInfo'));
        const idFromInfo = pickId(info);
      const idFromLS = localStorage.getItem('userId') || '';
      const idFromSession = sessionStorage.getItem('userId') || '';
      const idFromToken = this.decodeUserIdFromToken() || '';
        return String(idFromInfo || idFromLS || idFromSession || idFromToken || this.userInfo.id || '');
      } catch {
        return this.userInfo.id || '';
      }
    },
    authHeaders() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    avatarUploadAction() {
      return '';
    }
  },
  created() {
    this.loading = true;
    this.initCurrentUserSkeleton();
    this.fetchUserProfile();
    this.loadChinaRegions();
    this.loadUserStats();
  },
  methods: {
    async loadChinaRegions() {
      try {
        // 1) 优先尝试本地依赖（若已安装 element-china-area-data）
        try {
          // eslint-disable-next-line global-require
          const mod = require('element-china-area-data');
          const region = (mod && (mod.regionData || mod.default?.regionData)) || null;
          if (Array.isArray(region) && region.length) {
            this.locationOptions = region;
            return;
          }
          const provinceAndCityData = (mod && (mod.provinceAndCityData || mod.default?.provinceAndCityData)) || null;
          if (Array.isArray(provinceAndCityData) && provinceAndCityData.length) {
            this.locationOptions = provinceAndCityData;
            return;
          }
        } catch (e) { /* 忽略未安装依赖 */ }

        // 2) 无本地依赖时走 CDN
        // 优先从 CDN 加载 element-china-area-data 标准结构
        const url = 'https://unpkg.com/element-china-area-data/dist/element-china-area-data.json';
        const resp = await fetch(url, { cache: 'force-cache' });
        if (!resp.ok) throw new Error('load regions failed');
        const json = await resp.json();
        // 该数据已是 { value,label,children } 结构，可直接用于 el-cascader
        if (Array.isArray(json) && json.length) {
          this.locationOptions = json;
          return;
        }
        // 兼容某些版本导出 { provinceAndCityData, regionData, areaData }
        const maybe = json.provinceAndCityData || json.regionData || json.areaData || [];
        this.locationOptions = Array.isArray(maybe) ? maybe : [];
      } catch (e) {
        // 回退为最小数据集，避免阻塞表单使用
        this.locationOptions = [
          { value: '北京市', label: '北京市', children: [ { value: '北京市', label: '北京市', children: [ { value: '东城区', label: '东城区' }, { value: '西城区', label: '西城区' } ] } ] },
          { value: '上海市', label: '上海市', children: [ { value: '上海市', label: '上海市', children: [ { value: '黄浦区', label: '黄浦区' }, { value: '徐汇区', label: '徐汇区' } ] } ] }
        ];
      }
    },
    decodeUserIdFromToken() {
      const raw = localStorage.getItem('token') || sessionStorage.getItem('token');
       if (!raw) return '';
       try {
         const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
         const base64url = token.split('.')[1];
         if (!base64url) return '';
         const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
         const json = decodeURIComponent(escape(window.atob(base64)));
         const payload = JSON.parse(json);
         const candidateKeys = ['userId', 'user_id', 'uid', 'id', 'sub', 'subject'];
         let found = '';
         for (const key of candidateKeys) {
           if (payload && payload[key] != null && payload[key] !== '') {
             found = String(payload[key]);
             break;
           }
         }
         if (!found && payload && payload.user) {
           const nested = payload.user;
           for (const key of candidateKeys) {
             if (nested && nested[key] != null && nested[key] !== '') {
               found = String(nested[key]);
               break;
             }
           }
         }
         return found || '';
       } catch (e) {
         return '';
       }
     },
    initCurrentUserSkeleton() {
      const userIdFromLS = localStorage.getItem('userId') || '';
      const userIdFromSession = sessionStorage.getItem('userId') || '';
      const userIdFromToken = this.decodeUserIdFromToken() || '';
      const userId = userIdFromLS || userIdFromSession || userIdFromToken;
      const username = localStorage.getItem('username') || '';
      if (userId) {
        if (!userIdFromLS) localStorage.setItem('userId', String(userId));
        if (!userIdFromSession) sessionStorage.setItem('userId', String(userId));
      }
      this.userInfo.id = userId;
      this.userInfo.name = username;
    },
    async fetchUserProfile() {
      if (!this.currentUserId) {
        this.$message.warning('未获取到用户ID，请先登录');
        this.loading = false;
        return;
      }
      try {
        // 获取用户基本信息
        const resp = await request.get(`${this.apiBase}/sysUser/profile/${this.currentUserId}`, { headers: this.authHeaders });
        const body = resp && (resp.data || resp);
        const u = body && (body.data || body.result || body) || {};
        
        this.userProfile = {
          username: u.username || '',
          realname: u.realName || u.nickName || '',
          gender: this.normalizeGenderFromServer(u.gender),
          birthday: u.birthday || '',
          email: u.email || '',
          phone: u.phone || '',
          bio: u.bio || '',
          location: u.location ? String(u.location).split(',').filter(Boolean) : [],
          avatar: '' // 头像将通过专门的接口获取
        };
        
        this.userInfo.name = u.realName || u.username || this.userInfo.name;
        
        // 获取用户头像信息
        const avatarUrl = await this.loadUserAvatar();
        if (avatarUrl) {
          this.userProfile.avatar = avatarUrl;
        } else {
          // 如果后端接口失败，尝试从本地存储获取
          const localUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          const sessionUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
          const fallbackAvatar = localUserInfo.avatar || sessionUserInfo.avatar || u.avatar || u.avatarUrl || u.headImage;
          
          if (fallbackAvatar) {
            this.userInfo.avatar = fallbackAvatar;
            this.userProfile.avatar = fallbackAvatar;
            console.log('使用本地存储或用户资料中的头像:', fallbackAvatar);
          }
        }
        
        console.log('用户资料加载完成:', {
          avatar: this.userInfo.avatar,
          name: this.userInfo.name,
          userProfile: this.userProfile
        });
        
        // 调试头像状态
        this.debugAvatarStatus();
      } catch (e) {
        this.$message.error(e?.response?.data?.msg || '获取个人资料失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 加载用户统计数据
    async loadUserStats() {
      if (!this.currentUserId) {
        return;
      }
      
      try {
        console.log('开始获取用户统计数据，用户ID:', this.currentUserId);
        
        // 并行获取所有统计数据
        const [itineraryRes, orderRes, evaluationRes] = await Promise.allSettled([
          // 获取行程数量 - 使用正确的API路径
          request.get(`${this.apiBase}/tourItinerary/travelRoute/user/${this.currentUserId}/count`, { headers: this.authHeaders }),
          // 获取订单数量 - 使用正确的API路径
          request.get(`${this.apiBase}/tourOrder/order/user/${this.currentUserId}/count`, { headers: this.authHeaders }),
          // 获取评价数量 - 使用正确的API路径
          request.get(`${this.apiBase}/evaluation/user/${this.currentUserId}/count`, { headers: this.authHeaders })
        ]);
        
        // 处理行程数量
        if (itineraryRes.status === 'fulfilled') {
          const itineraryData = itineraryRes.value?.data || itineraryRes.value;
          this.userInfo.stats.routes = itineraryData?.data || 0;
          console.log('行程数量获取成功:', this.userInfo.stats.routes);
        } else {
          console.error('获取行程数量失败:', itineraryRes.reason);
        }
        
        // 处理订单数量
        if (orderRes.status === 'fulfilled') {
          const orderData = orderRes.value?.data || orderRes.value;
          this.userInfo.stats.orders = orderData?.data || 0;
          console.log('订单数量获取成功:', this.userInfo.stats.orders);
        } else {
          console.error('获取订单数量失败:', orderRes.reason);
        }
        
        // 处理评价数量
        if (evaluationRes.status === 'fulfilled') {
          const evaluationData = evaluationRes.value?.data || evaluationRes.value;
          this.userInfo.stats.evaluations = evaluationData?.data || 0;
          console.log('评价数量获取成功:', this.userInfo.stats.evaluations);
        } else {
          console.error('获取评价数量失败:', evaluationRes.reason);
        }
        
        console.log('用户统计数据加载完成:', this.userInfo.stats);
      } catch (error) {
        console.error('加载用户统计数据失败:', error);
        // 如果API调用失败，使用模拟数据
        this.userInfo.stats = {
          routes: Math.floor(Math.random() * 20) + 1,
          orders: Math.floor(Math.random() * 50) + 1,
          evaluations: Math.floor(Math.random() * 30) + 1
        };
        console.log('使用模拟数据:', this.userInfo.stats);
      }
    },
    
    handleMenuSelect(key) {
      this.activeMenu = key;
    },
    openEditProfileDialog() {
      this.editProfileForm = { ...this.userProfile };
      this.editProfileForm.location = [...(this.userProfile.location || [])];
      this.editProfileDialogVisible = true;
    },
    async submitEditProfileForm() {
      this.$refs.editProfileForm.validate(async (valid) => {
        if (!valid) return false;
        if (!this.currentUserId) {
          this.$message.warning('未获取到用户ID，请先登录');
          return false;
        }
        try {
          const payload = {
            userId: this.currentUserId,
            username: this.editProfileForm.username,
            realName: this.editProfileForm.realname,
            gender: this.mapGenderToServer(this.editProfileForm.gender),
            birthday: this.editProfileForm.birthday,
            email: this.editProfileForm.email,
            phone: this.editProfileForm.phone,
            bio: this.editProfileForm.bio,
            // 使用 label 串联，避免数字编码入库
            location: Array.isArray(this.editProfileForm.location)
              ? this.editProfileForm.location.join(',')
              : String(this.editProfileForm.location || '')
          };
          const res = await request.put(`${this.apiBase}/sysUser/updateProfile`, payload, { headers: this.authHeaders });
          if (res?.data?.code === 1 || res?.data?.data === true) {
            this.$message.success('个人资料更新成功');
            this.editProfileDialogVisible = false;
            this.fetchUserProfile();
          } else {
            this.$message.error(res?.data?.msg || '更新失败');
          }
        } catch (e) {
          this.$message.error(e?.response?.data?.msg || '更新失败');
        }
      });
    },
    normalizeGenderFromServer(serverGender) {
      if (!serverGender) return 'other';
      const text = String(serverGender).toLowerCase();
      if (text === '男' || text === 'male' || text === 'm' || text === '1') return 'male';
      if (text === '女' || text === 'female' || text === 'f' || text === '2') return 'female';
      if (text === '保密' || text === 'other' || text === '0') return 'other';
      return 'other';
    },
    mapGenderToServer(localGender) {
      if (localGender === 'male') return '男';
      if (localGender === 'female') return '女';
      return '保密';
    },
    handleAvatarSuccess() {
      // 这个方法不应该被调用，因为我们使用了自定义的uploadAvatarManually方法
      console.log('handleAvatarSuccess被调用，但应该使用uploadAvatarManually方法');
      // 不设置blob URL，避免URL混合问题
    },
    beforeAvatarUpload(file) {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isValidType) this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
      if (!isLt2M) this.$message.error('上传头像图片大小不能超过 2MB!');
      return isValidType && isLt2M;
    },
    async uploadAvatarManually(options) {
      try {
        console.log('开始上传头像:', options.file);
        
        // 准备FormData
        const formData = new FormData();
        formData.append('file', options.file);
        formData.append('userId', this.currentUserId);
        
        console.log('头像上传数据:', {
          userId: this.currentUserId,
          fileName: options.file.name,
          fileSize: options.file.size,
          fileType: options.file.type
        });
        
        // 调用后端头像上传接口 - 使用正确的URL路径
        const response = await request.post('http://localhost:8086/travelManagementSystem/travel-portal/upload/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('头像上传响应:', response);
        
        // 解析响应数据
        const data = response.data || response;
        const uploadResult = data.data || data.result || data;
        
        if (uploadResult && uploadResult.url) {
          console.log('头像上传成功，URL:', uploadResult.url);
          
          // 清理URL路径，移除重复的/uploads
          let cleanUrl = uploadResult.url;
          if (cleanUrl.startsWith('/uploads/uploads/')) {
            cleanUrl = cleanUrl.replace('/uploads/uploads/', '/uploads/');
            console.log('清理重复路径:', uploadResult.url, '->', cleanUrl);
          }
          
          // 验证上传的URL是否有效
          if (!this.isValidAvatarUrl(cleanUrl)) {
            console.error('上传的头像URL无效:', cleanUrl);
            throw new Error('上传的头像URL格式无效');
          }
          
          // 立即更新前端显示
          this.userInfo.avatar = cleanUrl;
          this.userProfile.avatar = cleanUrl;
          
          // 调用后端API更新用户头像信息
          await this.updateUserAvatar(cleanUrl);
          
          this.$message.success('头像上传成功！');
          options.onSuccess && options.onSuccess(uploadResult, options.file);
        } else {
          throw new Error('上传响应数据格式错误');
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        this.$message.error('头像上传失败: ' + (error.message || '请重试'));
        options.onError && options.onError(error);
      }
    },
    
    // 更新用户头像信息到后端
    async updateUserAvatar(avatarUrl) {
      try {
        console.log('开始更新用户头像信息:', avatarUrl);
        
        // 使用后端提供的用户头像信息接口 - 使用正确的URL路径
        const response = await request.get(`http://localhost:8086/travelManagementSystem/travel-portal/user/${this.currentUserId}/avatar`);
        console.log('获取用户头像信息响应:', response);
        
        // 解析响应数据
        const data = response.data || response;
        const avatarData = data.data || data.result || data;
        
        if (avatarData && avatarData.hasAvatar) {
          console.log('用户已有头像，更新头像URL');
          // 如果用户已有头像，更新头像URL
          await this.updateUserAvatarUrl(avatarUrl);
        } else {
          console.log('用户无头像，创建新头像记录');
          // 如果用户无头像，创建新头像记录
          await this.createUserAvatar(avatarUrl);
        }
        
        // 更新本地存储
        this.updateLocalStorageAvatar(avatarUrl);
        
        console.log('用户头像信息已更新到后端和本地存储');
        this.$message.success('头像已保存！');
      } catch (error) {
        console.error('更新用户头像信息失败:', error);
        
        // 即使后端更新失败，也要更新本地存储，确保头像在本次会话中显示
        this.updateLocalStorageAvatar(avatarUrl);
        
        this.$message.warning('头像上传成功，但保存到服务器失败，请稍后重试');
      }
    },
    
    // 更新用户头像URL
    async updateUserAvatarUrl(avatarUrl) {
      try {
        console.log('开始更新用户头像URL:', avatarUrl);
        
        // 使用刷新接口而不是更新接口
        const response = await request.post(`http://localhost:8086/travelManagementSystem/travel-portal/user/${this.currentUserId}/avatar/refresh`, {
          avatarUrl: avatarUrl
        });
        
        console.log('更新用户头像URL响应:', response);
        return response;
      } catch (error) {
        console.error('更新用户头像URL失败:', error);
        // 如果刷新接口失败，尝试使用基础接口
        try {
          console.log('刷新接口失败，尝试使用基础接口...');
          const fallbackResponse = await request.post(`http://localhost:8086/travelManagementSystem/travel-portal/user/${this.currentUserId}/avatar`, {
            avatarUrl: avatarUrl
          });
          console.log('基础接口响应:', fallbackResponse);
          return fallbackResponse;
        } catch (fallbackError) {
          console.error('基础接口也失败:', fallbackError);
          throw error;
        }
      }
    },
    
    // 创建用户头像记录
    async createUserAvatar(avatarUrl) {
      try {
        const response = await request.post(`http://localhost:8086/travelManagementSystem/travel-portal/user/${this.currentUserId}/avatar`, {
          avatarUrl: avatarUrl
        });
        console.log('创建用户头像记录响应:', response);
        return response;
      } catch (error) {
        console.error('创建用户头像记录失败:', error);
        throw error;
      }
    },
    
    // 更新本地存储中的头像信息
    updateLocalStorageAvatar(avatarUrl) {
      // 更新localStorage中的用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.avatar = avatarUrl;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 更新sessionStorage中的用户信息
      const sessionUserInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
      sessionUserInfo.avatar = avatarUrl;
      sessionStorage.setItem('userInfo', JSON.stringify(sessionUserInfo));
      
      console.log('本地存储头像信息已更新:', avatarUrl);
    },
    
    // 获取用户头像信息
    async loadUserAvatar() {
      try {
        console.log('开始获取用户头像信息，用户ID:', this.currentUserId);
        
        const response = await request.get(`http://localhost:8086/travelManagementSystem/travel-portal/user/${this.currentUserId}/avatar`);
        console.log('获取用户头像信息响应:', response);
        
        const data = response.data || response;
        const avatarData = data.data || data.result || data;
        
        if (avatarData && avatarData.hasAvatar && avatarData.avatarUrl) {
          console.log('用户有头像，URL:', avatarData.avatarUrl);
          this.userInfo.avatar = avatarData.avatarUrl;
          this.userProfile.avatar = avatarData.avatarUrl;
          return avatarData.avatarUrl;
        } else {
          console.log('用户无头像或头像URL为空');
          return null;
        }
      } catch (error) {
        console.error('获取用户头像信息失败:', error);
        return null;
      }
    },
    
    // 获取完整的头像URL
    getFullAvatarUrl(url) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      console.log('原始头像URL:', url);
      
      // 处理多种路径问题
      let cleanUrl = url;
      
      // 首先清理双斜杠问题
      cleanUrl = cleanUrl.replace(/\/+/g, '/');
      console.log('清理双斜杠后:', cleanUrl);
      
      // 清理重复的uploads路径
      if (cleanUrl.includes('/uploads/uploads/')) {
        cleanUrl = cleanUrl.replace('/uploads/uploads/', '/uploads/');
        console.log('检测到重复的uploads路径，已清理:', cleanUrl);
      }
      
      // 清理错误的文件路径
      if (cleanUrl.includes('/files/uploads/')) {
        cleanUrl = cleanUrl.replace('/files/uploads/', '/uploads/');
        console.log('检测到错误的files路径，已清理:', cleanUrl);
      }
      
      // 清理错误的资源路径
      if (cleanUrl.includes('/resources/uploads/')) {
        cleanUrl = cleanUrl.replace('/resources/uploads/', '/uploads/');
        console.log('检测到错误的resources路径，已清理:', cleanUrl);
      }
      
      // 确保URL以/开头
      if (!cleanUrl.startsWith('/')) {
        cleanUrl = '/' + cleanUrl;
      }
      
      const fullUrl = `http://localhost:8086/travelManagementSystem${cleanUrl}`;
      console.log('最终头像URL:', fullUrl);
      
      return fullUrl;
    },
    
    // 验证头像URL是否有效
    isValidAvatarUrl(url) {
      if (!url) return false;
      if (url.startsWith('blob:')) return false; // 过滤blob URL
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
    },
    
    // 处理头像URL，确保URL格式正确
    getAvatarUrl(avatarUrl) {
      if (!avatarUrl) return '';
      
      console.log('处理头像URL:', avatarUrl);
      
      // 过滤掉blob URL
      if (avatarUrl.startsWith('blob:')) {
        console.log('检测到blob URL，忽略:', avatarUrl);
        return '';
      }
      
      // 如果已经是完整URL（http://或https://），直接返回
      if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        console.log('完整URL，直接使用:', avatarUrl);
        return avatarUrl;
      }
      
      // 如果是相对路径，添加基础URL
      if (avatarUrl.startsWith('/uploads/')) {
        // 检查是否有重复的/uploads路径
        let cleanUrl = avatarUrl;
        if (avatarUrl.startsWith('/uploads/uploads/')) {
          cleanUrl = avatarUrl.replace('/uploads/uploads/', '/uploads/');
          console.log('修复重复路径:', avatarUrl, '->', cleanUrl);
        }
        
        const baseUrl = 'http://localhost:8086/travelManagementSystem';
        const fullUrl = baseUrl + cleanUrl;
        console.log('相对路径，添加基础URL:', fullUrl);
        return fullUrl;
      }
      
      // 如果路径不完整，尝试构建完整URL
      const baseUrl = 'http://localhost:8086/travelManagementSystem';
      const fullUrl = baseUrl + (avatarUrl.startsWith('/') ? '' : '/') + avatarUrl;
      console.log('构建完整URL:', fullUrl);
      return fullUrl;
    },
    
    // 头像加载成功
    handleAvatarLoad(event) {
      console.log('头像加载成功:', event.target.src);
    },
    
    // 头像加载失败
    async handleAvatarError(event) {
      console.error('头像加载失败:', event.target.src);
      console.log('当前头像URL:', this.userInfo.avatar);
      
      // 尝试使用备用加载方案
      if (this.userInfo.avatar) {
        console.log('开始尝试备用头像加载方案...');
        const workingUrl = await this.loadAvatarWithFallback(this.userInfo.avatar);
        
        if (workingUrl) {
          console.log('备用方案成功，更新头像URL:', workingUrl);
          this.userInfo.avatar = workingUrl;
          this.userProfile.avatar = workingUrl;
          
          // 强制重新渲染
          this.$nextTick(() => {
            const img = event.target;
            img.src = this.getFullAvatarUrl(workingUrl);
          });
          return;
        }
      }
      
      // 如果备用方案也失败，尝试多种路径
      if (this.userInfo.avatar) {
        console.log('备用方案失败，尝试多种路径...');
        const workingPath = await this.tryMultipleAvatarPaths(this.userInfo.avatar);
        
        if (workingPath) {
          console.log('找到可用的头像路径:', workingPath);
          this.userInfo.avatar = workingPath;
          this.userProfile.avatar = workingPath;
          
          // 强制重新渲染
          this.$nextTick(() => {
            const img = event.target;
            img.src = this.getFullAvatarUrl(workingPath);
          });
          return;
        }
      }
      
      // 如果所有方案都失败，尝试重新获取头像信息
      console.log('所有方案都失败，尝试重新获取头像信息');
      try {
        const avatarUrl = await this.loadUserAvatar();
        if (avatarUrl) {
          console.log('重新获取到头像信息:', avatarUrl);
          // 使用备用方案加载
          const workingUrl = await this.loadAvatarWithFallback(avatarUrl);
          if (workingUrl) {
            this.userInfo.avatar = workingUrl;
            this.userProfile.avatar = workingUrl;
          } else {
            console.log('重新获取的头像信息也无法访问，清空头像');
            this.userInfo.avatar = '';
            this.userProfile.avatar = '';
          }
        } else {
          console.log('无法获取头像信息，清空头像');
          this.userInfo.avatar = '';
          this.userProfile.avatar = '';
        }
      } catch (error) {
        console.error('重新获取头像信息失败:', error);
        this.userInfo.avatar = '';
        this.userProfile.avatar = '';
      }
    },
    
    // 调试头像状态
    async debugAvatarStatus() {
      console.log('=== 头像调试信息 ===');
      console.log('当前用户ID:', this.currentUserId);
      console.log('userInfo.avatar:', this.userInfo.avatar);
      console.log('userProfile.avatar:', this.userProfile.avatar);
      console.log('localStorage userInfo:', JSON.parse(localStorage.getItem('userInfo') || '{}'));
      console.log('sessionStorage userInfo:', JSON.parse(sessionStorage.getItem('userInfo') || '{}'));
      
      // 检查URL类型
      if (this.userInfo.avatar) {
        console.log('头像URL类型检查:');
        console.log('- 是否为blob URL:', this.userInfo.avatar.startsWith('blob:'));
        console.log('- 是否为完整URL:', this.userInfo.avatar.startsWith('http'));
        console.log('- 是否为相对路径:', this.userInfo.avatar.startsWith('/'));
        console.log('- URL是否有效:', this.isValidAvatarUrl(this.userInfo.avatar));
        
        const testUrl = this.getFullAvatarUrl(this.userInfo.avatar);
        console.log('处理后的头像URL:', testUrl);
        
        // 详细诊断头像文件
        console.log('开始详细诊断头像文件...');
        const fileExists = await this.checkAvatarFileExists(testUrl);
        console.log('头像文件存在检查结果:', fileExists);
        
        if (!fileExists) {
          console.log('尝试多种路径来找到可用的头像...');
          const workingPath = await this.tryMultipleAvatarPaths(this.userInfo.avatar);
          if (workingPath) {
            console.log('找到可用的头像路径:', workingPath);
            this.userInfo.avatar = workingPath;
            this.userProfile.avatar = workingPath;
            console.log('已更新头像路径，请刷新页面查看效果');
          } else {
            console.log('所有路径都不可用，可能是服务器配置问题');
            console.log('建议检查：');
            console.log('1. 服务器静态资源配置');
            console.log('2. 文件是否真实存在于服务器');
            console.log('3. 文件权限是否正确');
            
            // 添加服务器端诊断
            await this.diagnoseServerAvatarIssue();
          }
        }
      } else {
        console.log('用户无头像');
        console.log('尝试重新获取头像信息...');
        try {
          const avatarUrl = await this.loadUserAvatar();
          if (avatarUrl) {
            console.log('重新获取到头像信息:', avatarUrl);
            this.userInfo.avatar = avatarUrl;
            this.userProfile.avatar = avatarUrl;
          }
        } catch (error) {
          console.error('重新获取头像信息失败:', error);
        }
      }
      console.log('=== 调试信息结束 ===');
    },
    
    // 诊断服务器端头像问题
    async diagnoseServerAvatarIssue() {
      console.log('=== 服务器端诊断 ===');
      
      try {
        // 尝试获取服务器端文件信息
        const response = await request.get(`http://localhost:8086/travelManagementSystem/travel-portal/user/${this.currentUserId}/avatar/info`);
        console.log('服务器端头像信息:', response.data);
      } catch (error) {
        console.log('无法获取服务器端头像信息:', error.message);
      }
      
      // 尝试直接访问服务器根路径
      try {
        const response = await fetch('http://localhost:8086/travelManagementSystem/');
        console.log('服务器根路径状态:', response.status);
      } catch (error) {
        console.log('服务器根路径访问失败:', error.message);
      }
      
      // 尝试访问uploads目录
      try {
        const response = await fetch('http://localhost:8086/travelManagementSystem/uploads/');
        console.log('uploads目录状态:', response.status);
      } catch (error) {
        console.log('uploads目录访问失败:', error.message);
      }
      
      console.log('=== 服务器端诊断结束 ===');
    },
    
    // 刷新头像
    async refreshAvatar() {
      console.log('开始刷新头像...');
      this.userInfo.avatar = '';
      this.userProfile.avatar = '';
      
      try {
        const avatarUrl = await this.loadUserAvatar();
        if (avatarUrl) {
          this.userInfo.avatar = avatarUrl;
          this.userProfile.avatar = avatarUrl;
          this.$message.success('头像刷新成功！');
          console.log('头像刷新成功，新头像URL:', avatarUrl);
        } else {
          this.$message.info('用户暂无头像');
        }
      } catch (error) {
        console.error('刷新头像失败:', error);
        this.$message.error('刷新头像失败');
      }
    },
    
    // 测试头像URL可访问性
    async testAvatarUrl(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log('头像URL可访问:', url);
          resolve(true);
        };
        img.onerror = () => {
          console.error('头像URL不可访问:', url);
          resolve(false);
        };
        img.src = url;
      });
    },
    
    // 检查头像文件是否存在
    async checkAvatarFileExists(avatarUrl) {
      try {
        console.log('检查头像文件是否存在:', avatarUrl);
        
        // 尝试直接访问文件，添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
        
        const response = await fetch(avatarUrl, { 
          method: 'HEAD',
          signal: controller.signal,
          mode: 'cors' // 明确指定CORS模式
        });
        
        clearTimeout(timeoutId);
        console.log('文件检查响应状态:', response.status);
        
        if (response.ok) {
          console.log('头像文件存在且可访问');
          return true;
        } else {
          console.log('头像文件不存在或不可访问，状态码:', response.status);
          return false;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('头像文件检查超时:', avatarUrl);
        } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
          console.log('CORS跨域问题:', avatarUrl);
        } else {
          console.error('检查头像文件时出错:', error);
        }
        return false;
      }
    },
    
    // 尝试多种头像URL路径
    async tryMultipleAvatarPaths(originalUrl) {
      // 首先清理双斜杠问题
      let cleanOriginalUrl = originalUrl.replace(/\/+/g, '/');
      console.log('清理双斜杠后的原始URL:', cleanOriginalUrl);
      
      // 生成所有可能的路径变体
      const possiblePaths = [
        cleanOriginalUrl, // 清理后的原始路径
        cleanOriginalUrl.replace('/uploads/uploads/', '/uploads/'), // 清理重复路径
        cleanOriginalUrl.replace('/files/uploads/', '/uploads/'), // 清理files路径
        cleanOriginalUrl.replace('/resources/uploads/', '/uploads/'), // 清理resources路径
        cleanOriginalUrl.replace('/static/uploads/', '/uploads/'), // 清理static路径
        // 尝试其他可能的路径映射
        cleanOriginalUrl.replace('/uploads/', '/static/'),
        cleanOriginalUrl.replace('/uploads/', '/resources/'),
        cleanOriginalUrl.replace('/uploads/', '/files/'),
      ];
      
      // 去重并再次清理双斜杠
      const uniquePaths = [...new Set(possiblePaths)].map(path => path.replace(/\/+/g, '/'));
      
      console.log('尝试多种头像路径:');
      for (const path of uniquePaths) {
        const fullUrl = this.getFullAvatarUrl(path);
        console.log('测试路径:', fullUrl);
        
        try {
          const exists = await this.checkAvatarFileExists(fullUrl);
          if (exists) {
            console.log('找到可用的头像路径:', fullUrl);
            return path;
          }
        } catch (error) {
          console.log('路径测试失败:', fullUrl, error.message);
        }
      }
      
      console.log('所有路径都不可用');
      return null;
    },
    
    // 处理CORS问题的备用头像加载方案
    async loadAvatarWithFallback(avatarUrl) {
      try {
        // 首先清理双斜杠问题
        const cleanUrl = avatarUrl.replace(/\/+/g, '/');
        console.log('清理双斜杠后的头像URL:', cleanUrl);
        
        // 首先尝试直接加载图片
        const img = new Image();
        return new Promise((resolve) => {
          img.onload = () => {
            console.log('头像直接加载成功:', cleanUrl);
            resolve(cleanUrl);
          };
          img.onerror = async () => {
            console.log('头像直接加载失败，尝试其他方案:', cleanUrl);
            
            // 尝试通过代理加载
            try {
              const proxyUrl = `/api/proxy/avatar?url=${encodeURIComponent(cleanUrl)}`;
              const proxyImg = new Image();
              proxyImg.onload = () => {
                console.log('通过代理加载头像成功:', proxyUrl);
                resolve(proxyUrl);
              };
              proxyImg.onerror = () => {
                console.log('代理加载也失败，使用默认头像');
                resolve(null);
              };
              proxyImg.src = proxyUrl;
            } catch (error) {
              console.log('代理加载出错，使用默认头像:', error);
              resolve(null);
            }
          };
          img.src = this.getFullAvatarUrl(cleanUrl);
        });
      } catch (error) {
        console.error('头像加载过程中出错:', error);
        return null;
      }
    },
    
    showChangePwdDialog() {
      this.changePwdDialogVisible = true;
      this.$refs.passwordForm && this.$refs.passwordForm.resetFields();
    },
    async submitPasswordForm() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid) return false;
        this.$message.info('后端暂未提供修改密码接口');
        this.changePwdDialogVisible = false;
      });
    },
    showBindPhoneDialog() {
      this.bindPhoneDialogVisible = true;
      this.$refs.phoneForm && this.$refs.phoneForm.resetFields();
    },
    submitPhoneForm() {
      this.$refs.phoneForm.validate((valid) => {
        if (!valid) return false;
        this.userProfile.phone = this.phoneForm.phone;
        this.$message.success(this.userProfile.phone ? '手机号码更换成功(模拟)' : '手机号码绑定成功(模拟)');
        this.bindPhoneDialogVisible = false;
      });
    },
    showBindEmailDialog() {
      this.bindEmailDialogVisible = true;
      this.$refs.emailForm && this.$refs.emailForm.resetFields();
    },
    submitEmailForm() {
      this.$refs.emailForm.validate((valid) => {
        if (!valid) return false;
        this.userProfile.email = this.emailForm.email;
        this.$message.success(this.userProfile.email ? '邮箱地址更换成功(模拟)' : '邮箱地址绑定成功(模拟)');
        this.bindEmailDialogVisible = false;
      });
    },
    sendCode(type) {
      if (type === 'phone' && !this.phoneForm.phone) {
        this.$message.error('请输入手机号码');
        return;
      }
      if (type === 'email' && !this.emailForm.email) {
        this.$message.error('请输入邮箱地址');
        return;
      }
      this.codeSending[type] = true;
      this.$message.success('验证码发送成功(模拟)');
      const timer = setInterval(() => {
        this.countdown[type]--;
        if (this.countdown[type] <= 0) {
          clearInterval(timer);
          this.codeSending[type] = false;
          this.countdown[type] = 60;
        }
      }, 1000);
    },
    handleTwoFactorChange(checked) {
      if (checked) {
        this.$confirm('开启二次验证后，登录时需要输入验证码，是否继续？', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        }).then(() => {
          this.twoFactorEnabled = true;
          this.$message.success('二次验证已开启(前端模拟)');
        }).catch(() => {
          this.twoFactorEnabled = false;
        });
      } else {
        this.$message.success('二次验证已关闭(前端模拟)');
      }
    },
    saveNotificationSettings() {
      this.$message.success('通知设置保存成功(前端模拟)');
    },
    formatTime(time) {
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
      return `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')}`;
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
      this.$message.success('全部通知已标为已读');
    },
    showContactDialog() {
      this.contactDialogVisible = true;
      this.serviceMessage = '';
    },
    sendServiceMessage() {
      if (!this.serviceMessage.trim()) return;
      this.$message.success('消息发送成功，客服将尽快回复您');
      this.serviceMessage = '';
    },
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        this.$message.success('退出登录成功');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.personal-center {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px !important;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}

.nav-menu {
  flex: 1;
  margin: 0 20px;
}

/* 主要内容区样式 */
.main-container {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
}

/* 用户信息卡片 */
.user-info-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  height: fit-content;
}

.avatar-container {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.default-avatar {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 2px dashed #d9d9d9;
  color: #999;
  font-size: 48px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0 5px;
}

.user-id {
  color: #8c939d;
  font-size: 14px;
  margin-bottom: 10px;
}

.user-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-online {
  background-color: #e6f7ee;
  color: #52c41a;
}

.status-offline {
  background-color: #f5f5f5;
  color: #8c939d;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}

.stat-label {
  font-size: 14px;
  color: #8c939d;
  margin-top: 5px;
}

.membership-info {
  margin-top: 20px;
}

.membership-title { display: none; }

.membership-level { display: none; }

.level-badge {
  margin-bottom: 10px;
}

.membership-progress {
  display: none;
}

.progress-text { display: none; }

/* 会员提示文案样式 */
.membership-note {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  background-color: #f7f9fc;
  border: 1px solid #eef2f6;
  border-radius: 4px;
  padding: 10px 12px;
}

/* 内容区域样式 */
.content-area {
  padding: 0 20px !important;
}

.content-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-btn {
  margin-top: -5px;
}

/* 深色个人资料样式 */
.profile-card {
  /* 视觉：浅色背景下使用深色文字提高可读性 */
  color: #303133;
}

.profile-card .el-card__header { border-bottom: 1px solid #f0f0f0; }

.profile-info {
  padding: 20px;
}

.info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }

.info-row:last-child {
  border-bottom: none;
}

.info-label { width: 120px; color: #909399; font-weight: 500; }

.info-value { flex: 1; line-height: 1.8; color: #1f2d3d; }

.bio-row {
  align-items: flex-start;
  padding-top: 12px;
  padding-bottom: 0;
}

.bio-value {
  padding-bottom: 12px;
  white-space: pre-line;
}

/* 编辑资料表单样式 */
.edit-profile-form {
  margin-top: 6px;
}

/* 编辑资料弹窗收敛样式 */
.edit-profile-dialog {
  border-radius: 6px;
}
.edit-profile-dialog .el-dialog__body {
  padding: 16px 20px;
}
.edit-profile-dialog .el-dialog__header {
  padding: 14px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}
.edit-profile-dialog .el-dialog__footer {
  padding: 10px 20px 16px;
  border-top: 1px solid #f0f0f0;
}

/* 禁止个人简介缩放 */
.no-resize .el-textarea__inner {
  resize: none !important;
}

/* 性别按钮组美化 */
.gender-group { display: inline-flex; gap: 8px; }
.gender-group .el-radio-button__inner { border: 1px solid #dcdfe6; padding: 6px 14px; }
.gender-group .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: #3a7afe;
  border-color: #3a7afe;
  color: #fff;
  box-shadow: none;
}
.gender-group .el-radio-button__inner { border-radius: 16px; }

/* 安全设置样式 */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.security-label {
  display: flex;
  align-items: center;
}

.security-label i {
  font-size: 18px;
  margin-right: 10px;
  color: #1890ff;
}

.security-status {
  display: flex;
  align-items: center;
}

.status-text {
  margin-right: 10px;
  color: #8c939d;
}

/* 通知管理样式 */
.notification-form {
  margin-bottom: 20px;
}

.notification-form .el-form-item {
  margin-bottom: 15px;
}

.notification-history {
  margin-top: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.notification-item {
  margin-bottom: 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread .notification-title {
  font-weight: bold;
}

.notification-icon {
  font-size: 20px;
  color: #1890ff;
}

.notification-desc {
  color: #8c939d;
  margin-top: 5px;
  font-size: 14px;
}

.notification-time {
  color: #8c939d;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 帮助中心样式 */
.help-content {
  padding: 10px 0;
  color: #666;
}

.contact-support {
  margin-top: 20px;
}

/* 客服对话框样式 */
.customer-service {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.service-message {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.service-avatar {
  display: inline-block;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  text-align: center;
  line-height: 36px;
  margin-right: 10px;
}

.service-text {
  display: inline-block;
  background-color: #f0f2f5;
  padding: 8px 12px;
  border-radius: 4px;
  max-width: 70%;
}

.message-input {
  padding: 10px 0;
}

.send-btn {
  margin-top: 10px;
  float: right;
}

/* 底部样式 */
.footer {
  background-color: #fff;
    text-align: center;
  padding: 20px 0 !important;
  border-top: 1px solid #f0f0f0;
}

.footer-content {
  color: #8c939d;
  font-size: 14px;
}

.footer-links {
  margin-top: 10px;
}

.footer-link {
  color: #8c939d;
  margin: 0 10px;
  text-decoration: none;
}

.footer-link:hover {
  color: #1890ff;
}
</style>
