const request = require('../../utils/request')

Page({
  data: {
    ncList: [],
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
      const response = await request.get('/api/machines/ncInfo', {
        params: {
          page: this.data.currentPage,
          pageSize: this.data.pageSize
        }
      })
      console.log('NC response:', response)
      if (response.data.success) {
        this.setData({
          ncList: response.data.data.data,
          total: response.data.data.total
        })
      } else {
        this.setData({
          error: response.data.message || '获取加工记录失败'
        })
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      this.setData({
        error: '获取加工记录失败，请检查网络连接'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src
    if (!src) {
      wx.showToast({
        title: '暂无图片数据',
        icon: 'none'
      })
      return
    }
    wx.previewImage({
      current: src,
      urls: [src]
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
    if (this.data.ncList.length < this.data.total) {
      this.setData({
        currentPage: this.data.currentPage + 1
      })
      this.fetchHistory()
    }
  }
}) 