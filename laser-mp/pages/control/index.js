const request = require('../../utils/request')

Page({
  data: {
    machines: [],
    loading: false,
    selectedMachine: null,
    controlActions: [
      { name: '开机', value: 'power_on' },
      { name: '关机', value: 'power_off' },
      { name: '暂停', value: 'pause' },
      { name: '继续', value: 'resume' },
      { name: '急停', value: 'emergency_stop' }
    ]
  },

  onLoad() {
    this.fetchMachines()
  },

  // 获取设备列表
  async fetchMachines() {
    this.setData({ loading: true })
    try {
      const response = await request.get('/machines/realtime')
      if (response.success) {
        this.setData({ machines: response.data })
      } else {
        wx.showToast({
          title: response.message || '获取设备列表失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('Error fetching machines:', error)
      wx.showToast({
        title: '获取设备列表失败，请检查网络连接',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 选择设备
  handleSelectMachine(e) {
    const { machine } = e.currentTarget.dataset
    this.setData({ selectedMachine: machine })
  },

  // 执行控制操作
  async handleControl(e) {
    const { action } = e.currentTarget.dataset
    const { selectedMachine } = this.data

    if (!selectedMachine) {
      wx.showToast({
        title: '请先选择设备',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认操作',
      content: `确定要对设备 ${selectedMachine.machineName} 执行${action.name}操作吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await request.post('/machines/control', {
              machineCode: selectedMachine.machineCode,
              action: action.value
            })

            if (response.success) {
              wx.showToast({
                title: '操作已发送',
                icon: 'success'
              })
              // 刷新设备状态
              this.fetchMachines()
            } else {
              wx.showToast({
                title: response.message || '操作失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('Error controlling machine:', error)
            wx.showToast({
              title: '操作失败，请检查网络连接',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchMachines().then(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 