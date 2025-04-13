const request = require('../../utils/request')

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  async handleLogin() {
    const { username, password } = this.data
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      console.log('开始登录请求...')
      console.log('用户名:', username)
      console.log('密码:', password)
      
      const res = await request.post('/auth/login', {
        jobNumber: username,
        password: password
      })
      console.log('登录响应:', res)

      // 检查响应状态码
      if (res.statusCode === 401) {
        throw new Error(res.data?.message || '用户名或密码错误')
      }

      if (res.data && res.data.success && res.data.token) {
        // 保存token
        request.setToken(res.data.token)
        console.log('Token已保存:', res.data.token)
        
        // 显示登录成功提示
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/machines/index'
          })
        }, 1500)
      } else {
        console.error('登录失败:', res)
        throw new Error(res.data?.message || '登录失败，请检查用户名和密码')
      }
    } catch (error) {
      console.error('登录错误:', error)
      wx.showToast({
        title: error.message || '登录失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 