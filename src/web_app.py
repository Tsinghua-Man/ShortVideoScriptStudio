from __future__ import annotations

import argparse
import json
import threading
import urllib.error
import urllib.request
import webbrowser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

try:
    from .short_video_agent import normalize_brief, render_draft, render_prompt_packet
except ImportError:
    import sys

    CURRENT_DIR = Path(__file__).resolve().parent
    if str(CURRENT_DIR) not in sys.path:
        sys.path.insert(0, str(CURRENT_DIR))
    from short_video_agent import normalize_brief, render_draft, render_prompt_packet


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = PROJECT_ROOT / "web"
SAMPLE_BRIEF_PATH = PROJECT_ROOT / "examples" / "sample_brief.json"

FIELD_GROUPS: list[dict[str, Any]] = [
    {
        "title": "内容定位",
        "description": "先把这条视频讲什么、服务谁、基于什么产品说清楚。",
        "fields": [
            {"name": "topic", "label": "视频主题", "type": "text", "placeholder": "例如：敏感肌修护精华分享", "required": True},
            {"name": "product_or_service", "label": "产品 / 服务", "type": "text", "placeholder": "例如：修护精华液、减脂训练营、本地探店套餐"},
            {"name": "brand_name", "label": "品牌名称", "type": "text", "placeholder": "例如：某新锐护肤品牌"},
            {"name": "industry", "label": "所属行业", "type": "text", "placeholder": "例如：美妆护肤、教育培训、本地生活"},
        ],
    },
    {
        "title": "发布目标",
        "description": "这些字段会直接影响脚本节奏、表达方式和 CTA 强度。",
        "fields": [
            {"name": "platform", "label": "发布平台", "type": "select", "options": ["抖音", "小红书", "视频号", "快手", "B站"]},
            {"name": "goal", "label": "视频目标", "type": "select", "options": ["转化", "涨粉", "获客", "品牌传播", "引流到店"]},
            {"name": "script_type", "label": "脚本类型", "type": "select", "options": ["口播", "带货", "知识分享", "测评", "剧情", "探店"]},
            {"name": "duration_sec", "label": "视频时长（秒）", "type": "number", "min": 15, "max": 180, "step": 5, "placeholder": "45"},
        ],
    },
    {
        "title": "用户与人设",
        "description": "写得越具体，脚本越像在跟真实用户说话。",
        "fields": [
            {"name": "audience", "label": "目标用户", "type": "textarea", "placeholder": "例如：25-35 岁容易泛红、熬夜后状态不稳定的女性上班族"},
            {"name": "persona", "label": "出镜人设", "type": "text", "placeholder": "例如：专业、真诚，像朋友分享真实使用感"},
            {"name": "cta", "label": "行动引导 CTA", "type": "textarea", "placeholder": "例如：评论区留言“修护”，我把我的使用思路发你"},
        ],
    },
    {
        "title": "痛点与卖点",
        "description": "这部分建议一行写一条，生成器会自动整理成结构化脚本。",
        "fields": [
            {"name": "pain_points", "label": "用户痛点", "type": "textarea", "placeholder": "每行一条，例如：\n脸容易泛红\n上妆容易卡粉\n买护肤品反复踩雷"},
            {"name": "selling_points", "label": "核心卖点", "type": "textarea", "placeholder": "每行一条，例如：\n质地轻薄不黏\n适合妆前使用\n舒缓感更明显"},
            {"name": "proof_points", "label": "证明点 / 证据感", "type": "textarea", "placeholder": "每行一条，例如：\n上脸延展性和吸收感\n妆前服帖状态\n连续使用后的稳定感"},
        ],
    },
    {
        "title": "风格与限制",
        "description": "把想要保留和必须规避的表达写清楚，出稿会更稳。",
        "fields": [
            {"name": "must_include", "label": "必须包含", "type": "textarea", "placeholder": "每行一条，例如：\n真实使用场景\n降低试错门槛的话术"},
            {"name": "must_avoid", "label": "必须规避", "type": "textarea", "placeholder": "每行一条，例如：\n绝对化功效承诺\n医疗化表述"},
            {"name": "style", "label": "整体风格", "type": "text", "placeholder": "例如：专业、真实、有节奏"},
            {"name": "tone", "label": "语气方向", "type": "text", "placeholder": "例如：可信、有温度、不夸张"},
        ],
    },
    {
        "title": "场景与备注",
        "description": "补充拍摄环境、参考账号或特殊要求，方便脚本更贴近实际拍摄。",
        "fields": [
            {"name": "scene_requirements", "label": "拍摄场景要求", "type": "textarea", "placeholder": "例如：尽量在家中梳妆台和自然光环境完成拍摄"},
            {"name": "reference_accounts", "label": "参考账号方向", "type": "textarea", "placeholder": "每行一条，例如：\n真实口碑类护肤分享账号"},
            {"name": "notes", "label": "补充说明", "type": "textarea", "placeholder": "例如：不要像硬广，要像使用一段时间后的真实推荐"},
        ],
    },
]

MODE_LABELS = {"draft": "脚本草案", "prompt": "提示词包"}


def load_sample_brief() -> dict[str, Any]:
    return json.loads(SAMPLE_BRIEF_PATH.read_text(encoding="utf-8"))


def bootstrap_payload() -> dict[str, Any]:
    return {
        "field_groups": FIELD_GROUPS,
        "sample_brief": load_sample_brief(),
        "mode_labels": MODE_LABELS,
    }


