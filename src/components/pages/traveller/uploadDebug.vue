<template>
  <div class="upload-debug">
    <h3>上传功能调试</h3>
    
    <el-card>
      <div slot="header">
        <span>上传配置检查</span>
      </div>
      
      <div class="config-info">
        <p><strong>上传URL:</strong> {{ uploadUrl }}</p>
        <p><strong>代理配置:</strong> 检查vue.config.js中的代理设置</p>
        <p><strong>后端地址:</strong> http://localhost:8086</p>
        <p><strong>完整路径:</strong> http://localhost:8086/travelManagementSystem/travel-portal/upload/file</p>
      </div>
    </el-card>
    
    <el-card>
      <div slot="header">
        <span>测试上传</span>
      </div>
      
      <el-upload
        :action="uploadUrl"
        :method="'POST'"
        :headers="uploadHeaders"
        :data="uploadData"
        :file-list="fileList"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :auto-upload="false"
        list-type="picture-card"
        :limit="1"
        accept="image/*"
        @change="handleFileChange"
      >
        <i class="el-icon-plus"></i>
        <div slot="tip" class="el-upload__tip">
          测试图片上传功能
        </div>
      </el-upload>
    </el-card>
    
    <el-card v-if="uploadResult">
      <div slot="header">
        <span>上传结果</span>
      </div>
      
      <div class="result-info">
        <h4>成功信息:</h4>
        <pre>{{ JSON.stringify(uploadResult, null, 2) }}</pre>
      </div>
    </el-card>
    
    <el-card v-if="errorInfo">
      <div slot="header">
        <span>错误信息</span>
      </div>
      
      <div class="error-info">
        <h4>错误详情:</h4>
        <pre>{{ errorInfo }}</pre>
      </div>
    </el-card>
    
    <el-card>
      <div slot="header">
        <span>手动测试</span>
      </div>
      
      <el-button @click="testDirectUpload" type="primary">直接测试上传接口</el-button>
      <el-button @click="testBase64" type="success">测试Base64方案</el-button>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'UploadDebug',
  data() {
    return {
      uploadUrl: '/travel-portal/upload/file',
      uploadHeaders: {
        'Content-Type': 'multipart/form-data'
      },
      uploadData: {
        uploadType: 'evaluation',
        relatedId: 12345
      },
      fileList: [],
      uploadResult: null,
      errorInfo: null
    }
  },
  methods: {
    // 文件变化处理
    handleFileChange(file, fileList) {
      console.log('文件变化:', file, fileList)
      this.fileList = fileList
      
      if (file.status === 'ready') {
        this.testUpload(file)
      }
    },
    
    // 测试上传
    async testUpload(file) {
      try {
        const formData = new FormData()
        formData.append('file', file.raw)
        formData.append('uploadType', 'evaluation')
        formData.append('relatedId', '12345')
        
        console.log('开始上传测试...')
        console.log('FormData内容:', formData)
        
        const response = await request.post('/travel-portal/upload/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        console.log('上传响应:', response)
        this.uploadResult = response.data
        this.errorInfo = null
        this.$message.success('上传测试成功!')
      } catch (error) {
        console.error('上传测试失败:', error)
        this.errorInfo = error.message || error.toString()
        this.uploadResult = null
        this.$message.error('上传测试失败: ' + this.errorInfo)
      }
    },
    
    // 上传成功回调
    handleUploadSuccess(response) {
      console.log('上传成功:', response)
      this.uploadResult = response
      this.errorInfo = null
    },
    
    // 上传失败回调
    handleUploadError(error) {
      console.error('上传失败:', error)
      this.errorInfo = error.toString()
      this.uploadResult = null
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
    },
    
    // 直接测试上传接口
    async testDirectUpload() {
      try {
        console.log('测试直接上传接口...')
        
        // 创建一个测试文件
        const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        const formData = new FormData()
        formData.append('file', testFile)
        formData.append('uploadType', 'evaluation')
        formData.append('relatedId', '12345')
        
        const response = await fetch('/travel-portal/upload/file', {
          method: 'POST',
          body: formData
        })
        
        console.log('直接上传响应:', response)
        
        if (response.ok) {
          const data = await response.json()
          this.uploadResult = data
          this.$message.success('直接上传测试成功!')
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error('直接上传测试失败:', error)
        this.errorInfo = error.message
        this.$message.error('直接上传测试失败: ' + error.message)
      }
    },
    
    // 测试Base64方案
    testBase64() {
      try {
        console.log('测试Base64方案...')
        
        // 创建一个测试文件
        const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const base64 = e.target.result
          console.log('Base64结果:', base64.substring(0, 100) + '...')
          this.uploadResult = {
            method: 'base64',
            data: base64.substring(0, 100) + '...',
            success: true
          }
          this.$message.success('Base64方案测试成功!')
        }
        
        reader.onerror = () => {
          this.errorInfo = 'Base64转换失败'
          this.$message.error('Base64方案测试失败')
        }
        
        reader.readAsDataURL(testFile)
      } catch (error) {
        console.error('Base64测试失败:', error)
        this.errorInfo = error.message
        this.$message.error('Base64测试失败: ' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.upload-debug {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.config-info p {
  margin: 10px 0;
  font-family: monospace;
}

.result-info,
.error-info {
  margin-top: 15px;
}

.result-info pre,
.error-info pre {
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
