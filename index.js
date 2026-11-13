/**
 * Host half of 【南山】DSH插件市场发布助手.
 *
 * The market list at https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
 * holds one YAML file per plugin under `data/plugins/`. Getting a component
 * listed therefore means two independent jobs, and this module keeps them
 * independent on purpose:
 *
 *   1. GitHub — turn the local folder into a public repository that declares
 *      `dsh.bundle`, carries the `dsh-plugin` topic, and is pushed to GitHub.
 *   2. Listing PR — write `data/plugins/<owner>__<repo>.yml` on a branch of a
 *      fork and open the pull request upstream.
 *
 * Everything the official guide (contributing.md) enforces mechanically is
 * computed here as a checklist, so the panel can explain what is missing and
 * offer the exact next action. This module owns:
 *
 *   - discovery of local DSH components (profile links, added folders, roots)
 *   - inspection of package.json, patch, locale meta, icon, README, Git state
 *   - the GitHub REST calls needed for repo creation, topics, forks and PRs
 *   - entry generation and validation against the documented YAML shape
 *   - operation records, so the panel can show what happened and when
 *
 * The GitHub token is kept in the credentials service, never in state.json and
 * never in a response body.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, readFile, readdir, realpath, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'

export const inject = ['webServer']

const API = '/api/nanshan-market-publish'
const STATE_FILE = 'state.json'
const STATE_VERSION = 1
const MAX_BODY_BYTES = 256 * 1024
const MAX_SCAN_DIRS = 800
const MAX_TEXT = 400
const MAX_RECORDS = 120
const INSPECT_TTL_MS = 8000
const DISCOVERY_TTL_MS = 5000
const GH_CACHE_TTL_MS = 60000
const CRED_KEY = 'nanshan-market-publish/github-token'

const UPSTREAM = { owner: 'awesome-dsh-plugin', repo: 'awesome-dsh-plugin' }
const UPSTREAM_URL = `https://github.com/${UPSTREAM.owner}/${UPSTREAM.repo}`
const UPSTREAM_API = `/repos/${UPSTREAM.owner}/${UPSTREAM.repo}`
const DOC_URL = `${UPSTREAM_URL}/blob/main/contributing.md`
const CATALOG_DIR = 'data/plugins'
const TOPIC = 'dsh-plugin'

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.hg', '.svn', 'dist', 'build', 'out', 'coverage',
  '.next', '.nuxt', '.cache', '.turbo', '.pnpm-store', 'Library', 'Applications',
])

const ICON_MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

const NAME_RE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/
const VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const GITHUB_HOSTS = new Set(['raw.githubusercontent.com', 'github.com', 'user-images.githubusercontent.com', 'camo.githubusercontent.com'])
const RASTER_RE = /\.(png|jpe?g|webp)$/i
const MARKETING_RE = /(\bbest\b|\bgreatest\b|\bultimate\b|\bnumber[\s-]?one\b|#1\b|\bworld[\s-]class\b|\brevolutionary\b|\bblazing\b|\bunmatched\b|最强|最好|第一|顶级|革命性|无敌|全网|唯一|遥遥领先|吊打)/i

/**
 * The category vocabulary published by contributing.md. The UI offers exactly
 * this list because an invented id fails review for no reason.
 */
const CATEGORIES = [
  { id: 'agi', zh: '通用智能', en: 'AGI' },
  { id: 'ui', zh: '界面增强', en: 'UI enhancements' },
  { id: 'usage', zh: '使用与上手', en: 'Usage & onboarding' },
  { id: 'theme', zh: '主题与外观', en: 'Themes & appearance' },
  { id: 'model', zh: '模型接入', en: 'Models' },
  { id: 'identity', zh: '身份与账号', en: 'Identity' },
  { id: 'session', zh: '会话', en: 'Sessions' },
  { id: 'memory', zh: '记忆', en: 'Memory' },
  { id: 'tools', zh: '工具与能力', en: 'Tools & capabilities' },
  { id: 'wsl', zh: 'WSL', en: 'WSL' },
  { id: 'browser', zh: '浏览器', en: 'Browser' },
  { id: 'vision', zh: '视觉与识图', en: 'Vision' },
  { id: 'voice', zh: '语音', en: 'Voice' },
  { id: 'docs', zh: '文档', en: 'Docs' },
  { id: 'skill', zh: '技能', en: 'Skills' },
  { id: 'workflow', zh: '工作流与自动化', en: 'Workflow & automation' },
  { id: 'git', zh: 'Git', en: 'Git' },
  { id: 'notify', zh: '通知', en: 'Notifications' },
  { id: 'dev', zh: '开发工具', en: 'Developer tools' },
  { id: 'security', zh: '安全', en: 'Security' },
  { id: 'remote', zh: '远程协作', en: 'Remote' },
  { id: 'market', zh: '插件市场', en: 'Market' },
  { id: 'fun', zh: '娱乐', en: 'Fun' },
]
const CATEGORY_IDS = new Set(CATEGORIES.map((item) => item.id))

const CATEGORY_HINTS = [
  [/market|publish|listing|storefront/i, 'market'],
  [/git|commit|repo|branch/i, 'git'],
  [/notify|notification|alert|reminder/i, 'notify'],
  [/memory|recall|knowledge/i, 'memory'],
  [/session|conversation|transcript/i, 'session'],
  [/theme|skin|appearance|palette/i, 'theme'],
  [/model|provider|llm/i, 'model'],
  [/voice|speech|tts|asr|microphone/i, 'voice'],
  [/vision|image|ocr|screenshot|pixel/i, 'vision'],
  [/browser|webview|dom/i, 'browser'],
  [/workflow|automation|pipeline|schedule/i, 'workflow'],
  [/skill|preset/i, 'skill'],
  [/doc|readme|markdown/i, 'docs'],
  [/identity|auth|account|login/i, 'identity'],
  [/security|audit|permission|guard/i, 'security'],
  [/remote|ssh|tunnel/i, 'remote'],
  [/game|arcade|fun/i, 'fun'],
  [/panel|sidebar|interface|widget|dock/i, 'ui'],
]

const DEFAULT_SETTINGS = {
  scanRoots: [],
  maxScanDepth: 2,
}

/* --------------------------------------------------------------------- apply */

