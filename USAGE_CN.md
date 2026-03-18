# 短视频脚本智能体启动教程

这份教程按最适合新手的方式来写，你只要照着做，就能跑起来。

## 一、你现在已经有什么

当前项目里最重要的几个文件是：

- `src/short_video_agent.py`
  - 这是智能体主程序
- `examples/sample_brief.json`
  - 这是示例需求文件
- `agent/input_template.json`
  - 这是空白输入模板
- `start_agent.bat`
  - 这是我给你加的一键启动脚本

## 二、最简单的启动方式

如果你只是想先看看效果，不想输命令：

1. 打开项目文件夹  
   `C:\Users\Administrator\Desktop\智能体集合\已落地智能体\短视频脚本生成智能体`
2. 双击 `start_agent.bat`
3. 屏幕会出现 3 个选项：
   - `1`：直接用示例需求生成脚本
   - `2`：用你自己写的需求文件生成脚本
   - `3`：生成“大模型提示词包”，方便后面接别的模型或工作流
4. 第一次建议输入 `1`
5. 回车后，程序会自动生成结果文件

生成结果默认会放在项目根目录：

- `output_draft.md`
- `output_prompt.md`

## 三、图形化网页界面启动方式

如果你不想面对 JSON 文件，想直接在网页里填表单，现在也可以用图形化界面。

### 方法 1：双击启动

1. 打开项目文件夹  
   `C:\Users\Administrator\Desktop\智能体集合\已落地智能体\短视频脚本生成智能体`
2. 双击 `start_web_ui.bat`
3. 浏览器会自动打开本地网页
4. 在页面里直接填写中文表单
5. 点击：
   - `生成脚本`
   - 或 `生成提示词包`

### 方法 2：命令行启动

```powershell
cd "C:\Users\Administrator\Desktop\智能体集合\已落地智能体\短视频脚本生成智能体"
python src/web_app.py --open
```

启动成功后，本地地址默认是：

```text
http://127.0.0.1:8123
```

注意：

- 运行网页时，请不要关闭启动它的终端窗口
- 关闭终端窗口后，本地网页服务也会停止

### 方法 3：直接打开 HTML 文件

如果你不想启动本地服务，现在也可以直接双击：

`C:\Users\Administrator\Desktop\智能体集合\已落地智能体\短视频脚本生成智能体\web\index.html`

新版页面会自动切换为“浏览器本地生成模式”，所以：

- 表单可以直接填写
- 按钮可以直接使用
- 可以直接生成脚本
- 可以下载结果

说明：

- 这种方式不依赖 Python 服务是否已启动
- 如果你后面仍然想走 Python 本地服务，也可以继续使用 `start_web_ui.bat`

### 网页版能做什么

- 把 `topic`、`product_or_service` 等字段全部转换成中文标签显示
- 每个字段都有对应输入框或下拉框
- 可一键载入示例内容
- 可清空表单重新填写
- 可直接生成脚本
- 可复制结果
- 可下载 Markdown 结果

## 四、如果你只想先跑一次

最推荐你先这样做：

1. 双击 `start_agent.bat`
2. 输入 `1`
3. 按回车
4. 等程序执行完
5. 打开 `output_draft.md`

这个文件里就是智能体生成的短视频脚本。

## 五、如果你想用自己的需求来生成

### 第 1 步：复制一个输入模板

你可以复制下面任意一个文件作为你的需求文件：

- `agent/input_template.json`
- `examples/sample_brief.json`

建议你复制 `examples/sample_brief.json`，因为里面已经有完整示例，更容易照着改。

比如你复制出一个新文件：

`my_brief.json`

### 第 2 步：编辑你的需求文件

你可以用记事本、VS Code 或任何文本编辑器打开它。

下面是每个字段的意思：

- `topic`
  - 你这条视频的主题
  - 例子：`减脂早餐分享`
- `product_or_service`
  - 产品或服务名称
  - 例子：`轻食套餐`
- `brand_name`
  - 品牌名
- `industry`
  - 行业
  - 例子：`餐饮`、`护肤`、`教育`
- `platform`
  - 发布平台
  - 例子：`抖音`、`小红书`、`视频号`
- `goal`
  - 目标
  - 例子：`转化`、`涨粉`、`获客`
