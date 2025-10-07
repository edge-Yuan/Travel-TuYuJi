/**
 * 前端图片处理工具类
 * 用于处理评价系统中的图片显示问题
 */

// 默认图片路径
const DEFAULT_IMAGES = {
  avatar: 'http://localhost:8086/travelManagementSystem/img/logo1.8b9dc3de.jpg',
  evaluation: 'http://localhost:8086/travelManagementSystem/img/travel.67fb7f10.jpg',
  product: 'http://localhost:8086/travelManagementSystem/img/travel2.fe72218a.jpg',
  travel: 'http://localhost:8086/travelManagementSystem/img/travel3.cba7bc68.jpg'
}

/**
 * 图片处理工具类
 */
export class ImageUtils {
  /**
   * 处理图片URL，确保图片能正确显示
   * @param {string} url - 原始图片URL
   * @param {string} type - 图片类型 (avatar, evaluation, product, travel)
   * @returns {string} 处理后的图片URL
   */
  static processImageUrl(url, type = 'evaluation') {
    console.log(`处理图片URL: ${url}, 类型: ${type}`)
    
    if (!url || !url.trim()) {
      const defaultImg = this.getDefaultImage(type)
      console.log(`使用默认图片: ${defaultImg}`)
      return defaultImg
    }
    
    const trimmedUrl = url.trim()
    
    // 如果是完整的HTTP/HTTPS URL，直接返回
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      console.log(`HTTP URL: ${trimmedUrl}`)
      return trimmedUrl
    }
    
    // 如果是base64图片，直接返回
    if (trimmedUrl.startsWith('data:image/')) {
      console.log(`Base64图片: ${trimmedUrl.substring(0, 50)}...`)
      return trimmedUrl
    }
    
    // 清理双斜杠问题
    let cleanUrl = trimmedUrl.replace(/\/+/g, '/')
    
    // 如果是相对路径，添加服务器基础路径
    if (cleanUrl.startsWith('/')) {
      // 添加服务器基础URL
      const baseUrl = 'http://localhost:8086/travelManagementSystem'
      const fullUrl = baseUrl + cleanUrl
      console.log(`构建完整URL: ${cleanUrl} -> ${fullUrl}`)
      return fullUrl
    } else {
      const processedUrl = `http://localhost:8086/travelManagementSystem/${cleanUrl}`
      console.log(`相对路径处理: ${cleanUrl} -> ${processedUrl}`)
      return processedUrl
    }
  }

  /**
   * 获取默认图片
   * @param {string} type - 图片类型
   * @returns {string} 默认图片URL
   */
  static getDefaultImage(type = 'evaluation') {
    return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.evaluation
  }

  /**
   * 处理评价数据中的图片
   * @param {Object} evaluation - 评价数据
   * @returns {Object} 处理后的评价数据
   */
  static processEvaluationData(evaluation) {
    if (!evaluation) return evaluation

    return {
      ...evaluation,
      userAvatar: this.processImageUrl(evaluation.userAvatar, 'avatar'),
      imgUrls: this.processImageUrls(evaluation.imgUrls),
      productImage: this.processImageUrl(evaluation.productImage, 'product')
    }
  }

  /**
   * 处理多个图片URL
   * @param {string} imgUrls - 图片URL字符串，用逗号分隔
   * @returns {Array} 处理后的图片URL数组
   */
  static processImageUrls(imgUrls) {
    if (!imgUrls) return []
    
    return imgUrls.split(',')
      .map(url => url.trim())
      .filter(url => url)
      .map(url => this.processImageUrl(url, 'evaluation'))
  }

  /**
   * 处理用户头像
   * @param {Object} user - 用户数据
   * @returns {string} 处理后的头像URL
   */
  static processUserAvatar(user) {
    if (!user) return this.getDefaultImage('avatar')
    
    // 优先使用userAvatar字段
    if (user.userAvatar && user.userAvatar.trim()) {
      return this.processImageUrl(user.userAvatar, 'avatar')
    }
    
    // 如果没有头像，使用默认头像
    return this.getDefaultImage('avatar')
  }

  /**
   * 处理产品图片
   * @param {Object} product - 产品数据
   * @returns {Array} 处理后的产品图片数组
   */
  static processProductImages(product) {
    if (!product || !product.imgUrls) {
      return [this.getDefaultImage('product')]
    }
    
    const images = this.processImageUrls(product.imgUrls)
    return images.length > 0 ? images : [this.getDefaultImage('product')]
  }

  /**
   * 预加载图片
   * @param {string} url - 图片URL
   * @returns {Promise} 预加载Promise
   */
  static preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = () => reject(new Error(`图片加载失败: ${url}`))
      img.src = url
    })
  }

  /**
   * 批量预加载图片
   * @param {Array} urls - 图片URL数组
   * @returns {Promise} 预加载Promise
   */
  static preloadImages(urls) {
    return Promise.allSettled(urls.map(url => this.preloadImage(url)))
  }

  /**
   * 处理图片加载错误
   * @param {Event} event - 错误事件
   * @param {string} type - 图片类型
   */
  static handleImageError(event, type = 'evaluation') {
    console.log(`图片加载失败，使用默认图片: ${event.target.src}`)
    event.target.src = this.getDefaultImage(type)
  }

  /**
   * 检查图片URL是否有效
   * @param {string} url - 图片URL
   * @returns {boolean} 是否有效
   */
  static isValidImageUrl(url) {
    if (!url || !url.trim()) return false
    
    const trimmedUrl = url.trim()
    
    // 检查是否是有效的URL格式
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return true
    }
    
    // 检查是否是base64格式
    if (trimmedUrl.startsWith('data:image/')) {
      return true
    }
    
    // 检查是否是相对路径
    if (trimmedUrl.startsWith('/')) {
      return true
    }
    
    return false
  }

  /**
   * 获取图片信息
   * @param {string} url - 图片URL
   * @returns {Object} 图片信息
   */
  static getImageInfo(url) {
    return {
      url: this.processImageUrl(url),
      isValid: this.isValidImageUrl(url),
      isDefault: !url || !url.trim(),
      type: this.getImageType(url)
    }
  }

  /**
   * 获取图片类型
   * @param {string} url - 图片URL
   * @returns {string} 图片类型
   */
  static getImageType(url) {
    if (!url) return 'unknown'
    
    if (url.includes('avatar') || url.includes('user')) return 'avatar'
    if (url.includes('product') || url.includes('tour')) return 'product'
    if (url.includes('evaluation') || url.includes('review')) return 'evaluation'
    
    return 'evaluation'
  }
}

