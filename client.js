// dsh-hide-update-badge — browser half.
// 隐藏宿主自带的「桌面版有新版本」角标。
//
// 被隐藏的是 @deepseek-ai/dsh-client-ui-settings-general 里的
// DesktopUpdateIndicator 组件（rc.3 的 CSS Module 类名是 VUhOWa_indicator）：
// 渲染成账号按钮右边一颗 <button aria-label="新版本">（下载图标 + 文字）。
//
// 两层策略，保证宿主升级后仍然大概率有效：
//   ① CSS：按当前构建的类名哈希直接藏（最快、零闪烁）；
//   ② JS：按无障碍标签识别——不依赖构建哈希，宿主升级后仍能命中，
//         并用 MutationObserver 跟着状态变化（检查中/下载中/校验中/失败重试）走。
window.__ModuleLoader__.load({
  id: 'dsh-hide-update-badge',
  factory() {
    const PLUGIN = 'dsh-hide-update-badge';

    // ① 类名哈希（随 DSH 构建变化；升级后如果角标又出现，F12 查新的 `<哈希>_indicator` 补进来）
    const HASH_SELECTORS = [
      'button[class*="VUhOWa_indicator"]',
      '[class*="VUhOWa_badge"]',
    ];

    // ② 不依赖哈希：更新角标各状态的 aria-label（壳的 i18n desktop.update.*）
    const UPDATE_LABELS = /新版本|正在检查更新|正在校验更新|正在安装更新|更新失败|^重试$|^\d{1,3}%$/;
    // 这些标签属于别的控件，绝不能碰
    const PROTECTED_LABELS = /^(设置|打开设置|Settings|重新连接|Reconnect)$/;

    let observer = null;
    let scheduled = false;

    function hideByLabel() {
      const buttons = document.querySelectorAll('button[aria-label]');
      for (const b of buttons) {
        const label = (b.getAttribute('aria-label') || '').trim();
        if (!label || PROTECTED_LABELS.test(label)) continue;
        if (!UPDATE_LABELS.test(label)) continue;
        // 只认「在设置触发行里」或「自身带 indicator 类」的，避免误伤别处同名按钮
        // （壳里有 23 处「重试」，靠这个作用域收窄到设置页脚那一行）
        const nearTriggerRow = !!b.closest('[class*="triggerRow"]');
        const looksIndicator = /indicator/i.test(b.className || '');
        if (!nearTriggerRow && !looksIndicator) continue;
        if (b.style.display !== 'none') b.style.display = 'none';
      }
    }

    /** 节流：流式输出时 DOM 每帧都在变，不能让 observer 每次都全量扫。 */
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        hideByLabel();
      });
    }

    return {
      name: PLUGIN,
      inject: [],
      apply() {
        if (typeof document === 'undefined') return;

        const marker = 'style[data-plugin="' + PLUGIN + '"]';
        if (!document.querySelector(marker)) {
          const tag = document.createElement('style');
          tag.dataset.plugin = PLUGIN;
          tag.textContent = HASH_SELECTORS.map((s) => s + ' { display: none !important; }').join('\n');
          document.head.appendChild(tag);
        }

        hideByLabel();
        try {
          observer = new MutationObserver(schedule);
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-label', 'class'],
          });
        } catch {
          /* 观测失败也不致命，下面还有一次性兜底 */
        }
        // 兜底：极少数情况下 DOM 变化没触发 observer（例如监听时机太早）
        setInterval(hideByLabel, 4000);
      },
    };
  },
});
