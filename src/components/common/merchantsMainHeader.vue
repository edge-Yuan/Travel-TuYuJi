<template>
    <div class="container">
        <div class="l-container">
            <img src="../../assets/logo/newlogo.png" alt="logo" class="logo-img">
            <span class="title">途遇纪旅游管理系统</span>
             <span class="title-small">旅行商端</span>
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
    name: 'merchantsMainHeader',
}
</script>

<style scoped>
.title {
    text-align: left;
}

.title-small {
    font-size: 20px !important;
    font-weight: 400;
    font-family: "STXingKai", "KaiTi", sans-serif;
    color: #748485;
    line-height: 1.4;
}

.container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: white;
    height: 60px;
    align-items: center; 
}

.container .l-container {
    display: flex;
    align-items: center;
}

.container .l-container .logo-img {
    width: 55px;
    height: 55px;
    object-fit: cover;
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
    justify-content: center;
}

.container .r-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 60px;
    padding-right: 16px;
}

::v-deep .el-dropdown-menu {
    left: 50% !important;
    transform: translateX(-50%) !important;
    right: auto !important;
}

::v-deep .el-dropdown-menu__wrap {
    margin-top: 10px !important;
}
</style>
