# 专业短视频脚本生成智能体（初版）

这是一个方便后续持续迭代的短视频脚本生成智能体起步版，目标不是一次性做成黑盒，而是先把最关键的三层搭起来：

- 智能体角色与生成规则
- 输入模板与输出规范
- 一个可直接运行的 Python 草稿生成器

## 目录结构

- `agent/system_prompt.md`
- `agent/input_template.json`
- `agent/output_contract.md`
- `agent/evaluation_checklist.md`
- `examples/sample_brief.json`
- `src/short_video_agent.py`
- `start_agent.bat`
- `src/web_app.py`
- `web/index.html`
- `web/styles.css`
- `web/app.js`
- `start_web_ui.bat`
- `USAGE_CN.md`

## 适合的使用方式

1. 先复制 `agent/input_template.json` 或直接修改 `examples/sample_brief.json`
2. 填入你的行业、产品、平台、时长、脚本类型、目标用户等信息
3. 运行生成器拿到一版结构化脚本草稿
4. 再告诉我你想强化哪一类能力，我继续帮你升级

## 快速开始

如果你不想输入命令，直接双击项目根目录下的 `start_agent.bat` 即可。

详细中文教程见：

- `USAGE_CN.md`

如果你想用图形化网页界面填写字段并生成脚本，运行：

```bash
python src/web_app.py --open
```

或者直接双击：

```bash
start_web_ui.bat
```

现在也支持直接双击打开：

```bash
web/index.html
```

直接打开 `index.html` 时，页面会自动切换为“浏览器本地生成模式”，不依赖本地接口。

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft
```

如果你想拿到“系统提示词 + 结构化需求”的组合包，便于后续接入大模型或工作流系统：

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode prompt
```

如果想把结果保存成文件：

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft --output output.md
```

## 这版已经包含的能力

- 根据平台、目标、脚本类型、时长生成结构化脚本
- 自动补出开头钩子、分镜建议、字幕重点、标题建议、CTA
- 当输入信息不完整时，显式写出默认假设，方便后续改稿
- 适配常见类型：`口播`、`带货`、`知识分享`、`测评`、`剧情`、`探店`

## 建议的下一步迭代

- 增加行业专属模板，例如美妆、教育、餐饮、本地生活、知识 IP、招商加盟
- 增加多版本输出，例如同一 brief 一次生成 3 个不同风格
- 增加平台专项优化，例如抖音强抓停版、小红书种草版、视频号信任转化版
- 接入真实大模型 API，让脚本不止是模板化拼装，而是进入更强的创意生成模式