/**
 * Vue混入对象，提供图片处理方法
 */
export const imageMixin = {
  methods: {
    /**
     * 处理图片URL
     * @param {string} url - 原始图片URL
     * @param {string} type - 图片类型
     * @returns {string} 处理后的图片URL
     */
    processImageUrl(url, type = 'evaluation') {
      return ImageUtils.processImageUrl(url, type)
    },

    /**
     * 处理用户头像
     * @param {Object} user - 用户数据
     * @returns {string} 处理后的头像URL
     */
    processUserAvatar(user) {
      return ImageUtils.processUserAvatar(user)
    },

    /**
     * 处理评价数据
     * @param {Object} evaluation - 评价数据
     * @returns {Object} 处理后的评价数据
     */
    processEvaluationData(evaluation) {
      return ImageUtils.processEvaluationData(evaluation)
    },

    /**
     * 处理图片加载错误
     * @param {Event} event - 错误事件
     * @param {string} type - 图片类型
     */
    handleImageError(event, type = 'evaluation') {
      ImageUtils.handleImageError(event, type)
    },

    /**
     * 获取默认图片
     * @param {string} type - 图片类型
     * @returns {string} 默认图片URL
     */
    getDefaultImage(type = 'evaluation') {
      return ImageUtils.getDefaultImage(type)
    }
  }
}

/**
 * 图片加载状态管理
 */
export class ImageLoadManager {
  constructor() {
    this.loadingImages = new Set()
    this.loadedImages = new Set()
    this.failedImages = new Set()
  }

  /**
   * 加载图片
   * @param {string} url - 图片URL
   * @returns {Promise} 加载Promise
   */
  async loadImage(url) {
    if (this.loadedImages.has(url)) {
      return Promise.resolve(url)
    }

    if (this.failedImages.has(url)) {
      return Promise.reject(new Error(`图片加载失败: ${url}`))
    }

    if (this.loadingImages.has(url)) {
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (this.loadedImages.has(url)) {
            resolve(url)
          } else if (this.failedImages.has(url)) {
            reject(new Error(`图片加载失败: ${url}`))
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
      })
    }

    this.loadingImages.add(url)

    try {
      await ImageUtils.preloadImage(url)
      this.loadedImages.add(url)
      this.loadingImages.delete(url)
      return url
    } catch (error) {
      this.failedImages.add(url)
      this.loadingImages.delete(url)
      throw error
    }
  }

  /**
   * 批量加载图片
   * @param {Array} urls - 图片URL数组
   * @returns {Promise} 加载Promise
   */
  async loadImages(urls) {
    return Promise.allSettled(urls.map(url => this.loadImage(url)))
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.loadingImages.clear()
    this.loadedImages.clear()
    this.failedImages.clear()
  }
}

// 创建全局图片加载管理器实例
export const imageLoadManager = new ImageLoadManager()

export default ImageUtils
