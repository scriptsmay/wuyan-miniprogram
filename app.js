App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'trial-sh-d1gqznm4577d6a062',
      traceUser: true
    })
    this.globalData.db = wx.cloud.database()
  },

  globalData: {
    db: null
  }
})
