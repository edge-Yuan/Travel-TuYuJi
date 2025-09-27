<template>
  <div>
    <el-container>
      <el-header class="fixed-header">
        <MerchantsMainHeader></MerchantsMainHeader>
      </el-header>
      <el-container>
        <el-aside width="200px" class="fixed-sidebar">
          <MerchantsMainSidebar></MerchantsMainSidebar>
        </el-aside>
        <el-main class="content-offset scrollable-main">
          <AdminWelcomeMerchants></AdminWelcomeMerchants>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.fixed-sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  z-index: 90;
}

.content-offset {
  margin-left: 200px;
  margin-top: 60px;
}

.el-header,
.el-footer {
  background-color: F8F8F8;
  color: #333;
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid rgba(150, 150, 150, 0.3)
}

body>.el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.scrollable-main {
  overflow-y: auto;
  height: calc(100vh - 60px);
}
</style>

<script>
import MerchantsMainHeader from '@/components/common/merchantsMainHeader.vue'
import MerchantsMainSidebar from '@/components/common/merchantsMainSidebar.vue'
import AdminWelcomeMerchants from '@/components/common/AdminWelcomeMerchants.vue'

export default {
  name: 'merchantsHome',
  components: {
    MerchantsMainHeader,
    MerchantsMainSidebar,
    AdminWelcomeMerchants
  },
  props: {
    msg: String
  }
}
</script>
