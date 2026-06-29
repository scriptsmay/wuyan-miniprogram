const app = getApp()

Page({
  data: {
    loading: true,
    heroes: []
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const db = app.globalData.db
      if (!db) return

      const res = await db.collection('season_summaries')
        .orderBy('updated_at', 'desc')
        .limit(1)
        .get()

      if (res.data && res.data.length > 0) {
        const heroTop = res.data[0].hero_top || []
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
    } catch (err) {
      console.error('加载英雄池失败:', err)
    } finally {
      this.setData({ loading: false })
    }
  }
})
