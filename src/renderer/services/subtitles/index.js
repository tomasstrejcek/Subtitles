import Settings from '@/services/settings'

import addic7ed from '@/../lib/addic7ed'

const fs = require('fs')

function get (id, filename, fpath, filesize) {
  console.log(arguments)
  return find(id, nameWithoutExt(filename), fpath, filesize).then((subs) => {
    console.log(subs)
    if (!subs || subs.results.length <= 0) {
      throw new Error('download failed')
    }
    const subTargetName = getName(fpath)
    const sub = subs.results.shift()
    return download(subs.id, sub, subTargetName)
  })
}

function find (id, filename, fpath, filesize) {
  const settings = Settings.get()
  console.log(arguments)
  const filter = {
    hearingImpaired: settings.subHearingImpaired.value
  }
  return addic7ed.search(filename, settings.subLanguage.value.toLowerCase().slice(0, 3), filter).then(results => {
    return {id, results}
  })
}

function nameWithoutExt (fileName) {
  const n = fileName.lastIndexOf('.')
  return n > -1 ? fileName.substr(0, n) : fileName
}

function getName (fileName) {
  fileName = nameWithoutExt(fileName)
  const subExt = Settings.get().subExtension.value
  return `${fileName}.${subExt}`
}

function download (id, sub, name) {
  const targetStream = fs.createWriteStream(name)
  return addic7ed.download(sub, targetStream)
}

export default {
  get,
  download
}
