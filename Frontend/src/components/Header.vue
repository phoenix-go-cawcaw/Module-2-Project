<script>
export default {
  name: 'Header',
  props: {
    darkMode: Boolean
  },
  data() {
    return {
      searchQuery: '',
      showUserMenu: false,
      time: this.getCurrentTime(),
      formattedDate: this.getFormattedDate(),
      timeInterval: null
    }
  },
  methods: {
    toggleDarkMode() {
      this.$emit('toggle-dark-mode');
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        alert(`Searching for: ${this.searchQuery}`);
        this.searchQuery = '';
      }
    },
    logout() {
      this.$emit('logout');
      this.showUserMenu = false;
    },
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    getFormattedDate() {
      const now = new Date();
      return now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.timeInterval = setInterval(() => {
      this.time = this.getCurrentTime();
    }, 60000);
  },
  beforeUnmount() {
    clearInterval(this.timeInterval);
  }
}
</script>

<template>
  <header class="header" :class="{ 'dark-mode': darkMode }">
    <div class="header-left">
      <button class="menu-button" @click="$emit('toggle-sidebar')">
        <i class="bi bi-list"></i>
      </button>

      <div class="logo" @click="$router.push('/dashboard')">
        <div class="logo-icon">
          <img src="../assets/Black White Bold Modern Studio Logo.png">
        </div>
        <div class="logo-text">
          <span class="app-name">ModernTech HR</span>
          <span class="app-tag">Employee Management System</span>
        </div>
      </div>
    </div>

    <!-- <div class="header-middle">
      <div class="search-box">
        <i class="bi bi-search search-icon"></i>
        <input type="text" v-model="searchQuery" placeholder="Find employee or document..." class="search-input"
          @keyup.enter="handleSearch" />
        <button class="search-btn" @click="handleSearch">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div> -->

    <div class="header-right">
      <div class="datetime">
        <div class="date">{{ formattedDate }}</div>
        <div class="time">{{ time }}</div>
      </div>

      <button class="theme-btn" @click="toggleDarkMode" :title="darkMode ? 'Light mode' : 'Dark mode'">
        <i :class="darkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
      </button>

      <div class="user-menu-container">
        <button class="user-btn" @click="toggleUserMenu">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <span class="user-name">HR User</span>
          <i class="bi bi-chevron-down user-arrow"></i>
        </button>

        <div v-if="showUserMenu" class="user-dropdown">
          <div class="dropdown-header">
            <div class="user-avatar-large">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-info">
              <div class="user-name-large">HR Manager</div>
              <div class="user-email">hr@moderntech.com</div>
            </div>
          </div>

          <div class="dropdown-items">
            <a href="#" class="dropdown-item">
              <i class="bi bi-person"></i>
              <span>My Profile</span>
            </a>
            <a href="#" class="dropdown-item">
              <i class="bi bi-gear"></i>
              <span>Settings</span>
            </a>
            <a href="#" class="dropdown-item">
              <i class="bi bi-question-circle"></i>
              <span>Help</span>
            </a>

            <div class="dropdown-divider"></div>

            <button class="dropdown-item logout" @click="logout">
              <i class="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>

          <div class="dropdown-footer">
            <span class="status">
              <i class="bi bi-circle-fill online"></i>
              Online
            </span>
            <span class="version">v1.0</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, color 0.3s;
  z-index: 1000;
}

.header.dark-mode {
  background-color: #2c3e50;
  color: #ecf0f1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #5f43db;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.logo:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.logo-icon {
  font-size: 1.8rem;
  color: #a9cde5;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 25%;
  margin-top: 5px;
}

.app-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
}

.dark-mode .app-name {
  color: #ecf0f1;
}

.app-tag {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.header-middle {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 20px;
  padding: 5px 15px;
  transition: background-color 0.3s;
}

.dark-mode .search-box {
  background-color: #34495e;
}

.search-icon {
  color: #95a5a6;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #2c3e50;
}

.dark-mode .search-input {
  color: #ecf0f1;
}

.search-input::placeholder {
  color: #95a5a6;
}

.search-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

search-btn:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.header-right{
  display: flex;
  align-items: center;
  gap: 20px;
}

.datetime {
  text-align: right;
  font-size: 0.9rem;
}

.date{
  color: #7f8c8d;
  font-size: 0.8rem;
}

.time{
  font-weight: bold;
  color: #2c3e50;
}

.dark-mode .time{
  color: #ecf0f1;
}

.theme-btn{
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #3498db;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.dark-mode .theme-btn{
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #f6ae1e;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.theme-btn:hover{
  background-color: rgba(243, 156, 18, 0.1);
}

.user-menu-container{
  position: relative;
}

.user-btn{
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #2c3e50;
}

.dark-mode .user-btn{
  color: #ecf0f1;
}

.user-btn:hover{
  background-color: rgba(52, 152, 219, 0.1);
}

.user-avatar{
  font-size: 1.5rem;
  color: #3498db;
}

.dark-mode .user-avatar {
  font-size: 1.5rem;
  color: #f6ae1e;
}

.user-name{
  font-weight: 500;
}

.user-arrow{
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.user-btn[aria-expanded="true"] .user-arrow{
  transform: rotate(180deg);
}

.user-dropdown{
  position: absolute;
  top: calc(100% +10%);
  right: 0;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dark-mode .user-dropdown{
  background-color: #2c3e50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown-header{
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.dark-mode .dropdown-header{
  background-color: #34495e;
  border-bottom-color:#4a6572 ;
}

.user-avatar-large{
  font-size: 2.5rem;
  color: #3498db;
  margin-right: 15px;
}

.dark-mode .user-avatar-large{
  font-size: 2.5rem;
  color: #f6ae1e;
  margin-right: 15px;
}

.user-info{
  flex: 1
}

.user-name-large{
  font-weight: bold;
  color: #2c3e50;
}

.dark-mode .user-name-large{
  color: #ecf0f1;
}

.user-email{
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 2px;
}

.dropdown-items{
  padding: 10px 0;
}

.dropdown-item{
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: #2c3e50;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.dark-mode .dropdown-item{
  color: #ecf0f1;
}

.dropdown-item:hover{
  background-color: #f8f9fa;
}

.dark-mode .dropdown-item:hover{
  background-color: #34495e;
}

.dropdown-item i{
  width: 20px;
  color: #7f8c8d;
}

.dropdown-divider{
  height: 1px;
  background-color: #e9ecef;
  margin: 10px 0;
}

.dark-mode .dropdown-divider{
  background-color: #4a6572;
}

.dropdown-item.logout{
  color: #e74c3c;
}

.dropdown-footer{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 0.8rem;
}

.dark-mode .dropdown-footer{
  background-color: #34495e;
  border-top-color:#4a6572 ;
}

.status{
  display: flex;
  align-items: center;
  gap: 5px;
  color: #27ae60;
}

.online{
  color: #27ae60;
  font-size: 0.6rem;
}

.version{
  color: #95a5a6;
}

@media (max-width: 992px){
  .header-middle{
    display:none;
  }
}

@media(max-width: 768px){
  .datetime{
    display: none;
  }

  .user-name{
    display: none;
  }
}

@media(max-width: 576px){
  .header{
    padding: 0 10px;
  }
  .logo-text{
    display: none;
  }
}
</style>