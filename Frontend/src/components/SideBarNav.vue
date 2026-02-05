<script>
export default {
  name: 'SideBarNav',
  props: {
    isCollapsed: Boolean,
    darkMode: Boolean
  },
  data() {
    return {
      menuItems: [
        // { title: 'Dashboard', path: '/dashboard', icon: 'bi-house' },
        { title: 'Employees', path: '/employees', icon: 'bi-people' },
        { title: 'Attendance', path: '/attendance', icon: 'bi-calendar-check' },
        { title: 'Payroll', path: '/payroll', icon: 'bi-cash-stack' },
        { title: 'Performance', path: '/performance', icon: 'bi-graph-up' },
        { title: 'Time Off', path: '/timeoff', icon: 'bi-clock-history' },
        { title: 'Settings', path: '/settings', icon: 'bi-gear' }
      ]
    }
  },
  methods: {
    navigateTo(path) {
      if(window.innerWidth <= 768){
        this.$emit('close-sidebar');
      }
      this.$router.push(path);
    },
    isItemActive(item) {
      return this.$route.path === item.path;
    }
  }
}
</script>

<template>
  <aside 
    class="sidebar" 
    :class="{ 
      'collapsed': isCollapsed,
      'dark-mode': darkMode
    }">
    <!-- <div class="sidebar-header">
      <router-link to="/dashboard" class="sidebar-logo">
        <i class="bi bi-people"></i>
        <span v-if="!isCollapsed">ModernTech.HR</span>
      </router-link>
    </div> -->

    <nav class="sidebar-nav">
      <ul class="nav-menu">
        <li v-for="item in menuItems" 
            :key="item.path" 
            class="nav-item"
            :class="{ 'active': isItemActive(item) }"
            @click="navigateTo(item.path)">
          
          <router-link :to="item.path" class="nav-link">
            <i :class="'bi ' + item.icon"></i>
            <span v-if="!isCollapsed" class="nav-text">{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar.dark-mode {
  background: #1a1d21;
  border-right: 1px solid #2d3746;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
}

.sidebar.dark-mode .sidebar-header {
  background: #1a1d21;
  border-bottom: 1px solid #2d3746;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.sidebar-logo:hover {
  color: #e88b22;
}

.sidebar-logo i {
  font-size: 1.8rem;
  color: #e88b22;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #e9ecef;
  transform: translateX(2px);
}

.nav-item.active {
  background-color: #2b3a58;
}

.nav-item.active:hover {
  background-color: #ffab1a;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #495057;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-item.active .nav-link {
  color: white;
}

.nav-item:hover .nav-link {
  color: #2c3e50;
}

.nav-link i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.sidebar.dark-mode .sidebar-logo {
  color: #fafafa;
}

.sidebar.dark-mode .sidebar-logo i {
  color: #2a5fe7;
}

.sidebar.dark-mode .sidebar-logo:hover {
  color: #e88b22;
}

.sidebar.dark-mode .sidebar-logo:hover i {
  color: #e88b22;
}

.sidebar.dark-mode .nav-item:hover {
  background-color: #ae7718;
}

.sidebar.dark-mode .nav-link {
  color: #ffffff;
}

.sidebar.dark-mode .nav-item:hover .nav-link {
  color: #efede9;
}

.sidebar.dark-mode .sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar.dark-mode .sidebar-nav::-webkit-scrollbar-track {
  background: #2d3746;
}

.sidebar.dark-mode .sidebar-nav::-webkit-scrollbar-thumb {
  background: #dadfe3;
  border-radius: 4px;
}

.sidebar.dark-mode .sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #6c757d;
}

@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .sidebar:not(.collapsed) {
    width: 250px;
  }
  
  .sidebar.collapsed .nav-text {
    display: none;
  }
}

</style>