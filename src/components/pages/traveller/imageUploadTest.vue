<template>
  <div class="image-upload-test">
    <h3>图片上传测试</h3>
    
    <el-upload
      :file-list="fileList"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :auto-upload="false"
      list-type="picture-card"
      :limit="6"
      accept="image/*"
      @change="handleFileChange"
    >
      <i class="el-icon-plus"></i>
      <div slot="tip" class="el-upload__tip">
        最多上传6张图片，支持jpg、png格式，单张图片不超过5MB
      </div>
    </el-upload>
    
    <div v-if="base64Images.length > 0" class="base64-display">
      <h4>Base64 图片数据：</h4>
      <div v-for="(img, index) in base64Images" :key="index" class="image-item">
        <img :src="img" alt="测试图片" style="width: 100px; height: 100px; object-fit: cover; margin: 5px;" />
        <p>图片 {{ index + 1 }}</p>
      </div>
    </div>
    
    <div class="debug-info">
      <h4>调试信息：</h4>
      <pre>{{ JSON.stringify({ fileList, base64Images }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUploadTest',
  data() {
    return {
      fileList: [],
      base64Images: []
    }
  },
  methods: {
    // 文件变化处理
    handleFileChange(file, fileList) {
      console.log('文件变化:', file, fileList)
      this.fileList = fileList
      
      // 直接使用base64方案
      if (file.raw && file.status !== 'fail') {
        this.convertToBase64(file.raw)
      }
    },
    
    // 将图片转换为base64
    convertToBase64(file) {
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        this.base64Images.push(base64)
        this.$message.success('图片已保存（base64格式）')
      }
      reader.onerror = () => {
        this.$message.error('图片处理失败，请重试')
      }
      reader.readAsDataURL(file)
    },
    
    // 文件移除
    handleRemove(file) {
      console.log('移除文件:', file)
      const index = this.fileList.indexOf(file)
      if (index > -1) {
        this.fileList.splice(index, 1)
        this.base64Images.splice(index, 1)
      }
    },
    
    // 上传前检查
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
.image-upload-test {
  padding: 20px;
}

.base64-display {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.image-item {
  display: inline-block;
  margin: 10px;
  text-align: center;
}

.debug-info {
  margin-top: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.debug-info pre {
  max-height: 300px;
  overflow-y: auto;
  font-size: 12px;
}
</style>
