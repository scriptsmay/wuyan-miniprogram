const app = getApp()

Page({
  data: {
    loading: true,
    empty: false,
    year: 0,
    month: 0,
    currentMonth: '',
    isCurrentMonth: false,
    summary: { days: 0, sessions: 0, hours: 0, avgHours: 0 },
    streams: []
  },

  onShow() {
    const now = new Date()
    this.loadData(now.getFullYear(), now.getMonth() + 1)
  },

  onPullDownRefresh() {
    this.loadData(this.data.year, this.data.month)
      .then(() => wx.stopPullDownRefresh())
  },

  loadData(year, month) {
    const now = new Date()
    const isCurrent = year === now.getFullYear() && month === (now.getMonth() + 1)

    this.setData({
      loading: true,
      year,
      month,
      isCurrentMonth: isCurrent,
      currentMonth: `${year}年${month}月`
    })

    const base = app.globalData.funcBase
    const token = 'wuyan-mini-2026'

    return new Promise((resolve) => {
      wx.request({
        url: `${base}/api/live?token=${token}&year=${year}&month=${month}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const d = res.data.data
            const summary = d.summary
            const streams = (d.streams || []).map(s => ({
              ...s,
              dateDisplay: s.stream_date ? s.stream_date.slice(5) : s.stream_date,
              startTime: s.start_time || '',
              durationDisplay: this.formatDuration(s.duration || 0)
            }))

            this.setData({
              summary: summary ? {
                days: summary.total_days || 0,
                sessions: summary.total_sessions || 0,
                hours: summary.total_hours || 0,
                avgHours: summary.avg_hours_per_session || 0
              } : { days: 0, sessions: 0, hours: 0, avgHours: 0 },
              streams,
              empty: !summary && streams.length === 0
            })
          } else {
            console.error('加载直播数据失败', res.data)
            this.setData({
              empty: true,
              summary: { days: 0, sessions: 0, hours: 0, avgHours: 0 },
              streams: []
            })
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
        },
        complete: () => {
          this.setData({ loading: false })
          resolve()
        }
      })
    })
  },

  prevMonth() {
    let { year, month } = this.data
    if (month === 1) { year--; month = 12 }
    else { month-- }
    this.loadData(year, month)
  },

  nextMonth() {
    let { year, month } = this.data
    if (month === 12) { year++; month = 1 }
    else { month++ }
    this.loadData(year, month)
  },

  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}时${m}分`
    return `${m}分钟`
  }
})
