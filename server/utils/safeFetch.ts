import { lookup } from 'node:dns/promises'
import net from 'node:net'

/**
* Outbound fetch helpers for user-supplied URLs (link previews etc.).
* Blocks SSRF targets: non-http(s) schemes, localhost, and private / loopback /
* link-local / reserved IP ranges — checked for every redirect hop.
*/

const isPrivateIPv4 = (ip: string): boolean => {
  const parts = ip.split('.').map(Number)
  const [a = 0, b = 0] = parts
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local / cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast + reserved
  )
}

const isPrivateIP = (ip: string): boolean => {
  if (net.isIPv4(ip)) {
    return isPrivateIPv4(ip)
  }
  const lower = ip.toLowerCase()
  // IPv4-mapped IPv6: dotted (::ffff:127.0.0.1) or hex as normalized by URL (::ffff:7f00:1)
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped?.[1]) {
    return isPrivateIPv4(mapped[1])
  }
  const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (mappedHex?.[1] && mappedHex[2]) {
    const high = parseInt(mappedHex[1], 16)
    const low = parseInt(mappedHex[2], 16)
    return isPrivateIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`)
  }
  return (
    lower === '::' || lower === '::1' ||
    lower.startsWith('fc') || lower.startsWith('fd') || // unique local
    lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb') || // link-local
    lower.startsWith('ff') // multicast
  )
}

/** Throws 400 unless `raw` is an http(s) URL whose host resolves only to public addresses. */
export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Only http and https URLs are allowed' })
  }
  if (url.username || url.password) {
    throw createError({ statusCode: 400, statusMessage: 'Credentials in URL are not allowed' })
  }

  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw createError({ statusCode: 400, statusMessage: 'URL host is not allowed' })
  }

  const addresses = net.isIP(host)
    ? [host]
    : await lookup(host, { all: true }).then(
      (list) => list.map((item) => item.address),
      () => {
        throw createError({ statusCode: 400, statusMessage: 'URL host cannot be resolved' })
      }
    )

  if (!addresses.length || addresses.some(isPrivateIP)) {
    throw createError({ statusCode: 400, statusMessage: 'URL host is not allowed' })
  }
  return url
}

/**
* GET a public HTML page as text with SSRF checks on every redirect hop,
* a timeout, and a response size cap.
*/
export async function fetchPublicHtml(
  raw: string,
  { timeoutMs = 5000, maxBytes = 1_000_000, maxRedirects = 3 } = {}
): Promise<string> {
  let current = raw
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const url = await assertPublicHttpUrl(current)
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'text/html,application/xhtml+xml' }
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) {
        break
      }
      current = new URL(location, url).toString()
      continue
    }

    if (!response.ok) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to fetch URL' })
    }
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw createError({ statusCode: 415, statusMessage: 'URL is not an HTML page' })
    }

    // Read at most maxBytes, then stop.
    const reader = response.body?.getReader()
    if (!reader) {
      return ''
    }
    const decoder = new TextDecoder()
    let html = ''
    let received = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      html += decoder.decode(value, { stream: true })
      if (received >= maxBytes) {
        await reader.cancel()
        break
      }
    }
    return html
  }
  throw createError({ statusCode: 400, statusMessage: 'Too many redirects' })
}
