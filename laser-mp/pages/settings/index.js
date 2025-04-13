const request = require('../../utils/request')

Page({
  data: {
    settings: {
      autoRefresh: true,
      refreshInterval: 30,
      notificationEnabled: true,
      darkMode: false
    },
    loading: false
  },

  onLoad() {
    this.loadSettings()
  },

  // 加载设置
  async loadSettings() {
    this.setData({ loading: true })
    try {
      const response = await request.get('/settings')
      if (response.success) {
        this.setData({ settings: response.data })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      wx.showToast({
        title: '加载设置失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 保存设置
  async saveSettings() {
    try {
      const response = await request.post('/settings', this.data.settings)
      if (response.success) {
        wx.showToast({
          title: '设置已保存',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: response.message || '保存设置失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      wx.showToast({
        title: '保存设置失败',
        icon: 'none'
      })
    }
  },

  // 切换自动刷新
  handleAutoRefreshChange(e) {
    this.setData({
      'settings.autoRefresh': e.detail.value
    })
  },

  // 修改刷新间隔
  handleRefreshIntervalChange(e) {
    this.setData({
      'settings.refreshInterval': parseInt(e.detail.value)
    })
  },

  // 切换通知
  handleNotificationChange(e) {
    this.setData({
      'settings.notificationEnabled': e.detail.value
    })
  },

  // 切换深色模式
  handleDarkModeChange(e) {
    this.setData({
      'settings.darkMode': e.detail.value
    })
  },

  // 清除缓存
  handleClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              wx.showToast({
                title: '缓存已清除',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 检查更新
  handleCheckUpdate() {
    wx.showLoading({
      title: '检查更新中...'
    })

    // 模拟检查更新
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '检查更新',
        content: '当前已是最新版本',
        showCancel: false
      })
    }, 1500)
  },

  // 关于我们
  handleAbout() {
    wx.showModal({
      title: '关于我们',
      content: '激光切割机管理系统 v1.0.0\n\n技术支持：XXX公司\n联系电话：XXX-XXXXXXXX',
      showCancel: false
    })
  }
}) 