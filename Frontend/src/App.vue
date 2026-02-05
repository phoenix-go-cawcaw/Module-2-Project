<script>
import Header from './components/Header.vue';
import SideBarNav from './components/SideBarNav.vue';
import { inject } from 'vue';

export default {
  name: 'App',
  components: {
    Header,
    SideBarNav
  },
  setup() {
    const globalState = inject('globalState');
    return { globalState };
  },
  data() {
    return {
      darkMode: false,
      isSidebarCollapsed: false,
    }
  },
  computed: {
    isLoggedIn() {
      return this.globalState.isAuthenticated;
    }
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.isDarkMode)
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    logout() {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      this.globalState.isAuthenticated = false;
      this.$router.push('/');
    }
  },
  mounted() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.DarkMode = savedDarkMode === 'true'
    }

    if (!this.isLoggedIn && this.$route.path !== '/') {
      this.$router.push('/');
    }
  },
  watch: {
    darkMode(newVal) {
      localStorage.setItem('darkMode', JSON.stringify(newVal));
    }
  }
}
</script>


<template>
  <div id="app" :class="{ 'dark-mode': darkMode }">
    <div v-if="isLoggedIn">
      <Header :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode" @logout="logout"
        @toggle-sidebar="toggleSidebar" />

      <div class="main-container">
        <SideBarNav :is-collapsed="isSidebarCollapsed" :dark-mode="darkMode" />
        <main :class="['main-content', { 'sidebar-collapsed': isSidebarCollapsed }]">
          <router-view />
        </main>
      </div>
    </div>

    <div v-else>
      <router-view @login="login" />
    </div>
  </div>
</template>


<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

/* light mode is default mode in website*/
#app {
  background-color: #f5f5f5;
  color: #333;
}

#app.dark-mode {
  background-color: #121416;
  color: #e9ecef;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  z-index: 999;
}

.main-container {
  display: flex;
  min-height: calc(100vh - 60px);
  position: relative;
  margin-top: 60px;
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  min-height: calc(100vh - 60px);
}

#app.dark-mode .main-content {
  background-color: #121416;
  color: #e9ecef;
}

.main-content.expanded {
  margin-left: 0;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

#app.dark-mode .main-content {
  background-color: #121416;
  color: #e9ecef;
}

@media(max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
}

.sidebar {
  top: 60px;
  height: calc(100vh - 60px);
}

@media (max-width: 576px) {
  .main-content {
    padding: 10px;
  }
}
</style>
