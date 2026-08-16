# GitHub UI Skill Research

## 优先候选

### 1. UI UX Pro Max

- 仓库：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- 适合：通用 UI 设计规则、行业配色、字体搭配、图表建议、响应式和可访问性检查。
- 特点：高星项目，提供设计系统生成能力，能给出行业相关的配色、字体、版式和反模式清单。

### 2. gzh-design-skill

- 仓库：https://github.com/isjiamu/gzh-design-skill
- 适合：Markdown 转高质量 HTML，尤其适合公众号式排版。
- 特点：6 套主题、主题生成器、校验流程，和我们当前 Markdown 输出路线最接近。

### 3. IFQ Design Skills

- 仓库：https://github.com/peixl/ifq-design-skills
- 适合：HTML 原型、幻灯片、报告、数据页、品牌页。
- 特点：12 种设计模式、零依赖核心、本地预览和验证，强调不要生成“AI slop”。

### 4. beautiful-html-templates

- 仓库：https://github.com/zarazhangrui/beautiful-html-templates
- 适合：直接复用高质量 HTML 模板。
- 特点：面向 coding agent 的 HTML 模板库，适合作为我们 PPT 和报告主题的模板来源。

### 5. Lavish Axi

- 仓库：https://github.com/kunchenguid/lavish-axi
- 适合：HTML artifact 编辑和主题化。
- 特点：可作为导出 HTML 的可视化编辑器方向参考，而不是直接作为转换库。

### 6. Zylos DocCraft

- 仓库：https://github.com/zylos-ai/zylos-doccraft
- 适合：结构化内容生成可读 HTML 文档。
- 特点：结论先行、指标卡、状态面板、折叠内容、深浅主题，适合报告类转换。

## 落地建议

优先吸取：

1. `UI UX Pro Max` 的配色、字体、图表和反模式清单。
2. `gzh-design-skill` 的 Markdown 主题组织方式。
3. `IFQ Design Skills` 的“模板优先、拒绝 AI slop、本地验证”思路。
4. `beautiful-html-templates` 的成品模板，作为 PPT 和高级报告主题来源。

不建议直接把大型 UI skill 整个塞进当前 Electron 应用。更合理的做法是提取其中的设计规则、模板和验证脚本，沉淀到本项目的主题层。
