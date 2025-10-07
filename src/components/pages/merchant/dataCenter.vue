<template>
  <div class="data-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="title">数据中心</h1>
          <p class="subtitle">查看运营数据，分析用户画像，对比竞品数据</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-refresh" @click="refreshData">刷新数据</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportReport">导出报表</el-button>
        </div>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="stats-panel">
      <el-card class="stats-card">
        <div slot="header" class="stats-header">
          <i class="el-icon-data-line"></i>
          <span>数据概览</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon revenue">
                <span style="font-size: 24px; color: white;">¥</span>
              </div>
              <div class="stat-content">
                <div class="stat-number">¥{{ overviewData.totalRevenue }}</div>
                <div class="stat-label">总销售额</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+12.5%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon orders">
                <i class="el-icon-tickets"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overviewData.totalOrders }}</div>
                <div class="stat-label">总订单数</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+8.3%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon customers">
                <i class="el-icon-user"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overviewData.totalCustomers }}</div>
                <div class="stat-label">总客户数</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+15.2%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon rating">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ overviewData.averageRating }}</div>
                <div class="stat-label">平均评分</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+0.2</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <div class="filter-container">
          <div class="filter-header">
            <div class="filter-title">
              <i class="el-icon-filter"></i>
              <span>筛选条件</span>
            </div>
            <div class="filter-actions">
              <el-button type="primary" class="search-btn" @click="refreshData">
                <i class="el-icon-search"></i>
                查询
              </el-button>
              <el-button class="reset-btn" @click="resetFilters">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </div>
          </div>
          
          <div class="filter-content">
            <div class="filter-row">
              <div class="filter-item date-filter-item">
                <div class="filter-label">
                  <i class="el-icon-date"></i>
                  <span>时间范围</span>
                </div>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="filter-date-picker"
                  style="width: 100%; min-width: 320px;"
                  @change="handleDateChange">
                </el-date-picker>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-time"></i>
                  <span>时间类型</span>
                </div>
                <el-select v-model="timeType" placeholder="请选择时间类型" clearable class="filter-select" @change="handleTimeTypeChange">
                  <el-option label="按日" value="day">
                    <span style="float: left">按日</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">每日数据</span>
                  </el-option>
                  <el-option label="按周" value="week">
                    <span style="float: left">按周</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">每周数据</span>
                  </el-option>
                  <el-option label="按月" value="month">
                    <span style="float: left">按月</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">每月数据</span>
                  </el-option>
                  <el-option label="按季度" value="quarter">
                    <span style="float: left">按季度</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">每季度数据</span>
                  </el-option>
                </el-select>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-goods"></i>
                  <span>产品类型</span>
                </div>
                <el-select v-model="productType" placeholder="请选择产品类型" clearable class="filter-select" @change="handleProductTypeChange">
                  <el-option label="全部类型" value=""></el-option>
                  <el-option label="酒店客房" value="hotel">
                    <span style="float: left">酒店客房</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">住宿服务</span>
                  </el-option>
                  <el-option label="旅行路线" value="route">
                    <span style="float: left">旅行路线</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">旅游套餐</span>
                  </el-option>
                  <el-option label="门票" value="ticket">
                    <span style="float: left">门票</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">景点门票</span>
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 销售趋势图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>销售趋势</h3>
              <el-radio-group v-model="salesChartType" size="mini">
                <el-radio-button label="revenue">销售额</el-radio-button>
                <el-radio-button label="orders">订单数</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-content">
              <div id="salesChart" style="width: 100%; height: 300px;"></div>
            </div>
          </div>
        </el-col>
        
        <!-- 产品分布图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>产品分布</h3>
              <el-radio-group v-model="productChartType" size="mini">
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-content">
              <div id="productChart" style="width: 100%; height: 300px;"></div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 用户画像 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>用户年龄分布</h3>
            </div>
            <div class="chart-content">
              <div id="ageChart" style="width: 100%; height: 250px;"></div>
            </div>
          </div>
        </el-col>
        
        <!-- 地域分布 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>地域分布</h3>
            </div>
            <div class="chart-content">
              <div id="regionChart" style="width: 100%; height: 250px;"></div>
            </div>
          </div>
        </el-col>
        
        <!-- 复购率 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>复购率分析</h3>
            </div>
            <div class="chart-content">
              <div id="repurchaseChart" style="width: 100%; height: 250px;"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="data-tables">
      <el-tabs v-model="activeTab">
        <!-- 销售数据 -->
        <el-tab-pane label="销售数据" name="sales">
          <div class="table-section">
            <div class="table-header">
              <h3>销售数据详情</h3>
              <el-button type="primary" size="small" @click="exportSalesData">导出数据</el-button>
            </div>
            <el-table :data="salesData" stripe>
                <el-table-column prop="date" label="日期" width="120" align="center"></el-table-column>
                <el-table-column prop="revenue" label="销售额" width="120" align="center">
                  <template slot-scope="scope">
                    <span class="amount">¥{{ scope.row.revenue }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="orders" label="订单数" width="100" align="center"></el-table-column>
                <el-table-column prop="customers" label="客户数" width="100" align="center"></el-table-column>
                <el-table-column prop="avgOrderValue" label="客单价" width="120" align="center">
                  <template slot-scope="scope">
                    <span class="amount">¥{{ scope.row.avgOrderValue }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="conversionRate" label="转化率" width="100" align="center">
                  <template slot-scope="scope">
                    <span class="percentage">{{ scope.row.conversionRate }}%</span>
                  </template>
                </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 产品数据 -->
        <el-tab-pane label="产品数据" name="products">
          <div class="table-section">
            <div class="table-header">
              <h3>产品数据详情</h3>
              <el-button type="primary" size="small" @click="exportProductData">导出数据</el-button>
            </div>
            <el-table :data="productData" stripe>
              <el-table-column prop="name" label="产品名称" min-width="200"></el-table-column>
              <el-table-column prop="type" label="类型" width="100">
                <template slot-scope="scope">
                  <el-tag :type="getTypeTagType(scope.row.type)" size="mini">
                    {{ getTypeName(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sales" label="销量" width="100"></el-table-column>
              <el-table-column prop="revenue" label="收入" width="120">
                <template slot-scope="scope">
                  <span class="amount">¥{{ scope.row.revenue }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="views" label="浏览量" width="100"></el-table-column>
              <el-table-column prop="conversionRate" label="转化率" width="100">
                <template slot-scope="scope">
                  <span class="percentage">{{ scope.row.conversionRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="rating" label="评分" width="100">
                <template slot-scope="scope">
                  <el-rate v-model="scope.row.rating" disabled show-score text-color="#ff9900"></el-rate>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 竞品对比 -->
        <el-tab-pane label="竞品对比" name="competitors">
          <div class="table-section">
            <div class="table-header">
              <h3>竞品对比分析</h3>
              <el-button type="primary" size="small" @click="exportCompetitorData">导出数据</el-button>
            </div>
            <el-table :data="competitorData" stripe>
              <el-table-column prop="name" label="竞品名称" width="150"></el-table-column>
              <el-table-column prop="price" label="平均价格" width="120">
                <template slot-scope="scope">
                  <span class="amount">¥{{ scope.row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="rating" label="评分" width="120">
                <template slot-scope="scope">
                  <el-rate v-model="scope.row.rating" disabled show-score text-color="#ff9900"></el-rate>
                </template>
              </el-table-column>
              <el-table-column prop="reviews" label="评价数" width="100"></el-table-column>
              <el-table-column prop="marketShare" label="市场份额" width="120">
                <template slot-scope="scope">
                  <span class="percentage">{{ scope.row.marketShare }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="advantage" label="优势" min-width="200">
                <template slot-scope="scope">
                  <el-tag
                    v-for="advantage in scope.row.advantages"
                    :key="advantage"
                    size="mini"
                    class="advantage-tag">
                    {{ advantage }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="trend" label="趋势" width="100">
                <template slot-scope="scope">
                  <span :class="getTrendClass(scope.row.trend)">
                    <i :class="getTrendIcon(scope.row.trend)"></i> {{ scope.row.trend }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 数据洞察 -->
    <div class="insights-section">
      <h3>数据洞察</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="insight-card">
            <div class="insight-icon positive">
              <i class="el-icon-trophy"></i>
            </div>
            <div class="insight-content">
              <h4>销售亮点</h4>
              <p>本月销售额较上月增长12.5%，主要得益于酒店产品的热销。海景房产品表现尤为突出，占总销售额的45%。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="insight-card">
            <div class="insight-icon warning">
              <i class="el-icon-warning"></i>
            </div>
            <div class="insight-content">
              <h4>需要关注</h4>
              <p>门票类产品转化率有所下降，建议优化产品展示和价格策略。同时，客户复购率需要提升。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="insight-card">
            <div class="insight-icon info">
              <i class="el-icon-edit-outline"></i>
            </div>
            <div class="insight-content">
              <h4>改进建议</h4>
              <p>建议增加针对年轻用户群体的产品推广，优化移动端用户体验，提升客户满意度。</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataCenter',
  data() {
    return {
      dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
      timeType: 'day',
      productType: '',
      salesChartType: 'revenue',
      productChartType: 'pie',
      activeTab: 'sales',
      overviewData: {
        totalRevenue: '1,234,567',
        totalOrders: 1234,
        totalCustomers: 567,
        averageRating: 4.6
      },
      salesData: [
        { date: '2024-01-01', revenue: 45678, orders: 23, customers: 18, avgOrderValue: 1986, conversionRate: 12.5 },
        { date: '2024-01-02', revenue: 52341, orders: 28, customers: 22, avgOrderValue: 1869, conversionRate: 14.2 },
        { date: '2024-01-03', revenue: 38912, orders: 19, customers: 15, avgOrderValue: 2048, conversionRate: 10.8 },
        { date: '2024-01-04', revenue: 67890, orders: 35, customers: 28, avgOrderValue: 1940, conversionRate: 16.3 },
        { date: '2024-01-05', revenue: 45623, orders: 24, customers: 20, avgOrderValue: 1901, conversionRate: 13.1 }
      ],
      productData: [
        { name: '豪华海景套房', type: 'hotel', sales: 156, revenue: 201168, views: 1234, conversionRate: 12.6, rating: 4.8 },
        { name: '三亚三日游', type: 'route', sales: 89, revenue: 230492, views: 567, conversionRate: 15.7, rating: 4.6 },
        { name: '故宫门票', type: 'ticket', sales: 2345, revenue: 140700, views: 4567, conversionRate: 51.4, rating: 4.9 },
        { name: '标准间', type: 'hotel', sales: 234, revenue: 187200, views: 890, conversionRate: 26.3, rating: 4.4 },
        { name: '北京一日游', type: 'route', sales: 67, revenue: 134000, views: 234, conversionRate: 28.6, rating: 4.5 }
      ],
      competitorData: [
        { name: '竞品A', price: 1200, rating: 4.5, reviews: 1234, marketShare: 25, advantages: ['价格优势', '服务好'], trend: '上升' },
        { name: '竞品B', price: 1500, rating: 4.7, reviews: 2345, marketShare: 30, advantages: ['品牌知名度', '产品丰富'], trend: '稳定' },
        { name: '竞品C', price: 1000, rating: 4.3, reviews: 890, marketShare: 20, advantages: ['价格低', '覆盖广'], trend: '下降' },
        { name: '竞品D', price: 1800, rating: 4.8, reviews: 3456, marketShare: 25, advantages: ['高端定位', '质量好'], trend: '上升' }
      ]
    }
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    initCharts() {
      this.$nextTick(() => {
        this.initSalesChart();
        this.initProductChart();
        this.initAgeChart();
        this.initRegionChart();
        this.initRepurchaseChart();
      });
    },
    
    initSalesChart() {
      // 这里应该使用真实的图表库，如ECharts
      console.log('初始化销售趋势图');
    },
    
    initProductChart() {
      console.log('初始化产品分布图');
    },
    
    initAgeChart() {
      console.log('初始化年龄分布图');
    },
    
    initRegionChart() {
      console.log('初始化地域分布图');
    },
    
    initRepurchaseChart() {
      console.log('初始化复购率图');
    },
    
    handleDateChange() {
      this.refreshData();
    },
    
    handleTimeTypeChange() {
      this.refreshData();
    },
    
    handleProductTypeChange() {
      this.refreshData();
    },
    
    refreshData() {
      this.$message.success('数据已刷新');
      this.initCharts();
    },
    
    resetFilters() {
      this.dateRange = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()];
      this.timeType = 'day';
      this.productType = '';
      this.$message.success('筛选条件已重置');
    },
    
    exportReport() {
      this.$message.success('报表导出成功');
    },
    
    exportSalesData() {
      this.$message.success('销售数据导出成功');
    },
    
    exportProductData() {
      this.$message.success('产品数据导出成功');
    },
    
    exportCompetitorData() {
      this.$message.success('竞品数据导出成功');
    },
    
    getTypeName(type) {
      const typeMap = {
        hotel: '酒店客房',
        route: '旅行路线',
        ticket: '门票'
      };
      return typeMap[type] || type;
    },
    
    getTypeTagType(type) {
      const typeMap = {
        hotel: 'primary',
        route: 'success',
        ticket: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getTrendClass(trend) {
      const classMap = {
        '上升': 'trend-up',
        '下降': 'trend-down',
        '稳定': 'trend-stable'
      };
      return classMap[trend] || '';
    },
    
    getTrendIcon(trend) {
      const iconMap = {
        '上升': 'el-icon-arrow-up',
        '下降': 'el-icon-arrow-down',
        '稳定': 'el-icon-minus'
      };
      return iconMap[trend] || '';
    }
  }
}
</script>

<style scoped>
.data-center {
  padding: 24px;
  min-height: 100vh;
}


/* 页面标题 */
.page-header {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计面板 */
.stats-panel {
  margin-bottom: 24px;
}

.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.stats-header i {
  color: #3b82f6;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f2f5;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e1e6eb;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
  border-radius: 12px;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.customers {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.rating {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon i {
  font-size: 24px;
  position: relative;
  z-index: 1;
}

/* 确保图标正确显示 */
.stat-icon.revenue i.el-icon-coin {
  font-size: 24px !important;
  color: white !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 备用图标样式 */
.stat-icon.revenue i {
  font-size: 24px !important;
  color: white !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend i {
  font-size: 12px;
}

.stat-trend .el-icon-top {
  color: #52c41a;
}

.stat-trend .el-icon-bottom {
  color: #ff4d4f;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

.filter-container {
  padding: 0;
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

.search-btn,
.reset-btn {
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

.search-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.filter-content {
  padding: 24px;
  background: #fafbfc;
}

.filter-row {
  display: flex;
  gap: 16px;
  margin: 0;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  max-width: 280px;
}

.date-filter-item {
  flex: 1.5 !important;
  min-width: 320px !important;
  max-width: 400px !important;
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

.filter-select,
.filter-date-picker {
  width: 100%;
}

.filter-select .el-input__inner,
.filter-date-picker .el-input__inner {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.filter-select .el-input__inner:focus,
.filter-date-picker .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.filter-select .el-input__inner:hover,
.filter-date-picker .el-input__inner:hover {
  border-color: #c0c4cc;
  background: white;
}

/* 日期选择器特殊样式 */
.filter-date-picker .el-range-editor {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  min-width: 320px !important;
}

.filter-date-picker .el-range-input {
  min-width: 120px !important;
  flex: 1;
}

.filter-date-picker .el-range-separator {
  padding: 0 16px !important;
  min-width: 32px !important;
  display: inline-block !important;
  text-align: center !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.chart-content {
  padding: 0 20px 20px 20px;
}

.data-tables {
  margin-bottom: 30px;
}

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.table-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.amount {
  font-weight: bold;
  color: #e6a23c;
}

.percentage {
  font-weight: bold;
  color: #409EFF;
}

/* 确保表格内容居中 */
.table-section .el-table th,
.table-section .el-table td {
  text-align: center !important;
  vertical-align: middle !important;
}

/* 强制表格内容居中 */
.data-tables .el-table th,
.data-tables .el-table td {
  text-align: center !important;
  vertical-align: middle !important;
}

.data-tables .el-table .cell {
  text-align: center !important;
  justify-content: center !important;
}

/* 全局表格居中样式 */
.el-table th,
.el-table td {
  text-align: center !important;
  vertical-align: middle !important;
}

.el-table .cell {
  text-align: center !important;
  justify-content: center !important;
  display: flex !important;
  align-items: center !important;
}

/* 强制所有表格内容居中 */
.data-center .el-table th,
.data-center .el-table td,
.data-center .el-table .cell {
  text-align: center !important;
  vertical-align: middle !important;
}

.data-center .el-table .cell {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}




.advantage-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.trend-up {
  color: #28a745;
}

.trend-down {
  color: #dc3545;
}

.trend-stable {
  color: #6c757d;
}

.insights-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.insights-section .el-row {
  display: flex;
  align-items: stretch;
}

.insights-section .el-col {
  display: flex;
  flex-direction: column;
}

.insights-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
}

.insight-card {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 140px;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.insight-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.insight-icon.positive {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
}

.insight-icon.warning {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
}

.insight-icon.info {
  background: linear-gradient(135deg, #d1ecf1, #bee5eb);
  color: #0c5460;
}

.insight-icon i {
  font-size: 20px;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 确保info图标显示 */
.insight-icon.info i.el-icon-edit-outline {
  font-size: 20px !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.insight-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.insight-content h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.insight-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}
</style>
