(function () {
  const standaloneData = window.ShortVideoStandaloneData || {};

  const LIST_FIELDS = [
    "pain_points",
    "selling_points",
    "proof_points",
    "must_include",
    "must_avoid",
    "reference_accounts",
  ];

  const DEFAULTS = {
    topic: "",
    product_or_service: "",
    brand_name: "",
    industry: "",
    platform: "抖音",
    goal: "转化",
    script_type: "口播",
    duration_sec: 45,
    audience: "",
    persona: "",
    pain_points: [],
    selling_points: [],
    proof_points: [],
    must_include: [],
    must_avoid: [],
    style: "专业、真实、有节奏",
    tone: "可信、有温度、不夸张",
    cta: "",
    scene_requirements: "",
    reference_accounts: [],
    notes: "",
  };

  const PLATFORM_NOTES = {
    抖音: "前 1 秒结论先行，字幕密度更高，镜头切换保持紧凑。",
    快手: "优先真实生活感，少端着，强调接地气和可信度。",
    视频号: "表达更完整，强调信任建立和逻辑说服。",
    小红书: "更像经验分享，重视真实体验和可参考性。",
    B站: "允许信息更完整，但依然要避免前段拖沓。",
  };

  const GOAL_ANGLES = {
    转化: "降低试错成本，让观众愿意采取行动",
    涨粉: "用方法论或认知增量建立关注理由",
    获客: "给出解决方案，并自然引导私信或咨询",
    品牌传播: "让用户记住差异化认知点",
    引流到店: "放大线下体验价值和立即行动理由",
  };

  const DEFAULT_CTA = {
    转化: "如果你也在纠结怎么选，可以先按这个逻辑对照一遍。",
    涨粉: "如果你想继续看这类实用内容，记得关注。",
    获客: "如果你想按自己的情况具体判断，可以直接来问我。",
    品牌传播: "先把这条记下来，后面选的时候会更清楚。",
    引流到店: "如果你想线下实际感受，直接到店或预约更直观。",
  };

  function ensureList(value) {
    if (value === null || value === undefined) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/[，,、；;|/\r\n]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [String(value).trim()].filter(Boolean);
  }

  function cleanText(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value).trim();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeBrief(raw) {
    const brief = { ...DEFAULTS, ...(raw || {}) };

    Object.keys(brief).forEach((key) => {
      if (!LIST_FIELDS.includes(key)) {
        if (typeof brief[key] === "string" || brief[key] === null || brief[key] === undefined) {
          brief[key] = cleanText(brief[key]);
        }
      }
    });

    LIST_FIELDS.forEach((field) => {
      brief[field] = ensureList(brief[field]);
    });

    const duration = Number.parseInt(brief.duration_sec, 10);
    brief.duration_sec = Number.isFinite(duration) ? clamp(duration, 15, 180) : 45;

    if (!brief.topic) {
      if (brief.product_or_service) {
        brief.topic = brief.product_or_service;
      } else if (brief.industry) {
        brief.topic = `${brief.industry}内容`;
      } else {
        brief.topic = "短视频主题待补充";
      }
    }

    if (!brief.product_or_service) {
      brief.product_or_service = brief.topic;
    }

    if (!brief.platform) {
      brief.platform = "抖音";
    }
    if (!brief.goal) {
      brief.goal = "转化";
    }
    if (!brief.script_type) {
      brief.script_type = "口播";
    }
    if (!brief.cta) {
      brief.cta = DEFAULT_CTA[brief.goal] || DEFAULT_CTA.转化;
    }

    const assumptions = [];
    if (!brief.audience) {
      assumptions.push("未提供明确目标用户，本版默认按对该主题有明显需求的泛兴趣用户处理。");
    }
    if (!brief.pain_points.length) {
      assumptions.push("未提供明确痛点，本版默认从试错成本、选择困难和结果不确定性切入。");
    }
    if (!brief.selling_points.length) {
      assumptions.push("未提供明确卖点，本版默认围绕易理解、易感知、易转化的核心价值表达。");
    }
    if (!brief.proof_points.length) {
      assumptions.push("未提供证明材料，本版默认使用真实体验、画面细节和使用场景作为证据感来源。");
    }
    if (!brief.scene_requirements) {
      assumptions.push("未提供拍摄场景，本版默认按常见室内自述型拍摄设计。");
    }
    brief.assumptions = assumptions;

    return brief;
  }

  function allocateSeconds(totalSeconds, weights) {
    const raw = weights.map((weight) => totalSeconds * weight);
    const base = raw.map((value) => Math.max(1, Math.floor(value)));
    let diff = totalSeconds - base.reduce((sum, item) => sum + item, 0);
    let index = 0;
    while (diff !== 0) {
      const target = index % base.length;
      if (diff > 0) {
        base[target] += 1;
        diff -= 1;
      } else if (base[target] > 1) {
        base[target] -= 1;
        diff += 1;
      }
      index += 1;
    }
    return base;
  }

  function buildTimeRanges(totalSeconds) {
    const segments = allocateSeconds(totalSeconds, [0.16, 0.2, 0.24, 0.24, 0.16]);
    let cursor = 0;
    return segments.map((segment) => {
      const start = cursor;
      const end = cursor + segment;
      cursor = end;
      return `${start}-${end}s`;
    });
  }

  function getItems(brief) {
    const painPoints = brief.pain_points.length ? brief.pain_points : ["试错成本高", "选择困难"];
    const sellingPoints = brief.selling_points.length ? brief.selling_points : ["更容易理解的核心价值", "更贴近日常使用场景"];
    const proofPoints = brief.proof_points.length ? brief.proof_points : ["真实使用体验", "画面细节可感知", "场景化展示"];

    return {
      audience: brief.audience || "对该主题有需求的人",
      persona: brief.persona || "专业但真实",
      pain: painPoints[0],
      pain2: painPoints[1] || painPoints[0],
      sell: sellingPoints[0],
      sell2: sellingPoints[1] || "使用门槛低",
      proof: proofPoints[0],
      proof2: proofPoints[1] || proofPoints[0],
      topic: brief.topic,
      product: brief.product_or_service,
      brand: brief.brand_name || "品牌",
      cta: brief.cta,
      style: brief.style,
      tone: brief.tone,
      goal: brief.goal,
      platform: brief.platform,
      scene_requirements: brief.scene_requirements || "常规室内可拍场景",
    };
  }

  function buildHookOptions(brief, items) {
    const { topic, pain, sell, audience } = items;
    const scriptType = brief.script_type;

    if (scriptType === "知识分享") {
      return [
        `很多人以为${pain}是小问题，其实第一步方向就错了。`,
        `${audience}最容易忽略的，不是努力不够，而是没抓到${topic}的关键判断点。`,
        `如果你也一直被${pain}反复折腾，这条先别划走。`,
      ];
    }
    if (scriptType === "测评") {
      return [
        `别只看宣传，我用最直接的标准测一下${topic}到底值不值得。`,
        `关于${topic}，多数人踩雷不是因为预算不够，而是判断标准错了。`,
        `我把${topic}最该看的几件事，压缩成这几十秒讲清楚。`,
      ];
    }
    if (scriptType === "剧情") {
      return [
        `我本来只是想解决${pain}，结果第一步就差点又踩雷。`,
        `同样是做${topic}，为什么有人越做越顺，有人越做越乱？`,
        "这不是你不认真，而是很多人一开始就忽略了最关键的一点。",
      ];
    }
    if (scriptType === "探店") {
      return [
        "这家如果你只看表面，很容易错过它真正值得来的地方。",
        "我原本只是路过，结果因为一个细节决定认真拍给你看。",
        `如果你最近正想找靠谱的${topic}体验，这条可以先存一下。`,
      ];
    }
    return [
      `如果你也一直被${pain}困扰，先别急着继续乱试。`,
      `我最近判断${topic}只看两件事，其中一个就是${sell}。`,
      `很多人不是不会选${topic}，而是第一步就选错了。`,
    ];
  }

  function buildTitles(brief, items) {
    return [
      `${items.pain}的人，选${items.topic}前先看这条`,
      `别再盲买了，${items.topic}我现在只看这几点`,
      `${brief.duration_sec}秒讲清${items.topic}到底该怎么选`,
      `我为什么更看重${items.sell}，而不是花哨宣传`,
    ].slice(0, 4);
  }

  function buildContentStrategy(brief, items) {
    const angle = GOAL_ANGLES[brief.goal] || GOAL_ANGLES.转化;
    const platformNote = PLATFORM_NOTES[brief.platform] || "优先保证开头抓停和信息密度。";
    return [
      `核心角度：围绕“${items.pain}”切入，把${brief.goal}目标落到可感知的收益表达上。`,
      "情绪抓手：先让用户产生“这说的就是我”的代入，再给出更低试错成本的解决路径。",
      "说服路径：钩子抓停 -> 放大痛点 -> 给出判断标准/解决方案 -> 用真实体验建立信任 -> 自然 CTA。",
      `平台适配：${platformNote}`,
      `目标导向：${angle}。`,
    ];
  }

  function buildSceneBlueprint(scriptType) {
    const common = [
      {
        purpose: "抓停开场",
        visual: "人物近景直视镜头，0.5 秒内直接开口，可同步展示产品或问题场景。",
        voice: "{hook}",
        subtitle: "{pain}，先别急着继续乱试",
        rhythm: "第一句直接入题，删掉所有寒暄。",
      },
      {
        purpose: "放大痛点",
        visual: "切换到日常场景或问题细节特写，增强代入感。",
        voice: "很多人真正难受的不是没听过方法，而是{pain}和{pain2}反复出现，越选越乱。",
        subtitle: "{pain} + {pain2} + 试错成本高",
        rhythm: "2 到 3 个短句连续推进，不要解释太长。",
      },
      {
        purpose: "给出解决路径",
        visual: "人物边说边展示核心产品、服务流程或关键动作。",
        voice: "我现在判断{topic}，主要就看两件事：先看{sell}，再看{sell2}。这两点比花哨宣传更重要。",
        subtitle: "判断标准：{sell} / {sell2}",
        rhythm: "这一段负责建立专业感，句子要短而稳。",
      },
      {
        purpose: "建立信任",
        visual: "补真实使用、近景细节、对比或环境镜头，让观众看到证据感。",
        voice: "像我自己会重点看{proof}。因为真正让人愿意继续用下去的，往往就是这些能被直接感知到的细节。",
        subtitle: "真实体验比口号更有说服力",
        rhythm: "镜头建议从口播切到细节特写，强化可信度。",
      },
      {
        purpose: "收束与 CTA",
        visual: "回到人物主镜头，稳定表达下一步动作。",
        voice: "如果你也正在纠结{topic}，别先看一堆大词，先看这套逻辑。{cta}",
        subtitle: "{cta}",
        rhythm: "收口要干净，CTA 自然，不要突然拔高音量。",
      },
    ];

    if (scriptType === "知识分享") {
      common[2].voice = "先别急着堆方法，第一步先判断自己是不是卡在{pain}，第二步再看{sell}和{sell2}这两个关键点。";
      common[3].voice = "你只要把{proof}这种能实际看到、摸到、感受到的部分讲清，观众就更容易信。";
    } else if (scriptType === "测评") {
      common[1].voice = "多数人踩雷，不是预算问题，而是没有统一的判断标准，所以看谁都像推荐。";
      common[2].voice = "我这次就只按几个维度看：{sell}、{sell2}，还有真实场景下到底顺不顺手。";
      common[3].voice = "真正拉开差距的，通常不是宣传词，而是{proof}这种能被镜头直接拍出来的细节。";
    } else if (scriptType === "剧情") {
      common[1].visual = "剧情化演绎冲突，先给错误选择或失败尝试。";
      common[1].voice = "一开始我也以为随便选一个就行，结果最先出问题的，偏偏就是{pain}。";
      common[2].voice = "后来我才发现，关键不是堆选择，而是先抓住{sell}和{sell2}这两个真正影响结果的点。";
    } else if (scriptType === "探店") {
      common[0].visual = "门头或环境快切后，立刻回到人和场景亮点。";
      common[1].voice = "很多店看起来都差不多，但真正决定你会不会二刷的，往往不是热闹，而是细节体验。";
      common[2].voice = "这次我主要看了三件事：{sell}、{sell2}，以及整个过程是不是舒服顺畅。";
      common[3].voice = "最让我愿意拍下来的是{proof}，这种细节一旦到位，体验感就不是一句好不好吃、值不值得能概括的。";
    } else if (scriptType === "带货") {
      common[2].voice = "我现在选{topic}不会听太多包装话术，先看{sell}，再看{sell2}，这两个最容易决定你会不会后悔。";
      common[4].voice = "如果你也准备入手{topic}，先按这个逻辑筛一遍。{cta}";
    }

    return common;
  }

  function formatTemplate(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || "");
  }

  function renderTable(brief, items, hookOptions) {
    const timeRanges = buildTimeRanges(brief.duration_sec);
    const blueprint = buildSceneBlueprint(brief.script_type);
    const formatItems = { ...items, hook: hookOptions[0] };
    const rows = blueprint.map((section, index) => {
      const row = [
        timeRanges[index],
        section.purpose,
        formatTemplate(section.visual, formatItems),
        formatTemplate(section.voice, formatItems),
        formatTemplate(section.subtitle, formatItems),
        formatTemplate(section.rhythm, formatItems),
      ].map((value) => String(value).replace(/\n/g, " "));
      return `| ${row.join(" | ")} |`;
    });

    return [
      "| 时间段 | 段落目的 | 画面/镜头 | 口播/对白 | 字幕重点 | 节奏建议 |",
      "| --- | --- | --- | --- | --- | --- |",
      ...rows,
    ].join("\n");
  }

  function renderAssumptions(brief) {
    if (!brief.assumptions.length) {
      return "- 本次输入信息较完整，本版未额外补充高风险假设。";
    }
    return brief.assumptions.map((item) => `- ${item}`).join("\n");
  }

  function renderDraft(briefInput) {
    const brief = normalizeBrief(briefInput);
    const items = getItems(brief);
    const hookOptions = buildHookOptions(brief, items);
    const titles = buildTitles(brief, items);
    const strategy = buildContentStrategy(brief, items);
    const notes = [
      `开头 1 秒就抛出“${items.pain}”或结果，不要用自我介绍开场。`,
      "口播每句尽量控制在 8 到 18 个字之间，方便上镜和剪辑。",
      "优先拍近景表情、动作细节、产品或场景特写，再补环境镜头。",
      `如果是 ${brief.platform} 发布，字幕关键词建议高亮“痛点、判断标准、CTA”。`,
      `拍摄场景建议：${items.scene_requirements}。`,
    ];

    const mustInclude = brief.must_include.length
      ? brief.must_include.map((item) => `- ${item}`).join("\n")
      : "- 暂无强制植入要求。";
    const mustAvoid = brief.must_avoid.length
      ? brief.must_avoid.map((item) => `- ${item}`).join("\n")
      : "- 暂无额外禁用表达。";

    return [
      "# 专业短视频脚本草案",
      "",
      "## 需求理解",
      `- 视频目标：${brief.goal}`,
      `- 目标用户：${items.audience}`,
      `- 核心主题：${brief.topic}`,
      `- 内容形式：${brief.script_type}`,
      `- 建议时长：${brief.duration_sec} 秒`,
      `- 核心痛点：${items.pain}；${items.pain2}`,
      `- 核心卖点：${items.sell}；${items.sell2}`,
      "",
      "## 内容策略",
      ...strategy.map((line) => `- ${line}`),
      "",
      "## 主脚本",
      renderTable(brief, items, hookOptions),
      "",
      "## 备选开头",
      ...hookOptions.map((line, index) => `${index + 1}. ${line}`),
      "",
      "## 标题建议",
      ...titles.map((line, index) => `${index + 1}. ${line}`),
      "",
      "## 拍摄与剪辑提示",
      ...notes.map((line) => `- ${line}`),
      "",
      "## 必须包含",
      mustInclude,
      "",
      "## 必须规避",
      mustAvoid,
      "",
      "## 信息缺口与默认假设",
      renderAssumptions(brief),
      "",
    ].join("\n");
  }

  function renderPromptPacket(briefInput) {
    const brief = normalizeBrief(briefInput);
    const promptJson = JSON.stringify(brief, null, 2);
    return [
      "# Short Video Script Agent Prompt Packet",
      "",
      "## System Prompt",
      standaloneData.systemPrompt || "系统提示词文件缺失，请补充。",
      "",
      "## Structured Brief",
      "```json",
      promptJson,
      "```",
      "",
      "## User Task",
      "请基于以上系统提示词和结构化需求，输出一版专业短视频脚本，遵守以下要求：",
      "- 严格按需求理解、内容策略、主脚本、备选开头、标题建议、拍摄与剪辑提示、信息缺口与默认假设的顺序输出。",
      "- 主脚本必须使用表格输出。",
      "- 语言口语化、可拍摄、可剪辑、可直接口播。",
      "- 如果信息不完整，主动写出默认假设，不要拒绝生成。",
      "",
    ].join("\n");
  }

  window.ShortVideoClientGenerator = {
    normalizeBrief,
    renderDraft,
    renderPromptPacket,
  };
})();
