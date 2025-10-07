<template>
  <div class="upload-test-container">
    <h3>评价图片上传测试</h3>
    
    <el-card class="upload-card">
      <div slot="header">
        <span>文件上传测试</span>
      </div>
      
      <el-upload
        :action="uploadUrl"
        :method="'POST'"
        :headers="uploadHeaders"
        :data="uploadData"
        :file-list="fileList"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-remove="handleRemove"
        :before-upload="beforeUpload"
        list-type="picture-card"
        :limit="6"
        accept="image/*"
        multiple
      >
        <i class="el-icon-plus"></i>
        <div slot="tip" class="el-upload__tip">
          最多上传6张图片，支持jpg、png、gif格式，单张图片不超过5MB
        </div>
      </el-upload>
    </el-card>
    
    <el-card class="result-card" v-if="uploadedImages.length > 0">
      <div slot="header">
        <span>上传结果</span>
      </div>
      
      <div class="image-grid">
        <div v-for="(image, index) in uploadedImages" :key="index" class="image-item">
          <img :src="image.url" :alt="image.filename" />
          <div class="image-info">
            <p><strong>文件名:</strong> {{ image.filename }}</p>
            <p><strong>文件ID:</strong> {{ image.fileId }}</p>
            <p><strong>大小:</strong> {{ formatFileSize(image.size) }}</p>
            <p><strong>URL:</strong> {{ image.url }}</p>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card class="debug-card">
      <div slot="header">
        <span>调试信息</span>
      </div>
      
      <div class="debug-section">
        <h4>上传配置:</h4>
        <pre>{{ JSON.stringify({
          uploadUrl,
          uploadHeaders,
          uploadData
        }, null, 2) }}</pre>
      </div>
      
      <div class="debug-section">
        <h4>已上传图片:</h4>
        <pre>{{ JSON.stringify(uploadedImages, null, 2) }}</pre>
      </div>
      
      <div class="debug-section">
        <h4>图片URLs (用于评价提交):</h4>
        <p>{{ getImageUrls() }}</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'UploadTest',
  data() {
    return {
      // 上传配置
      uploadUrl: '/travel-portal/upload/file', // 使用代理路径
      uploadHeaders: {
        'Content-Type': 'multipart/form-data'
      },
      uploadData: {
        uploadType: 'evaluation',
        relatedId: 12345 // 测试订单ID
      },
      
      // 文件列表
      fileList: [],
      uploadedImages: []
    }
  },
  methods: {
    // 上传成功回调
    handleUploadSuccess(response) {
      console.log('文件上传成功:', response)
      
      if (response && response.code === 200) {
        const data = response.data
        this.uploadedImages.push({
          fileId: data.fileId,
          url: data.url,
          filename: data.filename,
          size: data.size
        })
        this.$message.success('图片上传成功!')
      } else {
        this.$message.error('图片上传失败: ' + (response?.message || '未知错误'))
      }
    },
    
    // 上传失败回调
    handleUploadError(error) {
      console.error('文件上传失败:', error)
      this.$message.error('图片上传失败，请重试')
    },
    
    // 文件移除
    handleRemove(file) {
      console.log('移除文件:', file)
      
      // 从已上传图片列表中移除
      const fileIndex = this.fileList.indexOf(file)
      if (fileIndex > -1) {
        this.uploadedImages.splice(fileIndex, 1)
      }
    },
    
    // 上传前检查
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      
      if (!allowedTypes.includes(file.type)) {
        this.$message.error('只支持jpg、png、gif格式的图片!')
        return false
      }
      
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      
      return true
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // 获取图片URLs
    getImageUrls() {
      return this.uploadedImages.map(img => img.url).join(',')
    }
  }
}
</script>

<style scoped>
.upload-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-card,
.result-card,
.debug-card {
  margin-bottom: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.image-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.image-info p {
  margin: 5px 0;
  font-size: 14px;
  word-break: break-all;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.debug-section pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

::v-deep .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}
</style>
