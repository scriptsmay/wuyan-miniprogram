const app = getApp()

Page({
  data: {
    loading: true,
    heroes: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true })

    const base = app.globalData.funcBase
    const token = 'wuyan-mini-2026'

    return new Promise((resolve) => {
      wx.request({
        url: `${base}/api/overview?token=${token}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const d = res.data.data.overview || {}
            const heroTop = d.hero_top || []
            const maxBattles = Math.max(...heroTop.map(h => h.battles || 0), 1)

            const heroes = heroTop.map((h, i) => {
              const rate = parseFloat(h.win_rate || '0')
              let winRateClass = 'win-low'
              if (rate >= 70) winRateClass = 'win-high'
              else if (rate >= 50) winRateClass = 'win-mid'

              return {
                rank: i + 1,
                name: h.hero_name,
                battles: h.battles,
                winRate: h.win_rate,
                winRateClass,
                barWidth: ((h.battles || 0) / maxBattles * 100).toFixed(0)
              }
            })

            this.setData({ heroes })
          }
        },
        fail: (err) => {
          console.error('加载英雄池失败:', err)
        },
        complete: () => {
          this.setData({ loading: false })
          resolve()
        }
      })
    })
  }
})
