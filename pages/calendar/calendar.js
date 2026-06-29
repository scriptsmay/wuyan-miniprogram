const app = getApp()

Page({
  data: {
    loading: true,
    empty: false,
    currentMonth: '',
    summary: { days: 0, sessions: 0, hours: 0, avgHours: 0 },
    streams: []
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const db = app.globalData.db
      if (!db) return

      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const monthLabel = `${year}年${month}月`
      this.setData({ currentMonth: monthLabel })

      // Get monthly summary
      const monthKey = `${year}-${String(month).padStart(2, '0')}`
      const summaryRes = await db.collection('live_streams')
        .where({ type: 'monthly_summary', month_key: monthKey })
        .get()

      if (summaryRes.data && summaryRes.data.length > 0) {
        const s = summaryRes.data[0]
        this.setData({
          summary: {
            days: s.total_days,
            sessions: s.total_sessions,
            hours: s.total_hours,
            avgHours: s.avg_hours_per_session
          }
        })
      }

      // Get stream records for current month (type != 'monthly_summary')
      const allRes = await db.collection('live_streams')
        .where({ year: year, month: month })
        .orderBy('stream_date', 'desc')
        .get()

      if (allRes.data && allRes.data.length > 0) {
        const streams = allRes.data
          .filter(s => s.type !== 'monthly_summary')
          .map(s => ({
            ...s,
            dateDisplay: s.stream_date ? s.stream_date.slice(5) : s.stream_date,
            durationDisplay: this.formatDuration(s.duration || 0)
          }))
        this.setData({ streams })
      }

      if (!summaryRes.data || summaryRes.data.length === 0) {
        if (!this.data.streams.length) {
          this.setData({ empty: true })
        }
      }
    } catch (err) {
      console.error('加载直播数据失败:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}时${m}分`
    return `${m}分钟`
  }
})
