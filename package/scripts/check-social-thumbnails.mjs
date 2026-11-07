import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const ts = require('typescript')
let upstream = async () => { throw new Error('Unexpected network request') }
let published = []
const modules = new Map()
function load(relative) {
  if (modules.has(relative)) return modules.get(relative)
  const source = readFileSync(new URL(`../src/app/${relative}.ts`, import.meta.url), 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, {
    module, exports: module.exports, URL, TextDecoder, Uint8Array, Request, Response, AbortSignal,
    fetch: (...args) => upstream(...args),
    require(name) {
      if (name.endsWith('cms-content')) return { getCmsCollection: async () => published }
      if (name.endsWith('social-post-url')) return load('social-post-url')
      if (name.endsWith('social-thumbnail')) return load('social-thumbnail')
      throw new Error(`Unexpected import: ${name}`)
    },
  })
  modules.set(relative, module.exports)
  return module.exports
}

const { thumbnailFromHtml, allowedImageUrl, readLimited, findThumbnail } = load('social-thumbnail')
const { GET } = load('api/social-image/route')
const photo = 'https://scontent.cdninstagram.com/photo.jpg?one=1&two=2'
assert.equal(thumbnailFromHtml(`<img class="Avatar" src="wrong"><img alt="post" src="${photo.replace('&', '&amp;')}" class="EmbeddedMediaImage">`, 'instagram'), photo)
assert.equal(thumbnailFromHtml(`<meta content='https://p16.tiktokcdn.com/photo.jpg' property='og:image'>`, 'tiktok'), 'https://p16.tiktokcdn.com/photo.jpg')
assert.equal(thumbnailFromHtml('<html>Login required</html>', 'instagram'), '')
for (const url of ['http://scontent.cdninstagram.com/a.jpg', 'https://cdninstagram.com.evil.example/a', 'https://user:pass@scontent.cdninstagram.com/a', 'https://127.0.0.1/a', 'https://scontent.cdninstagram.com:8443/a']) assert.equal(allowedImageUrl(url, 'instagram'), false)
assert.equal(allowedImageUrl(photo, 'instagram'), true)
assert.equal(allowedImageUrl('https://p16.tiktokcdn.com/a.jpg', 'tiktok'), true)
await assert.rejects(() => readLimited(new Response('12345'), 4), /too large/)

let calls = []
upstream = async (url, options) => {
  calls.push(String(url))
  assert.equal(options.redirect, 'error')
  return new Response(`<img class="EmbeddedMediaImage" src="${photo.replace('&', '&amp;')}">`)
}
assert.equal(await findThumbnail('https://www.instagram.com/p/TEST/?tracking=123', 'instagram', AbortSignal.timeout(1000)), photo)
assert.equal(calls[0], 'https://www.instagram.com/p/TEST/embed/')
calls = []
assert.equal(await findThumbnail('https://127.0.0.1/p/TEST/', 'instagram', AbortSignal.timeout(1000)), '')
assert.equal(calls.length, 0)

upstream = async url => String(url).includes('/oembed') ? Response.json({}) : new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1/private' } })
assert.equal(await findThumbnail('https://vm.tiktok.com/TEST/', 'tiktok', AbortSignal.timeout(1000)), '')
const request = (query = 'platform=instagram&slug=test') => new Request(`https://school.example/api/social-image?${query}`)
assert.equal((await GET(request('platform=other&slug=test'))).status, 400)
assert.equal((await GET(request())).status, 404)
published = [{ slug: 'test', postUrl: 'https://www.instagram.com/p/TEST/' }]
upstream = async url => String(url).includes('/embed/') ? new Response(`<img class="EmbeddedMediaImage" src="${photo}">`) : new Response(new Uint8Array([255, 216, 255]), { headers: { 'Content-Type': 'image/jpeg' } })
const success = await GET(request())
assert.equal(success.status, 200)
assert.equal(success.headers.get('content-type'), 'image/jpeg')
assert.equal((await success.arrayBuffer()).byteLength, 3)
upstream = async () => new Response('<img class="EmbeddedMediaImage" src="https://127.0.0.1/private">')
assert.equal((await GET(request())).status, 404)
upstream = async url => String(url).includes('/embed/') ? new Response(`<img class="EmbeddedMediaImage" src="${photo}">`) : new Response('<script>bad</script>', { headers: { 'Content-Type': 'text/html' } })
assert.equal((await GET(request())).status, 404)
console.log('PASS: platform image extraction, entity decoding, URL/redirect restrictions, response limits, published-only proxy, image response and unavailable-content fallback.')