export function apply(ctx) {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  const dataDir = join(home, 'nanshan-market-publish')
  const statePath = join(dataDir, STATE_FILE)

  let state = null
  let loading = null
  let discovery = null
  const inspectCache = new Map()
  const ghCache = new Map()
  const locks = new Map()

  /* ------------------------------------------------------------------ state */

  async function ensureState() {
    if (state) return state
    if (loading) return loading
    loading = (async () => {
      let parsed = null
      try {
        parsed = JSON.parse(await readFile(statePath, 'utf8'))
      } catch {
        parsed = null
      }
      state = normalizeState(parsed)
      return state
    })()
    try {
      return await loading
    } finally {
      loading = null
    }
  }

  function emptyState() {
    return {
      version: STATE_VERSION,
      settings: clone(DEFAULT_SETTINGS),
      targets: [],
      entries: {},
      records: [],
      auth: { login: '', avatarUrl: '', source: '', scopes: '', at: 0 },
    }
  }

  function normalizeState(input) {
    const base = emptyState()
    if (!isPlainObject(input)) return base
    const next = {
      version: STATE_VERSION,
      settings: mergeSettings(base.settings, input.settings),
      targets: [],
      entries: {},
      records: [],
      auth: {
        login: typeof input.auth?.login === 'string' ? input.auth.login : '',
        avatarUrl: typeof input.auth?.avatarUrl === 'string' ? input.auth.avatarUrl : '',
        source: typeof input.auth?.source === 'string' ? input.auth.source : '',
        scopes: typeof input.auth?.scopes === 'string' ? input.auth.scopes : '',
        at: Number.isFinite(input.auth?.at) ? Number(input.auth.at) : 0,
      },
    }
    if (Array.isArray(input.targets)) {
      for (const value of input.targets) {
        const dir = normalizeDir(value)
        if (dir && !next.targets.includes(dir)) next.targets.push(dir)
      }
      next.targets = next.targets.slice(0, 60)
    }
    if (isPlainObject(input.entries)) {
      for (const [dir, value] of Object.entries(input.entries)) {
        const key = normalizeDir(dir)
        if (!key || !isPlainObject(value)) continue
        next.entries[key] = sanitizeEntry(value)
      }
    }
    if (Array.isArray(input.records)) {
      for (const record of input.records) {
        if (!isPlainObject(record)) continue
        next.records.push({
          at: Number.isFinite(record.at) ? Number(record.at) : Date.now(),
          kind: typeof record.kind === 'string' ? record.kind.slice(0, 40) : 'event',
          status: record.status === 'fail' ? 'fail' : 'ok',
          dir: typeof record.dir === 'string' ? record.dir : '',
          name: typeof record.name === 'string' ? record.name.slice(0, 160) : '',
          title: cleanText(record.title, 200),
          detail: cleanText(record.detail, 300),
          url: typeof record.url === 'string' ? record.url.slice(0, 500) : '',
        })
      }
      next.records = next.records.slice(0, MAX_RECORDS)
    }
    return next
  }

  function mergeSettings(base, input) {
    const next = clone(base)
    if (!isPlainObject(input)) return next
    if (Array.isArray(input.scanRoots)) {
      next.scanRoots = []
      for (const value of input.scanRoots) {
        const dir = normalizeDir(value)
        if (dir && !next.scanRoots.includes(dir)) next.scanRoots.push(dir)
      }
      next.scanRoots = next.scanRoots.slice(0, 20)
    }
    next.maxScanDepth = clampInt(input.maxScanDepth, 1, 4, next.maxScanDepth)
    return next
  }

  function sanitizeEntry(input) {
    const entry = {
      category: CATEGORY_IDS.has(input.category) ? input.category : '',
      descriptionEn: cleanText(input.descriptionEn, MAX_TEXT),
      descriptionZh: cleanText(input.descriptionZh, MAX_TEXT),
      iconUrl: cleanText(input.iconUrl, 500),
      tarball: cleanText(input.tarball, 500),
      repoName: cleanText(input.repoName, 100),
      repoPrivate: input.repoPrivate === true,
      commitMessage: cleanText(input.commitMessage, 200),
      pushHttp1: input.pushHttp1 === true,
      prNumber: clampInt(input.prNumber, 0, 1000000, 0),
      prUrl: cleanText(input.prUrl, 500),
    }
    return entry
  }

  async function saveState() {
    await mkdir(dataDir, { recursive: true, mode: 0o700 })
    const temp = `${statePath}.${process.pid}.${Date.now()}.tmp`
    await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temp, statePath)
  }

  function pushRecord(record) {
    state.records.unshift({
      at: Date.now(),
      kind: record.kind || 'event',
      status: record.status === 'fail' ? 'fail' : 'ok',
      dir: record.dir || '',
      name: record.name || '',
      title: cleanText(record.title, 200),
      detail: cleanText(record.detail, 300),
      url: record.url || '',
    })
    state.records = state.records.slice(0, MAX_RECORDS)
  }

  /* -------------------------------------------------------------- credentials */

  function credentialsService() {
    return ctx.get('credentials')
  }

  async function readToken() {
    const service = credentialsService()
    if (service && typeof service.readRecord === 'function') {
      try {
        const record = await service.readRecord(CRED_KEY)
        if (record && record.kind === 'api-key' && typeof record.key === 'string' && record.key.trim() !== '') {
          return { token: record.key.trim(), source: 'dsh-credentials' }
        }
      } catch {
        // A store failure must not hide an environment fallback.
      }
    }
    for (const name of ['NSMP_GITHUB_TOKEN', 'GITHUB_TOKEN', 'GH_TOKEN']) {
      const value = process.env[name]
      if (typeof value === 'string' && value.trim() !== '') return { token: value.trim(), source: `env:${name}` }
    }
    return { token: '', source: '' }
  }

  async function writeToken(token) {
    const service = credentialsService()
    if (!service || typeof service.modifyRecord !== 'function') {
      throw httpError(501, '当前档案没有可用的凭据服务，无法保存 GitHub Token。', 'no-credentials')
    }
    await service.modifyRecord(CRED_KEY, async (current) => {
      if (current && current.kind === 'api-key' && current.key === token) return current
      return { kind: 'api-key', key: token }
    })
  }

  async function clearToken() {
    const service = credentialsService()
    if (service && typeof service.deleteRecord === 'function') {
      try {
        await service.deleteRecord(CRED_KEY)
      } catch {
        // Nothing stored is the desired end state either way.
      }
    }
  }

  async function requireToken() {
    const { token, source } = await readToken()
    if (token === '') {
      throw httpError(401, '还没有连接 GitHub：在「设置」里填入一个有 public_repo 权限的 Token。', 'token-missing')
    }
    return { token, source }
  }

  /* ------------------------------------------------------------- github api */

  async function gh(token, method, path, body, options = {}) {
    const url = /^https?:/i.test(path) ? path : `https://api.github.com${path}`
    const headers = {
      accept: 'application/vnd.github+json',
      'user-agent': 'nanshan-market-publish',
      'x-github-api-version': '2022-11-28',
    }
    if (token) headers.authorization = `Bearer ${token}`
    if (body !== undefined) headers['content-type'] = 'application/json'
    let response
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(options.timeout ?? 20000),
      })
    } catch (error) {
      const detail = error && error.name === 'TimeoutError' ? '请求超时' : messageOf(error)
      throw httpError(502, `无法访问 GitHub API：${detail}`, 'network')
    }
    const text = await response.text()
    let data = null
    if (text !== '') {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }
    const meta = {
      status: response.status,
      scopes: response.headers.get('x-oauth-scopes') || '',
      remaining: response.headers.get('x-ratelimit-remaining') || '',
      reset: response.headers.get('x-ratelimit-reset') || '',
    }
    if (!response.ok) {
      const message = data && typeof data.message === 'string' ? data.message : `HTTP ${response.status}`
      const status = response.status === 401 ? 401 : response.status === 404 ? 404 : response.status === 422 ? 422 : response.status === 403 ? 403 : 502
      const error = httpError(status, message, 'github')
      error.github = { status: response.status, message, hint: githubHint(response.status, message, path) }
      throw error
    }
    return { data, meta }
  }

  function githubHint(status, message, path) {
    if (status === 401) return 'Token 无效或已过期，请重新连接。'
    if (status === 403) {
      if (/rate limit/i.test(message)) return 'GitHub API 速率已用尽，请稍后重试。'
      if (/resource not accessible/i.test(message)) return 'Token 缺少该操作的权限。创建 PR 需要 classic Token 的 public_repo 权限。'
      return 'Token 权限不足，或该资源不允许此操作。'
    }
    if (status === 404) {
      if (/pulls/.test(path)) return '上游仓库或分支不存在；如果是刚 fork 的仓库，等几秒再试。'
      return '仓库不存在，或 Token 无权访问（私有仓库需要 repo 权限）。'
    }
    if (status === 422) return 'GitHub 拒绝了这次请求：名称冲突、分支已存在或 PR 已经开过。'
    return ''
  }

  async function ghCached(token, method, path, options = {}) {
    const key = `${method} ${path}`
    const cached = ghCache.get(key)
    if (cached && Date.now() - cached.at < GH_CACHE_TTL_MS) return cached.value
    const result = await gh(token, method, path, undefined, options)
    ghCache.set(key, { at: Date.now(), value: result })
    return result
  }

  function clearGhCache() {
    ghCache.clear()
  }

  async function fetchUser(token) {
    const { data, meta } = await gh(token, 'GET', '/user')
    return {
      login: typeof data.login === 'string' ? data.login : '',
      avatarUrl: typeof data.avatar_url === 'string' ? data.avatar_url : '',
      name: typeof data.name === 'string' ? data.name : '',
      scopes: meta.scopes,
    }
  }

  async function fetchRepo(token, owner, repo) {
    try {
      const { data } = await ghCached(token, 'GET', `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)
      return normalizeRepo(data)
    } catch (error) {
      if (error && error.status === 404) return null
      throw error
    }
  }

  function normalizeRepo(data) {
    if (!isPlainObject(data)) return null
    const createdAt = typeof data.created_at === 'string' ? Date.parse(data.created_at) : 0
    const ageMs = createdAt > 0 ? Date.now() - createdAt : 0
    return {
      exists: true,
      owner: data.owner && typeof data.owner.login === 'string' ? data.owner.login : '',
      repo: typeof data.name === 'string' ? data.name : '',
      fullName: typeof data.full_name === 'string' ? data.full_name : '',
      htmlUrl: typeof data.html_url === 'string' ? data.html_url : '',
      private: data.private === true,
      archived: data.archived === true,
      defaultBranch: typeof data.default_branch === 'string' ? data.default_branch : 'main',
      createdAt,
      ageMs,
      ageDays: ageMs / 86400000,
      topics: Array.isArray(data.topics) ? data.topics.filter((item) => typeof item === 'string') : [],
      stars: Number.isFinite(data.stargazers_count) ? data.stargazers_count : 0,
      description: typeof data.description === 'string' ? data.description : '',
    }
  }

  /* ------------------------------------------------------------ discovery */

  async function profileLinkDirs() {
    const dirs = []
    const addProfile = (dir) => {
      if (typeof dir !== 'string' || dir === '' || dirs.includes(dir)) return
      dirs.push(dir)
    }
    addProfile(process.env.DSH_PROFILE_DIR)
    try {
      const root = join(home, 'profiles')
      for (const entry of await readdir(root, { withFileTypes: true })) {
        if (entry.isDirectory()) addProfile(join(root, entry.name))
      }
    } catch {
      // A customized DSH_HOME may keep profiles elsewhere; the env value applies.
    }
    const links = []
    for (const profileDir of dirs.slice(0, 12)) {
      try {
        const pkg = JSON.parse(await readFile(join(profileDir, 'package.json'), 'utf8'))
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
        for (const spec of Object.values(deps)) {
          if (typeof spec !== 'string') continue
          const match = /^(?:link|file):(.+)$/.exec(spec)
          if (match) links.push(resolve(profileDir, match[1]))
        }
      } catch {
        // A profile without package.json simply has no link dependencies.
      }
    }
    return links
  }

  function hostRoots() {
    const roots = []
    const add = (value) => {
      if (typeof value === 'string' && isAbsolute(value) && !roots.includes(value)) roots.push(value)
    }
    const working = ctx.get('workingDirectory')
    if (working && typeof working.defaultDirectory === 'string') add(working.defaultDirectory)
    const registry = ctx.get('workspaceRegistry')
    if (registry && typeof registry.list === 'function') {
      try {
        for (const workspace of registry.list().slice(0, 6)) {
          if (workspace && typeof workspace.path === 'string') add(workspace.path)
        }
      } catch {
        // The registry may still be initializing; other sources still apply.
      }
    }
    return roots
  }

  async function discover(force = false) {
    if (force) {
      discovery = null
      inspectCache.clear()
    }
    if (discovery && Date.now() - discovery.at < DISCOVERY_TTL_MS) return discovery
    const current = await ensureState()
    const found = new Map()
    const warnings = []
    const visited = new Set()
    let scanned = 0

    async function addDir(rawDir, origin) {
      const target = expandHome(rawDir)
      if (!isAbsolute(target)) return
      let dir
      try {
        dir = await realpath(target)
      } catch {
        if (origin === 'target') warnings.push({ zh: `目录不存在：${target}`, en: `Directory not found: ${target}` })
        return
      }
      if (found.has(dir)) return
      const pkg = await readPackageQuiet(dir)
      if (!pkg) {
        if (origin === 'target') warnings.push({ zh: `目录里没有 package.json：${dir}`, en: `No package.json in: ${dir}` })
        return
      }
      if (!isDshPackage(pkg)) {
        if (origin === 'target') {
          warnings.push({
            zh: `不是 DSH 组件（缺少 dsh.bundle / dsh.client）：${dir}`,
            en: `Not a DSH component (no dsh.bundle / dsh.client): ${dir}`,
          })
        }
        return
      }
      found.set(dir, { dir, origin })
    }

    async function walk(rootRaw, depthLimit, silent) {
      const target = expandHome(rootRaw)
      if (!isAbsolute(target)) return
      let root
      try {
        root = await realpath(target)
      } catch {
        if (!silent) warnings.push({ zh: `扫描目录不存在：${target}`, en: `Scan root not found: ${target}` })
        return
      }
      const queue = [{ dir: root, depth: 0 }]
      while (queue.length > 0 && scanned < MAX_SCAN_DIRS) {
        const item = queue.shift()
        if (visited.has(item.dir)) continue
        visited.add(item.dir)
        scanned += 1
        const pkg = await readPackageQuiet(item.dir)
        if (pkg && isDshPackage(pkg)) {
          if (!found.has(item.dir)) found.set(item.dir, { dir: item.dir, origin: 'scan' })
          continue
        }
        if (item.depth >= depthLimit) continue
        let entries
        try {
          entries = await readdir(item.dir, { withFileTypes: true })
        } catch {
          continue
        }
        for (const entry of entries) {
          if (!entry.isDirectory() || entry.isSymbolicLink()) continue
          if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
          queue.push({ dir: join(item.dir, entry.name), depth: item.depth + 1 })
        }
      }
    }

    for (const dir of await profileLinkDirs()) await addDir(dir, 'link')
    for (const dir of current.targets) await addDir(dir, 'target')
    for (const root of current.settings.scanRoots) await walk(root, current.settings.maxScanDepth, false)
    for (const root of hostRoots()) await walk(root, Math.min(current.settings.maxScanDepth, 2), true)
    const cwd = process.cwd()
    if (scannableRoot(cwd) && !current.settings.scanRoots.includes(cwd)) {
      await walk(cwd, Math.min(current.settings.maxScanDepth, 2), true)
    }

    const dirs = [...found.values()].sort((left, right) => left.dir.localeCompare(right.dir))
    const components = []
    for (const item of dirs.slice(0, 40)) {
      const inspected = await inspectComponent(item.dir)
      if (!inspected) continue
      components.push({ ...summarize(item.dir, inspected, current), origin: item.origin })
    }
    discovery = { at: Date.now(), components, warnings: warnings.slice(0, 20), scanned }
    return discovery
  }

  /* ------------------------------------------------------------- inspection */

  async function readPackageQuiet(dir) {
    try {
      const parsed = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
      return isPlainObject(parsed) ? parsed : null
    } catch {
      return null
    }
  }

  function isDshPackage(pkg) {
    if (!isPlainObject(pkg) || !isPlainObject(pkg.dsh)) return false
    return isPlainObject(pkg.dsh.bundle) || isPlainObject(pkg.dsh.client)
  }

  async function inspectComponent(dir) {
    const cached = inspectCache.get(dir)
    if (cached && Date.now() - cached.at < INSPECT_TTL_MS) return cached.value
    const pkg = await readPackageQuiet(dir)
    if (!pkg) return null
    const dsh = isPlainObject(pkg.dsh) ? pkg.dsh : {}
    const bundle = isPlainObject(dsh.bundle) ? dsh.bundle : null
    const client = isPlainObject(dsh.client) ? dsh.client : null
    const exportsMap = isPlainObject(pkg.exports) ? pkg.exports : {}
    const name = typeof pkg.name === 'string' ? pkg.name : basename(dir)
    const patchRel = bundle && typeof bundle.patch === 'string' ? bundle.patch : typeof pkg.dsh?.bundle === 'string' ? pkg.dsh.bundle : null
    const patchPath = patchRel ? resolve(dir, patchRel) : null
    let patchText = null
    if (patchPath && isInside(dir, patchPath)) {
      try {
        patchText = await readFile(patchPath, 'utf8')
      } catch {
        patchText = null
      }
    }
    const icon = await readIcon(dir, pkg, exportsMap)
    const locale = await readLocaleMeta(dir)
    const git = await gitSnapshot(dir)
    const readme = await readmeFile(dir)
    const license = await licenseFile(dir, pkg)
    const screenshots = await readScreenshots(dir)
    const hasGitignore = await exists(join(dir, '.gitignore'))
    const hasNodeModules = await exists(join(dir, 'node_modules'))
    const filesList = Array.isArray(pkg.files) ? pkg.files.filter((value) => typeof value === 'string') : []
    const deps = isPlainObject(pkg.dependencies) ? Object.keys(pkg.dependencies) : []
    const peerDeps = isPlainObject(pkg.peerDependencies) ? Object.keys(pkg.peerDependencies) : []
    const code = await codeStats(dir, exportsMap, pkg)
    const info = {
      dir,
      name,
      version: typeof pkg.version === 'string' ? pkg.version : '',
      private: pkg.private === true,
      pkgDescription: typeof pkg.description === 'string' ? pkg.description : '',
      license: typeof pkg.license === 'string' ? pkg.license : '',
      repository: repositoryUrlOf(pkg.repository),
      homepage: typeof pkg.homepage === 'string' ? pkg.homepage : '',
      hasBundle: bundle !== null && typeof bundle.patch === 'string',
      hasClient: client !== null,
      patchRel,
      patchText,
      patchRow: patchText ? extractPatchName(patchText) : '',
      exportsMap,
      filesList,
      icon,
      locale,
      git,
      readme,
      licenseFile: license,
      screenshots,
      hasGitignore,
      hasNodeModules,
      deps,
      peerDeps,
      officialDeps: deps.filter((item) => item.startsWith('@deepseek-ai/')),
      code,
      mtime: await latestMtime([join(dir, 'package.json'), patchPath, join(dir, 'index.js'), join(dir, 'client.js')]),
    }
    inspectCache.set(dir, { at: Date.now(), value: info })
    return info
  }

  async function codeStats(dir, exportsMap, pkg) {
    const candidates = new Set(['index.js', 'client.js', 'index.mjs', 'index.cjs'])
    for (const value of Object.values(exportsMap)) {
      if (typeof value === 'string' && /\.(?:js|mjs|cjs)$/i.test(value)) candidates.add(value.replace(/^\.\//, ''))
    }
    if (typeof pkg.main === 'string' && /\.(?:js|mjs|cjs)$/i.test(pkg.main)) candidates.add(pkg.main.replace(/^\.\//, ''))
    let bytes = 0
    let lines = 0
    const files = new Set()
    async function count(rel) {
      if (rel.includes('..')) return
      const absolute = resolve(dir, rel)
      if (!isInside(dir, absolute)) return
      try {
        const info = await stat(absolute)
        if (!info.isFile() || info.size > 1024 * 1024) return
        const text = await readFile(absolute, 'utf8')
        bytes += info.size
        lines += text.split('\n').length
        files.add(rel)
      } catch {
        // Missing entry files are reported by the checks, not here.
      }
    }
    for (const rel of candidates) await count(rel)
    // A thin entry file usually re-exports real code from src/; count it too so
    // the "real code" check does not fail a well-structured plugin.
    if (lines < 120) {
      let budget = 120
      const queue = [{ rel: '', depth: 0 }]
      while (queue.length > 0 && budget > 0) {
        const item = queue.shift()
        if (item.depth > 4) continue
        const absolute = item.rel === '' ? dir : join(dir, item.rel)
        let entries
        try {
          entries = await readdir(absolute, { withFileTypes: true })
        } catch {
          continue
        }
        for (const entry of entries) {
          if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
          const rel = item.rel === '' ? entry.name : `${item.rel}/${entry.name}`
          if (entry.isDirectory()) {
            if (entry.name === 'test' || entry.name === 'tests' || entry.name === '__tests__') continue
            queue.push({ rel, depth: item.depth + 1 })
            continue
          }
          if (!/\.(?:js|mjs|cjs|ts|tsx|jsx)$/i.test(entry.name)) continue
          if (files.has(rel)) continue
          if (!rel.includes('/')) continue
          budget -= 1
          if (budget <= 0) break
          await count(rel)
        }
      }
    }
    return { files: files.size, bytes, lines }
  }

  async function readIcon(dir, pkg, exportsMap) {
    let rel = null
    if (typeof pkg.icon === 'string') rel = pkg.icon
    else if (typeof exportsMap['./icon'] === 'string') rel = exportsMap['./icon']
    if (!rel) {
      for (const candidate of ['icon.svg', 'icon.png', 'icon.webp', 'icon.jpg', 'icon.jpeg']) {
        if (await exists(join(dir, candidate))) {
          rel = candidate
          break
        }
      }
    }
    if (!rel) return null
    rel = rel.replace(/^\.\//, '')
    const absolute = resolve(dir, rel)
    if (!isInside(dir, absolute)) return null
    let info
    try {
      info = await stat(absolute)
    } catch {
      return null
    }
    if (!info.isFile()) return null
    const ext = extname(absolute).toLowerCase()
    const mime = ICON_MIME[ext]
    const result = { rel, path: absolute, ext, bytes: info.size, thumb: null, error: '' }
    if (!mime) {
      result.error = 'format'
      return result
    }
    if (info.size > 256 * 1024) {
      result.error = 'too-large'
      return result
    }
    if (info.size <= 48 * 1024) {
      try {
        const bytes = await readFile(absolute)
        result.thumb = `data:${mime};base64,${bytes.toString('base64')}`
      } catch {
        result.error = 'unreadable'
      }
    }
    return result
  }

  async function readLocaleMeta(dir) {
    const result = { zh: null, en: null }
    for (const code of ['zh', 'en']) {
      try {
        const parsed = JSON.parse(await readFile(join(dir, 'locale', `${code}.json`), 'utf8'))
        if (!isPlainObject(parsed)) continue
        const meta = isPlainObject(parsed.meta) ? parsed.meta : {}
        const title = pickText(meta.title, parsed.title)
        const description = pickText(meta.description, parsed.description)
        if (title || description) result[code] = { title, description }
      } catch {
        // Locale resources are optional; checks report their absence.
      }
    }
    return result
  }

  async function readmeFile(dir) {
    for (const candidate of ['README.md', 'readme.md', 'README.markdown', 'README']) {
      try {
        const info = await stat(join(dir, candidate))
        if (info.isFile()) return { name: candidate, bytes: info.size }
      } catch {
        // Try the next conventional name.
      }
    }
    return null
  }

  async function licenseFile(dir, pkg) {
    for (const candidate of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'COPYING']) {
      try {
        const info = await stat(join(dir, candidate))
        if (info.isFile()) return candidate
      } catch {
        // Try the next conventional name.
      }
    }
    return typeof pkg.license === 'string' ? '' : ''
  }

  async function readScreenshots(dir) {
    try {
      const parsed = JSON.parse(await readFile(join(dir, 'screenshots.json'), 'utf8'))
      const list = Array.isArray(parsed) ? parsed : isPlainObject(parsed) && Array.isArray(parsed.screenshots) ? parsed.screenshots : null
      if (!list) return { present: true, count: 0, valid: false, entries: [] }
      const entries = list.filter((item) => typeof item === 'string').slice(0, 12)
      return { present: true, count: entries.length, valid: true, entries }
    } catch {
      return { present: false, count: 0, valid: false, entries: [] }
    }
  }

  async function gitSnapshot(dir) {
    const snap = {
      isRepo: false,
      root: '',
      relativePath: '',
      branch: '',
      head: '',
      shortHead: '',
      commitCount: 0,
      dirty: 0,
      dirtyFiles: [],
      remoteUrl: '',
      httpsUrl: '',
      github: { owner: '', repo: '' },
      ahead: null,
      upstream: '',
      lastCommitAt: 0,
      lastMessage: '',
    }
    const root = await runGit(dir, ['rev-parse', '--show-toplevel'])
    if (!root.ok || root.out === '') return snap
    snap.isRepo = true
    snap.root = root.out
    const rel = relative(snap.root, dir).split(sep).join('/')
    snap.relativePath = rel === '.' ? '' : rel

    const remote = await runGit(dir, ['remote', 'get-url', 'origin'])
    if (remote.ok && remote.out !== '') {
      snap.remoteUrl = remote.out
      snap.httpsUrl = normalizeGitUrl(remote.out)
      const parsed = parseGithubUrl(snap.httpsUrl)
      if (parsed) snap.github = parsed
    }
    const head = await runGit(dir, ['rev-parse', 'HEAD'])
    if (head.ok && head.out !== '') {
      snap.head = head.out
      snap.shortHead = head.out.slice(0, 7)
    }
    // One call supplies branch, upstream, ahead/behind and the changed paths.
    const status = await runGit(dir, ['status', '--porcelain=v1', '--branch', '-uall', '--', '.'])
    if (status.ok) {
      const lines = status.out.split('\n').filter((line) => line !== '')
      const header = lines[0] && lines[0].startsWith('## ') ? lines[0].slice(3) : ''
      if (header !== '') parseBranchHeader(header, snap)
      snap.dirtyFiles = lines.filter((line) => !line.startsWith('## ')).slice(0, 20).map((line) => line.slice(0, 160))
      snap.dirty = lines.filter((line) => !line.startsWith('## ')).length
    }
    const count = await runGit(dir, ['rev-list', '--count', 'HEAD'])
    if (count.ok && /^\d+$/.test(count.out)) snap.commitCount = Number(count.out)
    const log = await runGit(dir, ['log', '-1', '--format=%ct%x00%s'])
    if (log.ok && log.out !== '') {
      const [time, message] = log.out.split('\u0000')
      if (/^\d+$/.test(time || '')) snap.lastCommitAt = Number(time) * 1000
      if (message) snap.lastMessage = message.slice(0, 160)
    }
    return snap
  }

  /* --------------------------------------------------------------- summary */

  function summarize(dir, info, current) {
    const entry = effectiveEntry(info, current.entries[dir], null, current)
    const repo = repoRefOf(info)
    const hasBundle = info.hasBundle
    return {
      dir,
      name: info.name,
      version: info.version,
      private: info.private,
      description: info.pkgDescription,
      displayZh: pickText(info.locale.zh?.title, info.locale.en?.title, info.name),
      displayEn: pickText(info.locale.en?.title, info.locale.zh?.title, info.name),
      hasBundle,
      hasClient: info.hasClient,
      patchRel: info.patchRel,
      icon: info.icon ? { thumb: info.icon.thumb, rel: info.icon.rel, error: info.icon.error } : null,
      git: {
        isRepo: info.git.isRepo,
        root: info.git.root,
        relativePath: info.git.relativePath,
        branch: info.git.branch,
        shortHead: info.git.shortHead,
        commitCount: info.git.commitCount,
        dirty: info.git.dirty,
        remoteUrl: info.git.httpsUrl,
        ahead: info.git.ahead,
        lastCommitAt: info.git.lastCommitAt,
      },
      repo,
      entry,
      flags: {
        hasReadme: Boolean(info.readme),
        hasLicense: Boolean(info.licenseFile),
        hasScreenshots: info.screenshots.present,
        officialDeps: info.officialDeps.length > 0,
        codeLines: info.code.lines,
      },
      group: hasBundle ? 'bundle' : 'client-only',
      updatedAt: info.mtime,
    }
  }

  function repoRefOf(info) {
    const fromGit = info.git.github
    if (fromGit.owner && fromGit.repo) {
      return {
        owner: fromGit.owner,
        repo: fromGit.repo,
        subpath: info.git.relativePath,
        url: `https://github.com/${fromGit.owner}/${fromGit.repo}`,
        source: 'git',
      }
    }
    const parsed = parseGithubUrl(info.repository)
    if (parsed) {
      return {
        owner: parsed.owner,
        repo: parsed.repo,
        subpath: '',
        url: `https://github.com/${parsed.owner}/${parsed.repo}`,
        source: 'package',
      }
    }
    return { owner: '', repo: '', subpath: '', url: '', source: '' }
  }

  /* ----------------------------------------------------------- entry model */

  function effectiveEntry(info, override, github, current) {
    const stored = isPlainObject(override) ? override : {}
    const repo = repoRefOf(info)
    const owner = github?.repo?.owner || repo.owner || current?.auth?.login || ''
    const repoName = codeRepoName(repo, github) || stored.repoName || defaultRepoName(info)
    const subpath = github?.repo ? repo.subpath : subpathOf(info, repoName)
    const repoUrl = github?.repo?.htmlUrl || (owner && repoName ? `https://github.com/${owner}/${repoName}` : repo.url)
    const branch = github?.repo?.defaultBranch || info.git.branch || 'main'
    const category = CATEGORY_IDS.has(stored.category) ? stored.category : suggestCategory(info)
    const descriptionEn = ensureSentence(stored.descriptionEn || pickText(info.locale.en?.description, info.pkgDescription, info.locale.zh?.description))
    const descriptionZh = ensureSentence(stored.descriptionZh || pickText(info.locale.zh?.description, ''), true)
    const url = subpath && repoUrl ? `${repoUrl}/tree/${branch}/${subpath}` : repoUrl
    const name = owner && repoName ? (subpath ? `${owner}/${repoName}#${subpath}` : `${owner}/${repoName}`) : ''
    const filename = owner && repoName ? entryFilename(owner, repoName, subpath) : ''
    const entry = {
      category,
      descriptionEn,
      descriptionZh,
      iconUrl: stored.iconUrl || '',
      tarball: stored.tarball || '',
      repoName,
      repoPrivate: stored.repoPrivate === true,
      commitMessage: stored.commitMessage || `chore: prepare ${info.name} for the DSH plugin market`,
      prNumber: stored.prNumber || 0,
      prUrl: stored.prUrl || '',
    }
    const computed = {
      owner,
      repoName,
      subpath,
      repoUrl,
      url,
      name,
      filename,
      filePath: filename ? `${CATALOG_DIR}/${filename}` : '',
      branch,
      yaml: '',
      defaultDescriptionEn: descriptionEn,
      defaultDescriptionZh: descriptionZh,
      defaultCategory: suggestCategory(info),
    }
    const merged = { ...entry, computed }
    if (filename) computed.yaml = buildYaml(merged)
    return merged
  }

  function codeRepoName(repo, github) {
    if (github && github.repo && github.repo.repo) return github.repo.repo
    if (repo && repo.repo) return repo.repo
    return ''
  }

  function subpathOf(info, repoName) {
    const repo = repoRefOf(info)
    if (repo.source === 'git' && repo.repo === repoName) return info.git.relativePath
    return ''
  }

  function defaultRepoName(info) {
    const bare = info.name.includes('/') ? info.name.split('/').pop() : info.name
    return String(bare || 'dsh-plugin').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 90)
  }

  function suggestCategory(info) {
    const haystack = [info.name, info.pkgDescription, info.locale.zh?.description, info.locale.en?.description].filter(Boolean).join(' ')
    for (const [pattern, id] of CATEGORY_HINTS) {
      if (pattern.test(haystack)) return id
    }
    return info.hasClient ? 'ui' : 'tools'
  }

  function entryFilename(owner, repo, subpath) {
    const base = `${owner}__${repo}`
    if (!subpath) return `${base}.yml`
    return `${base}--${subpath.split('/').filter(Boolean).join('-')}.yml`
  }

  function buildYaml(entry) {
    const lines = []
    const url = entry.computed.url
    const name = entry.computed.name
    lines.push(`url: ${yamlScalar(url, true)}`)
    lines.push(`name: ${yamlScalar(name, true)}`)
    lines.push(`category: ${entry.category}`)
    lines.push('description:')
    if (entry.descriptionEn) lines.push(`  en: ${yamlScalar(entry.descriptionEn, false)}`)
    if (entry.descriptionZh) lines.push(`  zh: ${yamlScalar(entry.descriptionZh, false)}`)
    if (entry.iconUrl) lines.push(`icon: ${yamlScalar(entry.iconUrl, true)}`)
    if (entry.tarball) lines.push(`tarball: ${yamlScalar(entry.tarball, true)}`)
    return `${lines.join('\n')}\n`
  }

  /* ---------------------------------------------------------------- checks */

  function buildChecks(info, entry, github) {
    const checks = []
    const add = (track, id, level, title, detail, fix, doc, action) => {
      checks.push({
        id,
        track,
        level,
        title: asLocale(title),
        detail: detail ? asLocale(detail) : null,
        fix: fix ? asLocale(fix) : null,
        doc: doc ? `${DOC_URL}#${doc}` : DOC_URL,
        action: action || '',
      })
    }
    const git = info.git
    const repo = github?.repo || null
    const reachable = Boolean(github?.available && github?.token)

    /* --- track A: GitHub code submission ------------------------------- */

    if (!git.isRepo) {
      add('github', 'git-repo', 'fail',
        ['还没有 Git 仓库', 'No Git repository yet'],
        ['这个文件夹还不是 Git 仓库，GitHub 提交需要先初始化。', 'This folder is not a Git repository yet.'],
        ['点「初始化仓库」创建 `.git` 与 `main` 分支。', 'Press Initialize repository to create `.git` on `main`.'],
        'requirements', 'git-init')
    } else {
      add('github', 'git-repo', 'pass',
        ['Git 仓库已就绪', 'Git repository ready'],
        [`分支 ${git.branch || 'main'} · 根目录 ${git.root}`, `Branch ${git.branch || 'main'} · root ${git.root}`],
        null, 'requirements')
    }

    if (git.isRepo && git.commitCount === 0) {
      add('github', 'git-commit', 'fail',
        ['还没有任何提交', 'No commits yet'],
        ['仓库里还没有提交，远程仓库会是空的。', 'The repository has no commit yet, so the remote would be empty.'],
        ['在下面填入提交说明，点「提交并推送」。', 'Fill in a commit message and press Commit and push.'],
        'requirements', 'git-commit')
    } else if (git.isRepo) {
      add('github', 'git-commit', 'pass',
        ['已有提交记录', 'Commits present'],
        [`${git.commitCount} 次提交${git.lastMessage ? ` · 最近：${git.lastMessage}` : ''}`, `${git.commitCount} commits${git.lastMessage ? ` · latest: ${git.lastMessage}` : ''}`],
        null, 'requirements')
    }

    if (git.dirty > 0) {
      add('github', 'git-clean', 'warn',
        ['有未提交的改动', 'Uncommitted changes'],
        [`${git.dirty} 个文件有改动，提交时会一起带上。`, `${git.dirty} changed files will be included in the next commit.`],
        ['确认改动都是要发布的，再点「提交并推送」。', 'Review the changes, then press Commit and push.'],
        'requirements', 'git-commit')
    } else if (git.isRepo) {
      add('github', 'git-clean', 'pass',
        ['工作区干净', 'Working tree clean'],
        ['没有未提交的改动。', 'No uncommitted changes.'],
        null, 'requirements')
    }

    if (!repo && !git.remoteUrl) {
      add('github', 'repo-exists', 'fail',
        ['还没有 GitHub 远程仓库', 'No GitHub remote yet'],
        ['本地还没有配置 origin，代码只在你的电脑上。', 'No origin remote: the code exists only on this machine.'],
        ['填好仓库名，点「创建并推送」会建库、提交并推送。', 'Fill in the repository name and press Create and push.'],
        'requirements', 'repo-create')
    } else if (!repo) {
      add('github', 'repo-exists', 'warn',
        ['远程仓库未确认', 'Remote repository unverified'],
        [`origin 指向 ${git.remoteUrl}，但拿不到 GitHub 仓库信息。`, `origin points at ${git.remoteUrl}, but its GitHub record is unavailable.`],
        ['在「设置」里连接 GitHub Token 后重新检查。', 'Connect a GitHub token in Settings and check again.'],
        'requirements', 'connect')
    } else {
      add('github', 'repo-exists', 'pass',
        ['GitHub 仓库已存在', 'GitHub repository exists'],
        [repo.htmlUrl, repo.htmlUrl],
        null, 'requirements')
    }

    if (repo && repo.private) {
      add('github', 'repo-public', 'fail',
        ['仓库是私有的', 'Repository is private'],
        ['市场收录要求公开仓库，评审要能读到源码。', 'The market requires a public repository so reviewers can read the source.'],
        ['在 GitHub 仓库设置里改成 Public，再重新检查。', 'Make the repository public in GitHub settings, then check again.'],
        'requirements')
    } else if (repo) {
      add('github', 'repo-public', 'pass',
        ['公开仓库', 'Public repository'],
        ['评审可以直接读源码。', 'Reviewers can read the source.'],
        null, 'requirements')
    }

    if (repo) {
      const hasTopic = repo.topics.includes(TOPIC)
      add('github', 'topic', hasTopic ? 'pass' : 'fail',
        hasTopic ? ['已添加 dsh-plugin topic', '`dsh-plugin` topic present'] : ['缺少 dsh-plugin topic', 'Missing `dsh-plugin` topic'],
        hasTopic
          ? [`topics: ${repo.topics.join(', ') || '(none)'}`, `topics: ${repo.topics.join(', ') || '(none)'}`]
          : ['生态按这个 topic 发现插件，官方要求必加。', 'The ecosystem discovers plugins by this topic; the guide requires it.'],
        hasTopic ? null : ['点「添加 topic」，插件会通过 API 加上。', 'Press Add topic to add it through the API.'],
        'requirements', 'topic')

      const ageOk = repo.ageDays >= 1
      const remaining = Math.max(0, 1 - repo.ageDays)
      add('pr', 'repo-age', ageOk ? 'pass' : 'fail',
        ageOk ? ['仓库已满 1 天', 'Repository is at least 1 day old'] : ['仓库未满 1 天', 'Repository is younger than 1 day'],
        ageOk
          ? [`创建于 ${formatDateTime(repo.createdAt)}，已 ${formatDays(repo.ageDays)}。`, `Created ${formatDateTime(repo.createdAt)}, ${formatDays(repo.ageDays)} old.`]
          : [`CI 会在第 3 步拒绝：创建于 ${formatDateTime(repo.createdAt)}，还差约 ${formatHours(remaining)}。`, `CI rejects this at step 3: created ${formatDateTime(repo.createdAt)}, about ${formatHours(remaining)} to go.`],
        ageOk ? null : ['1 天门槛无法绕过，过几小时再提交 PR 即可，重新提交没有影响。', 'The 1-day floor cannot be bypassed; open the PR a few hours later. A resubmission is not held against you.'],
        'requirements')
    } else if (reachable) {
      add('github', 'topic', 'warn', ['topic 待确认', 'Topic unverified'], ['仓库信息还没拿到。', 'Repository facts are not available yet.'], null, 'requirements')
      add('pr', 'repo-age', 'warn', ['仓库年龄待确认', 'Repository age unknown'], ['仓库创建后才能读到创建时间。', 'The creation date is readable once the repository exists.'], null, 'requirements')
    } else {
      add('github', 'topic', 'warn', ['topic 待确认', 'Topic unverified'], ['连接 GitHub Token 后才能检查 topic。', 'Connect a GitHub token to verify the topic.'], null, 'requirements', 'connect')
      add('pr', 'repo-age', 'warn', ['仓库年龄待确认', 'Repository age unknown'], ['连接 GitHub Token 后才能检查创建时间。', 'Connect a GitHub token to verify the creation date.'], null, 'requirements', 'connect')
    }

    if (git.isRepo) {
      if (git.ahead === null) {
        add('github', 'git-pushed', 'warn',
          ['还未推送过', 'Not pushed yet'],
          ['本地还没有设置上游分支。', 'No upstream branch is configured for this checkout.'],
          ['点「提交并推送」完成第一次推送。', 'Press Commit and push for the first push.'],
          'requirements', 'git-push')
      } else if (git.ahead === 0) {
        add('github', 'git-pushed', 'pass',
          ['本地与远程一致', 'Local and remote agree'],
          [`上游 ${git.upstream}`, `Upstream ${git.upstream}`],
          null, 'requirements')
      } else {
        add('github', 'git-pushed', 'warn',
          ['有提交还没推送', 'Unpushed commits'],
          [`领先上游 ${git.ahead} 个提交。`, `${git.ahead} commits ahead of upstream.`],
          ['点「提交并推送」。', 'Press Commit and push.'],
          'requirements', 'git-push')
      }
    }

    if (info.hasNodeModules && !info.hasGitignore) {
      add('github', 'gitignore', 'warn',
        ['没有 .gitignore', 'No .gitignore'],
        ['目录里有 node_modules，提交时可能被一起推上去，仓库会变成几十 MB。', 'node_modules is present and may be committed, which can turn the repository into tens of megabytes.'],
        ['在组件根目录加一个 `.gitignore`，至少写入 `node_modules/` 与 `dist/`。', 'Add a `.gitignore` at the component root with at least `node_modules/` and `dist/`.'],
        'adding-a-plugin--收录插件')
    }

    /* --- track B: market listing PR ------------------------------------ */

    const repoReady = Boolean(repo && !repo.private && repo.topics.includes(TOPIC))
    add('pr', 'repo-ready', repoReady ? 'pass' : 'fail',
      repoReady ? ['GitHub 前提已满足', 'GitHub prerequisites met'] : ['先完成 GitHub 提交这一轨', 'Finish the GitHub track first'],
      repoReady
        ? ['公开仓库、topic 都已就绪。', 'Public repository and topic are in place.']
        : ['收录 PR 指向的仓库必须公开、带 dsh-plugin topic。', 'The listing must point at a public repository carrying the dsh-plugin topic.'],
      repoReady ? null : ['先在「GitHub 提交」里完成建库、推送和 topic。', 'Complete the GitHub track first.'],
      'requirements')

    const categoryOk = CATEGORY_IDS.has(entry.category)
    add('pr', 'entry-category', categoryOk ? 'pass' : 'fail',
      categoryOk ? ['分类已选择', 'Category selected'] : ['还没有选择分类', 'No category selected'],
      categoryOk ? [`${entry.category} — ${categoryLabel(entry.category, 'zh')}`, `${entry.category} — ${categoryLabel(entry.category, 'en')}`] : ['官方只接受固定的分类清单。', 'Only the published category ids are accepted.'],
      categoryOk ? null : ['在条目表单里选一个最接近的分类，选不准也没关系。', 'Pick the closest category; a near miss is fixed by a maintainer.'],
      'adding-a-plugin--收录插件', 'entry')

    const descEn = entry.descriptionEn || ''
    const descZh = entry.descriptionZh || ''
    if (descEn === '') {
      add('pr', 'entry-description-en', 'fail',
        ['缺少英文描述', 'Missing English description'],
        ['`description.en` 是唯一的必填项。', '`description.en` is the only required field.'],
        ['写一句它具体做了什么，以句号结尾。', 'Write one sentence about what it does, ending with a period.'],
        'adding-a-plugin--收录插件', 'entry')
    } else if (MARKETING_RE.test(descEn) || MARKETING_RE.test(descZh)) {
      add('pr', 'entry-description-en', 'fail',
        ['描述里有营销词', 'Description contains marketing wording'],
        ['官方明确要求描述只说功能、不带营销词。', 'The guide requires plain functional wording, no superlatives.'],
        ['去掉「最强 / 最好 / 第一 / best」这类词，只写它做什么。', 'Remove superlatives; state only what the plugin does.'],
        'requirements', 'entry')
    } else if (!/[.。]$/.test(descEn.trim())) {
      add('pr', 'entry-description-en', 'warn',
        ['英文描述结尾没有句号', 'English description does not end with a period'],
        ['官方示例与校验习惯都以句号结尾。', 'The documented example ends with a period.'],
        ['补一个句号。', 'Add a period.'],
        'adding-a-plugin--收录插件', 'entry')
    } else if (descEn.length > 200) {
      add('pr', 'entry-description-en', 'warn',
        ['英文描述太长', 'English description is long'],
        [`现在 ${descEn.length} 个字符，官方说 one-line。`, `${descEn.length} characters; the guide asks for one line.`],
        ['压到 200 字符以内。', 'Keep it under 200 characters.'],
        'adding-a-plugin--收录插件', 'entry')
    } else {
      add('pr', 'entry-description-en', 'pass',
        ['英文描述可用', 'English description ready'],
        [descEn, descEn],
        null, 'adding-a-plugin--收录插件')
    }

    if (descZh === '') {
      add('pr', 'entry-description-zh', 'warn',
        ['中文描述留空', 'Chinese description empty'],
        ['`zh` 可选：留空由维护者补，不影响收录。', '`zh` is optional; maintainers fill it in. It never blocks a submission.'],
        ['写一句也可以，中文冒号不需要额外引号。', 'You can add one; a full-width colon needs no quoting.'],
        'adding-a-plugin--收录插件', 'entry')
    } else {
      add('pr', 'entry-description-zh', 'pass',
        ['中文描述可用', 'Chinese description ready'],
        [descZh, descZh],
        null, 'adding-a-plugin--收录插件')
    }

    const nameOk = Boolean(entry.computed.name) && (!entry.computed.subpath || entry.computed.name.includes('#'))
    add('pr', 'entry-name', nameOk ? 'pass' : 'fail',
      nameOk ? ['条目地址与仓库一致', 'Entry url and name match the repository'] : ['无法确定条目地址', 'Cannot resolve the entry address'],
      nameOk
        ? [`${entry.computed.url}`, `${entry.computed.url}`]
        : ['需要先确定 GitHub 仓库的 owner/repo。', 'The GitHub owner/repo must be known first.'],
      nameOk ? null : ['连接 GitHub 并完成建库后再检查。', 'Connect GitHub and create the repository first.'],
      'adding-a-plugin--收录插件', nameOk ? '' : 'connect')

    if (entry.iconUrl) {
      const iconOk = validIconUrl(entry.iconUrl)
      add('pr', 'entry-icon', iconOk ? 'pass' : 'fail',
        iconOk ? ['图标链接可用', 'Icon link accepted'] : ['图标链接不符合要求', 'Icon link rejected'],
        [entry.iconUrl, entry.iconUrl],
        iconOk ? null : ['必须是 GitHub 托管的 https 位图（png/jpg/jpeg/webp），SVG 与第三方图床会被拒绝。', 'Must be a GitHub-hosted https raster image (png/jpg/jpeg/webp); SVG and third-party hosts are rejected.'],
        'icon--图标optional-可选', 'entry')
    } else {
      add('pr', 'entry-icon', 'pass',
        ['未设置卡片图标', 'No storefront icon'],
        ['可选：不写则回退到作者的头像。', 'Optional: omitted, the list falls back to your avatar.'],
        null, 'icon--图标optional-可选', 'entry')
    }

    if (entry.tarball) {
      const problem = tarballProblem(entry.tarball, info.version)
      add('pr', 'entry-tarball', problem ? problem.level : 'pass',
        problem && problem.level === 'warn'
          ? ['tarball 链接会过期', 'tarball link will rot']
          : problem ? ['tarball 链接不合法', 'tarball link invalid'] : ['tarball 链接可用', 'tarball link accepted'],
        [entry.tarball, entry.tarball],
        problem ? [problem.message, problem.message] : null,
        'adding-a-plugin--收录插件', 'entry')
    }

    if (info.officialDeps.length > 0) {
      add('pr', 'peer-deps', 'warn',
        ['官方包写进了 dependencies', 'Official packages declared as dependencies'],
        [info.officialDeps.join(', '), info.officialDeps.join(', ')],
        ['官方 `@deepseek-ai/*` 包建议用 `peerDependencies` 声明，并带显式预发布分支，否则预发布版会被静默排除。', 'Declare official `@deepseek-ai/*` packages in `peerDependencies` with an explicit prerelease branch, or prerelease harness builds are excluded silently.'],
        'adding-a-plugin--收录插件')
    }

    const codeFiles = info.code.files
    const codeLines = info.code.lines
    if (codeFiles === 0) {
      add('pr', 'real-code', 'fail',
        ['没有可运行的代码文件', 'No runnable code files'],
        ['评审会读源码；占位、纯 README 仓库不收。', 'Reviewers read the source; placeholders and README-only repositories are not listed.'],
        ['先把入口文件（index.js / client.js 或 exports 指向的文件）写完。', 'Write the entry files first (index.js, client.js, or whatever exports point at).'],
        'how-submissions-are-reviewed--收录如何评审')
    } else if (codeLines < 40) {
      add('pr', 'real-code', 'warn',
        ['代码量很小', 'The code is very small'],
        [`${codeFiles} 个文件 · ${codeLines} 行`, `${codeFiles} files · ${codeLines} lines`],
        ['确认功能完整再提交：评审会核对描述里的每一句。', 'Make sure it works before submitting; reviewers check every claim in the description.'],
        'how-submissions-are-reviewed--收录如何评审')
    } else {
      add('pr', 'real-code', 'pass',
        ['有真实代码', 'Real code present'],
        [`${codeFiles} 个文件 · ${codeLines} 行`, `${codeFiles} files · ${codeLines} lines`],
        null, 'how-submissions-are-reviewed--收录如何评审')
    }

    if (info.screenshots.present) {
      const list = info.screenshots.entries
      const bad = list.filter((item) => /^[/]|\.\./.test(item))
      const countOk = list.length >= 1 && list.length <= 8
      add('pr', 'screenshots', countOk && bad.length === 0 ? 'pass' : 'warn',
        countOk && bad.length === 0 ? ['截图声明可用', 'Screenshots declared'] : ['截图声明需要调整', 'Screenshots need adjusting'],
        [`screenshots.json · ${list.length} 张`, `screenshots.json · ${list.length} image(s)`],
        countOk && bad.length === 0 ? null : ['1-8 张，相对路径且不能跳出插件目录（不能以 / 开头、不能含 ..）。', '1-8 images, relative paths that stay inside the plugin directory (no leading /, no ..).'],
        'screenshots--截图optional-recommended-可选-推荐')
    } else {
      add('pr', 'screenshots', 'pass',
        ['没有声明截图', 'No screenshots declared'],
        ['可选：市场会从 README 自动抽取图片。', 'Optional: storefronts extract images from the README.'],
        null, 'screenshots--截图optional-recommended-可选-推荐')
    }

    add('pr', 'single-entry', 'pass',
      ['一个 PR 只加一条', 'One entry per PR'],
      ['本插件每次只为你选中的组件提交一条条目，符合「一个 PR 最多 3 条」的限制。', 'This plugin submits exactly one entry for the selected component, within the 3-entry limit.'],
      null, 'one-pr-at-most-3-entries--一个-pr-最多-3-条')

    return checks
  }

  function categoryLabel(id, locale) {
    const found = CATEGORIES.find((item) => item.id === id)
    if (!found) return id
    return locale === 'en' ? found.en : found.zh
  }

  function summarizeChecks(checks) {
    const result = { github: { pass: 0, warn: 0, fail: 0, total: 0 }, pr: { pass: 0, warn: 0, fail: 0, total: 0 } }
    for (const check of checks) {
      const bucket = result[check.track] || (result[check.track] = { pass: 0, warn: 0, fail: 0, total: 0 })
      bucket.total += 1
      if (check.level === 'pass') bucket.pass += 1
      else if (check.level === 'warn') bucket.warn += 1
      else bucket.fail += 1
    }
    return result
  }

  /* ------------------------------------------------------------ github facts */

  async function githubFacts(info, token, source) {
    const repoRef = repoRefOf(info)
    const facts = {
      available: Boolean(token),
      token: Boolean(token),
      tokenSource: source || '',
      repo: null,
      error: '',
      hint: '',
    }
    if (!repoRef.owner || !repoRef.repo) return facts
    if (!token) return facts
    try {
      facts.repo = await fetchRepo(token, repoRef.owner, repoRef.repo)
    } catch (error) {
      facts.error = messageOf(error)
      facts.hint = error?.github?.hint || ''
    }
    return facts
  }

  /* ------------------------------------------------------------- actions */

  async function withLock(key, fn) {
    const previous = locks.get(key) || Promise.resolve()
    const run = previous.then(fn, fn)
    locks.set(key, run.catch(() => {}))
    return run
  }

  async function componentAt(rawDir) {
    const dir = normalizeDir(rawDir)
    if (!dir) throw httpError(400, '需要一个绝对目录路径。', 'bad-dir')
    let real
    try {
      real = await realpath(dir)
    } catch {
      throw httpError(404, '目录不存在。', 'bad-dir')
    }
    const list = await discover()
    const found = list.components.find((item) => item.dir === real)
    if (!found) throw httpError(404, '这个目录不在组件清单里：请先在清单页添加它。', 'not-listed')
    return found
  }

  async function inspectFull(rawDir) {
    const component = await componentAt(rawDir)
    const info = await inspectComponent(component.dir)
    const { token, source } = await readToken()
    const github = await githubFacts(info, token, source)
    const current = await ensureState()
    const entry = effectiveEntry(info, current.entries[component.dir], github, current)
    const checks = buildChecks(info, entry, github)
    return { component, info, github, entry, checks, tokenSource: source, authed: token !== '' }
  }

  async function gitInit(dir) {
    const inside = await runGit(dir, ['rev-parse', '--show-toplevel'])
    if (inside.ok) return { created: false, root: inside.out }
    const result = await runGit(dir, ['init', '-b', 'main'])
    if (!result.ok) {
      const fallback = await runGit(dir, ['init'])
      if (!fallback.ok) throw httpError(500, `初始化 Git 仓库失败：${result.err || fallback.err}`, 'git-init')
    }
    const branch = await runGit(dir, ['checkout', '-B', 'main'])
    if (!branch.ok) throw httpError(500, `创建 main 分支失败：${branch.err}`, 'git-init')
    return { created: true, root: dir }
  }

  async function commitAll(dir, message, login) {
    const identity = []
    const email = await runGit(dir, ['config', 'user.email'])
    const name = await runGit(dir, ['config', 'user.name'])
    if (!email.ok || email.out === '') identity.push('-c', `user.email=${login || 'nanshan'}@users.noreply.github.com`)
    if (!name.ok || name.out === '') identity.push('-c', `user.name=${login || 'nanshan'}`)
    // `git add -A` is repository-wide from Git 2.0 on; `-- .` keeps a monorepo
    // subpackage commit scoped to the component directory.
    const add = await runGit(dir, ['add', '-A', '--', '.'])
    if (!add.ok) throw httpError(500, `git add 失败：${add.err}`, 'git-add')
    const staged = await runGit(dir, ['diff', '--cached', '--quiet', '--', '.'])
    if (staged.ok) return { committed: false, reason: 'nothing-to-commit' }
    const commit = await runGit(dir, [...identity, 'commit', '-m', message || 'chore: update plugin'])
    if (!commit.ok) {
      if (/nothing to commit/i.test(commit.err) || /nothing to commit/i.test(commit.out)) {
        return { committed: false, reason: 'nothing-to-commit' }
      }
      throw httpError(500, `提交失败：${commit.err || commit.out}`, 'git-commit')
    }
    const head = await runGit(dir, ['rev-parse', '--short', 'HEAD'])
    return { committed: true, commit: head.out }
  }

  async function setRemote(dir, url) {
    const existing = await runGit(dir, ['remote', 'get-url', 'origin'])
    if (existing.ok) {
      if (existing.out === url) return
      const changed = await runGit(dir, ['remote', 'set-url', 'origin', url])
      if (!changed.ok) throw httpError(500, `设置远程仓库失败：${changed.err}`, 'git-remote')
      return
    }
    const added = await runGit(dir, ['remote', 'add', 'origin', url])
    if (!added.ok) throw httpError(500, `添加远程仓库失败：${added.err}`, 'git-remote')
  }

  /** One push attempt; `extra` carries transport overrides such as http.version. */
  async function pushAttempt(dir, token, branch, extra) {
    const remote = await runGit(dir, ['remote', 'get-url', 'origin'])
    const remoteUrl = remote.ok ? remote.out : ''
    const httpsRemote = /^https:\/\//i.test(remoteUrl)
    const args = [...extra, 'push', '-u', 'origin', `HEAD:${branch}`]
    if (httpsRemote && token) {
      const helper = '!f() { echo username=x-access-token; echo "password=$NSMP_GIT_TOKEN"; }; f'
      return runGit(dir, ['-c', 'credential.helper=', '-c', `credential.helper=${helper}`, ...args], {
        timeout: 180000,
        env: { NSMP_GIT_TOKEN: token },
      })
    }
    return runGit(dir, args, { timeout: 180000 })
  }

  /**
   * Push over HTTPS. Some proxies and middleboxes break GitHub's HTTP/2
   * framing, so a failure that names it retries once over HTTP/1.1 instead of
   * asking the user to edit their global git config.
   */
  async function pushBranch(dir, token, branch, preferHttp1 = false) {
    if (preferHttp1) {
      // A previous push on this component only worked over HTTP/1.1; skip the
      // protocol negotiation that already failed once.
      const direct = await pushAttempt(dir, token, branch, ['-c', 'http.version=HTTP/1.1'])
      if (direct.ok) {
        const described = describePush(direct, true)
        described.transport = 'http1.1'
        return described
      }
      const described = describePush(direct, false)
      if (!isHttp2FramingFailure(direct)) return described
      const retry = await pushAttempt(dir, token, branch, [])
      const retried = describePush(retry, retry.ok)
      if (retry.ok) retried.transport = 'http2'
      else retried.fallbackTried = true
      return retried
    }
    const first = await pushAttempt(dir, token, branch, [])
    if (first.ok) return describePush(first, true)
    if (!isHttp2FramingFailure(first)) return describePush(first, false)
    const retry = await pushAttempt(dir, token, branch, ['-c', 'http.version=HTTP/1.1'])
    if (retry.ok) {
      const described = describePush(retry, true)
      described.fallback = 'http1.1'
      described.transport = 'http1.1'
      return described
    }
    const described = describePush(retry, false)
    described.fallbackTried = true
    return described
  }

  function isHttp2FramingFailure(result) {
    const text = `${result.err}\n${result.out}`
    return /HTTP2 framing layer|http2 fram|HTTP\/2/i.test(text)
  }

  function describePush(result, ok) {
    if (ok) return { ok: true, out: result.out.slice(-2000) }
    const text = `${result.err}\n${result.out}`.trim()
    let hint = ''
    if (/HTTP2 framing layer|http2 fram/i.test(text)) {
      hint = 'GitHub 的 HTTP/2 连接被中间网络打断了。插件已自动改用 HTTP/1.1 重试；如果仍失败，执行 git config --global http.version HTTP/1.1 再推一次。'
    } else if (/Authentication failed|could not read Username|Permission denied/i.test(text)) {
      hint = '推送被拒绝：Token 缺少 repo 权限，或远程地址是 SSH 但本机没有配置密钥。'
    } else if (/protected branch|pre-receive hook declined/i.test(text)) {
      hint = '分支被保护规则拒绝，请在 GitHub 上允许推送或换一个分支名。'
    } else if (/non-fast-forward|fetch first/i.test(text)) {
      hint = '远程有你本地没有的提交，先拉取合并再推送。'
    } else if (/Could not resolve host|Failed to connect|Connection timed out|Connection reset/i.test(text)) {
      hint = '连不上 GitHub：检查网络、代理或 VPN 后重试。'
    }
    return { ok: false, error: text.slice(-2000), hint }
  }

  async function ensureRepo({ token, login, dir, name, description, isPrivate }) {
    const cleanName = String(name || '').trim()
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(cleanName)) {
      throw httpError(400, '仓库名只能包含字母、数字、点、下划线和连字符。', 'bad-repo-name')
    }
    if (!login) throw httpError(401, '无法确定 GitHub 账号。', 'no-login')
    const existing = await fetchRepo(token, login, cleanName)
    if (existing) {
      if (existing.owner !== login) throw httpError(409, `仓库名 ${cleanName} 已被其他账号占用。`, 'repo-taken')
      return { repo: existing, created: false }
    }
    let created
    try {
      const { data } = await gh(token, 'POST', '/user/repos', {
        name: cleanName,
        description: description || '',
        private: isPrivate === true,
        has_issues: true,
        has_wiki: false,
        has_projects: false,
        auto_init: false,
      })
      created = normalizeRepo(data)
    } catch (error) {
      if (error?.status === 422) {
        const found = await fetchRepo(token, login, cleanName)
        if (found) return { repo: found, created: false }
      }
      throw error
    }
    if (!created) throw httpError(502, 'GitHub 没有返回仓库信息。', 'repo-create')
    return { repo: created, created: true }
  }

  async function ensureTopic(token, repo) {
    const topics = new Set(repo.topics)
    if (topics.has(TOPIC)) return { added: false, topics: [...topics] }
    topics.add(TOPIC)
    const { data } = await gh(token, 'PUT', `/repos/${repo.owner}/${repo.repo}/topics`, { names: [...topics] })
    const updated = normalizeRepo(data)
    clearGhCache()
    return { added: true, topics: updated ? updated.topics : [...topics] }
  }

  async function openListingPr({ token, login, entry, info, github }) {
    const upstream = await gh(token, 'GET', UPSTREAM_API)
    const base = typeof upstream.data.default_branch === 'string' ? upstream.data.default_branch : 'main'
    const forkFull = `${login}/${UPSTREAM.repo}`
    let fork = await fetchRepo(token, login, UPSTREAM.repo)
    let forkCreated = false
    if (!fork) {
      try {
        await gh(token, 'POST', `${UPSTREAM_API}/forks`, { default_branch_only: true })
        forkCreated = true
      } catch (error) {
        if (error?.status !== 422) throw error
      }
      for (let attempt = 0; attempt < 12; attempt += 1) {
        fork = await fetchRepo(token, login, UPSTREAM.repo)
        if (fork) break
        await sleep(1500)
      }
    }
    if (!fork) throw httpError(502, 'Fork 还没有就绪，请稍后重试。', 'fork-pending')

    // A stable branch name makes a retry reuse the same branch instead of
    // leaving an orphan behind for every attempt.
    const slug = slugify(entry.computed.repoName || 'plugin').slice(0, 40) || 'plugin'
    const branch = `add-plugin-${slug}`

    let branchExists = false
    try {
      await gh(token, 'GET', `/repos/${login}/${UPSTREAM.repo}/git/ref/heads/${encodeURIComponent(branch)}`)
      branchExists = true
    } catch (error) {
      if (error?.status !== 409 && error?.status !== 404) throw error
    }

    if (!branchExists) {
      let baseSha = ''
      try {
        const ref = await gh(token, 'GET', `/repos/${login}/${UPSTREAM.repo}/git/ref/heads/${encodeURIComponent(fork.defaultBranch || base)}`)
        baseSha = ref.data?.object?.sha || ''
      } catch (error) {
        if (error?.status !== 409 && error?.status !== 404) throw error
      }
      if (!baseSha) {
        const ref = await gh(token, 'GET', `/repos/${login}/${UPSTREAM.repo}/git/ref/heads/${encodeURIComponent(base)}`)
        baseSha = ref.data?.object?.sha || ''
      }
      if (!baseSha) throw httpError(502, '读不到 fork 的分支指针，请稍后重试。', 'fork-pending')
      await gh(token, 'POST', `/repos/${login}/${UPSTREAM.repo}/git/refs`, {
        ref: `refs/heads/${branch}`,
        sha: baseSha,
      })
    }

    // Re-read the file on this branch so a retry replaces it instead of failing
    // with a missing sha.
    let existingSha = ''
    let fileOnFork = false
    try {
      const file = await gh(token, 'GET', `/repos/${login}/${UPSTREAM.repo}/contents/${entry.computed.filePath}?ref=${encodeURIComponent(branch)}`)
      if (file.data && typeof file.data.sha === 'string') {
        existingSha = file.data.sha
        fileOnFork = true
      }
    } catch (error) {
      if (error?.status === 404) {
        const file = await gh(token, 'GET', `/repos/${login}/${UPSTREAM.repo}/contents/${entry.computed.filePath}`)
        if (file.data && typeof file.data.sha === 'string') existingSha = file.data.sha
      } else {
        throw error
      }
    }

    const payload = {
      message: `${existingSha ? 'Update' : 'Add'} ${entry.computed.name}`,
      content: Buffer.from(entry.computed.yaml, 'utf8').toString('base64'),
      branch,
    }
    if (existingSha) payload.sha = existingSha
    try {
      await gh(token, 'PUT', `/repos/${login}/${UPSTREAM.repo}/contents/${entry.computed.filePath}`, payload)
    } catch (error) {
      // The file already exists on the default branch: the entry is listed
      // already or a maintainer owns it, so nothing to write.
      if (error?.status === 422 && fileOnFork) {
        // Already on the branch; fall through to the PR step.
      } else if (error?.status === 422) {
        throw httpError(409, `条目文件已存在：${entry.computed.filePath}。可能已经收录过，或维护者已有同名条目。`, 'file-exists')
      } else {
        throw error
      }
    }

    const existing = await gh(token, 'GET', `${UPSTREAM_API}/pulls?state=open&head=${encodeURIComponent(`${login}:${branch}`)}&per_page=5`)
    let pr = Array.isArray(existing.data) && existing.data.length > 0 ? openPrOf(existing.data[0]) : null
    if (!pr) {
      const body = prBody(entry, info, github)
      const { data } = await gh(token, 'POST', `${UPSTREAM_API}/pulls`, {
        title: `Add ${entry.computed.name}`,
        head: `${login}:${branch}`,
        base,
        body,
      })
      pr = openPrOf(data)
    }
    return { pr, branch, file: entry.computed.filePath, base, forkFull, forkCreated }
  }

  function openPrOf(data) {
    if (!isPlainObject(data)) return null
    return {
      number: Number.isFinite(data.number) ? data.number : 0,
      url: typeof data.html_url === 'string' ? data.html_url : '',
      state: typeof data.state === 'string' ? data.state : 'open',
      title: typeof data.title === 'string' ? data.title : '',
      headSha: typeof data.head?.sha === 'string' ? data.head.sha : '',
      mergeable: typeof data.mergeable === 'boolean' ? data.mergeable : null,
      labels: Array.isArray(data.labels) ? data.labels.map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean) : [],
    }
  }

  function prBody(entry, info, github) {
    const repo = github?.repo || null
    const lines = []
    lines.push('### 收录申请 / Listing request')
    lines.push('')
    lines.push(`- 插件 / Plugin: \`${entry.computed.name}\``)
    lines.push(`- 仓库 / Repository: ${entry.computed.repoUrl}`)
    lines.push(`- 分类 / Category: \`${entry.category}\``)
    lines.push(`- 条目文件 / Entry file: \`${entry.computed.filePath}\``)
    lines.push('')
    lines.push('### 自查 / Self-check')
    lines.push('')
    // Only claim what this plugin actually verified before opening the PR.
    if (info.hasBundle) lines.push('- [x] `package.json` 声明 `dsh.bundle` / declares `dsh.bundle`')
    if (repo && !repo.private) lines.push('- [x] 仓库公开 / public repository')
    if (repo && repo.ageDays >= 1) lines.push(`- [x] 仓库创建满 1 天 / at least 1 day old (created ${new Date(repo.createdAt).toISOString().slice(0, 10)})`)
    if (repo && repo.topics.includes(TOPIC)) lines.push(`- [x] 已加 \`${TOPIC}\` topic / topic added`)
    lines.push('- [x] 一个 PR 只加一条条目 / exactly one entry in this PR')
    lines.push('')
    lines.push('Thanks for reviewing. / 感谢评审。')
    return lines.join('\n')
  }

  async function prStatusOf(token, number) {
    const { data } = await gh(token, 'GET', `${UPSTREAM_API}/pulls/${number}`)
    const pr = openPrOf(data)
    if (!pr) throw httpError(502, 'GitHub 没有返回 PR 信息。', 'pr-status')
    pr.mergeableState = typeof data.mergeable_state === 'string' ? data.mergeable_state : ''
    pr.draft = data.draft === true
    pr.merged = data.merged === true
    pr.closedAt = typeof data.closed_at === 'string' ? data.closed_at : ''
    pr.createdAt = typeof data.created_at === 'string' ? data.created_at : ''
    let checks = { total: 0, runs: [] }
    let files = []
    let comments = []
    if (pr.headSha) {
      try {
        const runs = await gh(token, 'GET', `/repos/${UPSTREAM.owner}/${UPSTREAM.repo}/commits/${pr.headSha}/check-runs?per_page=20`)
        const list = Array.isArray(runs.data?.check_runs) ? runs.data.check_runs : []
        checks = {
          total: list.length,
          runs: list.slice(0, 10).map((run) => ({
            name: typeof run.name === 'string' ? run.name : '',
            status: typeof run.status === 'string' ? run.status : '',
            conclusion: typeof run.conclusion === 'string' ? run.conclusion : '',
            url: typeof run.html_url === 'string' ? run.html_url : '',
          })),
        }
      } catch {
        checks = { total: 0, runs: [] }
      }
      try {
        const list = await gh(token, 'GET', `${UPSTREAM_API}/pulls/${number}/files?per_page=20`)
        files = Array.isArray(list.data) ? list.data.map((item) => ({ filename: item.filename, status: item.status, additions: item.additions, deletions: item.deletions })) : []
      } catch {
        files = []
      }
    }
    try {
      const list = await gh(token, 'GET', `${UPSTREAM_API}/issues/${number}/comments?per_page=10`)
      comments = Array.isArray(list.data)
        ? list.data.slice(-5).map((item) => ({
            author: item.user?.login || '',
            body: typeof item.body === 'string' ? item.body.slice(0, 600) : '',
            at: typeof item.created_at === 'string' ? item.created_at : '',
            url: typeof item.html_url === 'string' ? item.html_url : '',
          }))
        : []
    } catch {
      comments = []
    }
    return { pr, checks, files, comments }
  }

  /* ---------------------------------------------------------------- routes */

  async function overviewPayload(force = false) {
    const current = await ensureState()
    const found = await discover(force)
    const { token, source } = await readToken()
    return {
      ok: true,
      settings: current.settings,
      targets: current.targets,
      components: found.components,
      warnings: found.warnings,
      scanned: found.scanned,
      records: current.records.slice(0, 60),
      auth: current.auth,
      tokenSource: token ? source : '',
      tokenConnected: token !== '',
      categories: CATEGORIES,
      upstream: { owner: UPSTREAM.owner, repo: UPSTREAM.repo, url: UPSTREAM_URL, docUrl: DOC_URL },
      at: Date.now(),
    }
  }

  async function handleOverview(request, response, url) {
    const force = url.searchParams.get('force') === '1'
    return sendJson(response, 200, await overviewPayload(force))
  }

  async function handleInspect(request, response) {
    const body = await readJsonBody(request)
    const dir = normalizeDir(body.dir)
    if (!dir) return sendJson(response, 400, { ok: false, message: '缺少组件目录。' })
    const result = await inspectFull(dir)
    const current = await ensureState()
    return sendJson(response, 200, {
      ok: true,
      component: summarize(result.info.dir, result.info, current),
      detail: result.info,
      github: result.github,
      entry: result.entry,
      checks: result.checks,
      summary: summarizeChecks(result.checks),
      auth: current.auth,
      tokenSource: result.tokenSource,
      records: current.records.filter((record) => record.dir === result.info.dir).slice(0, 20),
      commands: commandsFor(result.info, result.entry, result.github),
    })
  }

  async function handleScan(request, response) {
    const body = await readJsonBody(request)
    if (isPlainObject(body.settings)) {
      const current = await ensureState()
      current.settings = mergeSettings(current.settings, body.settings)
      await saveState()
    }
    const payload = await overviewPayload(true)
    return sendJson(response, 200, payload)
  }

  async function handleTargets(request, response) {
    const body = await readJsonBody(request)
    const current = await ensureState()
    const added = []
    const removed = []
    const resolved = []
    if (Array.isArray(body.add)) {
      // Validate every candidate before touching state, so a bad path cannot
      // leave a half-applied list behind.
      const candidates = []
      for (const value of body.add.slice(0, 10)) {
        const dir = normalizeDir(value)
        if (!dir) throw httpError(400, '需要绝对路径，例如 /Users/you/code/my-plugin。', 'bad-dir')
        let real
        try {
          real = await realpath(dir)
        } catch {
          throw httpError(400, `目录不存在：${dir}`, 'bad-dir')
        }
        const pkg = await readPackageQuiet(real)
        if (!pkg || !isDshPackage(pkg)) {
          throw httpError(400, `这个目录不是 DSH 组件（package.json 缺少 dsh.bundle / dsh.client）：${real}`, 'not-component')
        }
        candidates.push(real)
      }
      for (const real of candidates) {
        resolved.push(real)
        if (!current.targets.includes(real)) {
          current.targets.push(real)
          added.push(real)
        }
      }
    }
    if (Array.isArray(body.remove)) {
      for (const value of body.remove.slice(0, 20)) {
        const dir = normalizeDir(value)
        if (!dir) continue
        let resolved = dir
        try {
          resolved = await realpath(dir)
        } catch {
          // A removed folder must still be removable by its recorded path.
        }
        const index = current.targets.findIndex((item) => item === dir || item === resolved)
        if (index >= 0) {
          const [removedDir] = current.targets.splice(index, 1)
          removed.push(removedDir)
          delete current.entries[removedDir]
        }
      }
    }
    current.targets = current.targets.slice(0, 60)
    await saveState()
    inspectCache.clear()
    const payload = await overviewPayload(true)
    return sendJson(response, 200, { ...payload, added, removed, resolved })
  }

  async function handleEntrySave(request, response) {
    const body = await readJsonBody(request)
    const dir = normalizeDir(body.dir)
    if (!dir) return sendJson(response, 400, { ok: false, message: '缺少组件目录。' })
    const component = await componentAt(dir)
    const current = await ensureState()
    const merged = sanitizeEntry({ ...(current.entries[component.dir] || {}), ...(isPlainObject(body.entry) ? body.entry : {}) })
    current.entries[component.dir] = merged
    await saveState()
    const result = await inspectFull(component.dir)
    return sendJson(response, 200, {
      ok: true,
      entry: result.entry,
      checks: result.checks,
      summary: summarizeChecks(result.checks),
      github: result.github,
    })
  }

  async function handleConnect(request, response) {
    const body = await readJsonBody(request)
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (token === '') return sendJson(response, 400, { ok: false, message: '请填入 GitHub Token。' })
    let user
    try {
      user = await fetchUser(token)
    } catch (error) {
      const status = error?.status === 401 ? 401 : 502
      return sendJson(response, status, {
        ok: false,
        code: 'token-invalid',
        message: `Token 验证失败：${messageOf(error)}`,
      })
    }
    await writeToken(token)
    const current = await ensureState()
    current.auth = {
      login: user.login,
      avatarUrl: user.avatarUrl,
      source: 'dsh-credentials',
      scopes: user.scopes,
      at: Date.now(),
    }
    pushRecord({
      kind: 'connect',
      name: user.login,
      title: '已连接 GitHub',
      detail: user.login,
    })
    await saveState()
    clearGhCache()
    return sendJson(response, 200, { ok: true, auth: current.auth, records: current.records.slice(0, 20) })
  }

  async function handleDisconnect(request, response) {
    await clearToken()
    const current = await ensureState()
    current.auth = { login: '', avatarUrl: '', source: '', scopes: '', at: 0 }
    pushRecord({ kind: 'disconnect', title: '已断开 GitHub', detail: '' })
    await saveState()
    clearGhCache()
    return sendJson(response, 200, { ok: true, auth: current.auth })
  }

  async function handleGithubCheck(request, response) {
    const { token, source } = await readToken()
    if (!token) {
      const current = await ensureState()
      current.auth = { login: '', avatarUrl: '', source: '', scopes: '', at: 0 }
      await saveState()
      return sendJson(response, 200, { ok: true, auth: current.auth, connected: false })
    }
    let user
    try {
      user = await fetchUser(token)
    } catch (error) {
      const current = await ensureState()
      current.auth = { login: '', avatarUrl: '', source: '', scopes: '', at: 0 }
      await saveState()
      return sendJson(response, 200, {
        ok: true,
        connected: false,
        auth: current.auth,
        message: `Token 已失效：${messageOf(error)}`,
      })
    }
    const current = await ensureState()
    current.auth = { login: user.login, avatarUrl: user.avatarUrl, source, scopes: user.scopes, at: Date.now() }
    await saveState()
    return sendJson(response, 200, { ok: true, connected: true, auth: current.auth })
  }

  async function handleGithubInit(request, response) {
    const body = await readJsonBody(request)
    const component = await componentAt(body.dir)
    return withLock(component.dir, async () => {
      const result = await gitInit(component.dir)
      inspectCache.clear()
      if (result.created) {
        pushRecord({ kind: 'git-init', dir: component.dir, name: component.name, title: '已初始化 Git 仓库', detail: result.root })
        await saveState()
      }
      const refreshed = await inspectFull(component.dir)
      return sendJson(response, 200, {
        ok: true,
        created: result.created,
        entry: refreshed.entry,
        checks: refreshed.checks,
        summary: summarizeChecks(refreshed.checks),
        component: summarize(refreshed.info.dir, refreshed.info, await ensureState()),
      })
    })
  }

  /**
   * Commit every change and push the current branch. Returns the same shape for
   * both callers so the panel can report exactly what happened.
   */
  async function commitAndPush(dir, token, login, message, preferHttp1 = false) {
    const before = await inspectComponentFresh(dir)
    if (!before.git.isRepo) await gitInit(dir)
    const commit = await commitAll(dir, message, login)
    const info = await inspectComponentFresh(dir)
    if (!info.git.remoteUrl) {
      return { committed: commit.committed, commit: commit.commit || '', pushed: false, reason: 'no-remote', info }
    }
    // An HTTPS remote needs the token; without it the push would only wait for
    // a credential prompt that never comes.
    if (!token && /^https:\/\//i.test(info.git.remoteUrl)) {
      return { committed: commit.committed, commit: commit.commit || '', pushed: false, reason: 'no-token', info }
    }
    const branch = info.git.branch || 'main'
    const push = await pushBranch(dir, token, branch, preferHttp1)
    inspectCache.clear()
    return { committed: commit.committed, commit: commit.commit || '', pushed: push.ok, push, branch, info }
  }

  async function handleGithubCreateRepo(request, response) {
    const body = await readJsonBody(request)
    const component = await componentAt(body.dir)
    const current = await ensureState()
    const { token } = await requireToken()
    const user = await fetchUser(token)
    const login = user.login
    return withLock(component.dir, async () => {
      const info = await inspectComponent(component.dir)
      const draft = effectiveEntry(info, current.entries[component.dir], await githubFacts(info, token, 'dsh-credentials'), current)
      const requestedName = cleanText(body.name, 100) || draft.computed.repoName || defaultRepoName(info)
      const description = cleanText(body.description, 200) || info.pkgDescription
      const isPrivate = body.private === true
      const { repo, created } = await ensureRepo({ token, login, dir: component.dir, name: requestedName, description, isPrivate })
      current.entries[component.dir] = sanitizeEntry({
        ...(current.entries[component.dir] || {}),
        repoName: requestedName,
        repoPrivate: isPrivate,
      })
      await saveState()
      await setRemote(component.dir, `${repo.htmlUrl}.git`)
      clearGhCache()
      pushRecord({
        kind: created ? 'repo-create' : 'repo-attach',
        dir: component.dir,
        name: component.name,
        title: created ? '已创建 GitHub 仓库' : '已绑定现有仓库',
        detail: repo.fullName,
        url: repo.htmlUrl,
      })
      await saveState()

      let result = null
      if (body.push !== false) {
        result = await commitAndPush(component.dir, token, login, cleanText(body.message, 200) || draft.commitMessage, current.entries[component.dir]?.pushHttp1 === true)
        if (result.pushed && result.push && result.push.transport === 'http1.1') {
          current.entries[component.dir] = sanitizeEntry({ ...(current.entries[component.dir] || {}), pushHttp1: true })
        }
        pushRecord({
          kind: 'git-push',
          status: result.pushed ? 'ok' : 'fail',
          dir: component.dir,
          name: component.name,
          title: result.pushed ? '已提交并推送首版代码' : '提交完成但推送失败',
          detail: result.pushed
            ? `${result.commit ? `提交 ${result.commit} · ` : ''}${result.branch}${result.push && result.push.transport === 'http1.1' ? ' · HTTP/1.1' : ''}`
            : result.reason === 'no-remote'
              ? '还没有远程仓库'
              : result.push.hint || result.push.error,
          url: repo.htmlUrl,
        })
        await saveState()
      }

      const refreshed = await inspectFull(component.dir)
      return sendJson(response, 200, {
        ok: true,
        created,
        repo,
        push: result ? { committed: result.committed, commit: result.commit, pushed: result.pushed, reason: result.reason || '', hint: result.push?.hint || '', error: result.push?.error || '' } : null,
        entry: refreshed.entry,
        checks: refreshed.checks,
        summary: summarizeChecks(refreshed.checks),
        github: refreshed.github,
        component: summarize(refreshed.info.dir, refreshed.info, await ensureState()),
      })
    })
  }

  async function handleGithubCommit(request, response) {
    const body = await readJsonBody(request)
    const component = await componentAt(body.dir)
    const current = await ensureState()
    const { token } = await readToken()
    let login = ''
    if (token) {
      try {
        login = (await fetchUser(token)).login
      } catch {
        // A stale token must not block a purely local commit.
        login = ''
      }
    }
    return withLock(component.dir, async () => {
      const info = await inspectComponent(component.dir)
      const entry = effectiveEntry(info, current.entries[component.dir], null, current)
      const message = cleanText(body.message, 200) || entry.commitMessage
      const result = await commitAndPush(component.dir, token, login, message, current.entries[component.dir]?.pushHttp1 === true)
      if (result.reason === 'no-remote' || result.reason === 'no-token') {
        pushRecord({
          kind: 'git-commit',
          status: 'ok',
          dir: component.dir,
          name: component.name,
          title: '已提交到本地',
          detail: result.reason === 'no-token' ? '还没有连接 GitHub，推送被跳过。' : '还没有远程仓库。',
        })
        await saveState()
        const refreshed = await inspectFull(component.dir)
        return sendJson(response, 200, {
          ok: true,
          committed: result.committed,
          commit: result.commit,
          pushed: false,
          reason: result.reason,
          message: result.reason === 'no-token'
            ? (result.committed
                ? '已提交到本地。连接 GitHub Token 后再点一次「提交并推送」就会推上去。'
                : '没有需要提交的改动；连接 GitHub Token 后即可推送。')
            : (result.committed
                ? '已提交到本地，但还没有远程仓库：先创建 GitHub 仓库再推送。'
                : '没有需要提交的改动：先创建 GitHub 仓库再推送。'),
          entry: refreshed.entry,
          checks: refreshed.checks,
          summary: summarizeChecks(refreshed.checks),
          component: summarize(refreshed.info.dir, refreshed.info, await ensureState()),
        })
      }
      if (result.pushed && result.push && result.push.transport === 'http1.1') {
        current.entries[component.dir] = sanitizeEntry({ ...(current.entries[component.dir] || {}), pushHttp1: true })
      }
      pushRecord({
        kind: 'git-push',
        status: result.pushed ? 'ok' : 'fail',
        dir: component.dir,
        name: component.name,
        title: result.pushed ? '已提交并推送' : '推送失败',
        detail: result.pushed
          ? `${result.commit ? `提交 ${result.commit} · ` : ''}${result.branch}${result.push && result.push.transport === 'http1.1' ? ' · HTTP/1.1' : ''}`
          : result.push.hint || result.push.error,
        url: result.info.git.httpsUrl,
      })
      await saveState()
      if (!result.pushed) {
        const refreshed = await inspectFull(component.dir)
        return sendJson(response, 502, {
          ok: false,
          committed: result.committed,
          push: result.push,
          entry: refreshed.entry,
          checks: refreshed.checks,
          summary: summarizeChecks(refreshed.checks),
          message: `推送失败：${result.push.hint || result.push.error}`,
        })
      }
      const refreshed = await inspectFull(component.dir)
      return sendJson(response, 200, {
        ok: true,
        committed: result.committed,
        commit: result.commit,
        pushed: true,
        push: result.push,
        entry: refreshed.entry,
        checks: refreshed.checks,
        summary: summarizeChecks(refreshed.checks),
        component: summarize(refreshed.info.dir, refreshed.info, await ensureState()),
      })
    })
  }

  async function inspectComponentFresh(dir) {
    inspectCache.delete(dir)
    return inspectComponent(dir)
  }

  async function handleGithubTopic(request, response) {
    const body = await readJsonBody(request)
    const component = await componentAt(body.dir)
    const { token } = await requireToken()
    return withLock(component.dir, async () => {
      const info = await inspectComponent(component.dir)
      const repoRef = repoRefOf(info)
      if (!repoRef.owner || !repoRef.repo) {
        return sendJson(response, 400, { ok: false, message: '还没有 GitHub 仓库，先创建仓库。' })
      }
      const repo = await fetchRepo(token, repoRef.owner, repoRef.repo)
      if (!repo) return sendJson(response, 404, { ok: false, message: 'GitHub 上找不到这个仓库。' })
      const result = await ensureTopic(token, repo)
      pushRecord({
        kind: 'topic',
        dir: component.dir,
        name: component.name,
        title: result.added ? '已添加 dsh-plugin topic' : 'dsh-plugin topic 已存在',
        detail: result.topics.join(', '),
        url: repo.htmlUrl,
      })
      await saveState()
      const refreshed = await inspectFull(component.dir)
      return sendJson(response, 200, {
        ok: true,
        added: result.added,
        topics: result.topics,
        entry: refreshed.entry,
        checks: refreshed.checks,
        summary: summarizeChecks(refreshed.checks),
        github: refreshed.github,
        component: summarize(refreshed.info.dir, refreshed.info, await ensureState()),
      })
    })
  }

  async function handlePrSubmit(request, response) {
    const body = await readJsonBody(request)
    const component = await componentAt(body.dir)
    const current = await ensureState()
    const { token } = await requireToken()
    const user = await fetchUser(token)
    return withLock(component.dir, async () => {
      const info = await inspectComponent(component.dir)
      const github = await githubFacts(info, token, 'dsh-credentials')
      const entry = effectiveEntry(info, current.entries[component.dir], github, current)
      if (!entry.computed.filePath) {
        return sendJson(response, 400, { ok: false, message: '无法生成条目文件：先完成 GitHub 建库与推送。' })
      }
      if (!github.repo) {
        return sendJson(response, 400, { ok: false, message: 'GitHub 上还没有这个仓库，先完成「GitHub 提交」这一轨。' })
      }
      if (github.repo.private) {
        return sendJson(response, 409, {
          ok: false,
          code: 'repo-private',
          message: '仓库是私有的：市场收录要求公开仓库，评审需要读到源码。改完再提交。',
          hint: '在 GitHub 仓库设置里把 Visibility 改成 Public。',
        })
      }
      if (!github.repo.topics.includes(TOPIC)) {
        return sendJson(response, 409, {
          ok: false,
          code: 'repo-no-topic',
          message: '仓库还没有 dsh-plugin topic：官方要求必加，否则收录会被拒。',
          hint: '点「添加 topic」，或者在 GitHub 仓库设置里手工加上 dsh-plugin。',
        })
      }
      if (!CATEGORY_IDS.has(entry.category)) {
        return sendJson(response, 400, { ok: false, message: '请先选择分类。' })
      }
      if (!entry.descriptionEn) {
        return sendJson(response, 400, { ok: false, message: '请先填写英文描述（唯一必填字段）。' })
      }
      // The 1-day floor is checked by CI and cannot be bypassed; opening the PR
      // early only produces a red check, so the plugin waits locally instead.
      if (github.repo && github.repo.ageDays < 1) {
        return sendJson(response, 409, {
          ok: false,
          code: 'repo-too-young',
          message: `官方要求仓库创建满 1 天才能提交收录 PR：仓库创建于 ${formatDateTime(github.repo.createdAt)}，还差约 ${formatHours(1 - github.repo.ageDays)}。到点后再点一次「提交收录 PR」即可。`,
          hint: '这一项由 CI 自动检查，提前提交不会被收录；到时间后重新提交没有任何影响。',
        })
      }
      const result = await openListingPr({ token, login: user.login, entry, info, github })
      current.entries[component.dir] = sanitizeEntry({
        ...(current.entries[component.dir] || {}),
        prNumber: result.pr.number,
        prUrl: result.pr.url,
      })
      pushRecord({
        kind: 'pr-open',
        dir: component.dir,
        name: component.name,
        title: result.pr.number ? `已提交收录 PR #${result.pr.number}` : '已提交收录 PR',
        detail: entry.computed.filePath,
        url: result.pr.url,
      })
      await saveState()
      const refreshed = await inspectFull(component.dir)
      return sendJson(response, 200, {
        ok: true,
        pr: result.pr,
        branch: result.branch,
        file: result.file,
        entry: refreshed.entry,
        checks: refreshed.checks,
        summary: summarizeChecks(refreshed.checks),
        component: summarize(refreshed.info.dir, refreshed.info, await ensureState()),
      })
    })
  }

  async function handlePrStatus(request, response) {
    const body = await readJsonBody(request)
    const { token } = await requireToken()
    const current = await ensureState()
    let number = Number.isFinite(body.number) ? Number(body.number) : 0
    if (!number) {
      const dir = normalizeDir(body.dir)
      if (dir) number = current.entries[dir]?.prNumber || 0
    }
    if (!number) return sendJson(response, 400, { ok: false, message: '还没有记录 PR 编号，先提交一次收录 PR。' })
    const status = await prStatusOf(token, number)
    return sendJson(response, 200, { ok: true, ...status })
  }

  async function handlePrComment(request, response) {
    const body = await readJsonBody(request)
    const { token } = await requireToken()
    const number = Number.isFinite(body.number) ? Number(body.number) : 0
    const text = cleanText(body.body, 4000)
    if (!number || text === '') return sendJson(response, 400, { ok: false, message: '需要 PR 编号和评论内容。' })
    const { data } = await gh(token, 'POST', `${UPSTREAM_API}/issues/${number}/comments`, { body: text })
    const current = await ensureState()
    pushRecord({
      kind: 'pr-comment',
      title: `已在 PR #${number} 留言`,
      detail: text.slice(0, 160),
      url: typeof data?.html_url === 'string' ? data.html_url : '',
    })
    await saveState()
    return sendJson(response, 200, { ok: true, url: typeof data?.html_url === 'string' ? data.html_url : '' })
  }

  async function handleSettings(request, response) {
    const body = await readJsonBody(request)
    const current = await ensureState()
    if (isPlainObject(body.settings)) {
      current.settings = mergeSettings(current.settings, body.settings)
      await saveState()
      discovery = null
    }
    return sendJson(response, 200, { ok: true, settings: current.settings })
  }

  async function handleOpenFolder(request, response) {
    const body = await readJsonBody(request)
    const dir = normalizeDir(body.dir)
    if (!dir) return sendJson(response, 400, { ok: false, message: '缺少目录。' })
    const list = await discover()
    const found = list.components.find((item) => item.dir === dir)
    if (!found) return sendJson(response, 404, { ok: false, message: '目录不在组件清单里。' })
    try {
      await openFolder(found.dir)
      return sendJson(response, 200, { ok: true })
    } catch (error) {
      return sendJson(response, 500, { ok: false, message: `打开文件夹失败：${messageOf(error)}` })
    }
  }

  async function handleClearRecords(request, response) {
    const current = await ensureState()
    current.records = []
    await saveState()
    return sendJson(response, 200, { ok: true, records: [] })
  }

  function commandsFor(info, entry, github) {
    const dir = shellQuote(info.dir)
    const branch = info.git.branch || 'main'
    const repoUrl = entry.computed.repoUrl || 'https://github.com/<owner>/<repo>'
    return {
      git: [
        `git -C ${dir} init -b main`,
        `git -C ${dir} add -A && git -C ${dir} commit -m ${shellQuote(entry.commitMessage)}`,
        `git -C ${dir} remote add origin ${repoUrl}.git`,
        `git -C ${dir} push -u origin ${branch}`,
      ].join('\n'),
      topic: `gh repo edit ${entry.computed.owner}/${entry.computed.repoName} --add-topic ${TOPIC}`,
      entryPath: entry.computed.filePath || `${CATALOG_DIR}/<owner>__<repo>.yml`,
      entryYaml: entry.computed.yaml || '',
      forkUrl: `${UPSTREAM_URL}/fork`,
      newFileUrl: `https://github.com/${UPSTREAM.owner}/${UPSTREAM.repo}/new/main/${CATALOG_DIR}`,
      prUrl: entry.prUrl || '',
      repoNewUrl: 'https://github.com/new',
      topicsUrl: entry.computed.repoUrl ? `${entry.computed.repoUrl}/settings` : 'https://github.com/settings/repositories',
    }
  }

  /* ------------------------------------------------------------------ http */

  async function handler(request, response) {
    let url
    try {
      url = new URL(request.url || '/', 'http://localhost')
    } catch {
      return sendJson(response, 400, { ok: false, message: '请求地址不合法。' })
    }
    const pathname = url.pathname
    if (pathname !== API && !pathname.startsWith(`${API}/`)) {
      return sendJson(response, 404, { ok: false, message: '未知接口。' })
    }
    const route = pathname.slice(API.length) || '/'
    try {
      if (request.method === 'GET' && route === '/overview') {
        return await handleOverview(request, response, url)
      }
      if (request.method !== 'POST') {
        return sendJson(response, 405, { ok: false, message: '只支持 GET /overview 与 POST 接口。' })
      }
      if (!sameOrigin(request) || !isLoopbackRequest(request)) {
        return sendJson(response, 403, { ok: false, message: '只允许本机同源页面访问。' })
      }
      switch (route) {
        case '/inspect':
          return await handleInspect(request, response)
        case '/scan':
          return await handleScan(request, response)
        case '/targets':
          return await handleTargets(request, response)
        case '/entry/save':
          return await handleEntrySave(request, response)
        case '/github/connect':
          return await handleConnect(request, response)
        case '/github/disconnect':
          return await handleDisconnect(request, response)
        case '/github/check':
          return await handleGithubCheck(request, response)
        case '/github/init':
          return await handleGithubInit(request, response)
        case '/github/repo':
          return await handleGithubCreateRepo(request, response)
        case '/github/commit':
          return await handleGithubCommit(request, response)
        case '/github/topics':
          return await handleGithubTopic(request, response)
        case '/pr/submit':
          return await handlePrSubmit(request, response)
        case '/pr/status':
          return await handlePrStatus(request, response)
        case '/pr/comment':
          return await handlePrComment(request, response)
        case '/settings':
          return await handleSettings(request, response)
        case '/open-folder':
          return await handleOpenFolder(request, response)
        case '/records/clear':
          return await handleClearRecords(request, response)
        default:
          return sendJson(response, 404, { ok: false, message: '未知接口。' })
      }
    } catch (error) {
      const status = error && typeof error.status === 'number' ? error.status : 500
      if (status >= 500) ctx.logger?.warn?.(`nanshan-market-publish: ${error && error.stack ? error.stack : String(error)}`)
      return sendJson(response, status, {
        ok: false,
        code: typeof error?.code === 'string' ? error.code : 'error',
        message: messageOf(error),
        hint: error?.github?.hint || error?.hint || '',
      })
    }
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: API, handler }))
}

