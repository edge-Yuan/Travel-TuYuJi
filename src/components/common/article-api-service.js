// 文章管理API服务
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/travel-admin', // travel-admin服务地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const { data } = response
    console.log('API响应:', response.status, data)
    
    // 检查HTTP状态码
    if (response.status >= 200 && response.status < 300) {
      // 检查业务状态码
      if (data.code === 1 || data.code === 200 || data.code === 0) {
        return data.data || data
      } else {
        console.error('业务错误:', data.msg || data.message || '请求失败', data)
        return Promise.reject(new Error(data.msg || data.message || '请求失败'))
      }
    } else {
      return Promise.reject(new Error(`HTTP错误: ${response.status}`))
    }
  },
  error => {
    console.error('API请求错误:', error)
    if (error.response) {
      console.error('错误响应:', error.response.status, error.response.data)
    }
    return Promise.reject(error)
  }
)

// 文章管理API
export const articleApi = {
  // 分页查询文章列表
  getArticlePage(params) {
    return api.get('/article/page', { params })
  },

  // 获取文章详情
  getArticleDetail(id) {
    return api.get(`/article/${id}`)
  },

  // 创建文章
  createArticle(data) {
    return api.post('/article/create', data)
  },

  // 更新文章
  updateArticle(data) {
    return api.put('/article/update', data)
  },

  // 删除文章
  deleteArticle(id) {
    return api.delete(`/article/${id}`)
  },

  // 批量删除文章
  batchDeleteArticles(articleIds) {
    return api.delete('/article/batch', { data: articleIds })
  },

  // 批量更新文章状态
  batchUpdateStatus(data) {
    return api.put('/article/batch/status', data)
  },

  // 发布文章
  publishArticle(id) {
    return api.put(`/article/${id}/publish`)
  },

  // 下架文章
  unpublishArticle(id) {
    return api.put(`/article/${id}/unpublish`)
  },

  // 复制文章
  copyArticle(id) {
    return api.post(`/article/${id}/copy`)
  },

  // 获取文章统计数据
  getArticleStatistics() {
    return api.get('/article/statistics')
  },

  // 增加文章浏览次数
  incrementViewCount(id) {
    return api.put(`/article/${id}/view`)
  },

  // 增加文章点赞数
  incrementLikeCount(id) {
    return api.put(`/article/${id}/like`)
  },

  // 增加文章评论数
  incrementCommentCount(id) {
    return api.put(`/article/${id}/comment`)
  },

  // 获取热门文章列表
  getHotArticles(limit = 10) {
    return api.get('/article/hot', { params: { limit } })
  },

  // 获取最新文章列表
  getLatestArticles(limit = 10) {
    return api.get('/article/latest', { params: { limit } })
  },

  // 获取精选文章列表
  getFeaturedArticles(limit = 10) {
    return api.get('/article/featured', { params: { limit } })
  },

  // 搜索文章
  searchArticles(params) {
    return api.get('/article/search', { params })
  }
}

// 文章模板API
export const articleTemplateApi = {
  // 获取所有启用的模板列表
  getAllActiveTemplates() {
    return api.get('/article-template/list')
  },

  // 根据分类获取模板列表
  getTemplatesByCategory(category) {
    return api.get(`/article-template/category/${category}`)
  },

  // 获取模板详情
  getTemplateDetail(id) {
    return api.get(`/article-template/${id}`)
  },

  // 创建模板
  createTemplate(data) {
    return api.post('/article-template/create', data)
  },

  // 更新模板
  updateTemplate(data) {
    return api.put('/article-template/update', data)
  },

  // 删除模板
  deleteTemplate(id) {
    return api.delete(`/article-template/${id}`)
  },

  // 启用/禁用模板
  toggleTemplateStatus(id, isActive) {
    return api.put(`/article-template/${id}/toggle`, null, { params: { isActive } })
  }
}

// 产品API（用于获取套餐列表）
export const productApi = {
  // 获取产品列表（使用搜索接口）
  getProductList() {
    return api.get('/tourProduct/search', {
      params: {
        page: 1,
        size: 100
      },
      headers: {
        'X-Merchant-Id': 1 // 默认使用merchant ID 1
      }
    })
  },

  // 获取产品详情
  getProductDetail(id) {
    return api.get(`/tourProduct/detail/${id}`)
  }
}

// 文件上传API
export const fileUploadApi = {
  // 上传文章图片（使用通用文件上传接口）
  uploadArticleImage(file, articleId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploadType', 'article')
    formData.append('relatedId', articleId || 0)
    
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 上传产品图片
  uploadProductImage(file, productId, isMain = false) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    formData.append('isMain', isMain)
    
    return api.post('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 通用文件上传
  uploadFile(file, uploadType, relatedId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploadType', uploadType)
    formData.append('relatedId', relatedId)
    
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除文件
  deleteFile(fileId) {
    return api.delete(`/upload/file/${fileId}`)
  },

  // 获取产品图片列表
  getProductImages(productId) {
    return api.get(`/upload/product/${productId}`)
  },

  // 获取产品主图
  getProductMainImage(productId) {
    return api.get(`/upload/product/${productId}/main`)
  },

  // 设置产品主图
  setProductMainImage(productId, fileId) {
    return api.put(`/upload/product/${productId}/main/${fileId}`)
  },

  // 删除产品所有图片
  deleteProductImages(productId) {
    return api.delete(`/upload/product/${productId}`)
  }
}

export default {
  articleApi,
  articleTemplateApi,
  productApi,
  fileUploadApi
}
