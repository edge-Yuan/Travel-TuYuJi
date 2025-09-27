<template>
    <div>
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
    name: 'merchantsMainSidebar',
    data() {
        return {
            isCollapse: false,
            menuData: [
                {
                    path: '/merchant/productManagement',
                    name: '产品管理',
                    label: '产品管理',
                    icon: 'el-icon-goods',
                    url: 'merchant/productManagement'
                },
                {
                    path: '/merchant/guideCooperation',
                    name: '导游合作',
                    label: '导游合作',
                    icon: 'el-icon-user',
                    url: 'merchant/guideCooperation'
                },
                {
                    path: '/merchant/articleManagement',
                    name: '文章运营',
                    label: '文章运营',
                    icon: 'el-icon-edit-outline',
                    url: 'merchant/articleManagement'
                },
                {
                    path: '/merchant/orderProcessing',
                    name: '订单处理',
                    label: '订单处理',
                    icon: 'el-icon-tickets',
                    url: 'merchant/orderProcessing'
                },
                {
                    path: '/merchant/serviceManagement',
                    name: '服务管理',
                    label: '服务管理',
                    icon: 'el-icon-service',
                    url: 'merchant/serviceManagement'
                },
                {
                    path: '/merchant/reviewResponse',
                    name: '评价回应',
                    label: '评价回应',
                    icon: 'el-icon-star-on',
                    url: 'merchant/reviewResponse'
                },
                {
                    path: '/merchant/dataCenter',
                    name: '数据中心',
                    label: '数据中心',
                    icon: 'el-icon-data-analysis',
                    url: 'merchant/dataCenter'
                },
                {
                    path: '/merchant/merchantInfo',
                    name: '个人中心',
                    label: '个人中心',
                    icon: 'el-icon-s-custom',
                    url: 'merchant/merchantInfo'
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
            if (this.$route.path !== item.path) {
                this.$router.push(item.path);
            }
        }
    }
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
    height: 100vh;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.el-aside {
    height: 100vh !important;
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

.el-menu-item:hover {
    background-color: transparent !important;
}

.el-menu-item.is-active {
    background-color: transparent !important;
}
</style>