/* ------------------------------------------------------------------ helpers */

function normalizeDir(value) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (text === '' || !isAbsolute(text)) return ''
  return text
}

function expandHome(value) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (text === '~') return homedir()
  if (text.startsWith('~/')) return join(homedir(), text.slice(2))
  return text
}

function scannableRoot(dir) {
  if (typeof dir !== 'string' || !isAbsolute(dir)) return false
  return !dir.startsWith('/Applications') && !dir.startsWith('/System') && !dir.startsWith('/Library')
}

function isInside(root, target) {
  const rel = relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function latestMtime(paths) {
  let latest = 0
  for (const path of paths) {
    if (!path) continue
    try {
      const info = await stat(path)
      if (info.mtimeMs > latest) latest = info.mtimeMs
    } catch {
      // Missing files simply contribute no timestamp.
    }
  }
  return latest
}

async function readJsonBody(request) {
  return new Promise((resolveBody, reject) => {
    const declared = Number(request.headers['content-length'])
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      reject(httpError(413, '请求内容过大。'))
      request.destroy()
      return
    }
    let size = 0
    const chunks = []
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(httpError(413, '请求内容过大。'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      if (chunks.length === 0) {
        resolveBody({})
        return
      }
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(httpError(400, '请求内容不是合法的 JSON。'))
      }
    })
    request.on('error', (error) => reject(httpError(400, messageOf(error))))
  })
}

