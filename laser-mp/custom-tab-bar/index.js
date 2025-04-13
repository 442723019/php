Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/machines/index",
        text: "设备管理"
      },
      {
        pagePath: "/pages/history/index",
        text: "状态历史"
      },
      {
        pagePath: "/pages/control/index",
        text: "设备控制"
      },
      {
        pagePath: "/pages/settings/index",
        text: "设置"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({
        url
      });
      this.setData({
        selected: data.index
      });
    }
  }
}); 