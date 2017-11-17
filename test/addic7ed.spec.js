/* eslint-env node, mocha */
const assert = require('assert')
const fs = require('fs')

const addic7ed = require('../src/lib/addic7ed')

const epName = 'Mr.Robot.S01E01.HDTV.x264.PROPER-LOL-HI'
const epName2 = 'Mr.Robot.S01E03.HDTV.x264.PROPER-LOL-HI'
const epName3 = 'scorpion.310.hdtv-lol'
const epName4 = 'Alias.S03E19.Hourglass.WS.DVDRip.XviD-FoV'
const epName5 = 'cold.case.1x11.hubris.hdtv.xvid-fov'
const epName6 = 'Warehouse.13.S02E09.720p.HDTV.x264-IMMERSE'

describe('addic7ed library', () => {
  describe.only('can parse file name', () => {
    it('can parse subtitle name into components', () => {
      const ep = addic7ed.parseName(epName2)
      assert.equal(ep.season, '01')
      assert.equal(ep.episode, '03')
      assert.equal(ep.release, 'LOL')
    })

    it('can parse subtitle name into components', () => {
      const ep = addic7ed.parseName(epName3)
      assert.equal(ep.season, '03')
      assert.equal(ep.episode, '10')
      assert.equal(ep.release, 'lol')
    })

    it('can parse subtitle name into components', () => {
      const ep = addic7ed.parseName(epName4)
      assert.equal(ep.season, '03')
      assert.equal(ep.episode, '19')
      assert.equal(ep.release, 'FoV')
    })

    it('can parse subtitle name into components', () => {
      const ep = addic7ed.parseName(epName5)
      assert.equal(ep.season, '01')
      assert.equal(ep.episode, '11')
      assert.equal(ep.release, 'fov')
    })

    it('can parse subtitle name into components', () => {
      const ep = addic7ed.parseName(epName6)
      assert.equal(ep.season, '02')
      assert.equal(ep.episode, '09')
      assert.equal(ep.release, 'IMMERSE')
    })
  })

  it('can search for subtitle', (done) => {
    addic7ed.search(epName, 'eng', {hearingImpaired: false}).then((results) => {
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
