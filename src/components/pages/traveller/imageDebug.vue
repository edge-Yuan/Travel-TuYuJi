<template>
  <div class="image-debug-container">
    <h2>图片显示调试页面</h2>
    
    <!-- 默认图片测试 -->
    <div class="debug-section">
      <h3>默认图片测试</h3>
      <div class="image-grid">
        <div class="image-item">
          <h4>默认头像</h4>
          <img 
            :src="getDefaultImage('avatar')" 
            alt="默认头像"
            @error="handleImageError($event, 'avatar')"
            class="debug-image"
          />
          <p>URL: {{ getDefaultImage('avatar') }}</p>
        </div>
        
        <div class="image-item">
          <h4>默认评价图片</h4>
          <img 
            :src="getDefaultImage('evaluation')" 
            alt="默认评价图片"
            @error="handleImageError($event, 'evaluation')"
            class="debug-image"
          />
          <p>URL: {{ getDefaultImage('evaluation') }}</p>
        </div>
        
        <div class="image-item">
          <h4>默认产品图片</h4>
          <img 
            :src="getDefaultImage('product')" 
            alt="默认产品图片"
            @error="handleImageError($event, 'product')"
            class="debug-image"
          />
          <p>URL: {{ getDefaultImage('product') }}</p>
        </div>
      </div>
    </div>

    <!-- 图片URL处理测试 -->
    <div class="debug-section">
      <h3>图片URL处理测试</h3>
      <div class="url-tests">
        <div class="url-test">
          <h4>空URL测试</h4>
          <p>输入: null</p>
          <p>输出: {{ processImageUrl(null, 'avatar') }}</p>
        </div>
        
        <div class="url-test">
          <h4>相对路径测试</h4>
          <p>输入: "images/test.jpg"</p>
          <p>输出: {{ processImageUrl('images/test.jpg', 'evaluation') }}</p>
        </div>
        
        <div class="url-test">
          <h4>绝对路径测试</h4>
          <p>输入: "/static/images/test.jpg"</p>
          <p>输出: {{ processImageUrl('/static/images/test.jpg', 'evaluation') }}</p>
        </div>
        
        <div class="url-test">
          <h4>HTTP URL测试</h4>
          <p>输入: "https://example.com/image.jpg"</p>
          <p>输出: {{ processImageUrl('https://example.com/image.jpg', 'evaluation') }}</p>
        </div>
      </div>
    </div>

    <!-- 模拟评价数据测试 -->
    <div class="debug-section">
      <h3>模拟评价数据测试</h3>
      <div class="mock-evaluation">
        <div class="user-info">
          <img 
            :src="processUserAvatar(mockUser)" 
            alt="用户头像"
            @error="handleImageError($event, 'avatar')"
            class="user-avatar"
          />
          <div class="user-details">
            <div class="user-name">{{ mockUser.userName }}</div>
            <div class="user-type">{{ mockUser.userType }}</div>
          </div>
        </div>
        
        <div class="evaluation-images" v-if="mockEvaluation.imgUrls">
          <h4>评价图片</h4>
          <div class="images-grid">
            <div v-for="(img, index) in getImageList(mockEvaluation.imgUrls)" :key="index" class="image-item">
              <img 
                :src="img" 
                :alt="`评价图片${index + 1}`"
                @error="handleImageError($event, 'evaluation')"
                class="evaluation-img"
              />
              <p>URL: {{ img }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { imageMixin } from '@/utils/imageUtils'

export default {
  name: 'ImageDebug',
  mixins: [imageMixin],
  data() {
    return {
      mockUser: {
        userName: '测试用户',
        userType: '游客',
        userAvatar: null // 测试空头像
      },
      mockEvaluation: {
        imgUrls: '/img/travel.67fb7f10.jpg,/img/travel2.fe72218a.jpg'
      }
    }
  },
  methods: {
    getImageList(imgUrls) {
      if (!imgUrls) return []
      return imgUrls.split(',').map(url => url.trim()).filter(url => url)
    }
  }
}
</script>

<style scoped>
.image-debug-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.debug-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.image-item {
  text-align: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.debug-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.url-tests {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.url-test {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.url-test h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.url-test p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.mock-evaluation {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-type {
  font-size: 12px;
  color: #666;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
  font-weight: 500;
}

.evaluation-images h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.evaluation-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 5px;
}

.image-item p {
  font-size: 12px;
  color: #666;
  word-break: break-all;
}
</style>