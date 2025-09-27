<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">提交资质证明</h2>
      <button class="btn btn-secondary" @click="$router.push('/qualification')">
        <i class="fa fa-arrow-left mr-1"></i> 返回
      </button>
    </div>
    
    <div class="space-y-6">
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer" @click="triggerUpload">
        <i class="fa fa-cloud-upload text-4xl text-gray-400 mb-3"></i>
        <p class="text-gray-500">点击上传资质证明图片</p>
        <p class="text-sm text-gray-400 mt-1">支持 JPG, PNG 格式，最大 5MB</p>
        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange">
      </div>
      
      <div v-if="previewUrl" class="mt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">预览：</h3>
        <img :src="previewUrl" alt="资质证明预览" class="max-w-full max-h-64 rounded-md shadow-sm">
        <div class="mt-3 flex gap-3">
          <button class="btn btn-primary" @click="uploadFile">确认上传</button>
          <button class="btn btn-secondary" @click="clearPreview">取消</button>
        </div>
      </div>
      
      <div class="mt-6">
        <h3 class="text-sm font-medium text-gray-700 mb-3">已上传的资质证明</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="relative group">
            <img src="https://picsum.photos/id/20/300/200" alt="导游证" class="w-full h-48 object-cover rounded-md shadow-sm">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button class="text-white bg-danger/80 p-2 rounded-full hover:bg-danger transition-colors" @click="deleteFile(1)">
                <i class="fa fa-trash-o"></i>
              </button>
            </div>
            <p class="text-sm text-gray-600 mt-1">导游证 (2023-05-12)</p>
          </div>
          <div class="relative group">
            <img src="https://picsum.photos/id/26/300/200" alt="健康证明" class="w-full h-48 object-cover rounded-md shadow-sm">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button class="text-white bg-danger/80 p-2 rounded-full hover:bg-danger transition-colors" @click="deleteFile(2)">
                <i class="fa fa-trash-o"></i>
              </button>
            </div>
            <p class="text-sm text-gray-600 mt-1">健康证明 (2023-04-01)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getCurrentInstance } from 'vue'

// 获取全局实例
const { proxy } = getCurrentInstance()

// 数据
const fileInput = ref(null)
const previewUrl = ref(null)
const selectedFile = ref(null)

// 方法
const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const clearPreview = () => {
  previewUrl.value = null
  selectedFile.value = null
  fileInput.value.value = ''
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    // 调用API上传文件
    // const response = await proxy.$axios.post('/qualifications/upload', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // })
    
    // 模拟上传成功
    alert('上传成功')
    clearPreview()
    // 可以在这里刷新文件列表
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败: ' + error.message)
  }
}

const deleteFile = async (id) => {
  if (confirm('确定要删除该文件吗？')) {
    try {
      // 调用API删除文件
      // await proxy.$axios.delete(`/qualifications/${id}`)
      
      // 模拟删除成功
      alert('删除成功')
      // 可以在这里刷新文件列表
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败: ' + error.message)
    }
  }
}
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-5 transition-all duration-300 hover:shadow-md;
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

.btn-danger {
  @apply bg-danger text-white hover:bg-danger/90;
}
</style>