function sendJson(response, status, payload) {
  if (response.headersSent) return
  const body = Buffer.from(JSON.stringify(payload), 'utf8')
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(body.length),
    'cache-control': 'no-store',
  })
  response.end(body)
}

function sameOrigin(request) {
  const origin = request.headers.origin
  if (typeof origin !== 'string' || origin === '') return true
  try {
    return new URL(origin).host === request.headers.host
  } catch {
    return false
  }
}

function isLoopbackRequest(request) {
  const address = request.socket && request.socket.remoteAddress
  if (typeof address !== 'string' || address === '') return true
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

async function runGit(cwd, args, options = {}) {
  try {
    const { stdout, stderr } = await promisify(execFile)('git', ['-C', cwd, ...args], {
      timeout: options.timeout ?? 20000,
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        GIT_ASKPASS: '',
        ...(options.env || {}),
      },
    })
    return { ok: true, out: String(stdout || '').trim(), err: String(stderr || '').trim() }
  } catch (error) {
    return {
      ok: false,
      out: String(error?.stdout || '').trim(),
      err: String(error?.stderr || error?.message || '').trim(),
      code: error?.code,
    }
  }
}

async function openFolder(target) {
  const platform = process.platform
  const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'explorer' : 'xdg-open'
  await promisify(execFile)(command, [target], { timeout: 5000, windowsHide: true })
}

