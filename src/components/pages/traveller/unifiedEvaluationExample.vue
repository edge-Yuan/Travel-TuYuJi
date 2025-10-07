<template>
  <div class="unified-evaluation-example">
    <h3>统一评价API使用示例</h3>
    
    <el-card>
      <div slot="header">
        <span>评价表单</span>
      </div>
      
      <el-form :model="evaluationForm" :rules="evaluationRules" ref="evaluationForm" label-width="120px">
        <el-form-item label="订单ID" prop="orderId">
          <el-input v-model="evaluationForm.orderId" placeholder="请输入订单ID"></el-input>
        </el-form-item>
        
        <el-form-item label="产品ID" prop="productId">
          <el-input v-model="evaluationForm.productId" placeholder="请输入产品ID"></el-input>
        </el-form-item>
        
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="evaluationForm.userId" placeholder="请输入用户ID"></el-input>
        </el-form-item>
        
        <el-form-item label="总体评分" prop="overallScore">
          <el-rate v-model="evaluationForm.overallScore" :max="5" show-text></el-rate>
        </el-form-item>
        
        <el-form-item label="服务评分">
          <el-rate v-model="evaluationForm.serviceScore" :max="5" show-text></el-rate>
        </el-form-item>
        
        <el-form-item label="环境评分">
          <el-rate v-model="evaluationForm.environmentScore" :max="5" show-text></el-rate>
        </el-form-item>
        
        <el-form-item label="性价比评分">
          <el-rate v-model="evaluationForm.costEffScore" :max="5" show-text></el-rate>
        </el-form-item>
        
        <el-form-item label="评价内容" prop="content">
          <el-input 
            v-model="evaluationForm.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入评价内容"
            maxlength="500"
            show-word-limit>
          </el-input>
        </el-form-item>
        
        <el-form-item label="评价图片">
          <el-input v-model="evaluationForm.imgUrls" placeholder="请输入图片URL，多个用逗号分隔"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitEvaluation" :loading="loading">提交评价</el-button>
          <el-button @click="resetForm">重置表单</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card>
      <div slot="header">
        <span>评价列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="loadEvaluations">刷新</el-button>
      </div>
      
      <div v-loading="loading">
        <div v-if="evaluations.length === 0" class="empty-state">
          <el-empty description="暂无评价数据"></el-empty>
        </div>
        
        <div v-else>
          <div v-for="evaluation in evaluations" :key="evaluation.evalId" class="evaluation-item">
            <div class="evaluation-header">
              <span class="user-name">{{ evaluation.userName || '匿名用户' }}</span>
              <span class="evaluation-date">{{ formatDate(evaluation.evalTime) }}</span>
            </div>
            
            <div class="evaluation-ratings">
              <div class="rating-item">
                <span>总体评分:</span>
                <el-rate v-model="evaluation.overallScore" disabled show-score></el-rate>
              </div>
              <div class="rating-item" v-if="evaluation.serviceScore">
                <span>服务评分:</span>
                <el-rate v-model="evaluation.serviceScore" disabled show-score></el-rate>
              </div>
              <div class="rating-item" v-if="evaluation.environmentScore">
                <span>环境评分:</span>
                <el-rate v-model="evaluation.environmentScore" disabled show-score></el-rate>
              </div>
              <div class="rating-item" v-if="evaluation.costEffScore">
                <span>性价比评分:</span>
                <el-rate v-model="evaluation.costEffScore" disabled show-score></el-rate>
              </div>
            </div>
            
            <div class="evaluation-content" v-if="evaluation.content">
              <p>{{ evaluation.content }}</p>
            </div>
            
            <div class="evaluation-actions">
              <el-button type="text" @click="replyEvaluation(evaluation.evalId)">回复</el-button>
              <el-button type="text" @click="deleteEvaluation(evaluation.evalId)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card>
      <div slot="header">
        <span>API测试</span>
      </div>
      
      <div class="api-test">
        <el-button @click="testGetProductEvaluations" type="primary">测试获取产品评价</el-button>
        <el-button @click="testGetUserEvaluations" type="success">测试获取用户评价</el-button>
        <el-button @click="testGetEvaluationSummary" type="warning">测试获取评价汇总</el-button>
        <el-button @click="testGetAllEvaluations" type="info">测试获取所有评价</el-button>
      </div>
      
      <div v-if="apiTestResult" class="api-result">
        <h4>API测试结果:</h4>
        <pre>{{ JSON.stringify(apiTestResult, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script>
import UnifiedEvaluationAPI from '@/utils/evaluationAPI'

export default {
  name: 'UnifiedEvaluationExample',
  data() {
    return {
      // 评价表单数据
      evaluationForm: {
        orderId: null,
        productId: null,
        userId: null,
        overallScore: 5,
        serviceScore: null,
        environmentScore: null,
        costEffScore: null,
        content: '',
        imgUrls: '',
        evalType: 1, // 1-产品评价，2-导游评价
        targetId: null,
        userType: '游客',
        source: '来自WWW站'
      },
      
      // 表单验证规则
      evaluationRules: {
        orderId: [
          { required: true, message: '请输入订单ID', trigger: 'blur' }
        ],
        productId: [
          { required: true, message: '请输入产品ID', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ],
        overallScore: [
          { required: true, message: '请选择总体评分', trigger: 'change' }
        ],
        content: [
          { min: 10, message: '评价内容至少10个字符', trigger: 'blur' }
        ]
      },
      
      // 评价列表数据
      evaluations: [],
      loading: false,
      
      // 分页数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // API测试结果
      apiTestResult: null
    }
  },
  
  methods: {
    /**
     * 提交评价
     */
    async submitEvaluation() {
      this.$refs.evaluationForm.validate(async (valid) => {
        if (!valid) return
        
        try {
          this.loading = true
          
          // 设置评价目标ID
          this.evaluationForm.targetId = this.evaluationForm.productId
          
          const response = await UnifiedEvaluationAPI.addEvaluation(this.evaluationForm)
          
          if (response.code === 1) {
            this.$message.success('评价提交成功！')
            this.resetForm()
            this.loadEvaluations()
          } else {
            this.$message.error(response.msg || '评价提交失败')
          }
        } catch (error) {
          this.$message.error('评价提交失败')
          console.error('评价提交错误:', error)
        } finally {
          this.loading = false
        }
      })
    },
    
    /**
     * 加载评价列表
     */
    async loadEvaluations() {
      try {
        this.loading = true
        
        const response = await UnifiedEvaluationAPI.getProductEvaluations(
          this.evaluationForm.productId,
          this.currentPage,
          this.pageSize
        )
        
        if (response.code === 1) {
          this.evaluations = response.data || []
          this.total = response.total || 0
        } else {
          this.$message.error(response.msg || '获取评价列表失败')
        }
      } catch (error) {
        this.$message.error('获取评价列表失败')
        console.error('获取评价列表错误:', error)
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 加载产品评价汇总
     */
    async loadEvaluationSummary() {
      try {
        const response = await UnifiedEvaluationAPI.getProductEvaluationSummary(this.evaluationForm.productId)
        
        if (response.code === 1) {
          // 处理评价汇总数据
          console.log('评价汇总:', response.data)
        }
      } catch (error) {
        console.error('获取评价汇总错误:', error)
      }
    },
    
    /**
     * 回复评价
     */
    async replyEvaluation(evalId) {
      const replyContent = prompt('请输入回复内容:')
      if (!replyContent) return
      
      try {
        const response = await UnifiedEvaluationAPI.replyEvaluation(evalId, replyContent)
        
        if (response.code === 1) {
          this.$message.success('回复成功！')
          this.loadEvaluations()
        } else {
          this.$message.error(response.msg || '回复失败')
        }
      } catch (error) {
        this.$message.error('回复失败')
        console.error('回复评价错误:', error)
      }
    },
    
    /**
     * 删除评价
     */
    async deleteEvaluation(evalId) {
      if (!confirm('确定要删除这条评价吗？')) return
      
      try {
        const response = await UnifiedEvaluationAPI.deleteEvaluation(evalId)
        
        if (response.code === 1) {
          this.$message.success('删除成功！')
          this.loadEvaluations()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        this.$message.error('删除失败')
        console.error('删除评价错误:', error)
      }
    },
    
    /**
     * 重置表单
     */
    resetForm() {
      this.evaluationForm = {
        orderId: null,
        productId: null,
        userId: null,
        overallScore: 5,
        serviceScore: null,
        environmentScore: null,
        costEffScore: null,
        content: '',
        imgUrls: '',
        evalType: 1,
        targetId: null,
        userType: '游客',
        source: '来自WWW站'
      }
    },
    
    /**
     * 格式化日期
     */
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    
    /**
     * 测试获取产品评价
     */
    async testGetProductEvaluations() {
      try {
        const response = await UnifiedEvaluationAPI.getProductEvaluations(1, 1, 10)
        this.apiTestResult = response
        this.$message.success('获取产品评价测试完成')
      } catch (error) {
        this.apiTestResult = { error: error.message }
        this.$message.error('获取产品评价测试失败')
      }
    },
    
    /**
     * 测试获取用户评价
     */
    async testGetUserEvaluations() {
      try {
        const response = await UnifiedEvaluationAPI.getUserEvaluations(1, 1, 10)
        this.apiTestResult = response
        this.$message.success('获取用户评价测试完成')
      } catch (error) {
        this.apiTestResult = { error: error.message }
        this.$message.error('获取用户评价测试失败')
      }
    },
    
    /**
     * 测试获取评价汇总
     */
    async testGetEvaluationSummary() {
      try {
        const response = await UnifiedEvaluationAPI.getProductEvaluationSummary(1)
        this.apiTestResult = response
        this.$message.success('获取评价汇总测试完成')
      } catch (error) {
        this.apiTestResult = { error: error.message }
        this.$message.error('获取评价汇总测试失败')
      }
    },
    
    /**
     * 测试获取所有评价
     */
    async testGetAllEvaluations() {
      try {
        const response = await UnifiedEvaluationAPI.getAllEvaluations(1, 10, 1)
        this.apiTestResult = response
        this.$message.success('获取所有评价测试完成')
      } catch (error) {
        this.apiTestResult = { error: error.message }
        this.$message.error('获取所有评价测试失败')
      }
    }
  },
  
  created() {
    // 初始化时加载评价数据
    // this.loadEvaluations()
    // this.loadEvaluationSummary()
  }
}
</script>

<style scoped>
.unified-evaluation-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.evaluation-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fafafa;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.evaluation-date {
  color: #999;
  font-size: 14px;
}

.evaluation-ratings {
  margin-bottom: 15px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-item span {
  min-width: 80px;
  margin-right: 10px;
  color: #666;
}

.evaluation-content {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.evaluation-content p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

.evaluation-actions {
  display: flex;
  gap: 10px;
}

.api-test {
  margin-bottom: 20px;
}

.api-test .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.api-result {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.api-result pre {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>
