<template>
  <div class="article-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">文章运营</h1>
      <p class="subtitle">编写和发布旅游推荐文章，绑定相关套餐</p>
    </div>

    <!-- 数据统计面板 -->
    <div class="stats-panel">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <i class="el-icon-document"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalArticles }}</div>
                <div class="stat-label">总文章数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon published">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.publishedArticles }}</div>
                <div class="stat-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon views">
                <i class="el-icon-view"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalViews }}</div>
                <div class="stat-label">总阅读量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon likes">
                <i class="el-icon-thumb"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalLikes }}</div>
                <div class="stat-label">总点赞数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-buttons-row">
        <el-button type="primary" @click="showCreateDialog = true" class="action-btn">
        <i class="el-icon-edit"></i> 编写文章
      </el-button>
        <el-button type="success" @click="batchPublish" class="action-btn">
        <i class="el-icon-upload"></i> 批量发布
      </el-button>
        <el-button type="info" @click="exportArticles" class="action-btn">
        <i class="el-icon-download"></i> 导出文章
      </el-button>
        <el-button type="warning" @click="showTemplateDialog = true" class="action-btn">
          <i class="el-icon-document-copy"></i> 文章模板
        </el-button>
      </div>
      <div class="action-right" v-if="selectedArticles.length > 0">
        <span class="selected-count">已选择 {{ selectedArticles.length }} 项</span>
        <el-button size="small" @click="batchToggleStatus('published')">批量发布</el-button>
        <el-button size="small" @click="batchToggleStatus('draft')">批量下架</el-button>
        <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-header">
        <div class="filter-title">
          <i class="el-icon-filter"></i>
          <span>筛选条件</span>
        </div>
        <div class="filter-actions">
          <el-button type="primary" @click="searchArticles">
            <i class="el-icon-search"></i>
            搜索
          </el-button>
          <el-button @click="resetFilters">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </div>
      </div>
      
      <div class="filter-content">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-circle-check"></i>
                <span>发布状态</span>
              </div>
              <el-select v-model="filters.status" placeholder="请选择发布状态" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="已发布" value="published"></el-option>
                <el-option label="草稿" value="draft"></el-option>
                <el-option label="待审核" value="pending"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-folder"></i>
                <span>文章分类</span>
              </div>
              <el-select v-model="filters.category" placeholder="请选择文章分类" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="酒店推荐" value="hotel"></el-option>
                <el-option label="景点介绍" value="attraction"></el-option>
                <el-option label="美食攻略" value="food"></el-option>
                <el-option label="旅游攻略" value="guide"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-location"></i>
                <span>地区</span>
              </div>
              <el-select v-model="filters.region" placeholder="请选择地区" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="华北" value="华北"></el-option>
                <el-option label="华东" value="华东"></el-option>
                <el-option label="华南" value="华南"></el-option>
                <el-option label="西南" value="西南"></el-option>
                <el-option label="西北" value="西北"></el-option>
                <el-option label="东北" value="东北"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-search"></i>
                <span>搜索关键词</span>
              </div>
              <el-input
                v-model="filters.keyword"
                placeholder="请输入文章标题或内容"
                prefix-icon="el-icon-search"
                clearable
                @input="handleSearchInput">
              </el-input>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <!-- 骨架屏 -->
      <div v-if="loading" class="skeleton-container">
        <el-card v-for="n in 5" :key="n" class="skeleton-card" shadow="hover">
          <el-skeleton :rows="3" animated />
        </el-card>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredArticles.length === 0" class="empty-state">
        <el-empty description="暂无文章数据">
          <el-button type="primary" @click="showCreateDialog = true">创建第一篇文章</el-button>
        </el-empty>
      </div>

      <!-- 文章表格 -->
      <el-table 
        v-else 
        :data="filteredArticles" 
        stripe 
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f8f9fa', color: '#495057', fontWeight: '600', textAlign: 'center' }"
        :cell-style="{ padding: '16px 12px', textAlign: 'center' }"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="文章标题" min-width="250" align="center">
          <template slot-scope="scope">
            <div class="article-info">
              <el-image 
                :src="scope.row.coverImage || '/src/assets/images/travel.jpg'" 
                class="article-cover"
                :preview-src-list="[scope.row.coverImage || '/src/assets/images/travel.jpg']"
                fit="cover">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div class="article-details">
                <div class="article-title">{{ scope.row.title }}</div>
                <div class="article-meta">
                  <el-tag :type="getCategoryTagType(scope.row.category)" size="mini">
                    {{ getCategoryName(scope.row.category) }}
                  </el-tag>
                  <el-tag v-if="scope.row.region" size="mini" type="info">{{ scope.row.region }}</el-tag>
                  <el-tag v-if="scope.row.featured" size="mini" type="success">精选</el-tag>
                  <el-tag v-for="(tag, index) in scope.row.tagList" :key="`${scope.row.id}-tag-${index}`" size="mini" type="warning">{{ tag }}</el-tag>
                </div>
                <div class="article-excerpt">{{ scope.row.summary || scope.row.excerpt }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="100"></el-table-column>
        <el-table-column prop="views" label="阅读量" width="100">
          <template slot-scope="scope">
            <span class="stat-number">{{ scope.row.views || scope.row.viewCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞数" width="100">
          <template slot-scope="scope">
            <span class="stat-number">{{ scope.row.likes || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="评论数" width="100">
          <template slot-scope="scope">
            <span class="stat-number">{{ scope.row.comments || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template slot-scope="scope">
            <span class="publish-time">{{ scope.row.publishTime || '未发布' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button size="mini" @click="editArticle(scope.row)" class="action-btn edit-btn">
                <i class="el-icon-edit"></i> 编辑
            </el-button>
              <el-button size="mini" type="success" @click="viewArticle(scope.row)" class="action-btn preview-btn">
                <i class="el-icon-view"></i> 预览
              </el-button>
              <el-button size="mini" type="warning" @click="toggleStatus(scope.row)" class="action-btn status-btn">
                <i class="el-icon-upload2"></i> {{ scope.row.status === 'published' ? '下架' : '发布' }}
              </el-button>
              <el-button size="mini" type="info" @click="copyArticle(scope.row)" class="action-btn copy-btn">
                <i class="el-icon-document-copy"></i> 复制
              </el-button>
              <el-button size="mini" type="danger" @click="deleteArticle(scope.row)" class="action-btn delete-btn">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </div>
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
    <el-dialog 
      :title="isEdit ? '编辑文章' : '编写文章'" 
      :visible.sync="showCreateDialog" 
      width="1200px" 
      top="3vh"
      class="article-dialog"
      :close-on-click-modal="false">
      <div class="dialog-content">
        <el-form :model="articleForm" :rules="articleRules" ref="articleForm" label-width="120px" class="article-form">
          <!-- 基本信息区域 -->
          <div class="form-section">
            <div class="section-title">
              <i class="el-icon-document"></i>
              <span>基本信息</span>
            </div>
            <el-row :gutter="24">
              <el-col :span="16">
            <el-form-item label="文章标题" prop="title">
                  <el-input 
                    v-model="articleForm.title" 
                    placeholder="请输入文章标题"
                    size="large"
                    class="title-input">
                  </el-input>
            </el-form-item>
          </el-col>
              <el-col :span="8">
                <el-form-item label="作者" prop="author">
                  <el-input v-model="articleForm.author" placeholder="作者姓名"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="24">
              <el-col :span="8">
            <el-form-item label="文章分类" prop="category">
                  <el-select v-model="articleForm.category" placeholder="选择分类" style="width: 100%">
                <el-option label="酒店推荐" value="hotel"></el-option>
                <el-option label="景点介绍" value="attraction"></el-option>
                <el-option label="美食攻略" value="food"></el-option>
                <el-option label="旅游攻略" value="guide"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
              <el-col :span="8">
                <el-form-item label="地区">
                  <el-select v-model="articleForm.region" placeholder="选择地区" style="width: 100%">
                    <el-option label="华北" value="华北"></el-option>
                    <el-option label="华东" value="华东"></el-option>
                    <el-option label="华南" value="华南"></el-option>
                    <el-option label="西南" value="西南"></el-option>
                    <el-option label="西北" value="西北"></el-option>
                    <el-option label="东北" value="东北"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="精选文章">
                  <el-switch 
                    v-model="articleForm.featured" 
                    active-text="是" 
                    inactive-text="否"
                    active-color="#13ce66"
                    inactive-color="#ff4949">
                  </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
          </div>
          
          <!-- 内容设置区域 -->
          <div class="form-section">
            <div class="section-title">
              <i class="el-icon-picture"></i>
              <span>内容设置</span>
            </div>
        
        <el-form-item label="封面图片">
              <div class="upload-container">
          <el-upload
            class="cover-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            :before-upload="beforeCoverUpload"
            :loading="uploadLoading"
            accept="image/jpeg,image/jpg,image/png"
            drag>
            <img v-if="articleForm.coverImage" :src="articleForm.coverImage" class="cover-image">
            <div v-else-if="uploadLoading" class="upload-loading">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
              <div class="loading-text">
                <p class="loading-title">正在上传...</p>
                <p class="loading-subtitle">请稍候，图片处理中</p>
              </div>
            </div>
            <div v-else class="upload-placeholder" @click="triggerFileInput">
              <div class="upload-icon-wrapper">
                <i class="el-icon-plus upload-icon"></i>
              </div>
              <div class="upload-text-wrapper">
                <p class="upload-text">点击上传封面图片</p>
                <p class="upload-tip">建议尺寸：1200x630px，支持JPG、PNG格式</p>
              </div>
            </div>
          </el-upload>
              </div>
            </el-form-item>
            
            <el-form-item label="文章摘要">
              <el-input 
                type="textarea" 
                v-model="articleForm.summary" 
                :rows="4" 
                placeholder="请输入文章摘要，简要描述文章内容..."
                maxlength="200"
                show-word-limit
                resize="none" 
                class="fixed-textarea">
              </el-input>
        </el-form-item>
        
        <el-form-item label="关联套餐">
              <el-select 
                v-model="articleForm.relatedProducts" 
                multiple 
                placeholder="选择相关套餐"
                style="width: 100%"
                collapse-tags>
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id">
            </el-option>
          </el-select>
        </el-form-item>
          </div>
          
          <!-- 文章内容区域 -->
          <div class="form-section">
            <div class="section-title">
              <i class="el-icon-edit-outline"></i>
              <span>文章内容</span>
            </div>
            
            <el-form-item prop="content">
          <div class="editor-container">
            <div class="editor-toolbar">
                  <div class="toolbar-group">
                    <span class="toolbar-label">格式化工具：</span>
                    <div class="toolbar-buttons">
                      <el-button size="mini" @click="insertText('**', '**')" title="粗体" class="toolbar-btn">
                        <i class="el-icon-bold"></i>
                        <span>粗体</span>
                      </el-button>
                      <el-button size="mini" @click="insertText('*', '*')" title="斜体" class="toolbar-btn">
                        <i class="el-icon-italic"></i>
                        <span>斜体</span>
                      </el-button>
                      <el-button size="mini" @click="insertText('# ', '')" title="标题" class="toolbar-btn">
                        <i class="el-icon-s-order"></i>
                        <span>标题</span>
                      </el-button>
                      <el-button size="mini" @click="insertText('> ', '')" title="引用" class="toolbar-btn">
                        <i class="el-icon-quote"></i>
                        <span>引用</span>
                      </el-button>
                      <el-button size="mini" @click="insertText('- ', '')" title="列表" class="toolbar-btn">
                        <i class="el-icon-s-unfold"></i>
                        <span>列表</span>
                      </el-button>
                      <el-button size="mini" @click="insertText('[链接文字](', ')')" title="链接" class="toolbar-btn">
                        <i class="el-icon-link"></i>
                        <span>链接</span>
                      </el-button>
                    </div>
                  </div>
            </div>
            <el-input
              type="textarea"
              v-model="articleForm.content"
                  :rows="12"
                  placeholder="请输入文章内容，支持Markdown格式..."
                  class="content-textarea fixed-textarea"
                  resize="none">
            </el-input>
            <div class="editor-preview" v-if="articleForm.content">
                  <div class="preview-header">
                    <i class="el-icon-view"></i>
                    <span>预览效果</span>
                  </div>
              <div class="preview-content" v-html="renderMarkdown(articleForm.content)"></div>
            </div>
          </div>
        </el-form-item>
          </div>
          
          <!-- 标签和SEO区域 -->
          <div class="form-section">
            <div class="section-title">
              <i class="el-icon-price-tag"></i>
              <span>标签与SEO</span>
            </div>
            
            <el-form-item label="文章标签">
              <div class="tag-input-container">
                <el-input 
                  v-model="tagInput" 
                  placeholder="输入标签后按回车添加" 
                  @keyup.enter.native="addTag"
                  class="tag-input">
            <template slot="append">
                    <el-button @click="addTag" type="primary">添加</el-button>
            </template>
          </el-input>
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in articleForm.tags"
              :key="`form-tag-${index}`"
              closable
              @close="removeTag(tag)"
                    class="tag-item"
                    type="info">
              {{ tag }}
            </el-tag>
                </div>
          </div>
        </el-form-item>
        
        <el-form-item label="SEO设置">
              <div class="seo-container">
                <div class="seo-row">
                  <el-form-item label="SEO标题" class="seo-form-item">
                    <el-input 
                      v-model="articleForm.seoTitle" 
                      placeholder="SEO标题，建议60字符以内"
                      maxlength="60"
                      show-word-limit>
                    </el-input>
        </el-form-item>
                </div>
                <div class="seo-row">
                  <el-form-item label="SEO关键词" class="seo-form-item">
                    <el-input 
                      v-model="articleForm.seoKeywords" 
                      placeholder="SEO关键词，用逗号分隔"
                      maxlength="100"
                      show-word-limit>
                    </el-input>
                  </el-form-item>
                </div>
                <div class="seo-row">
                  <el-form-item label="SEO描述" class="seo-form-item">
                    <el-input 
                      v-model="articleForm.seoDescription" 
                      type="textarea"
                      :rows="3"
                      placeholder="SEO描述，建议160字符以内"
                      maxlength="160"
                      show-word-limit
                      resize="none" 
                      class="fixed-textarea">
                    </el-input>
                  </el-form-item>
                </div>
              </div>
            </el-form-item>
          </div>
      </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <div class="footer-left">
          <el-button @click="showCreateDialog = false" size="medium">
            <i class="el-icon-close"></i> 取消
          </el-button>
        </div>
        <div class="footer-right">
          <el-button @click="saveDraft" size="medium" type="info">
            <i class="el-icon-document"></i> 保存草稿
          </el-button>
          <el-button type="primary" @click="publishArticle" size="medium">
            <i class="el-icon-upload2"></i> 发布文章
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 文章预览对话框 -->
    <el-dialog 
      title="文章预览" 
      :visible.sync="showPreviewDialog" 
      width="900px" 
      top="5vh"
      class="preview-dialog">
      <div v-if="previewArticle" class="article-preview">
        <!-- 文章头部信息 -->
        <div class="preview-header">
          <h1 class="preview-title">{{ previewArticle.title }}</h1>
          <div class="preview-meta">
            <div class="meta-item">
              <i class="el-icon-user"></i>
              <span>作者：{{ previewArticle.author }}</span>
          </div>
            <div class="meta-item">
              <i class="el-icon-collection-tag"></i>
              <span>{{ getCategoryName(previewArticle.category) }}</span>
            </div>
            <div class="meta-item">
              <i class="el-icon-time"></i>
              <span>{{ previewArticle.publishTime || '未发布' }}</span>
            </div>
          </div>
          <div class="preview-tags" v-if="previewArticle.tagList && previewArticle.tagList.length">
            <el-tag
              v-for="(tag, index) in previewArticle.tagList"
              :key="`preview-tag-${index}`"
              size="small"
              class="tag-item"
              type="info">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <!-- 封面图片 -->
        <div class="preview-cover" v-if="previewArticle.coverImage">
          <el-image 
            :src="previewArticle.coverImage" 
            alt="封面图片"
            fit="cover"
            class="cover-image">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </div>
        
        <!-- 文章摘要 -->
        <div class="preview-summary" v-if="previewArticle.summary">
          <div class="summary-label">
            <i class="el-icon-document"></i>
            <span>文章摘要</span>
          </div>
          <p class="summary-content">{{ previewArticle.summary }}</p>
        </div>
        
        <!-- 文章内容 -->
        <div class="preview-content">
          <div class="content-label">
            <i class="el-icon-edit-outline"></i>
            <span>文章内容</span>
          </div>
          <div class="content-body" v-html="renderMarkdown(previewArticle.content)"></div>
        </div>
        
        <!-- 相关套餐 -->
        <div class="preview-related" v-if="previewArticle.relatedPackages && previewArticle.relatedPackages.length">
          <div class="related-label">
            <i class="el-icon-goods"></i>
            <span>相关套餐</span>
          </div>
          <div class="related-products">
            <div
              v-for="pkg in previewArticle.relatedPackages"
              :key="pkg.id"
              class="related-product">
              <i class="el-icon-link"></i>
              {{ pkg.packageName || getProductName(pkg.productId) }}
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <div class="footer-left">
          <el-button @click="showPreviewDialog = false" size="medium">
            <i class="el-icon-close"></i> 关闭
          </el-button>
        </div>
        <div class="footer-right">
          <el-button type="primary" @click="editArticle(previewArticle)" size="medium">
            <i class="el-icon-edit"></i> 编辑文章
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 文章模板对话框 -->
    <el-dialog title="文章模板" :visible.sync="showTemplateDialog" width="600px">
      <div class="template-content">
        <el-alert
          title="模板说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;">
          <p>选择模板可以快速创建文章，模板包含预设的结构和内容框架</p>
        </el-alert>
        
        <div class="template-list">
          <el-card 
            v-for="template in articleTemplates" 
            :key="template.id" 
            class="template-card" 
            shadow="hover"
            @click.native="useTemplate(template)">
            <div class="template-info">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-tags">
                <el-tag size="mini" v-for="(tag, index) in template.tags" :key="`template-${template.id}-tag-${index}`">{{ tag }}</el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showTemplateDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { articleApi, articleTemplateApi, productApi, fileUploadApi } from '@/components/common/article-api-service'

export default {
  name: 'ArticleManagement',
  data() {
    return {
      loading: false,
      showCreateDialog: false,
      showPreviewDialog: false,
      showTemplateDialog: false,
      isEdit: false,
      filters: {
        status: '',
        category: '',
        region: '',
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selectedArticles: [],
      stats: {
        totalArticles: 0,
        publishedArticles: 0,
        totalViews: 0,
        totalLikes: 0
      },
      searchTimer: null,
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
        region: '',
        featured: false,
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
      products: [],
      articleTemplates: [],
      articles: [],
      uploadLoading: false
    }
  },
  async created() {
    await this.loadData();
  },
  computed: {
    filteredArticles() {
      return this.articles;
    }
  },
  watch: {
    pagination: {
      handler() {
        this.loadArticles();
      },
      deep: true
    }
  },
  methods: {
    // 加载初始数据
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadArticles(),
          this.loadProducts(),
          this.loadTemplates(),
          this.loadStats()
        ]);
      } catch (error) {
        console.error('加载数据失败:', error);
        this.$message.error('加载数据失败');
      } finally {
        this.loading = false;
      }
    },

    // 加载文章列表
    async loadArticles() {
      try {
        const params = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize,
          keyword: this.filters.keyword,
          category: this.filters.category,
          status: this.filters.status,
          region: this.filters.region
        };
        
        const result = await articleApi.getArticlePage(params);
        this.articles = result.records || [];
        this.pagination.total = result.total || 0;
      } catch (error) {
        console.error('加载文章列表失败:', error);
        this.$message.error('加载文章列表失败');
      }
    },

    // 加载产品列表
    async loadProducts() {
      try {
        const result = await productApi.getProductList();
        this.products = result || [];
      } catch (error) {
        console.error('加载产品列表失败:', error);
        // 使用默认数据
        this.products = [
          { id: 1, name: '豪华海景套房' },
          { id: 2, name: '三亚三日游' },
          { id: 3, name: '故宫门票' }
        ];
      }
    },

    // 加载模板列表
    async loadTemplates() {
      try {
        const result = await articleTemplateApi.getAllActiveTemplates();
        this.articleTemplates = result || [];
      } catch (error) {
        console.error('加载模板列表失败:', error);
        // 使用默认数据
        this.articleTemplates = [
          {
            id: 1,
            name: '酒店推荐模板',
            description: '适用于酒店推荐类文章，包含酒店介绍、设施、服务等结构',
            category: 'hotel',
            tags: ['酒店', '推荐', '住宿'],
            content: `# {{酒店名称}} - 完美度假体验

## 酒店概览
{{酒店简介}}

## 地理位置
{{地理位置优势}}

## 客房设施
- 豪华客房
- 海景套房
- 行政楼层

## 酒店设施
- 游泳池
- 健身房
- 餐厅
- 会议室

## 服务特色
{{服务亮点}}

## 预订信息
{{预订方式}}`
          }
        ];
      }
    },

    // 加载统计数据
    async loadStats() {
      try {
        const result = await articleApi.getArticleStatistics();
        this.stats = {
          totalArticles: result.totalArticles || 0,
          publishedArticles: result.publishedArticles || 0,
          totalViews: result.totalViews || 0,
          totalLikes: result.totalLikes || 0
        };
      } catch (error) {
        console.error('加载统计数据失败:', error);
        this.updateStats();
      }
    },

    updateStats() {
      this.stats.totalArticles = this.articles.length;
      this.stats.publishedArticles = this.articles.filter(a => a.status === 'published').length;
      this.stats.totalViews = this.articles.reduce((sum, a) => sum + (a.views || a.viewCount || 0), 0);
      this.stats.totalLikes = this.articles.reduce((sum, a) => sum + (a.likes || 0), 0);
    },

    handleSearchInput() {
      // 实时搜索防抖
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.searchArticles();
      }, 300);
    },

    handleSelectionChange(selection) {
      this.selectedArticles = selection;
    },

    async batchToggleStatus(status) {
      if (this.selectedArticles.length === 0) {
        this.$message.warning('请先选择文章');
        return;
      }
      
      const action = status === 'published' ? '发布' : '下架';
      this.$confirm(`确定要${action}选中的 ${this.selectedArticles.length} 篇文章吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const articleIds = this.selectedArticles.map(article => article.id);
          await articleApi.batchUpdateStatus({
            articleIds: articleIds,
            status: status
          });
          
          await this.loadArticles();
          await this.loadStats();
          this.$message.success(`批量${action}成功`);
          this.selectedArticles = [];
        } catch (error) {
          console.error(`批量${action}失败:`, error);
          this.$message.error(`批量${action}失败`);
        }
      });
    },

    batchDelete() {
      if (this.selectedArticles.length === 0) {
        this.$message.warning('请先选择文章');
        return;
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedArticles.length} 篇文章吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const articleIds = this.selectedArticles.map(article => article.id);
          await articleApi.batchDeleteArticles(articleIds);
          
          await this.loadArticles();
          await this.loadStats();
          this.$message.success('批量删除成功');
          this.selectedArticles = [];
        } catch (error) {
          console.error('批量删除失败:', error);
          this.$message.error('批量删除失败');
        }
      });
    },

    async copyArticle(article) {
      try {
        const copyArticle = await articleApi.copyArticle(article.id);
        if (copyArticle) {
          this.articleForm = { ...copyArticle };
          
          // 处理标签数据：从tagList映射到tags
          if (copyArticle.tagList && Array.isArray(copyArticle.tagList)) {
            this.articleForm.tags = copyArticle.tagList;
          } else {
            this.articleForm.tags = [];
          }
          
          // 处理关联产品
          if (copyArticle.relatedPackages && copyArticle.relatedPackages.length > 0) {
            this.articleForm.relatedProducts = copyArticle.relatedPackages.map(pkg => pkg.productId);
          }
          this.isEdit = false;
          this.showCreateDialog = true;
          this.$message.info('文章信息已复制，请修改后保存');
          await this.loadArticles();
        }
      } catch (error) {
        console.error('复制文章失败:', error);
        this.$message.error('复制文章失败');
      }
    },

    async searchArticles() {
      this.pagination.currentPage = 1;
      await this.loadArticles();
    },
    
    async resetFilters() {
      this.filters = {
        status: '',
        category: '',
        region: '',
        keyword: ''
      };
      this.pagination.currentPage = 1;
      await this.loadArticles();
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
    
    processImageUrl(url) {
      if (!url || !url.trim()) {
        return '';
      }
      
      const trimmedUrl = url.trim();
      
      // 如果是完整的HTTP/HTTPS URL，直接返回
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
      }
      
      // 如果是base64图片，直接返回
      if (trimmedUrl.startsWith('data:image/')) {
        return trimmedUrl;
      }
      
      // 清理双斜杠问题
      let cleanUrl = trimmedUrl.replace(/\/+/g, '/');
      
      // 如果是相对路径，添加服务器基础路径
      if (cleanUrl.startsWith('/')) {
        const baseUrl = 'http://localhost:8086/travelManagementSystem';
        return baseUrl + cleanUrl;
      } else {
        return `http://localhost:8086/travelManagementSystem/${cleanUrl}`;
      }
    },
    
    async editArticle(article) {
      try {
        const articleDetail = await articleApi.getArticleDetail(article.id);
        this.isEdit = true;
        this.articleForm = { ...articleDetail };
        
        // 处理图片URL，确保能正确显示
        if (articleDetail.coverImage) {
          this.articleForm.coverImage = this.processImageUrl(articleDetail.coverImage);
        }
        
        // 处理标签数据：从tagList映射到tags
        if (articleDetail.tagList && Array.isArray(articleDetail.tagList)) {
          this.articleForm.tags = articleDetail.tagList;
        } else {
          this.articleForm.tags = [];
        }
        
        // 处理关联产品
        if (articleDetail.relatedPackages && articleDetail.relatedPackages.length > 0) {
          this.articleForm.relatedProducts = articleDetail.relatedPackages.map(pkg => pkg.productId);
        }
        this.showCreateDialog = true;
        this.showPreviewDialog = false;
      } catch (error) {
        console.error('获取文章详情失败:', error);
        this.$message.error('获取文章详情失败');
      }
    },
    
    viewArticle(article) {
      this.previewArticle = article;
      this.showPreviewDialog = true;
    },
    
    async toggleStatus(article) {
      try {
        if (article.status === 'published') {
          await articleApi.unpublishArticle(article.id);
          article.status = 'draft';
          this.$message.success('文章已下架');
        } else {
          await articleApi.publishArticle(article.id);
          article.status = 'published';
          article.publishTime = new Date().toLocaleString();
          this.$message.success('文章已发布');
        }
        await this.loadStats();
      } catch (error) {
        console.error('切换文章状态失败:', error);
        this.$message.error('切换文章状态失败');
      }
    },
    
    deleteArticle(article) {
      this.$confirm('确定要删除这篇文章吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await articleApi.deleteArticle(article.id);
          await this.loadArticles();
          await this.loadStats();
          this.$message.success('删除成功');
        } catch (error) {
          console.error('删除文章失败:', error);
          this.$message.error('删除文章失败');
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
    
    async handleFileChange(file) {
      console.log('handleFileChange 被调用:', file);
      
      if (!file.raw) {
        console.log('没有文件数据');
        return;
      }
      
      console.log('文件信息:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // 验证文件
      if (!this.beforeCoverUpload(file.raw)) {
        console.log('文件验证失败');
        return;
      }
      
      this.uploadLoading = true;
      
      try {
        // 先显示预览
        this.articleForm.coverImage = URL.createObjectURL(file.raw);
        
        // 上传到服务器
        const response = await fileUploadApi.uploadFile(
          file.raw, 
          'article', 
          this.articleForm.id || 0
        );
        
        console.log('上传响应:', response);
        console.log('响应数据结构:', {
          response: response,
          data: response?.data,
          url: response?.data?.url,
          fileUrl: response?.data?.fileUrl,
          message: response?.data?.message
        });
        
        if (response) {
          // 尝试多种可能的响应格式
          let imageUrl = null;
          
          if (response.data) {
            // 标准格式：response.data.url 或 response.data.fileUrl
            imageUrl = response.data.url || response.data.fileUrl || response.data.data?.url;
          } else if (response.url) {
            // 直接返回URL（这是当前服务器的格式）
            imageUrl = response.url;
          } else if (typeof response === 'string') {
            // 直接返回字符串URL
            imageUrl = response;
          }
          
          if (imageUrl) {
            this.articleForm.coverImage = imageUrl;
            this.$message.success('封面图片上传成功');
          } else {
            // 如果找不到URL，但上传成功，保持预览图片
            console.log('未找到图片URL，保持预览状态');
            this.$message.success('图片上传成功（使用预览）');
          }
        } else {
          throw new Error('上传响应为空');
        }
      } catch (error) {
        console.error('图片上传失败:', error);
        this.$message.error('图片上传失败，请重试');
        // 上传失败时清除预览
        this.articleForm.coverImage = '';
      } finally {
        this.uploadLoading = false;
      }
    },
    
    beforeCoverUpload(file) {
      console.log('beforeCoverUpload 被调用:', file);
      
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
      const isLt5M = file.size / 1024 / 1024 < 5;
      
      console.log('文件验证结果:', {
        type: file.type,
        size: file.size,
        isJPG,
        isLt5M
      });
      
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!');
        return false;
      }
      if (!isLt5M) {
        this.$message.error('上传图片大小不能超过 5MB!');
        return false;
      }
      
      return true;
    },
    
    cleanArticleData(article) {
      // 清理图片URL - 如果是blob URL，清空让服务器处理
      if (article.coverImage && article.coverImage.startsWith('blob:')) {
        console.log('检测到blob URL，清空图片字段:', article.coverImage);
        article.coverImage = '';
      }
      
      // 确保必要字段存在
      if (!article.id && this.isEdit) {
        console.warn('编辑模式下缺少文章ID');
      }
      
      // 确保字符串字段不为null
      article.title = article.title || '';
      article.author = article.author || '';
      article.summary = article.summary || '';
      article.content = article.content || '';
      article.category = article.category || '';
      article.region = article.region || '';
      
      // 确保布尔字段
      article.featured = Boolean(article.featured);
      
      // 确保数组字段
      article.tagList = Array.isArray(article.tagList) ? article.tagList : [];
      article.relatedProducts = Array.isArray(article.relatedProducts) ? article.relatedProducts : [];
      
      // 清理SEO字段
      article.seoTitle = article.seoTitle || '';
      article.seoKeywords = article.seoKeywords || '';
      article.seoDescription = article.seoDescription || '';
      
      // 移除可能引起问题的字段
      delete article.createTime;
      delete article.updateTime;
      delete article.publishTime;
      delete article.views;
      delete article.likes;
      delete article.comments;
      delete article.relatedPackages;
      
      // 确保ID字段是数字类型
      if (article.id) {
        article.id = parseInt(article.id);
      }
      
      console.log('数据清理完成:', article);
    },
    
    triggerFileInput() {
      console.log('triggerFileInput 被调用');
      // 触发文件选择对话框
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log('通过点击选择的文件:', file);
          this.handleFileChange({ raw: file, name: file.name, size: file.size });
        }
      };
      input.click();
    },
    
    async saveDraft() {
      this.$refs.articleForm.validate(async (valid) => {
        if (valid) {
          try {
            const article = { ...this.articleForm };
            article.status = 'draft';
            
            // 数据清理和验证
            this.cleanArticleData(article);
            
            // 确保标签数据格式正确
            if (article.tags && Array.isArray(article.tags)) {
              article.tagList = article.tags;
              delete article.tags; // 删除tags字段，使用tagList
            }
            
            // 统一使用包装格式
            let requestData = {
              article: article,
              productIds: this.articleForm.relatedProducts || []
            };
            
            if (this.isEdit) {
              console.log('编辑模式 - 包装格式:', requestData);
            } else {
              console.log('创建模式 - 包装格式:', requestData);
            }
            
            console.log('保存草稿请求数据:', requestData);
            
            if (this.isEdit) {
              await articleApi.updateArticle(requestData);
            } else {
              await articleApi.createArticle(requestData);
            }
            
            this.showCreateDialog = false;
            this.$message.success('草稿保存成功');
            this.resetForm();
            await this.loadArticles();
            await this.loadStats();
          } catch (error) {
            console.error('保存草稿失败:', error);
            
            // 显示更详细的错误信息
            let errorMessage = '保存草稿失败';
            if (error.response && error.response.data) {
              const errorData = error.response.data;
              errorMessage = errorData.msg || errorData.message || errorMessage;
              console.error('服务器错误详情:', errorData);
            }
            
            this.$message.error(errorMessage);
          }
        }
      });
    },
    
    async publishArticle() {
      this.$refs.articleForm.validate(async (valid) => {
        if (valid) {
          try {
            const article = { ...this.articleForm };
            article.status = 'published';
            
            // 数据清理和验证
            this.cleanArticleData(article);
            
            // 确保标签数据格式正确
            if (article.tags && Array.isArray(article.tags)) {
              article.tagList = article.tags;
              delete article.tags; // 删除tags字段，使用tagList
            }
            
            // 统一使用包装格式
            let requestData = {
              article: article,
              productIds: this.articleForm.relatedProducts || []
            };
            
            if (this.isEdit) {
              console.log('编辑模式 - 包装格式:', requestData);
            } else {
              console.log('创建模式 - 包装格式:', requestData);
            }
            
            console.log('发布文章请求数据:', requestData);
            console.log('文章数据详情:', {
              id: article.id,
              title: article.title,
              category: article.category,
              author: article.author,
              coverImage: article.coverImage,
              summary: article.summary,
              content: article.content,
              tagList: article.tagList,
              relatedProducts: article.relatedProducts,
              region: article.region,
              featured: article.featured,
              status: article.status
            });
            
            if (this.isEdit) {
              await articleApi.updateArticle(requestData);
            } else {
              await articleApi.createArticle(requestData);
            }
            
            this.showCreateDialog = false;
            this.$message.success('文章发布成功');
            this.resetForm();
            await this.loadArticles();
            await this.loadStats();
          } catch (error) {
            console.error('发布文章失败:', error);
            
            // 显示更详细的错误信息
            let errorMessage = '发布文章失败';
            if (error.response && error.response.data) {
              const errorData = error.response.data;
              errorMessage = errorData.msg || errorData.message || errorMessage;
              console.error('服务器错误详情:', errorData);
            }
            
            this.$message.error(errorMessage);
          }
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
        region: '',
        featured: false,
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

    useTemplate(template) {
      this.articleForm = {
        title: '',
        category: template.category,
        author: '',
        coverImage: '',
        summary: '',
        content: template.content,
        tags: template.tagList || template.tags || [],
        relatedProducts: [],
        region: '',
        featured: false,
        seoTitle: '',
        seoKeywords: '',
        seoDescription: ''
      };
      this.showTemplateDialog = false;
      this.showCreateDialog = true;
      this.$message.success('模板已应用，请完善文章内容');
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    }
  }
}
</script>

<style scoped>
.article-management {
  padding: 24px;
  min-height: 100vh;
}


.page-header {
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.title {
  font-size: 28px;
  color: #1f2d3d;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #8492a6;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}

/* 统计面板样式 */
.stats-panel {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 26px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.published {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.views {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.likes {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #8492a6;
  font-weight: 500;
}

/* 操作栏样式 */
.action-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-buttons-row {
  display: flex;
  width: 100%;
  gap: 0;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  flex: 1;
  margin: 0 !important;
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  min-height: 44px;
  font-size: 14px;
}

.action-btn:not(:last-child) {
  margin-right: 12px !important;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn i {
  font-size: 16px;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  color: #409eff;
  font-weight: 600;
  font-size: 14px;
  background: #f0f9ff;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.filter-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
}

.article-list {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 骨架屏样式 */
.skeleton-container {
  padding: 24px;
}

.skeleton-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
  justify-content: center;
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.article-cover {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}

.article-details {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.article-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2d3d;
  font-size: 15px;
  line-height: 1.4;
  text-align: center;
  width: 100%;
}

.article-meta {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.article-meta .el-tag {
  margin: 0;
  border-radius: 20px;
  padding: 4px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
}

.article-excerpt {
  margin-top: 8px;
  color: #8492a6;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-align: center;
  width: 100%;
}

.stat-number {
  font-weight: 600;
  color: #409eff;
}

/* 发布时间样式 */
.publish-time {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
  line-height: 1.4;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
}

.action-btn {
  margin: 0 !important;
  padding: 6px 10px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  min-width: auto !important;
  height: 28px !important;
  line-height: 1 !important;
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.action-btn i {
  margin-right: 4px;
  font-size: 12px;
}

/* 按钮类型样式 */
.edit-btn {
  background: #f8f9fa !important;
  color: #495057 !important;
  border-color: #dee2e6 !important;
}

.edit-btn:hover {
  background: #e9ecef !important;
  border-color: #adb5bd !important;
}

.preview-btn {
  background: #28a745 !important;
  border-color: #28a745 !important;
}

.preview-btn:hover {
  background: #218838 !important;
  border-color: #1e7e34 !important;
}

.status-btn {
  background: #ffc107 !important;
  color: #212529 !important;
  border-color: #ffc107 !important;
}

.status-btn:hover {
  background: #e0a800 !important;
  border-color: #d39e00 !important;
}

.copy-btn {
  background: #17a2b8 !important;
  border-color: #17a2b8 !important;
}

.copy-btn:hover {
  background: #138496 !important;
  border-color: #117a8b !important;
}

.delete-btn {
  background: #dc3545 !important;
  border-color: #dc3545 !important;
}

.delete-btn:hover {
  background: #c82333 !important;
  border-color: #bd2130 !important;
}

.pagination {
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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

/* 预览弹窗样式 */
.preview-dialog .el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.preview-dialog .el-dialog__header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 20px 24px;
  border-bottom: none;
}

.preview-dialog .el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.preview-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.preview-dialog .el-dialog__body {
  padding: 0;
  background: #f8f9fa;
  max-height: 70vh;
  overflow-y: auto;
}

.article-preview {
  padding: 24px;
  background: white;
  margin: 0;
}

/* 预览头部 */
.preview-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e1e6eb;
}

.preview-title {
  font-size: 24px;
  color: #1f2d3d;
  margin-bottom: 20px;
  line-height: 1.4;
  font-weight: 700;
  text-align: center;
}

.preview-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #e1e6eb;
}

.meta-item i {
  color: #409eff;
  font-size: 14px;
}

.preview-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-item {
  margin: 0;
  border-radius: 20px;
  padding: 6px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
}

/* 封面图片 */
.preview-cover {
  margin-bottom: 32px;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
  border-radius: 12px;
}

/* 文章摘要 */
.preview-summary {
  background: #f8f9fa;
  border: 1px solid #e1e6eb;
  border-radius: 12px;
  margin-bottom: 32px;
  padding: 20px;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.summary-label i {
  font-size: 16px;
}

.summary-content {
  margin: 0;
  color: #606266;
  font-size: 15px;
  line-height: 1.6;
  font-style: italic;
}

/* 文章内容 */
.preview-content {
  margin-bottom: 32px;
}

.content-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  padding-bottom: 8px;
  border-bottom: 2px solid #e1e6eb;
}

.content-label i {
  font-size: 18px;
  color: #409eff;
}

.content-body {
  color: #2c3e50;
  line-height: 1.8;
  font-size: 15px;
}

/* 相关套餐 */
.preview-related {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
}

.related-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #0369a1;
}

.related-label i {
  font-size: 18px;
}

.related-products {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.related-product {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  color: #0369a1;
  font-size: 14px;
  transition: all 0.3s ease;
  min-height: 32px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
}

.related-product:hover {
  background: #e0f2fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.15);
}

.related-product i {
  font-size: 12px;
}

/* 模板对话框样式 */
.template-content {
  padding: 20px 0;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.template-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.template-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.template-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 弹窗样式 */
.article-dialog .el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.article-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  border-bottom: none;
}

.article-dialog .el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.article-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.article-dialog .el-dialog__body {
  padding: 0;
  background: #f8f9fa;
}

.dialog-content {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.article-form {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e1e6eb;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e1e6eb;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.section-title i {
  margin-right: 8px;
  font-size: 18px;
  color: #667eea;
}

/* 标题输入框 */
.title-input .el-input__inner {
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: 2px solid #e1e6eb;
  transition: all 0.3s ease;
}

.title-input .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 上传组件样式 */
.upload-container {
  display: flex;
  justify-content: center;
}

.cover-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 180px;
  transition: all 0.3s ease;
}

.cover-uploader:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8492a6;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}

.upload-icon-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  font-size: 40px;
  color: #c0c4cc;
  display: block;
  line-height: 1;
}

.upload-text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.upload-text {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  line-height: 1.4;
  text-align: center;
}

.upload-tip {
  margin: 0;
  font-size: 12px;
  color: #c0c4cc;
  line-height: 1.4;
  text-align: center;
  max-width: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* 上传Loading状态样式 */
.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.upload-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
  border-top-color: #3b82f6;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.3s;
  border-top-color: #60a5fa;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.6s;
  border-top-color: #93c5fd;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  text-align: center;
  z-index: 1;
  position: relative;
}

.loading-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  line-height: 1.4;
}

.loading-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  opacity: 0.8;
}

/* 上传组件hover效果优化 */
.cover-uploader:hover .upload-loading {
  border-color: #2563eb;
  background: linear-gradient(135deg, #f0f4ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

/* 上传成功状态 */
.cover-uploader .cover-image {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.cover-uploader:hover .cover-image {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 上传占位符优化 */
.upload-placeholder {
  transition: all 0.3s ease;
}

.cover-uploader:hover .upload-placeholder {
  transform: translateY(-2px);
}

.upload-placeholder .upload-icon {
  transition: all 0.3s ease;
}

.cover-uploader:hover .upload-placeholder .upload-icon {
  transform: scale(1.1);
  color: #3b82f6;
}

.upload-placeholder .upload-text {
  transition: all 0.3s ease;
}

.cover-uploader:hover .upload-placeholder .upload-text {
  color: #3b82f6;
  font-weight: 600;
}

/* 编辑器样式 */
.editor-container {
  border: 1px solid #e1e6eb;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e1e6eb;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-label {
  font-size: 13px;
  color: #8492a6;
  font-weight: 500;
  white-space: nowrap;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  min-width: auto !important;
}

.toolbar-btn i {
  font-size: 14px;
}

.toolbar-btn span {
  font-size: 12px;
}

.content-textarea .el-textarea__inner {
  border: none;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.editor-preview {
  background: white;
  border-top: 1px solid #e1e6eb;
}

.preview-header {
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e1e6eb;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #8492a6;
}

.preview-header i {
  margin-right: 6px;
}

.preview-content {
  padding: 20px;
  line-height: 1.8;
  color: #2c3e50;
}

/* 标签输入样式 */
.tag-input-container {
  width: 100%;
}

.tag-input {
  margin-bottom: 12px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

.tag-item {
  margin: 0;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
}

/* SEO设置样式 */
.seo-container {
  width: 100%;
}

.seo-row {
  margin-bottom: 20px;
}

.seo-row:last-child {
  margin-bottom: 0;
}

.seo-form-item {
  margin-bottom: 0;
}

.seo-form-item .el-form-item__label {
  font-size: 13px;
  font-weight: 500;
  color: #8492a6;
  line-height: 32px;
  padding-bottom: 0;
  width: 100px !important;
  text-align: right;
  padding-right: 12px;
}

.seo-form-item .el-form-item__content {
  line-height: 32px;
  margin-left: 100px !important;
}

.seo-form-item .el-input__inner,
.seo-form-item .el-textarea__inner {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

.seo-form-item .el-input__inner:focus,
.seo-form-item .el-textarea__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 弹窗底部样式 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e1e6eb;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-footer .el-button {
  border-radius: 6px;
  font-weight: 500;
  padding: 10px 20px;
}

.dialog-footer .el-button i {
  margin-right: 6px;
}

/* 表格行悬停效果 */
.el-table tbody tr:hover > td {
  background-color: #f8f9fa !important;
}

/* 强制表格内容居中 */
.el-table td {
  text-align: center !important;
}

.el-table th {
  text-align: center !important;
}

/* 按钮组优化 */
.action-left .el-button {
  transition: all 0.3s ease;
}

.action-left .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 筛选区域优化 */
.filter-section .el-select,
.filter-section .el-input {
  border-radius: 8px;
}

.filter-section .el-button {
  border-radius: 8px;
  font-weight: 500;
}

/* 统计卡片动画 */
.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.stat-card:hover::before {
  left: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-management {
    padding: 16px;
  }
  
  .page-header,
  .action-bar,
  .filter-section,
  .article-list,
  .pagination {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .stats-panel {
    margin-bottom: 16px;
  }
  
  .stats-panel .el-col {
    margin-bottom: 12px;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-buttons-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-btn {
    width: 100%;
    flex: none;
    margin-right: 0 !important;
  }
  
  .action-right {
    width: 100%;
    justify-content: center;
  }
  
  .filter-section .el-col {
    margin-bottom: 12px;
  }
  
  .template-list {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 24px;
  }
  
  .stat-content {
    padding: 16px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  /* 移动端操作按钮优化 */
  .action-buttons {
    gap: 4px;
    justify-content: center;
  }
  
  .action-btn {
    padding: 4px 8px !important;
    font-size: 11px !important;
    height: 24px !important;
  }
  
  .action-btn i {
    margin-right: 2px;
    font-size: 11px;
  }
  
  /* 移动端弹窗优化 */
  .article-dialog .el-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }
  
  .dialog-content {
    padding: 16px;
    max-height: 60vh;
  }
  
  .article-form {
    padding: 16px;
  }
  
  .form-section {
    margin-bottom: 20px;
    padding: 16px;
  }
  
  .section-title {
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .cover-uploader {
    width: 100%;
    height: 150px;
  }
  
  .upload-icon {
    font-size: 24px;
  }
  
  .upload-text {
    font-size: 13px;
  }
  
  .upload-tip {
    font-size: 11px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .footer-left, .footer-right {
    width: 100%;
    justify-content: center;
  }
  
  .footer-right {
    order: -1;
  }
  
  /* 移动端工具栏优化 */
  .toolbar-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .toolbar-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .toolbar-btn {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
  
  .toolbar-btn span {
    display: none;
  }
  
  /* 移动端SEO优化 */
  .seo-row {
    margin-bottom: 16px;
  }
  
  .seo-form-item .el-form-item__label {
    font-size: 12px;
    line-height: 28px;
    width: 80px !important;
    padding-right: 8px;
  }
  
  .seo-form-item .el-form-item__content {
    line-height: 28px;
    margin-left: 80px !important;
  }
  
  /* 移动端上传组件优化 */
  .upload-placeholder {
    padding: 16px;
  }
  
  .upload-icon-wrapper {
    margin-bottom: 16px;
  }
  
  .upload-icon {
    font-size: 32px;
  }
  
  .upload-text {
    font-size: 13px;
  }
  
  .upload-tip {
    font-size: 11px;
  }
  
  /* 移动端Loading状态优化 */
  .loading-spinner {
    width: 50px;
    height: 50px;
    margin-bottom: 16px;
  }
  
  .loading-title {
    font-size: 14px;
  }
  
  .loading-subtitle {
    font-size: 12px;
  }
  
  .upload-loading {
    padding: 16px;
  }
  
  /* 移动端预览弹窗优化 */
  .preview-dialog .el-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }
  
  .article-preview {
    padding: 16px;
  }
  
  .preview-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
  
  .preview-title {
    font-size: 20px;
    margin-bottom: 16px;
  }
  
  .preview-meta {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .meta-item {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .preview-cover {
    margin-bottom: 24px;
  }
  
  .cover-image {
    max-height: 200px;
  }
  
  .preview-summary,
  .preview-content,
  .preview-related {
    margin-bottom: 24px;
    padding: 16px;
  }
  
  .summary-label,
  .content-label,
  .related-label {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .summary-content,
  .content-body {
    font-size: 14px;
  }
  
  .related-products {
    gap: 8px;
  }
  
  .related-product {
    font-size: 13px;
    padding: 6px 12px;
    min-height: 28px;
  }
  
  /* 移动端标签优化 */
  .tag-item {
    padding: 4px 12px;
    min-height: 24px;
    font-size: 12px;
  }
  
  .article-meta .el-tag {
    padding: 3px 10px;
    min-height: 22px;
    font-size: 11px;
  }
}

/* 弹窗输入框固定大小和去掉右下角图标 */
.fixed-textarea .el-textarea__inner {
  resize: none !important;
  width: 100% !important;
  min-height: 80px !important;
  max-height: 80px !important;
}

.fixed-textarea .el-textarea__inner::-webkit-resizer {
  display: none !important;
}

/* 所有弹窗中的输入框 */
.el-dialog .el-input__inner,
.el-dialog .el-textarea__inner {
  width: 100% !important;
  resize: none !important;
}

.el-dialog .el-textarea__inner::-webkit-resizer {
  display: none !important;
}

/* 筛选区域新样式 */
.filter-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.filter-actions .el-button {
  height: 40px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  padding: 0 20px;
  min-width: 100px;
}

.filter-actions .el-button--primary {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.filter-actions .el-button--primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.filter-actions .el-button:not(.el-button--primary) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.filter-actions .el-button:not(.el-button--primary):hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.filter-content {
  padding: 24px;
  background: #fafbfc;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.filter-label i {
  color: #3b82f6;
  font-size: 16px;
}

.filter-item .el-select,
.filter-item .el-input {
  width: 100%;
}

.filter-item .el-input__inner,
.filter-item .el-select .el-input__inner {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.filter-item .el-input__inner:focus,
.filter-item .el-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.filter-item .el-input__inner:hover,
.filter-item .el-select .el-input__inner:hover {
  border-color: #c0c4cc;
  background: white;
}


</style>
