const superagent = require('superagent')
const langs = require('langs')

const addic7edURL = 'http://www.addic7ed.com'
const episodeRegExp = /S([0-9]+)E([0-9]+)|([0-9])([0-9]{2})|([0-9]+)x([0-9]+)/i
const versionRegExp = /Version (.+?),([^]+?)<\/table/g
const subInfoRegExp = /class="language">([^]+?)<a[^]+?(% )?Completed[^]+?href="([^"]+?)"><strong>(?:most updated|Download)/g
const hearingImpairedRegExp = /title="Hearing Impaired"/g
const teamVersionRegExp = /.?(REPACK|PROPER|[XH]?264|XVID|DIVX|HDTV|480P|720P|1080P|2160P|WEB(.DL|.?RIP)?|WR|WS|DVDRIP|BRRIP|BDRIP|BLURAY)+/ig
const distributionRegExp = /HDTV|WEB(.DL|.?RIP)?|WR|BRRIP|BDRIP|BLURAY|HI/i
const compatibility = [
  ['LOL', 'SYS', 'DIMENSION'],
  ['XII', 'ASAP', 'IMMERSE'],
  ['SVA', 'AVS', 'AVS-SVA'],
  ['WEB-DL', 'AMZN-WEBRip']
  // TODO: pairing for AFG,FUM reencodes
]

function parseName (str) {
  const matches = str.match(episodeRegExp)
  if (!matches) {
    throw new Error('unkown format: ' + str)
  }
  let season, episode
  if (matches[1] && matches[2]) { // S01E01
    season = matches[1]
    episode = matches[2]
  }
  if (matches[3] && matches[4]) { // 101
    season = matches[3]
    episode = matches[4]
  }
  if (matches[5] && matches[6]) { // 1x01
    season = matches[5]
    episode = matches[6]
  }
  episode = episode.padStart(2, '0')
  season = season.padStart(2, '0')

  let release
  const stdParts = str.split('-')
  if (stdParts.length === 2) {
    release = stdParts[1]
  } else {
    const cleanName = str.replace(teamVersionRegExp, '').replace(distributionRegExp, '')
    const longNameParts = str.split(/[.\-_]/).filter((i) => {
      return i.length > 6
    })
    const removedBias = longNameParts.length ? cleanName.replace(new RegExp(longNameParts.join('|')), '') : cleanName
    const nameParts = removedBias.replace(/\W/g, '').split(matches[0]) // /[^0-9a-z]/gi for _
    release = nameParts[1]
  }
  return {season, episode, release}
}

function search (str, languages, filter) {
  const ep = parseName(str)
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
            return findSubtitles(str, ep, response, languages, filter)
          })
          .catch(searchError)
      }
      return findSubtitles(str, ep, response.text, languages, filter)
    }).catch(searchError)
}

function findSubtitles (fileName, parsedFileName, body, languages, filter) {
  let subs = []
  let refererMatch = body.match(/\/show\/\d+/)
  let referer = refererMatch ? refererMatch[0] : '/show/1'
  let versionMatch
  let version
  let subInfoMatch
  let lang
  let langId
  let notCompleted
  let link
  let distributionMatch
  let distribution
  let team
  let hearingImpaired

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
      langId = (langId && langId['2B']) || lang.substr(0, 3).toLowerCase()
      link = subInfoMatch[3]

      if (languages && !~languages.indexOf(langId)) {
        continue
      }

      distributionMatch = version.match(distributionRegExp)

      distribution = distributionMatch
        ? distributionMatch[0].toUpperCase()
          .replace(/WEB(.DL|.?RIP)?|WR/, 'WEB-DL')
          .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
        : 'UNKNOWN'

      team = version.replace(teamVersionRegExp, '').trim().toUpperCase() || 'UNKNOWN'

      hearingImpaired = versionMatch[2].match(hearingImpairedRegExp) || false

      const sub = {
        lang,
        langId,
        distribution,
        team,
        version,
        link,
        referer,
        hearingImpaired
      }
      console.log(sub)

      if (filter) {
        if (!filter.hearingImpaired && hearingImpaired) {
          continue
        }
      }

      if (fileName.replace(/-/g, '.').indexOf(version) >= 0 || fileName.indexOf(version) >= 0) {
        subs.push(sub)
        continue
      }

      for (let c of compatibility) {
        console.log(parsedFileName.release, c, version, c.indexOf(parsedFileName.release))
        if (c.indexOf(parsedFileName.release) >= 0) {
          console.log('match', fileName.match(new RegExp(c.join('|')), 'i'))
          const compatible = fileName.match(new RegExp(c.join('|')), 'i')
          if (compatible) {
            subs.push(sub)
            break
          }
        }
      }
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
