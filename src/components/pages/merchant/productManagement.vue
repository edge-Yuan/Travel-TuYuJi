<template>
  <div class="product-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">产品管理</h1>
      <p class="subtitle">管理您的旅游产品，包括酒店、路线和门票</p>
    </div>

    <!-- 数据统计面板 -->
    <div class="stats-panel">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <i class="el-icon-goods"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalProducts }}</div>
                <div class="stat-label">总产品数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <i class="el-icon-check"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeProducts }}</div>
                <div class="stat-label">在售产品</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon sales">
                <i class="el-icon-s-data"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalSales }}</div>
                <div class="stat-label">总销量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon revenue">
                <i class="el-icon-money"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ stats.totalRevenue }}</div>
                <div class="stat-label">总收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <i class="el-icon-plus"></i> 创建产品
        </el-button>
        <el-button type="success" @click="showPromotionDialog = true">
          <i class="el-icon-present"></i> 设置优惠活动
        </el-button>
        <el-button type="info" @click="exportData">
          <i class="el-icon-download"></i> 导出数据
        </el-button>
        <el-button type="warning" @click="importData">
          <i class="el-icon-upload2"></i> 导入数据
        </el-button>
      </div>
      <div class="action-right" v-if="selectedProducts.length > 0">
        <span class="selected-count">已选择 {{ selectedProducts.length }} 项</span>
        <el-button size="small" @click="batchToggleStatus('active')">批量上架</el-button>
        <el-button size="small" @click="batchToggleStatus('inactive')">批量下架</el-button>
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
          <el-button type="primary" @click="searchProducts">
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
          <el-col :span="6">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-goods"></i>
                <span>产品类型</span>
              </div>
              <el-select v-model="filters.type" placeholder="请选择产品类型" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="酒店客房" value="hotel"></el-option>
                <el-option label="旅行路线" value="route"></el-option>
                <el-option label="门票" value="ticket"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-circle-check"></i>
                <span>产品状态</span>
              </div>
              <el-select v-model="filters.status" placeholder="请选择产品状态" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="上架" value="active"></el-option>
                <el-option label="下架" value="inactive"></el-option>
                <el-option label="草稿" value="draft"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="filter-item">
              <div class="filter-label">
                <i class="el-icon-search"></i>
                <span>搜索关键词</span>
              </div>
              <el-input
                v-model="filters.keyword"
                placeholder="请输入产品名称进行搜索"
                prefix-icon="el-icon-search"
                clearable
                @input="handleSearchInput">
              </el-input>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 产品列表 -->
    <div class="product-list">
      <!-- 骨架屏 -->
      <div v-if="loading" class="skeleton-container">
        <el-card v-for="n in 5" :key="n" class="skeleton-card" shadow="hover">
          <el-skeleton :rows="3" animated />
        </el-card>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <el-empty description="暂无产品数据">
          <el-button type="primary" @click="showCreateDialog = true">创建第一个产品</el-button>
        </el-empty>
      </div>

      <!-- 产品表格 -->
      <el-table 
        v-else 
        :data="filteredProducts" 
        stripe 
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f8f9fa', color: '#495057', fontWeight: '600', textAlign: 'center' }"
        :cell-style="{ padding: '16px 12px', textAlign: 'center' }"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="productId" label="ID" width="100" min-width="100">
          <template slot-scope="scope">
            <div class="id-cell">
              <span class="product-id">{{ scope.row.productId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="250" align="center">
          <template slot-scope="scope">
            <div class="product-info">
              <el-image 
                :src="scope.row.mainImgUrl || require('@/assets/images/travel.jpg')" 
                class="product-image"
                :preview-src-list="[scope.row.mainImgUrl || require('@/assets/images/travel.jpg')]"
                fit="cover">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div class="product-details">
                <div class="product-name">{{ scope.row.productName }}</div>
                <div class="product-type-text">{{ getTypeName(scope.row.productType) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template slot-scope="scope">
            <span class="amount">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100"></el-table-column>
        <el-table-column prop="soldCount" label="销量" width="100"></el-table-column>
        <el-table-column prop="productStatus" label="状态" width="100">
          <template slot-scope="scope">
            <span class="status-text" :class="getStatusClass(scope.row.productStatus)">
              {{ getStatusName(scope.row.productStatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template slot-scope="scope">
            <div class="time-cell">
              <span class="create-time">{{ formatTime(scope.row.createTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <div class="action-row">
                <el-button size="mini" @click="editProduct(scope.row)" class="action-btn edit-btn">
                  <i class="el-icon-edit"></i> 编辑
                </el-button>
                <el-button size="mini" type="success" @click="viewDetails(scope.row)" class="action-btn detail-btn">
                  <i class="el-icon-view"></i> 详情
                </el-button>
              </div>
              <div class="action-row">
                <el-button 
                  size="mini" 
                  :type="scope.row.productStatus === 1 ? 'warning' : 'success'" 
                  @click="toggleStatus(scope.row)"
                  class="action-btn status-btn">
                  <i :class="scope.row.productStatus === 1 ? 'el-icon-bottom' : 'el-icon-top'"></i> 
                  {{ scope.row.productStatus === 1 ? '下架' : '上架' }}
                </el-button>
                <el-button size="mini" type="info" @click="copyProduct(scope.row)" class="action-btn copy-btn">
                  <i class="el-icon-copy-document"></i> 复制
                </el-button>
              </div>
              <div class="action-row">
                <el-button size="mini" type="danger" @click="deleteProduct(scope.row)" class="action-btn delete-btn">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </div>
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

    <!-- 创建产品对话框 -->
    <el-dialog :title="isEdit ? '编辑产品' : '创建产品'" :visible.sync="showCreateDialog" width="1200px" class="product-dialog">
      <div class="dialog-content">
        <el-tabs v-model="activeCreateTab" class="create-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <div class="section-header">
              <h3>基本信息</h3>
              <p class="section-desc">请填写产品的基本信息和详细描述</p>
            </div>
            <el-form :model="newProduct" :rules="productRules" ref="productForm" label-width="100px">
              <el-form-item label="产品类型" prop="productType">
                <div class="product-type-selector">
                  <div 
                    class="type-option" 
                    :class="{ active: newProduct.productType === 1 }"
                    @click="newProduct.productType = 1">
                    <div class="type-icon">
                      <i class="el-icon-location-outline"></i>
                    </div>
                    <div class="type-info">
                      <div class="type-name">旅行路线</div>
                      <div class="type-desc">定制化旅游行程</div>
                    </div>
                  </div>
                  
                  <div 
                    class="type-option" 
                    :class="{ active: newProduct.productType === 2 }"
                    @click="newProduct.productType = 2">
                    <div class="type-icon">
                      <i class="el-icon-house"></i>
                    </div>
                    <div class="type-info">
                      <div class="type-name">酒店客房</div>
                      <div class="type-desc">舒适住宿体验</div>
                    </div>
                  </div>
                  
                  <div 
                    class="type-option" 
                    :class="{ active: newProduct.productType === 3 }"
                    @click="newProduct.productType = 3">
                    <div class="type-icon">
                      <i class="el-icon-tickets"></i>
                    </div>
                    <div class="type-info">
                      <div class="type-name">景区门票</div>
                      <div class="type-desc">景点门票服务</div>
                    </div>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="产品名称" prop="productName" required>
                <el-input v-model="newProduct.productName" placeholder="请输入产品名称"></el-input>
              </el-form-item>
              
              <el-form-item label="有效期" required v-if="!isEdit">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  @change="handleDateRangeChange">
                </el-date-picker>
              </el-form-item>
              
              <el-form-item label="价格" prop="price" required>
                <el-input-number v-model="newProduct.price" :min="0" :precision="2"></el-input-number>
              </el-form-item>
              
              <el-form-item label="库存" prop="stock" required>
                <el-input-number v-model="newProduct.stock" :min="0"></el-input-number>
              </el-form-item>
        
              <!-- 酒店客房特殊字段 -->
              <template v-if="newProduct.productType === 2">
                <el-form-item label="房型" prop="roomType">
                  <el-input 
                    v-model="newProduct.roomType" 
                    placeholder="如：标准间、豪华套房"
                    clearable
                    :key="`roomType-${newProduct.productType}`">
                  </el-input>
                </el-form-item>
                <el-form-item label="容纳人数">
                  <el-input-number v-model="newProduct.capacity" :min="1"></el-input-number>
                </el-form-item>
                <el-form-item label="设施配置">
                  <el-checkbox-group v-model="newProduct.facilities">
                    <el-checkbox label="wifi">WiFi</el-checkbox>
                    <el-checkbox label="parking">停车场</el-checkbox>
                    <el-checkbox label="pool">游泳池</el-checkbox>
                    <el-checkbox label="gym">健身房</el-checkbox>
                    <el-checkbox label="restaurant">餐厅</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </template>
              
              <!-- 旅行路线特殊字段 -->
              <template v-if="newProduct.productType === 1">
                <el-form-item label="行程天数">
                  <el-input-number v-model="newProduct.days" :min="1"></el-input-number>
                </el-form-item>
                <el-form-item label="景点清单">
                  <el-input type="textarea" v-model="newProduct.attractions" placeholder="请输入景点名称，用逗号分隔" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                <el-form-item label="餐饮标准">
                  <el-input v-model="newProduct.mealStandard" placeholder="如：含早餐、全包餐"></el-input>
                </el-form-item>
                <el-form-item label="住宿标准">
                  <el-input v-model="newProduct.accommodationStandard" placeholder="如：三星级酒店"></el-input>
                </el-form-item>
              </template>
              
              <!-- 门票特殊字段 -->
              <template v-if="newProduct.productType === 3">
                <!-- 门票产品使用统一的日期选择器，不需要单独的有效期字段 -->
                <el-form-item label="入园时段">
                  <el-time-picker
                    v-model="newProduct.entryTime"
                    placeholder="选择时间">
                  </el-time-picker>
                </el-form-item>
              </template>
              
              <el-form-item label="产品描述" prop="description" required>
                <el-input type="textarea" v-model="newProduct.description" :rows="3" resize="none" class="fixed-textarea"></el-input>
              </el-form-item>
              
              <el-form-item label="产品标签" prop="productTags" required>
                <el-input v-model="newProduct.productTags" placeholder="请输入产品标签，用逗号分隔"></el-input>
              </el-form-item>
              
              <el-form-item label="服务保障" prop="serviceGuarantees" required>
                <el-input v-model="newProduct.serviceGuarantees" placeholder="请输入服务保障，用逗号分隔"></el-input>
              </el-form-item>
              
              <el-form-item label="产品卖点" prop="productSellingPoints" required>
                <el-input type="textarea" v-model="newProduct.productSellingPoints" :rows="2" resize="none" class="fixed-textarea"></el-input>
              </el-form-item>
              
              <el-form-item label="供应商" prop="supplier" required>
                <el-input v-model="newProduct.supplier" placeholder="请输入供应商"></el-input>
              </el-form-item>
              
              <el-form-item label="产品图片">
                <div class="product-image-upload">
                  <!-- 图片上传区域 -->
                <el-upload
                  class="upload-demo"
                  :action="productUploadAction"
                  :headers="authHeaders"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="handleUploadSuccess"
                  :before-upload="beforeProductUpload"
                  :http-request="uploadProductImageManually"
                  :file-list="fileList"
                    list-type="picture"
                    :limit="10"
                    :on-exceed="handleExceed">
                    <el-button size="small" type="primary">
                      <i class="el-icon-upload"></i> 点击上传
                    </el-button>
                    <div slot="tip" class="el-upload__tip">
                      支持JPG、PNG、GIF格式，单张图片不超过5MB，最多上传10张图片
                    </div>
                </el-upload>
                  
                  <!-- 已上传图片管理 -->
                  <div v-if="newProduct.uploadedImages && newProduct.uploadedImages.length > 0" class="uploaded-images">
                    <h4>已上传图片：</h4>
                    <div class="image-grid">
                      <div v-for="(image, index) in newProduct.uploadedImages" :key="index" class="image-item">
                        <div class="image-wrapper">
                          <img :src="image.fileUrl" :alt="image.fileName" @click="previewImage(image.fileUrl)" />
                          <div class="image-overlay">
                            <el-button size="mini" type="primary" @click="setAsMainImage(index)" v-if="!image.isMain">
                              设为主图
                            </el-button>
                            <el-button size="mini" type="success" disabled v-else>
                              主图
                            </el-button>
                            <el-button size="mini" type="danger" @click="removeUploadedImage(index)">
                              删除
                            </el-button>
                          </div>
                        </div>
                        <div class="image-info">
                          <p class="image-name">{{ image.fileName }}</p>
                          <p class="image-size">{{ formatFileSize(image.fileSize) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 每日行程 -->
          <el-tab-pane label="每日行程" name="itinerary">
            <div class="itinerary-management">
              <div class="itinerary-header">
                <div class="header-content">
                <h3>行程安排</h3>
                  <p class="header-desc">为您的旅游产品设计详细的每日行程安排</p>
                </div>
                <el-button type="primary" size="medium" @click="addItineraryDay" class="add-day-btn">
                  <i class="el-icon-plus"></i> 添加新的一天
                </el-button>
              </div>
              
              <div v-if="newProduct.itineraries && newProduct.itineraries.length > 0" class="itinerary-list">
                <div v-for="(day, dayIndex) in newProduct.itineraries" :key="dayIndex" class="day-group">
                  <div class="day-header">
                    <div class="day-title">
                      <div class="day-number">
                        <span class="day-badge">{{ dayIndex + 1 }}</span>
                    <h4>第{{ dayIndex + 1 }}天</h4>
                      </div>
                      <div class="day-actions">
                        <el-button type="text" size="small" @click="moveDayUp(dayIndex)" v-if="dayIndex > 0" class="move-btn">
                          <i class="el-icon-arrow-up"></i>
                        </el-button>
                        <el-button type="text" size="small" @click="moveDayDown(dayIndex)" v-if="dayIndex < newProduct.itineraries.length - 1" class="move-btn">
                          <i class="el-icon-arrow-down"></i>
                        </el-button>
                        <el-button type="danger" size="small" @click="removeItineraryDay(dayIndex)" class="delete-day-btn">
                      <i class="el-icon-delete"></i> 删除
                    </el-button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="day-itineraries">
                    <div v-if="day.itineraries && day.itineraries.length > 0" class="itinerary-items">
                    <div v-for="(itinerary, itineraryIndex) in day.itineraries" :key="itineraryIndex" class="itinerary-item">
                        <div class="itinerary-card">
                          <div class="itinerary-header-row">
                            <div class="time-period-selector">
                              <el-select v-model="itinerary.timePeriod" placeholder="选择时间段" class="time-select">
                                <el-option label="🌅 早上" value="早上"></el-option>
                                <el-option label="☀️ 中午" value="中午"></el-option>
                                <el-option label="🌤️ 下午" value="下午"></el-option>
                                <el-option label="🌙 晚上" value="晚上"></el-option>
                          </el-select>
                            </div>
                            <div class="title-input">
                              <el-input v-model="itinerary.title" placeholder="请输入行程标题" class="title-field"></el-input>
                            </div>
                            <div class="itinerary-actions">
                              <el-button type="text" size="small" @click="moveItineraryUp(dayIndex, itineraryIndex)" v-if="itineraryIndex > 0" class="move-btn">
                                <i class="el-icon-arrow-up"></i>
                              </el-button>
                              <el-button type="text" size="small" @click="moveItineraryDown(dayIndex, itineraryIndex)" v-if="itineraryIndex < day.itineraries.length - 1" class="move-btn">
                                <i class="el-icon-arrow-down"></i>
                              </el-button>
                              <el-button type="danger" size="small" @click="removeItinerary(dayIndex, itineraryIndex)" class="delete-itinerary-btn">
                            <i class="el-icon-delete"></i>
                          </el-button>
                            </div>
                          </div>
                          
                          <div class="itinerary-content">
                            <div class="description-section">
                              <label class="field-label">
                                <i class="el-icon-document"></i>
                                行程描述
                              </label>
                      <el-input 
                        v-model="itinerary.description" 
                        type="textarea" 
                                :rows="3" 
                                placeholder="请详细描述这个时间段的行程安排..."
                                class="description-textarea"
                                style="resize: none !important;"
                                :style="{ resize: 'none' }">
                      </el-input>
                    </div>
                    
                            <div class="details-section">
                              <div class="detail-row">
                                <div class="detail-item">
                                  <label class="field-label">
                                    <i class="el-icon-food"></i>
                                    餐饮安排
                                  </label>
                                  <el-input v-model="itinerary.meals" placeholder="如：酒店早餐、当地特色午餐" class="detail-input"></el-input>
                                </div>
                                <div class="detail-item">
                                  <label class="field-label">
                                    <i class="el-icon-truck"></i>
                                    交通方式
                                  </label>
                                  <el-input v-model="itinerary.traffic" placeholder="如：大巴、飞机、步行" class="detail-input"></el-input>
                                </div>
                                <div class="detail-item">
                                  <label class="field-label">
                                    <i class="el-icon-house"></i>
                                    住宿安排
                                  </label>
                                  <el-input v-model="itinerary.accommodation" placeholder="如：四星级酒店、民宿" class="detail-input"></el-input>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="add-itinerary-section">
                      <el-button type="success" size="medium" @click="addItinerary(dayIndex)" class="add-itinerary-btn">
                      <i class="el-icon-plus"></i> 添加行程安排
                    </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-itinerary">
                <div class="empty-content">
                  <div class="empty-icon">
                    <i class="el-icon-map-location"></i>
                  </div>
                  <h4>还没有行程安排</h4>
                  <p>为您的旅游产品添加详细的每日行程，让客户了解完整的旅游体验</p>
                  <el-button type="primary" size="medium" @click="addItineraryDay" class="start-btn">
                    <i class="el-icon-plus"></i> 开始规划行程
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 费用说明 -->
          <el-tab-pane label="费用说明" name="cost">
            <div class="cost-explanation">
              <div class="section-header">
                <h3>费用说明</h3>
                <p class="section-desc">请详细填写产品的费用结构和说明</p>
              </div>
              <el-form :model="newProduct.costExplanation" label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="成人价格" required>
                      <el-input-number v-model="newProduct.costExplanation.adultPrice" :min="0" :precision="2"></el-input-number>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="儿童价格" required>
                      <el-input-number v-model="newProduct.costExplanation.childPrice" :min="0" :precision="2"></el-input-number>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="婴儿价格" required>
                      <el-input-number v-model="newProduct.costExplanation.infantPrice" :min="0" :precision="2"></el-input-number>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="单房差" required>
                      <el-input-number v-model="newProduct.costExplanation.singleRoomSupplement" :min="0" :precision="2"></el-input-number>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="费用包含" required>
                  <el-input type="textarea" v-model="newProduct.costExplanation.includeItems" :rows="3" placeholder="如：交通费、住宿费、餐费、门票费、导游服务费" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="费用不含" required>
                  <el-input type="textarea" v-model="newProduct.costExplanation.excludeItems" :rows="3" placeholder="如：个人消费、自费项目、保险费用、小费" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="可选项目">
                  <el-input type="textarea" v-model="newProduct.costExplanation.optionalItems" :rows="2" placeholder="如：保险、自费景点、购物" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="支付方式" required>
                  <el-input type="textarea" v-model="newProduct.costExplanation.paymentTerms" :rows="2" placeholder="如：支持支付宝、微信、银行卡支付，支持分期付款" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="退款政策" required>
                  <el-input type="textarea" v-model="newProduct.costExplanation.refundPolicy" :rows="3" placeholder="如：出发前7天可全额退款，3-6天退款80%，1-2天退款50%，当天不退" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 预订须知 -->
          <el-tab-pane label="预订须知" name="booking">
            <div class="booking-notice">
              <div class="section-header">
                <h3>预订须知</h3>
                <p class="section-desc">请详细填写产品的预订条件和政策</p>
              </div>
              <el-form :model="newProduct.bookingNotice" label-width="120px">
                <el-form-item label="预订条件" required>
                  <el-input type="textarea" v-model="newProduct.bookingNotice.bookingConditions" :rows="4" placeholder="如：年龄要求、健康要求、证件要求等" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="有效期" required>
                  <el-input v-model="newProduct.bookingNotice.validityPeriod" placeholder="如：产品有效期为购买后6个月内"></el-input>
                </el-form-item>
                
                <el-form-item label="预订截止时间" required>
                  <el-input v-model="newProduct.bookingNotice.bookingDeadline" placeholder="如：出发前3天截止预订"></el-input>
                </el-form-item>
                
                <el-form-item label="取消政策" required>
                  <el-input type="textarea" v-model="newProduct.bookingNotice.cancellationPolicy" :rows="3" placeholder="如：出发前7天可免费取消，3-6天收取20%手续费等" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="退款政策" required>
                  <el-input type="textarea" v-model="newProduct.bookingNotice.refundPolicy" :rows="2" placeholder="如：退款将在3-7个工作日内原路返回" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="特殊要求">
                  <el-input type="textarea" v-model="newProduct.bookingNotice.specialRequirements" :rows="3" placeholder="如：请携带常用药品、注意防晒和保暖等" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="联系信息" required>
                  <el-input type="textarea" v-model="newProduct.bookingNotice.contactInfo" :rows="2" placeholder="如：客服电话、工作时间、邮箱等" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="紧急联系">
                  <el-input type="textarea" v-model="newProduct.bookingNotice.emergencyContact" :rows="2" placeholder="如：紧急联系电话、24小时服务热线" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
                
                <el-form-item label="其他注意事项">
                  <el-input type="textarea" v-model="newProduct.bookingNotice.notes" :rows="3" placeholder="其他需要说明的注意事项" resize="none" class="fixed-textarea"></el-input>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createProduct">{{ isEdit ? '保存' : '创建' }}</el-button>
      </div>
    </el-dialog>

    <!-- 优惠活动对话框 -->
    <el-dialog title="设置优惠活动" :visible.sync="showPromotionDialog" width="600px">
      <el-form :model="promotion" label-width="100px">
        <el-form-item label="活动类型">
          <el-radio-group v-model="promotion.type">
            <el-radio label="discount">折扣</el-radio>
            <el-radio label="buy2get1">买二送一</el-radio>
            <el-radio label="coupon">满减券</el-radio>
            <el-radio label="earlybird">早鸟价</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="活动名称">
          <el-input v-model="promotion.name" placeholder="请输入活动名称"></el-input>
        </el-form-item>
        
        <el-form-item label="折扣率" v-if="promotion.type === 'discount'">
          <el-input-number v-model="promotion.discount" :min="0" :max="100" :precision="1"></el-input-number>
          <span>%</span>
        </el-form-item>
        
        <el-form-item label="满减条件" v-if="promotion.type === 'coupon'">
          <el-input-number v-model="promotion.minAmount" :min="0" placeholder="满多少"></el-input-number>
          <span>减</span>
          <el-input-number v-model="promotion.discountAmount" :min="0" placeholder="减多少"></el-input-number>
        </el-form-item>
        
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="promotion.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="适用产品">
          <el-select v-model="promotion.products" multiple placeholder="选择产品">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showPromotionDialog = false">取消</el-button>
        <el-button type="primary" @click="createPromotion">确定</el-button>
      </div>
    </el-dialog>

    <!-- 导入数据对话框 -->
    <el-dialog title="导入产品数据" :visible.sync="showImportDialog" width="500px">
      <div class="import-content">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;">
          <p>1. 请下载模板文件，按照格式填写产品信息</p>
          <p>2. 支持批量导入，单次最多1000条记录</p>
          <p>3. 必填字段：产品名称、价格、库存、产品类型</p>
        </el-alert>
        
        <div class="import-actions">
          <el-button type="primary" @click="downloadTemplate">
            <i class="el-icon-download"></i> 下载模板
          </el-button>
        </div>
        
        <el-upload
          class="upload-demo"
          :action="importUploadAction"
          :headers="authHeaders"
          :on-success="handleImportSuccess"
          :before-upload="beforeImportUpload"
          :file-list="importFileList"
          accept=".xlsx,.xls"
          :limit="1">
          <el-button size="small" type="success">
            <i class="el-icon-upload2"></i> 选择文件
          </el-button>
          <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过10MB</div>
        </el-upload>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 产品详情对话框 -->
    <el-dialog title="产品详情" :visible.sync="showProductDetailDialog" width="1200px" class="product-detail-dialog">
      <div v-if="currentViewProduct" class="product-detail-content">
        <!-- 产品头部信息 -->
        <div class="product-header">
          <div class="product-title-section">
            <h2 class="product-title">{{ currentViewProduct.productName }}</h2>
            <div class="product-meta">
              <el-tag :type="getTypeTagType(currentViewProduct.productType)" size="medium" class="type-tag">
                {{ getTypeName(currentViewProduct.productType) }}
              </el-tag>
              <el-tag :type="getStatusTagType(currentViewProduct.productStatus)" size="medium" class="status-tag">
                {{ getStatusName(currentViewProduct.productStatus) }}
              </el-tag>
            </div>
          </div>
          <div class="product-price-section">
            <div class="price-display">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ currentViewProduct.price }}</span>
            </div>
            <div class="price-label">产品价格</div>
          </div>
        </div>

        <!-- 产品基本信息 -->
        <div class="detail-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="el-icon-goods"></i>
            </div>
            <h3 class="section-title">基本信息</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-postcard"></i>
                产品ID
              </div>
              <div class="info-value">{{ currentViewProduct.productId }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-box"></i>
                库存数量
              </div>
              <div class="info-value">{{ currentViewProduct.stock }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-s-data"></i>
                销售数量
              </div>
              <div class="info-value">{{ currentViewProduct.soldCount || 0 }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-time"></i>
                创建时间
              </div>
              <div class="info-value">{{ formatTime(currentViewProduct.createTime) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">
                <i class="el-icon-office-building"></i>
                供应商
              </div>
              <div class="info-value">{{ currentViewProduct.supplier || '未设置' }}</div>
            </div>
          </div>
        </div>

        <!-- 产品图片 -->
        <div class="detail-section" v-if="currentViewProduct.mainImgUrl">
          <h3 class="section-title">
            <i class="el-icon-picture"></i>
            产品图片
          </h3>
          <div class="product-images">
            <el-image 
              :src="currentViewProduct.mainImgUrl" 
              class="main-image"
              :preview-src-list="[currentViewProduct.mainImgUrl]"
              fit="cover">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
        </div>

        <!-- 产品描述 -->
        <div class="detail-section" v-if="currentViewProduct.description">
          <h3 class="section-title">
            <i class="el-icon-document"></i>
            产品描述
          </h3>
          <div class="description-content">
            {{ currentViewProduct.description }}
          </div>
        </div>

        <!-- 产品标签 -->
        <div class="detail-section" v-if="currentViewProduct.productTags">
          <h3 class="section-title">
            <i class="el-icon-collection-tag"></i>
            产品标签
          </h3>
          <div class="tags-content">
            <el-tag 
              v-for="tag in splitProductTags" 
              :key="tag" 
              size="small" 
              style="margin-right: 8px; margin-bottom: 8px;">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 服务保障 -->
        <div class="detail-section" v-if="currentViewProduct.serviceGuarantees">
          <h3 class="section-title">
            <i class="el-icon-shield"></i>
            服务保障
          </h3>
          <div class="guarantees-content">
            <el-tag 
              v-for="guarantee in splitServiceGuarantees" 
              :key="guarantee" 
              type="success" 
              size="small" 
              style="margin-right: 8px; margin-bottom: 8px;">
              {{ guarantee }}
            </el-tag>
          </div>
        </div>

        <!-- 产品卖点 -->
        <div class="detail-section" v-if="currentViewProduct.productSellingPoints">
          <h3 class="section-title">
            <i class="el-icon-star-on"></i>
            产品卖点
          </h3>
          <div class="selling-points-content">
            {{ currentViewProduct.productSellingPoints }}
          </div>
        </div>

        <!-- 费用说明 -->
        <div class="detail-section" v-if="currentViewProduct.costExplanation">
          <h3 class="section-title">
            <i class="el-icon-money"></i>
            费用说明
          </h3>
          <div class="cost-explanation-content">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="cost-item">
                  <label>成人价格：</label>
                  <span>¥{{ currentViewProduct.costExplanation.adultPrice || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="cost-item">
                  <label>儿童价格：</label>
                  <span>¥{{ currentViewProduct.costExplanation.childPrice || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="cost-item">
                  <label>婴儿价格：</label>
                  <span>¥{{ currentViewProduct.costExplanation.infantPrice || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="cost-item">
                  <label>单房差：</label>
                  <span>¥{{ currentViewProduct.costExplanation.singleRoomSupplement || 0 }}</span>
                </div>
              </el-col>
            </el-row>
            <div class="cost-details">
              <div class="cost-detail-item" v-if="currentViewProduct.costExplanation.includeItems">
                <label>费用包含：</label>
                <p>{{ currentViewProduct.costExplanation.includeItems }}</p>
              </div>
              <div class="cost-detail-item" v-if="currentViewProduct.costExplanation.excludeItems">
                <label>费用不含：</label>
                <p>{{ currentViewProduct.costExplanation.excludeItems }}</p>
              </div>
              <div class="cost-detail-item" v-if="currentViewProduct.costExplanation.optionalItems">
                <label>可选项目：</label>
                <p>{{ currentViewProduct.costExplanation.optionalItems }}</p>
              </div>
              <div class="cost-detail-item" v-if="currentViewProduct.costExplanation.paymentTerms">
                <label>支付方式：</label>
                <p>{{ currentViewProduct.costExplanation.paymentTerms }}</p>
              </div>
              <div class="cost-detail-item" v-if="currentViewProduct.costExplanation.refundPolicy">
                <label>退款政策：</label>
                <p>{{ currentViewProduct.costExplanation.refundPolicy }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 预订须知 -->
        <div class="detail-section" v-if="currentViewProduct.bookingNotice">
          <h3 class="section-title">
            <i class="el-icon-document-copy"></i>
            预订须知
          </h3>
          <div class="booking-notice-content">
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.bookingConditions">
              <label>预订条件：</label>
              <p>{{ currentViewProduct.bookingNotice.bookingConditions }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.validityPeriod">
              <label>有效期：</label>
              <p>{{ currentViewProduct.bookingNotice.validityPeriod }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.bookingDeadline">
              <label>预订截止时间：</label>
              <p>{{ currentViewProduct.bookingNotice.bookingDeadline }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.cancellationPolicy">
              <label>取消政策：</label>
              <p>{{ currentViewProduct.bookingNotice.cancellationPolicy }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.refundPolicy">
              <label>退款政策：</label>
              <p>{{ currentViewProduct.bookingNotice.refundPolicy }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.specialRequirements">
              <label>特殊要求：</label>
              <p>{{ currentViewProduct.bookingNotice.specialRequirements }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.contactInfo">
              <label>联系信息：</label>
              <p>{{ currentViewProduct.bookingNotice.contactInfo }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.emergencyContact">
              <label>紧急联系：</label>
              <p>{{ currentViewProduct.bookingNotice.emergencyContact }}</p>
            </div>
            <div class="notice-item" v-if="currentViewProduct.bookingNotice.notes">
              <label>其他注意事项：</label>
              <p>{{ currentViewProduct.bookingNotice.notes }}</p>
            </div>
          </div>
        </div>

        <!-- 每日行程 -->
        <div class="detail-section" v-if="currentViewProduct.itineraries && currentViewProduct.itineraries.length > 0">
          <h3 class="section-title">
            <i class="el-icon-map-location"></i>
            每日行程
          </h3>
          <div class="itineraries-content">
            <div v-for="(day, dayIndex) in currentViewProduct.itineraries" :key="dayIndex" class="day-itinerary">
              <div class="day-header">
                <h4>第{{ dayIndex + 1 }}天</h4>
              </div>
              <div class="day-content" v-if="day.itineraries && day.itineraries.length > 0">
                <div v-for="(itinerary, itineraryIndex) in day.itineraries" :key="itineraryIndex" class="itinerary-item">
                  <div class="itinerary-time">{{ itinerary.timePeriod }}</div>
                  <div class="itinerary-content">
                    <div class="itinerary-title">{{ itinerary.title }}</div>
                    <div class="itinerary-description">{{ itinerary.description }}</div>
                    <div class="itinerary-details">
                      <span v-if="itinerary.meals">餐饮：{{ itinerary.meals }}</span>
                      <span v-if="itinerary.traffic">交通：{{ itinerary.traffic }}</span>
                      <span v-if="itinerary.accommodation">住宿：{{ itinerary.accommodation }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showProductDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="editProduct(currentViewProduct)">编辑产品</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'ProductManagement',
  data() {
    return {
      loading: false,
      showCreateDialog: false,
      showPromotionDialog: false,
      showImportDialog: false,
      showProductDetailDialog: false,
      isEdit: false,
      currentViewProduct: null,
      filters: {
        type: '',
        status: '',
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selectedProducts: [],
      stats: {
        totalProducts: 0,
        activeProducts: 0,
        totalSales: 0,
        totalRevenue: 0
      },
      searchTimer: null,
      dateRange: null,
      newProduct: {
        productType: 1,
        productName: '',
        price: 0,
        stock: 0,
        startDate: '',
        endDate: '',
        description: '',
        productTags: '',
        serviceGuarantees: '',
        productSellingPoints: '',
        supplier: '',
        // 酒店客房特殊字段
        roomType: '',
        capacity: 2,
        facilities: [],
        // 旅行路线特殊字段
        days: 1,
        attractions: '',
        mealStandard: '',
        accommodationStandard: '',
        // 门票特殊字段
        validityPeriod: null,
        entryTime: null,
        // 行程数据
        itineraries: [],
        // 费用说明
        costExplanation: {
          adultPrice: 0,
          childPrice: 0,
          infantPrice: 0,
          singleRoomSupplement: 0,
          includeItems: '',
          excludeItems: '',
          optionalItems: '',
          paymentTerms: '',
          refundPolicy: ''
        },
        // 预订须知
        bookingNotice: {
          bookingConditions: '',
          validityPeriod: '',
          bookingDeadline: '',
          cancellationPolicy: '',
          refundPolicy: '',
          specialRequirements: '',
          contactInfo: '',
          emergencyContact: '',
          notes: ''
        }
      },
      activeCreateTab: 'basic',
      promotion: {
        type: 'discount',
        name: '',
        discount: 0,
        minAmount: 0,
        discountAmount: 0,
        timeRange: [],
        products: []
      },
      productRules: {
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        stock: [
          { required: true, message: '请输入库存', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入产品描述', trigger: 'blur' }
        ],
        productTags: [
          { required: true, message: '请输入产品标签', trigger: 'blur' }
        ],
        serviceGuarantees: [
          { required: true, message: '请输入服务保障', trigger: 'blur' }
        ],
        productSellingPoints: [
          { required: true, message: '请输入产品卖点', trigger: 'blur' }
        ],
        supplier: [
          { required: true, message: '请输入供应商', trigger: 'blur' }
        ]
      },
      fileList: [],
      importFileList: [],
      products: [],
      productUploadAction: '/travel-admin/upload/product',
      importUploadAction: '/travel-admin/import/products',
      authHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        'X-Merchant-Id': '30001'  // 添加必需的商家ID
      },
      silentLoad: false
    }
  },
  created() {
    this.loadProducts();
    this.loadStats();
  },
  computed: {
    filteredProducts() {
      // 确保products是数组
      let filtered = Array.isArray(this.products) ? this.products : [];
      
      if (this.filters.type) {
        filtered = filtered.filter(p => p.productType === this.filters.type);
      }
      
      if (this.filters.status) {
        filtered = filtered.filter(p => p.productStatus === this.filters.status);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(p => 
          p.productName && p.productName.toLowerCase().includes(this.filters.keyword.toLowerCase())
        );
      }
      
      return filtered;
    },
    
    // 分割产品标签
    splitProductTags() {
      if (!this.currentViewProduct || !this.currentViewProduct.productTags) {
        return [];
      }
      return this.currentViewProduct.productTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    },
    
    // 分割服务保障
    splitServiceGuarantees() {
      if (!this.currentViewProduct || !this.currentViewProduct.serviceGuarantees) {
        return [];
      }
      return this.currentViewProduct.serviceGuarantees.split(',').map(guarantee => guarantee.trim()).filter(guarantee => guarantee);
    }
  },
  watch: {
    filteredProducts: {
      handler(newVal) {
        this.pagination.total = newVal.length;
      },
      immediate: true
    }
  },
  methods: {
    // 处理日期范围变化 - 统一更新所有有效期字段
    handleDateRangeChange(dateRange) {
      console.log('日期范围变化:', dateRange);
      console.log('当前产品类型:', this.newProduct.productType);
      
      if (dateRange && dateRange.length === 2) {
        // 更新通用有效期
        this.newProduct.startDate = dateRange[0];
        this.newProduct.endDate = dateRange[1];
        
        // 如果是门票产品，同时更新门票有效期
        if (this.newProduct.productType === 3) { // 3表示门票产品
          this.newProduct.validityPeriod = [dateRange[0], dateRange[1]];
          console.log('门票产品 - 更新validityPeriod:', this.newProduct.validityPeriod);
        }
        
        console.log('更新后的startDate:', this.newProduct.startDate);
        console.log('更新后的endDate:', this.newProduct.endDate);
      } else {
        // 清空所有有效期字段
        this.newProduct.startDate = '';
        this.newProduct.endDate = '';
        if (this.newProduct.productType === 3) {
          this.newProduct.validityPeriod = null;
        }
        console.log('清空所有有效期字段');
      }
    },
    
    // 获取默认开始日期（当前日期）
    getDefaultStartDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    
    // 获取默认结束日期（一年后）
    getDefaultEndDate() {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      return oneYearLater.toISOString().split('T')[0];
    },
    
    // 验证产品ID是否有效
    isValidProductId(productId) {
      return productId && productId !== 'temp' && !isNaN(productId) && productId > 0;
    },
    
    // 保存图片到本地（创建模式下）
    saveImageLocally(file) {
      if (!this.newProduct.uploadedImages) {
        this.newProduct.uploadedImages = [];
      }
      
      const imageInfo = {
        file: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isMain: this.newProduct.uploadedImages.length === 0, // 第一张图片设为主图
        fileUrl: URL.createObjectURL(file) // 创建本地预览URL
      };
      
      this.newProduct.uploadedImages.push(imageInfo);
      this.$message.success('图片已选择，将在产品创建后上传');
    },
    
    // 简化的图片上传方法
    async uploadProductImages(productId) {
      if (!this.newProduct.uploadedImages || this.newProduct.uploadedImages.length === 0) {
        return;
      }
      
      try {
        let mainImageUrl = null;
        
        for (const imageInfo of this.newProduct.uploadedImages) {
          if (imageInfo.file) {
            const formData = new FormData();
            formData.append('file', imageInfo.file);
            formData.append('productId', productId);
            formData.append('isMain', imageInfo.isMain ? 'true' : 'false');
            
            const response = await request({
              url: '/travel-admin/upload/product',
              method: 'post',
              data: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
                'X-Merchant-Id': '30001'
              }
            });
            
            console.log('图片上传响应:', response);
            
            const responseData = response.data || response;
            if (responseData.code === 1 && responseData.data) {
              const uploadResult = responseData.data;
              // 更新图片信息，将本地URL替换为服务器URL
              imageInfo.fileUrl = uploadResult.url;
              imageInfo.fileId = uploadResult.fileId;
              delete imageInfo.file; // 删除本地文件引用
              
              // 如果是主图，记录主图URL
              if (imageInfo.isMain) {
                mainImageUrl = imageInfo.fileUrl;
              }
            }
          }
        }
        
        // 如果有主图，更新产品的主图URL
        if (mainImageUrl) {
          this.newProduct.mainImgUrl = mainImageUrl;
          
          // 更新产品的主图URL到后端
          try {
            await request({
              url: `/travel-admin/tourProduct/update/${productId}`,
              method: 'put',
              data: {
                mainImgUrl: mainImageUrl
              },
              headers: {
                'Content-Type': 'application/json',
                'X-Merchant-Id': '30001'
              }
            });
            console.log('主图URL已更新到后端');
            
            // 更新本地产品列表中的对应产品
            const productIndex = this.products.findIndex(p => p.productId == productId);
            if (productIndex !== -1) {
              this.$set(this.products, productIndex, {
                ...this.products[productIndex],
                mainImgUrl: mainImageUrl
              });
            }
          } catch (error) {
            console.error('更新主图URL失败:', error);
          }
        }
        
        this.$message.success('图片上传成功');
      } catch (error) {
        console.error('图片上传失败:', error);
        this.$message.warning('产品创建成功，但图片上传失败');
      }
    },
    
    async loadProducts() {
      this.loading = true;
      try {
        const response = await request({
          url: '/travel-admin/tourProduct/getAllProducts',
          method: 'get',
          headers: {
            'X-Merchant-Id': '30001'
          }
        });
        
        console.log('API响应数据:', response);
        
        // 处理响应数据
        let productsData = [];
        const responseData = response.data || response;
        
        if (responseData.code === 1 && responseData.data && Array.isArray(responseData.data)) {
            productsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          productsData = responseData;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            productsData = responseData.data;
          } else if (responseData.result && Array.isArray(responseData.result)) {
            productsData = responseData.result;
          } else {
            console.warn('API返回数据格式异常:', responseData);
            productsData = [];
          }
        
        // 处理产品数据，确保图片URL正确
        this.products = productsData.map(product => {
          // 如果主图URL无效，使用默认图片
          if (!product.mainImgUrl || product.mainImgUrl.startsWith('blob:')) {
            product.mainImgUrl = require('@/assets/images/travel.jpg');
          }
          return product;
        });
        
        this.updateStats();
        console.log('加载的产品数据:', this.products);
        console.log('产品数量:', this.products.length);
        
        if (!this.silentLoad) {
        this.$message.success('产品列表加载成功');
        }
      } catch (error) {
        console.error('加载产品失败:', error);
        this.$message.error('产品列表加载失败');
        this.products = [];
        this.updateStats();
      } finally {
        this.loading = false;
      }
    },

    getMockProducts() {
      return [
        {
          productId: 1,
          productName: '北京三日游',
          productType: 1,
          price: 1299,
          stock: 50,
          soldCount: 23,
          productStatus: 1,
          createTime: '2024-01-15',
          mainImgUrl: require('@/assets/images/travel.jpg'),
          description: '包含故宫、天安门、长城等经典景点',
          productTags: '经典,文化,历史',
          serviceGuarantees: '7天无理由退款,24小时客服',
          productSellingPoints: '专业导游讲解,含门票住宿',
          supplier: '北京旅行社',
          // 旅行路线特殊字段
          days: 3,
          attractions: '故宫,天安门,长城,颐和园,天坛',
          mealStandard: '含早餐,当地特色午餐',
          accommodationStandard: '四星级酒店',
          costExplanation: {
            adultPrice: 1299,
            childPrice: 999,
            infantPrice: 0,
            singleRoomSupplement: 300,
            includeItems: '交通费,住宿费,餐费,门票费,导游服务费',
            excludeItems: '个人消费,自费项目,保险费用,小费',
            optionalItems: '保险,自费景点,购物',
            paymentTerms: '支持支付宝、微信、银行卡支付',
            refundPolicy: '出发前7天可全额退款，3-6天退款80%'
          },
          bookingNotice: {
            bookingConditions: '年龄要求18-65岁，身体健康',
            validityPeriod: '产品有效期为购买后6个月内',
            bookingDeadline: '出发前3天截止预订',
            cancellationPolicy: '出发前7天可免费取消',
            refundPolicy: '退款将在3-7个工作日内原路返回',
            specialRequirements: '请携带常用药品，注意防晒',
            contactInfo: '客服电话：400-123-4567',
            emergencyContact: '紧急联系电话：138-0000-0000',
            notes: '请提前30分钟到达集合地点'
          },
          itineraries: []
        },
        {
          productId: 2,
          productName: '上海外滩豪华酒店',
          productType: 2,
          price: 899,
          stock: 20,
          soldCount: 15,
          productStatus: 1,
          createTime: '2024-01-20',
          mainImgUrl: require('@/assets/images/travel2.jpg'),
          description: '位于外滩核心区域，江景房',
          productTags: '豪华,江景,商务',
          serviceGuarantees: '免费取消,免费WiFi',
          productSellingPoints: '无敌江景,五星服务',
          supplier: '上海酒店集团',
          // 酒店客房特殊字段
          roomType: '豪华江景房',
          capacity: 2,
          facilities: ['wifi', 'parking', 'pool', 'gym', 'restaurant'],
          costExplanation: {
            adultPrice: 899,
            childPrice: 0,
            infantPrice: 0,
            singleRoomSupplement: 0,
            includeItems: '住宿费,早餐,WiFi',
            excludeItems: '其他餐费,交通费,个人消费',
            optionalItems: 'SPA服务,商务中心',
            paymentTerms: '支持在线支付,到店支付',
            refundPolicy: '入住前24小时可免费取消'
          },
          bookingNotice: {
            bookingConditions: '需提供有效身份证件',
            validityPeriod: '预订后30天内有效',
            bookingDeadline: '入住当天18:00前',
            cancellationPolicy: '入住前24小时可免费取消',
            refundPolicy: '退款将在1-3个工作日内处理',
            specialRequirements: '请保持房间整洁',
            contactInfo: '前台电话：021-1234-5678',
            emergencyContact: '24小时服务热线：400-888-9999',
            notes: '入住时间：14:00，退房时间：12:00'
          },
          itineraries: []
        },
        {
          productId: 3,
          productName: '杭州西湖门票',
          productType: 3,
          price: 60,
          stock: 200,
          soldCount: 156,
          productStatus: 1,
          createTime: '2024-01-25',
          mainImgUrl: require('@/assets/images/travel3.jpg'),
          description: '西湖十景一日游门票',
          productTags: '自然,风景,休闲',
          serviceGuarantees: '当日有效,电子票',
          productSellingPoints: '免排队,即买即用',
          supplier: '杭州景区管理',
          // 门票特殊字段
          validityPeriod: ['2024-01-01', '2024-12-31'],
          entryTime: '09:00',
          costExplanation: {
            adultPrice: 60,
            childPrice: 30,
            infantPrice: 0,
            singleRoomSupplement: 0,
            includeItems: '门票费,景区内交通',
            excludeItems: '餐饮费,导游费,个人消费',
            optionalItems: '游船票,观光车票',
            paymentTerms: '支持微信、支付宝支付',
            refundPolicy: '未使用可全额退款'
          },
          bookingNotice: {
            bookingConditions: '无特殊要求',
            validityPeriod: '购买当日有效',
            bookingDeadline: '当日23:59前',
            cancellationPolicy: '未使用可随时取消',
            refundPolicy: '退款立即到账',
            specialRequirements: '请携带身份证件',
            contactInfo: '客服电话：0571-1234-5678',
            emergencyContact: '景区服务热线：0571-8888-9999',
            notes: '开放时间：6:00-18:00'
          },
          itineraries: []
        }
      ];
    },

    async loadStats() {
      try {
        // 这里可以调用专门的统计接口，或者基于现有数据计算
        this.updateStats();
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    },

    updateStats() {
      // 确保products是数组
      const products = Array.isArray(this.products) ? this.products : [];
      
      this.stats.totalProducts = products.length;
      this.stats.activeProducts = products.filter(p => p.productStatus === 1).length;
      this.stats.totalSales = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
      this.stats.totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.soldCount || 0)), 0);
    },
    searchProducts() {
      // 搜索逻辑已在computed中实现
    },

    handleSearchInput() {
      // 实时搜索防抖
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.searchProducts();
      }, 300);
    },

    handleSelectionChange(selection) {
      this.selectedProducts = selection;
    },

    batchToggleStatus(status) {
      if (this.selectedProducts.length === 0) {
        this.$message.warning('请先选择产品');
        return;
      }
      
      const action = status === 'active' ? '上架' : '下架';
      this.$confirm(`确定要${action}选中的 ${this.selectedProducts.length} 个产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedProducts.forEach(product => {
          product.productStatus = status === 'active' ? 1 : 0;
        });
        this.updateStats();
        this.$message.success(`批量${action}成功`);
        this.selectedProducts = [];
      }).catch(() => {
        // 用户点击取消，不需要做任何操作
        console.log(`用户取消了批量${action}操作`);
      });
    },

    batchDelete() {
      if (this.selectedProducts.length === 0) {
        this.$message.warning('请先选择产品');
        return;
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedProducts.length} 个产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 确保products是数组
        if (!Array.isArray(this.products)) {
          this.products = [];
        }
        
        this.selectedProducts.forEach(product => {
          const index = this.products.findIndex(p => p.productId === product.productId);
          if (index > -1) {
            this.products.splice(index, 1);
          }
        });
        this.updateStats();
        this.$message.success('批量删除成功');
        this.selectedProducts = [];
      }).catch(() => {
        // 用户点击取消，不需要做任何操作
        console.log('用户取消了批量删除操作');
      });
    },

    copyProduct(product) {
      // 深拷贝产品数据
      this.newProduct = JSON.parse(JSON.stringify(product));
      
      // 修改产品名称和清除ID
      this.newProduct.productName = product.productName + ' (副本)';
      this.newProduct.productId = null;
      
      // 确保costExplanation对象存在
      if (!this.newProduct.costExplanation) {
        this.newProduct.costExplanation = {
          adultPrice: 0,
          childPrice: 0,
          infantPrice: 0,
          singleRoomSupplement: 0,
          includeItems: '',
          excludeItems: '',
          optionalItems: '',
          paymentTerms: '',
          refundPolicy: ''
        };
      }
      
      // 确保bookingNotice对象存在
      if (!this.newProduct.bookingNotice) {
        this.newProduct.bookingNotice = {
          bookingConditions: '',
          validityPeriod: '',
          bookingDeadline: '',
          cancellationPolicy: '',
          refundPolicy: '',
          specialRequirements: '',
          contactInfo: '',
          emergencyContact: '',
          notes: ''
        };
      }
      
      // 确保itineraries数组存在
      if (!this.newProduct.itineraries) {
        this.newProduct.itineraries = [];
      }
      
      // 确保酒店客房特殊字段存在
      if (!this.newProduct.facilities) {
        this.newProduct.facilities = [];
      }
      if (!this.newProduct.roomType) {
        this.newProduct.roomType = '';
      }
      if (!this.newProduct.capacity) {
        this.newProduct.capacity = 2;
      }
      
      // 确保旅行路线特殊字段存在
      if (!this.newProduct.days) {
        this.newProduct.days = 1;
      }
      if (!this.newProduct.attractions) {
        this.newProduct.attractions = '';
      }
      if (!this.newProduct.mealStandard) {
        this.newProduct.mealStandard = '';
      }
      if (!this.newProduct.accommodationStandard) {
        this.newProduct.accommodationStandard = '';
      }
      
      // 确保门票特殊字段存在
      if (!this.newProduct.validityPeriod) {
        this.newProduct.validityPeriod = null;
      }
      if (!this.newProduct.entryTime) {
        this.newProduct.entryTime = null;
      }
      
      this.isEdit = false; // 复制模式，不是编辑模式
      this.showCreateDialog = true;
      this.activeCreateTab = 'basic';
      this.$message.info('产品信息已复制，请修改后保存');
    },

    importData() {
      this.showImportDialog = true;
    },

    downloadTemplate() {
      // 下载导入模板
      const link = document.createElement('a');
      link.href = '/templates/product_import_template.xlsx';
      link.download = '产品导入模板.xlsx';
      link.click();
      this.$message.success('模板下载成功');
    },

    beforeImportUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel';
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!');
        return false;
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!');
        return false;
      }
      return true;
    },

    handleImportSuccess(response, file, fileList) {
      console.log('导入成功:', response);
      this.importFileList = fileList;
      this.$message.success('产品数据导入成功');
      this.showImportDialog = false;
      this.loadProducts(); // 重新加载产品列表
    },

    // 行程管理方法
    addItineraryDay() {
      if (!this.newProduct.itineraries) {
        this.newProduct.itineraries = [];
      }
      this.newProduct.itineraries.push({
        daySeq: this.newProduct.itineraries.length + 1,
        itineraries: []
      });
    },

    removeItineraryDay(dayIndex) {
      this.$confirm('确定要删除这一天的行程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.newProduct.itineraries.splice(dayIndex, 1);
        // 重新排序天数
        this.newProduct.itineraries.forEach((day, index) => {
          day.daySeq = index + 1;
        });
        this.$message.success('删除成功');
      }).catch(() => {
        // 用户点击取消，不需要做任何操作
        console.log('用户取消了删除行程操作');
      });
    },

    addItinerary(dayIndex) {
      if (!this.newProduct.itineraries[dayIndex].itineraries) {
        this.newProduct.itineraries[dayIndex].itineraries = [];
      }
      this.newProduct.itineraries[dayIndex].itineraries.push({
        timePeriod: '早上',
        title: '',
        description: '',
        meals: '',
        traffic: '',
        accommodation: ''
      });
    },

    removeItinerary(dayIndex, itineraryIndex) {
      this.newProduct.itineraries[dayIndex].itineraries.splice(itineraryIndex, 1);
    },

    // 移动天数
    moveDayUp(dayIndex) {
      if (dayIndex > 0) {
        const day = this.newProduct.itineraries.splice(dayIndex, 1)[0];
        this.newProduct.itineraries.splice(dayIndex - 1, 0, day);
        // 重新排序天数
        this.newProduct.itineraries.forEach((day, index) => {
          day.daySeq = index + 1;
        });
        this.$message.success('天数顺序已调整');
      }
    },

    moveDayDown(dayIndex) {
      if (dayIndex < this.newProduct.itineraries.length - 1) {
        const day = this.newProduct.itineraries.splice(dayIndex, 1)[0];
        this.newProduct.itineraries.splice(dayIndex + 1, 0, day);
        // 重新排序天数
        this.newProduct.itineraries.forEach((day, index) => {
          day.daySeq = index + 1;
        });
        this.$message.success('天数顺序已调整');
      }
    },

    // 移动行程安排
    moveItineraryUp(dayIndex, itineraryIndex) {
      if (itineraryIndex > 0) {
        const itinerary = this.newProduct.itineraries[dayIndex].itineraries.splice(itineraryIndex, 1)[0];
        this.newProduct.itineraries[dayIndex].itineraries.splice(itineraryIndex - 1, 0, itinerary);
        this.$message.success('行程顺序已调整');
      }
    },

    moveItineraryDown(dayIndex, itineraryIndex) {
      const dayItineraries = this.newProduct.itineraries[dayIndex].itineraries;
      if (itineraryIndex < dayItineraries.length - 1) {
        const itinerary = dayItineraries.splice(itineraryIndex, 1)[0];
        dayItineraries.splice(itineraryIndex + 1, 0, itinerary);
        this.$message.success('行程顺序已调整');
      }
    },
    
    getTypeName(type) {
      const typeMap = {
        1: '旅行路线',
        2: '酒店客房',
        3: '景区门票'
      };
      return typeMap[type] || type;
    },
    
    getTypeTagType(type) {
      const typeMap = {
        1: 'success',
        2: 'primary',
        3: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getStatusName(status) {
      const statusMap = {
        1: '上架',
        0: '下架'
      };
      return statusMap[status] || status;
    },
    
    getStatusTagType(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    getStatusClass(status) {
      const statusMap = {
        1: 'status-active',
        0: 'status-inactive'
      };
      return statusMap[status] || 'status-unknown';
    },
    
    formatTime(timeStr) {
      if (!timeStr) return '';
      // 将时间格式从 "2024-01-15T10:30:00" 转换为 "2024-01-15 10:30:00"
      return timeStr.replace('T', ' ');
    },
    
    editProduct(product) {
      console.log('编辑产品 - 原始数据:', product);
      console.log('编辑产品 - 产品ID:', product.productId);
      console.log('编辑产品 - 费用说明原始值:', product.costExplanation);
      console.log('编辑产品 - 预订须知原始值:', product.bookingNotice);
      console.log('编辑产品 - 行程安排原始值:', product.itineraries);
      
      // 深拷贝产品数据，避免直接修改原数据
      const productData = JSON.parse(JSON.stringify(product));
      
      // 先设置编辑状态
      this.isEdit = true;
      this.showCreateDialog = true;
      this.activeCreateTab = 'basic';
      
      console.log('=== 设置编辑状态 ===');
      console.log('isEdit设置为:', this.isEdit);
      console.log('showCreateDialog设置为:', this.showCreateDialog);
      
      // 直接复制所有数据到newProduct，不使用resetForm
      this.newProduct = {
        // 基本信息
        productId: productData.productId || null,
        productType: productData.productType || 1,
        productName: productData.productName || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        startDate: productData.startDate || '',
        endDate: productData.endDate || '',
        description: productData.description || '',
        productTags: productData.productTags || '',
        serviceGuarantees: productData.serviceGuarantees || '',
        productSellingPoints: productData.productSellingPoints || '',
        supplier: productData.supplier || '',
        mainImgUrl: productData.mainImgUrl || '',
        
        // 酒店客房特殊字段
        roomType: productData.roomType || '',
        capacity: productData.capacity || 2,
        facilities: productData.facilities || [],
        
        // 旅行路线特殊字段
        days: productData.days || 1,
        attractions: productData.attractions || '',
        mealStandard: productData.mealStandard || '',
        accommodationStandard: productData.accommodationStandard || '',
        
        // 门票特殊字段
        validityPeriod: productData.validityPeriod || null,
        entryTime: productData.entryTime || null,
        
        // 行程数据 - 处理null值
        itineraries: productData.itineraries && Array.isArray(productData.itineraries) ? productData.itineraries : [],
        
        // 费用说明 - 确保所有字段都存在，处理null值
        costExplanation: productData.costExplanation && typeof productData.costExplanation === 'object' ? {
          adultPrice: productData.costExplanation.adultPrice || 0,
          childPrice: productData.costExplanation.childPrice || 0,
          infantPrice: productData.costExplanation.infantPrice || 0,
          singleRoomSupplement: productData.costExplanation.singleRoomSupplement || 0,
          includeItems: productData.costExplanation.includeItems || '',
          excludeItems: productData.costExplanation.excludeItems || '',
          optionalItems: productData.costExplanation.optionalItems || '',
          paymentTerms: productData.costExplanation.paymentTerms || '',
          refundPolicy: productData.costExplanation.refundPolicy || ''
        } : {
          adultPrice: 0,
          childPrice: 0,
          infantPrice: 0,
          singleRoomSupplement: 0,
          includeItems: '',
          excludeItems: '',
          optionalItems: '',
          paymentTerms: '',
          refundPolicy: ''
        },
        
        // 预订须知 - 确保所有字段都存在，处理null值
        bookingNotice: productData.bookingNotice && typeof productData.bookingNotice === 'object' ? {
          bookingConditions: productData.bookingNotice.bookingConditions || '',
          validityPeriod: productData.bookingNotice.validityPeriod || '',
          bookingDeadline: productData.bookingNotice.bookingDeadline || '',
          cancellationPolicy: productData.bookingNotice.cancellationPolicy || '',
          refundPolicy: productData.bookingNotice.refundPolicy || '',
          specialRequirements: productData.bookingNotice.specialRequirements || '',
          contactInfo: productData.bookingNotice.contactInfo || '',
          emergencyContact: productData.bookingNotice.emergencyContact || '',
          notes: productData.bookingNotice.notes || ''
        } : {
          bookingConditions: '',
          validityPeriod: '',
          bookingDeadline: '',
          cancellationPolicy: '',
          refundPolicy: '',
          specialRequirements: '',
          contactInfo: '',
          emergencyContact: '',
          notes: ''
        },
        
        // 上传的图片
        uploadedImages: productData.uploadedImages || []
      };
      
      // 设置日期范围 - 统一处理通用有效期和门票有效期
      if (this.newProduct.startDate && this.newProduct.endDate) {
        this.dateRange = [this.newProduct.startDate, this.newProduct.endDate];
      } else if (this.newProduct.validityPeriod && Array.isArray(this.newProduct.validityPeriod) && this.newProduct.validityPeriod.length === 2) {
        // 如果门票有效期存在，也设置到通用日期范围
        this.dateRange = [this.newProduct.validityPeriod[0], this.newProduct.validityPeriod[1]];
        this.newProduct.startDate = this.newProduct.validityPeriod[0];
        this.newProduct.endDate = this.newProduct.validityPeriod[1];
      } else {
        this.dateRange = null;
      }
      
      // 处理图片数据
      if (this.newProduct.mainImgUrl && (!this.newProduct.uploadedImages || this.newProduct.uploadedImages.length === 0)) {
        // 如果产品有主图但没有uploadedImages数组，创建一个
        this.newProduct.uploadedImages = [{
          fileId: 'existing',
          fileName: '主图',
          fileUrl: this.newProduct.mainImgUrl,
          fileSize: 0,
          isMain: true
        }];
      } else if (this.newProduct.uploadedImages && this.newProduct.uploadedImages.length > 0) {
        // 确保主图标记正确
        this.newProduct.uploadedImages.forEach((image) => {
          if (image.fileUrl === this.newProduct.mainImgUrl) {
            image.isMain = true;
          } else {
            image.isMain = false;
          }
        });
      }
      
      console.log('编辑产品 - 复制后数据:', this.newProduct);
      console.log('编辑产品 - 产品ID验证:', this.isValidProductId(this.newProduct.productId));
      console.log('编辑产品 - 产品名称:', this.newProduct.productName);
      console.log('编辑产品 - 产品类型:', this.newProduct.productType);
      console.log('编辑产品 - 费用说明:', this.newProduct.costExplanation);
      console.log('编辑产品 - 预订须知:', this.newProduct.bookingNotice);
      console.log('编辑产品 - 行程安排:', this.newProduct.itineraries);
      console.log('编辑产品 - 景点清单:', this.newProduct.attractions);
      console.log('编辑产品 - 餐饮标准:', this.newProduct.mealStandard);
      console.log('编辑产品 - 住宿标准:', this.newProduct.accommodationStandard);
      console.log('编辑产品 - 房型:', this.newProduct.roomType);
      console.log('编辑产品 - 容量:', this.newProduct.capacity);
      console.log('编辑产品 - 设施:', this.newProduct.facilities);
      
      // 等待DOM更新，确保表单正确显示
      this.$nextTick(() => {
        // 清除表单验证状态
        if (this.$refs.productForm) {
          this.$refs.productForm.clearValidate();
        }
        this.$forceUpdate();
        console.log('编辑产品 - DOM更新完成');
      });
    },
    
    viewDetails(product) {
      // 设置当前查看的产品
      this.currentViewProduct = JSON.parse(JSON.stringify(product));
      this.showProductDetailDialog = true;
      console.log('查看产品详情:', product);
    },
    
    toggleStatus(product) {
      const newStatus = product.productStatus === 1 ? 0 : 1;
      product.productStatus = newStatus;
      this.updateStats();
      this.$message.success(`产品已${newStatus === 1 ? '上架' : '下架'}`);
    },
    
    deleteProduct(product) {
      this.$confirm('确定要删除这个产品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 确保products是数组
        if (!Array.isArray(this.products)) {
          this.products = [];
        }
        
        const index = this.products.findIndex(p => p.productId === product.productId || p.id === product.id);
        if (index > -1) {
          this.products.splice(index, 1);
          this.updateStats();
          this.$message.success('删除成功');
        }
      }).catch(() => {
        // 用户点击取消，不需要做任何操作
        console.log('用户取消了删除操作');
      });
    },
    
    async createProduct() {
      console.log('=== createProduct 方法开始 ===');
      console.log('当前isEdit状态:', this.isEdit);
      console.log('当前newProduct.productId:', this.newProduct.productId);
      console.log('isValidProductId结果:', this.isValidProductId(this.newProduct.productId));
      
      // 首先验证基本信息表单
      this.$refs.productForm.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请填写完整的基本信息');
          this.activeCreateTab = 'basic';
          return;
        }

        // 验证四个部分是否都完整
        if (!this.validateBasicInfo()) {
          return;
        }

        if (!this.validateItinerary()) {
          return;
        }

        if (!this.validateCostExplanation()) {
          return;
        }

        if (!this.validateBookingNotice()) {
          return;
        }

        // 所有验证通过，执行创建/更新操作
        try {
          // 准备请求数据，确保包含所有必需字段
          const requestData = {
            productType: this.newProduct.productType,
            productName: this.newProduct.productName,
            price: this.newProduct.price,
            stock: this.newProduct.stock,
            startDate: this.newProduct.startDate || this.getDefaultStartDate(),
            endDate: this.newProduct.endDate || this.getDefaultEndDate(),
            description: this.newProduct.description,
            productTags: this.newProduct.productTags,
            serviceGuarantees: this.newProduct.serviceGuarantees,
            productSellingPoints: this.newProduct.productSellingPoints,
            supplier: this.newProduct.supplier,
            // 酒店客房特殊字段
            roomType: this.newProduct.roomType || '',
            capacity: this.newProduct.capacity || 2,
            facilities: this.newProduct.facilities || [],
            // 旅行路线特殊字段
            days: this.newProduct.days || 1,
            attractions: this.newProduct.attractions || '',
            mealStandard: this.newProduct.mealStandard || '',
            accommodationStandard: this.newProduct.accommodationStandard || '',
            // 门票特殊字段 - 根据产品类型处理有效期
            validityPeriod: this.newProduct.productType === 3 ? 
              (this.newProduct.validityPeriod || [this.newProduct.startDate, this.newProduct.endDate]) : 
              this.newProduct.validityPeriod,
            entryTime: this.newProduct.entryTime,
            // 行程数据
            itineraries: this.newProduct.itineraries || [],
            // 费用说明 - 确保发送完整的数据结构
            costExplanation: this.newProduct.costExplanation && typeof this.newProduct.costExplanation === 'object' ? this.newProduct.costExplanation : {
              adultPrice: 0,
              childPrice: 0,
              infantPrice: 0,
              singleRoomSupplement: 0,
              includeItems: '',
              excludeItems: '',
              optionalItems: '',
              paymentTerms: '',
              refundPolicy: ''
            },
            // 预订须知 - 确保发送完整的数据结构
            bookingNotice: this.newProduct.bookingNotice && typeof this.newProduct.bookingNotice === 'object' ? this.newProduct.bookingNotice : {
              bookingConditions: '',
              validityPeriod: '',
              bookingDeadline: '',
              cancellationPolicy: '',
              refundPolicy: '',
              specialRequirements: '',
              contactInfo: '',
              emergencyContact: '',
              notes: ''
            }
          };
          
          console.log('准备发送的请求数据:', requestData);
          console.log('产品类型:', this.newProduct.productType);
          console.log('通用有效期 - startDate:', this.newProduct.startDate, 'endDate:', this.newProduct.endDate);
          console.log('门票有效期 - validityPeriod:', this.newProduct.validityPeriod);
          console.log('日期范围 - dateRange:', this.dateRange);
          
          if (this.isEdit && this.isValidProductId(this.newProduct.productId)) {
              // 编辑模式
            console.log('=== 编辑产品模式 ===');
            console.log('编辑产品ID:', this.newProduct.productId);
            console.log('编辑模式状态:', this.isEdit);
            console.log('发送的请求URL:', `/travel-admin/tourProduct/update/${this.newProduct.productId}`);
            console.log('发送的请求数据:', requestData);
            console.log('请求头:', {
              'Content-Type': 'application/json',
              'X-Merchant-Id': '30001'
            });
            
            const updateResponse = await request({
              url: `/travel-admin/tourProduct/update/${this.newProduct.productId}`,
                method: 'put',
              data: requestData,
                headers: {
                'Content-Type': 'application/json',
                  'X-Merchant-Id': '30001'
                }
              });
            
            console.log('编辑产品响应:', updateResponse);
              this.$message.success('产品更新成功');
            
            // 编辑成功后刷新页面
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            } else {
              // 创建模式
            const createResponse = await request({
                url: '/travel-admin/tourProduct/create',
                method: 'post',
              data: requestData,
                headers: {
                'Content-Type': 'application/json',
                  'X-Merchant-Id': '30001'
                }
              });
            
            console.log('创建响应:', createResponse);
            
            // 处理创建响应
            const responseData = createResponse.data || createResponse;
            if (responseData.code === 1 && responseData.data && responseData.data.productId) {
              const newProductId = responseData.data.productId;
              this.$message.success('产品创建成功');
              
              // 如果有图片需要上传，现在上传
              if (this.newProduct.uploadedImages && this.newProduct.uploadedImages.length > 0) {
                await this.uploadProductImages(newProductId);
            }
            } else {
              throw new Error(responseData.msg || '创建失败');
            }
          }
          
            this.showCreateDialog = false;
          
          // 延迟重置表单，避免触发验证错误
          this.$nextTick(() => {
            this.resetForm();
          });
          
          // 重新加载产品列表
          setTimeout(() => {
            this.loadProducts();
          }, 1000);
          
          } catch (error) {
            console.error('操作失败:', error);
          let errorMessage = this.isEdit ? '产品更新失败' : '产品创建失败';
          
          if (error.response) {
            const errorData = error.response.data;
            errorMessage = errorData.msg || errorData.message || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.$message.error(errorMessage);
        }
      });
    },
    
    createPromotion() {
      this.$message.success('优惠活动创建成功');
      this.showPromotionDialog = false;
    },
    
    resetForm() {
      this.newProduct = {
        productId: null, // 确保productId被重置
        productType: 1,
        productName: '',
        price: 0,
        stock: 0,
        startDate: '',
        endDate: '',
        description: '',
        productTags: '',
        serviceGuarantees: '',
        productSellingPoints: '',
        supplier: '',
        mainImgUrl: '',
        // 酒店客房特殊字段
        roomType: '',
        capacity: 2,
        facilities: [],
        // 旅行路线特殊字段
        days: 1,
        attractions: '',
        mealStandard: '',
        accommodationStandard: '',
        // 门票特殊字段
        validityPeriod: null,
        entryTime: null,
        // 行程数据
        itineraries: [],
        // 费用说明
        costExplanation: {
          adultPrice: 0,
          childPrice: 0,
          infantPrice: 0,
          singleRoomSupplement: 0,
          includeItems: '',
          excludeItems: '',
          optionalItems: '',
          paymentTerms: '',
          refundPolicy: ''
        },
        // 预订须知
        bookingNotice: {
          bookingConditions: '',
          validityPeriod: '',
          bookingDeadline: '',
          cancellationPolicy: '',
          refundPolicy: '',
          specialRequirements: '',
          contactInfo: '',
          emergencyContact: '',
          notes: ''
        },
        // 上传的图片
        uploadedImages: []
      };
      this.dateRange = null;
      this.fileList = [];
      this.activeCreateTab = 'basic';
      this.isEdit = false;
      
      console.log('表单已重置，isEdit:', this.isEdit, 'productId:', this.newProduct.productId);
    },

    resetFilters() {
      this.filters = {
        type: '',
        status: '',
        keyword: ''
      };
      this.$message.success('筛选条件已重置');
    },
    
    handlePreview(file) {
      console.log(file);
    },
    
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    
    // 产品图片上传前验证
    beforeProductUpload(file) {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isLt5M = file.size / 1024 / 1024 < 5;
      
      if (!isValidType) {
        this.$message.error('产品图片只能是 JPG/PNG/GIF 格式!');
        return false;
      }
      if (!isLt5M) {
        this.$message.error('产品图片大小不能超过 5MB!');
        return false;
      }
      return true;
    },
    
    // 简化的图片上传处理
    async uploadProductImageManually(options) {
      try {
        console.log('开始上传产品图片:', options.file);
        
        // 检查文件大小和类型
        if (!this.beforeProductUpload(options.file)) {
          options.onError && options.onError(new Error('文件验证失败'));
          return;
        }
        
        // 如果是编辑模式且有有效产品ID，直接上传
        if (this.isEdit && this.isValidProductId(this.newProduct.productId)) {
        const formData = new FormData();
        formData.append('file', options.file);
          formData.append('productId', this.newProduct.productId);
          formData.append('isMain', 'false');
        
        console.log('产品图片上传数据:', {
          fileName: options.file.name,
          fileSize: options.file.size,
          fileType: options.file.type,
            productId: this.newProduct.productId,
          isMain: false
        });
        
        // 调用后端产品图片上传接口
          const response = await request({
            url: '/travel-admin/upload/product',
            method: 'post',
            data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
              'X-Merchant-Id': '30001'
          }
        });
        
        console.log('产品图片上传响应:', response);
        
        // 解析响应数据
          const responseData = response.data || response;
          if (responseData.code === 1 && responseData.data) {
            const uploadResult = responseData.data;
            
            // 添加到已上传图片列表
            if (!this.newProduct.uploadedImages) {
              this.newProduct.uploadedImages = [];
            }
            this.newProduct.uploadedImages.push({
              fileId: uploadResult.fileId,
              fileName: uploadResult.filename || options.file.name,
              fileUrl: uploadResult.url,
              fileSize: uploadResult.size || options.file.size,
              isMain: false
            });
            
            this.$message.success('图片上传成功');
          options.onSuccess && options.onSuccess(uploadResult, options.file);
        } else {
            throw new Error(responseData.msg || '上传失败');
          }
        } else {
          // 创建模式，保存到本地
          this.saveImageLocally(options.file);
        }
      } catch (error) {
        console.error('图片上传失败:', error);
        let errorMessage = '图片上传失败';
        
        if (error.response) {
          const errorData = error.response.data;
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.$message.error(errorMessage);
        options.onError && options.onError(error);
      }
    },
    
    // 上传成功回调
    handleUploadSuccess(response, file, fileList) {
      console.log('上传成功:', response, file, fileList);
      this.fileList = fileList;
    },

    // 处理文件数量超出限制
    handleExceed(files, fileList) {
      this.$message.warning(`最多只能上传10张图片，当前选择了${files.length}张图片，共选择了${files.length + fileList.length}张图片`);
    },

    // 预览图片
    previewImage(imageUrl) {
      // 使用Element UI的图片预览功能
      this.$alert(`<img src="${imageUrl}" style="width: 100%; max-width: 500px;" />`, '图片预览', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        customClass: 'image-preview-dialog'
      });
    },

    // 设置为主图
    setAsMainImage(index) {
      if (!this.newProduct.uploadedImages || this.newProduct.uploadedImages.length === 0) {
        return;
      }

      // 先将所有图片的isMain设为false
      this.newProduct.uploadedImages.forEach(image => {
        image.isMain = false;
      });

      // 设置选中的图片为主图
      this.newProduct.uploadedImages[index].isMain = true;

      // 更新产品的主图URL
      this.newProduct.mainImgUrl = this.newProduct.uploadedImages[index].fileUrl;

      this.$message.success('已设置为主图');
    },

    // 删除已上传的图片
    removeUploadedImage(index) {
      this.$confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const removedImage = this.newProduct.uploadedImages[index];
        
        // 如果删除的是主图，需要重新设置主图
        if (removedImage.isMain) {
          this.newProduct.uploadedImages.splice(index, 1);
          
          // 如果还有其他图片，设置第一张为主图
          if (this.newProduct.uploadedImages.length > 0) {
            this.newProduct.uploadedImages[0].isMain = true;
            this.newProduct.mainImgUrl = this.newProduct.uploadedImages[0].fileUrl;
          } else {
            this.newProduct.mainImgUrl = '';
          }
        } else {
          this.newProduct.uploadedImages.splice(index, 1);
        }

        this.$message.success('图片删除成功');
      }).catch(() => {
        // 用户取消删除
      });
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    exportData() {
      this.$message.success('数据导出成功');
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    },

    // 验证基本信息是否完整
    validateBasicInfo() {
      const basicFields = [
        'productName', 'price', 'stock', 'description', 
        'productTags', 'serviceGuarantees', 'productSellingPoints', 'supplier'
      ];
      
      console.log('验证基本信息 - 当前数据:', this.newProduct);
      
      for (let field of basicFields) {
        const value = this.newProduct[field];
        console.log(`验证字段 ${field}:`, value, '类型:', typeof value);
        
        if (!value || value.toString().trim() === '') {
          console.log(`字段 ${field} 验证失败:`, value);
          this.$message.error(`请填写完整的基本信息：${this.getFieldLabel(field)}`);
          this.activeCreateTab = 'basic';
          return false;
        }
      }
      console.log('基本信息验证通过');
      return true;
    },

    // 验证每日行程是否完整
    validateItinerary() {
      if (!this.newProduct.itineraries || this.newProduct.itineraries.length === 0) {
        this.$message.error('请至少添加一天的行程安排');
        this.activeCreateTab = 'itinerary';
        return false;
      }

      for (let i = 0; i < this.newProduct.itineraries.length; i++) {
        const day = this.newProduct.itineraries[i];
        if (!day.itineraries || day.itineraries.length === 0) {
          this.$message.error(`第${i + 1}天至少需要添加一个行程安排`);
          this.activeCreateTab = 'itinerary';
          return false;
        }

        for (let j = 0; j < day.itineraries.length; j++) {
          const itinerary = day.itineraries[j];
          if (!itinerary.title || itinerary.title.trim() === '') {
            this.$message.error(`第${i + 1}天第${j + 1}个行程的标题不能为空`);
            this.activeCreateTab = 'itinerary';
            return false;
          }
          if (!itinerary.description || itinerary.description.trim() === '') {
            this.$message.error(`第${i + 1}天第${j + 1}个行程的描述不能为空`);
            this.activeCreateTab = 'itinerary';
            return false;
          }
        }
      }
      return true;
    },

    // 验证费用说明是否完整
    validateCostExplanation() {
      const costFields = [
        'adultPrice', 'childPrice', 'infantPrice', 'singleRoomSupplement',
        'includeItems', 'excludeItems', 'paymentTerms', 'refundPolicy'
      ];
      
      for (let field of costFields) {
        if (!this.newProduct.costExplanation[field] || 
            this.newProduct.costExplanation[field].toString().trim() === '') {
          this.$message.error(`请填写完整的费用说明：${this.getCostFieldLabel(field)}`);
          this.activeCreateTab = 'cost';
          return false;
        }
      }
      return true;
    },

    // 验证预订须知是否完整
    validateBookingNotice() {
      const bookingFields = [
        'bookingConditions', 'validityPeriod', 'bookingDeadline', 
        'cancellationPolicy', 'refundPolicy', 'contactInfo'
      ];
      
      for (let field of bookingFields) {
        if (!this.newProduct.bookingNotice[field] || 
            this.newProduct.bookingNotice[field].toString().trim() === '') {
          this.$message.error(`请填写完整的预订须知：${this.getBookingFieldLabel(field)}`);
          this.activeCreateTab = 'booking';
          return false;
        }
      }
      return true;
    },

    // 获取字段标签
    getFieldLabel(field) {
      const labels = {
        productName: '产品名称',
        price: '价格',
        stock: '库存',
        description: '产品描述',
        productTags: '产品标签',
        serviceGuarantees: '服务保障',
        productSellingPoints: '产品卖点',
        supplier: '供应商'
      };
      return labels[field] || field;
    },

    // 获取费用字段标签
    getCostFieldLabel(field) {
      const labels = {
        adultPrice: '成人价格',
        childPrice: '儿童价格',
        infantPrice: '婴儿价格',
        singleRoomSupplement: '单房差',
        includeItems: '费用包含',
        excludeItems: '费用不含',
        paymentTerms: '支付方式',
        refundPolicy: '退款政策'
      };
      return labels[field] || field;
    },

    // 获取预订字段标签
    getBookingFieldLabel(field) {
      const labels = {
        bookingConditions: '预订条件',
        validityPeriod: '有效期',
        bookingDeadline: '预订截止时间',
        cancellationPolicy: '取消政策',
        refundPolicy: '退款政策',
        contactInfo: '联系信息'
      };
      return labels[field] || field;
    }
  }
}
</script>

<style scoped>
.product-management {
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

/* 统计面板样式 */
.stats-panel {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.sales {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 操作栏样式 */
.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left .el-button {
  margin-right: 10px;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-count {
  color: #409eff;
  font-weight: 500;
}

.filter-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

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

/* 骨架屏样式 */
.skeleton-container {
  margin-bottom: 20px;
}

.skeleton-card {
  margin-bottom: 15px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 产品列表样式 */
.product-list {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
  justify-content: center;
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.product-image {
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

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.product-type {
  margin-top: 4px;
}

.product-type-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.id-cell {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  text-align: center !important;
  padding: 0 8px !important;
}

.product-id {
  font-weight: 600 !important;
  color: #333 !important;
  font-size: 14px !important;
  text-align: center !important;
  white-space: nowrap !important;
  display: block !important;
  width: auto !important;
  min-width: 20px !important;
}

.amount {
  font-weight: bold;
  color: #e6a23c;
  font-size: 16px;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-active {
  color: #67c23a;
  background: #f0f9ff;
}

.status-inactive {
  color: #f56c6c;
  background: #fef0f0;
}

.time-cell {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  text-align: center !important;
}

.create-time {
  font-size: 13px !important;
  color: #666 !important;
  font-weight: 400 !important;
  text-align: center !important;
  white-space: nowrap !important;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.action-row {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
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

.detail-btn {
  background: #d4edda !important;
  color: #155724 !important;
  border-color: #c3e6cb !important;
}

.status-btn {
  background: #fff3cd !important;
  color: #856404 !important;
  border-color: #ffeaa7 !important;
}

.copy-btn {
  background: #d1ecf1 !important;
  color: #0c5460 !important;
  border-color: #bee5eb !important;
}

.delete-btn {
  background: #f8d7da !important;
  color: #721c24 !important;
  border-color: #f5c6cb !important;
}

.pagination {
  text-align: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

.upload-demo {
  width: 100%;
}

/* 导入对话框样式 */
.import-content {
  padding: 20px 0;
}

.import-actions {
  margin-bottom: 20px;
  text-align: center;
}

/* 产品对话框样式 */
.product-dialog .el-dialog__body {
  padding: 20px;
}

.create-tabs {
  min-height: 500px;
}

.create-tabs .el-tab-pane {
  padding: 20px 0;
}

/* 行程管理样式 */
.itinerary-management {
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  min-height: 500px;
}

.itinerary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.header-content h3 {
  margin: 0 0 8px 0;
  color: #2c5aa0;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-content h3::before {
  content: '🗺️';
  font-size: 24px;
}

.header-desc {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.add-day-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.add-day-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.itinerary-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.itinerary-list::-webkit-scrollbar {
  width: 6px;
}

.itinerary-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.itinerary-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.itinerary-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.day-group {
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.day-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.day-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.day-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.day-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.day-number {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.day-title h4 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.day-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.move-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  padding: 6px !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.move-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  transform: scale(1.1);
}

.delete-day-btn {
  background: rgba(220, 53, 69, 0.2) !important;
  border: 1px solid rgba(220, 53, 69, 0.3) !important;
  color: white !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  transition: all 0.2s ease !important;
}

.delete-day-btn:hover {
  background: rgba(220, 53, 69, 0.3) !important;
  border-color: rgba(220, 53, 69, 0.5) !important;
  transform: translateY(-1px);
}

.day-itineraries {
  padding: 24px;
  background: #fafbfc;
}

.itinerary-items {
  margin-bottom: 20px;
}

.itinerary-item {
  margin-bottom: 20px;
}

.itinerary-item:last-child {
  margin-bottom: 0;
}

.itinerary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.itinerary-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.itinerary-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
}

.time-period-selector {
  flex: 0 0 140px;
}

.time-select {
  width: 100%;
}

.time-select .el-input__inner {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.time-select .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.title-input {
  flex: 1;
}

.title-field .el-input__inner {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  font-weight: 600;
  transition: all 0.3s ease;
}

.title-field .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.itinerary-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-itinerary-btn {
  background: #f8d7da !important;
  border: 1px solid #f5c6cb !important;
  color: #721c24 !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
  font-size: 12px !important;
  transition: all 0.2s ease !important;
}

.delete-itinerary-btn:hover {
  background: #f1b0b7 !important;
  border-color: #f1b0b7 !important;
  transform: translateY(-1px);
}

.itinerary-content {
  padding-top: 16px;
}

.description-section {
  margin-bottom: 20px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.field-label i {
  color: #667eea;
  font-size: 16px;
}

.description-textarea .el-textarea__inner {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  resize: none !important;
  min-height: 80px !important;
  max-height: 80px !important;
  height: 80px !important;
  overflow-y: auto;
}

.description-textarea .el-textarea__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.description-textarea .el-textarea__inner::-webkit-resizer {
  display: none !important;
}

.details-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-input .el-input__inner {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.detail-input .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.add-itinerary-section {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
  transition: all 0.3s ease;
}

.add-itinerary-section:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.add-itinerary-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  transition: all 0.3s ease;
}

.add-itinerary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.empty-itinerary {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin-top: 20px;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  color: #dee2e6;
  margin-bottom: 20px;
}

.empty-content h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 18px;
  font-weight: 600;
}

.empty-content p {
  margin: 0 0 24px 0;
  color: #6c757d;
  line-height: 1.6;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 费用说明样式 */
.cost-explanation {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.cost-explanation .el-form-item {
  margin-bottom: 20px;
}

/* 预订须知样式 */
.booking-notice {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.booking-notice .el-form-item {
  margin-bottom: 20px;
}

/* 对话框内容样式 */
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-management {
    padding: 10px;
  }
  
  .stats-panel .el-col {
    margin-bottom: 10px;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-left, .action-right {
    width: 100%;
    justify-content: center;
  }
  
  .filter-section .el-col {
    margin-bottom: 10px;
  }
  
  .product-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .itinerary-management {
    padding: 16px;
  }
  
  .itinerary-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-content {
    text-align: center;
  }
  
  .day-itineraries {
    padding: 16px;
  }
  
  .itinerary-card {
    padding: 16px;
  }
  
  .itinerary-header-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .time-period-selector {
    flex: none;
    width: 100%;
  }
  
  .title-input {
    width: 100%;
  }
  
  .itinerary-actions {
    justify-content: center;
    width: 100%;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .day-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  
  .day-number {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .day-title {
    flex-direction: column;
    gap: 16px;
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

/* 全局输入框样式 - 固定大小并去掉调整图标 */
.el-textarea__inner {
  resize: none !important;
}

.el-textarea__inner::-webkit-resizer {
  display: none !important;
}

/* 确保所有textarea都不能调整大小 */
textarea {
  resize: none !important;
}

textarea::-webkit-resizer {
  display: none !important;
}

/* 全局强制覆盖Element UI的textarea调整功能 */
.el-textarea .el-textarea__inner {
  resize: none !important;
}

.el-textarea .el-textarea__inner::-webkit-resizer {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* 最高优先级覆盖 */
.el-input--suffix .el-textarea__inner,
.el-input-group .el-textarea__inner,
.el-form-item .el-textarea__inner {
  resize: none !important;
}

.el-input--suffix .el-textarea__inner::-webkit-resizer,
.el-input-group .el-textarea__inner::-webkit-resizer,
.el-form-item .el-textarea__inner::-webkit-resizer {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* 行程描述输入框特殊处理 - 确保固定大小 */
.description-textarea .el-textarea__inner,
.description-textarea textarea,
.description-textarea .el-textarea__inner::-webkit-resizer {
  resize: none !important;
  min-height: 80px !important;
  max-height: 80px !important;
  height: 80px !important;
  overflow-y: auto !important;
}

.description-textarea .el-textarea__inner::-webkit-resizer,
.description-textarea textarea::-webkit-resizer {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* 更强力的覆盖 - 针对Element UI的textarea */
.el-textarea.description-textarea .el-textarea__inner,
.el-textarea.description-textarea textarea {
  resize: none !important;
  min-height: 80px !important;
  max-height: 80px !important;
  height: 80px !important;
  overflow-y: auto !important;
}

.el-textarea.description-textarea .el-textarea__inner::-webkit-resizer,
.el-textarea.description-textarea textarea::-webkit-resizer {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* 行程描述输入框的滚动条美化 */
.description-textarea .el-textarea__inner::-webkit-scrollbar {
  width: 4px;
}

.description-textarea .el-textarea__inner::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.description-textarea .el-textarea__inner::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.description-textarea .el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 费用说明和预订须知的输入框 */
.cost-explanation .el-textarea__inner,
.booking-notice .el-textarea__inner {
  resize: none !important;
  min-height: 60px !important;
  max-height: 100px !important;
}

.cost-explanation .el-textarea__inner::-webkit-resizer,
.booking-notice .el-textarea__inner::-webkit-resizer {
  display: none !important;
}

/* 产品详情对话框样式 */
.product-detail-dialog .el-dialog__body {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}

.product-detail-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 8px 8px 0 0;
}

.product-detail-dialog .el-dialog__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.product-detail-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.product-detail-content {
  padding: 20px;
  background: #f8f9fa;
  min-height: 500px;
}

/* 产品头部样式 */
.product-header {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e9ecef;
}

.product-title-section {
  flex: 1;
}

.product-title {
  margin: 0 0 10px 0;
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.3;
}

.product-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.type-tag,
.status-tag {
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.product-price-section {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px solid #e9ecef;
  min-width: 140px;
}

.price-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 6px;
}

.price-symbol {
  font-size: 18px;
  color: #e6a23c;
  font-weight: 600;
  margin-right: 2px;
}

.price-value {
  font-size: 32px;
  color: #e6a23c;
  font-weight: 700;
  line-height: 1;
}

.price-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

/* 详情区域样式 */
.detail-section {
  margin-bottom: 18px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.detail-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f3f4;
}

.section-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1;
  text-align: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.section-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 8px;
}

.section-icon i {
  display: block;
  line-height: 1;
  font-size: 18px;
  width: 18px;
  height: 18px;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* 不同图标的颜色主题 */
.section-header:nth-child(1) .section-icon,
.section-header:has(.el-icon-goods) .section-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.section-header:nth-child(2) .section-icon,
.section-header:has(.el-icon-document) .section-icon {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
}

.section-header:nth-child(3) .section-icon,
.section-header:has(.el-icon-collection-tag) .section-icon {
  background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
  box-shadow: 0 2px 8px rgba(69, 183, 209, 0.3);
}

.section-header:nth-child(4) .section-icon,
.section-header:has(.el-icon-shield) .section-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 2px 8px rgba(240, 147, 251, 0.3);
}

.section-header:nth-child(5) .section-icon,
.section-header:has(.el-icon-star-on) .section-icon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  box-shadow: 0 2px 8px rgba(252, 182, 159, 0.3);
}

.section-header:nth-child(6) .section-icon,
.section-header:has(.el-icon-money) .section-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  box-shadow: 0 2px 8px rgba(168, 237, 234, 0.3);
}

.section-header:nth-child(7) .section-icon,
.section-header:has(.el-icon-document-copy) .section-icon {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
  box-shadow: 0 2px 8px rgba(210, 153, 194, 0.3);
}

.section-header:nth-child(8) .section-icon,
.section-header:has(.el-icon-map-location) .section-icon {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
  box-shadow: 0 2px 8px rgba(137, 247, 254, 0.3);
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

/* 信息网格样式 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.info-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-label i {
  color: #667eea;
  font-size: 13px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.product-images {
  text-align: center;
  margin-top: 16px;
}

.main-image {
  width: 200px;
  height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  color: #495057;
  margin-top: 16px;
}

.tags-content,
.guarantees-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.selling-points-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  color: #495057;
  margin-top: 16px;
}

.cost-explanation-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 16px;
}

.cost-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
}

.cost-item label {
  font-weight: 600;
  color: #495057;
  min-width: 80px;
  margin-right: 8px;
}

.cost-item span {
  color: #e6a23c;
  font-weight: bold;
}

.cost-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.cost-detail-item {
  margin-bottom: 15px;
}

.cost-detail-item label {
  font-weight: 600;
  color: #495057;
  display: block;
  margin-bottom: 5px;
}

.cost-detail-item p {
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #2c5aa0;
}

.booking-notice-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 16px;
}

.notice-item {
  margin-bottom: 15px;
}

.notice-item label {
  font-weight: 600;
  color: #495057;
  display: block;
  margin-bottom: 5px;
}

.notice-item p {
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #28a745;
}

.itineraries-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 16px;
}

.day-itinerary {
  margin-bottom: 25px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
}

.day-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.day-content {
  padding: 20px;
}

.itinerary-item {
  display: flex;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.itinerary-item:last-child {
  margin-bottom: 0;
}

.itinerary-time {
  min-width: 60px;
  font-weight: 600;
  color: #2c5aa0;
  margin-right: 15px;
  padding: 5px 10px;
  background: #e3f2fd;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
}

.itinerary-content {
  flex: 1;
}

.itinerary-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  font-size: 14px;
}

.itinerary-description {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
  font-size: 13px;
}

.itinerary-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.itinerary-details span {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 必填提示样式 */
.required-tip {
  color: #f56c6c;
  font-size: 12px;
  font-weight: normal;
  margin-left: 8px;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h3 {
  margin: 0 0 8px 0;
  color: #2c5aa0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.section-desc {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}

/* 表单必填字段样式 */
.el-form-item.is-required .el-form-item__label::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

/* 产品类型选择器样式 */
.product-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.type-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  overflow: hidden;
}

.type-option:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.type-option.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.type-option.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
}

.type-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.type-option:nth-child(1) .type-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.type-option:nth-child(2) .type-icon {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.type-option:nth-child(3) .type-icon {
  background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
  color: white;
}

.type-option.active .type-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.type-icon i {
  font-size: 20px;
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

.type-option.active .type-name {
  color: #409eff;
}

.type-option.active .type-desc {
  color: #5a6c7d;
}

/* 产品图片上传样式 */
.product-image-upload {
  width: 100%;
}

.uploaded-images {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.uploaded-images h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.image-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-wrapper:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.image-overlay .el-button {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.image-info {
  padding: 8px;
}

.image-name {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  margin: 0;
  font-size: 11px;
  color: #666;
}

/* 图片预览对话框样式 */
.image-preview-dialog .el-message-box__content {
  text-align: center;
  padding: 20px;
}

.image-preview-dialog .el-message-box__content img {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .product-detail-content {
    padding: 12px;
  }
  
  .product-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .product-title {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .product-meta {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .product-price-section {
    min-width: auto;
    width: 100%;
    padding: 12px;
  }
  
  .detail-section {
    padding: 14px;
    margin-bottom: 14px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .info-item {
    padding: 10px;
  }
  
  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .section-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
    border-radius: 6px;
  }
  
  .section-icon i {
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .main-image {
    width: 150px;
    height: 120px;
  }
  
  .cost-explanation-content,
  .booking-notice-content,
  .itineraries-content {
    padding: 15px;
  }
  
  .itinerary-item {
    flex-direction: column;
  }
  
  .itinerary-time {
    margin-bottom: 10px;
    margin-right: 0;
  }
  
  .section-header h3 {
    font-size: 14px;
  }
  
  .section-desc {
    font-size: 12px;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .image-wrapper {
    height: 100px;
  }
  
  .image-overlay .el-button {
    padding: 2px 6px;
    font-size: 10px;
  }
  
  .image-info {
    padding: 6px;
  }
  
  .image-name {
    font-size: 11px;
  }
  
  .image-size {
    font-size: 10px;
  }
  
  /* 产品类型选择器移动端样式 */
  .product-type-selector {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .type-option {
    padding: 12px;
  }
  
  .type-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .type-icon i {
    font-size: 18px;
  }
  
  .type-name {
    font-size: 14px;
  }
  
  .type-desc {
    font-size: 12px;
  }
}
</style>
