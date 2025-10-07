<template>
  <div class="service-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="title">服务管理</h1>
          <p class="subtitle">管理当日服务，记录服务情况，处理服务异常</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="addService">新增服务</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportServices">导出数据</el-button>
        </div>
      </div>
    </div>

    <!-- 今日服务概览 -->
    <div class="stats-panel">
      <el-card class="stats-card">
        <div slot="header" class="stats-header">
          <i class="el-icon-data-line"></i>
          <span>今日服务概览</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon hotel">
                <i class="el-icon-house"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ todayStats.hotelCheckins }}</div>
                <div class="stat-label">今日入住</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon ticket">
                <i class="el-icon-tickets"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ todayStats.ticketEntries }}</div>
                <div class="stat-label">今日入园</div>
                <div class="stat-trend">
                  <i class="el-icon-top"></i>
                  <span>+8%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon route">
                <i class="el-icon-position"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ todayStats.routeServices }}</div>
                <div class="stat-label">今日行程</div>
                <div class="stat-trend">
                  <i class="el-icon-bottom"></i>
                  <span>-3%</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon exception">
                <i class="el-icon-warning"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ todayStats.exceptions }}</div>
                <div class="stat-label">异常处理</div>
                <div class="stat-trend">
                  <i class="el-icon-bottom"></i>
                  <span>-15%</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <div class="filter-container">
          <div class="filter-header">
            <div class="filter-title">
              <i class="el-icon-filter"></i>
              <span>筛选条件</span>
            </div>
            <div class="filter-actions">
              <el-button type="primary" class="search-btn" @click="searchServices">
                <i class="el-icon-search"></i>
                搜索
              </el-button>
              <el-button class="reset-btn" @click="resetFilters">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </div>
          </div>
          
          <div class="filter-content">
            <div class="filter-row">
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-menu"></i>
                  <span>服务类型</span>
                </div>
                <el-select v-model="filters.serviceType" placeholder="请选择服务类型" clearable class="filter-select">
                  <el-option label="全部类型" value=""></el-option>
                  <el-option label="酒店服务" value="hotel">
                    <span style="float: left">酒店服务</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">住宿相关</span>
                  </el-option>
                  <el-option label="景区服务" value="attraction">
                    <span style="float: left">景区服务</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">景点相关</span>
                  </el-option>
                  <el-option label="路线服务" value="route">
                    <span style="float: left">路线服务</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">行程相关</span>
                  </el-option>
                </el-select>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-s-order"></i>
                  <span>服务状态</span>
                </div>
                <el-select v-model="filters.status" placeholder="请选择服务状态" clearable class="filter-select">
                  <el-option label="全部状态" value=""></el-option>
                  <el-option label="待服务" value="pending">
                    <span style="float: left">待服务</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">等待开始</span>
                  </el-option>
                  <el-option label="服务中" value="in_progress">
                    <span style="float: left">服务中</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">正在执行</span>
                  </el-option>
                  <el-option label="已完成" value="completed">
                    <span style="float: left">已完成</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">服务结束</span>
                  </el-option>
                  <el-option label="异常" value="exception">
                    <span style="float: left">异常</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">需要处理</span>
                  </el-option>
                </el-select>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-date"></i>
                  <span>服务日期</span>
                </div>
                <el-date-picker
                  v-model="filters.serviceDate"
                  type="date"
                  placeholder="选择服务日期"
                  class="filter-date-picker">
                </el-date-picker>
              </div>
              
              <div class="filter-item">
                <div class="filter-label">
                  <i class="el-icon-search"></i>
                  <span>关键词搜索</span>
                </div>
                <el-input
                  v-model="filters.keyword"
                  placeholder="搜索客户姓名或订单号"
                  prefix-icon="el-icon-search"
                  clearable
                  class="filter-input">
                </el-input>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 服务列表 -->
    <div class="service-list">
      <el-card class="list-card">
        <div slot="header" class="list-header">
          <div class="list-title">
            <i class="el-icon-list"></i>
            <span>服务列表</span>
          </div>
          <div class="list-actions">
            <el-button size="small" icon="el-icon-refresh" @click="refreshServices">刷新</el-button>
            <el-button size="small" icon="el-icon-download" @click="exportServices">导出</el-button>
          </div>
        </div>
        
        <el-table :data="filteredServices" v-loading="loading" stripe class="service-table" :header-cell-style="{ textAlign: 'center' }" :cell-style="{ textAlign: 'center' }">
          <el-table-column prop="orderNo" label="订单号" width="180" align="center">
            <template slot-scope="scope">
              <el-link type="primary" @click="viewServiceDetail(scope.row)">{{ scope.row.orderNo }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="customerName" label="客户姓名" width="120" align="center"></el-table-column>
          <el-table-column prop="customerPhone" label="联系电话" width="130" align="center"></el-table-column>
          <el-table-column prop="serviceType" label="服务类型" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getServiceTypeTagType(scope.row.serviceType)" size="mini">
                {{ getServiceTypeName(scope.row.serviceType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="serviceName" label="服务项目" min-width="200" align="center">
            <template slot-scope="scope">
              <div class="service-info">
                <el-image :src="scope.row.serviceImage" class="service-image" fit="cover">
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <div class="service-details">
                  <div class="service-name">{{ scope.row.serviceName }}</div>
                  <div class="service-location">
                    <i class="el-icon-location"></i> {{ scope.row.serviceLocation }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="serviceTime" label="服务时间" width="180" align="center">
            <template slot-scope="scope">
              <span class="service-time">{{ scope.row.serviceTime }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
                {{ getStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="staffName" label="服务人员" width="100" align="center"></el-table-column>
          <el-table-column label="操作" width="240" fixed="right" align="center">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button size="mini" @click="viewServiceDetail(scope.row)">详情</el-button>
                <el-button 
                  size="mini" 
                  type="success" 
                  v-if="scope.row.status === 'pending'"
                  @click="startService(scope.row)">
                  开始服务
                </el-button>
                <el-button 
                  size="mini" 
                  type="primary" 
                  v-if="scope.row.status === 'in_progress'"
                  @click="completeService(scope.row)">
                  完成服务
                </el-button>
                <el-button 
                  size="mini" 
                  type="warning" 
                  v-if="scope.row.status !== 'exception'"
                  @click="reportException(scope.row)">
                  异常报告
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
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

    <!-- 服务详情对话框 -->
    <el-dialog title="服务详情" :visible.sync="showServiceDialog" width="800px">
      <div v-if="selectedService" class="service-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="detail-section">
              <h3>服务信息</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">订单号：</span>
                    <span>{{ selectedService.orderNo }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">服务类型：</span>
                    <el-tag :type="getServiceTypeTagType(selectedService.serviceType)">
                      {{ getServiceTypeName(selectedService.serviceType) }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">服务时间：</span>
                    <span>{{ selectedService.serviceTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">服务状态：</span>
                    <el-tag :type="getStatusTagType(selectedService.status)">
                      {{ getStatusName(selectedService.status) }}
                    </el-tag>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">服务人员：</span>
                    <span>{{ selectedService.staffName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">服务地点：</span>
                    <span>{{ selectedService.serviceLocation }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">预计时长：</span>
                    <span>{{ selectedService.estimatedDuration }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">特殊要求：</span>
                    <span>{{ selectedService.specialRequirements || '无' }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>

            <div class="detail-section">
              <h3>客户信息</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">客户姓名：</span>
                    <span>{{ selectedService.customerName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">联系电话：</span>
                    <span>{{ selectedService.customerPhone }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <span class="label">身份证号：</span>
                    <span>{{ selectedService.customerIdCard }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">紧急联系人：</span>
                    <span>{{ selectedService.emergencyContact }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <el-tab-pane label="服务记录" name="records">
            <div class="records-section">
              <div v-if="selectedService.records && selectedService.records.length">
                <div v-for="record in selectedService.records" :key="record.id" class="record-item">
                  <div class="record-header">
                    <span class="record-time">{{ record.time }}</span>
                    <span class="record-staff">{{ record.staffName }}</span>
                    <el-tag :type="getRecordTypeTagType(record.type)" size="mini">
                      {{ getRecordTypeName(record.type) }}
                    </el-tag>
                  </div>
                  <div class="record-content">
                    <p><strong>操作内容：</strong>{{ record.content }}</p>
                    <p v-if="record.notes"><strong>备注：</strong>{{ record.notes }}</p>
                    <div v-if="record.images && record.images.length" class="record-images">
                      <img
                        v-for="image in record.images"
                        :key="image"
                        :src="image"
                        class="record-image"
                        @click="previewImage(image)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无服务记录"></el-empty>
            </div>
          </el-tab-pane>

          <el-tab-pane label="异常处理" name="exceptions">
            <div class="exceptions-section">
              <div v-if="selectedService.exceptions && selectedService.exceptions.length">
                <div v-for="exception in selectedService.exceptions" :key="exception.id" class="exception-item">
                  <div class="exception-header">
                    <span class="exception-time">{{ exception.time }}</span>
                    <el-tag :type="getExceptionStatusTagType(exception.status)" size="mini">
                      {{ getExceptionStatusName(exception.status) }}
                    </el-tag>
                  </div>
                  <div class="exception-content">
                    <p><strong>异常类型：</strong>{{ exception.type }}</p>
                    <p><strong>异常描述：</strong>{{ exception.description }}</p>
                    <p><strong>处理方案：</strong>{{ exception.solution || '待处理' }}</p>
                    <div v-if="exception.status === 'pending'" class="exception-actions">
                      <el-button size="mini" type="success" @click="resolveException(exception)">解决</el-button>
                      <el-button size="mini" type="warning" @click="escalateException(exception)">升级</el-button>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无异常记录"></el-empty>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showServiceDialog = false">关闭</el-button>
        <el-button type="primary" @click="addServiceRecord">添加记录</el-button>
      </div>
    </el-dialog>

    <!-- 添加服务记录对话框 -->
    <el-dialog title="添加服务记录" :visible.sync="showRecordDialog" width="600px">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="记录类型">
          <el-radio-group v-model="recordForm.type">
            <el-radio label="checkin">入住登记</el-radio>
            <el-radio label="service">服务执行</el-radio>
            <el-radio label="completion">服务完成</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="操作内容">
          <el-input type="textarea" v-model="recordForm.content" :rows="3" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input type="textarea" v-model="recordForm.notes" :rows="2" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
        
        <el-form-item label="相关图片">
          <el-upload
            class="record-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleRecordImageSuccess"
            :before-upload="beforeRecordImageUpload">
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
          <div v-if="recordForm.images && recordForm.images.length" class="record-images-preview">
            <img
              v-for="(image, index) in recordForm.images"
              :key="index"
              :src="image"
              class="record-image-preview"
              @click="removeRecordImage(index)"
            />
          </div>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showRecordDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">确定</el-button>
      </div>
    </el-dialog>

    <!-- 异常报告对话框 -->
    <el-dialog title="异常报告" :visible.sync="showExceptionDialog" width="600px">
      <el-form :model="exceptionForm" label-width="100px">
        <el-form-item label="异常类型">
          <el-select v-model="exceptionForm.type" placeholder="选择异常类型">
            <el-option label="设备故障" value="equipment"></el-option>
            <el-option label="服务延迟" value="delay"></el-option>
            <el-option label="客户投诉" value="complaint"></el-option>
            <el-option label="安全问题" value="safety"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="异常描述">
          <el-input type="textarea" v-model="exceptionForm.description" :rows="4" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
        
        <el-form-item label="紧急程度">
          <el-radio-group v-model="exceptionForm.priority">
            <el-radio label="low">低</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="high">高</el-radio>
            <el-radio label="urgent">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="处理建议">
          <el-input type="textarea" v-model="exceptionForm.suggestion" :rows="3" resize="none" class="fixed-textarea"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showExceptionDialog = false">取消</el-button>
        <el-button type="primary" @click="submitException">提交报告</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ServiceManagement',
  data() {
    return {
      loading: false,
      showServiceDialog: false,
      showRecordDialog: false,
      showExceptionDialog: false,
      selectedService: null,
      activeTab: 'basic',
      filters: {
        serviceType: '',
        status: '',
        serviceDate: new Date(),
        keyword: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      recordForm: {
        type: 'service',
        content: '',
        notes: '',
        images: []
      },
      exceptionForm: {
        type: '',
        description: '',
        priority: 'medium',
        suggestion: ''
      },
      todayStats: {
        hotelCheckins: 0,
        ticketEntries: 0,
        routeServices: 0,
        exceptions: 0
      },
      services: [],
      // API基础URL
      apiBaseUrl: '/travel-admin'
    }
  },
  computed: {
    filteredServices() {
      // 由于现在使用后端分页，直接返回services
      return this.services;
    }
  },
  mounted() {
    this.loadTodayStatistics();
    this.loadServices();
  },
  methods: {
    // 加载今日统计数据
    async loadTodayStatistics() {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/service/statistics/today`);
        if (response.data.code === 1) {
          this.todayStats = response.data.data;
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
        this.$message.error('加载统计数据失败');
      }
    },

    // 加载服务列表
    async loadServices() {
      this.loading = true;
      try {
        const searchParams = {
          serviceType: this.filters.serviceType,
          status: this.filters.status,
          serviceDate: this.filters.serviceDate,
          keyword: this.filters.keyword,
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/service/page`, searchParams);
        if (response.data.code === 1) {
          this.services = response.data.data.records;
          this.pagination.total = response.data.data.total;
        } else {
          this.$message.error(response.data.msg || '加载服务列表失败');
        }
      } catch (error) {
        console.error('加载服务列表失败:', error);
        this.$message.error('加载服务列表失败');
      } finally {
        this.loading = false;
      }
    },

    addService() {
      this.$message.info('新增服务功能开发中...');
    },
    
    async exportServices() {
      try {
        const searchParams = {
          serviceType: this.filters.serviceType,
          status: this.filters.status,
          serviceDate: this.filters.serviceDate,
          keyword: this.filters.keyword
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/service/export`, searchParams);
        if (response.data.code === 1) {
          this.$message.success('服务数据导出成功');
          // 这里可以添加下载文件的逻辑
        } else {
          this.$message.error(response.data.msg || '导出失败');
        }
      } catch (error) {
        console.error('导出服务数据失败:', error);
        this.$message.error('导出服务数据失败');
      }
    },
    
    refreshServices() {
      this.loadServices();
    },
    
    searchServices() {
      this.pagination.currentPage = 1;
      this.loadServices();
    },
    
    resetFilters() {
      this.filters = {
        serviceType: '',
        status: '',
        serviceDate: new Date(),
        keyword: ''
      };
      this.pagination.currentPage = 1;
      this.loadServices();
    },
    
    getServiceTypeName(type) {
      const typeMap = {
        hotel: '酒店服务',
        attraction: '景区服务',
        route: '路线服务'
      };
      return typeMap[type] || type;
    },
    
    getServiceTypeTagType(type) {
      const typeMap = {
        hotel: 'primary',
        attraction: 'success',
        route: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getStatusName(status) {
      const statusMap = {
        pending: '待服务',
        in_progress: '服务中',
        completed: '已完成',
        exception: '异常'
      };
      return statusMap[status] || status;
    },
    
    getStatusTagType(status) {
      const statusMap = {
        pending: 'warning',
        in_progress: 'primary',
        completed: 'success',
        exception: 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    getRecordTypeName(type) {
      const typeMap = {
        checkin: '入住登记',
        service: '服务执行',
        completion: '服务完成',
        other: '其他'
      };
      return typeMap[type] || type;
    },
    
    getRecordTypeTagType(type) {
      const typeMap = {
        checkin: 'primary',
        service: 'success',
        completion: 'info',
        other: 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    getExceptionStatusName(status) {
      const statusMap = {
        pending: '待处理',
        resolved: '已解决',
        escalated: '已升级'
      };
      return statusMap[status] || status;
    },
    
    getExceptionStatusTagType(status) {
      const statusMap = {
        pending: 'warning',
        resolved: 'success',
        escalated: 'danger'
      };
      return statusMap[status] || 'info';
    },
    
    async viewServiceDetail(service) {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/service/${service.id}`);
        if (response.data.code === 1) {
          this.selectedService = response.data.data;
          this.showServiceDialog = true;
          this.activeTab = 'basic';
        } else {
          this.$message.error(response.data.msg || '获取服务详情失败');
        }
      } catch (error) {
        console.error('获取服务详情失败:', error);
        this.$message.error('获取服务详情失败');
      }
    },
    
    async startService(service) {
      try {
        await this.$confirm('确定要开始这个服务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const response = await axios.put(`${this.apiBaseUrl}/service/${service.id}/start?staffName=当前用户`);
        if (response.data.code === 1) {
          this.$message.success('服务已开始');
          this.loadServices(); // 重新加载列表
        } else {
          this.$message.error(response.data.msg || '开始服务失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('开始服务失败:', error);
          this.$message.error('开始服务失败');
        }
      }
    },
    
    async completeService(service) {
      try {
        await this.$confirm('确定要完成这个服务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const response = await axios.put(`${this.apiBaseUrl}/service/${service.id}/complete?staffName=当前用户`);
        if (response.data.code === 1) {
          this.$message.success('服务已完成');
          this.loadServices(); // 重新加载列表
        } else {
          this.$message.error(response.data.msg || '完成服务失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('完成服务失败:', error);
          this.$message.error('完成服务失败');
        }
      }
    },
    
    reportException(service) {
      this.selectedService = service;
      this.showExceptionDialog = true;
    },
    
    async submitException() {
      try {
        const exceptionData = {
          serviceId: this.selectedService.id,
          exceptionType: this.exceptionForm.type,
          description: this.exceptionForm.description,
          priority: this.exceptionForm.priority,
          suggestion: this.exceptionForm.suggestion
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/service/exception?createBy=当前用户`, exceptionData);
        if (response.data.code === 1) {
          this.showExceptionDialog = false;
          this.$message.success('异常报告已提交');
          this.resetExceptionForm();
          this.loadServices(); // 重新加载列表
        } else {
          this.$message.error(response.data.msg || '提交异常报告失败');
        }
      } catch (error) {
        console.error('提交异常报告失败:', error);
        this.$message.error('提交异常报告失败');
      }
    },
    
    async resolveException(exception) {
      try {
        const response = await axios.put(`${this.apiBaseUrl}/service/exception/${exception.id}/resolve?solution=已解决&resolveBy=当前用户`);
        if (response.data.code === 1) {
          this.$message.success('异常已解决');
          this.loadServices(); // 重新加载列表
        } else {
          this.$message.error(response.data.msg || '解决异常失败');
        }
      } catch (error) {
        console.error('解决异常失败:', error);
        this.$message.error('解决异常失败');
      }
    },
    
    async escalateException(exception) {
      try {
        const response = await axios.put(`${this.apiBaseUrl}/service/exception/${exception.id}/escalate?resolveBy=当前用户`);
        if (response.data.code === 1) {
          this.$message.success('异常已升级');
          this.loadServices(); // 重新加载列表
        } else {
          this.$message.error(response.data.msg || '升级异常失败');
        }
      } catch (error) {
        console.error('升级异常失败:', error);
        this.$message.error('升级异常失败');
      }
    },
    
    addServiceRecord() {
      this.recordForm = {
        type: 'service',
        content: '',
        notes: '',
        images: []
      };
      this.showRecordDialog = true;
    },
    
    async submitRecord() {
      try {
        const recordData = {
          serviceId: this.selectedService.id,
          recordType: this.recordForm.type,
          content: this.recordForm.content,
          notes: this.recordForm.notes,
          images: this.recordForm.images
        };
        
        const response = await axios.post(`${this.apiBaseUrl}/service/record?createBy=当前用户`, recordData);
        if (response.data.code === 1) {
          this.showRecordDialog = false;
          this.$message.success('服务记录已添加');
          this.resetRecordForm();
          this.loadServices(); // 重新加载列表
        } else {
          this.$message.error(response.data.msg || '添加服务记录失败');
        }
      } catch (error) {
        console.error('添加服务记录失败:', error);
        this.$message.error('添加服务记录失败');
      }
    },
    
    handleRecordImageSuccess(response, file) {
      this.recordForm.images.push(URL.createObjectURL(file.raw));
    },
    
    beforeRecordImageUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    
    removeRecordImage(index) {
      this.recordForm.images.splice(index, 1);
    },
    
    previewImage(image) {
      console.log('预览图片:', image);
    },
    
    resetRecordForm() {
      this.recordForm = {
        type: 'service',
        content: '',
        notes: '',
        images: []
      };
    },
    
    resetExceptionForm() {
      this.exceptionForm = {
        type: '',
        description: '',
        priority: 'medium',
        suggestion: ''
      };
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
      this.loadServices();
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.loadServices();
    }
  }
}
</script>

<style scoped>
.service-management {
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

.stat-icon.hotel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.ticket {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.route {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.exception {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon i {
  font-size: 24px;
  position: relative;
  z-index: 1;
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
.filter-input,
.filter-date-picker {
  width: 100%;
}

.filter-select .el-input__inner,
.filter-input .el-input__inner,
.filter-date-picker .el-input__inner {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.filter-select .el-input__inner:focus,
.filter-input .el-input__inner:focus,
.filter-date-picker .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.filter-select .el-input__inner:hover,
.filter-input .el-input__inner:hover,
.filter-date-picker .el-input__inner:hover {
  border-color: #c0c4cc;
  background: white;
}

/* 服务列表 */
.service-list {
  margin-bottom: 24px;
}

.list-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.list-title i {
  color: #3b82f6;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.service-table {
  border-radius: 8px;
  overflow: hidden;
}

.service-table .el-table th,
.service-table .el-table td {
  text-align: center !important;
  vertical-align: middle !important;
}

.service-info {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
}

.service-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 20px;
}

.service-details {
  flex: 1;
  text-align: left;
}

.service-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #2c3e50;
}

.service-location {
  color: #7f8c8d;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.service-time {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.action-buttons .el-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  height: 28px;
  line-height: 1;
  width: 100%;
  max-width: 100px;
  margin: 0;
}

.action-buttons .el-button--success {
  background: #52c41a;
  border-color: #52c41a;
}

.action-buttons .el-button--success:hover {
  background: #73d13d;
  border-color: #73d13d;
}

.action-buttons .el-button--primary {
  background: #1890ff;
  border-color: #1890ff;
}

.action-buttons .el-button--primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.action-buttons .el-button--warning {
  background: #faad14;
  border-color: #faad14;
}

.action-buttons .el-button--warning:hover {
  background: #ffc53d;
  border-color: #ffc53d;
}

/* 分页 */
.pagination {
  text-align: center;
  margin-top: 24px;
}

.service-detail {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 100px;
  color: #666;
}

.records-section,
.exceptions-section {
  padding: 20px 0;
}

.record-item,
.exception-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.record-header,
.exception-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.record-time,
.exception-time {
  font-weight: 500;
  margin-right: 15px;
  color: #333;
}

.record-staff {
  margin-right: 15px;
  color: #666;
  font-size: 14px;
}

.record-content,
.exception-content {
  color: #333;
  line-height: 1.5;
}

.record-content p,
.exception-content p {
  margin-bottom: 10px;
}

.record-images {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.record-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.record-image:hover {
  transform: scale(1.05);
}

.record-images-preview {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.record-image-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.record-image-preview:hover {
  transform: scale(1.05);
}

.exception-actions {
  margin-top: 15px;
}

.exception-actions .el-button {
  margin-right: 10px;
}

.record-uploader {
  margin-bottom: 10px;
}

.dialog-footer {
  text-align: right;
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
</style>
