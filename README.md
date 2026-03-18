# ShortVideoScriptStudio

[![CI](https://github.com/Tsinghua-Man/ShortVideoScriptStudio/actions/workflows/ci.yml/badge.svg)](https://github.com/Tsinghua-Man/ShortVideoScriptStudio/actions/workflows/ci.yml)

一个面向中文内容创作场景的短视频脚本生成智能体项目。

它不是单纯的“文案模板合集”，而是把短视频脚本生成拆成了更容易迭代的几层：

- 智能体系统提示词
- 结构化输入模板
- 结构化输出约束
- Python 生成引擎
- 本地图形化网页界面

当前版本已经支持根据主题、产品、平台、目标、时长、痛点、卖点等信息，生成一版可直接改写的专业短视频脚本草案，也支持生成提示词包，便于后续接入大模型平台或自动化工作流。

## 功能亮点

- 中文化脚本 brief 输入：支持主题、产品、平台、目标、脚本类型、用户画像、痛点、卖点、证据点等字段
- 专业脚本输出结构：自动生成需求理解、内容策略、主脚本表格、备选开头、标题建议、拍摄与剪辑提示
- 多模式生成：支持 `draft` 脚本草案模式和 `prompt` 提示词包模式
- 图形化网页界面：可通过本地 Web UI 填表生成，也支持直接双击 `index.html` 离线使用
- 平台适配：内置抖音、小红书、视频号、快手、B站的基础节奏偏好
- 信息兜底：当输入不完整时，会自动补默认假设而不是直接拒绝生成

## 项目结构

```text
.
├─ agent/
│  ├─ system_prompt.md
│  ├─ input_template.json
│  ├─ output_contract.md
│  └─ evaluation_checklist.md
├─ examples/
│  └─ sample_brief.json
├─ src/
│  ├─ short_video_agent.py
│  └─ web_app.py
├─ web/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  ├─ client_generator.js
│  └─ standalone_data.js
├─ start_agent.bat
├─ start_web_ui.bat
└─ USAGE_CN.md
```

## 快速开始

### 方式一：命令行生成脚本

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft
```

输出提示词包：

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode prompt
```

保存到文件：

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft --output output.md
```

### 方式二：启动图形化网页界面

```bash
python src/web_app.py --open
```

Windows 下也可以直接双击：

- `start_web_ui.bat`

默认地址：

```text
http://127.0.0.1:8123
```

### 方式三：直接双击 HTML 页面

直接打开：

```text
web/index.html
```

页面会自动切换为“浏览器本地生成模式”，即使没有启动 Python 本地服务，也可以正常填写表单并生成结果。

## 使用说明

详细中文使用教程见：

- [USAGE_CN.md](./USAGE_CN.md)

如果你是第一次使用，建议顺序如下：

1. 先运行网页界面或命令行示例
2. 查看 `examples/sample_brief.json`
3. 修改为你的行业、产品、用户和目标
4. 继续迭代提示词、模板或前端界面

## 适用场景

- 抖音口播脚本
- 小红书经验分享脚本
- 视频号信任转化型脚本
- 测评类、剧情类、探店类短视频草案
- 给大模型工作流准备结构化提示词输入

## 开发

### 本地基础检查

```bash
python -m py_compile src/short_video_agent.py src/web_app.py
python src/web_app.py --check
node --check web/standalone_data.js
node --check web/client_generator.js
node --check web/app.js
```

### 运行说明

- `src/short_video_agent.py`
  - 命令行脚本生成入口
- `src/web_app.py`
  - 本地 Web 服务入口
- `web/client_generator.js`
  - 浏览器本地离线生成逻辑
- `web/standalone_data.js`
  - 直开 `index.html` 时使用的内置配置和示例数据

## GitHub Actions

仓库包含一个基础 CI 工作流，会在 push 和 pull request 时自动执行：

- Python 语法检查
- Web UI 烟雾测试
- 前端脚本语法检查
- 本地离线生成器最小验证

## Roadmap

- 增加行业模板：美妆、教育、餐饮、本地生活、知识 IP 等
- 一次生成多版本脚本
- 更精细的平台风格开关
- 输出区卡片化展示
- 接入真实模型 API

## 贡献

欢迎提交 issue 和 PR。

贡献前建议先阅读：

- [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

当前仓库暂未添加开源许可证。

如果你准备对外公开分发或接受更广泛贡献，建议下一步补充明确的 License 文件。
