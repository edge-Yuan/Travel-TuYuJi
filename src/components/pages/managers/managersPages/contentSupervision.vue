<template>
  <div class="content-supervision">
    <!-- 功能标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="产品审核" name="product"></el-tab-pane>
      <el-tab-pane label="文章审核" name="article"></el-tab-pane>
      <el-tab-pane label="评价监管" name="review"></el-tab-pane>
      <el-tab-pane label="公告管理" name="notice"></el-tab-pane>
    </el-tabs>

    <!-- 三级交互流程指示器 -->
    <div class="process-bar">
      <div 
        class="process-step" 
        :class="{ active: currentStep >= 1 }"
        @click="goToStep(1)"
      >
        <span class="step-number">1</span>
        <span class="step-name">{{ getStepName(1) }}</span>
      </div>
      <div class="process-divider" :class="{ active: currentStep >= 2 }"></div>
      <div 
        class="process-step" 
        :class="{ active: currentStep >= 2 }"
        @click="currentStep >= 2 && goToStep(2)"
      >
        <span class="step-number">2</span>
        <span class="step-name">{{ getStepName(2) }}</span>
      </div>
      <div class="process-divider" :class="{ active: currentStep >= 3 }"></div>
      <div 
        class="process-step" 
        :class="{ active: currentStep >= 3 }"
        @click="currentStep >= 3 && goToStep(3)"
      >
        <span class="step-number">3</span>
        <span class="step-name">{{ getStepName(3) }}</span>
      </div>
    </div>

    <!-- 1. 一级交互：接收/选择待处理内容 -->
    <div v-if="currentStep === 1" class="step-container">
      <el-card>
        <div slot="header">待处理{{ getTitleSuffix() }}</div>
        
        <!-- 产品审核：待审核列表 -->
        <el-table 
          v-if="activeTab === 'product'" 
          :data="productList" 
          border 
          @row-click="selectItem"
        >
          <el-table-column prop="id" label="产品ID" width="100"></el-table-column>
          <el-table-column prop="name" label="产品名称"></el-table-column>
          <el-table-column prop="agency" label="提交旅行商" width="180"></el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
        </el-table>

        <!-- 文章审核：待审核列表 -->
        <el-table 
          v-if="activeTab === 'article'" 
          :data="articleList" 
          border 
          @row-click="selectItem"
        >
          <el-table-column prop="id" label="文章ID" width="100"></el-table-column>
          <el-table-column prop="title" label="文章标题"></el-table-column>
          <el-table-column prop="author" label="作者" width="120"></el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
        </el-table>

        <!-- 评价监管：待处理评价 -->
        <el-table 
          v-if="activeTab === 'review'" 
          :data="reviewList" 
          border 
          @row-click="selectItem"
        >
          <el-table-column prop="id" label="评价ID" width="100"></el-table-column>
          <el-table-column prop="product" label="关联产品"></el-table-column>
          <el-table-column prop="user" label="游客" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag type="danger" v-if="scope.row.isReported">已举报</el-tag>
              <el-tag type="info" v-else>正常</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 公告管理：选择公告（新建/编辑） -->
        <div v-if="activeTab === 'notice'">
          <el-button type="primary" icon="el-icon-plus" @click="selectItem({ isNew: true })">新建公告</el-button>
          <el-table 
            :data="noticeList" 
            border 
            style="margin-top: 15px;"
            @row-click="selectItem"
          >
            <el-table-column prop="id" label="公告ID" width="100"></el-table-column>
            <el-table-column prop="title" label="公告标题"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
          </el-table>
        </div>

        <div class="step-actions" style="margin-top: 15px;">
          <el-button 
            type="primary" 
            @click="goToStep(2)"
            :disabled="!selectedItem"
          >
            处理选中项
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 2. 二级交互：审核/处理内容 -->
    <div v-if="currentStep === 2" class="step-container">
      <el-card>
        <div slot="header">处理{{ getTitleSuffix() }}</div>
        
        <!-- 产品审核详情 -->
        <div v-if="activeTab === 'product' && selectedItem">
          <el-descriptions column="1" border>
            <el-descriptions-item label="产品名称">{{ selectedItem.name }}</el-descriptions-item>
            <el-descriptions-item label="提交旅行商">{{ selectedItem.agency }}</el-descriptions-item>
            <el-descriptions-item label="产品价格">¥{{ selectedItem.price }}</el-descriptions-item>
            <el-descriptions-item label="产品描述">{{ selectedItem.desc }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="review-options" style="margin-top: 15px;">
            <el-radio-group v-model="reviewResult">
              <el-radio label="approve">通过（允许上架）</el-radio>
              <el-radio label="reject">驳回（不允许上架）</el-radio>
            </el-radio-group>
            <el-input 
              v-model="reviewRemark" 
              type="textarea" 
              :rows="2"
              placeholder="请输入审核意见（驳回需说明原因）"
              style="margin-top: 10px;"
            ></el-input>
          </div>
        </div>

        <!-- 文章审核详情 -->
        <div v-if="activeTab === 'article' && selectedItem">
          <el-descriptions column="1" border>
            <el-descriptions-item label="文章标题">{{ selectedItem.title }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{ selectedItem.author }}</el-descriptions-item>
            <el-descriptions-item label="文章内容">{{ selectedItem.content }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="review-options" style="margin-top: 15px;">
            <el-radio-group v-model="reviewResult">
              <el-radio label="approve">通过（允许发布）</el-radio>
              <el-radio label="reject">驳回（不允许发布）</el-radio>
            </el-radio-group>
            <el-input 
              v-model="reviewRemark" 
              type="textarea" 
              :rows="2"
              placeholder="请输入审核意见"
              style="margin-top: 10px;"
            ></el-input>
          </div>
        </div>

        <!-- 评价监管处理 -->
        <div v-if="activeTab === 'review' && selectedItem">
          <el-descriptions column="1" border>
            <el-descriptions-item label="关联产品">{{ selectedItem.product }}</el-descriptions-item>
            <el-descriptions-item label="评价游客">{{ selectedItem.user }}</el-descriptions-item>
            <el-descriptions-item label="评价内容">{{ selectedItem.content }}</el-descriptions-item>
            <el-descriptions-item label="评价时间">{{ selectedItem.time }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="review-options" style="margin-top: 15px;">
            <el-select v-model="reviewResult" placeholder="请选择处理方式">
              <el-option label="保留评价" value="retain"></el-option>
              <el-option label="隐藏评价" value="hide"></el-option>
              <el-option label="删除评价" value="delete"></el-option>
            </el-select>
            <el-input 
              v-model="reviewRemark" 
              type="textarea" 
              :rows="2"
              placeholder="请输入处理备注"
              style="margin-top: 10px;"
            ></el-input>
          </div>
        </div>

        <!-- 公告编辑 -->
        <div v-if="activeTab === 'notice' && selectedItem">
          <el-form :model="noticeForm" :rules="noticeRules" ref="noticeForm">
            <el-form-item label="公告标题" prop="title">
              <el-input v-model="noticeForm.title"></el-input>
            </el-form-item>
            <el-form-item label="公告内容" prop="content">
              <el-input v-model="noticeForm.content" type="textarea" :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="发布状态">
              <el-switch v-model="noticeForm.active" active-text="已发布" inactive-text="草稿"></el-switch>
            </el-form-item>
          </el-form>
        </div>

        <div class="step-actions" style="margin-top: 15px;">
          <el-button @click="goToStep(1)">返回</el-button>
          <el-button 
            type="primary" 
            @click="goToStep(3)"
            :disabled="!canProceedToStep3"
          >
            确认处理
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 3. 三级交互：执行结果反馈 -->
    <div v-if="currentStep === 3" class="step-container">
      <el-card>
        <div slot="header">处理结果</div>
        
        <div class="result-content">
          <div class="result-icon" :class="isSuccess? 'success' : 'fail'">
            <i class="el-icon-circle-check" v-if="isSuccess"></i>
            <i class="el-icon-circle-cross" v-else></i>
          </div>
          
          <div class="result-text">
            <h3>{{ resultTitle }}</h3>
            <p v-if="reviewRemark">备注：{{ reviewRemark }}</p>
            <p v-if="activeTab === 'notice'">
              发布状态：<el-tag :type="noticeForm.active? 'success' : 'info'">
                {{ noticeForm.active? '已发布' : '草稿' }}
              </el-tag>
            </p>
          </div>
        </div>

        <div class="step-actions" style="margin-top: 20px;">
          <el-button @click="goToStep(2)">返回修改</el-button>
          <el-button type="primary" @click="resetProcess">完成</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'contentSupervision',
  data() {
    return {
      // 状态管理
      activeTab: 'product',
      currentStep: 1,
      selectedItem: null,
      
      // 审核相关
      reviewResult: '',
      reviewRemark: '',
      
      // 公告表单
      noticeForm: {
        title: '',
        content: '',
        active: true
      },
      noticeRules: {
        title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
      },
      
      // 模拟数据 - 产品列表（旅行商已提交）
      productList: [
        {
          id: 'P001',
          name: '长沙三日游',
          agency: '快乐旅行公司',
          price: 1299,
          desc: '包含岳麓山、橘子洲头等景点门票及三星住宿',
          submitTime: '2024-09-15 09:23'
        },
        {
          id: 'P002',
          name: '张家界五日游',
          agency: '山水旅行社',
          price: 2199,
          desc: '含玻璃栈道、天门山等核心景点，四星住宿',
          submitTime: '2024-09-15 14:05'
        }
      ],
      
      // 模拟数据 - 文章列表（旅行商已提交）
      articleList: [
        {
          id: 'A001',
          title: '2024长沙旅游全攻略',
          author: '旅行达人小李',
          content: '本文详细介绍了长沙的景点、美食和交通...',
          submitTime: '2024-09-14 16:40'
        },
        {
          id: 'A002',
          title: '张家界避坑指南',
          author: '户外爱好者老王',
          content: '分享张家界旅游的注意事项和省钱技巧...',
          submitTime: '2024-09-15 10:12'
        }
      ],
      
      // 模拟数据 - 评价列表
      reviewList: [
        {
          id: 'R001',
          product: '长沙三日游',
          user: '游客A',
          content: '导游服务差，行程安排不合理',
          time: '2024-09-13 18:30',
          isReported: true
        },
        {
          id: 'R002',
          product: '张家界五日游',
          user: '游客B',
          content: '风景很美，体验非常好',
          time: '2024-09-14 21:15',
          isReported: false
        }
      ],
      
      // 模拟数据 - 公告列表
      noticeList: [
        {
          id: 'N001',
          title: '国庆假期平台运营通知',
          content: '国庆期间订单处理时间延长至24小时...',
          createTime: '2024-09-10 08:30'
        }
      ]
    };
  },
  computed: {
    // 判断是否可以进入第三步
    canProceedToStep3() {
      if (this.activeTab === 'product' || this.activeTab === 'article') {
        return!!this.reviewResult;
      }
      if (this.activeTab === 'review') {
        return!!this.reviewResult;
      }
      if (this.activeTab === 'notice') {
        // 公告需验证表单
        let isValid = true;
        this.$refs.noticeForm.validate((valid) => {
          isValid = valid;
        });
        return isValid;
      }
      return false;
    },
    
    // 结果状态
    isSuccess() {
      if (this.activeTab === 'product' || this.activeTab === 'article') {
        return this.reviewResult === 'approve';
      }
      return true; // 评价处理和公告管理都视为成功
    },
    
    // 结果标题
    resultTitle() {
      const resultMap = {
        product: {
          approve: '产品审核通过，已允许上架',
          reject: '产品审核未通过，已驳回'
        },
        article: {
          approve: '文章审核通过，已允许发布',
          reject: '文章审核未通过，已驳回'
        },
        review: {
          retain: '评价处理完成，已保留该评价',
          hide: '评价处理完成，已隐藏该评价',
          delete: '评价处理完成，已删除该评价'
        },
        notice: this.selectedItem.isNew? '公告创建成功' : '公告编辑成功'
      };
      return this.activeTab === 'review' || this.activeTab === 'notice' 
       ? resultMap[this.activeTab][this.reviewResult || ''] || resultMap[this.activeTab]
        : resultMap[this.activeTab][this.reviewResult];
    }
  },
  methods: {
    // 切换标签时重置流程
    handleTabChange() {
      this.resetProcess();
    },
    
    // 选择处理项
    selectItem(item) {
      this.selectedItem = {...item };
      
      // 公告编辑特殊处理
      if (this.activeTab === 'notice') {
        if (item.isNew) {
          this.noticeForm = { title: '', content: '', active: true };
        } else {
          this.noticeForm = {
            title: item.title,
            content: item.content,
            active: true
          };
        }
      }
    },
    
    // 步骤切换
    goToStep(step) {
      this.currentStep = step;
    },
    
    // 重置流程
    resetProcess() {
      this.currentStep = 1;
      this.selectedItem = null;
      this.reviewResult = '';
      this.reviewRemark = '';
    },
    
    // 获取步骤名称（根据当前功能动态显示）
    getStepName(step) {
      const stepMap = {
        product: ['待审核产品', '审核产品', '审核结果'],
        article: ['待审核文章', '审核文章', '审核结果'],
        review: ['待处理评价', '处理评价', '处理结果'],
        notice: ['选择公告', '编辑公告', '发布结果']
      };
      return stepMap[this.activeTab][step - 1];
    },
    
    // 获取标题后缀
    getTitleSuffix() {
      const suffixMap = {
        product: '产品',
        article: '文章',
        review: '评价',
        notice: '公告'
      };
      return suffixMap[this.activeTab];
    }
  }
};
</script>

<style scoped>
.content-supervision {
  padding: 20px;
  /* background-color: #f5f7fa; */
  min-height: calc(100vh - 40px);
}

/* 流程指示器样式 */
.process-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  cursor: pointer;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e8e8e8;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.step-name {
  font-size: 14px;
  color: #8c8c8c;
}

.process-divider {
  width: 60px;
  height: 2px;
  background-color: #e8e8e8;
}

/* 激活状态样式 */
.process-step.active.step-number {
  background-color: #1890ff;
  color: white;
}

.process-step.active.step-name {
  color: #1890ff;
  font-weight: 500;
}

.process-divider.active {
  background-color: #1890ff;
}

/* 步骤内容样式 */
.step-container {
  margin-bottom: 30px;
}

.step-actions {
  text-align: right;
}

/* 结果展示样式 */
.result-content {
  text-align: center;
  padding: 30px 0;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.result-icon.success {
  color: #52c41a;
}

.result-icon.fail {
  color: #f5222d;
}

.result-text {
  font-size: 16px;
  color: #333;
}

.result-text h3 {
  margin: 0 0 15px 0;
  font-weight: 500;
}

/* 审核选项样式 */
.review-options {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>
