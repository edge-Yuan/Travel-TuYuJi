// import { defineStore } from "pinia";
// import router from "@/router";
// import request from "@/utils/request";

// export const useSaleProductsStore = defineStore("saleProducts", {
//   state: () => ({
//     // 商品列表
//     packageData: [],
//     // 当前选中的商品
//     currentProduct: null,
//     isLogin: false
//   }),
//   getters: {
//     getLoginStatus: (state) => state.isLogin,
//     //获取商品总数：
//     productCount: (state) => state.saleProducts.length,
//     //根据id获取商品
//     getProductById: (state) => (id) =>
//       state.saleProducts.find((product) => product.id === id),
//   },
//   actions: {
//         // 检查登录状态
//     checkLoginStatus() {
//       const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//       this.isLogin = !!token;
      
//       if (!this.isLogin) {
//         // 未登录，跳转到登录页面
//         this.$message.warning('请先登录');
//         router.push({
//           path: 'auth/loginPage',
//           query: { redirect: router.currentRoute.value.fullPath }
//         });
//         return false;
//       }
//       return true;
//     },
    
//   },
// });