def parse_json_body(handler: SimpleHTTPRequestHandler) -> dict[str, Any]:
    try:
        content_length = int(handler.headers.get("Content-Length", "0"))
    except ValueError as exc:
        raise ValueError("无效的请求长度。") from exc

    raw_body = handler.rfile.read(content_length) if content_length > 0 else b"{}"
    try:
        return json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("请求体不是合法的 JSON。") from exc


def json_response(handler: SimpleHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        return

    def do_GET(self) -> None:
        if self.path in {"/api/bootstrap", "/api/bootstrap/"}:
            json_response(self, HTTPStatus.OK, bootstrap_payload())
            return

        if self.path == "/favicon.ico":
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return

        if self.path in {"/", ""}:
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self) -> None:
        if self.path not in {"/api/generate", "/api/generate/"}:
            json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "接口不存在。"})
            return

        try:
            payload = parse_json_body(self)
            mode = str(payload.get("mode", "draft")).strip() or "draft"
            if mode not in MODE_LABELS:
                raise ValueError("mode 仅支持 draft 或 prompt。")

            raw_brief = payload.get("brief", {})
            if not isinstance(raw_brief, dict):
                raise ValueError("brief 必须是对象。")

            brief = normalize_brief(raw_brief)
            result = render_prompt_packet(brief) if mode == "prompt" else render_draft(brief)
        except ValueError as exc:
            json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
            return
        except Exception as exc:
            json_response(self, HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": f"生成失败：{exc}"})
            return

        json_response(
            self,
            HTTPStatus.OK,
            {
                "ok": True,
                "mode": mode,
                "mode_label": MODE_LABELS[mode],
                "brief": brief,
                "result": result,
            },
        )


def build_server(host: str, port: int) -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), partial(AppHandler))


def smoke_test() -> None:
    for asset_name in ["index.html", "styles.css", "standalone_data.js", "client_generator.js", "app.js"]:
        asset_path = WEB_DIR / asset_name
        if not asset_path.exists():
            raise FileNotFoundError(f"缺少前端文件：{asset_path}")

    sample = normalize_brief(load_sample_brief())
    draft_result = render_draft(sample)
    prompt_result = render_prompt_packet(sample)
    if "# 专业短视频脚本草案" not in draft_result:
        raise RuntimeError("脚本草案生成结果不符合预期。")
    if "# Short Video Script Agent Prompt Packet" not in prompt_result:
        raise RuntimeError("提示词包生成结果不符合预期。")

    server = build_server("127.0.0.1", 0)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        page_url = f"http://127.0.0.1:{port}/"
        js_url = f"http://127.0.0.1:{port}/app.js"
        css_url = f"http://127.0.0.1:{port}/styles.css"
        bootstrap_url = f"http://127.0.0.1:{port}/api/bootstrap"
        generate_url = f"http://127.0.0.1:{port}/api/generate"

        with urllib.request.urlopen(page_url, timeout=5) as response:
            page_html = response.read().decode("utf-8")
        if "短视频脚本生成工作台" not in page_html:
            raise RuntimeError("首页内容返回异常。")

        with urllib.request.urlopen(js_url, timeout=5) as response:
            app_js = response.read().decode("utf-8")
        if "function generate(mode)" not in app_js:
            raise RuntimeError("前端脚本未正常返回。")

        with urllib.request.urlopen(css_url, timeout=5) as response:
            app_css = response.read().decode("utf-8")
        if ".workspace" not in app_css:
            raise RuntimeError("前端样式未正常返回。")

        with urllib.request.urlopen(bootstrap_url, timeout=5) as response:
            bootstrap = json.loads(response.read().decode("utf-8"))
        if "field_groups" not in bootstrap or "sample_brief" not in bootstrap:
            raise RuntimeError("bootstrap 接口返回不完整。")

        request_body = json.dumps({"mode": "draft", "brief": load_sample_brief()}, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            generate_url,
            data=request_body,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=5) as response:
            generated = json.loads(response.read().decode("utf-8"))
        if not generated.get("ok") or "# 专业短视频脚本草案" not in generated.get("result", ""):
            raise RuntimeError("generate 接口返回异常。")

        bad_request = urllib.request.Request(
            generate_url,
            data=json.dumps({"mode": "invalid", "brief": {}}).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        try:
            urllib.request.urlopen(bad_request, timeout=5)
        except urllib.error.HTTPError as exc:
            error_payload = json.loads(exc.read().decode("utf-8"))
            if exc.code != HTTPStatus.BAD_REQUEST or not error_payload.get("error"):
                raise RuntimeError("异常请求没有返回预期错误信息。") from exc
        else:
            raise RuntimeError("无效 mode 没有触发错误响应。")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="短视频脚本智能体本地网页界面")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址，默认 127.0.0.1")
    parser.add_argument("--port", default=8123, type=int, help="监听端口，默认 8123")
    parser.add_argument("--open", action="store_true", help="启动后自动打开浏览器")
    parser.add_argument("--check", action="store_true", help="执行本地烟雾测试后退出")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.check:
        smoke_test()
        print("Web UI smoke test passed.")
        return

    server = build_server(args.host, args.port)
    url = f"http://{args.host}:{args.port}"
    print(f"Short video script web UI is running at {url}")
    print("Keep this terminal open while using the website.")

    if args.open:
        threading.Timer(0.7, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
