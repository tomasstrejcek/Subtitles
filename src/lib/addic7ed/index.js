const superagent = require('superagent')
const langs = require('langs')

const addic7edURL = 'http://www.addic7ed.com'

function parseName (str) {
  const regexp = new RegExp(/S([0-9]+)E([0-9]+)/i)
  const matches = str.match(regexp)
  return {season: matches[1], episode: matches[2]}
}

function search (str, languages, filter) {
  return superagent.get(addic7edURL + '/search.php').query({search: str})
    .set('User-Agent', 'Mozilla/5.0 (X11 Linux x86_64 rv:42.0) Gecko/20100101 Firefox/42.0')
    .then((response) => {
      if (/<b>\d+ results found<\/b>/.test(response)) {
        if (~response.indexOf('<b>0 results found</b>')) {
          // No result
          // =========
          console.log('[Search] Addic7ed.com error: No result.')
          return []
        }

        const ep = parseName(str)

        // Multiple results
        // ================

        // Find result with proper season and episode in url
        // -------------------------------------------------
        const regexp = new RegExp('href="(serie/[^/]+/' + parseInt(ep.season) + '/' + parseInt(ep.episode) + '/.+?)"')
        const urlMatch = response.match(regexp)
        const url = urlMatch && urlMatch[1]

        if (!url) {
          console.log('[Search] Addic7ed.com error: subtitles not found in a multiple result set.')
          return []
        }

        return superagent.get(addic7edURL + '/' + url)
          .then((response) => {
            return findSubtitles(str, response, languages, filter)
          })
          .catch(searchError)
      }
      return findSubtitles(str, response.text, languages, filter)
    }).catch(searchError)
}

function findSubtitles (fileName, body, languages, filter) {
  let subs = [],
    refererMatch = body.match(/\/show\/\d+/),
    referer = refererMatch ? refererMatch[0] : '/show/1',
    versionRegExp = /Version (.+?),([^]+?)<\/table/g,
    versionMatch,
    version,
    subInfoRegExp = /class="language">([^]+?)<a[^]+?(% )?Completed[^]+?href="([^"]+?)"><strong>(?:most updated|Download)/g,
    subInfoMatch,
    lang,
    langId,
    notCompleted,
    link,
    distributionMatch,
    distribution,
    team,
    hearingImpairedRegExp = /title="Hearing Impaired"/g,
    hearingImpaired

  // Find subtitles HTML block parts
  // ===============================
  while ((versionMatch = versionRegExp.exec(body)) !== null) {
    version = versionMatch[1].toUpperCase()

    while ((subInfoMatch = subInfoRegExp.exec(versionMatch[2])) !== null) {
      notCompleted = subInfoMatch[2]
      if (notCompleted) {
        continue
      }

      lang = subInfoMatch[1]
      // Find lang iso code 2B
      // ---------------------
      langId = langs.where('name', lang.replace(/\(.+\)/g, '').trim())
      langId = langId && langId['2B'] || lang.substr(0, 3).toLowerCase()
      link = subInfoMatch[3]

      if (languages && !~languages.indexOf(langId)) {
        continue
      }

      distributionMatch = version.match(/HDTV|WEB(.DL|.?RIP)?|WR|BRRIP|BDRIP|BLURAY/i)

      distribution = distributionMatch
        ? distributionMatch[0].toUpperCase()
          .replace(/WEB(.DL|.?RIP)?|WR/, 'WEB-DL')
          .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
        : 'UNKNOWN'

      team = version.replace(/.?(REPACK|PROPER|[XH].?264|HDTV|480P|720P|1080P|2160P|WEB(.DL|.?RIP)?|WR|BRRIP|BDRIP|BLURAY)+.?/g, '')
        .trim().toUpperCase() || 'UNKNOWN'

      hearingImpaired = versionMatch[2].match(hearingImpairedRegExp) || false
      if (filter) {
        if (!filter.hearingImpaired && hearingImpaired) {
          continue
        }
      }

      if (fileName.replace(/-/g, '.').indexOf(version) < 0) {
        continue
      }

      subs.push({
        lang,
        langId,
        distribution,
        team,
        version,
        link,
        referer,
        hearingImpaired
      })
    }
  }

  return subs
}

function searchError (err) {
  return console.log('[Search] Addic7ed.com error', err.statusCode, err.options && err.options.qs.search)
}

function download (sub, targetStream) {
  return new Promise((resolve, reject) => {
    superagent
      .get(addic7edURL + sub.link)
      .set('Referer', addic7edURL + (sub.referer || '/show/1'))
      .pipe(targetStream)
      .on('finish', () => {
        resolve('done')
      })
  })
}

module.exports = {search, parseName, download}
