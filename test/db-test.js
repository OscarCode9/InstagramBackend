'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const Db = require('../')
const r = require('rethinkdb')
const fixtures = require('./fixtures')
const utils = require('../lib/utils')

test.beforeEach('setup database', async t => {
  const dbName = `platzigram_${uuid.v4()}`
  const db = new Db({ db: dbName })
  await db.connect()
  t.true(db.connected, 'should be connectede')
  t.context.db = db
  t.context.dbName = dbName
  t.true(db.connected, 'should be connected')
})

test.afterEach.always('cleanup database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName
  await db.disconnect()
  t.false(db.connected, 'shpul be disconnected')
  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})
test('save image', async t => {
  let db = t.context.db
  t.is(typeof db.saveImage, 'function', 'saveImage is function')
  let image = fixtures.getImage()
  let create = await db.saveImage(image)
  t.is(create.description, image.description)
  t.is(create.url, image.url)
  t.is(create.likes, image.likes)
  t.is(create.liked, image.liked)
  t.deepEqual(create.tags, [ 'awesome', 'tags', 'platzi' ])
  t.is(create.public_id, uuid.encode(create.id))
  t.is(create.user_id, image.user_id)
  t.is(typeof create.id, 'string')
  t.truthy(create.createAt)
})
test('like image', async t => {
  let db = t.context.db
  t.is(typeof db.likeImage, 'function', 'likeImage is a funciton')
  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.likeImage(created.public_id)
  t.true(result.liked)
  t.is(result.likes, image.likes + 1)
})
test('get image', async t => {
  let db = t.context.db
  t.is(typeof db.getimage, 'function', 'getImage is a function')
  let image = fixtures.getImage()
  let create = await db.saveImage(image)
  let result = await db.getimage(create.public_id)
  t.deepEqual(create, result)
  await t.throws(db.getUser('foo'), /not found/)
})
test('list all images', async t => {
  let db = t.context.db

  let images = fixtures.getImages(3)
  let saveImages = images.map(img => db.saveImage(img))
  let created = await Promise.all(saveImages)
  let result = await db.getImages()
  t.is(created.length, result.length)
})
test('save user', async t => {
  let db = t.context.db
  t.is(typeof db.saveUser, 'function', 'saveUser is a function')
  let user = fixtures.getUser()
  let plainPassword = user.password
  let created = await db.saveUser(user)
  t.is(user.username, created.username)
  t.is(user.name, created.name)
  t.is(user.email, created.email)
  t.is(utils.encrypt(plainPassword), created.password)
  t.is(typeof created.id, 'string')
})

test('get user', async t => {
  let db = t.context.db
  t.is(typeof db.getUser, 'function', 'getUser is a function')
  let user = fixtures.getUser()
  let create = await db.saveUser(user)
  let result = await db.getUser(user.username)
  t.deepEqual(create, result)
  await t.throws(db.getUser('foo'), /not found/)
})
test('authenticate user', async t => {
  let db = t.context.db

  t.is(typeof db.authenticate, 'function', 'authenticate is a function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  let create = await db.saveUser(user)

  let success = await db.authenticate(create.username, plainPassword)
  t.true(success)

  let fail = await db.authenticate(user.username, 'foo')
  t.false(fail)

  let failure = await db.authenticate('foo', 'bar')
  t.false(failure)
})
test('list images by user', async t => {
  let db = t.context.db
  t.is(typeof db.getImageByUser, 'function', 'getImage is a function')
})
