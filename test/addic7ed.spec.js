/* eslint-env node, mocha */
const assert = require('assert')
const fs = require('fs')

const addic7ed = require('../src/lib/addic7ed')

const epName = 'Mr.Robot.S01E01.HDTV.x264.PROPER-LOL-HI'
const epName2 = 'Mr.Robot.S01E03.HDTV.x264.PROPER-LOL-HI'

describe('addic7ed library', () => {
  it('can parse subtitle name into components', () => {
    const ep = addic7ed.search.parseName(epName2)
    assert.equal(ep.season, '01')
    assert.equal(ep.episode, '03')
  })

  it('can search for subtitle', (done) => {
    addic7ed.search.search(epName, 'eng', {hearingImpaired: false}).then((results) => {
      assert.strictEqual(results[0].version, 'PROPER.LOL')
      assert.strictEqual(results[0].hearingImpaired, false)
      done()
    })
  })

  it('can download a subtitle', (done) => {
    const filePath = fs.createWriteStream('./temp.srt')
    const referer = '/show/5151'
    addic7ed.download('/updated/1/101092/0', referer, filePath).then(() => {
      const srt = fs.readFileSync('./temp.srt')
      if (srt.indexOf('Hello, friend.') > 0) {
        fs.unlink('./temp.srt')
        return done()
      }
      throw new Error('subtitle was not downloaded')
    })
  })
})
