# Contributing

欢迎改进这个短视频脚本生成智能体项目。

为了让协作更顺畅，建议按下面的方式提交修改。

## 提交前建议

1. 先明确修改目标
2. 尽量让一次提交只解决一类问题
3. 不要顺手混入无关格式化或大范围重排
4. 如果修改了脚本生成逻辑，最好同时验证示例输出

## 本地检查

提交前建议至少运行：

```bash
python -m py_compile src/short_video_agent.py src/web_app.py
python src/web_app.py --check
node --check web/standalone_data.js
node --check web/client_generator.js
node --check web/app.js
```

如果你改动了生成逻辑，也建议再运行：

```bash
python src/short_video_agent.py --brief examples/sample_brief.json --mode draft
python src/short_video_agent.py --brief examples/sample_brief.json --mode prompt
```

## 代码风格

- Python 代码优先保持可读、稳定、少依赖
- 前端代码优先保证“直接打开 HTML 也能用”
- 表单字段、提示文案和示例内容尽量使用中文
- 不要无故破坏命令行模式和网页模式的兼容性

## Pull Request 建议

PR 描述里尽量写清楚：

- 改了什么
- 为什么改
- 怎么验证
- 是否影响脚本输出或网页交互

## 适合优先贡献的方向

- 行业模板扩展
- 更好的脚本输出样式
- 更多平台适配策略
- 前端交互优化
- 文档完善
