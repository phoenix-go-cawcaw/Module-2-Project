import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  // {
  //   path: "/dashboard",
  //   name: "Dashboard",
  //   component: () => import("../views/Dashboard.vue"),
  // },
  {
    path: "/employees",
    name: "Employees",
    component: () => import("../views/Employees.vue"),
  },
  {
    path: "/attendance",
    name: "Attendance",
    component: () => import("../views/Attendance.vue"),
  },
  {
    path: "/payroll",
    name: "Payroll",
    component: () => import("../views/Payroll.vue"),
  },
  {
    path: "/performance",
    name: "Performance",
    component: () => import("../views/Performance.vue"),
  },
  {
    path: "/timeoff",
    name: "TimeOff",
    component: () => import("../views/TimeOff.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/Settings.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/employees" 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated && to.path !== "/") {
    next("/")
  } else if (isAuthenticated && to.path === "/") {
    next("/employees")
  } else {
    next()
  }
})

export default router