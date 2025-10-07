// 调试助手工具
export const debugHelper = {
  // 打印API请求信息
  logApiRequest(url, params, method = 'GET') {
    console.group(`🔍 API请求调试 - ${method} ${url}`);
    console.log('请求URL:', url);
    console.log('请求参数:', params);
    console.log('请求时间:', new Date().toISOString());
    console.groupEnd();
  },

  // 打印API响应信息
  logApiResponse(response, label = 'API响应') {
    console.group(`📥 ${label}`);
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    console.log('响应数据:', response.data);
    console.log('完整响应:', response);
    console.groupEnd();
  },

  // 打印数据解析过程
  logDataParsing(originalData, parsedData, label = '数据解析') {
    console.group(`🔄 ${label}`);
    console.log('原始数据:', originalData);
    console.log('解析后数据:', parsedData);
    console.log('数据类型:', typeof parsedData);
    console.log('是否为数组:', Array.isArray(parsedData));
    if (Array.isArray(parsedData)) {
      console.log('数组长度:', parsedData.length);
      console.log('第一个元素:', parsedData[0]);
    }
    console.groupEnd();
  },

  // 检查状态值映射
  checkStatusMapping(status, expectedMaps) {
    console.group('🔍 状态值检查');
    console.log('原始状态值:', status);
    console.log('状态值类型:', typeof status);
    console.log('状态值数值:', Number(status));
    
    for (const [key, map] of Object.entries(expectedMaps)) {
      console.log(`${key}映射:`, map);
      if (map[status] !== undefined) {
        console.log(`✅ 找到匹配: ${status} -> ${map[status]}`);
      } else {
        console.log(`❌ 未找到匹配: ${status} 在 ${key} 中`);
      }
    }
    console.groupEnd();
  },

  // 检查用户ID获取
  checkUserId() {
    console.group('👤 用户ID检查');
    
    // 检查localStorage
    const localToken = localStorage.getItem('token');
    const localUserId = localStorage.getItem('userId');
    console.log('localStorage token:', localToken ? '存在' : '不存在');
    console.log('localStorage userId:', localUserId);
    
    // 检查sessionStorage
    const sessionToken = sessionStorage.getItem('token');
    const sessionUserId = sessionStorage.getItem('userId');
    console.log('sessionStorage token:', sessionToken ? '存在' : '不存在');
    console.log('sessionStorage userId:', sessionUserId);
    
    // 尝试解析token
    if (localToken || sessionToken) {
      try {
        const token = localToken || sessionToken;
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token中的用户ID:', payload.userId || payload.id || payload.sub);
      } catch (e) {
        console.log('Token解析失败:', e.message);
      }
    }
    
    console.groupEnd();
  },

  // 检查数据库字段映射
  checkFieldMapping(record, expectedFields) {
    console.group('🗂️ 字段映射检查');
    console.log('记录数据:', record);
    console.log('期望字段:', expectedFields);
    
    for (const field of expectedFields) {
      const value = record[field];
      console.log(`${field}:`, value, typeof value);
    }
    
    // 检查状态字段
    const statusFields = ['orderStatus', 'status', 'orderStatusText', 'statusText'];
    for (const field of statusFields) {
      if (record[field] !== undefined) {
        console.log(`状态字段 ${field}:`, record[field]);
      }
    }
    
    console.groupEnd();
  }
};

export default debugHelper;
