// 云函数 HTTP 接口基础 URL
// 格式：https://环境ID-APPID.地域.app.tcloudbase.com
const FUNC_BASE = 'https://trial-sh-d1gqznm4577d6a062-1251520283.ap-shanghai.app.tcloudbase.com'

App({
  globalData: {
    funcBase: FUNC_BASE
  }
})
