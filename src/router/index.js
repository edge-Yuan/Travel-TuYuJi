import Vue from "vue";
import VueRouter from "vue-router";

import selfPlan from "@/components/pages/traveller/selfPlan.vue";
import guidesAbout from "@/components/pages/traveller/guidesAbout.vue";
import myCollection from "@/components/pages/traveller/myCollection.vue";
import myInfo from "@/components/pages/traveller/myInfo.vue";
import myOrder from "@/components/pages/traveller/myOrder.vue";
import orderManage from "@/components/pages/traveller/orderManage.vue";
import routesManage from "@/components/pages/traveller/routesManage.vue";
import packageDetail from "@/components/pages/traveller/packageDetail.vue";
import purchasePages from "@/components/pages/traveller/purchase-pages.vue";
import purchaseOrder from "@/components/pages/traveller/purchaseOrder.vue";
import orderList from "@/components/pages/traveller/orderList.vue";
import loginPage from "@/components/pages/loginPage.vue";
import registerPage from "@/components/pages/registerPage.vue";
import travellersHome from "@/components/pages/travellersHome.vue";
import managersHome from "@/components/pages/managersHome.vue";
import merchantsHome from "@/components/pages/merchantsHome.vue";
import ProductAuditSlider from "@/components/pages/managers/managersPages/ProductAuditSlider.vue";
import contentSupervision from "@/components/pages/managers/managersPages/contentSupervision.vue";
import rolemanagement from "@/components/pages/managers/managersPages/rolemanagement.vue";
import guideQualificationManagement from "@/components/pages/managers/managersPages/guideQualificationManagement.vue";
import orderManagement from "@/components/pages/managers/managersPages/orderManagement.vue";
import financeMinimal from "@/components/pages/managers/managersPages/financeMinimal.vue";
import systemMaintenance from "@/components/pages/managers/managersPages/systemMaintenance.vue";
import adminDashboardGray from "@/components/pages/managers/managersPages/adminDashboardGray.vue";
import productManagement from "@/components/pages/merchant/productManagement.vue";
import guideCooperation from "@/components/pages/merchant/guideCooperation.vue";
import articleManagement from "@/components/pages/merchant/articleManagement.vue";
import orderProcessing from "@/components/pages/merchant/orderProcessing.vue";
import serviceManagement from "@/components/pages/merchant/serviceManagement.vue";
import reviewResponse from "@/components/pages/merchant/reviewResponse.vue";
import dataCenter from "@/components/pages/merchant/dataCenter.vue";
import merchantInfo from "@/components/pages/merchant/merchantInfo.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/auth/loginPage",
  },
  {
    path: "/travellers/home",
    name: "travellershome",
    component: travellersHome,
    children: [
      {
        path: "/traveller/packageDetail",
        name: "packageDetail",
        component: packageDetail,
      },
      {
        path: "/traveller/selfPlan",
        name: "selfPlan",
        component: selfPlan,
      },
      {
        path: "/traveller/guidesAbout",
        name: "gidesAbout",
        component: guidesAbout,
      },
      {
        path: "/traveller/mycollection",
        name: "mycollection",
        component: myCollection,
      },
      {
        path: "/traveller/myinfo",
        name: "myinfo",
        component: myInfo,
      },
      {
        path: "/traveller/order",
        name: "order",
        component: myOrder,
      },
      {
        path: "/traveller/ordermanage",
        name: "ordermanage",
        component: orderManage,
      },
      {
        path: "/traveller/routesmanage",
        name: "routesmanage",
        component: routesManage,
      },
      {
        path: "/traveller/orderList",
        name: "orderList",
        component: orderList,
      },
    ],
  },

  {
    path: "/managers/home",
    name: "managershome",
    component: managersHome,
    children: [
      {
        path: "/managers/productaudit",
        name: "productaudit",
        component: ProductAuditSlider,
      },
      {
        path: "/managers/contentSupervision",
        name: "contentsupervision",
        component: contentSupervision,
      },
      {
        path: "/managers/rolemanagement",
        name: "rolemanagement",
        component: rolemanagement,
      },
      {
        path: "/managers/guideQualification",
        name: "guidequalification",
        component: guideQualificationManagement,
      },
      {
        path: "/managers/orderManagement",
        name: "orderManagement",
        component: orderManagement,
      },
      {
        path: "/managers/financeMinimal",
        name: "financeMinimal",
        component: financeMinimal,
      },
      {
        path: "/managers/systemMaintenance",
        name: "systemMaintenance",
        component: systemMaintenance,
      },
      {
        path: "/managers/adminManagement",
        name: "adminManagement",
        component: adminDashboardGray,
      },
    ],
  },

  {
    path: "/merchants/home",
    name: "merchantshome",
    component: merchantsHome,
    children: [
      {
        path: "/merchant/productManagement",
        name: "productManagement",
        component: productManagement,
      },
      {
        path: "/merchant/guideCooperation",
        name: "guideCooperation",
        component: guideCooperation,
      },
      {
        path: "/merchant/articleManagement",
        name: "articleManagement",
        component: articleManagement,
      },
      {
        path: "/merchant/orderProcessing",
        name: "orderProcessing",
        component: orderProcessing,
      },
      {
        path: "/merchant/serviceManagement",
        name: "serviceManagement",
        component: serviceManagement,
      },
      {
        path: "/merchant/reviewResponse",
        name: "reviewResponse",
        component: reviewResponse,
      },
      {
        path: "/merchant/dataCenter",
        name: "dataCenter",
        component: dataCenter,
      },
      {
        path: "/merchant/merchantInfo",
        name: "merchantInfo",
        component: merchantInfo,
      },
    ],
  },

  {
    path: "/purchasePages",
    name: "purchasePages",
    component: purchasePages,
  },
  {
    path: "/purchaseOrder",
    name: "purchaseOrder",
    component: purchaseOrder,
  },
  {
    path: "/auth/loginPage",
    name: "loginPage",
    component: loginPage,
  },
  {
    path: "/auth/registerPage",
    name: "registerPage",
    component: registerPage,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;
