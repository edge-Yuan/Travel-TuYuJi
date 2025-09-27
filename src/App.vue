<template>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* 1. 取消悬浮时的浅灰色（hover 状态） */
.el-menu-item:hover {
  background-color: transparent !important;
}

/* 2. 取消选中（激活）时的浅灰色（is-active 类） */
.el-menu-item.is-active {
  background-color: transparent !important;
  /* 可选：如果需要修改选中时的文字颜色，避免与背景冲突 */
  color: #303133 !important;
}

/* 3. （可选）如果有子菜单，同步处理子菜单标题 */
.el-submenu__title:hover,
.el-submenu__title.is-active {
  background-color: transparent !important;
}
</style>
