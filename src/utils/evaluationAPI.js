/**
 * 统一评价API调用工具类
 * 整合套餐评价和订单管理评价的前端调用
 */

import request from './request'

// 统一评价API基础配置
const EVALUATION_API_BASE = '/travel-portal/evaluation'

/**
 * 统一评价API类
 */
class UnifiedEvaluationAPI {
    
    /**
     * 添加评价
     * @param {Object} evaluationData - 评价数据
     * @returns {Promise} API响应
     */
    static async addEvaluation(evaluationData) {
        try {
            console.log('提交评价数据:', evaluationData)
            const response = await request.post(`${EVALUATION_API_BASE}/add`, evaluationData)
            console.log('评价提交响应:', response)
            return response.data
        } catch (error) {
            console.error('添加评价失败:', error)
            throw error
        }
    }
    
    /**
     * 获取产品评价列表
     * @param {Number} productId - 产品ID
     * @param {Number} page - 页码
     * @param {Number} size - 每页大小
     * @returns {Promise} API响应
     */
    static async getProductEvaluations(productId, page = 1, size = 10) {
        try {
            const response = await request.get(`${EVALUATION_API_BASE}/product/${productId}`, {
                params: { page, size }
            })
            return response.data
        } catch (error) {
            console.error('获取产品评价列表失败:', error)
            throw error
        }
    }
    
    /**
     * 获取订单评价列表
     * @param {Number} orderId - 订单ID
     * @returns {Promise} API响应
     */
    static async getOrderEvaluations(orderId) {
        try {
            const response = await request.get(`${EVALUATION_API_BASE}/order/${orderId}`)
            return response.data
        } catch (error) {
            console.error('获取订单评价列表失败:', error)
            throw error
        }
    }
    
    /**
     * 获取用户评价列表
     * @param {Number} userId - 用户ID
     * @param {Number} page - 页码
     * @param {Number} size - 每页大小
     * @returns {Promise} API响应
     */
    static async getUserEvaluations(userId, page = 1, size = 10) {
        try {
            const response = await request.get(`${EVALUATION_API_BASE}/user/${userId}`, {
                params: { page, size }
            })
            return response.data
        } catch (error) {
            console.error('获取用户评价列表失败:', error)
            throw error
        }
    }
    
    /**
     * 获取用户对产品的评价
     * @param {Number} userId - 用户ID
     * @param {Number} productId - 产品ID
     * @returns {Promise} API响应
     */
    static async getUserProductEvaluation(userId, productId) {
        try {
            const response = await request.get(`${EVALUATION_API_BASE}/user/${userId}/product/${productId}`)
            return response.data
        } catch (error) {
            console.error('获取用户产品评价失败:', error)
            throw error
        }
    }
    
    /**
     * 获取产品评价汇总信息
     * @param {Number} productId - 产品ID
     * @returns {Promise} API响应
     */
    static async getProductEvaluationSummary(productId) {
        try {
            const response = await request.get(`${EVALUATION_API_BASE}/product/${productId}/summary`)
            return response.data
        } catch (error) {
            console.error('获取产品评价汇总失败:', error)
            throw error
        }
    }
    
