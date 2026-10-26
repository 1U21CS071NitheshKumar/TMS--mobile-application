// Polyfill for Node 20 environments running Expo SDK 58 (which requires URL.parse from Node 22+)
if (!URL.parse) {
  URL.parse = function (url, base) {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}

// Suppress Expo CLI warning for Node 20 by reporting Node 22
if (process.version && process.version.startsWith('v20.')) {
  Object.defineProperty(process, 'version', {
    value: 'v22.13.0',
    writable: true,
    configurable: true,
  });
}

