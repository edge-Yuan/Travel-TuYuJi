<template>
  <div>
    <el-container>
      <el-header class="fixed-header">
        <TravellersMainHeader></TravellersMainHeader>
      </el-header>
      <el-container>
        <el-aside width="200px" class="fixed-sidebar">
          <TravellersMainSidebar></TravellersMainSidebar>
        </el-aside>
        <el-main class="content-offset scrollable-main">
          <AdminWelcomeTravellers></AdminWelcomeTravellers>
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
  /* 与header高度一致 */
  left: 0;
  bottom: 0;
  z-index: 90;
}

.content-offset {
  margin-left: 200px;
  /* 与aside宽度一致 */
  margin-top: 60px;
  /* 与header高度一致 */
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
  /* 让 el-main 本身可以滚动 */
  height: calc(100vh - 60px);
  /* 根据 header 高度调整，保证撑满屏幕 */
}
</style>
<script>
import TravellersMainHeader from '@/components/common/travellersMainHeader.vue'
import TravellersMainSidebar from '@/components/common/travellersMainSidebar.vue'
import AdminWelcomeTravellers from '@/components/common/AdminWelcomeTravellers.vue'
export default {
  name: 'travellersHome',
  components: {
    TravellersMainHeader,
    TravellersMainSidebar,
    AdminWelcomeTravellers
  },
  props: {
    msg: String
  }
}
</script>
