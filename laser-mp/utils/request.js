const app = getApp()

const request = {
  baseUrl: app.globalData.baseUrl,

  // 获取token
  getToken() {
    return wx.getStorageSync('token')
  },

  // 设置token
  setToken(token) {
    wx.setStorageSync('token', token)
  },

  // 清除token
  clearToken() {
    wx.removeStorageSync('token')
  },

  // 检查是否需要登录
  checkLogin() {
    const token = this.getToken()
    console.log('检查登录状态，token:', token ? '存在' : '不存在')
    if (!token) {
      console.log('未登录，跳转到登录页面')
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return false
    }
    return true
  },

  // 请求拦截器
  beforeRequest(options) {
    console.log('请求拦截器，URL:', options.url)
    console.log('请求方法:', options.method)
    console.log('请求数据:', options.data)
    
    // 设置通用请求头
    options.header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 登录接口不需要验证token
    if (options.url.includes('/auth/login')) {
      console.log('登录请求，跳过token验证')
      return true
    }
    
    if (!this.checkLogin()) {
      console.log('未登录，请求被拦截')
      return false
    }
    
    const token = this.getToken()
    if (token) {
      console.log('添加token到请求头:', token)
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      }
    }
    return true
  },

  // 响应拦截器
  handleResponse(res) {
    console.log('响应拦截器收到的数据:', res)
    console.log('响应状态码:', res.statusCode)
    console.log('响应数据:', res.data)
    
    return new Promise((resolve, reject) => {
      // 登录接口特殊处理
      if (res.url && res.url.includes('/auth/login')) {
        // 如果是登录接口，即使返回401也返回响应数据
        if (res.statusCode === 401) {
          console.log('登录失败，返回响应数据')
          resolve(res)
          return
        }
        console.log('登录成功，返回响应数据')
        resolve(res)
        return
      }
      
      // 检查 HTTP 状态码
      if (res.statusCode === 401) {
        console.log('未授权，清除token并跳转到登录页面')
        this.clearToken()
        wx.redirectTo({
          url: '/pages/login/index'
        })
        reject(new Error(res.data?.message || '未授权，请重新登录'))
        return
      }

      // 检查业务状态码
      if (res.data && !res.data.success) {
        console.log('业务处理失败:', res.data.message)
        reject(new Error(res.data.message || '请求失败'))
        return
      }

      console.log('请求成功，返回响应数据')
      resolve(res)
    })
  },

  // GET请求
  get(url, params = {}) {
    console.log('发起GET请求:', url, '参数:', params)
    return new Promise((resolve, reject) => {
      // 确保url不以/api开头，因为baseUrl已经包含了/api
      if (url.startsWith('/api/')) {
        url = url.substring(4)
        console.log('修正后的URL:', url)
      }
      
      const options = {
        url: this.baseUrl + url,
        method: 'GET',
        data: params
      }

      if (!this.beforeRequest(options)) {
        console.log('请求被拦截，未发送')
        return reject(new Error('未登录'))
      }

      console.log('发送GET请求:', options.url)
      wx.request({
        ...options,
        success: (res) => {
          this.handleResponse(res)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          console.error('请求失败:', error)
          reject(error)
        }
      })
    })
  },

  // POST请求
  post(url, data = {}) {
    console.log('发起POST请求:', url, '数据:', data)
    return new Promise((resolve, reject) => {
      // 确保url不以/api开头，因为baseUrl已经包含了/api
      if (url.startsWith('/api/')) {
        url = url.substring(4)
        console.log('修正后的URL:', url)
      }
      
      const options = {
        url: this.baseUrl + url,
        method: 'POST',
        data: data  // 不需要手动序列化，wx.request 会自动处理
      }

      if (!this.beforeRequest(options)) {
        console.log('请求被拦截，未发送')
        return reject(new Error('未登录'))
      }

      console.log('发送POST请求:', options.url)
      wx.request({
        ...options,
        success: (res) => {
          this.handleResponse(res)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          console.error('请求失败:', error)
          reject(error)
        }
      })
    })
  }
}

module.exports = request 