function parseBranchHeader(header, snap) {
  if (/^No commits yet on /.test(header)) {
    snap.branch = header.replace(/^No commits yet on /, '').trim()
    return
  }
  if (/^HEAD \(no branch\)/.test(header)) {
    snap.branch = 'HEAD'
    return
  }
  const match = /^(.+?)(?:\.\.\.(\S+))?(?:\s+\[(.+)\])?$/.exec(header)
  if (!match) {
    snap.branch = header.trim()
    return
  }
  snap.branch = match[1] || ''
  if (match[2] && match[2] !== '(gone)') snap.upstream = match[2]
  const flags = match[3] || ''
  if (/gone/.test(flags)) {
    snap.upstream = ''
    snap.ahead = null
    return
  }
  if (snap.upstream) {
    const ahead = /ahead (\d+)/.exec(flags)
    snap.ahead = ahead ? Number(ahead[1]) : 0
  }
}

function normalizeGitUrl(value) {
  const raw = String(value || '').trim()
  if (raw === '') return ''
  if (/^https:\/\//i.test(raw)) return raw.replace(/\.git$/i, '').replace(/\/$/, '')
  const ssh = /^git@([^:]+):(.+)$/.exec(raw)
  if (ssh) return `https://${ssh[1]}/${ssh[2]}`.replace(/\.git$/i, '')
  const schemeless = /^(?:ssh|git):\/\/(?:[^@/]+@)?([^/]+)\/(.+)$/.exec(raw)
  if (schemeless) return `https://${schemeless[1]}/${schemeless[2]}`.replace(/\.git$/i, '')
  if (/^[\w.-]+\.[a-z]{2,}\/\S+$/i.test(raw)) return `https://${raw}`.replace(/\.git$/i, '')
  return raw
}

function parseGithubUrl(value) {
  const url = normalizeGitUrl(value)
  if (url === '') return null
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (!/^(www\.)?github\.com$/i.test(parsed.hostname)) return null
  const segments = parsed.pathname.split('/').filter(Boolean)
  if (segments.length < 2) return null
  const owner = segments[0]
  const repo = segments[1].replace(/\.git$/i, '')
  if (!/^[A-Za-z0-9._-]+$/.test(owner) || !/^[A-Za-z0-9._-]+$/.test(repo)) return null
  return { owner, repo }
}

function repositoryUrlOf(repository) {
  if (typeof repository === 'string') return normalizeGitUrl(repository)
  if (isPlainObject(repository) && typeof repository.url === 'string') return normalizeGitUrl(repository.url)
  return ''
}

function extractPatchName(text) {
  const insert = /^\s*-\s+insert:\s*[\s\S]*?name:\s*['"]?([^'"\s]+)['"]?/m.exec(text)
  if (insert) return insert[1]
  const name = /name:\s*['"]?(@?[^'"\s]+)['"]?/m.exec(text)
  return name ? name[1] : ''
}

function yamlScalar(value, plainAllowed) {
  const text = String(value)
  if (plainAllowed && /^[A-Za-z0-9_./@+~-]+$/.test(text) && !/^[~-]/.test(text) && !text.includes(': ')) return text
  return `'${text.replace(/'/g, "''")}'`
}

function ensureSentence(value, chinese = false) {
  const text = String(value || '').trim().replace(/\s+/g, ' ')
  if (text === '') return ''
  if (/[.。!！?？]$/.test(text)) return text
  return `${text}${chinese ? '。' : '.'}`
}

function validIconUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) return false
  return RASTER_RE.test(url.pathname)
}

