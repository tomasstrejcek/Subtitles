import Analytics from 'electron-google-analytics'

let analytics
const develop = process.env.NODE_ENV === 'development'

function init () {
  if (develop) return
  analytics = new Analytics('')
}

function pageView (section) {
  // if (develop || !analytics) return
  // analytics.pageview('https://tucci.me/projects/easysubs', section)
}

function event (eventName, data) {
  if (develop || !analytics) return
  analytics.event(eventName, data)
}

export default {
  init,
  pageView,
  event
}
