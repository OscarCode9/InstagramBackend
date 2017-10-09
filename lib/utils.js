'use strict'
const crypto = require('crypto')

const utils = {
  extractTrags,
  encrypt
}

function extractTrags (text) {
  if (text === null) return []
  let matches = text.match(/#(\w+)/g)
  if (matches === null) return []
  matches = matches.map(normalize)
  return matches
}

function normalize (text) {
  text = text.toLowerCase()
  text = text.replace(/#/g, '')
  return text
}

function encrypt (pass) {
  let shasum = crypto.createHash('sha256')
  shasum.update(pass)
  return shasum.digest('hex')
}
module.exports = utils
