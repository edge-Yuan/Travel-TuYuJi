<template>
  <div class="data-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">数据中心</h1>
      <p class="subtitle">查看运营数据，分析用户画像，对比竞品数据</p>
    </div>

    <!-- 数据概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon revenue">
              <i class="el-icon-money"></i>
            </div>
            <div class="card-content">
              <div class="card-number">¥{{ overviewData.totalRevenue }}</div>
              <div class="card-label">总销售额</div>
              <div class="card-trend positive">
                <i class="el-icon-arrow-up"></i> +12.5%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon orders">
              <i class="el-icon-tickets"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ overviewData.totalOrders }}</div>
              <div class="card-label">总订单数</div>
              <div class="card-trend positive">
                <i class="el-icon-arrow-up"></i> +8.3%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon customers">
              <i class="el-icon-user"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ overviewData.totalCustomers }}</div>
              <div class="card-label">总客户数</div>
              <div class="card-trend positive">
                <i class="el-icon-arrow-up"></i> +15.2%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon rating">
              <i class="el-icon-star-on"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ overviewData.averageRating }}</div>
              <div class="card-label">平均评分</div>
              <div class="card-trend positive">
                <i class="el-icon-arrow-up"></i> +0.2
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 时间筛选 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange">
          </el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-select v-model="timeType" placeholder="时间类型" @change="handleTimeTypeChange">
            <el-option label="按日" value="day"></el-option>
            <el-option label="按周" value="week"></el-option>
            <el-option label="按月" value="month"></el-option>
            <el-option label="按季度" value="quarter"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="productType" placeholder="产品类型" @change="handleProductTypeChange">
            <el-option label="全部" value=""></el-option>
            <el-option label="酒店客房" value="hotel"></el-option>
            <el-option label="旅行路线" value="route"></el-option>
            <el-option label="门票" value="ticket"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="refreshData">
            <i class="el-icon-refresh"></i> 刷新数据
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="exportReport">
            <i class="el-icon-download"></i> 导出报表
          </el-button>
        </el-col>
      </el-row>
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
              <el-table-column prop="date" label="日期" width="120"></el-table-column>
              <el-table-column prop="revenue" label="销售额" width="120">
                <template slot-scope="scope">
                  <span class="amount">¥{{ scope.row.revenue }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="orders" label="订单数" width="100"></el-table-column>
              <el-table-column prop="customers" label="客户数" width="100"></el-table-column>
              <el-table-column prop="avgOrderValue" label="客单价" width="120">
                <template slot-scope="scope">
                  <span class="amount">¥{{ scope.row.avgOrderValue }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="conversionRate" label="转化率" width="100">
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
              <i class="el-icon-lightbulb"></i>
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

.overview-section {
  margin-bottom: 30px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.card-icon.revenue {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #d63384;
}

.card-icon.orders {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #20c997;
}

.card-icon.customers {
  background: linear-gradient(135deg, #d299c2, #fef9d7);
  color: #28a745;
}

.card-icon.rating {
  background: linear-gradient(135deg, #89f7fe, #66a6ff);
  color: #6f42c1;
}

.card-icon i {
  font-size: 24px;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.card-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.card-trend {
  font-size: 12px;
  font-weight: 500;
}

.card-trend.positive {
  color: #28a745;
}

.card-trend.negative {
  color: #dc3545;
}

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
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
}

.insight-content {
  flex: 1;
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
