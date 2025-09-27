<template>
    <div class="container">
        <div class="l-container">
            <i class="el-icon-place"></i>
            <span class="title">途遇纪旅游管理系统</span>
            <span class="title-small">导游端</span>
            
        </div>
        <div class="r-container">
            <el-dropdown>
                <span class="el-dropdown-link">
                    <img src="../../assets/logo/logo1.jpg" class="avatar" />
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>个人信息</el-dropdown-item>
                    <el-dropdown-item>退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>

</template>

<script>
export default {
    name: 'guidesMainHeader',
}
</script>

<style scoped>
.title {
    text-align: left;
}

.title-small {
    font-size: 20px !important;
    font-weight: 400;
    font-family: "STXingKai", "KaiTi", sans-serif; /* 英文字体 */
    color: #748485;
    line-height: 1.4;
}

.container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: white;
}

.container .l-container {
    display: flex;
    align-items: center;
}

.container .l-container i {
    font-size: 50px;
}

.container .l-container span {
    font-size: 20px;
    margin-left: 10px;
}

.container .r-container .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.container .r-container .el-dropdown-link {
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
}

.container .r-container {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: flex-end; /* 水平方向靠右（同时保证头像在容器内居中） */
  /* 可选：设置容器高度，确保垂直居中生效（根据整体布局调整） */
  height: 60px; /* 例如与左侧标题栏高度一致 */
  padding-right: 20px; /* 靠右留出一点边距，避免贴边 */
}


/* 关键：调整下拉菜单的偏移量，使其与头像垂直居中 */
::v-deep .el-dropdown-menu {
  /* 向左偏移 50%，配合 transform 实现水平居中 */
  left: 50% !important;
  transform: translateX(-50%) !important;
  /* 取消默认的 left: 0 定位 */
  right: auto !important;
}

/* 可选：调整下拉菜单与头像的距离 */
::v-deep .el-dropdown-menu__wrap {
  margin-top: 10px !important; /* 增加一点顶部间距 */
}
</style>