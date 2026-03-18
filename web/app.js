const STORAGE_KEY = "short-video-script-web-ui-v1";

const state = {
  fieldGroups: [],
  sampleBrief: {},
  latestResult: "",
  latestMode: "draft",
  modeLabels: {
    draft: "脚本草案",
    prompt: "提示词包",
  },
  runtimeSource: "server",
  apiAvailable: false,
};

const elements = {
  briefForm: document.getElementById("briefForm"),
  formStatus: document.getElementById("formStatus"),
  resultOutput: document.getElementById("resultOutput"),
  resultMeta: document.getElementById("resultMeta"),
  modeChip: document.getElementById("modeChip"),
  modeLabel: document.getElementById("modeLabel"),
  filledCount: document.getElementById("filledCount"),
  fieldCount: document.getElementById("fieldCount"),
  loadSampleButton: document.getElementById("loadSampleButton"),
  clearButton: document.getElementById("clearButton"),
  generateDraftButton: document.getElementById("generateDraftButton"),
  generatePromptButton: document.getElementById("generatePromptButton"),
  copyResultButton: document.getElementById("copyResultButton"),
  downloadResultButton: document.getElementById("downloadResultButton"),
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const bootstrap = await loadBootstrap();
    state.fieldGroups = bootstrap.field_groups;
    state.sampleBrief = bootstrap.sample_brief;
    state.modeLabels = bootstrap.mode_labels || state.modeLabels;
    state.runtimeSource = bootstrap.source || "server";
    state.apiAvailable = state.runtimeSource === "server";

    renderForm(state.fieldGroups);
    bindEvents();

    const savedBrief = readStoredBrief();
    if (savedBrief) {
      fillForm(savedBrief);
      setFormStatus(getRestoreMessage(bootstrap.warning));
    } else {
      fillForm(state.sampleBrief);
      setFormStatus(getSampleLoadMessage(bootstrap.warning));
    }

    elements.resultMeta.textContent = getRuntimeIntro();
    updateFilledCount();
  } catch (error) {
    elements.resultOutput.textContent = `页面初始化失败：${error.message}`;
    elements.resultMeta.textContent = "当前页面没有成功完成初始化，请刷新页面或改用 start_web_ui.bat 启动。";
  }
});

function getStandaloneBootstrap() {
  const data = window.ShortVideoStandaloneData;
  if (!data || !data.fieldGroups || !data.sampleBrief) {
    return null;
  }
  return {
    field_groups: data.fieldGroups,
    sample_brief: data.sampleBrief,
    mode_labels: data.modeLabels || state.modeLabels,
    source: "standalone",
  };
}

async function loadBootstrap() {
  const standalone = getStandaloneBootstrap();

  if (window.location.protocol === "file:") {
    if (!standalone) {
      throw new Error("缺少离线模式所需的数据文件。");
    }
    return {
      ...standalone,
      warning: "当前是直接打开 index.html 的模式，已切换为浏览器本地生成。",
    };
  }

  try {
    const bootstrap = await fetchBootstrap();
    return {
      ...bootstrap,
      source: "server",
    };
  } catch (error) {
    if (!standalone) {
      throw error;
    }
    return {
      ...standalone,
      warning: `未连接到本地服务，已自动切换为浏览器本地生成。原因：${error.message}`,
    };
  }
}

async function fetchBootstrap() {
  const response = await fetch("/api/bootstrap");
  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error || "加载表单配置失败。");
  }
  return payload;
}

async function readJsonResponse(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error("服务器返回了无法解析的数据。");
  }
}

function renderForm(groups) {
  const sectionHtml = groups
    .map((group, groupIndex) => {
      const isTwoColumn = group.fields.length >= 4;
      const fieldsHtml = group.fields.map(renderField).join("");
      return `
        <section class="form-section">
          <div>
            <p class="panel-kicker">Section ${String(groupIndex + 1).padStart(2, "0")}</p>
            <h3>${group.title}</h3>
            <p class="section-description">${group.description}</p>
          </div>
          <div class="field-grid ${isTwoColumn ? "two-column" : ""}">
            ${fieldsHtml}
          </div>
        </section>
      `;
    })
    .join("");

  elements.briefForm.innerHTML = sectionHtml;
  elements.fieldCount.textContent = String(getFieldMeta().length);
}

function renderField(field) {
  const helper = getFieldHelper(field);
  const inputHtml = renderInput(field);
  return `
    <div class="field">
      <div class="field-label-row">
        <label for="${field.name}">${field.label}</label>
        <span class="meta-code">${field.name}</span>
      </div>
      ${inputHtml}
      <div class="field-helper">${helper}</div>
    </div>
  `;
}

