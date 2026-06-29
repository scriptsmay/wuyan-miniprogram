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

  loadData() {
    this.setData({ loading: true, error: '' })

    const base = app.globalData.funcBase
    const token = 'wuyan-mini-2026'
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    return new Promise((resolve) => {
      let overviewDone = false
      let liveDone = false

      const checkDone = () => {
        if (overviewDone && liveDone) {
          this.setData({ loading: false })
          resolve()
        }
      }

      wx.request({
        url: `${base}/api/overview?token=${token}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.buildSeasonData(res.data.data)
          } else {
            this.setData({ error: `数据加载失败(${res.statusCode})` })
          }
        },
        fail: (err) => {
          console.error('概览请求失败:', err)
          this.setData({ error: '网络请求失败，请检查网络' })
        },
        complete: () => {
          overviewDone = true
          checkDone()
        }
      })

      wx.request({
        url: `${base}/api/live?token=${token}&year=${year}&month=${month}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const d = res.data.data
            const summary = d.summary || {}
            this.setData({
              liveSummary: {
                loaded: true,
                days: summary.total_days || 0,
                sessions: summary.total_sessions || 0,
                hours: summary.total_hours || 0
              }
            })
          } else {
            this.setData({ liveSummary: { loaded: true, days: 0, sessions: 0, hours: 0 } })
          }
        },
        fail: () => {
          this.setData({ liveSummary: { loaded: true, days: 0, sessions: 0, hours: 0 } })
        },
        complete: () => {
          liveDone = true
          checkDone()
        }
      })
    })
  },

  buildSeasonData(resp) {
    const d = resp.overview || {}
    const cs = d.current_season || {}
    const heroTop = d.hero_top || []
    const career = d.career_summary || {}
    const info = d.player_info || {}

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
      seasonName: resp.season_name || '—',
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

  goCalendar() {
    wx.switchTab({ url: '/pages/calendar/calendar' })
  },

  goHeroes() {
    wx.navigateTo({ url: '/pages/heroes/heroes' })
  }
})
