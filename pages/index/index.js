const app = getApp()

Page({
  data: {
    loading: true,
    error: '',
    playerName: '',
    teamName: '',
    seasonName: '',
    winRate: '',
    kda: '',
    totalGames: '',
    mvpCount: '',
    seasonStats: { wins: 0, loses: 0, kills: 0, deaths: 0, assists: 0 },
    heroPool: [],
    liveSummary: { loaded: false, days: 0, sessions: 0, hours: 0 }
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  async loadData() {
    this.setData({ loading: true, error: '' })
    try {
      const db = app.globalData.db
      if (!db) {
        this.setData({ error: '云开发未初始化' })
        return
      }

      const [seasonRes, liveRes] = await Promise.all([
        db.collection('season_summaries')
          .orderBy('updated_at', 'desc')
          .limit(1)
          .get(),
        db.collection('live_streams')
          .where({ type: 'monthly_summary' })
          .orderBy('updated_at', 'desc')
          .limit(1)
          .get()
      ])

      if (seasonRes.data && seasonRes.data.length > 0) {
        this.buildSeasonData(seasonRes.data[0])
      } else {
        this.setData({ error: '暂无比赛数据' })
      }

      if (liveRes.data && liveRes.data.length > 0) {
        this.buildLiveData(liveRes.data[0])
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      this.setData({ error: '数据加载失败: ' + err.message })
    } finally {
      this.setData({ loading: false })
    }
  },

  buildSeasonData(doc) {
    const d = doc.data
    const cs = d.current_season || {}
    const heroTop = d.hero_top || []
    const career = d.career_summary || {}
    const info = d.player_info || {}

    const winRateNum = parseFloat(cs.win_rate || '0')
    const heroPool = heroTop.map(h => {
      const rate = parseFloat(h.win_rate || '0')
      let winRateClass = 'win-low'
      if (rate >= 70) winRateClass = 'win-high'
      else if (rate >= 50) winRateClass = 'win-mid'
      return {
        name: h.hero_name,
        battles: h.battles,
        winRate: h.win_rate,
        winRateClass
      }
    })

    this.setData({
      playerName: info.latest_nickname || '—',
      teamName: info.latest_team || '—',
      seasonName: doc.season_name || '—',
      winRate: cs.win_rate || '—',
      kda: cs.kda_ratio || '—',
      totalGames: String(career.total_matches || cs.battles || 0),
      mvpCount: String(cs.mvp || career.mvp_count || 0),
      seasonStats: {
        wins: cs.wins || 0,
        loses: cs.loses || 0,
        kills: cs.avg_kills || 0,
        deaths: cs.avg_deaths || 0,
        assists: cs.avg_assists || 0
      },
      heroPool
    })
  },

  buildLiveData(doc) {
    this.setData({
      liveSummary: {
        loaded: true,
        days: doc.total_days || 0,
        sessions: doc.total_sessions || 0,
        hours: doc.total_hours || 0
      }
    })
  },

  goCalendar() {
    wx.switchTab({ url: '/pages/calendar/calendar' })
  },

  goHeroes() {
    wx.navigateTo({ url: '/pages/heroes/heroes' })
  }
})
