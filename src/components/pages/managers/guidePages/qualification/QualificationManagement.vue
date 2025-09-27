<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">资质与主页管理</h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card hover:shadow-md cursor-pointer" @click="$router.push('/qualification/submit')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="fa fa-upload text-xl"></i>
          </div>
          <div>
            <h3 class="font-medium text-gray-800">提交材料</h3>
            <p class="text-sm text-gray-500">上传导游资质证明文件</p>
          </div>
        </div>
      </div>
      
      <div class="card hover:shadow-md cursor-pointer" @click="$router.push('/qualification/edit')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <i class="fa fa-user-o text-xl"></i>
          </div>
          <div>
            <h3 class="font-medium text-gray-800">编辑个人主页</h3>
            <p class="text-sm text-gray-500">管理个人信息和资料</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 card">
      <h3 class="font-medium text-gray-800 mb-4">资质状态</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border border-gray-100 rounded-lg bg-green-50">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500">导游证</p>
              <p class="font-medium text-success mt-1">已认证</p>
            </div>
            <i class="fa fa-check-circle text-success text-xl"></i>
          </div>
          <p class="text-xs text-gray-400 mt-2">有效期至：2025-12-31</p>
        </div>
        
        <div class="p-4 border border-gray-100 rounded-lg bg-green-50">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500">健康证明</p>
              <p class="font-medium text-success mt-1">已认证</p>
            </div>
            <i class="fa fa-check-circle text-success text-xl"></i>
          </div>
          <p class="text-xs text-gray-400 mt-2">有效期至：2024-03-15</p>
        </div>
        
        <div class="p-4 border border-gray-100 rounded-lg bg-yellow-50">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500">语言证书</p>
              <p class="font-medium text-warning mt-1">待更新</p>
            </div>
            <i class="fa fa-exclamation-circle text-warning text-xl"></i>
          </div>
          <p class="text-xs text-gray-400 mt-2">已过期：2023-01-20</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 可以在这里添加组件逻辑
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-5 transition-all duration-300 hover:shadow-md;
}
</style>
