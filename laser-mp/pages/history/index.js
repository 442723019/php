const request = require('../../utils/request')

Page({
  data: {
    historyList: [],
    loading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    error: null
  },

  onLoad() {
    this.fetchHistory()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  // 获取历史记录
  async fetchHistory() {
    this.setData({ loading: true, error: null })
    try {
      const response = await request.get('/machines/statusHistory', {
        page: this.data.currentPage,
        pageSize: this.data.pageSize
      })
      if (response.data.success) {
        this.setData({
          historyList: response.data.data
          //total: response.data.data
        })
      } else {
        this.setData({
          error: response.message || '获取历史记录失败'
        })
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      this.setData({
        error: '获取历史记录失败，请检查网络连接'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看详情
  handleDetail(e) {
    const { record } = e.currentTarget.dataset
    wx.showModal({
      title: '状态详情',
      content: `
        设备名称: ${record.machineName}
        设备编号: ${record.machineCode}
        状态: ${record.statusText}
        时间: ${record.createTime}
        持续时间: ${record.duration}
        备注: ${record.remark || '无'}
      `,
      showCancel: false
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ currentPage: 1 })
    this.fetchHistory().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.historyList.length < this.data.total) {
      this.setData({
        currentPage: this.data.currentPage + 1
      })
      this.fetchHistory()
    }
  }
}) 