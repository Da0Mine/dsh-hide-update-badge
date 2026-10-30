# dsh-hide-update-badge

[中文](#中文) | English

Hide the built-in **DSH Desktop** update badge — the small `下载箭头 + 新版本` pill that the desktop shell draws beside the account button once a new desktop build is published.

It hides **only that badge**. Update checking keeps working exactly as before; the manual **检查更新 / Check for updates** menu item is untouched. Nothing is downloaded or installed behind your back, and nothing is disabled.

```
dsh plugin --profile desktop add dsh-hide-update-badge
```

## Why a plugin is needed at all

The badge is rendered by the shell's own component `DesktopUpdateIndicator`
(`@deepseek-ai/dsh-client-ui-settings-general/src/client/DesktopUpdateIndicator.module.css`) whenever the desktop updater reports `phase = available`, and it gates on `wide && !hidden && phase !== 'idle'`. The shell exposes **no user setting** to turn it off (there is only the manual menu item), so the only lever available to a plugin is the presentation layer.

## How it works

| Layer | Mechanism | Survives a DSH upgrade? |
|---|---|---|
| ① CSS | hides the current build's CSS-module class (`VUhOWa_indicator`, plus `VUhOWa_badge` for the collapsed-sidebar dot) | ❌ hashes change per build |
| ② DOM | hides any `button[aria-label]` whose accessible name is an update state (`新版本` / `正在检查更新` / `正在校验更新` / `正在安装更新` / `更新失败` / `重试` / `NN%`), watched with a rAF-throttled `MutationObserver` plus a 4 s fallback sweep | ✅ label-based, hash-independent |

Layer ② is deliberately narrow so it cannot hit unrelated controls: the element must be a `<button>` with an `aria-label` from that whitelist **and** either live inside the settings trigger row (`*_triggerRow`) or carry an `indicator` class. `设置` / `打开设置` / `重新连接` are explicitly protected.

## After a DSH upgrade

A major version can still break it (copy or structure changes). If the badge reappears:

1. Open DevTools (F12), right-click the badge → **Inspect**;
2. Read its `aria-label` and class (`<hash>_indicator`);
3. Add the new hash to `HASH_SELECTORS`, or the new copy to `UPDATE_LABELS` in `client.js`;
4. Restart the host.

## Uninstall

Turn the plugin off in the Plugins page, or remove its row from `dsh.profile.bundles` / the dependency from the profile's `package.json`, then restart.

## License

MIT

---

## 中文

隐藏 **DSH 桌面版**自带的更新角标——就是桌面端在账号按钮右边画的那颗「下载箭头 + 新版本」小胶囊。

**只藏这一颗**。更新检查照旧，菜单里的「检查更新」照旧可用，不会背着你下载或安装任何东西，也没有关掉任何功能。

```
dsh plugin --profile desktop add dsh-hide-update-badge
```

### 为什么非得用插件

角标由宿主内置组件 `DesktopUpdateIndicator`
（`@deepseek-ai/dsh-client-ui-settings-general/src/client/DesktopUpdateIndicator.module.css`）在
`wide && !hidden && phase !== 'idle'` 时渲染。壳**没有提供任何用户级开关**（只有菜单里的手动入口），插件能动的只有表现层。

### 两层策略

| 层 | 依据 | 抗升级 |
|---|---|---|
| ① CSS | 当前构建的类名哈希（`VUhOWa_indicator`，以及折叠态圆点 `VUhOWa_badge`） | ❌ 换构建就失效 |
| ② DOM | 按无障碍标签识别更新态（`新版本` / `正在检查更新` / `正在校验更新` / `正在安装更新` / `更新失败` / `重试` / `NN%`），用 rAF 节流的 `MutationObserver` + 4 秒兜底扫描 | ✅ 不看哈希 |

第 ② 层刻意收窄以免误伤：必须是带 `aria-label` 的 `<button>`，标签命中更新态白名单，**并且**位于设置触发行（`*_triggerRow`）内或自身 class 含 `indicator`；`设置` / `打开设置` / `重新连接` 在保护名单里。

### 升级 DSH 之后

跨大版本仍可能失效（官方改文案或改结构）。角标重现时：

1. F12 开 DevTools，右键角标 →「检查」；
2. 看它的 `aria-label` 与 class（形如 `<哈希>_indicator`）；
3. 把新哈希加进 `HASH_SELECTORS`，或把新文案加进 `UPDATE_LABELS`；
4. 重启宿主。

### 卸载

插件页里关掉它，或从 profile 的 `dsh.profile.bundles` 移除本包、从 `package.json` 删掉依赖，重启即可。

### 许可

MIT
