// dsh-hide-update-badge — host half.
// 这个插件只在浏览器侧注入一条 CSS，宿主侧不需要做任何事；
// 但仍然要有一个能被 loader import 的入口（bundle patch 里按 name 挂载它）。
export const name = 'dsh-hide-update-badge'
export const inject = []

export function apply() {
  // 无宿主行为（刻意留空）
}
