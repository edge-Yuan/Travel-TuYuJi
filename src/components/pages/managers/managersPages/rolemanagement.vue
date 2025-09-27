<template>
  <div class="role-management-page">
    <!-- 顶部筛选与操作区（与原有产品审核页风格统一） -->
    <div class="top-bar">
      <div class="filter-section">
        <el-input
          v-model="searchKey"
          placeholder="搜索用户名/ID"
          clearable
          style="width: 240px; margin-right: 20px;"
          @keyup.enter="fetchUsers"
        ></el-input>
        <el-button type="primary" @click="fetchUsers">查询</el-button>
        <el-button type="primary" @click="openAddUserDialog" style="margin-left: 16px;">新增用户</el-button>
      </div>

      <!-- 角色统计（新增，与产品审核页状态统计逻辑一致） -->
      <div class="status-count">
        <div class="count-item">
          <span class="count admin-count">{{ adminCount }}</span>
          <span class="label">管理员</span>
        </div>
        <div class="count-item">
          <span class="count user-count">{{ userCount }}</span>
          <span class="label">普通用户</span>
        </div>
        <div class="count-item">
          <span class="count disabled-count">{{ disabledCount }}</span>
          <span class="label">已禁用</span>
        </div>
      </div>
    </div>

    <!-- 用户表格（优化样式，与原有卡片风格统一） -->
    <el-table
      :data="userList"
      border
      style="width: 100%; margin-top: 20px;"
      @selection-change="handleSelectionChange"
      :cell-style="{ 'font-size': '14px' }"
      :header-cell-style="{ 'font-size': '14px', 'font-weight': 600 }"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="用户ID" ></el-table-column>
      <el-table-column prop="username" label="用户名" width="150"></el-table-column>
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'primary' : 'info'">
            {{ scope.row.role === 'admin' ? '管理员' : scope.row.role === 'user' ? '普通用户' : '游客' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
            {{ scope.row.status === 'normal' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" min-width="200">
        <template #default="scope">
          <!-- 分配权限按钮（仅管理员可见，符合权限控制逻辑） -->
          <el-button 
            type="text" 
            @click="openAssignPermissionDialog(scope.row)"
            :disabled="!isAdmin"
            :style="{ color: !isAdmin ? '#ccc' : '' }"
          >
            分配权限
          </el-button>
          
          <!-- 禁用/启用按钮（状态区分样式） -->
          <el-button
            type="text"
            :style="{ color: scope.row.status === 'normal' ? '#dd1e21' : '#8caf7a' }"
            @click="toggleUserStatus(scope.row)"
          >
            {{ scope.row.status === 'normal' ? '禁用账号' : '启用账号' }}
          </el-button>
          
          <!-- 编辑用户按钮（新增，补充完整功能） -->
          <el-button
            type="text"
            style="color: #1890ff;"
            @click="openAddUserDialog(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（与原有产品审核页分页风格统一） -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 24px; text-align: right; font-size: 14px;"
    ></el-pagination>

    <!-- 分配权限弹窗（优化表单校验与样式） -->
    <el-dialog title="分配用户权限" :visible.sync="assignPermissionDialogVisible" width="500px">
      <el-form 
        :model="currentUser" 
        :rules="permissionRules" 
        ref="permissionForm" 
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" disabled style="background: #f5f5f5;"></el-input>
        </el-form-item>
        <el-form-item label="用户角色" prop="role">
          <el-select v-model="currentUser.role" placeholder="请选择角色" @change="handleRoleChange">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="游客" value="visitor"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限列表" prop="permissions">
          <el-checkbox-group v-model="currentUser.permissions" style="display: flex; flex-wrap: wrap; gap: 12px 24px;">
            <el-checkbox label="产品审核" name="permission"></el-checkbox>
            <el-checkbox label="购买下单" name="permission"></el-checkbox>
            <el-checkbox label="行程管理" name="permission"></el-checkbox>
            <el-checkbox label="导游相关" name="permission"></el-checkbox>
            <el-checkbox label="自主规划" name="permission"></el-checkbox>
            <el-checkbox label="订单管理" name="permission"></el-checkbox>
            <el-checkbox label="我的收藏" name="permission"></el-checkbox>
            <el-checkbox label="个人中心" name="permission"></el-checkbox>
          </el-checkbox-group>
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            提示：管理员默认拥有所有权限，角色变更会自动同步权限
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignPermissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermission">确定分配</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑用户弹窗（完善表单逻辑） -->
    <el-dialog title="新增/编辑用户" :visible.sync="addUserDialogVisible" width="450px">
      <el-form 
        :model="form" 
        :rules="userRules" 
        ref="userForm" 
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="用户ID" prop="id" v-if="form.id">
          <el-input v-model="form.id" disabled style="background: #f5f5f5;"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入6-20位密码"></el-input>
        </el-form-item>
        <el-form-item label="用户角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="游客" value="visitor"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserRoleManagement',
  data() {
    return {
      userList: [], // 用户列表数据
      searchKey: '', // 搜索关键字
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      multipleSelection: [], // 选中的用户
      assignPermissionDialogVisible: false, // 分配权限弹窗显示状态
      addUserDialogVisible: false, // 新增/编辑用户弹窗显示状态
      isAdmin: true, // 当前登录用户是否为管理员（实际项目需从登录态获取）
      
      // 当前操作的用户（分配权限用）
      currentUser: {
        id: '',
        username: '',
        role: '',
        permissions: []
      },
      
      // 新增/编辑用户表单
      form: {
        id: '',
        username: '',
        password: '',
        role: 'user',
        status: 'normal'
      },
      
      // 分配权限表单校验规则
      permissionRules: {
        role: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
        permissions: [{ required: true, message: '请至少选择一项权限', trigger: 'change' }]
      },
      
      // 新增/编辑用户表单校验规则
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度需在2-20个字符之间', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_-]{2,20}$/, message: '用户名仅支持字母、数字、下划线和短横线', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度需在6-20个字符之间', trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
        status: [{ required: true, message: '请选择账号状态', trigger: 'change' }]
      }
    };
  },
  computed: {
    // 角色统计（与产品审核页状态统计逻辑一致）
    adminCount() {
      return this.userList.filter(item => item.role === 'admin').length;
    },
    userCount() {
      return this.userList.filter(item => item.role === 'user' && item.status === 'normal').length;
    },
    disabledCount() {
      return this.userList.filter(item => item.status === 'disabled').length;
    }
  },
  mounted() {
    this.fetchUsers(); // 初始化加载用户列表
    // 实际项目中需从登录状态获取当前用户角色，判断是否为管理员
    // this.isAdmin = this.$store.state.user.role === 'admin';
  },
  methods: {
    // 获取用户列表
    async fetchUsers() {
      try {
        const response = await this.$http({
          url: '/travel-portal/admin/users/page',
          method: 'get',
          params: {
            page: this.currentPage,
            size: this.pageSize,
            keyword: this.searchKey
          }
        });
        
        if (response && response.data) {
          this.userList = response.data.records || [];
          this.total = response.data.total || 0;
        } else {
          this.userList = [];
          this.total = 0;
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败');
        // 使用模拟数据作为后备
        this.loadMockData();
      }
    },
    
    // 加载模拟数据（作为API失败时的后备）
    loadMockData() {
      let result = [];
      // 模拟生成用户数据
      for (let i = 0; i < this.pageSize; i++) {
        const id = (this.currentPage - 1) * this.pageSize + i + 1;
        // 模拟搜索过滤逻辑
        const username = `user${id}`;
        if (this.searchKey && !username.includes(this.searchKey) && !id.toString().includes(this.searchKey)) {
          return;
        }
        result.push({
          userId: id,
          username,
          realName: `用户${id}`,
          phone: `1380013800${id}`,
          email: `user${id}@example.com`,
          userRole: id % 3 === 0 ? 2 : id % 3 === 1 ? 1 : 1, // 2-管理员，1-游客
          status: id % 5 === 0 ? 0 : 1, // 0-禁用，1-正常
          createTime: `2024-09-${id < 10 ? '0' + id : id} 10:${id < 60 ? id : id % 60}:22`
        });
      }
      this.userList = result;
      this.total = 100; // 模拟总条数
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1; // 重置为第一页
      this.fetchUsers();
    },

    // 当前页码改变
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchUsers();
    },

    // 选中用户改变（批量操作预留）
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 打开分配权限弹窗
    openAssignPermissionDialog(user) {
      // 深拷贝用户数据，避免直接修改原数据
      this.currentUser = JSON.parse(JSON.stringify(user));
      this.assignPermissionDialogVisible = true;
    },

    // 角色变更时自动同步权限（管理员默认全选，游客默认仅个人中心）
    handleRoleChange(role) {
      if (role === 'admin') {
        this.currentUser.permissions = ['产品审核', '购买下单', '行程管理', '导游相关', '自主规划', '订单管理', '我的收藏', '个人中心'];
      } else if (role === 'visitor') {
        this.currentUser.permissions = ['个人中心'];
      } else {
        // 普通用户默认基础权限
        this.currentUser.permissions = ['购买下单', '行程管理', '自主规划', '我的收藏', '个人中心'];
      }
    },

    // 保存权限分配
    savePermission() {
      this.$refs.permissionForm.validate((isValid) => {
        if (isValid) {
          // 模拟接口请求（实际项目替换为真实接口）
          const index = this.userList.findIndex(item => item.id === this.currentUser.id);
          if (index !== -1) {
            this.userList[index].role = this.currentUser.role;
            this.userList[index].permissions = this.currentUser.permissions;
          }
          this.$message.success('权限分配成功！');
          this.assignPermissionDialogVisible = false;
          this.fetchUsers(); // 刷新列表
        }
      });
    },

    // 切换用户状态（禁用/启用账号）
    async toggleUserStatus(user) {
      const action = user.status === 1 ? '禁用' : '启用';
      this.$confirm(`确定要${action}"${user.username}"的账号吗？${action}后用户将无法登录系统`, '操作确认', {
        confirmButtonText: `确认${action}`,
        cancelButtonText: '取消',
        type: action === '禁用' ? 'danger' : 'success'
      }).then(async () => {
        try {
          const newStatus = user.status === 1 ? 0 : 1;
          const response = await this.$http({
            url: `/travel-portal/admin/users/${user.userId}/status`,
            method: 'put',
            params: { status: newStatus }
          });
          
          if (response && response.data) {
            user.status = newStatus;
            this.$message.success(`"${user.username}"账号${action}成功！`);
            this.fetchUsers(); // 刷新列表
          } else {
            this.$message.error(`${action}账号失败`);
          }
        } catch (error) {
          console.error(`${action}账号失败:`, error);
          this.$message.error(`${action}账号失败`);
        }
      }).catch(() => {
        this.$message.info(`已取消${action}操作`);
      });
    },

    // 打开新增/编辑用户弹窗
    openAddUserDialog(user = {}) {
            // 重置表单（区分新增/编辑：编辑时带用户数据，且用户名不可改）
      this.form = {
        id: user.id || '',
        username: user.username || '',
        password: '', // 新增需填密码，编辑不显示
        role: user.role || 'user',
        status: user.status || 'normal'
      };
      this.addUserDialogVisible = true;
    },

    // 提交新增/编辑用户表单
    submitForm() {
      this.$refs.userForm.validate((isValid) => {
        if (isValid) {
          // 模拟接口请求（实际项目替换为真实接口）
          if (this.form.id) {
            // 编辑用户：更新现有数据
            const index = this.userList.findIndex(item => item.id === this.form.id);
            if (index !== -1) {
              this.userList[index] = {
                ...this.userList[index],
                username: this.form.username,
                role: this.form.role,
                status: this.form.status
              };
            }
            this.$message.success(`“${this.form.username}”用户编辑成功！`);
          } else {
            // 新增用户：生成新ID并添加到列表
            const newId = Math.max(...this.userList.map(item => item.id), 0) + 1;
            const newUser = {
              id: newId,
              username: this.form.username,
              password: this.form.password, // 实际项目需加密存储
              role: this.form.role,
              status: this.form.status,
              createTime: new Date().toLocaleString('zh-CN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              }).replace(/\//g, '-'),
              permissions: this.form.role === 'admin' 
                ? ['产品审核', '购买下单', '行程管理', '导游相关', '自主规划', '订单管理', '我的收藏', '个人中心']
                : this.form.role === 'user'
                  ? ['购买下单', '行程管理', '自主规划', '我的收藏', '个人中心']
                  : ['个人中心']
            };
            this.userList.unshift(newUser); // 新增用户放列表顶部
            this.$message.success(`“${this.form.username}”用户新增成功！`);
          }
          this.addUserDialogVisible = false;
          this.fetchUsers(); // 刷新列表
        }
      });
    }
  }
};
</script>

<style scoped>
/* 整体容器样式（与产品审核页保持一致） */
.user-role-management-page {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 120px);
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 顶部筛选区样式统一 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 角色统计样式（与产品审核页状态统计一致） */
.status-count {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.count-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  font-size: 18px;
  font-weight: 600;
}

.admin-count { color: #1890ff; }
.user-count { color: #8caf7a; }
.disabled-count { color: #dd1e21; }

.label {
  font-size: 14px;
  color: #666;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.el-table th {
  background-color: #f5f7fa !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

.el-table tr:hover > td {
  background-color: #fafafa !important;
}

/* 弹窗按钮区样式统一 */
.dialog-footer {
  text-align: right;
  margin-top: 16px;
}

/* 适配小屏（与产品审核页响应式逻辑一致） */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .status-count {
    justify-content: space-around;
  }

  .el-table {
    font-size: 12px;
    
  }

  .el-table-column {
    width: auto !important;
  }

  .el-dialog {
    width: 90% !important;
    margin: 0 auto;
  }
}
</style>