const { Server } = require('node:http')


const PATCH_SYMBOL = Symbol.for('vc.service.route-prefix-strip.patch')

function normalizeServiceRoutePrefix(rawPrefix) {
  if (!rawPrefix) {
    return ''
  }

  let prefix = String(rawPrefix).trim()
  if (!prefix) {
    return ''
  }

  if (!prefix.startsWith('/')) {
    prefix = '/' + prefix
  }

  if (prefix !== '/') {
    prefix = prefix.replace(/\/+$/, '')
  }

  return prefix === '/' ? '' : prefix
}

function getServiceRoutePrefix() {
  const enabled = String(
    process.env.VERCEL_SERVICE_ROUTE_PREFIX_STRIP || ''
  ).toLowerCase()
  if (enabled !== '1' && enabled !== 'true') {
    return ''
  }

  return normalizeServiceRoutePrefix(process.env.VERCEL_SERVICE_ROUTE_PREFIX || '')
}

function stripServiceRoutePrefix(requestUrl, prefix) {
  if (typeof requestUrl !== 'string' || requestUrl === '*') {
    return requestUrl
  }

  const queryIndex = requestUrl.indexOf('?')
  const rawPath =
    queryIndex === -1 ? requestUrl : requestUrl.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : requestUrl.slice(queryIndex)

  let path = rawPath || '/'
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  if (!prefix) {
    return path + query
  }

  if (path === prefix) {
    return '/' + query
  }

  if (path.startsWith(prefix + '/')) {
    return path.slice(prefix.length) + query
  }

  return path + query
}

function patchServerRequestUrl(ServerCtor) {
  const prefix = getServiceRoutePrefix()
  if (!prefix || globalThis[PATCH_SYMBOL]) {
    return
  }

  globalThis[PATCH_SYMBOL] = true

  const originalEmit = ServerCtor.prototype.emit
  ServerCtor.prototype.emit = function patchedEmit(event, request, ...args) {
    if (event === 'request' && request && typeof request.url === 'string') {
      request.url = stripServiceRoutePrefix(request.url, prefix)
    }

    return originalEmit.call(this, event, request, ...args)
  }
}


patchServerRequestUrl(Server)

module.exports = require("./server.cjs")
