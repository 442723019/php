const request = require('../../utils/request')

Page({
  data: {
    machines: [],
    loading: false,
    error: null
  },

  onLoad() {
    console.log('设备管理页面加载')
    // 检查登录状态
    if (!request.checkLogin()) {
      console.log('未登录，跳转到登录页面')
      return
    }
    this.fetchMachines()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    
    // 每次显示页面时检查登录状态
    if (!request.getToken()) {
      console.log('未登录，跳转到登录页面')
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return
    }
  },

  // 获取设备列表
  async fetchMachines() {
    console.log('开始获取设备列表')
    this.setData({ loading: true, error: null })
    try {
      // 修复API路径，移除重复的/api前缀
      console.log('发送请求到 /machines/realtime')
      const response = await request.get('/machines/realtime')
      console.log('收到响应:', response)
      
      if (response.data && response.data.success) {
        console.log('获取设备列表成功，数据:', response.data.data)
        this.setData({ machines: response.data.data })
      } else {
        console.error('获取设备列表失败:', response.data?.message || '未知错误')
        this.setData({
          error: response.data?.message || '获取设备列表失败'
        })
      }
    } catch (error) {
      console.error('获取设备列表出错:', error)
      this.setData({
        error: '网络请求失败: ' + (error.message || '未知错误')
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看设备详情
  handleDetail(e) {
    const { machine } = e.currentTarget.dataset
    wx.showModal({
      title: `设备 ${machine.machineName} 详细信息`,
      content: `
        设备名称: ${machine.machineName}
        设备编号: ${machine.machineCode}
        当前程序: ${machine.currentProgram}
        稼动率: ${machine.efficiency}%
        开机时间: ${machine.powerOnTime}
        加工时间: ${machine.processTime}
        待机时间: ${machine.prapareTime}
        报警时间: ${machine.alarmTime}
        报警次数: ${machine.alarmCount}
      `,
      showCancel: false
    })
  },

  // 设备控制
  handleControl(e) {
    const { machine } = e.currentTarget.dataset
    wx.showModal({
      title: '设备控制',
      content: '确定要执行此操作吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '操作已发送',
            icon: 'success'
          })
        }
      }
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新')
    this.fetchMachines().then(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 