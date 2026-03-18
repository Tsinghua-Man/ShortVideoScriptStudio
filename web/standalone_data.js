window.ShortVideoStandaloneData = {
  fieldGroups: [
    {
      title: "内容定位",
      description: "先把这条视频讲什么、服务谁、基于什么产品说清楚。",
      fields: [
        { name: "topic", label: "视频主题", type: "text", placeholder: "例如：敏感肌修护精华分享", required: true },
        { name: "product_or_service", label: "产品 / 服务", type: "text", placeholder: "例如：修护精华液、减脂训练营、本地探店套餐" },
        { name: "brand_name", label: "品牌名称", type: "text", placeholder: "例如：某新锐护肤品牌" },
        { name: "industry", label: "所属行业", type: "text", placeholder: "例如：美妆护肤、教育培训、本地生活" },
      ],
    },
    {
      title: "发布目标",
      description: "这些字段会直接影响脚本节奏、表达方式和 CTA 强度。",
      fields: [
        { name: "platform", label: "发布平台", type: "select", options: ["抖音", "小红书", "视频号", "快手", "B站"] },
        { name: "goal", label: "视频目标", type: "select", options: ["转化", "涨粉", "获客", "品牌传播", "引流到店"] },
        { name: "script_type", label: "脚本类型", type: "select", options: ["口播", "带货", "知识分享", "测评", "剧情", "探店"] },
        { name: "duration_sec", label: "视频时长（秒）", type: "number", min: 15, max: 180, step: 5, placeholder: "45" },
      ],
    },
    {
      title: "用户与人设",
      description: "写得越具体，脚本越像在跟真实用户说话。",
      fields: [
        { name: "audience", label: "目标用户", type: "textarea", placeholder: "例如：25-35 岁容易泛红、熬夜后状态不稳定的女性上班族" },
        { name: "persona", label: "出镜人设", type: "text", placeholder: "例如：专业、真诚，像朋友分享真实使用感" },
        { name: "cta", label: "行动引导 CTA", type: "textarea", placeholder: "例如：评论区留言“修护”，我把我的使用思路发你" },
      ],
    },
    {
      title: "痛点与卖点",
      description: "这部分建议一行写一条，生成器会自动整理成结构化脚本。",
      fields: [
        { name: "pain_points", label: "用户痛点", type: "textarea", placeholder: "每行一条，例如：\n脸容易泛红\n上妆容易卡粉\n买护肤品反复踩雷" },
        { name: "selling_points", label: "核心卖点", type: "textarea", placeholder: "每行一条，例如：\n质地轻薄不黏\n适合妆前使用\n舒缓感更明显" },
        { name: "proof_points", label: "证明点 / 证据感", type: "textarea", placeholder: "每行一条，例如：\n上脸延展性和吸收感\n妆前服帖状态\n连续使用后的稳定感" },
      ],
    },
    {
      title: "风格与限制",
      description: "把想要保留和必须规避的表达写清楚，出稿会更稳。",
      fields: [
        { name: "must_include", label: "必须包含", type: "textarea", placeholder: "每行一条，例如：\n真实使用场景\n降低试错门槛的话术" },
        { name: "must_avoid", label: "必须规避", type: "textarea", placeholder: "每行一条，例如：\n绝对化功效承诺\n医疗化表述" },
        { name: "style", label: "整体风格", type: "text", placeholder: "例如：专业、真实、有节奏" },
        { name: "tone", label: "语气方向", type: "text", placeholder: "例如：可信、有温度、不夸张" },
      ],
    },
    {
      title: "场景与备注",
      description: "补充拍摄环境、参考账号或特殊要求，方便脚本更贴近实际拍摄。",
      fields: [
        { name: "scene_requirements", label: "拍摄场景要求", type: "textarea", placeholder: "例如：尽量在家中梳妆台和自然光环境完成拍摄" },
        { name: "reference_accounts", label: "参考账号方向", type: "textarea", placeholder: "每行一条，例如：\n真实口碑类护肤分享账号" },
        { name: "notes", label: "补充说明", type: "textarea", placeholder: "例如：不要像硬广，要像使用一段时间后的真实推荐" },
      ],
    },
  ],
  sampleBrief: {
    topic: "敏感肌修护精华分享",
    product_or_service: "修护精华液",
    brand_name: "某新锐护肤品牌",
    industry: "美妆护肤",
    platform: "抖音",
    goal: "转化",
    script_type: "口播",
    duration_sec: 45,
    audience: "25-35 岁容易泛红、熬夜后状态不稳定的女性上班族",
    persona: "专业、真诚，像朋友分享真实使用感",
    pain_points: ["脸容易泛红", "上妆容易卡粉", "买护肤品反复踩雷"],
    selling_points: ["质地轻薄不黏", "适合妆前使用", "舒缓感更明显"],
    proof_points: ["上脸延展性和吸收感", "妆前服帖状态", "连续使用后的稳定感"],
    must_include: ["真实使用场景", "降低试错门槛的话术"],
    must_avoid: ["绝对化功效承诺", "医疗化表述"],
    style: "专业、真实、有节奏",
    tone: "可信、有温度、不贩卖焦虑",
    cta: "评论区留言“修护”，我把我的使用思路发你",
    scene_requirements: "尽量在家中梳妆台和自然光环境完成拍摄",
    reference_accounts: ["真实口碑类护肤分享账号"],
    notes: "不要像硬广，要像使用一段时间后的真实推荐",
  },
  modeLabels: {
    draft: "脚本草案",
    prompt: "提示词包",
  },
  systemPrompt: `# 角色设定

你是一名专业的短视频脚本生成智能体，同时具备以下角色能力：

- 短视频编导
- 内容增长策划
- 商业文案顾问
- 账号运营顾问
- 分镜与拍摄节奏设计师

你的任务不是简单“写文案”，而是基于用户需求，产出一版真正适合发布、拍摄、剪辑、转化的短视频脚本。

# 核心目标

1. 在前 3 秒抓住用户注意力
2. 在前 10 到 15 秒建立“这条内容和我有关”的感知
3. 把卖点转译成用户能感知的收益点
4. 让脚本既能拍、也能剪、还能口播
5. 在结尾自然引出 CTA，而不是生硬硬广

# 适用内容类型

- 口播
- 带货
- 知识分享
- 测评
- 剧情
- 探店
- 经验分享
- 转化型内容

# 工作流程

在生成脚本前，你必须先完成以下判断：

1. 明确视频目标
   - 是涨粉、转化、获客、品牌传播、还是引流到店
2. 明确受众
   - 用户是谁
   - 他们最强的痛点、犹豫点、误区是什么
3. 明确平台节奏
   - 抖音更强调抓停和密度
   - 视频号更强调信任和完整表达
   - 小红书更强调经验感和真实分享
4. 明确脚本推进逻辑
   - 钩子
   - 冲突或问题
   - 解决路径
   - 证明
   - CTA
5. 明确可执行性
   - 口播能否说得顺
   - 镜头能否拍得出
   - 字幕是否能一眼看懂

# 输出原则

1. 不写空话
   - 避免“非常好”“真的绝了”“强烈推荐”这类空泛表达
2. 不写书面腔
   - 口播要像真实的人在说话
3. 不只写卖点
   - 要把卖点翻译成用户收益
4. 不做无依据承诺
   - 尤其避免绝对化功效、收益、结果承诺
5. 不只追求文采
   - 重点是信息有效、节奏有效、转化有效
6. 不把用户缺失信息当成阻塞
   - 信息不完整时，用最保守的方式做默认假设，并明确写出来

# 高质量脚本的判断标准

- 开头是否有抓停
- 观众是否能快速代入
- 核心信息是否足够具体
- 每一段是否推动信息前进
- 是否有可拍摄的画面感
- 是否有真实感和可信度
- CTA 是否自然

# 固定输出结构

必须按以下模块输出：

## 一、需求理解

- 视频目标
- 目标用户
- 核心主题
- 主要痛点
- 核心卖点

## 二、内容策略

- 本条视频建议采用的核心角度
- 建议的情绪抓手
- 转化路径或说服路径
- 平台适配要点

## 三、主脚本

使用结构化表格输出，字段至少包含：

- 时间段
- 段落目的
- 画面/镜头
- 口播/对白
- 字幕重点
- 节奏建议

## 四、备选开头

至少给 3 个不同方向的钩子开头。

## 五、标题建议

给出 3 到 5 个可直接使用或再加工的标题。

## 六、拍摄与剪辑提示

给出简洁、可执行的拍摄建议和剪辑建议。

## 七、信息缺口与默认假设

如果用户信息不完整，要主动写出你使用了哪些默认假设，方便下一轮优化。

# 风格要求

- 专业，但不要端着
- 有策略感，但不要像写方案
- 有情绪张力，但不要浮夸
- 有转化意识，但不要过度推销
- 语言短句化、口语化、可上镜`,
};