    /**
     * 回复评价
     * @param {Number} evalId - 评价ID
     * @param {String} replyContent - 回复内容
     * @param {Number} replierId - 回复者ID
     * @param {String} replierName - 回复者姓名
     * @param {String} replierRole - 回复者角色
     * @returns {Promise} API响应
     */
    static async replyEvaluation(evalId, replyContent, replierId, replierName, replierRole) {
        try {
            console.log('=== 回复评价API调用 ===')
            console.log('评价ID:', evalId)
            console.log('回复内容:', replyContent)
            console.log('回复者ID:', replierId)
            console.log('回复者姓名:', replierName)
            console.log('回复者角色:', replierRole)
            console.log('API端点:', `${EVALUATION_API_BASE}/reply/${evalId}/new`)
            
            const response = await request.post(`${EVALUATION_API_BASE}/reply/${evalId}/new`, {
                replyContent: replyContent
            }, {
                params: {
                    replierId: replierId,
                    replierName: replierName,
                    replierRole: replierRole
                }
            })
            console.log('API响应:', response)
            return response.data
        } catch (error) {
            console.error('回复评价失败:', error)
            console.error('错误详情:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            throw error
        }
    }
    
    /**
     * 编辑评价
     * @param {Number} evalId - 评价ID
     * @param {Object} evaluationData - 评价数据
     * @returns {Promise} API响应
     */
    static async updateEvaluation(evalId, evaluationData) {
        try {
            console.log('编辑评价数据:', evaluationData)
            const response = await request.put(`${EVALUATION_API_BASE}/${evalId}`, evaluationData)
            console.log('编辑评价响应:', response)
            return response.data
        } catch (error) {
            console.error('编辑评价失败:', error)
            throw error
        }
    }
    
    /**
     * 删除评价
     * @param {Number} evalId - 评价ID
     * @returns {Promise} API响应
     */
    static async deleteEvaluation(evalId) {
        try {
            const response = await request.delete(`${EVALUATION_API_BASE}/${evalId}`)
            return response.data
        } catch (error) {
            console.error('删除评价失败:', error)
            throw error
        }
    }
    
    /**
     * 获取所有评价（管理员用）
     * @param {Number} page - 页码
     * @param {Number} size - 每页大小
     * @param {Number} evalType - 评价类型（可选）
     * @returns {Promise} API响应
     */
    static async getAllEvaluations(page = 1, size = 10, evalType = null) {
        try {
            const params = { page, size }
            if (evalType !== null) {
                params.evalType = evalType
            }
            const response = await request.get(`${EVALUATION_API_BASE}/list`, { params })
            return response.data
        } catch (error) {
            console.error('获取所有评价失败:', error)
            throw error
        }
    }
    
    /**
     * 兼容旧版API - 添加产品评价
     * @param {Object} evaluationData - 评价数据
     * @returns {Promise} API响应
     */
    static async addProductEvaluation(evaluationData) {
        try {
            console.log('提交产品评价数据:', evaluationData)
            const response = await request.post('/travel-portal/productEvaluation/add', evaluationData)
            console.log('产品评价提交响应:', response)
            return response.data
        } catch (error) {
            console.error('添加产品评价失败:', error)
            throw error
        }
    }
    
    /**
     * 兼容旧版API - 获取产品评价列表
     * @param {Number} productId - 产品ID
     * @param {Number} page - 页码
     * @param {Number} size - 每页大小
     * @returns {Promise} API响应
     */
    static async getProductEvaluationList(productId, page = 1, size = 10) {
        try {
            const response = await request.get(`/travel-portal/productEvaluation/list/${productId}`, {
                params: { page, size }
            })
            return response.data
        } catch (error) {
            console.error('获取产品评价列表失败:', error)
            throw error
        }
    }
    
    /**
     * 兼容旧版API - 获取产品评价汇总
     * @param {Number} productId - 产品ID
     * @returns {Promise} API响应
     */
    static async getProductEvaluationSummaryOld(productId) {
        try {
            const response = await request.get(`/travel-portal/productEvaluation/summary/${productId}`)
            return response.data
        } catch (error) {
            console.error('获取产品评价汇总失败:', error)
            throw error
        }
    }
    
    /**
     * 兼容旧版API - 获取用户对产品的评价
     * @param {Number} userId - 用户ID
     * @param {Number} productId - 产品ID
     * @returns {Promise} API响应
     */
    static async getUserProductEvaluationOld(userId, productId) {
        try {
            const response = await request.get(`/travel-portal/productEvaluation/user/${userId}/product/${productId}`)
            return response.data
        } catch (error) {
            console.error('获取用户产品评价失败:', error)
            throw error
        }
    }
    
    /**
     * 兼容旧版API - 回复评价
     * @param {Number} evalId - 评价ID
     * @param {String} replyContent - 回复内容
     * @returns {Promise} API响应
     */
    static async replyProductEvaluation(evalId, replyContent) {
        try {
            const response = await request.post(`/travel-portal/productEvaluation/reply/${evalId}`, null, {
                params: { replyContent }
            })
            return response.data
        } catch (error) {
            console.error('回复产品评价失败:', error)
            throw error
        }
    }
    
    /**
     * 切换评价有用状态
     * @param {Number} evalId - 评价ID
     * @param {Number} userId - 用户ID
     * @returns {Promise} API响应
     */
    static async toggleUseful(evalId, userId) {
        try {
            console.log('=== 切换有用状态API调用 ===')
            console.log('评价ID:', evalId)
            console.log('用户ID:', userId)
            console.log('API端点:', `${EVALUATION_API_BASE}/useful/${evalId}`)
            
            const response = await request.post(`${EVALUATION_API_BASE}/useful/${evalId}`, null, {
                params: {
                    userId: userId
                }
            })
            console.log('API响应:', response)
            return response.data
        } catch (error) {
            console.error('切换有用状态失败:', error)
            console.error('错误详情:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            throw error
        }
    }
    
    /**
     * 领取评价优惠券
     * @param {Number} evalId - 评价ID
     * @param {Number} userId - 用户ID
     * @returns {Promise} API响应
     */
    static async claimCoupon(evalId, userId) {
        try {
            console.log('=== 领取优惠券API调用 ===')
            console.log('评价ID:', evalId)
            console.log('用户ID:', userId)
            console.log('API端点:', `${EVALUATION_API_BASE}/coupon/${evalId}`)
            
            const response = await request.post(`${EVALUATION_API_BASE}/coupon/${evalId}`, null, {
                params: {
                    userId: userId
                }
            })
            console.log('API响应:', response)
            return response.data
        } catch (error) {
            console.error('领取优惠券失败:', error)
            console.error('错误详情:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            throw error
        }
    }
    
    /**
     * 获取评价有用状态
     * @param {Number} evalId - 评价ID
     * @param {Number} userId - 用户ID
     * @returns {Promise} API响应
     */
    static async getUsefulStatus(evalId, userId) {
        try {
            console.log('=== 获取有用状态API调用 ===')
            console.log('评价ID:', evalId)
            console.log('用户ID:', userId)
            console.log('API端点:', `${EVALUATION_API_BASE}/useful/${evalId}`)
            
            const response = await request.get(`${EVALUATION_API_BASE}/useful/${evalId}`, {
                params: {
                    userId: userId
                }
            })
            console.log('获取有用状态API响应:', response)
            return response.data
        } catch (error) {
            console.error('获取有用状态失败:', error)
            console.error('错误详情:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            throw error
        }
    }
}

export default UnifiedEvaluationAPI
