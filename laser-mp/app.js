App({
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:3000/api'  // 开发环境
    // baseUrl: 'https://your-production-domain.com/api'  // 生产环境
  },
  onLaunch() {
    console.log('应用启动，baseUrl:', this.globalData.baseUrl)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  }
}) 