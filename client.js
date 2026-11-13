window.__ModuleLoader__.load({
  id: '@wangnanshan/dsh-nanshan-market-publish',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'nanshan-market-publish'
    const API = '/api/nanshan-market-publish'
    const PANEL_ID = 'nanshan-market-publish'
    const DOC_URL = 'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md'
    const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=public_repo&description=DSH%20market%20publish'

    let localeService = null
    let runtimeCtx = null

    /* ------------------------------------------------------------- locale */

    const DICTIONARIES = {
      zh: {
        'nav.title': '【南山】DSH插件市场发布助手',
        'page.eyebrow': 'DSH · 插件市场发布',
        'page.title': '【南山】DSH插件市场发布助手',
        'page.subtitle': '扫描本机正在开发的 DSH 组件，按官方 contributing.md 的要求分两条轨道：把代码提交到 GitHub，再申请市场收录 PR。两条轨道各有独立的进度与按钮。',
        'page.doc': '官方 contributing.md',
        'tabs.label': '面板页签',
        'tab.components': '组件清单',
        'tab.guide': '发布引导',
        'tab.records': '发布记录',
        'tab.settings': '设置',
        'auth.connected': '已连接',
        'auth.envToken': '已连接（环境变量 Token）',
        'auth.notConnected': '未连接',
        'auth.connect': '连接 GitHub',
        'auth.disconnect': '断开',
        'auth.revalidate': '重新验证',
        'auth.scopes': '权限范围',
        'auth.tokenSource': '来源',
        'auth.none': '未连接',
        'auth.required': '这一步需要先连接 GitHub',
        'action.refresh': '刷新',
        'action.scan': '扫描本机组件',
        'action.add': '选择文件夹',
        'action.openFolder': '打开文件夹',
        'action.openGithub': '在 GitHub 打开',
        'action.save': '保存',
        'action.saving': '保存中…',
        'action.close': '关闭',
        'action.cancel': '取消',
        'action.confirm': '确认',
        'action.retry': '重试',
        'action.copy': '复制',
        'action.copied': '已复制',
        'action.clear': '清空',
        'action.open': '打开',
        'action.back': '返回组件清单',
        'action.next': '下一步',
        'action.goto': '去处理',
        'list.search': '搜索组件名、路径或描述',
        'list.empty.title': '还没有发现 DSH 组件',
        'list.empty.hint': '本机档案里用 link 安装的组件会被自动发现；其他目录用「添加文件夹」加入清单。',
        'list.scanned': '已扫描 {n} 个目录',
        'list.warnings': '{n} 条提示',
        'list.count': '{n} 个组件',
        'list.searchEmpty.title': '没有匹配的组件',
        'list.searchEmpty.hint': '换个关键词试试。',
        'list.remove': '从清单移除',
        'card.clientOnly': '仅 dsh.client',
        'card.bundle': 'dsh.bundle',
        'card.github': 'GitHub',
        'card.noGithub': '未提交 GitHub',
        'card.commits': '{n} 次提交',
        'card.dirty': '{n} 项未提交',
        'card.listed': '已提 PR #{n}',
        'card.open': '打开发布向导',
        'card.version': 'v{v}',
        'card.noIcon': '无图标',
        'card.updated': '更新于 {time}',
        'detail.progress.github': 'GitHub 提交',
        'detail.progress.pr': '市场收录',
        'detail.progress.count': '{pass}/{total} 项通过',
        'detail.path': '本地路径',
        'detail.next': '下一步',
        'detail.done': '这一轨已完成',
        'detail.loading': '正在读取组件…',
        'gh.card.title': '第 1 步 · 提交到 GitHub',
        'gh.card.hint': '把本地组件变成一个公开的 GitHub 仓库：初始化、建库、推送、加 topic。',
        'gh.form.repo': '仓库名',
        'gh.form.repoHint': '默认用包名去掉作用域，例如 nanshan-market-publish。',
        'gh.form.visibility': '可见性',
        'gh.form.public': '公开',
        'gh.form.private': '私有',
        'gh.form.privateHint': '市场只收录公开仓库：私有仓库会在预检里被拦下。',
        'gh.form.message': '提交说明',
        'gh.form.messageHint': '第一次推送和后续提交都用它作为 commit message。',
        'gh.btn.init': '初始化仓库',
        'gh.btn.create': '创建并推送',
        'gh.btn.commit': '提交并推送',
        'gh.btn.topic': '添加 topic',
        'gh.state.local': '本地仓库',
        'gh.state.remote': '远程仓库',
        'gh.state.topic': 'topic',
        'gh.state.yes': '已就绪',
        'gh.state.no': '待完成',
        'gh.hint.needLocal': '先在本地初始化仓库',
        'gh.hint.needToken': '先连接 GitHub',
        'gh.hint.needRemote': '先创建并推送 GitHub 仓库',
        'gh.noToken': '连接 GitHub 后可以建库、加 topic 和开 PR；本地提交不需要 Token。',
        'pr.card.title': '第 2 步 · 申请市场收录 PR',
        'pr.card.hint': '写一条 data/plugins/<owner>__<repo>.yml，fork 官方列表仓库并开 PR。',
        'pr.form.category': '分类',
        'pr.form.categoryHint': '选最接近的一项；选不准时维护者会直接改，不会打回。',
        'pr.form.descEn': '英文描述',
        'pr.form.descEnHint': '一句话说明它做什么，以句号结尾，不带营销词。',
        'pr.form.descZh': '中文描述（可选）',
        'pr.form.descZhHint': '留空由维护者补，不影响收录。',
        'pr.form.advanced': '可选展示信息',
        'pr.form.icon': '卡片图标 URL',
        'pr.form.iconHint': '必须是 GitHub 托管的 https 位图（png / jpg / webp）。',
        'pr.form.tarball': '预构建包 tarball URL',
        'pr.form.tarballHint': 'GitHub Release 上的 .tgz；不发 npm 时推荐填。',
        'pr.btn.save': '保存条目',
        'pr.btn.submit': '提交收录 PR',
        'pr.btn.refresh': '刷新 PR 状态',
        'pr.btn.comment': '发表评论',
        'pr.file': '条目文件',
        'pr.preview': '文件预览',
        'pr.previewEmpty': '连接 GitHub 并完成建库后，这里会显示将要提交的 YAML。',
        'pr.previewHint': '改了条目后点「保存条目」，预览与提交内容会一起更新。',
        'pr.removeFromList': '从清单移除',
        'pr.submitHint': '提交前会先保存条目；PR 由你自己的 GitHub 账号开出。',
        'pr.status.title': 'PR 状态',
        'pr.status.state': '状态',
        'pr.status.checks': 'CI 检查',
        'pr.status.labels': '标签',
        'pr.status.comments': '最近评论',
        'pr.status.mergeable': '可合并',
        'pr.status.none': '还没有 PR。完成上面的步骤后点「提交收录 PR」。',
        'pr.status.checksNone': '还没有检查结果，或刚推送还在排队。',
        'pr.status.open': '打开 PR',
        'pr.comment.placeholder': '给维护者留一条说明，例如「已按要求修改描述」',
        'pr.comment.sent': '评论已发出',
        'pr.comment.empty': '先写一条评论',
        'pr.heldHint': '维护者要求修改：改完推同一个分支，再留一条评论即可，不需要重开 PR。',
        'pr.merged': '已合并',
        'pr.draft': '草稿',
        'pr.closed': '已关闭',
        'pr.entryCount': '本 PR 只加 1 条条目',
        'checks.title': '官方要求预检',
        'checks.pass': '通过',
        'checks.warn': '建议',
        'checks.fail': '待处理',
        'checks.fix': '怎么改',
        'checks.doc': '依据',
        'step.auth': '连接 GitHub',
        'step.auth.desc': 'Token 只保存在本机 DSH 凭据服务里，用于建库、加 topic 和开 PR。',
        'step.git': '初始化本地仓库',
        'step.git.desc': '组件目录还不是 Git 仓库时，先初始化 main 分支。',
        'step.repo': '创建 GitHub 仓库并推送',
        'step.repo.desc': '建一个公开仓库，把代码提交后推上去。',
        'step.push': '同步最新提交',
        'step.push.desc': '本地有未推送的提交时，再推一次让远程与本地一致。',
        'step.topic': '添加 dsh-plugin topic',
        'step.topic.desc': '生态靠这个 topic 发现插件，官方要求必加。',
        'step.entry': '填写收录条目',
        'step.entry.desc': '分类和英文描述是硬性要求；中文描述可选。',
        'step.pr': '提交收录 PR',
        'step.pr.desc': '把 YAML 写到 fork 的 data/plugins/ 下并开 PR，然后等维护者评审。',
        'guide.title': '傻瓜式引导',
        'guide.subtitle': '两条轨道各有独立的进度和按钮：可以先把代码推到 GitHub，之后再回来补收录 PR。收录 PR 需要仓库已公开、带 dsh-plugin topic，且创建满 1 天。',
        'guide.pick': '先选一个组件',
        'guide.pickHint': '从「组件清单」页选一个组件，或者直接在下面点一个。',
        'guide.next': '下一步',
        'guide.allDone': '这一轮都完成了',
        'guide.allDoneHint': 'PR 已提交，剩下的就是等维护者评审。CI 通过是前置条件，不是结论。',
        'guide.jump': '查看详情',
        'guide.status.done': '完成',
        'guide.status.todo': '待办',
        'guide.status.attention': '建议检查',
        'guide.stepOf': '第 {n} 步',
        'records.title': '发布记录',
        'records.subtitle': '建库、推送、topic、PR 与评论都会记在这里，方便回溯。',
        'records.empty': '还没有记录。完成一次建库或 PR 就会出现在这里。',
        'records.clear': '清空记录',
        'records.cleared': '记录已清空',
        'record.git-init': '初始化 Git 仓库',
        'record.git-commit': '本地提交',
        'record.repo-create': '创建 GitHub 仓库',
        'record.repo-attach': '绑定已有仓库',
        'record.git-push': '提交并推送',
        'record.topic': '添加 topic',
        'record.pr-open': '提交收录 PR',
        'record.pr-comment': 'PR 评论',
        'record.connect': '连接 GitHub',
        'record.disconnect': '断开 GitHub',
        'record.event': '操作',
        'settings.title': '设置',
        'settings.github': 'GitHub 连接',
        'settings.githubHint': '需要一个 classic Token 并勾选 public_repo（或 repo）。Token 写入 DSH 凭据服务，不会出现在页面或状态文件里。',
        'settings.token': 'GitHub Token',
        'settings.tokenPlaceholder': 'ghp_... 或 github_pat_...',
        'settings.tokenCreate': '去创建 Token',
        'settings.tokenPrivacy': 'Token 只在本机使用：建库、加 topic、写 fork 分支、开 PR。',
        'settings.connect': '连接并验证',
        'settings.connecting': '验证中…',
        'settings.connectedAs': '已连接 {login}',
        'settings.envToken': '已通过环境变量连接',
        'settings.source': '来源 {source}',
        'settings.scopes': 'Token 权限：{scopes}',
        'settings.noScopes': 'fine-grained Token 不报告权限范围，能通过验证即可用。',
        'settings.scanRoots': '扫描目录',
        'settings.scanRootsHint': '添加后会递归扫描（最多 4 层）找 DSH 组件；本机档案里 link 安装的组件始终自动发现。',
        'settings.addRoot': '添加扫描目录',
        'settings.noRoots': '还没有自定义扫描目录。',
        'settings.pickRoot': '选择扫描目录',
        'settings.depth': '扫描深度',
        'settings.depthHint': '1 层最快；目录结构深时调到 3。',
        'settings.depthValue': '{n} 层',
        'settings.about': '数据与隐私',
        'settings.aboutBody': '状态保存在 ~/.dsh/nanshan-market-publish/state.json；Token 在 DSH 凭据服务里。插件只读取你选择的组件目录，不会执行组件代码，也不会把你的数据发到 GitHub 以外的地方。',
        'settings.records': '本地记录',
        'settings.saved': '设置已保存',
        'settings.disconnectHint': '断开只删除本机保存的 Token，不影响 GitHub 上的仓库和 PR。',
        'dialog.add.title': '手动添加组件文件夹',
        'dialog.add.hint': '系统选择器不可用时才会出现在这里：填组件的绝对路径（package.json 里要有 dsh.bundle 或 dsh.client）。在访达里选中文件夹按 ⌘⌥C 可以复制路径。',
        'dialog.add.path': '文件夹路径',
        'dialog.add.example': '例如 /Users/you/code/my-dsh-plugin',
        'dialog.add.confirm': '加入清单',
        'dialog.add.adding': '校验中…',
        'dialog.add.bad': '请填写绝对路径（以 / 开头）。',
        'dialog.remove.title': '从清单移除',
        'dialog.remove.body': '移除「{name}」只会让它不出现在清单里，不会删除本地文件，也不影响已开的 PR。',
        'dialog.scan.title': '这个文件夹不是单个组件',
        'dialog.scan.body': '「{path}」里没有带 dsh.bundle / dsh.client 的 package.json。要把它作为扫描目录，递归找下面的组件吗？',
        'dialog.scan.confirm': '扫描这个目录',
        'dialog.clear.title': '清空发布记录',
        'dialog.clear.body': '只清空本机的操作记录，GitHub 上的仓库和 PR 不受影响。',
        'toast.scanned': '扫描完成',
        'toast.added': '已加入清单',
        'toast.already': '这个组件已经在清单里了',
        'error.pick': '系统文件夹选择器不可用，改为手工输入路径。',
        'toast.removed': '已移除',
        'toast.inited': '已初始化 Git 仓库',
        'toast.saved': '条目已保存',
        'toast.settingsSaved': '设置已保存',
        'toast.connected': '已连接 GitHub',
        'toast.disconnected': '已断开',
        'toast.created': '仓库已创建并推送',
        'toast.pushed': '已推送',
        'toast.topic': 'topic 已就绪',
        'toast.pr': 'PR 已提交',
        'toast.opened': '已在访达中打开',
        'error.generic': '操作失败',
        'error.load': '加载失败',
        'error.detail': '读取组件失败',
        'error.noToken': '还没有连接 GitHub：先在「设置」里填入 Token。',
        'server.token-missing': '还没有连接 GitHub：先在「设置」里填入 Token。',
        'server.no-credentials': '当前档案没有可用的凭据服务，无法保存 Token。',
        'server.not-listed': '这个目录不在组件清单里：先在「组件清单」页添加它。',
        'server.bad-dir': '需要一个存在的绝对目录路径。',
        'server.not-component': '这个目录不是 DSH 组件（package.json 缺少 dsh.bundle / dsh.client）。',
        'server.repo-too-young': '仓库创建不满 1 天：官方要求满 1 天后才能提交收录 PR。',
        'server.repo-private': '仓库是私有的：市场只收录公开仓库。',
        'server.repo-no-topic': '仓库还缺 dsh-plugin topic。',
        'server.file-exists': '条目文件已存在，可能已经收录过，或维护者已有同名条目。',
        'server.fork-pending': 'Fork 还没就绪，稍等几秒再试。',
        'server.repo-taken': '这个仓库名已被其他账号占用。',
        'server.bad-repo-name': '仓库名只能包含字母、数字、点、下划线和连字符。',
        'server.network': '连不上 GitHub API：检查网络或代理后重试。',
        'server.token-invalid': 'Token 无效或已过期，请重新连接。',
        'server.github': 'GitHub 拒绝了这次请求，详见下方的状态与说明。',
        'server.repo-create': 'GitHub 没有返回仓库信息，请重试。',
        'server.git-init': 'Git 仓库初始化失败。',
        'server.git-commit': 'Git 提交失败。',
        'server.git-add': 'Git 暂存失败。',
        'server.git-remote': '设置远程仓库失败。',

        'rules.title': '官方收录要求（contributing.md）',
        'rules.bundle': 'package.json 必须声明 dsh.bundle；只写 dsh.client 无法安装，是最常见的被拒原因。',
        'rules.age': '仓库创建满 1 天，CI 自动检查；不够就等几小时，重新提交没有影响。',
        'rules.topic': '仓库要加 dsh-plugin topic。',
        'rules.code': '仓库里要有真实可用的代码，占位或纯 README 仓库不收。',
        'rules.desc': '描述只说功能、不带营销词，并且必须与代码相符。',
        'rules.category': '分类选最贴近实际功能的一项。',
        'rules.file': '一个 PR 只提交一个文件：data/plugins/<owner>__<repo>.yml。',
        'rules.count': '一个 PR 最多 3 条条目；本插件每次只提交 1 条。',
        'rules.icon': '卡片图标可选，必须是 GitHub 托管的位图。',
        'rules.review': 'CI 通过只是前置条件，维护者会读代码；需要修改时会被打上 held: author。',
        'rules.link': '阅读完整指南',
        'common.loading': '加载中…',
        'common.optional': '可选',
        'common.none': '—',
        'common.close': '关闭',
      },
      en: {
        'nav.title': 'Nanshan DSH Market Publish Assistant',
        'page.eyebrow': 'DSH · Market publish',
        'page.title': 'Nanshan DSH Market Publish Assistant',
        'page.subtitle': 'Scans DSH components under development on this machine and follows the official contributing.md in two tracks: push the code to GitHub, then open the market listing PR. Each track has its own progress and buttons.',
        'page.doc': 'Official contributing.md',
        'tabs.label': 'Panel sections',
        'tab.components': 'Component list',
        'tab.guide': 'Publish guide',
        'tab.records': 'Publish history',
        'tab.settings': 'Settings',
        'auth.connected': 'Connected',
        'auth.envToken': 'Connected (env token)',
        'auth.notConnected': 'Not connected',
        'auth.connect': 'Connect GitHub',
        'auth.disconnect': 'Disconnect',
        'auth.revalidate': 'Re-check',
        'auth.scopes': 'Scopes',
        'auth.tokenSource': 'Source',
        'auth.none': 'Not connected',
        'auth.required': 'Connect GitHub first',
        'action.refresh': 'Refresh',
        'action.scan': 'Scan components',
        'action.add': 'Choose folder',
        'action.openFolder': 'Open folder',
        'action.openGithub': 'Open on GitHub',
        'action.save': 'Save',
        'action.saving': 'Saving…',
        'action.close': 'Close',
        'action.cancel': 'Cancel',
        'action.confirm': 'Confirm',
        'action.retry': 'Retry',
        'action.copy': 'Copy',
        'action.copied': 'Copied',
        'action.clear': 'Clear',
        'action.open': 'Open',
        'action.back': 'Back to components',
        'action.next': 'Next',
        'action.goto': 'Open',
        'list.search': 'Search name, path or description',
        'list.empty.title': 'No DSH components found yet',
        'list.empty.hint': 'Components linked into this profile are discovered automatically; add other directories with Add folder.',
        'list.scanned': 'Scanned {n} directories',
        'list.warnings': '{n} notes',
        'list.count': '{n} components',
        'list.searchEmpty.title': 'No matching components',
        'list.searchEmpty.hint': 'Try another keyword.',
        'list.remove': 'Remove from list',
        'card.clientOnly': 'dsh.client only',
        'card.bundle': 'dsh.bundle',
        'card.github': 'GitHub',
        'card.noGithub': 'No GitHub repository',
        'card.commits': '{n} commits',
        'card.dirty': '{n} uncommitted',
        'card.listed': 'PR #{n}',
        'card.open': 'Open publish wizard',
        'card.version': 'v{v}',
        'card.noIcon': 'No icon',
        'card.updated': 'Updated {time}',
        'detail.progress.github': 'GitHub',
        'detail.progress.pr': 'Listing',
        'detail.progress.count': '{pass}/{total} checks pass',
        'detail.path': 'Local path',
        'detail.next': 'Next step',
        'detail.done': 'This track is done',
        'detail.loading': 'Reading component…',
        'gh.card.title': 'Step 1 · Submit to GitHub',
        'gh.card.hint': 'Turn the local component into a public GitHub repository: initialise, create, push, add the topic.',
        'gh.form.repo': 'Repository name',
        'gh.form.repoHint': 'Defaults to the package name without its scope, for example nanshan-market-publish.',
        'gh.form.visibility': 'Visibility',
        'gh.form.public': 'Public',
        'gh.form.private': 'Private',
        'gh.form.privateHint': 'The market lists public repositories only; a private one is blocked by the checks.',
        'gh.form.message': 'Commit message',
        'gh.form.messageHint': 'Used for the first push and for later commits.',
        'gh.btn.init': 'Initialize repository',
        'gh.btn.create': 'Create and push',
        'gh.btn.commit': 'Commit and push',
        'gh.btn.topic': 'Add topic',
        'gh.state.local': 'Local repository',
        'gh.state.remote': 'Remote repository',
        'gh.state.topic': 'Topic',
        'gh.state.yes': 'Ready',
        'gh.state.no': 'Pending',
        'gh.hint.needLocal': 'Initialize the repository first',
        'gh.hint.needToken': 'Connect GitHub first',
        'gh.hint.needRemote': 'Create and push the GitHub repository first',
        'gh.noToken': 'Connecting GitHub enables repository creation, topics and PRs; a local commit needs no token.',
        'pr.card.title': 'Step 2 · Open the listing PR',
        'pr.card.hint': 'Write one data/plugins/<owner>__<repo>.yml, fork the catalogue repository and open the PR.',
        'pr.form.category': 'Category',
        'pr.form.categoryHint': 'Pick the closest fit; a maintainer changes a near miss instead of bouncing it.',
        'pr.form.descEn': 'English description',
        'pr.form.descEnHint': 'One sentence about what it does, ending with a period, no marketing wording.',
        'pr.form.descZh': 'Chinese description (optional)',
        'pr.form.descZhHint': 'Leave it empty and a maintainer fills it in; it never blocks a submission.',
        'pr.form.advanced': 'Optional storefront fields',
        'pr.form.icon': 'Card icon URL',
        'pr.form.iconHint': 'A GitHub-hosted https raster image (png / jpg / webp).',
        'pr.form.tarball': 'Prebuilt tarball URL',
        'pr.form.tarballHint': 'A .tgz on a GitHub Release; recommended when you do not publish to npm.',
        'pr.btn.save': 'Save entry',
        'pr.btn.submit': 'Open listing PR',
        'pr.btn.refresh': 'Refresh PR status',
        'pr.btn.comment': 'Post comment',
        'pr.file': 'Entry file',
        'pr.preview': 'File preview',
        'pr.previewEmpty': 'Connect GitHub and create the repository, then the YAML to submit appears here.',
        'pr.previewHint': 'Press Save entry after editing; the preview and the submission both follow it.',
        'pr.removeFromList': 'Remove from list',
        'pr.submitHint': 'The entry is saved first; the PR is opened under your own GitHub account.',
        'pr.status.title': 'PR status',
        'pr.status.state': 'State',
        'pr.status.checks': 'CI checks',
        'pr.status.labels': 'Labels',
        'pr.status.comments': 'Recent comments',
        'pr.status.mergeable': 'Mergeable',
        'pr.status.none': 'No PR yet. Finish the steps above, then press Open listing PR.',
        'pr.status.checksNone': 'No check runs yet, or the push is still queued.',
        'pr.status.open': 'Open PR',
        'pr.comment.placeholder': 'Leave one note for the maintainer, e.g. “description updated as asked”',
        'pr.comment.sent': 'Comment posted',
        'pr.comment.empty': 'Write a comment first',
        'pr.heldHint': 'A maintainer asked for changes: push to the same branch, then leave one comment. No new PR needed.',
        'pr.merged': 'Merged',
        'pr.draft': 'Draft',
        'pr.closed': 'Closed',
        'pr.entryCount': 'One entry per PR',
        'checks.title': 'Official checks',
        'checks.pass': 'Pass',
        'checks.warn': 'Advice',
        'checks.fail': 'To do',
        'checks.fix': 'How to fix',
        'checks.doc': 'Source',
        'step.auth': 'Connect GitHub',
        'step.auth.desc': 'The token stays in the local DSH credentials service and is used to create the repository, add the topic and open the PR.',
        'step.git': 'Initialize the local repository',
        'step.git.desc': 'When the folder is not a Git repository yet, initialise it on main.',
        'step.repo': 'Create the GitHub repository and push',
        'step.repo.desc': 'Create a public repository, commit the code and push it.',
        'step.push': 'Sync the latest commits',
        'step.push.desc': 'Push again when local commits are ahead of the remote.',
        'step.topic': 'Add the dsh-plugin topic',
        'step.topic.desc': 'The ecosystem discovers plugins by this topic; the guide requires it.',
        'step.entry': 'Fill in the listing entry',
        'step.entry.desc': 'Category and English description are mandatory; the Chinese one is optional.',
        'step.pr': 'Open the listing PR',
        'step.pr.desc': 'Write the YAML under data/plugins/ in your fork, open the PR, then wait for review.',
        'guide.title': 'Guided flow',
        'guide.subtitle': 'Each track has its own progress and buttons: push the code to GitHub first, then come back for the listing PR whenever you like. The PR needs a public repository with the dsh-plugin topic, at least one day old.',
        'guide.pick': 'Pick a component first',
        'guide.pickHint': 'Select one on the Component list tab, or pick one below.',
        'guide.next': 'Next step',
        'guide.allDone': 'This round is complete',
        'guide.allDoneHint': 'The PR is open; what remains is maintainer review. A green CI run is a precondition, not the decision.',
        'guide.jump': 'Open details',
        'guide.status.done': 'Done',
        'guide.status.todo': 'To do',
        'guide.status.attention': 'Check',
        'guide.stepOf': 'Step {n}',
        'records.title': 'History',
        'records.subtitle': 'Repository creation, pushes, topic, PRs and comments are recorded here.',
        'records.empty': 'Nothing recorded yet. Create a repository or open a PR and it shows up here.',
        'records.clear': 'Clear history',
        'records.cleared': 'History cleared',
        'record.git-init': 'Initialised Git repository',
        'record.git-commit': 'Local commit',
        'record.repo-create': 'Created GitHub repository',
        'record.repo-attach': 'Attached existing repository',
        'record.git-push': 'Commit and push',
        'record.topic': 'Added topic',
        'record.pr-open': 'Opened listing PR',
        'record.pr-comment': 'PR comment',
        'record.connect': 'Connected GitHub',
        'record.disconnect': 'Disconnected GitHub',
        'record.event': 'Action',
        'settings.title': 'Settings',
        'settings.github': 'GitHub connection',
        'settings.githubHint': 'A classic token with public_repo (or repo) is required. The token is written to the DSH credentials service and never appears in the page or the state file.',
        'settings.token': 'GitHub token',
        'settings.tokenPlaceholder': 'ghp_... or github_pat_...',
        'settings.tokenCreate': 'Create a token',
        'settings.tokenPrivacy': 'The token is used only on this machine: create the repository, add the topic, write the fork branch, open the PR.',
        'settings.connect': 'Connect and verify',
        'settings.connecting': 'Verifying…',
        'settings.connectedAs': 'Connected as {login}',
        'settings.envToken': 'Connected through an environment variable',
        'settings.source': 'Source {source}',
        'settings.scopes': 'Token scopes: {scopes}',
        'settings.noScopes': 'Fine-grained tokens do not report scopes; a successful verification is enough.',
        'settings.scanRoots': 'Scan roots',
        'settings.scanRootsHint': 'Each root is scanned recursively (up to 4 levels) for DSH components; components linked into the profile are always discovered.',
        'settings.addRoot': 'Add scan root',
        'settings.noRoots': 'No custom scan roots yet.',
        'settings.pickRoot': 'Choose a scan root',
        'settings.depth': 'Scan depth',
        'settings.depthHint': 'One level is fastest; raise it for deeper folder trees.',
        'settings.depthValue': '{n} levels',
        'settings.about': 'Data and privacy',
        'settings.aboutBody': 'State lives in ~/.dsh/nanshan-market-publish/state.json; the token lives in the DSH credentials service. The plugin only reads the component folders you choose, never executes their code, and sends nothing anywhere except GitHub.',
        'settings.records': 'Local history',
        'settings.saved': 'Settings saved',
        'settings.disconnectHint': 'Disconnecting deletes only the locally stored token; repositories and PRs on GitHub are untouched.',
        'dialog.add.title': 'Add a component folder manually',
        'dialog.add.hint': 'This dialog appears only when the system picker is unavailable. Enter the absolute path of a component whose package.json declares dsh.bundle or dsh.client; in Finder, select the folder and press ⌘⌥C to copy the path.',
        'dialog.add.path': 'Folder path',
        'dialog.add.example': 'For example /Users/you/code/my-dsh-plugin',
        'dialog.add.confirm': 'Add to list',
        'dialog.add.adding': 'Verifying…',
        'dialog.add.bad': 'Enter an absolute path starting with /.',
        'dialog.remove.title': 'Remove from list',
        'dialog.remove.body': 'Removing “{name}” only hides it from this list. Local files are untouched and open PRs are unaffected.',
        'dialog.scan.title': 'This folder is not a single component',
        'dialog.scan.body': '“{path}” has no package.json with dsh.bundle / dsh.client. Use it as a scan root and search below it?',
        'dialog.scan.confirm': 'Scan this folder',
        'dialog.clear.title': 'Clear history',
        'dialog.clear.body': 'Only the local history is cleared; repositories and PRs on GitHub are untouched.',
        'toast.scanned': 'Scan finished',
        'toast.added': 'Added to the list',
        'toast.already': 'That component is already in the list',
        'error.pick': 'The system folder picker is unavailable; enter the path manually.',
        'toast.removed': 'Removed',
        'toast.inited': 'Git repository initialized',
        'toast.saved': 'Entry saved',
        'toast.settingsSaved': 'Settings saved',
        'toast.connected': 'GitHub connected',
        'toast.disconnected': 'Disconnected',
        'toast.created': 'Repository created and pushed',
        'toast.pushed': 'Pushed',
        'toast.topic': 'Topic ready',
        'toast.pr': 'PR opened',
        'toast.opened': 'Opened in Finder',
        'error.generic': 'The action failed',
        'error.load': 'Failed to load',
        'error.detail': 'Failed to read the component',
        'error.noToken': 'GitHub is not connected yet. Add a token under Settings.',
        'server.token-missing': 'GitHub is not connected yet. Add a token under Settings.',
        'server.no-credentials': 'This profile has no credential service, so the token cannot be stored.',
        'server.not-listed': 'This folder is not in the component list. Add it on the Component list tab first.',
        'server.bad-dir': 'An existing absolute folder path is required.',
        'server.not-component': 'This folder is not a DSH component (no dsh.bundle / dsh.client in package.json).',
        'server.repo-too-young': 'The repository is younger than 1 day; the guide requires a day before a listing PR.',
        'server.repo-private': 'The repository is private; the market lists public repositories only.',
        'server.repo-no-topic': 'The repository is missing the dsh-plugin topic.',
        'server.file-exists': 'That entry file already exists, so it may already be listed.',
        'server.fork-pending': 'The fork is not ready yet; retry in a few seconds.',
        'server.repo-taken': 'Another account owns that repository name.',
        'server.bad-repo-name': 'Repository names allow only letters, digits, dots, underscores and hyphens.',
        'server.network': 'The GitHub API is unreachable; check the network or proxy and retry.',
        'server.token-invalid': 'The token is invalid or expired; reconnect.',
        'server.github': 'GitHub rejected this request; see the status details below.',
        'server.repo-create': 'GitHub returned no repository information; retry.',
        'server.git-init': 'Initialising the Git repository failed.',
        'server.git-commit': 'The Git commit failed.',
        'server.git-add': 'Staging files failed.',
        'server.git-remote': 'Configuring the remote failed.',

        'rules.title': 'Official requirements (contributing.md)',
        'rules.bundle': 'package.json must declare dsh.bundle; dsh.client alone is not installable and is the most common rejection.',
        'rules.age': 'The repository must be at least 1 day old, checked by CI. Wait a few hours; a resubmission is not held against you.',
        'rules.topic': 'The repository needs the dsh-plugin topic.',
        'rules.code': 'Real working code is required; placeholder and README-only repositories are not listed.',
        'rules.desc': 'The description states what the plugin does, without marketing wording, and must match the code.',
        'rules.category': 'Pick the category closest to what the plugin actually does.',
        'rules.file': 'One PR adds one file: data/plugins/<owner>__<repo>.yml.',
        'rules.count': 'At most 3 entries per PR; this plugin submits exactly one.',
        'rules.icon': 'The optional card icon must be a GitHub-hosted raster image.',
        'rules.review': 'Green CI is a precondition; a maintainer reads the code. Requested changes are labelled held: author.',
        'rules.link': 'Read the full guide',
        'common.loading': 'Loading…',
        'common.optional': 'Optional',
        'common.none': '—',
        'common.close': 'Close',
      },
    }

    function activeLocale() {
      // The locale service may activate after this plugin; resolve it lazily.
      if (!localeService && runtimeCtx && typeof runtimeCtx.get === 'function') {
        try {
          localeService = runtimeCtx.get('locale')
        } catch {
          localeService = null
        }
      }
      if (localeService && typeof localeService.getSnapshot === 'function') {
        const snapshot = localeService.getSnapshot()
        if (snapshot && typeof snapshot.active === 'string' && snapshot.active !== '') return snapshot.active
      }
      if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') return navigator.language
      return 'en'
    }

    function useChinese() {
      const active = activeLocale().toLowerCase()
      if (active.startsWith('zh')) return true
      if (active.startsWith('en')) return false
      return typeof navigator !== 'undefined' && String(navigator.language || '').toLowerCase().startsWith('zh')
    }

    function t(key, values) {
      const chinese = useChinese()
      const primary = chinese ? DICTIONARIES.zh : DICTIONARIES.en
      const fallback = chinese ? DICTIONARIES.en : DICTIONARIES.zh
      let text = primary[key] !== undefined ? primary[key] : fallback[key] !== undefined ? fallback[key] : key
      if (values) {
        for (const name of Object.keys(values)) text = text.split(`{${name}}`).join(String(values[name]))
      }
      return text
    }

    function useLocaleTick() {
      const [, setTick] = React.useState(0)
      React.useEffect(() => {
        if (!localeService || typeof localeService.subscribe !== 'function') return undefined
        return localeService.subscribe(() => setTick((value) => value + 1))
      }, [])
    }

    /** Picks the active language out of a `{ zh, en }` pair from the Host. */
    function lx(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'object') {
        const chinese = useChinese()
        return (chinese ? value.zh || value.en : value.en || value.zh) || ''
      }
      return String(value)
    }

    /* ----------------------------------------------------------------- api */

    async function apiGet(path) {
      const response = await fetch(`${API}${path}`, {
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      })
      return readPayload(response)
    }

    async function apiPost(path, body) {
      const response = await fetch(`${API}${path}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify(body || {}),
      })
      return readPayload(response)
    }

    async function readPayload(response) {
      let payload = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      if (!response.ok || (payload && payload.ok === false)) {
        const message = payload && typeof payload.message === 'string' ? payload.message : `HTTP ${response.status}`
        const error = new Error(message)
        error.payload = payload
        throw error
      }
      return payload
    }

    async function copyText(text) {
      const value = String(text || '')
      if (value === '') return false
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(value)
          return true
        }
      } catch {
        // Fall through to the selection-based path.
      }
      try {
        const area = document.createElement('textarea')
        area.value = value
        area.setAttribute('readonly', 'readonly')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(area)
        return ok
      } catch {
        return false
      }
    }

    /** Prefers a localized sentence for a known server error code. */
    function errorText(error) {
      const payload = error && error.payload
      const code = payload && payload.code
      if (code) {
        const table = useChinese() ? DICTIONARIES.zh : DICTIONARIES.en
        const localized = table[`server.${code}`]
        if (localized && !useChinese()) return localized
      }
      const message = (error && error.message) || t('error.generic')
      return payload && payload.hint ? `${message} ${payload.hint}` : message
    }

    function formatTime(ms) {
      if (!Number.isFinite(ms) || ms <= 0) return '—'
      const date = new Date(ms)
      const pad = (value) => String(value).padStart(2, '0')
      return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    function shortPath(path, limit = 46) {
      const text = String(path || '')
      if (text.length <= limit) return text
      return `…${text.slice(text.length - limit + 1)}`
    }

    /* ---------------------------------------------------------------- icons */

    const ICON_PATHS = {
      search: 'M7.2 12.4a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4Zm3.8-.9 2.9 2.9',
      folder: 'M2.2 5.4c0-.7.5-1.2 1.2-1.2H6l1.3 1.7h5.3c.7 0 1.2.5 1.2 1.2v4.4c0 .7-.5 1.2-1.2 1.2H3.4c-.7 0-1.2-.5-1.2-1.2V5.4Z',
      refresh: 'M13.2 8a5.2 5.2 0 1 1-1.7-3.9M13.4 2.6v2.8h-2.8',
      check: 'm3.4 8.6 2.8 2.8 6-6.8',
      alert: 'M8 2.4 14 13H2L8 2.4Zm0 4.2v3.1m0 2.1v.02',
      close: 'm4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6',
      chevron: 'm6.2 4.2 3.8 3.8-3.8 3.8',
      back: 'M9.6 3.4 5 8l4.6 4.6',
      external: 'M9.4 2.6h4v4M13.4 2.6 7.6 8.4M11.8 9.4v3.1c0 .5-.4 1-1 1H3.6c-.6 0-1-.5-1-1V5.2c0-.6.4-1 1-1h3.1',
      copy: 'M5.8 5.4h7.1v7.1H5.8zM3.4 10.4H2.6V3.3h7.1v.9',
      upload: 'M8 11.2V3M4.6 6.4 8 3l3.4 3.4M2.6 13h10.8',
      tag: 'M2.6 8.3V3h5.3l5.7 5.7-5.3 5.3L2.6 8.3Zm2.5-2.6h.02',
      list: 'M5.4 4h8.2M5.4 8h8.2M5.4 12h8.2M2.6 4h.02M2.6 8h.02M2.6 12h.02',
      settings: 'M8 9.9a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Zm5.2-1.9c0-.3 0-.6-.1-.9l1.3-1-1.3-2.2-1.5.6a4.6 4.6 0 0 0-1.5-.9l-.2-1.6H6.5l-.2 1.6c-.6.2-1.1.5-1.5.9l-1.5-.6L2 6.1l1.3 1c-.1.3-.1.6-.1.9s0 .6.1.9l-1.3 1 1.3 2.2 1.5-.6c.4.4.9.7 1.5.9l.2 1.6h2.4l.2-1.6c.6-.2 1.1-.5 1.5-.9l1.5.6 1.3-2.2-1.3-1c.1-.3.1-.6.1-.9Z',
      clock: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Zm0-8.6V8l2 1.2',
      shield: 'M8 2.2 13 4v4c0 3-2.2 4.8-5 5.8-2.8-1-5-2.8-5-5.8V4l5-1.8Z',
      code: 'M5.6 5.2 2.6 8l3 2.8M10.4 5.2 13.4 8l-3 2.8',
      plus: 'M8 3v10M3 8h10',
      trash: 'M3 5h10M6.2 5V3.4h3.6V5M4.8 5l.6 8h5.2l.6-8',
      sparkle: 'M8 2.4 9.4 6l3.6 1.4L9.4 8.8 8 12.4 6.6 8.8 3 7.4 6.6 6 8 2.4Z',
      arrow: 'M3 8h10M9.4 4.4 13 8l-3.6 3.6',
      info: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Zm0-2.6V7.2M8 5.4v.02',
      lock: 'M4.6 7.4V5.6a3.4 3.4 0 0 1 6.8 0v1.8M3.4 7.4h9.2v6H3.4z',
      github: 'M8 .9a7.1 7.1 0 0 0-2.25 13.84c.36.07.49-.15.49-.34v-1.32c-1.98.43-2.4-.84-2.4-.84-.32-.82-.79-1.04-.79-1.04-.65-.44.05-.43.05-.43.71.05 1.08.73 1.08.73.63 1.08 1.66.77 2.06.59.06-.46.25-.77.45-.95-1.58-.18-3.24-.79-3.24-3.52 0-.78.28-1.41.73-1.91-.07-.18-.32-.9.07-1.88 0 0 .6-.19 1.96.73a6.8 6.8 0 0 1 3.57 0c1.36-.92 1.96-.73 1.96-.73.39.98.14 1.7.07 1.88.45.5.73 1.13.73 1.91 0 2.74-1.66 3.34-3.25 3.52.26.22.48.65.48 1.31v1.94c0 .19.13.41.49.34A7.1 7.1 0 0 0 8 .9Z',
    }

    function Icon(props) {
      const name = props.name || 'info'
      const size = typeof props.size === 'number' ? props.size : 14
      const path = ICON_PATHS[name] || ICON_PATHS.info
      const filled = name === 'github'
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: filled ? 'currentColor' : 'none',
        stroke: filled ? 'none' : 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
        className: `nmp-icon${typeof props.className === 'string' && props.className ? ` ${props.className}` : ''}`,
      }, h('path', { d: path }))
    }

    function Spinner(props) {
      const size = typeof props.size === 'number' ? props.size : 13
      return h('span', { className: 'nmp-spinner', style: { width: size, height: size }, 'aria-hidden': 'true' })
    }

    function BrandMark(props) {
      const size = typeof props?.size === 'number' ? props.size : 16
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 64 64',
        role: 'img',
        'aria-hidden': 'true',
        className: 'nmp-brand',
      },
        h('rect', { x: 2, y: 2, width: 60, height: 60, rx: 15, fill: '#111116' }),
        h('path', { d: 'M22 38.5v5.2c0 1.3 1 2.3 2.3 2.3h15.4c1.3 0 2.3-1 2.3-2.3v-5.2', fill: 'none', stroke: '#8B96FF', strokeWidth: 3.2, strokeLinecap: 'round' }),
        h('path', { d: 'M32 40.5V18.5', stroke: '#FFFFFF', strokeWidth: 3.2, strokeLinecap: 'round' }),
        h('path', { d: 'M25.2 25.3 32 18.5l6.8 6.8', fill: 'none', stroke: '#FFFFFF', strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    /* --------------------------------------------------------------- atoms */

    function Btn(props) {
      const variant = props.variant || 'default'
      const size = props.size || 'md'
      const classes = ['nmp-btn', `nmp-btn--${variant}`]
      if (size === 'sm') classes.push('nmp-btn--sm')
      if (props.block) classes.push('nmp-btn--block')
      return h('button', {
        type: 'button',
        className: classes.join(' '),
        onClick: props.disabled || props.loading ? undefined : props.onClick,
        disabled: Boolean(props.disabled || props.loading),
        title: props.title || undefined,
        'aria-label': props.title || undefined,
      },
        props.loading ? h(Spinner, { size: 12 }) : props.icon ? h(Icon, { name: props.icon, size: size === 'sm' ? 12 : 13 }) : null,
        props.children !== undefined && props.children !== null ? h('span', null, props.children) : null,
      )
    }

    function Chip(props) {
      return h('span', { className: `nmp-chip nmp-chip--${props.tone || 'muted'}` }, props.children)
    }

    function Field(props) {
      return h('label', { className: 'nmp-field' },
        h('span', { className: 'nmp-field__label' },
          props.label,
          props.required ? h('span', { className: 'nmp-field__req' }, '*') : props.optional ? h('span', { className: 'nmp-field__opt' }, t('common.optional')) : null,
        ),
        props.children,
        props.hint ? h('span', { className: 'nmp-field__hint' }, props.hint) : null,
      )
    }

    function Input(props) {
      return h('input', {
        className: 'nmp-input',
        type: props.type || 'text',
        value: props.value || '',
        placeholder: props.placeholder || '',
        spellCheck: false,
        autoComplete: 'off',
        onChange: (event) => props.onChange(event.target.value),
        onKeyDown: props.onKeyDown,
      })
    }

    function Textarea(props) {
      return h('textarea', {
        className: 'nmp-textarea',
        rows: props.rows || 2,
        value: props.value || '',
        placeholder: props.placeholder || '',
        spellCheck: false,
        onChange: (event) => props.onChange(event.target.value),
      })
    }

    function Select(props) {
      return h('select', {
        className: 'nmp-select',
        value: props.value || '',
        onChange: (event) => props.onChange(event.target.value),
      }, props.options.map((option) => h('option', { key: option.value, value: option.value }, option.label)))
    }

    function Segmented(props) {
      return h('div', { className: 'nmp-segmented', role: 'group', 'aria-label': props.label },
        props.options.map((option) => h('button', {
          key: option.value,
          type: 'button',
          className: 'nmp-segmented__item',
          'aria-pressed': String(props.value === option.value),
          onClick: () => props.onChange(option.value),
        }, option.label)),
      )
    }

    function CheckRow(props) {
      const check = props.check
      return h('li', { className: 'nmp-check', 'data-tone': check.level },
        h('span', { className: 'nmp-check__dot', 'aria-hidden': 'true' }),
        h('div', { className: 'nmp-check__body' },
          h('div', { className: 'nmp-check__head' },
            h('span', { className: 'nmp-check__title' }, lx(check.title)),
            h('span', { className: 'nmp-check__level' }, t(`checks.${check.level}`)),
          ),
          check.detail ? h('div', { className: 'nmp-check__detail' }, lx(check.detail)) : null,
          check.fix ? h('div', { className: 'nmp-check__fix' },
            h('span', { className: 'nmp-check__fixlabel' }, t('checks.fix')),
            h('span', null, lx(check.fix)),
          ) : null,
        ),
        check.doc ? h('a', {
          className: 'nmp-check__doc',
          href: check.doc,
          target: '_blank',
          rel: 'noopener noreferrer',
          title: t('checks.doc'),
        }, h(Icon, { name: 'external', size: 12 })) : null,
      )
    }

    function Modal(props) {
      const panelRef = React.useRef(null)
      React.useEffect(() => {
        const panel = panelRef.current
        const previous = document.activeElement
        const focusable = () => {
          if (!panel) return []
          return Array.from(panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'))
        }
        // A child dialog may have focused its own input already; keep that focus.
        if (panel && !panel.contains(document.activeElement) && typeof panel.focus === 'function') panel.focus()
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            props.onClose()
            return
          }
          if (event.key !== 'Tab' || !panel) return
          const list = focusable()
          if (list.length === 0) return
          const first = list[0]
          const last = list[list.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('keydown', onKey)
          if (previous && typeof previous.focus === 'function') previous.focus()
        }
      }, [props.onClose])
      return h('div', {
        className: 'nmp-modal__backdrop',
        onMouseDown: (event) => {
          if (event.target === event.currentTarget) props.onClose()
        },
      },
        h('div', { ref: panelRef, tabIndex: -1, className: 'nmp-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': props.title },
          h('div', { className: 'nmp-modal__head' },
            h('h2', { className: 'nmp-modal__title' }, props.title),
            h('button', { type: 'button', className: 'nmp-iconbtn', onClick: props.onClose, 'aria-label': t('action.close') },
              h(Icon, { name: 'close', size: 14 }),
            ),
          ),
          h('div', { className: 'nmp-modal__body' }, props.children),
          props.footer ? h('div', { className: 'nmp-modal__foot' }, props.footer) : null,
        ),
      )
    }

    function Toast(props) {
      if (!props.toast) return null
      const isError = props.toast.tone === 'error'
      return h('div', {
        className: `nmp-toast${isError ? ' nmp-toast--error' : ''}`,
        role: isError ? 'alert' : 'status',
        'aria-live': isError ? 'assertive' : 'polite',
        'aria-atomic': 'true',
      },
        h(Icon, { name: isError ? 'alert' : 'check', size: 13 }),
        h('span', null, props.toast.message),
      )
    }

    /* ----------------------------------------------------------------- page */

    function AddFolderDialog(props) {
      const [path, setPath] = React.useState(typeof props.initialPath === 'string' ? props.initialPath : '')
      const [error, setError] = React.useState('')
      const inputRef = React.useRef(null)
      React.useEffect(() => {
        if (inputRef.current && typeof inputRef.current.focus === 'function') inputRef.current.focus()
      }, [])
      const submit = async () => {
        const value = path.trim()
        if (value === '' || !value.startsWith('/')) {
          setError(t('dialog.add.bad'))
          return
        }
        setError('')
        const result = await props.onSubmit(value)
        if (result && result.ok === false) setError(result.message || t('error.generic'))
      }
      return h(Modal, {
        title: t('dialog.add.title'),
        onClose: props.onClose,
        footer: h('div', { className: 'nmp-modal__actions' },
          h(Btn, { onClick: props.onClose }, t('action.cancel')),
          h(Btn, { variant: 'primary', icon: 'plus', onClick: submit, loading: props.busy, disabled: path.trim() === '' }, t('dialog.add.confirm')),
        ),
      },
        h('p', { className: 'nmp-modal__text' }, t('dialog.add.hint')),
        h('label', { className: 'nmp-field' },
          h('span', { className: 'nmp-field__label' }, t('dialog.add.path')),
          h('input', {
            ref: inputRef,
            className: 'nmp-input',
            value: path,
            placeholder: t('dialog.add.example'),
            spellCheck: false,
            onChange: (event) => {
              setPath(event.target.value)
              setError('')
            },
            onKeyDown: (event) => {
              if (event.key === 'Enter') submit()
            },
          }),
        ),
        error ? h('div', { className: 'nmp-modal__error' }, error) : null,
      )
    }

    function Page() {
      useLocaleTick()

      const [tab, setTab] = React.useState('components')
      const [overview, setOverview] = React.useState(null)
      const [loading, setLoading] = React.useState(true)
      const [loadError, setLoadError] = React.useState('')
      const [query, setQuery] = React.useState('')
      const [selected, setSelected] = React.useState('')
      const [detail, setDetail] = React.useState(null)
      const [detailLoading, setDetailLoading] = React.useState(false)
      const [detailError, setDetailError] = React.useState('')
      const [busy, setBusy] = React.useState('')
      const [toast, setToast] = React.useState(null)
      const [dialog, setDialog] = React.useState(null)
      const [prStatus, setPrStatus] = React.useState(null)
      const [prError, setPrError] = React.useState('')
      const [comment, setComment] = React.useState('')
      const [form, setForm] = React.useState(null)
      const [repoForm, setRepoForm] = React.useState(null)
      const [settingsForm, setSettingsForm] = React.useState(null)
      const [tokenInput, setTokenInput] = React.useState('')
      const [showAdvanced, setShowAdvanced] = React.useState(false)
      const [copied, setCopied] = React.useState('')
      const [newRoot, setNewRoot] = React.useState('')

      /* ------------------------------------------------------------- effects */

      React.useEffect(() => {
        let cancelled = false
        ;(async () => {
          try {
            const payload = await apiGet('/overview')
            if (cancelled) return
            setOverview(payload)
            setSettingsForm({
              scanRoots: payload.settings.scanRoots || [],
              maxScanDepth: payload.settings.maxScanDepth || 2,
            })
            setLoadError('')
          } catch (error) {
            if (!cancelled) setLoadError(error.message || t('error.load'))
          } finally {
            if (!cancelled) setLoading(false)
          }
        })()
        return () => {
          cancelled = true
        }
      }, [])

      React.useEffect(() => {
        if (!toast) return undefined
        const timer = setTimeout(() => setToast(null), toast.tone === 'error' ? 7000 : 3600)
        return () => clearTimeout(timer)
      }, [toast])

      React.useEffect(() => {
        if (!selected) {
          setDetail(null)
          return undefined
        }
        let cancelled = false
        // Clear the previous component before the round trip: otherwise its
        // checks and repository would be actionable under the new header.
        setDetail(null)
        setForm(null)
        setRepoForm(null)
        setPrStatus(null)
        setPrError('')
        setDetailError('')
        setDetailLoading(true)
        ;(async () => {
          try {
            const payload = await apiPost('/inspect', { dir: selected })
            if (cancelled) return
            setDetail(payload)
            setDetailError('')
            applyEntryForm(payload.entry)
          } catch (error) {
            if (!cancelled) setDetailError(errorText(error))
          } finally {
            if (!cancelled) setDetailLoading(false)
          }
        })()
        return () => {
          cancelled = true
        }
      }, [selected])

      React.useEffect(() => {
        if (!selected || !detail) return
        if (detail.entry?.prNumber) refreshPrStatus(true)
      }, [detail?.entry?.prNumber])

      /* ------------------------------------------------------------ helpers */

      function notify(message, tone) {
        if (!message) return
        setToast({ message, tone: tone || 'ok' })
      }

      function applyEntryForm(entry) {
        if (!entry) return
        setForm({
          category: entry.category || '',
          descriptionEn: entry.descriptionEn || '',
          descriptionZh: entry.descriptionZh || '',
          iconUrl: entry.iconUrl || '',
          tarball: entry.tarball || '',
          repoPrivate: entry.repoPrivate === true,
        })
        setRepoForm({
          name: entry.computed?.repoName || entry.repoName || '',
          message: entry.commitMessage || '',
          private: entry.repoPrivate === true,
        })
      }

      function applyDetailPayload(payload) {
        if (!payload) return
        if (payload.checks) {
          setDetail((current) => (current ? { ...current, ...payload } : current))
        }
        if (payload.component) {
          setOverview((current) => {
            if (!current) return current
            return {
              ...current,
              components: current.components.map((item) => (item.dir === payload.component.dir ? { ...item, ...payload.component } : item)),
            }
          })
        }
        if (payload.github) {
          setDetail((current) => (current ? { ...current, github: payload.github } : current))
        }
      }

      async function run(key, fn, success, options = {}) {
        if (busy) return null
        setBusy(key)
        try {
          const payload = await fn()
          if (options.refreshOverview) await loadOverview(true)
          if (payload) applyDetailPayload(payload)
          if (success) notify(success)
          return payload
        } catch (error) {
          notify(errorText(error), 'error')
          if (error?.payload?.checks) applyDetailPayload(error.payload)
          return null
        } finally {
          setBusy('')
        }
      }

      async function loadOverview(force) {
        try {
          const payload = force ? await apiPost('/scan', {}) : await apiGet('/overview')
          setOverview(payload)
          setLoadError('')
          if (selected && !payload.components.some((item) => item.dir === selected)) setSelected('')
          return payload
        } catch (error) {
          setLoadError(error.message || t('error.load'))
          return null
        }
      }

      async function openComponent(dir, nextTab) {
        setSelected(dir)
        setTab(nextTab || 'components')
        setDetailError('')
        setDetailLoading(true)
      }

      async function refreshPrStatus(silent, number) {
        const current = freshDetail()
        if (!current) return
        const dir = current.component.dir
        const num = number || current.entry?.prNumber || 0
        if (!dir || !num) return
        if (!silent) setBusy('pr-status')
        try {
          const payload = await apiPost('/pr/status', { dir, number: num })
          setPrStatus(payload)
          setPrError('')
        } catch (error) {
          setPrStatus(null)
          setPrError(errorText(error))
          if (!silent) notify(errorText(error), 'error')
        } finally {
          if (!silent) setBusy('')
        }
      }

      /* ------------------------------------------------------------ actions */

      async function doScan() {
        setBusy('scan')
        try {
          const payload = await apiPost('/scan', {})
          setOverview(payload)
          setLoadError('')
          notify(t('toast.scanned'))
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function doAddFolder(path) {
        setBusy('add')
        try {
          const payload = await apiPost('/targets', { add: [path] })
          setOverview(payload)
          setDialog(null)
          const resolved = Array.isArray(payload.resolved) ? payload.resolved : []
          const added = Array.isArray(payload.added) ? payload.added : []
          if (resolved.length > 0) openComponent(resolved[0])
          else if (added.length > 0) openComponent(added[0])
          notify(added.length > 0 || resolved.length === 0 ? t('toast.added') : t('toast.already'))
          return { ok: true }
        } catch (error) {
          notify(errorText(error), 'error')
          return { ok: false, code: error?.payload?.code || '', message: errorText(error) }
        } finally {
          setBusy('')
        }
      }

      /** Resolve a client service lazily: it may register after this plugin. */
      function remoteService(name) {
        if (!runtimeCtx || typeof runtimeCtx.get !== 'function') return null
        try {
          return runtimeCtx.get(name) || null
        } catch {
          return null
        }
      }

      /**
       * Open the Host's native folder chooser. The status tells callers whether
       * to fall back to the manual path dialog.
       */
      /** The client Remote namespace exposing `pick()`, in either shape. */
      function directoryPickerService() {
        const direct = remoteService('remote.directoryPicker')
        if (direct && typeof direct.pick === 'function') return direct
        const remote = remoteService('remote')
        if (remote && remote.directoryPicker && typeof remote.directoryPicker.pick === 'function') return remote.directoryPicker
        return null
      }

      async function chooseFolder() {
        const picker = directoryPickerService()
        if (!picker) return { status: 'unavailable' }
        setBusy('pick')
        try {
          const result = await picker.pick()
          if (!result || result.ok !== true) {
            const message = result && result.error && result.error.message ? result.error.message : t('error.pick')
            notify(message, 'error')
            return { status: 'failed' }
          }
          if (!result.value) return { status: 'cancelled' }
          return { status: 'picked', path: result.value }
        } catch (error) {
          notify(errorText(error), 'error')
          return { status: 'failed' }
        } finally {
          setBusy('')
        }
      }

      /** Toolbar action: pick a folder, then add it to the component list. */
      async function pickComponentFolder() {
        const picked = await chooseFolder()
        if (picked.status === 'unavailable' || picked.status === 'failed') {
          setDialog({ kind: 'add' })
          return
        }
        if (picked.status !== 'picked') return
        const result = await doAddFolder(picked.path)
        if (result.ok) return
        if (result.code === 'not-component') setDialog({ kind: 'scan', dir: picked.path })
        else setDialog({ kind: 'add', initialPath: picked.path })
      }

      /** Settings action: pick a folder and store it as a scan root. */
      async function pickScanRoot() {
        const picked = await chooseFolder()
        if (picked.status === 'unavailable' || picked.status === 'failed') {
          notify(t('error.pick'), 'error')
          return
        }
        if (picked.status !== 'picked') return
        const settings = settingsForm || overview?.settings || { scanRoots: [], maxScanDepth: 2 }
        await doSaveSettings({ ...settings, scanRoots: [...(settings.scanRoots || []), picked.path] })
      }

      async function doRemoveTarget(dir) {
        setDialog(null)
        setBusy('remove')
        try {
          const payload = await apiPost('/targets', { remove: [dir] })
          setOverview(payload)
          if (selected === dir) setSelected('')
          notify(t('toast.removed'))
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function doSaveEntry(silent) {
        if (!freshDetail() || !form) return null
        const payload = await run('entry-save', () => apiPost('/entry/save', { dir: detail.component.dir, entry: form }), silent ? null : t('toast.saved'))
        if (payload && payload.entry) applyEntryForm(payload.entry)
        return payload
      }

      async function doInitRepo() {
        if (!freshDetail()) return
        const payload = await run('init', () => apiPost('/github/init', { dir: detail.component.dir }), null, { refreshOverview: true })
        if (payload && payload.created) notify(t('toast.inited'))
      }

      async function doCreateRepo() {
        if (!freshDetail() || !repoForm) return
        const payload = await run('repo', () => apiPost('/github/repo', {
          dir: detail.component.dir,
          name: repoForm.name,
          private: repoForm.private,
          message: repoForm.message,
        }), null, { refreshOverview: true })
        if (!payload) return
        if (payload.push && payload.push.pushed === false && payload.push.reason !== 'no-remote') {
          notify(payload.push.hint || payload.push.error || t('error.generic'), 'error')
          return
        }
        notify(t('toast.created'))
      }

      async function doCommitPush() {
        if (!freshDetail() || !repoForm) return
        const payload = await run('commit', () => apiPost('/github/commit', { dir: detail.component.dir, message: repoForm.message }), null, { refreshOverview: true })
        if (!payload) return
        if (payload.pushed) notify(t('toast.pushed'))
        else notify(payload.message || t('error.generic'), payload.reason === 'no-token' || payload.reason === 'no-remote' ? 'ok' : 'error')
      }

      async function doAddTopic() {
        if (!freshDetail()) return
        await run('topic', () => apiPost('/github/topics', { dir: detail.component.dir }), t('toast.topic'), { refreshOverview: true })
      }

      async function doSubmitPr() {
        if (!freshDetail()) return
        if (form) {
          try {
            await apiPost('/entry/save', { dir: detail.component.dir, entry: form })
          } catch (error) {
            notify(errorText(error), 'error')
            return
          }
        }
        const payload = await run('pr', () => apiPost('/pr/submit', { dir: detail.component.dir }), t('toast.pr'), { refreshOverview: true })
        if (payload) {
          setPrStatus(null)
          await refreshPrStatus(true, payload.entry?.prNumber)
        }
      }

      async function doCommentPr() {
        if (!freshDetail() || !detail.entry?.prNumber || comment.trim() === '') return
        await run('comment', () => apiPost('/pr/comment', { number: detail.entry.prNumber, body: comment }), t('pr.comment.sent'))
        setComment('')
        await refreshPrStatus(true)
      }

      async function doConnect() {
        if (tokenInput.trim() === '') return
        setBusy('connect')
        try {
          const payload = await apiPost('/github/connect', { token: tokenInput.trim() })
          setTokenInput('')
          setOverview((current) => (current ? { ...current, auth: payload.auth } : current))
          notify(t('toast.connected'))
          await loadOverview(true)
          if (selected) await reopenDetail()
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function reopenDetail() {
        if (!selected) return
        setDetailError('')
        setDetailLoading(true)
        try {
          const payload = await apiPost('/inspect', { dir: selected })
          setDetail(payload)
          applyEntryForm(payload.entry)
        } catch (error) {
          setDetailError(errorText(error))
        } finally {
          setDetailLoading(false)
        }
      }

      async function doDisconnect() {
        setBusy('disconnect')
        try {
          const payload = await apiPost('/github/disconnect', {})
          setOverview((current) => (current ? { ...current, auth: payload.auth } : current))
          notify(t('toast.disconnected'))
          setPrStatus(null)
          if (selected) await reopenDetail()
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function doRevalidate() {
        setBusy('revalidate')
        try {
          const payload = await apiPost('/github/check', {})
          setOverview((current) => (current ? { ...current, auth: payload.auth } : current))
          if (payload.connected) {
            notify(t('toast.connected'))
            if (selected) await reopenDetail()
          } else {
            notify(payload.message || t('auth.none'), 'error')
          }
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function doSaveSettings(nextSettings) {
        const merged = {
          scanRoots: nextSettings.scanRoots,
          maxScanDepth: nextSettings.maxScanDepth,
        }
        setBusy('settings')
        try {
          const payload = await apiPost('/settings', { settings: merged })
          setSettingsForm({ scanRoots: payload.settings.scanRoots || [], maxScanDepth: payload.settings.maxScanDepth || 2 })
          notify(t('toast.settingsSaved'))
          await loadOverview(true)
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function doClearRecords() {
        setDialog(null)
        setBusy('clear')
        try {
          await apiPost('/records/clear', {})
          setOverview((current) => (current ? { ...current, records: [] } : current))
          notify(t('records.cleared'))
        } catch (error) {
          notify(errorText(error), 'error')
        } finally {
          setBusy('')
        }
      }

      async function doOpenFolder(dir) {
        try {
          await apiPost('/open-folder', { dir })
          notify(t('toast.opened'))
        } catch (error) {
          notify(errorText(error), 'error')
        }
      }

      async function doCopy(key, text) {
        const ok = await copyText(text)
        if (!ok) return
        setCopied(key)
        setTimeout(() => setCopied(''), 1600)
      }

      /* -------------------------------------------------------- derivations */

      const auth = overview?.auth || { login: '' }
      const connected = Boolean(auth.login) || Boolean(overview?.tokenConnected)
      const components = overview?.components || []
      const categories = overview?.categories || []
      const selectedComponent = components.find((item) => item.dir === selected) || null
      const filtered = React.useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (needle === '') return components
        return components.filter((item) => {
          const haystack = [item.name, item.displayZh, item.displayEn, item.dir, item.description, item.repo?.url].filter(Boolean).join(' ').toLowerCase()
          return haystack.includes(needle)
        })
      }, [components, query])

      const checks = detail?.checks || []
      const summary = detail?.summary || { github: { pass: 0, warn: 0, fail: 0, total: 0 }, pr: { pass: 0, warn: 0, fail: 0, total: 0 } }
      const githubChecks = checks.filter((check) => check.track === 'github')
      const prChecks = checks.filter((check) => check.track === 'pr')

      function nextOf(list) {
        const failing = list.find((check) => check.level === 'fail')
        if (failing) return failing
        const warning = list.find((check) => check.level === 'warn' && check.action)
        return warning || null
      }

      const nextGithub = nextOf(githubChecks)
      const nextPr = nextOf(prChecks)

      const guide = buildGuide()

      function buildGuide() {
        const byId = new Map(checks.map((check) => [check.id, check]))
        const levelOf = (ids) => {
          const list = ids.map((id) => byId.get(id)).filter(Boolean)
          if (list.length === 0) return 'todo'
          if (list.some((check) => check.level === 'fail')) return 'todo'
          if (list.some((check) => check.level === 'warn')) return 'attention'
          return 'done'
        }
        return [
          { key: 'auth', title: t('step.auth'), desc: t('step.auth.desc'), status: connected ? 'done' : 'todo', action: 'connect', icon: 'shield' },
          { key: 'git', title: t('step.git'), desc: t('step.git.desc'), status: levelOf(['git-repo']), action: 'init', icon: 'code' },
          { key: 'repo', title: t('step.repo'), desc: t('step.repo.desc'), status: levelOf(['git-commit', 'repo-exists', 'repo-public']), action: 'repo', icon: 'github' },
          { key: 'push', title: t('step.push'), desc: t('step.push.desc'), status: levelOf(['git-pushed', 'git-clean']), action: 'commit', icon: 'upload' },
          { key: 'topic', title: t('step.topic'), desc: t('step.topic.desc'), status: levelOf(['topic']), action: 'topic', icon: 'tag' },
          { key: 'entry', title: t('step.entry'), desc: t('step.entry.desc'), status: levelOf(['entry-category', 'entry-description-en', 'entry-name']), action: 'entry', icon: 'list' },
          { key: 'pr', title: t('step.pr'), desc: t('step.pr.desc'), status: detail?.entry?.prNumber ? 'done' : 'todo', action: 'pr', icon: 'sparkle' },
        ]
      }

      function runGuideAction(action) {
        if (!selected) return
        if (action === 'connect') {
          setTab('settings')
          return
        }
        if (action === 'init') return doInitRepo()
        if (action === 'repo') return doCreateRepo()
        if (action === 'commit') return doCommitPush()
        if (action === 'topic') return doAddTopic()
        if (action === 'entry') {
          setTab('components')
          setShowAdvanced(true)
          return
        }
        if (action === 'pr') return doSubmitPr()
      }

      function stepButtonLabel(action) {
        if (action === 'connect') return t('auth.connect')
        if (action === 'init') return t('gh.btn.init')
        if (action === 'repo') return t('gh.btn.create')
        if (action === 'commit') return t('gh.btn.commit')
        if (action === 'topic') return t('gh.btn.topic')
        if (action === 'entry') return t('action.goto')
        if (action === 'pr') return t('pr.btn.submit')
        return t('action.next')
      }

      function requiresToken(action) {
        return action === 'repo' || action === 'topic' || action === 'pr'
      }

      /** The loaded detail, but only while it belongs to the visible component. */
      function freshDetail() {
        if (!detail || !detail.component || detail.component.dir !== selected) return null
        return detail
      }

      function stepBusyKey(action) {
        if (action === 'init') return 'init'
        if (action === 'repo') return 'repo'
        if (action === 'commit') return 'commit'
        if (action === 'topic') return 'topic'
        if (action === 'pr') return 'pr'
        return ''
      }

      /* -------------------------------------------------------------- render */

      function renderMasthead() {
        return h('header', { className: 'nmp-head' },
          h('div', { className: 'nmp-head__main' },
            h('div', { className: 'nmp-eyebrow' },
              h('span', { className: 'nmp-dot' }),
              t('page.eyebrow'),
            ),
            h('h1', { className: 'nmp-title' },
              h(BrandMark, { size: 26 }),
              t('page.title'),
            ),
            h('p', { className: 'nmp-sub' }, t('page.subtitle')),
            h('div', { className: 'nmp-head__links' },
              h('a', { className: 'nmp-link', href: DOC_URL, target: '_blank', rel: 'noopener noreferrer' },
                h(Icon, { name: 'external', size: 12 }),
                t('page.doc'),
              ),
            ),
          ),
          h('div', { className: 'nmp-head__side' },
            connected
              ? h('div', { className: 'nmp-auth' },
                  auth.avatarUrl
                    ? h('img', { className: 'nmp-auth__avatar', src: auth.avatarUrl, alt: '', loading: 'lazy' })
                    : h('span', { className: 'nmp-auth__avatar nmp-auth__avatar--empty' }, h(Icon, { name: 'github', size: 14 })),
                  h('div', { className: 'nmp-auth__text' },
                    h('span', { className: 'nmp-auth__login' }, auth.login ? `@${auth.login}` : t('auth.envToken')),
                    h('span', { className: 'nmp-auth__state' }, t('auth.connected')),
                  ),
                  h('button', { type: 'button', className: 'nmp-iconbtn', title: t('auth.revalidate'), onClick: doRevalidate, disabled: busy === 'revalidate' },
                    busy === 'revalidate' ? h(Spinner, { size: 12 }) : h(Icon, { name: 'refresh', size: 13 }),
                  ),
                )
              : h(Btn, { variant: 'default', icon: 'github', onClick: () => setTab('settings') }, t('auth.connect')),
            h(Btn, { variant: 'ghost', icon: 'refresh', onClick: () => loadOverview(true), loading: busy === 'scan', title: t('action.refresh') }, t('action.refresh')),
          ),
        )
      }

      function renderTabs() {
        const tabs = [
          { id: 'components', label: t('tab.components'), icon: 'list', count: components.length },
          { id: 'guide', label: t('tab.guide'), icon: 'sparkle' },
          { id: 'records', label: t('tab.records'), icon: 'clock', count: (overview?.records || []).length },
          { id: 'settings', label: t('tab.settings'), icon: 'settings', dot: !connected },
        ]
        const onKeyDown = (event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return
          event.preventDefault()
          const index = tabs.findIndex((item) => item.id === tab)
          let nextIndex = index
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
          else if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length
          else if (event.key === 'Home') nextIndex = 0
          else nextIndex = tabs.length - 1
          setTab(tabs[nextIndex].id)
          const buttons = event.currentTarget.querySelectorAll('[role="tab"]')
          if (buttons[nextIndex] && typeof buttons[nextIndex].focus === 'function') buttons[nextIndex].focus()
        }
        return h('nav', { className: 'nmp-tabbar', role: 'tablist', 'aria-label': t('tabs.label'), onKeyDown },
          tabs.map((item) => h('button', {
            key: item.id,
            id: `nmp-tab-${item.id}`,
            type: 'button',
            role: 'tab',
            'aria-selected': String(tab === item.id),
            'aria-controls': `nmp-panel-${item.id}`,
            tabIndex: tab === item.id ? 0 : -1,
            className: 'nmp-tab',
            onClick: () => setTab(item.id),
          },
            h(Icon, { name: item.icon, size: 13 }),
            h('span', { className: 'nmp-tab__label' }, item.label),
            item.count ? h('span', { className: 'nmp-tab__count' }, String(item.count)) : null,
            item.dot ? h('span', { className: 'nmp-tab__dot', 'aria-hidden': 'true', title: t('auth.notConnected') }) : null,
          )),
        )
      }

      function renderComponentCard(item) {
        const repo = item.repo || {}
        const ghUrl = repo.url || ''
        const listed = item.entry?.prNumber || 0
        return h('article', {
          key: item.dir,
          className: 'nmp-comp',
          onClick: () => openComponent(item.dir),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openComponent(item.dir)
            }
          },
          role: 'button',
          tabIndex: 0,
        },
          h('div', { className: 'nmp-comp__head' },
            item.icon && item.icon.thumb
              ? h('img', { className: 'nmp-comp__icon', src: item.icon.thumb, alt: '' })
              : h('span', { className: 'nmp-comp__icon nmp-comp__icon--empty' }, h(Icon, { name: 'upload', size: 16 })),
            h('div', { className: 'nmp-comp__id' },
              h('div', { className: 'nmp-comp__title' }, lx({ zh: item.displayZh, en: item.displayEn })),
              h('div', { className: 'nmp-comp__pkg' }, item.name),
            ),
            item.version ? h(Chip, { tone: 'muted' }, t('card.version', { v: item.version })) : null,
          ),
          h('div', { className: 'nmp-comp__badges' },
            item.hasBundle
              ? h(Chip, { tone: 'ok' }, item.patchRel ? `dsh.bundle · ${item.patchRel}` : t('card.bundle'))
              : h(Chip, { tone: 'bad' }, t('card.clientOnly')),
            ghUrl ? h(Chip, { tone: 'info' }, repo.owner ? `${repo.owner}/${repo.repo}` : t('card.github')) : h(Chip, { tone: 'warn' }, t('card.noGithub')),
            listed ? h(Chip, { tone: 'ok' }, t('card.listed', { n: listed })) : null,
          ),
          h('div', { className: 'nmp-comp__path', title: item.dir }, shortPath(item.dir, 54)),
          h('div', { className: 'nmp-comp__foot' },
            h('span', { className: 'nmp-comp__meta' },
              item.git.isRepo ? `${item.git.branch || 'main'} · ${t('card.commits', { n: item.git.commitCount })}` : t('common.none'),
              item.git.dirty ? h('span', { className: 'nmp-comp__dirty' }, ` · ${t('card.dirty', { n: item.git.dirty })}`) : null,
            ),
            h('span', { className: 'nmp-comp__go' },
              t('card.open'),
              h(Icon, { name: 'chevron', size: 12 }),
            ),
          ),
        )
      }

      function renderComponents() {
        if (selected) return renderDetail()
        return h('div', null,
          h('div', { className: 'nmp-toolbar' },
            h('div', { className: 'nmp-search' },
              h(Icon, { name: 'search', size: 13 }),
              h('input', {
                type: 'search',
                value: query,
                placeholder: t('list.search'),
                onChange: (event) => setQuery(event.target.value),
                spellCheck: false,
              }),
            ),
            h('div', { className: 'nmp-toolbar__actions' },
              h(Btn, { icon: 'refresh', onClick: doScan, loading: busy === 'scan' }, t('action.scan')),
              h(Btn, { variant: 'primary', icon: 'folder', onClick: pickComponentFolder, loading: busy === 'pick' || busy === 'add' }, t('action.add')),
            ),
          ),
          (overview?.warnings || []).length > 0
            ? h('div', { className: 'nmp-banner' },
                h(Icon, { name: 'info', size: 13 }),
                h('div', { className: 'nmp-banner__body' },
                  (overview.warnings || []).map((item, index) => h('div', { key: index }, lx(item))),
                ),
              )
            : null,
          h('div', { className: 'nmp-listmeta' },
            h('span', null, t('list.count', { n: filtered.length })),
            overview ? h('span', null, t('list.scanned', { n: overview.scanned })) : null,
          ),
          filtered.length === 0
            ? h('div', { className: 'nmp-empty' },
                h('span', { className: 'nmp-empty__icon' }, h(Icon, { name: 'folder', size: 18 })),
                h('div', { className: 'nmp-empty__title' }, query ? t('list.searchEmpty.title') : t('list.empty.title')),
                h('div', { className: 'nmp-empty__hint' }, query ? t('list.searchEmpty.hint') : t('list.empty.hint')),
                query
                  ? null
                  : h(Btn, { variant: 'primary', icon: 'folder', onClick: pickComponentFolder, loading: busy === 'pick' || busy === 'add' }, t('action.add')),
              )
            : h('div', { className: 'nmp-comps' }, filtered.map(renderComponentCard)),
        )
      }

      function renderTrackCard(track) {
        const isGithub = track === 'github'
        const list = isGithub ? githubChecks : prChecks
        const stats = isGithub ? summary.github : summary.pr
        const next = isGithub ? nextGithub : nextPr
        const progress = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0
        return h('section', { className: 'nmp-card' },
          h('div', { className: 'nmp-card__head' },
            h('div', null,
              h('h2', { className: 'nmp-card__title' }, isGithub ? t('gh.card.title') : t('pr.card.title')),
              h('p', { className: 'nmp-card__hint' }, isGithub ? t('gh.card.hint') : t('pr.card.hint')),
            ),
            h('div', { className: 'nmp-card__score' },
              h('span', { className: 'nmp-card__scorenum' }, `${stats.pass}/${stats.total}`),
              h('span', { className: 'nmp-card__scorelabel' }, t('checks.pass')),
            ),
          ),
          h('div', { className: 'nmp-progress', 'data-tone': stats.fail > 0 ? 'bad' : stats.warn > 0 ? 'warn' : 'ok' },
            h('span', { className: 'nmp-progress__bar', style: { width: `${progress}%` } }),
          ),
          next
            ? h('div', { className: 'nmp-next' },
                h('span', { className: 'nmp-next__label' }, t('detail.next')),
                h('span', { className: 'nmp-next__text' }, lx(next.title)),
                h('span', { className: 'nmp-next__fix' }, lx(next.fix || next.detail || { zh: '', en: '' })),
              )
            : h('div', { className: 'nmp-next nmp-next--done' },
                h(Icon, { name: 'check', size: 13 }),
                h('span', null, t('detail.done')),
              ),
          h('div', { className: 'nmp-card__body' }, isGithub ? renderGithubForm() : renderPrForm()),
          h('div', { className: 'nmp-card__body nmp-card__body--checks' },
            h('div', { className: 'nmp-checks__head' }, t('checks.title')),
            h('ul', { className: 'nmp-checks' }, list.map((check) => h(CheckRow, { key: check.id, check }))),
          ),
          !isGithub ? renderPrStatus() : null,
        )
      }

      function renderGithubForm() {
        if (!repoForm) return null
        const git = detail?.detail?.git || {}
        const repo = detail?.github?.repo || null
        const ready = { local: Boolean(git.isRepo), remote: Boolean(git.remoteUrl), topic: Boolean(repo && (repo.topics || []).includes('dsh-plugin')) }
        return h('div', { className: 'nmp-form' },
          connected
            ? null
            : h('div', { className: 'nmp-inline-note' },
                h(Icon, { name: 'lock', size: 12 }),
                h('span', null, t('gh.noToken')),
                h('button', { type: 'button', className: 'nmp-textbtn', onClick: () => setTab('settings') }, t('auth.connect')),
              ),
          h('div', { className: 'nmp-formgrid' },
            h(Field, { label: t('gh.form.repo'), hint: t('gh.form.repoHint') },
              h(Input, {
                value: repoForm.name,
                placeholder: 'nanshan-market-publish',
                onChange: (value) => setRepoForm((current) => ({ ...current, name: value })),
              }),
            ),
            h(Field, { label: t('gh.form.visibility'), hint: repoForm.private ? t('gh.form.privateHint') : '' },
              h(Segmented, {
                label: t('gh.form.visibility'),
                value: repoForm.private ? 'private' : 'public',
                options: [
                  { value: 'public', label: t('gh.form.public') },
                  { value: 'private', label: t('gh.form.private') },
                ],
                onChange: (value) => setRepoForm((current) => ({ ...current, private: value === 'private' })),
              }),
            ),
          ),
          h(Field, { label: t('gh.form.message'), hint: t('gh.form.messageHint') },
            h(Input, {
              value: repoForm.message,
              placeholder: 'chore: prepare plugin for the DSH market',
              onChange: (value) => setRepoForm((current) => ({ ...current, message: value })),
            }),
          ),
          h('div', { className: 'nmp-states' },
            h('span', { className: 'nmp-state', 'data-on': ready.local ? '1' : '0' }, t('gh.state.local')),
            h('span', { className: 'nmp-state', 'data-on': ready.remote ? '1' : '0' }, t('gh.state.remote')),
            h('span', { className: 'nmp-state', 'data-on': ready.topic ? '1' : '0' }, t('gh.state.topic')),
          ),
          h('div', { className: 'nmp-actions' },
            h(Btn, {
              icon: 'code',
              onClick: doInitRepo,
              loading: busy === 'init',
              disabled: ready.local,
              title: ready.local ? t('gh.state.local') : undefined,
            }, t('gh.btn.init')),
            h(Btn, {
              variant: 'primary',
              icon: 'github',
              onClick: doCreateRepo,
              loading: busy === 'repo',
              disabled: !connected,
              title: !connected ? t('gh.hint.needToken') : undefined,
            }, t('gh.btn.create')),
            h(Btn, {
              icon: 'upload',
              onClick: doCommitPush,
              loading: busy === 'commit',
              disabled: !ready.local,
              title: !ready.local ? t('gh.hint.needLocal') : undefined,
            }, t('gh.btn.commit')),
            h(Btn, {
              icon: 'tag',
              onClick: doAddTopic,
              loading: busy === 'topic',
              disabled: !connected || !ready.remote || ready.topic,
              title: ready.topic ? t('gh.state.topic') : !ready.remote ? t('gh.hint.needRemote') : !connected ? t('gh.hint.needToken') : undefined,
            }, t('gh.btn.topic')),
          ),
        )
      }

      function renderPrForm() {
        if (!form) return null
        const entry = detail?.entry || {}
        const computed = entry.computed || {}
        const ageCheck = checks.find((check) => check.id === 'repo-age')
        const tooYoung = Boolean(ageCheck && ageCheck.level === 'fail')
        const repoReadyCheck = checks.find((check) => check.id === 'repo-ready')
        const notReady = Boolean(repoReadyCheck && repoReadyCheck.level === 'fail')
        return h('div', { className: 'nmp-form' },
          h('div', { className: 'nmp-formgrid' },
            h(Field, { label: t('pr.form.category'), hint: t('pr.form.categoryHint'), required: true },
              h(Select, {
                value: form.category,
                options: [{ value: '', label: t('common.none') }].concat(categories.map((item) => ({
                  value: item.id,
                  label: `${useChinese() ? item.zh : item.en} · ${item.id}`,
                }))),
                onChange: (value) => setForm((current) => ({ ...current, category: value })),
              }),
            ),
            h(Field, { label: t('pr.form.icon'), hint: t('pr.form.iconHint') },
              h(Input, {
                value: form.iconUrl,
                placeholder: 'https://raw.githubusercontent.com/.../icon-180.png',
                onChange: (value) => setForm((current) => ({ ...current, iconUrl: value })),
              }),
            ),
          ),
          h(Field, { label: t('pr.form.descEn'), hint: t('pr.form.descEnHint'), required: true },
            h(Textarea, {
              value: form.descriptionEn,
              rows: 2,
              placeholder: 'One line about what the plugin does.',
              onChange: (value) => setForm((current) => ({ ...current, descriptionEn: value })),
            }),
          ),
          h(Field, { label: t('pr.form.descZh'), hint: t('pr.form.descZhHint'), optional: true },
            h(Textarea, {
              value: form.descriptionZh,
              rows: 2,
              placeholder: '一句话描述，以句号结尾。',
              onChange: (value) => setForm((current) => ({ ...current, descriptionZh: value })),
            }),
          ),
          h('button', {
            type: 'button',
            className: 'nmp-disclosure',
            onClick: () => setShowAdvanced((value) => !value),
            'aria-expanded': String(showAdvanced),
          },
            h(Icon, { name: 'chevron', size: 12, className: 'nmp-disclosure__icon' }),
            t('pr.form.advanced'),
          ),
          showAdvanced
            ? h(Field, { label: t('pr.form.tarball'), hint: t('pr.form.tarballHint'), optional: true },
                h(Input, {
                  value: form.tarball,
                  placeholder: 'https://github.com/owner/repo/releases/download/v1.0.0/plugin.tgz',
                  onChange: (value) => setForm((current) => ({ ...current, tarball: value })),
                }),
              )
            : null,
          h('div', { className: 'nmp-actions' },
            h(Btn, { icon: 'check', onClick: () => doSaveEntry(false), loading: busy === 'entry-save' }, t('pr.btn.save')),
            h(Btn, {
              variant: 'primary',
              icon: 'sparkle',
              onClick: doSubmitPr,
              loading: busy === 'pr',
              disabled: !connected || !computed.filePath || tooYoung || notReady,
              title: tooYoung ? lx(ageCheck.detail) : notReady ? lx(repoReadyCheck.detail) : undefined,
            }, t('pr.btn.submit')),
          ),
          tooYoung
            ? h('div', { className: 'nmp-inline-note nmp-inline-note--warn' },
                h(Icon, { name: 'clock', size: 12 }),
                h('span', null, lx(ageCheck.detail)),
              )
            : null,
          h('div', { className: 'nmp-actions__hint' }, t('pr.submitHint')),
          renderEntryPreview(computed),
        )
      }

      function renderEntryPreview(computed) {
        if (!computed || !computed.yaml) {
          return h('div', { className: 'nmp-preview nmp-preview--empty' }, t('pr.previewEmpty'))
        }
        const key = 'entry-yaml'
        return h('div', { className: 'nmp-preview' },
          h('div', { className: 'nmp-preview__head' },
            h('span', { className: 'nmp-preview__path' }, computed.filePath),
            h('button', { type: 'button', className: 'nmp-textbtn', onClick: () => doCopy(key, computed.yaml) },
              h(Icon, { name: copied === key ? 'check' : 'copy', size: 12 }),
              copied === key ? t('action.copied') : t('action.copy'),
            ),
          ),
          h('pre', { className: 'nmp-preview__code' }, computed.yaml),
          h('div', { className: 'nmp-preview__hint' }, t('pr.previewHint')),
        )
      }

      function renderPrStatus() {
        const prNumber = detail?.entry?.prNumber || 0
        if (!prNumber) {
          return h('div', { className: 'nmp-card__body nmp-card__body--muted' }, t('pr.status.none'))
        }
        const pr = prStatus?.pr || null
        const labels = pr?.labels || []
        const held = labels.includes('held: author')
        return h('div', { className: 'nmp-card__body nmp-card__body--status' },
          h('div', { className: 'nmp-status__head' },
            h('div', { className: 'nmp-status__title' },
              `PR #${prNumber}`,
              pr ? h(Chip, {
                tone: pr.merged ? 'ok' : pr.state === 'open' ? 'info' : 'muted',
              }, pr.merged ? t('pr.merged') : pr.state === 'open' ? 'open' : t('pr.closed')) : null,
              held ? h(Chip, { tone: 'warn' }, 'held: author') : null,
            ),
            h('div', { className: 'nmp-status__actions' },
              h(Btn, { size: 'sm', icon: 'refresh', onClick: () => refreshPrStatus(false), loading: busy === 'pr-status' }, t('pr.btn.refresh')),
              h('a', { className: 'nmp-btn nmp-btn--sm nmp-btn--ghost', href: detail.entry.prUrl || `https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/${prNumber}`, target: '_blank', rel: 'noopener noreferrer' },
                h(Icon, { name: 'external', size: 12 }),
                h('span', null, t('pr.status.open')),
              ),
            ),
          ),
          held ? h('div', { className: 'nmp-inline-note nmp-inline-note--warn' },
            h(Icon, { name: 'alert', size: 12 }),
            h('span', null, t('pr.heldHint')),
          ) : null,
          prError ? h('div', { className: 'nmp-inline-note nmp-inline-note--bad' }, prError) : null,
          !prStatus
            ? h('div', { className: 'nmp-status__loading' }, busy === 'pr-status' ? h(Spinner, { size: 12 }) : null, t('common.loading'))
            : null,
          prStatus && pr
            ? h('div', { className: 'nmp-status' },
                h('div', { className: 'nmp-status__row' },
                  h('span', { className: 'nmp-status__label' }, t('pr.status.state')),
                  h('span', null, `${pr.state}${pr.mergeable === false ? ' · ✕' : pr.mergeable ? ' · ✓' : ''}`),
                ),
                h('div', { className: 'nmp-status__row' },
                  h('span', { className: 'nmp-status__label' }, t('pr.status.checks')),
                  h('span', { className: 'nmp-status__checks' },
                    (prStatus.checks.runs || []).length === 0
                      ? t('pr.status.checksNone')
                      : prStatus.checks.runs.map((run) => h('span', {
                          key: `${run.name}-${run.status}`,
                          className: 'nmp-run',
                          'data-tone': run.conclusion === 'success' ? 'ok' : run.conclusion === 'failure' ? 'bad' : 'warn',
                          title: `${run.name} · ${run.status}${run.conclusion ? ` · ${run.conclusion}` : ''}`,
                        }, run.name || 'check')),
                  ),
                ),
                h('div', { className: 'nmp-status__row' },
                  h('span', { className: 'nmp-status__label' }, t('pr.status.labels')),
                  labels.length === 0
                    ? h('span', { className: 'nmp-muted' }, t('common.none'))
                    : h('span', { className: 'nmp-status__labels' }, labels.map((label) => h(Chip, { key: label, tone: label.startsWith('held') ? 'warn' : 'muted' }, label))),
                ),
                (prStatus.files || []).length > 0
                  ? h('div', { className: 'nmp-status__row' },
                      h('span', { className: 'nmp-status__label' }, t('pr.file')),
                      h('span', { className: 'nmp-status__files' },
                        prStatus.files.map((file) => h('code', { key: file.filename, className: 'nmp-mono' }, file.filename)),
                      ),
                    )
                  : null,
              )
            : null,
          (prStatus?.comments || []).length > 0
            ? h('div', { className: 'nmp-comments' },
                h('div', { className: 'nmp-comments__head' }, t('pr.status.comments')),
                prStatus.comments.map((item, index) => h('div', { key: index, className: 'nmp-comment' },
                  h('div', { className: 'nmp-comment__head' },
                    h('strong', null, item.author ? `@${item.author}` : ''),
                    h('span', { className: 'nmp-muted' }, item.at ? ` · ${formatTime(Date.parse(item.at))}` : ''),
                  ),
                  h('div', { className: 'nmp-comment__body' }, item.body),
                )),
              )
            : null,
          h('div', { className: 'nmp-commentbox' },
            h(Textarea, {
              value: comment,
              rows: 2,
              placeholder: t('pr.comment.placeholder'),
              onChange: setComment,
            }),
            h(Btn, {
              size: 'sm',
              icon: 'arrow',
              onClick: doCommentPr,
              loading: busy === 'comment',
              disabled: comment.trim() === '',
              title: comment.trim() === '' ? t('pr.comment.empty') : undefined,
            }, t('pr.btn.comment')),
          ),
        )
      }

      function renderDetail() {
        const item = selectedComponent
        const fresh = Boolean(detail && detail.component && detail.component.dir === selected)
        if (!fresh) {
          return h('div', { className: 'nmp-detail' },
            h('button', { type: 'button', className: 'nmp-textbtn', onClick: () => setSelected('') },
              h(Icon, { name: 'back', size: 12 }),
              t('action.back'),
            ),
            detailError
              ? h('div', { className: 'nmp-banner nmp-banner--bad nmp-banner--stack' },
                  h('div', null, detailError),
                  h(Btn, { size: 'sm', icon: 'refresh', onClick: reopenDetail }, t('action.retry')),
                )
              : h('div', { className: 'nmp-skeleton' },
                  h('div', { className: 'nmp-skeleton__row' }),
                  h('div', { className: 'nmp-skeleton__row' }),
                  h('div', { className: 'nmp-skeleton__row' }),
                ),
          )
        }
        if (!item) {
          return h('div', { className: 'nmp-empty' },
            h('div', { className: 'nmp-empty__title' }, t('error.detail')),
            h('div', { className: 'nmp-empty__hint' }, detailError || ''),
            h(Btn, { onClick: () => setSelected('') }, t('action.back')),
          )
        }
        const computed = detail.entry?.computed || {}
        const git = detail.detail?.git || {}
        const repo = detail.github?.repo || null
        return h('div', { className: 'nmp-detail' },
          h('div', { className: 'nmp-detail__top' },
            h('button', { type: 'button', className: 'nmp-textbtn', onClick: () => setSelected('') },
              h(Icon, { name: 'back', size: 12 }),
              t('action.back'),
            ),
            h('div', { className: 'nmp-detail__actions' },
              h(Btn, { size: 'sm', icon: 'folder', onClick: () => doOpenFolder(item.dir) }, t('action.openFolder')),
              repo
                ? h('a', { className: 'nmp-btn nmp-btn--sm', href: repo.htmlUrl, target: '_blank', rel: 'noopener noreferrer' },
                    h(Icon, { name: 'github', size: 12 }),
                    h('span', null, t('action.openGithub')),
                  )
                : null,
              (overview?.targets || []).includes(item.dir)
                ? h(Btn, { size: 'sm', variant: 'ghost', icon: 'trash', onClick: () => setDialog({ kind: 'remove', dir: item.dir }) }, t('pr.removeFromList'))
                : null,
            ),
          ),
          h('div', { className: 'nmp-detail__head' },
            item.icon && item.icon.thumb
              ? h('img', { className: 'nmp-detail__icon', src: item.icon.thumb, alt: '' })
              : h('span', { className: 'nmp-detail__icon nmp-detail__icon--empty' }, h(Icon, { name: 'upload', size: 20 })),
            h('div', { className: 'nmp-detail__id' },
              h('h2', { className: 'nmp-detail__title' }, lx({ zh: item.displayZh, en: item.displayEn })),
              h('div', { className: 'nmp-detail__pkg' },
                h('code', null, item.name),
                item.version ? h('span', { className: 'nmp-muted' }, ` · v${item.version}`) : null,
              ),
              h('div', { className: 'nmp-detail__path', title: item.dir },
                h(Icon, { name: 'folder', size: 12 }),
                h('span', { className: 'nmp-mono' }, shortPath(item.dir, 64)),
                h('button', { type: 'button', className: 'nmp-textbtn nmp-textbtn--xs', onClick: () => doCopy('path', item.dir) },
                  copied === 'path' ? t('action.copied') : t('action.copy'),
                ),
              ),
            ),
          ),
          h('div', { className: 'nmp-progressbar' },
            h('div', { className: 'nmp-progressbar__item' },
              h('span', { className: 'nmp-progressbar__label' }, t('detail.progress.github')),
              h('span', { className: 'nmp-progressbar__value' }, t('detail.progress.count', { pass: summary.github.pass, total: summary.github.total })),
              h('span', { className: 'nmp-progressbar__track' },
                h('span', { className: 'nmp-progressbar__fill', style: { width: `${summary.github.total ? Math.round((summary.github.pass / summary.github.total) * 100) : 0}%` } }),
              ),
            ),
            h('div', { className: 'nmp-progressbar__item' },
              h('span', { className: 'nmp-progressbar__label' }, t('detail.progress.pr')),
              h('span', { className: 'nmp-progressbar__value' }, t('detail.progress.count', { pass: summary.pr.pass, total: summary.pr.total })),
              h('span', { className: 'nmp-progressbar__track' },
                h('span', { className: 'nmp-progressbar__fill', 'data-tone': 'accent', style: { width: `${summary.pr.total ? Math.round((summary.pr.pass / summary.pr.total) * 100) : 0}%` } }),
              ),
            ),
          ),
          detailError ? h('div', { className: 'nmp-banner nmp-banner--bad' }, detailError) : null,
          h('div', { className: 'nmp-cols' },
            renderTrackCard('github'),
            renderTrackCard('pr'),
          ),
          h('section', { className: 'nmp-card nmp-card--rules' },
            h('div', { className: 'nmp-card__head' },
              h('div', null,
                h('h2', { className: 'nmp-card__title' }, t('rules.title')),
              ),
              h('a', { className: 'nmp-link', href: DOC_URL, target: '_blank', rel: 'noopener noreferrer' },
                t('rules.link'),
                h(Icon, { name: 'external', size: 12 }),
              ),
            ),
            h('ul', { className: 'nmp-rules' },
              ['bundle', 'age', 'topic', 'code', 'desc', 'category', 'file', 'count', 'icon', 'review'].map((key) => h('li', { key }, t(`rules.${key}`))),
            ),
          ),
        )
      }

      function renderGuide() {
        if (components.length === 0) {
          return h('div', { className: 'nmp-empty' },
            h('span', { className: 'nmp-empty__icon' }, h(Icon, { name: 'sparkle', size: 18 })),
            h('div', { className: 'nmp-empty__title' }, t('list.empty.title')),
            h('div', { className: 'nmp-empty__hint' }, t('list.empty.hint')),
            h(Btn, { variant: 'primary', icon: 'folder', onClick: pickComponentFolder, loading: busy === 'pick' || busy === 'add' }, t('action.add')),
          )
        }
        if (!selected) {
          return h('div', { className: 'nmp-card' },
            h('div', { className: 'nmp-card__head' },
              h('div', null,
                h('h2', { className: 'nmp-card__title' }, t('guide.pick')),
                h('p', { className: 'nmp-card__hint' }, t('guide.subtitle')),
              ),
            ),
            h('div', { className: 'nmp-card__body' },
              h('div', { className: 'nmp-picklist' },
                components.map((item) => h('button', {
                  key: item.dir,
                  type: 'button',
                  className: 'nmp-pick',
                  onClick: () => openComponent(item.dir, 'guide'),
                },
                  item.icon && item.icon.thumb
                    ? h('img', { className: 'nmp-pick__icon', src: item.icon.thumb, alt: '' })
                    : h('span', { className: 'nmp-pick__icon nmp-pick__icon--empty' }, h(Icon, { name: 'upload', size: 14 })),
                  h('span', { className: 'nmp-pick__body' },
                    h('span', { className: 'nmp-pick__title' }, lx({ zh: item.displayZh, en: item.displayEn })),
                    h('span', { className: 'nmp-pick__pkg' }, item.name),
                  ),
                  h(Icon, { name: 'chevron', size: 13 }),
                )),
              ),
            ),
          )
        }
        if (!detail || !detail.component || detail.component.dir !== selected) {
          if (detailError) {
            return h('div', { className: 'nmp-card' },
              h('div', { className: 'nmp-card__body' },
                h('div', { className: 'nmp-inline-note nmp-inline-note--bad' }, detailError),
                h('div', { className: 'nmp-actions' },
                  h(Btn, { icon: 'refresh', onClick: reopenDetail }, t('action.retry')),
                  h(Btn, { variant: 'ghost', onClick: () => setSelected('') }, t('action.back')),
                ),
              ),
            )
          }
          return h('div', { className: 'nmp-skeleton' },
            h('div', { className: 'nmp-skeleton__row' }),
            h('div', { className: 'nmp-skeleton__row' }),
          )
        }
        const next = guide.find((step) => step.status !== 'done') || null
        const done = guide.every((step) => step.status === 'done')
        const ageCheck = checks.find((check) => check.id === 'repo-age')
        const blockedReason = next && next.key === 'pr' && ageCheck && ageCheck.level === 'fail' ? lx(ageCheck.detail) : ''
        return h('div', null,
          h('div', { className: 'nmp-guidehead' },
            h('div', null,
              h('div', { className: 'nmp-eyebrow' }, t('guide.title')),
              h('h2', { className: 'nmp-guidehead__title' }, lx({ zh: selectedComponent?.displayZh, en: selectedComponent?.displayEn })),
              h('p', { className: 'nmp-sub' }, t('guide.subtitle')),
            ),
            h('div', { className: 'nmp-guidehead__actions' },
              h(Btn, { size: 'sm', icon: 'list', onClick: () => { setTab('components'); setSelected(selected) } }, t('guide.jump')),
            ),
          ),
          done
            ? h('div', { className: 'nmp-card nmp-card--success' },
                h('div', { className: 'nmp-success' },
                  h('span', { className: 'nmp-success__icon' }, h(Icon, { name: 'check', size: 20 })),
                  h('div', null,
                    h('div', { className: 'nmp-success__title' }, t('guide.allDone')),
                    h('div', { className: 'nmp-success__hint' }, t('guide.allDoneHint')),
                  ),
                  detail.entry?.prUrl
                    ? h('a', { className: 'nmp-btn nmp-btn--primary nmp-btn--sm', href: detail.entry.prUrl, target: '_blank', rel: 'noopener noreferrer' },
                        h(Icon, { name: 'external', size: 12 }),
                        h('span', null, t('pr.status.open')),
                      )
                    : null,
                ),
              )
            : h('div', { className: 'nmp-card nmp-card--next' },
                h('div', { className: 'nmp-guide-next' },
                  h('span', { className: 'nmp-guide-next__label' }, t('guide.next')),
                  h('div', { className: 'nmp-guide-next__title' }, next ? next.title : ''),
                  h('div', { className: 'nmp-guide-next__desc' }, next ? next.desc : ''),
                  blockedReason
                    ? h('div', { className: 'nmp-guide-next__note' },
                        h(Icon, { name: 'clock', size: 12 }),
                        h('span', null, blockedReason),
                      )
                    : null,
                  h(Btn, {
                    variant: 'primary',
                    icon: next && next.icon ? next.icon : 'arrow',
                    onClick: () => next && runGuideAction(next.action),
                    loading: next && busy === stepBusyKey(next.action),
                    disabled: (requiresToken(next && next.action) && !connected) || Boolean(blockedReason),
                    title: blockedReason || undefined,
                  }, next ? stepButtonLabel(next.action) : t('action.next')),
                ),
              ),
          h('ol', { className: 'nmp-steps' },
            guide.map((step, index) => h('li', {
              key: step.key,
              className: 'nmp-step',
              'data-status': step.status,
              'data-current': String(next ? next.key === step.key : false),
            },
              h('span', { className: 'nmp-step__rail', 'aria-hidden': 'true' },
                h('span', { className: 'nmp-step__dot' },
                  step.status === 'done'
                    ? h(Icon, { name: 'check', size: 11 })
                    : h('span', null, String(index + 1)),
                ),
              ),
              h('div', { className: 'nmp-step__body' },
                h('div', { className: 'nmp-step__head' },
                  h('span', { className: 'nmp-step__title' }, step.title),
                  h('span', { className: 'nmp-step__status' }, t(`guide.status.${step.status}`)),
                ),
                h('div', { className: 'nmp-step__desc' }, step.desc),
                step.status === 'done'
                  ? null
                  : h('button', {
                      type: 'button',
                      className: 'nmp-textbtn',
                      onClick: () => runGuideAction(step.action),
                      disabled: requiresToken(step.action) && !connected,
                    }, stepButtonLabel(step.action), h(Icon, { name: 'chevron', size: 11 })),
              ),
            )),
          ),
        )
      }

      function renderRecords() {
        const records = overview?.records || []
        return h('div', null,
          h('div', { className: 'nmp-sectionhead' },
            h('div', null,
              h('h2', { className: 'nmp-sectionhead__title' }, t('records.title')),
              h('p', { className: 'nmp-sub' }, t('records.subtitle')),
            ),
            records.length > 0
              ? h(Btn, { variant: 'ghost', size: 'sm', icon: 'trash', onClick: () => setDialog({ kind: 'clear' }) }, t('records.clear'))
              : null,
          ),
          records.length === 0
            ? h('div', { className: 'nmp-empty' },
                h('span', { className: 'nmp-empty__icon' }, h(Icon, { name: 'clock', size: 18 })),
                h('div', { className: 'nmp-empty__title' }, t('records.empty')),
              )
            : h('ul', { className: 'nmp-records' },
                records.map((record, index) => h('li', { key: index, className: 'nmp-record', 'data-status': record.status },
                  h('span', { className: 'nmp-record__dot' }),
                  h('div', { className: 'nmp-record__body' },
                    h('div', { className: 'nmp-record__head' },
                      h('span', { className: 'nmp-record__title' }, DICTIONARIES[useChinese() ? 'zh' : 'en'][`record.${record.kind}`] || record.title || t('record.event')),
                      h('span', { className: 'nmp-record__time' }, formatTime(record.at)),
                    ),
                    record.detail ? h('div', { className: 'nmp-record__detail' }, record.detail) : null,
                    record.name ? h('div', { className: 'nmp-record__name nmp-mono' }, shortPath(record.name, 60)) : null,
                  ),
                  record.url
                    ? h('a', { className: 'nmp-iconbtn', href: record.url, target: '_blank', rel: 'noopener noreferrer', title: t('action.openGithub') },
                        h(Icon, { name: 'external', size: 13 }),
                      )
                    : null,
                )),
              ),
        )
      }

      function renderSettings() {
        const settings = settingsForm || overview?.settings || { scanRoots: [], maxScanDepth: 2 }
        return h('div', { className: 'nmp-settings' },
          h('section', { className: 'nmp-card' },
            h('div', { className: 'nmp-card__head' },
              h('div', null,
                h('h2', { className: 'nmp-card__title' }, t('settings.github')),
                h('p', { className: 'nmp-card__hint' }, t('settings.githubHint')),
              ),
            ),
            h('div', { className: 'nmp-card__body' },
              connected
                ? h('div', { className: 'nmp-authbox' },
                    h('div', { className: 'nmp-authbox__id' },
                      auth.avatarUrl
                        ? h('img', { className: 'nmp-auth__avatar', src: auth.avatarUrl, alt: '', loading: 'lazy' })
                        : h('span', { className: 'nmp-auth__avatar nmp-auth__avatar--empty' }, h(Icon, { name: 'github', size: 14 })),
                      h('div', null,
                        h('div', { className: 'nmp-authbox__login' }, auth.login
                          ? t('settings.connectedAs', { login: auth.login })
                          : t('settings.envToken')),
                        h('div', { className: 'nmp-muted nmp-small' },
                          auth.scopes ? t('settings.scopes', { scopes: auth.scopes }) : t('settings.noScopes'),
                        ),
                        auth.source ? h('div', { className: 'nmp-muted nmp-small' }, t('settings.source', { source: auth.source })) : null,
                      ),
                    ),
                    h('div', { className: 'nmp-actions' },
                      h(Btn, { size: 'sm', icon: 'refresh', onClick: doRevalidate, loading: busy === 'revalidate' }, t('auth.revalidate')),
                      h(Btn, { size: 'sm', variant: 'ghost', onClick: doDisconnect, loading: busy === 'disconnect' }, t('auth.disconnect')),
                    ),
                  )
                : h('div', { className: 'nmp-form' },
                    h(Field, { label: t('settings.token'), hint: t('settings.tokenPrivacy') },
                      h('div', { className: 'nmp-tokenrow' },
                        h(Input, {
                          type: 'password',
                          value: tokenInput,
                          placeholder: t('settings.tokenPlaceholder'),
                          onChange: setTokenInput,
                          onKeyDown: (event) => {
                            if (event.key === 'Enter') doConnect()
                          },
                        }),
                        h(Btn, {
                          variant: 'primary',
                          icon: 'github',
                          onClick: doConnect,
                          loading: busy === 'connect',
                          disabled: tokenInput.trim() === '',
                        }, busy === 'connect' ? t('settings.connecting') : t('settings.connect')),
                      ),
                    ),
                    h('a', { className: 'nmp-link', href: TOKEN_URL, target: '_blank', rel: 'noopener noreferrer' },
                      h(Icon, { name: 'external', size: 12 }),
                      t('settings.tokenCreate'),
                    ),
                  ),
              h('div', { className: 'nmp-actions__hint' }, t('settings.disconnectHint')),
            ),
          ),
          h('section', { className: 'nmp-card' },
            h('div', { className: 'nmp-card__head' },
              h('div', null,
                h('h2', { className: 'nmp-card__title' }, t('settings.scanRoots')),
                h('p', { className: 'nmp-card__hint' }, t('settings.scanRootsHint')),
              ),
            ),
            h('div', { className: 'nmp-card__body' },
              (settings.scanRoots || []).length === 0
                ? h('div', { className: 'nmp-muted nmp-small' }, t('settings.noRoots'))
                : h('ul', { className: 'nmp-roots' },
                    (settings.scanRoots || []).map((root) => h('li', { key: root, className: 'nmp-root' },
                      h(Icon, { name: 'folder', size: 12 }),
                      h('code', { className: 'nmp-mono' }, shortPath(root, 62)),
                      h('button', {
                        type: 'button',
                        className: 'nmp-iconbtn',
                        title: t('list.remove'),
                        onClick: () => doSaveSettings({ ...settings, scanRoots: settings.scanRoots.filter((item) => item !== root) }),
                      }, h(Icon, { name: 'close', size: 12 })),
                    )),
                  ),
              h('div', { className: 'nmp-tokenrow' },
                h(Btn, {
                  icon: 'folder',
                  onClick: pickScanRoot,
                  loading: busy === 'pick',
                  title: t('settings.pickRoot'),
                }),
                h(Input, {
                  value: newRoot,
                  placeholder: t('dialog.add.example'),
                  onChange: setNewRoot,
                  onKeyDown: (event) => {
                    if (event.key !== 'Enter' || newRoot.trim() === '') return
                    doSaveSettings({ ...settings, scanRoots: [...(settings.scanRoots || []), newRoot.trim()] })
                    setNewRoot('')
                  },
                }),
                h(Btn, {
                  icon: 'plus',
                  disabled: newRoot.trim() === '',
                  loading: busy === 'settings',
                  onClick: () => {
                    doSaveSettings({ ...settings, scanRoots: [...(settings.scanRoots || []), newRoot.trim()] })
                    setNewRoot('')
                  },
                }, t('settings.addRoot')),
              ),
              h('div', { className: 'nmp-formgrid nmp-formgrid--compact' },
                h(Field, { label: t('settings.depth'), hint: t('settings.depthHint') },
                  h(Select, {
                    value: String(settings.maxScanDepth || 2),
                    options: [1, 2, 3, 4].map((value) => ({ value: String(value), label: t('settings.depthValue', { n: value }) })),
                    onChange: (value) => doSaveSettings({ ...settings, maxScanDepth: Number(value) }),
                  }),
                ),
              ),
            ),
          ),
          h('section', { className: 'nmp-card' },
            h('div', { className: 'nmp-card__head' },
              h('div', null,
                h('h2', { className: 'nmp-card__title' }, t('settings.about')),
              ),
            ),
            h('div', { className: 'nmp-card__body' },
              h('p', { className: 'nmp-about' }, t('settings.aboutBody')),
            ),
          ),
        )
      }

      function renderDialog() {
        if (!dialog) return null
        if (dialog.kind === 'add') return renderAddDialog()
        if (dialog.kind === 'remove') {
          const item = components.find((entry) => entry.dir === dialog.dir)
          return h(Modal, {
            title: t('dialog.remove.title'),
            onClose: () => setDialog(null),
            footer: h('div', { className: 'nmp-modal__actions' },
              h(Btn, { onClick: () => setDialog(null) }, t('action.cancel')),
              h(Btn, { variant: 'danger', onClick: () => doRemoveTarget(dialog.dir), loading: busy === 'remove' }, t('action.confirm')),
            ),
          },
            h('p', { className: 'nmp-modal__text' }, t('dialog.remove.body', { name: item ? lx({ zh: item.displayZh, en: item.displayEn }) : dialog.dir })),
          )
        }
        if (dialog.kind === 'scan') {
          const settings = settingsForm || overview?.settings || { scanRoots: [], maxScanDepth: 2 }
          const confirmScan = async () => {
            setDialog(null)
            await doSaveSettings({ ...settings, scanRoots: [...(settings.scanRoots || []), dialog.dir] })
          }
          return h(Modal, {
            title: t('dialog.scan.title'),
            onClose: () => setDialog(null),
            footer: h('div', { className: 'nmp-modal__actions' },
              h(Btn, { onClick: () => setDialog(null) }, t('action.cancel')),
              h(Btn, { variant: 'primary', icon: 'search', onClick: confirmScan, loading: busy === 'settings' }, t('dialog.scan.confirm')),
            ),
          },
            h('p', { className: 'nmp-modal__text' }, t('dialog.scan.body', { path: dialog.dir })),
          )
        }
        if (dialog.kind === 'clear') {
          return h(Modal, {
            title: t('dialog.clear.title'),
            onClose: () => setDialog(null),
            footer: h('div', { className: 'nmp-modal__actions' },
              h(Btn, { onClick: () => setDialog(null) }, t('action.cancel')),
              h(Btn, { variant: 'danger', onClick: doClearRecords, loading: busy === 'clear' }, t('action.confirm')),
            ),
          },
            h('p', { className: 'nmp-modal__text' }, t('dialog.clear.body')),
          )
        }
        return null
      }

      function renderAddDialog() {
        return h(AddFolderDialog, {
          onClose: () => setDialog(null),
          onSubmit: doAddFolder,
          busy: busy === 'add',
        })
      }

      function renderBody() {
        if (loading) {
          return h('div', { className: 'nmp-skeleton' },
            h('div', { className: 'nmp-skeleton__row' }),
            h('div', { className: 'nmp-skeleton__row' }),
            h('div', { className: 'nmp-skeleton__row' }),
          )
        }
        if (loadError) {
          return h('div', { className: 'nmp-empty' },
            h('span', { className: 'nmp-empty__icon' }, h(Icon, { name: 'alert', size: 18 })),
            h('div', { className: 'nmp-empty__title' }, t('error.load')),
            h('div', { className: 'nmp-empty__hint' }, loadError),
            h(Btn, { icon: 'refresh', onClick: () => loadOverview(true) }, t('action.retry')),
          )
        }
        if (tab === 'components') return renderComponents()
        if (tab === 'guide') return renderGuide()
        if (tab === 'records') return renderRecords()
        return renderSettings()
      }

      return h('div', { className: 'nmp' },
        h('style', null, STYLES),
        h('div', { className: 'nmp-frame' },
          renderMasthead(),
          renderTabs(),
          h('div', {
            role: 'tabpanel',
            id: `nmp-panel-${tab}`,
            'aria-labelledby': `nmp-tab-${tab}`,
          }, renderBody()),
        ),
        renderDialog(),
        h(Toast, { toast }),
      )
    }

    /* ---------------------------------------------------------------- styles */

    const STYLES = `
.nmp{
  --nmp-bg:var(--dsw-alias-bg-base,#ffffff);
  --nmp-surface:var(--dsw-alias-bg-layer-1,#ffffff);
  --nmp-raise:var(--dsw-alias-bg-layer-2,#fafafa);
  --nmp-overlay:var(--dsw-alias-bg-overlay,#ffffff);
  --nmp-line:var(--dsw-alias-border-l1,#ebebeb);
  --nmp-line-strong:var(--dsw-alias-border-l2,#dcdcdc);
  --nmp-ink:var(--dsw-alias-label-primary,#16171a);
  --nmp-muted:var(--dsw-alias-label-secondary,#6b6f76);
  --nmp-accent:var(--dsw-alias-brand-primary,#5e6ad2);
  --nmp-ok:var(--dsw-alias-state-success-primary,#2f9e77);
  --nmp-warn:var(--dsw-alias-state-warn-primary,#b7791f);
  --nmp-bad:var(--dsw-alias-state-error-primary,#e5484d);
  --nmp-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
  height:100%;overflow-y:auto;background:var(--nmp-bg);color:var(--nmp-ink);
  font-size:13px;line-height:1.55;-webkit-font-smoothing:antialiased;
}
.nmp *{box-sizing:border-box}
.nmp button,.nmp input,.nmp textarea,.nmp select{font-family:inherit}
.nmp-frame{max-width:1120px;margin:0 auto;padding:calc(var(--dsh-frame-top-clearance,0px) + 28px) 36px 96px;container-type:inline-size}
.nmp-mono{font-family:var(--nmp-mono)}
.nmp-muted{color:var(--nmp-muted)}
.nmp-small{font-size:11.5px}
.nmp-icon{display:block;flex:none}
.nmp-brand{flex:none;display:block;border-radius:7px}

/* masthead */
.nmp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap}
.nmp-head__main{min-width:0;max-width:720px}
.nmp-eyebrow{display:flex;align-items:center;gap:8px;font:500 10.5px/1 var(--nmp-mono);letter-spacing:.10em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-dot{width:5px;height:5px;border-radius:50%;background:var(--nmp-accent);flex:none}
.nmp-title{display:flex;align-items:center;gap:10px;margin:12px 0 8px;font-size:24px;line-height:1.2;font-weight:600;letter-spacing:-.02em}
.nmp-sub{margin:0;color:var(--nmp-muted);font-size:12.5px;line-height:1.7;max-width:680px}
.nmp-head__links{display:flex;gap:14px;margin-top:10px}
.nmp-link{display:inline-flex;align-items:center;gap:5px;color:var(--nmp-muted);font-size:11.5px;text-decoration:none}
.nmp-link:hover{color:var(--nmp-ink)}
.nmp-head__side{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.nmp-auth{display:flex;align-items:center;gap:8px;padding:4px 6px 4px 5px;border:1px solid var(--nmp-line);border-radius:999px;background:var(--nmp-surface)}
.nmp-auth__avatar{width:22px;height:22px;border-radius:50%;object-fit:cover;flex:none}
.nmp-auth__avatar--empty{display:inline-flex;align-items:center;justify-content:center;background:var(--nmp-raise);color:var(--nmp-muted)}
.nmp-auth__text{display:flex;flex-direction:column;line-height:1.15;min-width:0}
.nmp-auth__login{font:500 11.5px/1.2 var(--nmp-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}
.nmp-auth__state{font-size:9.5px;color:var(--nmp-muted);letter-spacing:.02em}

/* tabs */
.nmp-tabbar{display:inline-flex;flex-wrap:wrap;gap:2px;margin-top:24px;padding:3px;border:1px solid var(--nmp-line-strong);border-radius:9px;background:color-mix(in srgb,var(--nmp-ink) 4%,var(--nmp-bg));max-width:100%}
.nmp-tab{appearance:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--nmp-muted);font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background-color .12s ease,color .12s ease,border-color .12s ease,box-shadow .12s ease}
.nmp-tab .nmp-icon{color:currentColor;opacity:.7}
.nmp-tab:hover{color:var(--nmp-ink);background:color-mix(in srgb,var(--nmp-ink) 6%,transparent)}
.nmp-tab:hover .nmp-icon{opacity:1}
.nmp-tab:focus-visible{outline:2px solid var(--nmp-accent);outline-offset:1px}
.nmp-tab[aria-selected="true"]{background:var(--nmp-ink);border-color:var(--nmp-ink);color:var(--nmp-bg);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.18)}
.nmp-tab[aria-selected="true"]:hover{background:var(--nmp-ink);color:var(--nmp-bg)}
.nmp-tab[aria-selected="true"]:focus-visible{outline-color:var(--nmp-accent);outline-offset:2px}
.nmp-tab[aria-selected="true"] .nmp-icon{color:currentColor;opacity:1}
.nmp-tab__label{line-height:1}
.nmp-tab__count{font:500 10px/1 var(--nmp-mono);padding:2px 5px;border-radius:4px;background:color-mix(in srgb,var(--nmp-ink) 8%,transparent);color:var(--nmp-muted)}
.nmp-tab[aria-selected="true"] .nmp-tab__count{background:color-mix(in srgb,var(--nmp-bg) 22%,transparent);color:var(--nmp-bg)}
.nmp-tab__dot{width:6px;height:6px;border-radius:50%;background:var(--nmp-warn);box-shadow:0 0 0 2px color-mix(in srgb,var(--nmp-bg) 80%,transparent);margin-left:-1px}

/* toolbar */
.nmp-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;flex-wrap:wrap}
.nmp-toolbar__actions{display:flex;gap:8px;flex-wrap:wrap}
.nmp-search{display:flex;align-items:center;gap:7px;min-width:260px;max-width:360px;flex:1 1 240px;height:32px;padding:0 10px;border:1px solid var(--nmp-line-strong);border-radius:7px;background:var(--nmp-surface);color:var(--nmp-muted)}
.nmp-search:focus-within{border-color:var(--nmp-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--nmp-accent) 14%,transparent)}
.nmp-search input{flex:1;min-width:0;border:0;outline:none;background:transparent;color:var(--nmp-ink);font-size:12.5px}
.nmp-search input::placeholder{color:var(--nmp-muted)}
.nmp-listmeta{display:flex;align-items:center;gap:14px;margin:14px 0 10px;font:500 10px/1 var(--nmp-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-banner{display:flex;align-items:flex-start;gap:8px;margin-top:14px;padding:9px 12px;border:1px solid var(--nmp-line);border-radius:8px;background:var(--nmp-raise);color:var(--nmp-muted);font-size:11.5px;line-height:1.6}
.nmp-banner--bad{border-color:color-mix(in srgb,var(--nmp-bad) 34%,var(--nmp-line));color:var(--nmp-bad);background:color-mix(in srgb,var(--nmp-bad) 6%,var(--nmp-raise))}
.nmp-banner--stack{flex-direction:column;align-items:flex-start;gap:8px}
.nmp-banner--stack .nmp-btn{border-color:currentColor;color:currentColor;background:transparent}

/* component cards */
.nmp-comps{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.nmp-comp{display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--nmp-line);border-radius:10px;background:var(--nmp-surface);cursor:pointer;outline:none;transition:border-color .12s ease,box-shadow .12s ease,transform .12s ease}
.nmp-comp:hover{border-color:var(--nmp-line-strong);box-shadow:0 1px 3px rgba(0,0,0,.05);transform:translateY(-1px)}
.nmp-comp:focus-visible{outline:2px solid var(--nmp-accent);outline-offset:2px}
.nmp-comp__head{display:flex;align-items:center;gap:10px;min-width:0}
.nmp-comp__icon{width:34px;height:34px;border-radius:8px;object-fit:contain;flex:none;background:var(--nmp-raise);border:1px solid var(--nmp-line)}
.nmp-comp__icon--empty{display:inline-flex;align-items:center;justify-content:center;color:var(--nmp-muted)}
.nmp-comp__id{min-width:0;flex:1}
.nmp-comp__title{font-size:13.5px;font-weight:550;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nmp-comp__pkg{font:400 10.5px/1.4 var(--nmp-mono);color:var(--nmp-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.nmp-comp__badges{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.nmp-comp__path{font:400 10.5px/1.45 var(--nmp-mono);color:var(--nmp-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:6px 8px;border-radius:6px;background:var(--nmp-raise);border:1px solid var(--nmp-line)}
.nmp-comp__foot{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px;color:var(--nmp-muted);margin-top:auto}
.nmp-comp__dirty{color:var(--nmp-warn)}
.nmp-comp__go{display:inline-flex;align-items:center;gap:3px;color:var(--nmp-ink);font-size:11px;opacity:.75}
.nmp-comp:hover .nmp-comp__go{opacity:1;color:var(--nmp-accent)}

/* chips */
.nmp-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:5px;font:500 10px/1 var(--nmp-mono);letter-spacing:.01em;border:1px solid var(--nmp-line);background:var(--nmp-raise);color:var(--nmp-muted);white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.nmp-chip--ok{color:var(--nmp-ok);border-color:color-mix(in srgb,var(--nmp-ok) 34%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-ok) 8%,var(--nmp-raise))}
.nmp-chip--warn{color:var(--nmp-warn);border-color:color-mix(in srgb,var(--nmp-warn) 34%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-warn) 8%,var(--nmp-raise))}
.nmp-chip--bad{color:var(--nmp-bad);border-color:color-mix(in srgb,var(--nmp-bad) 34%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-bad) 8%,var(--nmp-raise))}
.nmp-chip--info{color:var(--nmp-accent);border-color:color-mix(in srgb,var(--nmp-accent) 34%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-accent) 8%,var(--nmp-raise))}

/* buttons */
.nmp-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--nmp-line-strong);border-radius:7px;background:var(--nmp-surface);color:var(--nmp-ink);font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap;text-decoration:none;transition:background-color .12s ease,border-color .12s ease,opacity .12s ease}
.nmp-btn:hover:not(:disabled){background:var(--nmp-raise)}
.nmp-btn:focus-visible{outline:2px solid var(--nmp-accent);outline-offset:2px}
.nmp-btn:disabled{opacity:.42;cursor:not-allowed}
.nmp-btn--primary{border-color:transparent;background:var(--nmp-ink);color:var(--nmp-bg)}
.nmp-btn--primary:hover:not(:disabled){background:var(--nmp-ink);opacity:.9}
.nmp-btn--ghost{border-color:transparent;background:transparent;color:var(--nmp-muted)}
.nmp-btn--ghost:hover:not(:disabled){background:var(--nmp-raise);color:var(--nmp-ink)}
.nmp-btn--danger{border-color:transparent;background:var(--nmp-bad);color:#fff}
.nmp-btn--danger:hover:not(:disabled){background:var(--nmp-bad);opacity:.9}
.nmp-btn--sm{height:27px;padding:0 9px;font-size:11.5px;border-radius:6px}
.nmp-btn--block{width:100%}
.nmp-iconbtn{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--nmp-muted);cursor:pointer;flex:none}
.nmp-iconbtn:hover{background:var(--nmp-raise);color:var(--nmp-ink);border-color:var(--nmp-line)}
.nmp-textbtn{appearance:none;display:inline-flex;align-items:center;gap:5px;padding:0;border:0;background:transparent;color:var(--nmp-muted);font-size:11.5px;cursor:pointer}
.nmp-textbtn:hover:not(:disabled){color:var(--nmp-ink)}
.nmp-textbtn:disabled{opacity:.45;cursor:not-allowed}
.nmp-textbtn--xs{font-size:10px}

/* segmented */
.nmp-segmented{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--nmp-line);border-radius:7px;background:var(--nmp-raise)}
.nmp-segmented__item{appearance:none;height:26px;padding:0 10px;border:0;border-radius:5px;background:transparent;color:var(--nmp-muted);font-size:11.5px;cursor:pointer}
.nmp-segmented__item:hover{color:var(--nmp-ink)}
.nmp-segmented__item[aria-pressed="true"]{background:var(--nmp-surface);color:var(--nmp-ink);font-weight:500;box-shadow:0 1px 2px rgba(0,0,0,.06)}

/* detail */
.nmp-detail{margin-top:18px}
.nmp-detail__top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.nmp-detail__actions{display:flex;gap:6px}
.nmp-detail__head{display:flex;align-items:flex-start;gap:14px;margin-top:14px}
.nmp-detail__icon{width:46px;height:46px;border-radius:10px;object-fit:contain;flex:none;background:var(--nmp-raise);border:1px solid var(--nmp-line)}
.nmp-detail__icon--empty{display:inline-flex;align-items:center;justify-content:center;color:var(--nmp-muted)}
.nmp-detail__id{min-width:0}
.nmp-detail__title{margin:0;font-size:19px;line-height:1.25;font-weight:600;letter-spacing:-.015em}
.nmp-detail__pkg{margin-top:3px;font:400 11.5px/1.4 var(--nmp-mono);color:var(--nmp-muted)}
.nmp-detail__pkg code{font-family:inherit}
.nmp-detail__path{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:10.5px;color:var(--nmp-muted);min-width:0}
.nmp-detail__path .nmp-mono{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:520px}
.nmp-progressbar{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0 4px;padding:12px 14px;border:1px solid var(--nmp-line);border-radius:10px;background:var(--nmp-surface)}
.nmp-progressbar__item{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;min-width:0}
.nmp-progressbar__label{font:500 10px/1.3 var(--nmp-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-progressbar__value{font:500 11px/1.3 var(--nmp-mono);color:var(--nmp-ink);white-space:nowrap}
.nmp-progressbar__track{grid-column:1/-1;height:4px;border-radius:99px;background:var(--nmp-line);overflow:hidden}
.nmp-progressbar__fill{display:block;height:100%;border-radius:99px;background:var(--nmp-accent);transition:width .25s ease}
.nmp-progressbar__fill[data-tone="accent"]{background:var(--nmp-accent)}

/* cards */
.nmp-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-top:14px;align-items:start}
.nmp-card{border:1px solid var(--nmp-line);border-radius:10px;background:var(--nmp-surface);overflow:hidden;min-width:0}
.nmp-card--rules{margin-top:14px}
.nmp-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:14px 16px;border-bottom:1px solid var(--nmp-line)}
.nmp-card__title{margin:0;font-size:13.5px;font-weight:600;letter-spacing:-.01em}
.nmp-card__hint{margin:4px 0 0;color:var(--nmp-muted);font-size:11.5px;line-height:1.6;max-width:460px}
.nmp-card__score{display:flex;flex-direction:column;align-items:flex-end;flex:none}
.nmp-card__scorenum{font:600 15px/1 var(--nmp-mono);letter-spacing:-.02em}
.nmp-card__scorelabel{font:500 9.5px/1.4 var(--nmp-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-card__body{padding:14px 16px}
.nmp-card__body--checks{padding-top:0}
.nmp-card__body--muted{padding:16px;color:var(--nmp-muted);font-size:11.5px;border-top:1px solid var(--nmp-line)}
.nmp-card__body--status{border-top:1px solid var(--nmp-line);background:var(--nmp-raise)}
.nmp-progress{height:2px;background:var(--nmp-line);overflow:hidden}
.nmp-progress__bar{display:block;height:100%;background:var(--nmp-ok);transition:width .3s ease}
.nmp-progress[data-tone="warn"] .nmp-progress__bar{background:var(--nmp-warn)}
.nmp-progress[data-tone="bad"] .nmp-progress__bar{background:var(--nmp-bad)}
.nmp-next{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--nmp-line);background:var(--nmp-raise);font-size:11.5px}
.nmp-next__label{font:500 9.5px/1.4 var(--nmp-mono);letter-spacing:.09em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-next__text{font-weight:550;color:var(--nmp-ink)}
.nmp-next__fix{color:var(--nmp-muted);font-size:11px;line-height:1.5;flex:1 1 100%}
.nmp-next--done{display:flex;align-items:center;gap:6px;color:var(--nmp-ok)}

/* forms */
.nmp-form{display:flex;flex-direction:column;gap:12px}
.nmp-formgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.nmp-formgrid--compact{grid-template-columns:minmax(0,220px);margin-top:14px}
.nmp-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.nmp-field__label{display:flex;align-items:baseline;gap:5px;font-size:10.5px;color:var(--nmp-muted);line-height:1.3}
.nmp-field__req{color:var(--nmp-bad)}
.nmp-field__opt{font-size:9.5px;opacity:.8}
.nmp-field__hint{font-size:10px;line-height:1.55;color:var(--nmp-muted);opacity:.85}
.nmp-input,.nmp-textarea,.nmp-select{width:100%;min-width:0;border:1px solid var(--nmp-line-strong);border-radius:7px;background:var(--nmp-bg);color:var(--nmp-ink);font-size:12.5px;outline:none;transition:border-color .12s ease,box-shadow .12s ease}
.nmp-input{height:32px;padding:0 10px}
.nmp-textarea{padding:8px 10px;line-height:1.55;resize:vertical;min-height:52px}
.nmp-select{height:32px;padding:0 8px;appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--nmp-muted) 50%),linear-gradient(135deg,var(--nmp-muted) 50%,transparent 50%);background-position:calc(100% - 14px) 14px,calc(100% - 9px) 14px;background-size:5px 5px,5px 5px;background-repeat:no-repeat;padding-right:26px}
.nmp-input:focus,.nmp-textarea:focus,.nmp-select:focus{border-color:var(--nmp-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--nmp-accent) 14%,transparent)}
.nmp-input::placeholder,.nmp-textarea::placeholder{color:var(--nmp-muted);opacity:.75}
.nmp-tokenrow{display:flex;gap:8px;align-items:center}
.nmp-tokenrow .nmp-input{flex:1}
.nmp-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
.nmp-actions__hint{font-size:10.5px;color:var(--nmp-muted);line-height:1.55}
.nmp-states{display:flex;gap:6px;flex-wrap:wrap}
.nmp-state{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border:1px solid var(--nmp-line);border-radius:5px;font:500 10px/1 var(--nmp-mono);color:var(--nmp-muted);background:var(--nmp-raise)}
.nmp-state::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--nmp-line-strong)}
.nmp-state[data-on="1"]{color:var(--nmp-ok);border-color:color-mix(in srgb,var(--nmp-ok) 30%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-ok) 8%,var(--nmp-raise))}
.nmp-state[data-on="1"]::before{background:var(--nmp-ok)}
.nmp-inline-note{display:flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid var(--nmp-line);border-radius:7px;background:var(--nmp-raise);color:var(--nmp-muted);font-size:11px;line-height:1.5;flex-wrap:wrap}
.nmp-inline-note--warn{border-color:color-mix(in srgb,var(--nmp-warn) 32%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-warn) 8%,var(--nmp-raise));color:var(--nmp-warn)}
.nmp-inline-note--bad{border-color:color-mix(in srgb,var(--nmp-bad) 32%,var(--nmp-line));color:var(--nmp-bad)}
.nmp-disclosure{appearance:none;display:inline-flex;align-items:center;gap:5px;padding:0;border:0;background:transparent;color:var(--nmp-muted);font-size:11px;cursor:pointer;align-self:flex-start}
.nmp-disclosure:hover{color:var(--nmp-ink)}
.nmp-disclosure[aria-expanded="true"] .nmp-icon{transform:rotate(90deg)}
.nmp-disclosure .nmp-icon{transition:transform .12s ease}

/* checks */
.nmp-checks__head{font:500 9.5px/1.4 var(--nmp-mono);letter-spacing:.09em;text-transform:uppercase;color:var(--nmp-muted);padding:0 0 6px;border-top:1px solid var(--nmp-line);padding-top:12px}
.nmp-checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.nmp-check{display:flex;align-items:flex-start;gap:9px;padding:8px 0;border-bottom:1px solid var(--nmp-line)}
.nmp-check:last-child{border-bottom:0}
.nmp-check__dot{width:7px;height:7px;border-radius:50%;margin-top:5px;flex:none;background:var(--nmp-line-strong)}
.nmp-check[data-tone="pass"] .nmp-check__dot{background:var(--nmp-ok)}
.nmp-check[data-tone="warn"] .nmp-check__dot{background:var(--nmp-warn)}
.nmp-check[data-tone="fail"] .nmp-check__dot{background:var(--nmp-bad)}
.nmp-check__body{min-width:0;flex:1}
.nmp-check__head{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.nmp-check__title{font-size:12px;font-weight:500;line-height:1.45}
.nmp-check__level{font:500 9px/1 var(--nmp-mono);letter-spacing:.07em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-check[data-tone="fail"] .nmp-check__level{color:var(--nmp-bad)}
.nmp-check[data-tone="warn"] .nmp-check__level{color:var(--nmp-warn)}
.nmp-check[data-tone="pass"] .nmp-check__level{color:var(--nmp-ok)}
.nmp-check__detail{font-size:11px;color:var(--nmp-muted);line-height:1.55;margin-top:1px;word-break:break-word}
.nmp-check__fix{display:flex;gap:6px;margin-top:4px;font-size:11px;line-height:1.55;color:var(--nmp-ink);opacity:.86}
.nmp-check__fixlabel{flex:none;font:500 9.5px/1.6 var(--nmp-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-check__doc{flex:none;color:var(--nmp-muted);opacity:.6;text-decoration:none;margin-top:2px}
.nmp-check__doc:hover{opacity:1;color:var(--nmp-accent)}

/* preview */
.nmp-preview{border:1px solid var(--nmp-line);border-radius:8px;overflow:hidden;background:var(--nmp-raise)}
.nmp-preview--empty{padding:12px;font-size:11px;color:var(--nmp-muted);line-height:1.6;background:var(--nmp-raise)}
.nmp-preview__head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-bottom:1px solid var(--nmp-line);background:var(--nmp-surface)}
.nmp-preview__path{font:400 10.5px/1.4 var(--nmp-mono);color:var(--nmp-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nmp-preview__code{margin:0;padding:10px;font:400 11px/1.65 var(--nmp-mono);color:var(--nmp-ink);overflow-x:auto;white-space:pre;tab-size:2}
.nmp-preview__hint{padding:6px 10px;border-top:1px solid var(--nmp-line);background:var(--nmp-surface);font-size:10px;line-height:1.5;color:var(--nmp-muted)}

/* PR status */
.nmp-status__head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.nmp-status__title{display:flex;align-items:center;gap:7px;font:600 12.5px/1.3 var(--nmp-mono)}
.nmp-status__actions{display:flex;gap:6px;align-items:center}
.nmp-status__loading{display:flex;align-items:center;gap:6px;color:var(--nmp-muted);font-size:11px;padding:6px 0}
.nmp-status{display:flex;flex-direction:column;gap:6px;margin:8px 0 10px}
.nmp-status__row{display:grid;grid-template-columns:82px minmax(0,1fr);gap:10px;align-items:start;font-size:11.5px}
.nmp-status__label{font:500 9.5px/1.7 var(--nmp-mono);letter-spacing:.07em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-status__checks{display:flex;gap:4px;flex-wrap:wrap}
.nmp-run{display:inline-flex;align-items:center;height:19px;padding:0 6px;border-radius:4px;border:1px solid var(--nmp-line);background:var(--nmp-surface);font:500 9.5px/1 var(--nmp-mono);color:var(--nmp-muted);max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nmp-run[data-tone="ok"]{color:var(--nmp-ok);border-color:color-mix(in srgb,var(--nmp-ok) 32%,var(--nmp-line))}
.nmp-run[data-tone="bad"]{color:var(--nmp-bad);border-color:color-mix(in srgb,var(--nmp-bad) 32%,var(--nmp-line))}
.nmp-run[data-tone="warn"]{color:var(--nmp-warn);border-color:color-mix(in srgb,var(--nmp-warn) 32%,var(--nmp-line))}
.nmp-status__labels{display:flex;gap:4px;flex-wrap:wrap}
.nmp-status__files{display:flex;flex-direction:column;gap:3px;min-width:0}
.nmp-status__files code{font-size:10.5px;color:var(--nmp-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nmp-comments{margin-top:10px;border-top:1px solid var(--nmp-line);padding-top:8px}
.nmp-comments__head{font:500 9.5px/1.4 var(--nmp-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--nmp-muted);margin-bottom:6px}
.nmp-comment{padding:6px 0;border-bottom:1px solid var(--nmp-line)}
.nmp-comment:last-child{border-bottom:0}
.nmp-comment__head{font-size:10.5px}
.nmp-comment__body{font-size:11px;color:var(--nmp-muted);line-height:1.55;white-space:pre-wrap;margin-top:2px}
.nmp-commentbox{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.nmp-commentbox .nmp-btn{align-self:flex-end}

/* rules */
.nmp-rules{list-style:none;margin:0;padding:12px 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:7px 20px}
.nmp-rules li{position:relative;padding-left:13px;font-size:11px;line-height:1.6;color:var(--nmp-muted)}
.nmp-rules li::before{content:"";position:absolute;left:0;top:7px;width:4px;height:4px;border-radius:50%;background:var(--nmp-line-strong)}

/* guide */
.nmp-guidehead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-top:18px;flex-wrap:wrap}
.nmp-guidehead__title{margin:8px 0 6px;font-size:20px;line-height:1.25;font-weight:600;letter-spacing:-.015em}
.nmp-guidehead__actions{display:flex;gap:6px}
.nmp-card--next{margin-top:14px;border-color:color-mix(in srgb,var(--nmp-accent) 26%,var(--nmp-line))}
.nmp-card--success{margin-top:14px}
.nmp-guide-next{padding:18px 18px 20px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.nmp-guide-next__label{font:500 9.5px/1.4 var(--nmp-mono);letter-spacing:.10em;text-transform:uppercase;color:var(--nmp-accent)}
.nmp-guide-next__title{font-size:17px;font-weight:600;letter-spacing:-.01em;line-height:1.3}
.nmp-guide-next__desc{font-size:12px;color:var(--nmp-muted);line-height:1.65;max-width:620px;margin-bottom:8px}
.nmp-guide-next__note{display:flex;align-items:flex-start;gap:6px;max-width:620px;margin:0 0 10px;padding:7px 9px;border:1px solid color-mix(in srgb,var(--nmp-warn) 32%,var(--nmp-line));border-radius:6px;background:color-mix(in srgb,var(--nmp-warn) 8%,var(--nmp-raise));color:var(--nmp-warn);font-size:11px;line-height:1.55}
.nmp-success{display:flex;align-items:center;gap:12px;padding:18px;flex-wrap:wrap}
.nmp-success__icon{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;background:color-mix(in srgb,var(--nmp-ok) 12%,var(--nmp-raise));color:var(--nmp-ok);flex:none}
.nmp-success__title{font-size:14px;font-weight:600}
.nmp-success__hint{font-size:11.5px;color:var(--nmp-muted);line-height:1.6;margin-top:2px;max-width:520px}
.nmp-steps{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column}
.nmp-step{display:flex;gap:12px;padding-bottom:14px;position:relative}
.nmp-step:last-child{padding-bottom:0}
.nmp-step__rail{position:relative;display:flex;flex-direction:column;align-items:center;flex:none;width:22px}
.nmp-step__rail::after{content:"";position:absolute;top:22px;bottom:-14px;left:50%;width:1px;background:var(--nmp-line);transform:translateX(-.5px)}
.nmp-step:last-child .nmp-step__rail::after{display:none}
.nmp-step__dot{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;border:1px solid var(--nmp-line-strong);background:var(--nmp-surface);color:var(--nmp-muted);font:500 10px/1 var(--nmp-mono);flex:none}
.nmp-step[data-status="done"] .nmp-step__dot{border-color:color-mix(in srgb,var(--nmp-ok) 40%,var(--nmp-line));background:color-mix(in srgb,var(--nmp-ok) 12%,var(--nmp-surface));color:var(--nmp-ok)}
.nmp-step[data-current="true"] .nmp-step__dot{border-color:var(--nmp-accent);color:var(--nmp-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--nmp-accent) 12%,transparent)}
.nmp-step__body{min-width:0;flex:1;padding-top:1px}
.nmp-step__head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.nmp-step__title{font-size:12.5px;font-weight:550}
.nmp-step__status{font:500 9px/1 var(--nmp-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--nmp-muted)}
.nmp-step[data-status="done"] .nmp-step__status{color:var(--nmp-ok)}
.nmp-step[data-current="true"] .nmp-step__status{color:var(--nmp-accent)}
.nmp-step__desc{font-size:11.5px;color:var(--nmp-muted);line-height:1.6;margin:2px 0 4px;max-width:640px}
.nmp-picklist{display:flex;flex-direction:column;gap:6px}
.nmp-pick{appearance:none;display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--nmp-line);border-radius:8px;background:var(--nmp-surface);color:var(--nmp-ink);cursor:pointer;text-align:left}
.nmp-pick:hover{border-color:var(--nmp-line-strong);background:var(--nmp-raise)}
.nmp-pick__icon{width:24px;height:24px;border-radius:6px;object-fit:contain;flex:none;background:var(--nmp-raise);border:1px solid var(--nmp-line)}
.nmp-pick__icon--empty{display:inline-flex;align-items:center;justify-content:center;color:var(--nmp-muted)}
.nmp-pick__body{display:flex;flex-direction:column;min-width:0;flex:1}
.nmp-pick__title{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nmp-pick__pkg{font:400 10px/1.4 var(--nmp-mono);color:var(--nmp-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* records */
.nmp-sectionhead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin:20px 0 12px;flex-wrap:wrap}
.nmp-sectionhead__title{margin:0 0 4px;font-size:17px;font-weight:600;letter-spacing:-.01em}
.nmp-records{list-style:none;margin:0;padding:0;border:1px solid var(--nmp-line);border-radius:10px;background:var(--nmp-surface);overflow:hidden}
.nmp-record{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-bottom:1px solid var(--nmp-line)}
.nmp-record:last-child{border-bottom:0}
.nmp-record__dot{width:6px;height:6px;border-radius:50%;margin-top:6px;background:var(--nmp-ok);flex:none}
.nmp-record[data-status="fail"] .nmp-record__dot{background:var(--nmp-bad)}
.nmp-record__body{min-width:0;flex:1}
.nmp-record__head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.nmp-record__title{font-size:12px;font-weight:500}
.nmp-record__time{font:400 10px/1.4 var(--nmp-mono);color:var(--nmp-muted)}
.nmp-record__detail{font-size:11px;color:var(--nmp-muted);line-height:1.55;margin-top:2px;word-break:break-word}
.nmp-record__name{font-size:10px;color:var(--nmp-muted);opacity:.8;margin-top:2px}

/* settings */
.nmp-settings{display:flex;flex-direction:column;gap:14px;margin-top:18px}
.nmp-authbox{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.nmp-authbox__id{display:flex;align-items:center;gap:10px;min-width:0}
.nmp-authbox__login{font-size:12.5px;font-weight:550}
.nmp-roots{list-style:none;margin:0 0 10px;padding:0;display:flex;flex-direction:column;gap:4px}
.nmp-root{display:flex;align-items:center;gap:7px;padding:6px 8px;border:1px solid var(--nmp-line);border-radius:6px;background:var(--nmp-raise);color:var(--nmp-muted);font-size:10.5px}
.nmp-root code{flex:1;font-family:var(--nmp-mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--nmp-ink)}
.nmp-about{margin:0 0 12px;font-size:11.5px;line-height:1.7;color:var(--nmp-muted);max-width:720px}

/* empty + skeleton */
.nmp-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 20px;border:1px dashed var(--nmp-line-strong);border-radius:10px;background:var(--nmp-surface);margin-top:16px}
.nmp-empty__icon{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:var(--nmp-raise);color:var(--nmp-muted);margin-bottom:12px}
.nmp-empty__title{font-size:13.5px;font-weight:550}
.nmp-empty__hint{margin:6px auto 0;max-width:440px;font-size:11.5px;line-height:1.65;color:var(--nmp-muted)}
.nmp-empty .nmp-btn{margin-top:14px}
.nmp-skeleton{margin-top:18px;display:flex;flex-direction:column;gap:8px}
.nmp-skeleton__row{height:64px;border-radius:8px;background:linear-gradient(90deg,var(--nmp-raise) 25%,var(--nmp-line) 50%,var(--nmp-raise) 75%);background-size:200% 100%;animation:nmp-shimmer 1.4s ease-in-out infinite}
@keyframes nmp-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* modal */
.nmp-modal__backdrop{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(12,12,16,.34);animation:nmp-fade .12s ease-out}
.nmp-modal{width:min(520px,100%);max-height:calc(100vh - 48px);overflow-y:auto;border:1px solid var(--nmp-line-strong);border-radius:12px;background:var(--nmp-overlay);box-shadow:0 24px 64px rgba(0,0,0,.22)}
.nmp-modal__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--nmp-line)}
.nmp-modal__title{margin:0;font-size:13.5px;font-weight:600}
.nmp-modal__body{padding:16px;display:flex;flex-direction:column;gap:12px}
.nmp-modal__text{margin:0;font-size:12px;line-height:1.65;color:var(--nmp-muted)}
.nmp-modal__error{font-size:11px;color:var(--nmp-bad)}
.nmp-modal__foot{padding:12px 16px;border-top:1px solid var(--nmp-line);background:var(--nmp-raise)}
.nmp-modal__actions{display:flex;justify-content:flex-end;gap:8px}
@keyframes nmp-fade{from{opacity:0}to{opacity:1}}

/* toast + spinner */
.nmp-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:120;display:flex;align-items:center;gap:8px;max-width:min(560px,90vw);padding:8px 13px;border:1px solid var(--nmp-line-strong);border-radius:8px;background:var(--nmp-ink);color:var(--nmp-bg);font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);animation:nmp-rise .16s ease-out}
.nmp-toast--error{background:var(--nmp-bad);color:#fff;border-color:transparent}
@keyframes nmp-rise{from{opacity:0;transform:translate(-50%,6px)}to{opacity:1;transform:translate(-50%,0)}}
.nmp-spinner{display:inline-block;border-radius:50%;border:1.6px solid currentColor;border-top-color:transparent;animation:nmp-spin .7s linear infinite;flex:none}
@keyframes nmp-spin{to{transform:rotate(360deg)}}

@container (max-width: 900px){
  .nmp-cols{grid-template-columns:minmax(0,1fr)}
  .nmp-rules{grid-template-columns:1fr}
}
@container (max-width: 620px){
  .nmp-tab{height:30px;padding:0 9px;font-size:12px;gap:5px}
  .nmp-tabbar{margin-top:20px}
  .nmp-formgrid{grid-template-columns:1fr}
  .nmp-progressbar{grid-template-columns:1fr}
  .nmp-search{max-width:none;flex-basis:100%}
}
@media (max-width:980px){
  .nmp-cols{grid-template-columns:minmax(0,1fr)}
  .nmp-rules{grid-template-columns:1fr}
}
@media (max-width:720px){
  .nmp-frame{padding-left:18px;padding-right:18px;padding-top:calc(var(--dsh-frame-top-clearance,0px) + 20px)}
  .nmp-formgrid{grid-template-columns:1fr}
  .nmp-progressbar{grid-template-columns:1fr}
  .nmp-title{font-size:20px}
  .nmp-search{max-width:none;flex-basis:100%}
}
@media (prefers-reduced-motion:reduce){
  .nmp *,.nmp *::before,.nmp *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
}
`

    /* -------------------------------------------------------------- register */

    return {
      inject: ['slots'],
      apply(ctx) {
        runtimeCtx = ctx
        localeService = ctx.get('locale')

        if (localeService && typeof localeService.register === 'function') {
          for (const code of ['zh', 'zh-CN', 'zh-Hans', 'zh-Hant', 'zh-TW', 'zh-HK']) {
            ctx.effect(() => localeService.register(NS, code, DICTIONARIES.zh), `nanshan-market-publish: ${code} strings`)
          }
          for (const code of ['en', 'en-US', 'en-GB']) {
            ctx.effect(() => localeService.register(NS, code, DICTIONARIES.en), `nanshan-market-publish: ${code} strings`)
          }
        }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 46,
          label: () => t('nav.title'),
        }, function MarketPublishIcon(props) {
          return h(BrandMark, { size: typeof props?.size === 'number' ? props.size : 16 })
        }))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
        }, Page))
      },
    }
  },
})
