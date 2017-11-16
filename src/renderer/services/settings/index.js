let subLanguage = JSON.parse(window.localStorage.getItem('subLanguage')) || { value: 'eng' }
let subExtension = JSON.parse(window.localStorage.getItem('subExtension')) || { value: 'srt' }
let subHearingImpaired = JSON.parse(window.localStorage.getItem('subHearingImpaired')) || { value: false }

function get () {
  return {
    subLanguage,
    subExtension,
    subHearingImpaired
  }
}

function set (settings) {
  for (let property in settings) {
    if (settings.hasOwnProperty(property)) {
      window.localStorage.setItem(property, JSON.stringify(settings.property))
    }
  }
}

export default {
  get,
  set
}
