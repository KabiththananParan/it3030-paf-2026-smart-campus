const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

const stripTrailingSlash = (value) => value.replace(/\/$/, '')

const isLocalAddress = (value) => {
  if (!value) {
    return true
  }

  try {
    const parsed = new URL(value)
    return LOCAL_HOSTS.has(parsed.hostname)
  } catch {
    return true
  }
}

export const resolvePublicAppBase = () => {
  const configuredBase = (import.meta.env.VITE_PUBLIC_APP_URL || '').trim()

  // Ignore localhost config so QR links can follow the active host on LAN.
  if (configuredBase && !isLocalAddress(configuredBase)) {
    return stripTrailingSlash(configuredBase)
  }

  return stripTrailingSlash(window.location.origin)
}

export const isCrossDeviceUnsafeBase = () => {
  return isLocalAddress(resolvePublicAppBase())
}