function renderInput(field) {
  if (field.type === "select") {
    return `
      <select id="${field.name}" name="${field.name}" data-field="${field.name}">
        <option value="">请选择</option>
        ${field.options.map((option) => `<option value="${option}">${option}</option>`).join("")}
      </select>
    `;
  }

  if (field.type === "textarea") {
    return `
      <textarea
        id="${field.name}"
        name="${field.name}"
        data-field="${field.name}"
        placeholder="${field.placeholder || ""}"
      ></textarea>
    `;
  }

  const inputType = field.type === "number" ? "number" : "text";
  const minAttr = field.min !== undefined ? `min="${field.min}"` : "";
  const maxAttr = field.max !== undefined ? `max="${field.max}"` : "";
  const stepAttr = field.step !== undefined ? `step="${field.step}"` : "";

  return `
    <input
      id="${field.name}"
      name="${field.name}"
      data-field="${field.name}"
      type="${inputType}"
      placeholder="${field.placeholder || ""}"
      ${minAttr}
      ${maxAttr}
      ${stepAttr}
    />
  `;
}

function getFieldHelper(field) {
  if (field.type === "textarea") {
    if (
      field.name.endsWith("_points") ||
      field.name === "must_include" ||
      field.name === "must_avoid" ||
      field.name === "reference_accounts"
    ) {
      return "建议每行填写一条，也支持中文逗号、顿号、换行分隔。";
    }
    return "可直接填写自然语言描述，越具体越好。";
  }
  if (field.type === "number") {
    return "建议填写 15-180 之间的整数，系统会自动校正范围。";
  }
  if (field.type === "select") {
    return "选择后会影响脚本的节奏、风格和转化路径。";
  }
  return "可选填，但信息越完整，生成结果越贴近你的需求。";
}

function bindEvents() {
  elements.briefForm.addEventListener("input", handleFormChange);
  elements.briefForm.addEventListener("change", handleFormChange);

  elements.loadSampleButton.addEventListener("click", () => {
    fillForm(state.sampleBrief);
    persistCurrentBrief();
    updateFilledCount();
    setFormStatus(`已重新载入示例内容。${getRuntimeShortHint()}`);
  });

  elements.clearButton.addEventListener("click", () => {
    clearForm();
    persistCurrentBrief();
    updateFilledCount();
    setFormStatus(`表单已清空。${getRuntimeShortHint()}`);
  });

  elements.generateDraftButton.addEventListener("click", () => generate("draft"));
  elements.generatePromptButton.addEventListener("click", () => generate("prompt"));
  elements.copyResultButton.addEventListener("click", copyResult);
  elements.downloadResultButton.addEventListener("click", downloadResult);
}

function handleFormChange() {
  persistCurrentBrief();
  updateFilledCount();
}

function getFieldMeta() {
  return state.fieldGroups.flatMap((group) => group.fields);
}

function fillForm(data) {
  getFieldMeta().forEach((field) => {
    const element = document.getElementById(field.name);
    if (!element) {
      return;
    }

    const value = data[field.name];
    if (Array.isArray(value)) {
      element.value = value.join("\n");
    } else if (value === null || value === undefined) {
      element.value = "";
    } else {
      element.value = String(value);
    }
  });
}

function clearForm() {
  getFieldMeta().forEach((field) => {
    const element = document.getElementById(field.name);
    if (!element) {
      return;
    }
    element.value = "";
  });
}

function collectBrief() {
  const brief = {};
  getFieldMeta().forEach((field) => {
    const element = document.getElementById(field.name);
    if (!element) {
      return;
    }
    const rawValue = element.value.trim();
    if (field.type === "number") {
      const parsedValue = Number(rawValue);
      brief[field.name] = rawValue && Number.isFinite(parsedValue) ? parsedValue : "";
      return;
    }
    brief[field.name] = rawValue;
  });
  return brief;
}

function persistCurrentBrief() {
  try {
    const brief = collectBrief();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brief));
  } catch {
    setFormStatus("当前浏览器未能保存本地草稿，但不影响继续生成。");
  }
}

function readStoredBrief() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures and fall back to sample data.
    }
    return null;
  }
}

function updateFilledCount() {
  const brief = collectBrief();
  const filled = getFieldMeta().filter((field) => {
    const value = brief[field.name];
    if (typeof value === "number") {
      return !Number.isNaN(value) && value !== 0;
    }
    return Boolean(String(value || "").trim());
  }).length;
  elements.filledCount.textContent = String(filled);
}

function setFormStatus(text) {
  elements.formStatus.textContent = text;
}

function setLoadingState(isLoading, mode) {
  elements.generateDraftButton.disabled = isLoading;
  elements.generatePromptButton.disabled = isLoading;
  elements.copyResultButton.disabled = isLoading || !state.latestResult;
  elements.downloadResultButton.disabled = isLoading || !state.latestResult;

  if (isLoading) {
    state.latestResult = "";
    elements.modeChip.textContent = mode === "prompt" ? "提示词包生成中" : "脚本生成中";
    elements.modeLabel.textContent = elements.modeChip.textContent;
    elements.resultMeta.textContent = "正在整理需求并生成内容，请稍等几秒。";
    elements.resultOutput.textContent = "生成中...";
  }
}