- `script_type`
  - 脚本类型
  - 例子：`口播`、`带货`、`知识分享`、`测评`、`剧情`、`探店`
- `duration_sec`
  - 视频时长，单位秒
- `audience`
  - 目标人群
- `persona`
  - 出镜人设
- `pain_points`
  - 用户痛点，写成数组
- `selling_points`
  - 产品或内容卖点，写成数组
- `proof_points`
  - 证据点，写成数组
- `must_include`
  - 必须写进去的内容
- `must_avoid`
  - 必须规避的表达
- `style`
  - 整体风格
- `tone`
  - 说话语气
- `cta`
  - 结尾行动引导
- `scene_requirements`
  - 拍摄场景要求
- `reference_accounts`
  - 参考账号方向
- `notes`
  - 额外备注

### 第 3 步：用你自己的需求文件启动

方法 A：双击启动

1. 双击 `start_agent.bat`
2. 输入 `2`
3. 输入你的文件路径

如果你的文件就在当前目录，比如：

`my_brief.json`

那就直接输入：

`my_brief.json`

如果在别的目录，就输入完整路径。

### 第 4 步：查看结果

执行完成后，会生成：

`output_draft.md`

你打开它，就能看到：

- 需求理解
- 内容策略
- 主脚本
- 备选开头
- 标题建议
- 拍摄与剪辑提示
- 信息缺口与默认假设

## 六、如果你想直接用命令行启动

如果你愿意用命令，也可以直接运行。

先进入项目目录：

```powershell
cd "C:\Users\Administrator\Desktop\智能体集合\已落地智能体\短视频脚本生成智能体"
```

### 1. 用示例需求生成脚本

```powershell
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft
```

### 2. 用示例需求生成并保存到文件

```powershell
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft --output output_draft.md
```

### 3. 用你自己的需求文件生成脚本

```powershell
python src/short_video_agent.py --brief my_brief.json --mode draft --output output_draft.md
```

### 4. 生成提示词包

这个模式不是直接输出脚本，而是输出一份“系统提示词 + 结构化需求”的组合包，适合你后面接入别的大模型。

```powershell
python src/short_video_agent.py --brief my_brief.json --mode prompt --output output_prompt.md
```

## 七、输出结果怎么理解

### `draft` 模式

这是最适合直接使用的模式。

输出的是一版完整脚本草案，包括：

- 视频目标和用户理解
- 内容切入策略
- 分时间段主脚本
- 钩子开头
- 标题建议
- 拍摄剪辑建议

### `prompt` 模式

这是给大模型或工作流系统使用的。

输出里会包含：

- 系统提示词
- 你的结构化需求
- 任务要求

如果你后面想把这个智能体接入 ChatGPT、OpenAI API、Dify、Coze、工作流平台，这个模式会很有用。

## 八、最常见的问题

### 1. 双击没反应怎么办

先确认电脑能运行 Python。

你可以按以下步骤检查：

1. 打开 PowerShell
2. 输入：

```powershell
python --version
```

如果能看到类似：

```powershell
Python 3.13.12
```

说明 Python 没问题。

### 2. 提示找不到文件怎么办

先确认你输入的 brief 路径是对的。

比如文件就在当前目录，就不要写错名字：

```powershell
my_brief.json
```

如果不确定，最简单的方式就是先把你的 JSON 文件放到项目根目录里。

### 3. 生成的内容不够像你要的风格怎么办

这很正常，因为现在是初版。

你可以把你想强化的方向告诉我，我继续帮你升级，比如：

- 更像抖音爆款口播
- 更适合小红书种草
- 更像老板 IP
- 更强转化
- 更适合知识博主
- 一次生成 3 个版本

## 九、你现在最推荐的使用顺序

如果你完全是第一次用，建议你按这个顺序来：

1. 双击 `start_agent.bat`
2. 输入 `1`
3. 看 `output_draft.md`
4. 再复制 `examples/sample_brief.json` 改成你自己的内容
5. 再双击 `start_agent.bat`
6. 输入 `2`
7. 生成你自己的脚本

## 十、你下一步可以直接这样做

如果你想马上开始，最简单的动作只有两个：

1. 双击 `start_agent.bat`
2. 输入 `1`

你先看一下生成结果，再把你自己的行业、产品、目标发给我，我就能继续把这个智能体往更专业的方向升级。