function tarballProblem(value, version) {
  let url
  try {
    url = new URL(value)
  } catch {
    return { level: 'fail', message: '不是合法的 URL。' }
  }
  if (url.protocol !== 'https:') return { level: 'fail', message: '必须是 https 链接。' }
  if (url.hostname.toLowerCase() !== 'github.com') return { level: 'fail', message: '必须是 github.com 的 Release 附件。' }
  const path = url.pathname
  const pinned = /\/releases\/download\/[^/]+\/[^/]+\.tgz$/i.test(path)
  const latest = /\/releases\/latest\/download\/[^/]+\.tgz$/i.test(path)
  if (!pinned && !latest) {
    return { level: 'fail', message: '需要指向某个 Release 的 .tgz 附件（/releases/download/ 或 /releases/latest/download/）。' }
  }
  if (latest && version && path.includes(version)) {
    return {
      level: 'warn',
      message: '`latest/download/` 只解析 latest，文件名按字面取；资产名带版本号会在下次发版后 404。',
    }
  }
  return null
}

function asLocale(pair) {
  return { zh: String(pair[0] || ''), en: String(pair[1] || '') }
}

function pickText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return ''
}

function cleanText(value, limit = MAX_TEXT) {
  if (typeof value !== 'string') return ''
  const text = value.replace(/\u0000/g, '').trim()
  if (text === '') return ''
  return text.slice(0, limit)
}

function clampInt(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function messageOf(error) {
  if (error && typeof error.message === 'string' && error.message !== '') return error.message
  return String(error)
}

function httpError(status, message, code) {
  const error = new Error(message)
  error.status = status
  if (code) error.code = code
  return error
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}

function formatDateTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '—'
  const date = new Date(ms)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDays(days) {
  if (!Number.isFinite(days)) return '—'
  if (days < 1) return `${Math.max(1, Math.round(days * 24))} h`
  return `${Math.floor(days)} d`
}

function formatHours(days) {
  if (!Number.isFinite(days) || days <= 0) return '0 h'
  const hours = days * 24
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`
  return `${Math.round(hours * 10) / 10} h`
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
