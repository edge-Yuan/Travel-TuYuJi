<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">编辑个人主页</h2>
      <button class="btn btn-secondary" @click="$router.push('/qualification')">
        <i class="fa fa-arrow-left mr-1"></i> 返回
      </button>
    </div>
    
    <form @submit.prevent="saveProfile">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">导游姓名</label>
          <input type="text" v-model="profile.name" class="form-input">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">导游编号</label>
          <input type="text" v-model="profile.id" class="form-input" readonly>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">性别</label>
          <div class="flex items-center gap-4 mt-1">
            <label class="inline-flex items-center">
              <input type="radio" v-model="profile.gender" value="男" class="mr-2">
              <span>男</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="profile.gender" value="女" class="mr-2">
              <span>女</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">资质证明状态</label>
          <select v-model="profile.qualificationStatus" class="form-input">
            <option value="充足">充足</option>
            <option value="不足">不足</option>
            <option value="审核中">审核中</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
          <textarea v-model="profile.bio" rows="5" class="form-input"></textarea>
          <p class="text-xs text-gray-500 mt-1">简介长度建议不超过500字</p>
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="btn btn-secondary" @click="resetForm">取消</button>
        <button type="submit" class="btn btn-primary">保存修改</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'

// 获取全局实例
const { proxy } = getCurrentInstance()

// 数据
const profile = ref({
  id: '',
  name: '',
  gender: '男',
  bio: '',
  qualificationStatus: '充足'
})

const originalProfile = ref({})

// 生命周期钩子
onMounted(async () => {
  try {
    // 调用API获取个人资料
    // const response = await proxy.$axios.get('/profile')
    // profile.value = response.data
    
    // 模拟数据
    profile.value = {
      id: 'GD202300158',
      name: '张导游',
      gender: '男',
      bio: '从事导游工作8年，熟悉国内各大旅游景点，尤其擅长历史文化讲解。服务热情周到，获得游客一致好评。可提供多语言服务，包括英语、日语等。',
      qualificationStatus: '充足'
    }
    
    // 保存原始数据用于重置
    originalProfile.value = JSON.parse(JSON.stringify(profile.value))
  } catch (error) {
    console.error('加载个人资料失败:', error)
    alert('加载个人资料失败: ' + error.message)
  }
})

// 方法
const saveProfile = async () => {
  try {
    // 调用API保存个人资料
    // await proxy.$axios.put('/profile', profile.value)
    
    // 模拟保存成功
    alert('保存成功')
    originalProfile.value = JSON.parse(JSON.stringify(profile.value))
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + error.message)
  }
}

const resetForm = () => {
  profile.value = JSON.parse(JSON.stringify(originalProfile.value))
}
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-5 transition-all duration-300 hover:shadow-md;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary;
}

.btn {
  @apply px-4 py-2 rounded-md transition-all duration-200 font-medium;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}
</style>