async function generate(mode) {
  setLoadingState(true, mode);
  const brief = collectBrief();

  try {
    let payload;
    if (state.apiAvailable) {
      try {
        payload = await generateWithServer(mode, brief);
      } catch (error) {
        payload = generateWithClient(mode, brief);
        payload.runtime_note = `本地服务暂时不可用，已自动切换为浏览器本地生成。原因：${error.message}`;
        state.runtimeSource = "standalone";
        state.apiAvailable = false;
      }
    } else {
      payload = generateWithClient(mode, brief);
    }

    state.latestResult = payload.result;
    state.latestMode = payload.mode;

    elements.modeChip.textContent = payload.mode_label;
    elements.modeLabel.textContent = payload.mode_label;
    elements.resultMeta.textContent = buildResultMeta(payload);
    elements.resultOutput.textContent = payload.result;
    elements.copyResultButton.disabled = false;
    elements.downloadResultButton.disabled = false;
    setFormStatus(`已完成${payload.mode_label}生成。${payload.runtime_note || getRuntimeShortHint()}`);
  } catch (error) {
    state.latestResult = "";
    elements.resultMeta.textContent = "生成时出现问题。";
    elements.resultOutput.textContent = `生成失败：${error.message}`;
    elements.copyResultButton.disabled = true;
    elements.downloadResultButton.disabled = true;
  } finally {
    elements.generateDraftButton.disabled = false;
    elements.generatePromptButton.disabled = false;
    elements.copyResultButton.disabled = !state.latestResult;
    elements.downloadResultButton.disabled = !state.latestResult;
  }
}

async function generateWithServer(mode, brief) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      mode,
      brief,
    }),
  });

  const payload = await readJsonResponse(response);
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "生成失败。");
  }
  payload.runtime_note = "当前由本地服务生成。";
  return payload;
}

function generateWithClient(mode, brief) {
  const generator = window.ShortVideoClientGenerator;
  if (!generator) {
    throw new Error("缺少浏览器本地生成器文件。");
  }

  const normalizedBrief = generator.normalizeBrief(brief);
  const result = mode === "prompt"
    ? generator.renderPromptPacket(normalizedBrief)
    : generator.renderDraft(normalizedBrief);

  return {
    ok: true,
    mode,
    mode_label: state.modeLabels[mode] || mode,
    brief: normalizedBrief,
    result,
    runtime_note: "当前由浏览器本地生成，无需启动本地服务。",
  };
}

function buildResultMeta(payload) {
  const brief = payload.brief || {};
  const assumptionCount = Array.isArray(brief.assumptions) ? brief.assumptions.length : 0;
  const assumptionText = assumptionCount > 0 ? `已补充 ${assumptionCount} 条默认假设。` : "本次输入信息较完整。";
  const runtimeText = payload.runtime_note || getRuntimeIntro();
  return `已生成${payload.mode_label}。平台：${brief.platform || "未填写"}；目标：${brief.goal || "未填写"}；类型：${brief.script_type || "未填写"}。${assumptionText} ${runtimeText}`;
}

async function copyResult() {
  if (!state.latestResult) {
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(state.latestResult);
    } else {
      legacyCopyText(state.latestResult);
    }
    elements.resultMeta.textContent = "结果已复制到剪贴板。";
  } catch {
    elements.resultMeta.textContent = "复制失败，请手动选中文本。";
  }
}

function legacyCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "readonly");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function downloadResult() {
  if (!state.latestResult) {
    return;
  }

  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "_",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");
  const prefix = state.latestMode === "prompt" ? "prompt_packet" : "script_draft";
  const blob = new Blob([state.latestResult], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${prefix}_${timestamp}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function getRuntimeIntro() {
  if (state.runtimeSource === "standalone") {
    return "当前为浏览器本地生成模式，直接打开 index.html 也可以使用。";
  }
  return "当前已连接本地服务，由 Python 生成脚本。";
}

function getRuntimeShortHint() {
  if (state.runtimeSource === "standalone") {
    return "当前是浏览器本地生成模式。";
  }
  return "当前已连接本地服务。";
}

function getRestoreMessage(warning) {
  if (warning) {
    return `${warning} 已恢复上次编辑内容，你可以继续修改后生成。`;
  }
  return state.runtimeSource === "standalone"
    ? "已恢复上次编辑内容，当前为浏览器本地生成模式。"
    : "已恢复上次编辑内容，你可以继续修改后生成。";
}

function getSampleLoadMessage(warning) {
  if (warning) {
    return `${warning} 已载入示例内容，你可以直接修改后生成。`;
  }
  return state.runtimeSource === "standalone"
    ? "已载入示例内容，当前为浏览器本地生成模式。"
    : "已载入示例内容，你可以直接修改后生成。";
}
