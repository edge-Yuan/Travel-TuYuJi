<template>
  <div class="submit-materials">
    <h2>提交资质证明材料</h2>
    <div class="upload-container">
      <div class="upload-area" @click="triggerFileInput" :class="{ dragging: isDragging }"
           @dragover.prevent @dragenter.prevent @dragleave="handleDragLeave" @drop.prevent="handleDrop">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>点击或拖拽文件到此处上传</p>
        <p class="hint">支持JPG、PNG、PDF格式，单个文件不超过10MB</p>
        <input type="file" ref="fileInput" class="file-input" @change="handleFileChange"
               accept=".jpg,.jpeg,.png,.pdf" multiple>
      </div>
      
      <div class="uploaded-files" v-if="uploadedFiles.length > 0">
        <h3>已上传文件</h3>
        <ul>
          <li v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <i class="fas" :class="getFileIcon(file.name)"></i>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <button class="delete-btn" @click="removeFile(index)">
              <i class="fas fa-trash"></i>
            </button>
          </li>
        </ul>
      </div>
      
      <button class="submit-btn" @click="submitFiles" :disabled="uploadedFiles.length === 0">
        提交材料
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubmitMaterials',
  data() {
    return {
      uploadedFiles: [],
      isDragging: false
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileChange(e) {
      const files = e.target.files
      if (files.length > 0) {
        this.addFiles(files)
        // 重置input，以便可以重复选择同一文件
        e.target.value = ''
      }
    },
    
    handleDragLeave(e) {
      this.isDragging = false
    },
    
    handleDrop(e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.addFiles(files)
      }
    },
    
    addFiles(files) {
      for (let i = 0; i < files.length; i++) {
        // 检查文件类型
        const fileExt = files[i].name.split('.').pop().toLowerCase()
        if (!['jpg', 'jpeg', 'png', 'pdf'].includes(fileExt)) {
          this.$message.error(`文件 ${files[i].name} 格式不支持，请上传JPG、PNG或PDF格式`)
          continue
        }
        
        // 检查文件大小
        if (files[i].size > 10 * 1024 * 1024) {
          this.$message.error(`文件 ${files[i].name} 过大，单个文件不能超过10MB`)
          continue
        }
        
        this.uploadedFiles.push(files[i])
      }
    },
    
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    getFileIcon(fileName) {
      const ext = fileName.split('.').pop().toLowerCase()
      switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'fa-file-image'
        case 'pdf':
          return 'fa-file-pdf'
        default:
          return 'fa-file'
      }
    },
    
    async submitFiles() {
      const formData = new FormData()
      this.uploadedFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })
      
      try {
        // 模拟文件上传
        this.$message.success('文件上传中...')
        // 实际项目中使用下面的代码
        // const response = await this.$axios.post('/api/qualification/upload', formData, {
        //   headers: { 'Content-Type': 'multipart/form-data' }
        // })
        
        // 模拟API延迟
        setTimeout(() => {
          this.$message.success('材料提交成功！')
          this.uploadedFiles = []
        }, 1500)
      } catch (error) {
        this.$message.error('文件上传失败，请重试')
        console.error('上传失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.submit-materials {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-top: 0;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 30px;
}

.upload-area.dragging {
  border-color: #3498db;
  background-color: #f0f8ff;
}

.upload-area i {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 15px;
}

.upload-area p {
  margin: 0 0 10px 0;
  color: #555;
}

.upload-area .hint {
  color: #999;
  font-size: 0.9rem;
}

.file-input {
  display: none;
}

.uploaded-files {
  margin-bottom: 30px;
}

.uploaded-files h3 {
  color: #34495e;
  margin-bottom: 15px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
}

.file-item i {
  margin-right: 15px;
  color: #3498db;
  font-size: 1.2rem;
}

.file-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #777;
  margin-right: 15px;
  font-size: 0.9rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.submit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #2980b9;
}

.submit-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
