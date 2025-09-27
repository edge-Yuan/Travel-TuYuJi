<template>
  <div class="article-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">文章运营</h1>
      <p class="subtitle">编写和发布旅游推荐文章，绑定相关套餐</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-edit"></i> 编写文章
      </el-button>
      <el-button type="success" @click="batchPublish">
        <i class="el-icon-upload"></i> 批量发布
      </el-button>
      <el-button type="info" @click="exportArticles">
        <i class="el-icon-download"></i> 导出文章
      </el-button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-select v-model="filters.status" placeholder="发布状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="已发布" value="published"></el-option>
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="待审核" value="pending"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.category" placeholder="文章分类" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="酒店推荐" value="hotel"></el-option>
            <el-option label="景点介绍" value="attraction"></el-option>
            <el-option label="美食攻略" value="food"></el-option>
            <el-option label="旅游攻略" value="guide"></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索文章标题或内容"
            prefix-icon="el-icon-search"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchArticles">搜索</el-button>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <el-table :data="filteredArticles" v-loading="loading" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="文章标题" min-width="200">
          <template slot-scope="scope">
            <div class="article-info">
              <img :src="scope.row.coverImage" class="article-cover" />
              <div class="article-details">
                <div class="article-title">{{ scope.row.title }}</div>
                <div class="article-category">
                  <el-tag :type="getCategoryTagType(scope.row.category)" size="mini">
                    {{ getCategoryName(scope.row.category) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="100"></el-table-column>
        <el-table-column prop="views" label="阅读量" width="100"></el-table-column>
        <el-table-column prop="likes" label="点赞数" width="100"></el-table-column>
        <el-table-column prop="comments" label="评论数" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="160"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="editArticle(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewArticle(scope.row)">预览</el-button>
            <el-button size="mini" type="warning" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'published' ? '下架' : '发布' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteArticle(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 创建/编辑文章对话框 -->
    <el-dialog :title="isEdit ? '编辑文章' : '编写文章'" :visible.sync="showCreateDialog" width="1000px" top="5vh">
      <el-form :model="articleForm" :rules="articleRules" ref="articleForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="articleForm.title" placeholder="请输入文章标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="文章分类" prop="category">
              <el-select v-model="articleForm.category" placeholder="选择分类">
                <el-option label="酒店推荐" value="hotel"></el-option>
                <el-option label="景点介绍" value="attraction"></el-option>
                <el-option label="美食攻略" value="food"></el-option>
                <el-option label="旅游攻略" value="guide"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="作者" prop="author">
              <el-input v-model="articleForm.author" placeholder="作者姓名"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload">
            <img v-if="articleForm.coverImage" :src="articleForm.coverImage" class="cover-image">
            <i v-else class="el-icon-plus cover-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="关联套餐">
          <el-select v-model="articleForm.relatedProducts" multiple placeholder="选择相关套餐">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="文章摘要">
          <el-input type="textarea" v-model="articleForm.summary" :rows="3" placeholder="请输入文章摘要"></el-input>
        </el-form-item>
        
        <el-form-item label="文章内容" prop="content">
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button size="mini" @click="insertText('**', '**')">粗体</el-button>
                <el-button size="mini" @click="insertText('*', '*')">斜体</el-button>
                <el-button size="mini" @click="insertText('# ', '')">标题</el-button>
                <el-button size="mini" @click="insertText('> ', '')">引用</el-button>
                <el-button size="mini" @click="insertText('- ', '')">列表</el-button>
                <el-button size="mini" @click="insertText('[链接文字](', ')')">链接</el-button>
              </el-button-group>
            </div>
            <el-input
              type="textarea"
              v-model="articleForm.content"
              :rows="15"
              placeholder="请输入文章内容，支持Markdown格式">
            </el-input>
            <div class="editor-preview" v-if="articleForm.content">
              <h4>预览效果：</h4>
              <div class="preview-content" v-html="renderMarkdown(articleForm.content)"></div>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-input v-model="tagInput" placeholder="输入标签后按回车添加" @keyup.enter.native="addTag">
            <template slot="append">
              <el-button @click="addTag">添加</el-button>
            </template>
          </el-input>
          <div class="tags-container">
            <el-tag
              v-for="tag in articleForm.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="tag-item">
              {{ tag }}
            </el-tag>
          </div>
        </el-form-item>
        
        <el-form-item label="SEO设置">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input v-model="articleForm.seoTitle" placeholder="SEO标题"></el-input>
            </el-col>
            <el-col :span="12">
              <el-input v-model="articleForm.seoKeywords" placeholder="SEO关键词，用逗号分隔"></el-input>
            </el-col>
          </el-row>
          <el-input v-model="articleForm.seoDescription" placeholder="SEO描述" style="margin-top: 10px;"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="publishArticle">发布文章</el-button>
      </div>
    </el-dialog>

    <!-- 文章预览对话框 -->
    <el-dialog title="文章预览" :visible.sync="showPreviewDialog" width="800px">
      <div v-if="previewArticle" class="article-preview">
        <div class="preview-header">
          <h1 class="preview-title">{{ previewArticle.title }}</h1>
          <div class="preview-meta">
            <span class="author">作者：{{ previewArticle.author }}</span>
            <span class="category">{{ getCategoryName(previewArticle.category) }}</span>
            <span class="publish-time">{{ previewArticle.publishTime }}</span>
          </div>
          <div class="preview-tags">
            <el-tag
              v-for="tag in previewArticle.tags"
              :key="tag"
              size="mini"
              class="tag-item">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div class="preview-cover" v-if="previewArticle.coverImage">
          <img :src="previewArticle.coverImage" alt="封面图片" />
        </div>
        
        <div class="preview-summary" v-if="previewArticle.summary">
          <p>{{ previewArticle.summary }}</p>
        </div>
        
        <div class="preview-content" v-html="renderMarkdown(previewArticle.content)"></div>
        
        <div class="preview-related" v-if="previewArticle.relatedProducts && previewArticle.relatedProducts.length">
          <h3>相关套餐</h3>
          <div class="related-products">
            <div
              v-for="productId in previewArticle.relatedProducts"
              :key="productId"
              class="related-product">
              {{ getProductName(productId) }}
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showPreviewDialog = false">关闭</el-button>
        <el-button type="primary" @click="editArticle(previewArticle)">编辑文章</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ArticleManagement',
  data() {
    return {
      loading: false,
      showCreateDialog: false,
      showPreviewDialog: false,
      isEdit: false,
      filters: {
        status: '',
        category: '',
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      tagInput: '',
      articleForm: {
        title: '',
        category: '',
        author: '',
        coverImage: '',
        summary: '',
        content: '',
        tags: [],
        relatedProducts: [],
        seoTitle: '',
        seoKeywords: '',
        seoDescription: ''
      },
      articleRules: {
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择文章分类', trigger: 'change' }
        ],
        author: [
          { required: true, message: '请输入作者姓名', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      },
      previewArticle: null,
      products: [
        { id: 1, name: '豪华海景套房' },
        { id: 2, name: '三亚三日游' },
        { id: 3, name: '故宫门票' }
      ],
      articles: [
        {
          id: 1,
          title: '三亚最值得入住的5家海景酒店',
          category: 'hotel',
          author: '张编辑',
          coverImage: '/src/assets/images/travel.jpg',
          summary: '精选三亚最受欢迎的海景酒店，为您推荐性价比最高的住宿选择。',
          content: '# 三亚最值得入住的5家海景酒店\n\n三亚作为中国最著名的海滨度假城市，拥有众多优质的海景酒店...',
          tags: ['三亚', '酒店', '海景', '度假'],
          relatedProducts: [1, 2],
          views: 1234,
          likes: 89,
          comments: 23,
          status: 'published',
          publishTime: '2024-01-15 10:30:00',
          seoTitle: '三亚海景酒店推荐',
          seoKeywords: '三亚,酒店,海景,度假',
          seoDescription: '精选三亚最受欢迎的海景酒店推荐'
        },
        {
          id: 2,
          title: '北京故宫深度游攻略',
          category: 'attraction',
          author: '李编辑',
          coverImage: '/src/assets/images/travel2.jpg',
          summary: '详细介绍故宫的游览路线、必看景点和参观技巧。',
          content: '# 北京故宫深度游攻略\n\n故宫，又称紫禁城，是明清两代的皇家宫殿...',
          tags: ['北京', '故宫', '历史', '文化'],
          relatedProducts: [3],
          views: 2567,
          likes: 156,
          comments: 45,
          status: 'published',
          publishTime: '2024-01-10 14:20:00',
          seoTitle: '故宫旅游攻略',
          seoKeywords: '北京,故宫,旅游,攻略',
          seoDescription: '北京故宫深度游攻略，详细介绍游览路线和必看景点'
        },
        {
          id: 3,
          title: '上海美食地图：必吃清单',
          category: 'food',
          author: '王编辑',
          coverImage: '/src/assets/images/travel3.jpg',
          summary: '上海本地人推荐的美食清单，从街头小吃到米其林餐厅。',
          content: '# 上海美食地图：必吃清单\n\n上海作为国际大都市，汇聚了世界各地的美食...',
          tags: ['上海', '美食', '小吃', '餐厅'],
          relatedProducts: [],
          views: 1890,
          likes: 234,
          comments: 67,
          status: 'draft',
          publishTime: '',
          seoTitle: '上海美食推荐',
          seoKeywords: '上海,美食,小吃,餐厅',
          seoDescription: '上海美食地图，本地人推荐必吃清单'
        }
      ]
    }
  },
  computed: {
    filteredArticles() {
      let filtered = this.articles;
      
      if (this.filters.status) {
        filtered = filtered.filter(article => article.status === this.filters.status);
      }
      
      if (this.filters.category) {
        filtered = filtered.filter(article => article.category === this.filters.category);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
          article.content.toLowerCase().includes(this.filters.keyword.toLowerCase())
        );
      }
      
      return filtered;
    }
  },
  watch: {
    filteredArticles: {
      handler(newVal) {
        this.pagination.total = newVal.length;
      },
      immediate: true
    }
  },
  methods: {
    searchArticles() {
      // 搜索逻辑已在computed中实现
    },
    
    resetFilters() {
      this.filters = {
        status: '',
        category: '',
        keyword: ''
      };
    },
    
    getCategoryName(category) {
      const categoryMap = {
        hotel: '酒店推荐',
        attraction: '景点介绍',
        food: '美食攻略',
        guide: '旅游攻略'
      };
      return categoryMap[category] || category;
    },
    
    getCategoryTagType(category) {
      const typeMap = {
        hotel: 'primary',
        attraction: 'success',
        food: 'warning',
        guide: 'info'
      };
      return typeMap[category] || 'info';
    },
    
    getStatusName(status) {
      const statusMap = {
        published: '已发布',
        draft: '草稿',
        pending: '待审核'
      };
      return statusMap[status] || status;
    },
    
    getStatusTagType(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        pending: 'warning'
      };
      return statusMap[status] || 'info';
    },
    
    getProductName(productId) {
      const product = this.products.find(p => p.id === productId);
      return product ? product.name : `产品${productId}`;
    },
    
    editArticle(article) {
      this.isEdit = true;
      this.articleForm = { ...article };
      this.showCreateDialog = true;
      this.showPreviewDialog = false;
    },
    
    viewArticle(article) {
      this.previewArticle = article;
      this.showPreviewDialog = true;
    },
    
    toggleStatus(article) {
      article.status = article.status === 'published' ? 'draft' : 'published';
      if (article.status === 'published') {
        article.publishTime = new Date().toLocaleString();
      }
      this.$message.success(`文章已${article.status === 'published' ? '发布' : '下架'}`);
    },
    
    deleteArticle(article) {
      this.$confirm('确定要删除这篇文章吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.articles.findIndex(a => a.id === article.id);
        if (index > -1) {
          this.articles.splice(index, 1);
          this.$message.success('删除成功');
        }
      });
    },
    
    addTag() {
      if (this.tagInput.trim() && !this.articleForm.tags.includes(this.tagInput.trim())) {
        this.articleForm.tags.push(this.tagInput.trim());
        this.tagInput = '';
      }
    },
    
    removeTag(tag) {
      const index = this.articleForm.tags.indexOf(tag);
      if (index > -1) {
        this.articleForm.tags.splice(index, 1);
      }
    },
    
    insertText(before, after) {
      // 简单的文本插入功能
      const textarea = this.$refs.articleForm.$el.querySelector('textarea');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = this.articleForm.content.substring(start, end);
      const newText = before + selectedText + after;
      
      this.articleForm.content = 
        this.articleForm.content.substring(0, start) + 
        newText + 
        this.articleForm.content.substring(end);
    },
    
    renderMarkdown(content) {
      // 简单的Markdown渲染
      return content
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        .replace(/\n/g, '<br>');
    },
    
    handleCoverSuccess(response, file) {
      this.articleForm.coverImage = URL.createObjectURL(file.raw);
    },
    
    beforeCoverUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    
    saveDraft() {
      this.$refs.articleForm.validate((valid) => {
        if (valid) {
          const article = {
            ...this.articleForm,
            id: this.isEdit ? this.articleForm.id : Date.now(),
            status: 'draft',
            views: 0,
            likes: 0,
            comments: 0,
            publishTime: ''
          };
          
          if (this.isEdit) {
            const index = this.articles.findIndex(a => a.id === article.id);
            this.articles.splice(index, 1, article);
          } else {
            this.articles.unshift(article);
          }
          
          this.showCreateDialog = false;
          this.$message.success('草稿保存成功');
          this.resetForm();
        }
      });
    },
    
    publishArticle() {
      this.$refs.articleForm.validate((valid) => {
        if (valid) {
          const article = {
            ...this.articleForm,
            id: this.isEdit ? this.articleForm.id : Date.now(),
            status: 'published',
            views: 0,
            likes: 0,
            comments: 0,
            publishTime: new Date().toLocaleString()
          };
          
          if (this.isEdit) {
            const index = this.articles.findIndex(a => a.id === article.id);
            this.articles.splice(index, 1, article);
          } else {
            this.articles.unshift(article);
          }
          
          this.showCreateDialog = false;
          this.$message.success('文章发布成功');
          this.resetForm();
        }
      });
    },
    
    resetForm() {
      this.articleForm = {
        title: '',
        category: '',
        author: '',
        coverImage: '',
        summary: '',
        content: '',
        tags: [],
        relatedProducts: [],
        seoTitle: '',
        seoKeywords: '',
        seoDescription: ''
      };
      this.isEdit = false;
      this.tagInput = '';
    },
    
    batchPublish() {
      this.$message.success('批量发布成功');
    },
    
    exportArticles() {
      this.$message.success('文章导出成功');
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    }
  }
}
</script>

<style scoped>
.article-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin: 0;
}

.action-bar {
  margin-bottom: 20px;
}

.action-bar .el-button {
  margin-right: 10px;
}

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.article-list {
  margin-bottom: 20px;
}

.article-info {
  display: flex;
  align-items: center;
}

.article-cover {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.article-details {
  flex: 1;
}

.article-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.article-category {
  margin-top: 4px;
}

.pagination {
  text-align: center;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 120px;
}

.cover-uploader:hover {
  border-color: #409EFF;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.cover-image {
  width: 200px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-toolbar {
  padding: 10px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.editor-preview {
  margin-top: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #dcdfe6;
}

.preview-content {
  line-height: 1.6;
  color: #333;
}

.tags-container {
  margin-top: 10px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.article-preview {
  padding: 20px 0;
}

.preview-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.preview-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
}

.preview-meta {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.preview-meta span {
  margin-right: 20px;
}

.preview-tags {
  margin-top: 10px;
}

.preview-cover {
  margin-bottom: 30px;
  text-align: center;
}

.preview-cover img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.preview-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  font-style: italic;
  color: #666;
}

.preview-related {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.preview-related h3 {
  margin-bottom: 15px;
  color: #333;
}

.related-products {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.related-product {
  padding: 8px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  color: #0369a1;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}
</style>
