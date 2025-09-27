<template>
  <div class="product-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">产品管理</h1>
      <p class="subtitle">管理您的旅游产品，包括酒店、路线和门票</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 创建产品
      </el-button>
      <el-button type="success" @click="showPromotionDialog = true">
        <i class="el-icon-present"></i> 设置优惠活动
      </el-button>
      <el-button type="info" @click="exportData">
        <i class="el-icon-download"></i> 导出数据
      </el-button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filters.type" placeholder="产品类型" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="酒店客房" value="hotel"></el-option>
            <el-option label="旅行路线" value="route"></el-option>
            <el-option label="门票" value="ticket"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filters.status" placeholder="状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="上架" value="active"></el-option>
            <el-option label="下架" value="inactive"></el-option>
            <el-option label="草稿" value="draft"></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索产品名称"
            prefix-icon="el-icon-search"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchProducts">搜索</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 产品列表 -->
    <div class="product-list">
      <el-table :data="filteredProducts" v-loading="loading" stripe>
        <el-table-column prop="productId" label="ID" width="80"></el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="200">
          <template slot-scope="scope">
            <div class="product-info">
              <img :src="scope.row.mainImgUrl || '/src/assets/images/travel.jpg'" class="product-image" />
              <div class="product-details">
                <div class="product-name">{{ scope.row.productName }}</div>
                <div class="product-type">
                  <el-tag :type="getTypeTagType(scope.row.productType)" size="mini">
                    {{ getTypeName(scope.row.productType) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template slot-scope="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100"></el-table-column>
        <el-table-column prop="soldCount" label="销量" width="100"></el-table-column>
        <el-table-column prop="productStatus" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.productStatus)" size="mini">
              {{ getStatusName(scope.row.productStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="editProduct(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="viewDetails(scope.row)">详情</el-button>
            <el-button size="mini" type="warning" @click="toggleStatus(scope.row)">
              {{ scope.row.productStatus === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteProduct(scope.row)">删除</el-button>
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
    <el-dialog title="创建产品" :visible.sync="showCreateDialog" width="800px">
      <el-form :model="newProduct" :rules="productRules" ref="productForm" label-width="100px">
        <el-form-item label="产品类型" prop="productType">
          <el-radio-group v-model="newProduct.productType">
            <el-radio :label="1">旅行路线</el-radio>
            <el-radio :label="2">酒店客房</el-radio>
            <el-radio :label="3">景区门票</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="newProduct.productName" placeholder="请输入产品名称"></el-input>
        </el-form-item>
        
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="newProduct.price" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="newProduct.stock" :min="0"></el-input-number>
        </el-form-item>
        
        <!-- 酒店客房特殊字段 -->
        <template v-if="newProduct.type === 'hotel'">
          <el-form-item label="房型">
            <el-input v-model="newProduct.roomType" placeholder="如：标准间、豪华套房"></el-input>
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
        <template v-if="newProduct.type === 'route'">
          <el-form-item label="行程天数">
            <el-input-number v-model="newProduct.days" :min="1"></el-input-number>
          </el-form-item>
          <el-form-item label="景点清单">
            <el-input type="textarea" v-model="newProduct.attractions" placeholder="请输入景点名称，用逗号分隔"></el-input>
          </el-form-item>
          <el-form-item label="餐饮标准">
            <el-input v-model="newProduct.mealStandard" placeholder="如：含早餐、全包餐"></el-input>
          </el-form-item>
          <el-form-item label="住宿标准">
            <el-input v-model="newProduct.accommodationStandard" placeholder="如：三星级酒店"></el-input>
          </el-form-item>
        </template>
        
        <!-- 门票特殊字段 -->
        <template v-if="newProduct.type === 'ticket'">
          <el-form-item label="使用有效期">
            <el-date-picker
              v-model="newProduct.validityPeriod"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="入园时段">
            <el-time-picker
              v-model="newProduct.entryTime"
              placeholder="选择时间">
            </el-time-picker>
          </el-form-item>
        </template>
        
        <el-form-item label="产品描述">
          <el-input type="textarea" v-model="newProduct.description" :rows="3"></el-input>
        </el-form-item>
        
        <el-form-item label="产品标签">
          <el-input v-model="newProduct.productTags" placeholder="请输入产品标签，用逗号分隔"></el-input>
        </el-form-item>
        
        <el-form-item label="服务保障">
          <el-input v-model="newProduct.serviceGuarantees" placeholder="请输入服务保障，用逗号分隔"></el-input>
        </el-form-item>
        
        <el-form-item label="产品卖点">
          <el-input type="textarea" v-model="newProduct.productSellingPoints" :rows="2"></el-input>
        </el-form-item>
        
        <el-form-item label="供应商">
          <el-input v-model="newProduct.supplier" placeholder="请输入供应商"></el-input>
        </el-form-item>
        
        <el-form-item label="产品图片">
          <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持多角度展示，建议上传3-5张图片</div>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createProduct">确定</el-button>
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
      newProduct: {
        productType: 1,
        productName: '',
        price: 0,
        stock: 0,
        description: '',
        productTags: '',
        serviceGuarantees: '',
        productSellingPoints: '',
        supplier: ''
      },
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
        ]
      },
      fileList: [],
      products: []
    }
  },
  created() {
    this.loadProducts();
  },
  computed: {
    filteredProducts() {
      let filtered = this.products;
      
      if (this.filters.type) {
        filtered = filtered.filter(p => p.productType === this.filters.type);
      }
      
      if (this.filters.status) {
        filtered = filtered.filter(p => p.productStatus === this.filters.status);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(p => 
          p.productName.toLowerCase().includes(this.filters.keyword.toLowerCase())
        );
      }
      
      return filtered;
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
    async loadProducts() {
      this.loading = true;
      try {
        const response = await request({
          url: '/travel-portal/tourProduct/getAllProducts',
          method: 'get'
        });
        this.products = response;
        this.$message.success('产品列表加载成功');
      } catch (error) {
        this.$message.error('产品列表加载失败');
        console.error('加载产品失败:', error);
      } finally {
        this.loading = false;
      }
    },
    searchProducts() {
      // 搜索逻辑已在computed中实现
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
    
    editProduct(product) {
      this.newProduct = { ...product };
      this.showCreateDialog = true;
    },
    
    viewDetails(product) {
      this.$message.info(`查看产品详情: ${product.name}`);
    },
    
    toggleStatus(product) {
      product.status = product.status === 'active' ? 'inactive' : 'active';
      this.$message.success(`产品已${product.status === 'active' ? '上架' : '下架'}`);
    },
    
    deleteProduct(product) {
      this.$confirm('确定要删除这个产品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index > -1) {
          this.products.splice(index, 1);
          this.$message.success('删除成功');
        }
      });
    },
    
    async createProduct() {
      this.$refs.productForm.validate(async (valid) => {
        if (valid) {
          try {
            await request({
              url: '/travel-portal/tourProduct/create',
              method: 'post',
              data: this.newProduct
            });
            this.showCreateDialog = false;
            this.$message.success('产品创建成功');
            this.resetForm();
            this.loadProducts(); // 重新加载产品列表
          } catch (error) {
            this.$message.error('产品创建失败');
            console.error('创建产品失败:', error);
          }
        }
      });
    },
    
    createPromotion() {
      this.$message.success('优惠活动创建成功');
      this.showPromotionDialog = false;
    },
    
    resetForm() {
      this.newProduct = {
        productType: 1,
        productName: '',
        price: 0,
        stock: 0,
        description: '',
        productTags: '',
        serviceGuarantees: '',
        productSellingPoints: '',
        supplier: ''
      };
      this.fileList = [];
    },
    
    handlePreview(file) {
      console.log(file);
    },
    
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    
    exportData() {
      this.$message.success('数据导出成功');
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

.product-list {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-type {
  margin-top: 4px;
}

.price {
  font-weight: bold;
  color: #e6a23c;
}

.pagination {
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

.upload-demo {
  width: 100%;
}
</style>
