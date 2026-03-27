/**
 * Browser utility — resolves the Chromium executable path for cloud environments.
 *
 * In Railway / nixpacks the system Chromium binary is installed via nixPkgs but
 * Playwright cannot discover it on its own (its internal browser registry only
 * covers browsers it downloaded itself).  We therefore:
 *   1. Honour PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if explicitly set (allows
 *      Railway / Vercel / any cloud to pin the exact path via an env-var).
 *   2. Try a set of known paths where nixpacks / common Linux distros place
 *      the Chromium binary.
 *   3. Search each directory in the system PATH for known Chromium binary names
 *      (no shell invocation — avoids any injection surface).
 *   4. Return `undefined` as last resort — this lets Playwright use its own
 *      downloaded browser (valid for local development with `npx playwright install`).
 *
 * NOTE: If PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 is set and no system Chromium is
 * found, Playwright will throw when `chromium.launch()` is called.  Make sure the
 * environment has Chromium installed (e.g. via nixpkgs) or set
 * PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to the correct binary path.
 */

import * as fs from 'fs';
import * as path from 'path';

const CANDIDATE_PATHS = [
  // nixpacks / Nix environment symlinks
  '/nix/var/nix/profiles/default/bin/chromium',
  '/run/current-system/sw/bin/chromium',
  // Common Linux distro paths
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/snap/bin/chromium',
];

const PATH_BINARY_NAMES = [
  'chromium',
  'chromium-browser',
  'google-chrome',
  'google-chrome-stable',
];

let _cachedPath: string | undefined = undefined;
let _resolved = false;

/**
 * Searches the system PATH for a Chromium binary without invoking a shell.
 * Returns the full path if found, otherwise undefined.
 */
function findInSystemPath(): string | undefined {
  const systemPath = process.env.PATH || '';
  const dirs = systemPath.split(path.delimiter).filter(Boolean);

  for (const dir of dirs) {
    for (const name of PATH_BINARY_NAMES) {
      const candidate = path.join(dir, name);
      try {
        const stat = fs.statSync(candidate);
        if (stat.isFile()) {
          return candidate;
        }
      } catch {
        // file does not exist or is not accessible — try next
      }
    }
  }
  return undefined;
}

/**
 * Returns the path to the Chromium executable suitable for use as
 * `executablePath` in `chromium.launch()`.
 *
 * Returns `undefined` when no system Chromium is found — in that case
 * Playwright will fall back to its own downloaded browser if available.
 */
export function getChromiumExecutablePath(): string | undefined {
  if (_resolved) return _cachedPath;
  _resolved = true;

  // 1. Explicit env-var override (highest priority)
  const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) {
    console.log(`🌐 Chromium from env: ${envPath}`);
    _cachedPath = envPath;
    return _cachedPath;
  }

  // 2. Well-known paths
  for (const candidate of CANDIDATE_PATHS) {
    if (fs.existsSync(candidate)) {
      console.log(`🌐 Chromium found at: ${candidate}`);
      _cachedPath = candidate;
      return _cachedPath;
    }
  }

  // 3. PATH lookup (no shell invocation)
  const found = findInSystemPath();
  if (found) {
    console.log(`🌐 Chromium found in PATH: ${found}`);
    _cachedPath = found;
    return _cachedPath;
  }

  // 4. Not found
  const skipDownload = process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === '1';
  if (skipDownload) {
    console.error(
      '❌ System Chromium not found and PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 is set. ' +
      'Playwright browser launch WILL FAIL. ' +
      'Install Chromium (e.g. via nixpkgs) or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.'
    );
  } else {
    console.warn(
      '⚠️  System Chromium not found. Playwright will try its own downloaded browser. ' +
      'Run `npx playwright install chromium` if you see launch errors.'
    );
  }
  return undefined;
}
