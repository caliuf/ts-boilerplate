#!/usr/bin/env python3
"""Local CodeScene Code Health gate for git hooks.

Runs the CodeScene MCP server's *local* analyses (embedded CLI, working tree)
so the gate always uses fresh data, never the stale project-level Cloud scan:

  - staged    -> pre_commit_code_health_safeguard (staged + modified files)
  - changeset -> analyze_change_set (HEAD vs a base ref, for pre-push)

Exit code is 0 when quality_gates == "passed", 1 otherwise, 2 on tool error.

Configuration (env):
  CODESCENE_PROJECT_ID   CodeScene Cloud project id (default: 83744)
  CODESCENE_BASE_REF     Base ref for the changeset mode (default: origin/main)
"""
import argparse
import json
import os
import subprocess
import sys
import uuid

DEFAULT_PROJECT_ID = 83744


def _git_root() -> str:
    return subprocess.check_output(
        ["git", "rev-parse", "--show-toplevel"],
        text=True,
    ).strip()


def send(proc, msg: dict) -> None:
    proc.stdin.write((json.dumps(msg) + "\n").encode())
    proc.stdin.flush()


def recv(proc) -> dict:
    line = proc.stdout.readline().decode()
    if not line:
        raise EOFError("MCP server closed stdout")
    return json.loads(line)


def request(proc, method: str, params: dict | None = None) -> dict:
    msg_id = str(uuid.uuid4())
    send(proc, {"jsonrpc": "2.0", "id": msg_id, "method": method, "params": params or {}})
    while True:
        resp = recv(proc)
        if resp.get("id") == msg_id:
            return resp


def notify(proc, method: str, params: dict | None = None) -> None:
    send(proc, {"jsonrpc": "2.0", "method": method, "params": params or {}})


def call_tool(proc, name: str, arguments: dict) -> dict:
    resp = request(proc, "tools/call", {"name": name, "arguments": arguments})
    if "error" in resp:
        raise RuntimeError(f"Tool {name} failed: {resp['error']}")
    result = resp["result"]
    if result.get("isError"):
        raise RuntimeError(f"Tool {name} returned an error: {result}")
    return result


def extract_payload(result: dict) -> dict:
    """Pull the inner JSON payload out of the MCP text content."""
    for block in result.get("content", []):
        if block.get("type") == "text":
            try:
                return json.loads(block["text"])
            except (json.JSONDecodeError, KeyError):
                continue
    return {}


def run_gate(tool: str, tool_args: dict, repo: str, project_id: int) -> int:
    env = os.environ.copy()
    # The external CodeScene MCP server expects the legacy env var name.
    env["CS_DEFAULT_PROJECT_ID"] = str(project_id)

    proc = subprocess.Popen(
        ["npx", "-y", "@codescene/codehealth-mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        env=env,
        cwd=repo,
    )
    try:
        init = request(proc, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "kilo-codescene-gate", "version": "1.0.0"},
        })
        if "error" in init:
            raise RuntimeError(f"initialize failed: {init['error']}")
        notify(proc, "notifications/initialized")

        result = call_tool(proc, tool, tool_args)
        payload = extract_payload(result)
    finally:
        proc.stdin.close()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()

    gates = payload.get("quality_gates")
    status = payload.get("metadata", {}).get("status", "unknown")
    checked = payload.get("metadata", {}).get("checked-file-count", 0)

    if gates == "passed":
        print(f"✅ CodeScene {tool}: passed ({checked} file(s) checked, {status})")
        return 0

    # Surface per-file verdicts to help the refactor.
    print(f"❌ CodeScene {tool}: quality gates '{gates}' ({status})", file=sys.stderr)
    for item in payload.get("results", []):
        name = item.get("name", "?")
        verdict = item.get("verdict", "?")
        print(f"   - {name}: {verdict}", file=sys.stderr)
        for finding in item.get("findings", []):
            category = finding.get("category", "?")
            change = finding.get("change-type", "")
            print(f"       {category} [{change}]", file=sys.stderr)
    print("Refactor the degraded files (or run: just codescene-review <file>).", file=sys.stderr)
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Local CodeScene Code Health gate")
    parser.add_argument(
        "mode",
        choices=["staged", "changeset"],
        help="staged = pre-commit safeguard; changeset = branch vs base ref",
    )
    parser.add_argument(
        "--base-ref",
        default=os.environ.get("CODESCENE_BASE_REF", "origin/main"),
        help="Base ref for changeset mode (default: origin/main)",
    )
    parser.add_argument(
        "--project-id",
        type=int,
        default=int(os.environ.get("CODESCENE_PROJECT_ID", os.environ.get("CS_DEFAULT_PROJECT_ID", DEFAULT_PROJECT_ID))),
    )
    parser.add_argument("--repo", default=os.environ.get("REPO_PATH", _git_root()))
    args = parser.parse_args()

    if args.mode == "staged":
        tool = "pre_commit_code_health_safeguard"
        tool_args = {"git_repository_path": args.repo}
    else:
        tool = "analyze_change_set"
        tool_args = {"git_repository_path": args.repo, "base_ref": args.base_ref}

    try:
        return run_gate(tool, tool_args, args.repo, args.project_id)
    except Exception as e:  # noqa: BLE001 - a gate must fail closed, not silently pass
        print(f"⚠️  CodeScene gate could not run: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
