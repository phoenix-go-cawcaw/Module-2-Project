<script>
import { inject } from 'vue';

export default {
  name: 'LoginPage',
  setup() {
    const globalState = inject('globalState');
    return { globalState };
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false,
      errorMessage: '',
      dummyCredentials: {
        email: 'hr@moderntech.com',
        password: 'hr123'
      }
    }
  },
  methods: {
    handleLogin() {
      if (!this.email || !this.password) {
        this.errorMessage = 'Please fill in all fields'
        return
      }

      this.loading = true
      this.errorMessage = ''

      setTimeout(() => {
        if (this.email === this.dummyCredentials.email &&
          this.password === this.dummyCredentials.password) {

          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('userEmail', this.email)
          this.globalState.isAuthenticated = true;

          if (this.rememberMe) {
            localStorage.setItem('savedEmail', this.email)
            localStorage.setItem('rememberMe', 'true')
          } else {
            localStorage.removeItem('savedEmail')
            localStorage.removeItem('rememberMe')
          }

          this.$router.push('/employees')
        } else {
          this.errorMessage = 'Invalid email or password'
        }

        this.loading = false
      }, 500)
    }
  },
  mounted() {
    const savedEmail = localStorage.getItem('savedEmail')
    const rememberMe = localStorage.getItem('rememberMe')

    if (savedEmail && rememberMe === 'true') {
      this.email = savedEmail
      this.rememberMe = true
    }

    if (localStorage.getItem('isAuthenticated') === 'true') {
      this.globalState.isAuthenticated = true;
      this.$router.push('/employees')
    }
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="left-panel">
        <div class="welcome-section">
          <div class="logo">
            <img src="../assets/MagicEraser_251209_102555.png">
          <h1>ModernTech.HR</h1>
        </div>

        <div class="welcome-text">
          <h2>Welcome back!</h2>
        </div>

        <div class="features">
          <div class="feature">
            <i class="bi bi-people"></i>
            <span>Manage Employees</span>
          </div>
          <div class="feature">
            <i class="bi bi-cash-stack"></i>
            <span>Process Payroll</span>
          </div>
          <div class="feature">
            <i class="bi bi-calendar-check"></i>
            <span>Track Attendance</span>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="login-card">
        <h3>Sign In</h3>

        <div v-if="errorMessage" class="error-message">
          <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-group">
              <i class="bi bi-envelope"></i>
              <input v-model="email" type="email" placeholder="you@company.com" required />
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-group">
              <i class="bi bi-lock"></i>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter password"
                required />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember">
              <input type="checkbox" v-model="rememberMe">
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="!loading">Sign In</span>
            <span v-else>Signing in...</span>
          </button>

          <div class="login-footer">
            <p>Need help? <a href="#">Contact our support</a></p>
            <p class="version">HR System v1.0</p>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
</template>


<style scoped>
/* * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
} */

/* body {
  background-color: #f8fafc;
  color: #334155;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
} */

.login-page {
  /* width: 100%;
  max-width: 1100px;
  height: 700px; */
  background: white;
  /* border-radius: 24px; */
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  display: flex;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.login-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #7657ff 15%, #0c005b 100%);
  color: white;
  padding: 50px 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.logo i {
  font-size: 36px;
  background: rgba(255, 255, 255, 0.15);
  padding: 18px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.logo h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
}

.welcome-text {
  margin-bottom: 70px;
  position: relative;
  z-index: 1;
}

.welcome-text h2 {
  font-size: 38px;
  font-weight: 700;
  line-height: 1.2;
  max-width: 300px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  z-index: 1;
}

.feature {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.feature:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.feature i {
  font-size: 22px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
}

.feature span {
  font-size: 17px;
  font-weight: 500;
}

.right-panel {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-card {
  /* width: 100%;
  max-width: 420px; */
  padding: 40px;
  background: white;
  /* border-radius: 20px; */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.login-card h3 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 30px;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 15px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  border: 1px solid #fecaca;
}

.error-message i {
  font-size: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 18px;
  transition: all 0.3s ease;
}

.input-group i {
  color: #94a3b8;
  font-size: 20px;
  margin-right: 15px;
}

.input-group input {
  flex: 1;
  padding: 18px 0;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #1e293b;
  outline: none;
}

.input-group input::placeholder {
  color: #94a3b8;
}

.toggle-password {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #3b82f6;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #475569;
  font-size: 15px;
}

.remember input {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.forgot-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s;
}

.forgot-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.login-btn {
  background: linear-gradient(to right, #160e85, #258beb);
  color: white;
  border: none;
  padding: 20px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 40px;
  padding-top: 25px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.login-footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.login-footer a:hover {
  text-decoration: underline;
}

.version {
  margin-top: 10px;
  font-size: 13px;
  color: #94a3b8;
}

@media (max-width: 768px) {

  .login-page {
    flex-direction: column;
    height: auto;
    max-width: 100%;
  }

  .login-container {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    flex: unset;
    width: 100%;
    padding: 35px 30px;
    text-align: center;
    align-items: center;
  }

  .logo {
    justify-content: center;
  }

  .logo h1 {
    font-size: 26px;
  }

  .welcome-text h2 {
    font-size: 28px;
    max-width: 100%;
  }

  .features {
    width: 100%;
    align-items: center;
  }

  .feature {
    width: 100%;
    justify-content: center;
  }

  .right-panel {
    flex: unset;
    width: 100%;
    padding: 40px 25px;
  }

  .login-card {
    max-width: 100%;
    padding: 30px;
  }

  .login-card h3 {
    font-size: 26px;
  }

  .input-group {
    padding: 0 14px;
  }

  .input-group input {
    padding: 14px 0;
    font-size: 15px;
  }

  .login-form {
    gap: 18px;
  }

  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .remember {
    font-size: 14px;
  }

  .forgot-link {
    font-size: 14px;
  }

  .login-btn {
    padding: 16px;
    font-size: 16px;
  }

  .login-footer {
    margin-top: 30px;
    padding-top: 20px;
  }
}
</style>