'use strict'

const test = require('ava')
const utils = require('../lib/utils')

test('extraxting hashtags from text', t => {
  let tags = utils.extractTrags('a #picture with tags #AwesoMe #ava and #100 ##yes ')
  t.deepEqual(tags, [
    'picture',
    'awesome',
    'ava',
    '100',
    'yes'
  ])

  tags = utils.extractTrags('a picture with no tags')
  t.deepEqual(tags, [])

  tags = utils.extractTrags(null)
  t.deepEqual(tags, [])
})

test('encrypt password', t => {
  let password = 'foo123'
  let encrypted = '02b353bf5358995bc7d193ed1ce9c2eaec2b694b21d2f96232c9d6a0832121d1'
  let result = utils.encrypt(password)
  t.is(result, encrypted)
})
