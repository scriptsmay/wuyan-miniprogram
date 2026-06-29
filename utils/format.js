// 工具函数：格式化时长（秒 → 时:分）
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}时${m}分`
}

// 工具函数：格式化直播时长（秒 → x.x时）
function formatHours(seconds) {
  return (seconds / 3600).toFixed(1) + '时'
}

module.exports = { formatDuration, formatHours }
