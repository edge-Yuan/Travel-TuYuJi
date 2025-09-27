<template>
    <div>
        <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
        </el-radio-group> -->
        <el-menu default-active="1-4-1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
            :collapse="isCollapse" background-color="FFFFFF" text-color="1F1F1F" active-text-color=none>
            <el-menu-item v-for="(item, index) in menuData" :index="index.toString()" :key="index"
                @click="clickMenu(item)">
                <template slot="title">
                    <i :class="item.icon"></i>
                    <span slot="title">{{ item.label }}</span>
                </template>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
export default {
    name: 'managersMainSidebar',
    data() {
        return {
            isCollapse: false,
            menuData: [
                {
                    path: '/managers/productaudit',
                    name: '产品审核',
                    label: '产品审核',
                    icon: 'el-icon-notebook-2',
                    url: 'managers/productaudit'
                },
                {
                    path: '/managers/contentSupervision',
                    name: '内容监管',
                    label: '内容监管',
                    icon: 'el-icon-shopping-bag-2',
                    url: 'managers/contentSupervision'
                }, {
                    path: '/managers/rolemanagement',
                    name: '用戶角色管理',
                    label: '用戶角色管理',
                    icon: 'el-icon-position',
                    url: 'managers/rolemanagement'
                }, {
                    path: '/managers/guideQualification',
                    name: '导游相关',
                    label: '导游相关',
                    icon: 'el-icon-odometer',
                    url: 'managers/guideQualification'
                },
                {
                    path: '/managers/orderManagement',
                    name: '订单与退款管理',
                    label: '订单与退款管理',
                    icon: 'el-icon-map-location',
                    url: 'managers/orderManagement'
                },
                {
                    path: '/managers/financeMinimal',
                    name: '财务管理',
                    label: '财务管理',
                    icon: 'el-icon-tickets',
                    url: 'managers/financeMinimal'
                },
                {
                    path: '/managers/systemMaintenance',
                    name: '系统运维',
                    label: '系统运维',
                    icon: 'el-icon-collection-tag',
                    url: 'managers/systemMaintenance'
                },
                {
                    path: '/managers/adminManagement',
                    name: '个人中心',
                    label: '个人中心',
                    icon: 'el-icon-s-custom',
                    url: '/managers/adminManagement'
                },
            ]
        };
    },
    methods: {
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        clickMenu(item) {
            // 只有当目标路径与当前路径不同时，才执行跳转
            if (this.$route.path !== item.path) {
                this.$router.push(item.path);
            }
        }
    }
}
</script>

<style>
/* 移除 min-height 限制，或让它服从于等于 100vh */
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
    /* 确保最小高度为全屏，替代 400px */
    height: 100vh;
    /* 强制高度为全屏 */
    margin: 0;
    /* 清除默认外边距 */
    padding: 0;
    /* 清除除内边距干扰 */
    box-sizing: border-box;
    /* 确保 padding 不影响总高度 */
}

/* 同时给父容器设置高度（如果需要） */
.el-aside {
    height: 100vh !important;
    /* 如果菜单在 el-aside 中 */
}

.el-submenu__icon-arrow {
    display: none !important;
}

.el-menu h3 {
    text-align: center;
    font-size: 20px;
    margin-top: 20px;
    color: white;
}

/* 针对内联样式的强制覆盖 */
.el-menu-item:hover {
    background-color: transparent !important;
    /* 完全透明，继承父级白色背景 */
    /* 或直接指定为白色，与菜单背景一致 */
    /* background-color: #FFF !important; */
}

/* 确保激活状态也不受影响 */
.el-menu-item.is-active {
    background-color: transparent !important;
}
</style>