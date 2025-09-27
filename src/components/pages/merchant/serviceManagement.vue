<template>
  <div class="service-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">服务管理</h1>
      <p class="subtitle">管理当日服务，记录服务情况，处理服务异常</p>
    </div>

    <!-- 今日服务概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon hotel">
              <i class="el-icon-house"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ todayStats.hotelCheckins }}</div>
              <div class="card-label">今日入住</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon ticket">
              <i class="el-icon-tickets"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ todayStats.ticketEntries }}</div>
              <div class="card-label">今日入园</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon route">
              <i class="el-icon-position"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ todayStats.routeServices }}</div>
              <div class="card-label">今日行程</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon exception">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-content">
              <div class="card-number">{{ todayStats.exceptions }}</div>
              <div class="card-label">异常处理</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-select v-model="filters.serviceType" placeholder="服务类型" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="酒店服务" value="hotel"></el-option>
            <el-option label="景区服务" value="attraction"></el-option>
            <el-option label="路线服务" value="route"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.status" placeholder="服务状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待服务" value="pending"></el-option>
            <el-option label="服务中" value="in_progress"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="异常" value="exception"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="filters.serviceDate"
            type="date"
            placeholder="选择服务日期">
          </el-date-picker>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索客户姓名或订单号"
            prefix-icon="el-icon-search"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchServices">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 服务列表 -->
    <div class="service-list">
      <el-table :data="filteredServices" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewServiceDetail(scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户姓名" width="120"></el-table-column>
        <el-table-column prop="customerPhone" label="联系电话" width="130"></el-table-column>
        <el-table-column prop="serviceType" label="服务类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getServiceTypeTagType(scope.row.serviceType)" size="mini">
              {{ getServiceTypeName(scope.row.serviceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceName" label="服务项目" min-width="200">
          <template slot-scope="scope">
            <div class="service-info">
              <img :src="scope.row.serviceImage" class="service-image" />
              <div class="service-details">
                <div class="service-name">{{ scope.row.serviceName }}</div>
                <div class="service-location">
                  <i class="el-icon-location"></i> {{ scope.row.serviceLocation }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="serviceTime" label="服务时间" width="160"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="staffName" label="服务人员" width="100"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
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
          <el-input type="textarea" v-model="recordForm.content" :rows="3"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input type="textarea" v-model="recordForm.notes" :rows="2"></el-input>
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
          <el-input type="textarea" v-model="exceptionForm.description" :rows="4"></el-input>
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
          <el-input type="textarea" v-model="exceptionForm.suggestion" :rows="3"></el-input>
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
        hotelCheckins: 15,
        ticketEntries: 89,
        routeServices: 12,
        exceptions: 3
      },
      services: [
        {
          id: 1,
          orderNo: 'ORD202401150001',
          customerName: '张三',
          customerPhone: '138****1234',
          customerIdCard: '110101199001011234',
          emergencyContact: '李四',
          serviceType: 'hotel',
          serviceName: '豪华海景套房入住服务',
          serviceImage: '/src/assets/images/travel.jpg',
          serviceLocation: '三亚海景酒店',
          serviceTime: '2024-01-20 14:00:00',
          estimatedDuration: '30分钟',
          status: 'pending',
          staffName: '王服务员',
          specialRequirements: '需要无烟房，高层海景',
          records: [
            {
              id: 1,
              type: 'checkin',
              time: '2024-01-20 14:05:00',
              staffName: '王服务员',
              content: '客户到达酒店，开始办理入住手续',
              notes: '客户对房间位置很满意',
              images: []
            }
          ],
          exceptions: []
        },
        {
          id: 2,
          orderNo: 'ORD202401150002',
          customerName: '李四',
          customerPhone: '139****5678',
          customerIdCard: '110101199002021234',
          emergencyContact: '王五',
          serviceType: 'attraction',
          serviceName: '故宫门票核验服务',
          serviceImage: '/src/assets/images/travel2.jpg',
          serviceLocation: '故宫博物院',
          serviceTime: '2024-01-18 09:00:00',
          estimatedDuration: '10分钟',
          status: 'completed',
          staffName: '赵检票员',
          specialRequirements: '',
          records: [
            {
              id: 1,
              type: 'service',
              time: '2024-01-18 09:00:00',
              staffName: '赵检票员',
              content: '核验门票，客户顺利入园',
              notes: '客户对服务很满意',
              images: []
            },
            {
              id: 2,
              type: 'completion',
              time: '2024-01-18 09:10:00',
              staffName: '赵检票员',
              content: '服务完成，客户已入园游览',
              notes: '',
              images: []
            }
          ],
          exceptions: []
        },
        {
          id: 3,
          orderNo: 'ORD202401150003',
          customerName: '王五',
          customerPhone: '137****9012',
          customerIdCard: '110101199003031234',
          emergencyContact: '赵六',
          serviceType: 'route',
          serviceName: '三亚三日游导游服务',
          serviceImage: '/src/assets/images/travel3.jpg',
          serviceLocation: '三亚市区',
          serviceTime: '2024-01-25 08:00:00',
          estimatedDuration: '3天',
          status: 'in_progress',
          staffName: '张导游',
          specialRequirements: '需要英文导游',
          records: [
            {
              id: 1,
              type: 'service',
              time: '2024-01-25 08:00:00',
              staffName: '张导游',
              content: '开始导游服务，接客户前往第一个景点',
              notes: '客户对导游很满意',
              images: []
            }
          ],
          exceptions: [
            {
              id: 1,
              type: 'delay',
              description: '由于交通拥堵，到达景点时间比预计晚了30分钟',
              solution: '已联系客户说明情况，调整后续行程',
              time: '2024-01-25 08:30:00',
              status: 'resolved'
            }
          ]
        }
      ]
    }
  },
  computed: {
    filteredServices() {
      let filtered = this.services;
      
      if (this.filters.serviceType) {
        filtered = filtered.filter(service => service.serviceType === this.filters.serviceType);
      }
      
      if (this.filters.status) {
        filtered = filtered.filter(service => service.status === this.filters.status);
      }
      
      if (this.filters.keyword) {
        filtered = filtered.filter(service => 
          service.orderNo.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
          service.customerName.toLowerCase().includes(this.filters.keyword.toLowerCase())
        );
      }
      
      return filtered;
    }
  },
  watch: {
    filteredServices: {
      handler(newVal) {
        this.pagination.total = newVal.length;
      },
      immediate: true
    }
  },
  methods: {
    searchServices() {
      // 搜索逻辑已在computed中实现
    },
    
    resetFilters() {
      this.filters = {
        serviceType: '',
        status: '',
        serviceDate: new Date(),
        keyword: ''
      };
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
    
    viewServiceDetail(service) {
      this.selectedService = service;
      this.showServiceDialog = true;
      this.activeTab = 'basic';
    },
    
    startService(service) {
      this.$confirm('确定要开始这个服务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        service.status = 'in_progress';
        this.$message.success('服务已开始');
      });
    },
    
    completeService(service) {
      this.$confirm('确定要完成这个服务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        service.status = 'completed';
        this.$message.success('服务已完成');
      });
    },
    
    reportException(service) {
      this.selectedService = service;
      this.showExceptionDialog = true;
    },
    
    submitException() {
      const exception = {
        id: Date.now(),
        type: this.exceptionForm.type,
        description: this.exceptionForm.description,
        priority: this.exceptionForm.priority,
        suggestion: this.exceptionForm.suggestion,
        time: new Date().toLocaleString(),
        status: 'pending'
      };
      
      if (!this.selectedService.exceptions) {
        this.selectedService.exceptions = [];
      }
      this.selectedService.exceptions.push(exception);
      this.selectedService.status = 'exception';
      
      this.showExceptionDialog = false;
      this.$message.success('异常报告已提交');
      this.resetExceptionForm();
    },
    
    resolveException(exception) {
      exception.status = 'resolved';
      this.$message.success('异常已解决');
    },
    
    escalateException(exception) {
      exception.status = 'escalated';
      this.$message.success('异常已升级');
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
    
    submitRecord() {
      const record = {
        id: Date.now(),
        type: this.recordForm.type,
        time: new Date().toLocaleString(),
        staffName: '当前用户',
        content: this.recordForm.content,
        notes: this.recordForm.notes,
        images: this.recordForm.images
      };
      
      if (!this.selectedService.records) {
        this.selectedService.records = [];
      }
      this.selectedService.records.push(record);
      
      this.showRecordDialog = false;
      this.$message.success('服务记录已添加');
      this.resetRecordForm();
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
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    }
  }
}
</script>

<style scoped>
.service-management {
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

.card-icon.hotel {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #d63384;
}

.card-icon.ticket {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #20c997;
}

.card-icon.route {
  background: linear-gradient(135deg, #d299c2, #fef9d7);
  color: #28a745;
}

.card-icon.exception {
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
}

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.service-list {
  margin-bottom: 20px;
}

.service-info {
  display: flex;
  align-items: center;
}

.service-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.service-details {
  flex: 1;
}

.service-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.service-location {
  color: #666;
  font-size: 14px;
}

.pagination {
  text-align: center;
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
</style>
