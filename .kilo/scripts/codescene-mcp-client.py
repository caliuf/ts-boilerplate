#!/usr/bin/env python3
"""Fallback MCP client for CodeScene codehealth-mcp over stdio.

Use this script when the Kilo session does not expose the CodeScene MCP tools
directly. It speaks the MCP protocol over stdio and calls the most common
Code Health tools used by AGENTS.md:

  - verify_installation
  - select_project
  - list_technical_debt_hotspots_for_project
  - list_technical_debt_goals_for_project
  - pre_commit_code_health_safeguard
  - analyze_change_set
  - code_health_score
  - code_health_review

Configuration (env):
  CS_DEFAULT_PROJECT_ID  CodeScene Cloud project id (default: 83744)
  REPO_PATH              Absolute path to the git repo (default: auto-detected)

Usage:
  python3 .kilo/scripts/codescene-mcp-client.py
  python3 .kilo/scripts/codescene-mcp-client.py --tool code_health_score --path src/main.ts
  python3 .kilo/scripts/codescene-mcp-client.py --tool code_health_review --path src/main.ts
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
    line = json.dumps(msg) + "\n"
    proc.stdin.write(line.encode())
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


def call_tool(proc, name: str, arguments: dict | None = None) -> dict:
    resp = request(proc, "tools/call", {"name": name, "arguments": arguments or {}})
    if "error" in resp:
        raise RuntimeError(f"Tool {name} failed: {resp['error']}")
    return resp["result"]


def run_server(repo: str, project_id: int, actions: list[dict]) -> dict:
    env = os.environ.copy()
    env["CS_DEFAULT_PROJECT_ID"] = str(project_id)

    proc = subprocess.Popen(
        ["npx", "-y", "@codescene/codehealth-mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        cwd=repo,
    )
    results: dict = {}
    try:
        init = request(proc, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "kilo-codescene-fallback", "version": "1.0.0"},
        })
        if "error" in init:
            raise RuntimeError(f"initialize failed: {init['error']}")
        notify(proc, "notifications/initialized")

        for action in actions:
            name = action["tool"]
            args = action.get("args", {})
            try:
                results[name] = call_tool(proc, name, args)
            except RuntimeError as e:
                results[f"{name}_error"] = str(e)
    finally:
        proc.stdin.close()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
    return results


def all_checks(repo: str, project_id: int) -> dict:
    actions = [
        {"tool": "verify_installation", "args": {"git_repository_path": repo}},
        {"tool": "select_project", "args": {}},
        {"tool": "list_technical_debt_hotspots_for_project", "args": {"project_id": project_id}},
        {"tool": "list_technical_debt_goals_for_project", "args": {"project_id": project_id}},
        {"tool": "pre_commit_code_health_safeguard", "args": {"git_repository_path": repo}},
        {"tool": "analyze_change_set", "args": {"git_repository_path": repo, "base_ref": "origin/main"}},
    ]
    return run_server(repo, project_id, actions)


def main() -> int:
    parser = argparse.ArgumentParser(description="CodeScene MCP fallback client")
    parser.add_argument("--repo", default=os.environ.get("REPO_PATH", _git_root()))
    parser.add_argument("--project-id", type=int, default=int(os.environ.get("CS_DEFAULT_PROJECT_ID", DEFAULT_PROJECT_ID)))
    parser.add_argument("--tool", choices=[
        "all",
        "verify_installation",
        "select_project",
        "list_technical_debt_hotspots_for_project",
        "list_technical_debt_goals_for_project",
        "pre_commit_code_health_safeguard",
        "analyze_change_set",
        "code_health_score",
        "code_health_review",
    ], default="all")
    parser.add_argument("--path", help="File path for code_health_score/review")
    parser.add_argument("--base-ref", default="origin/main", help="Base ref for analyze_change_set")
    args = parser.parse_args()

    if args.tool == "all":
        results = all_checks(args.repo, args.project_id)
    elif args.tool in {"code_health_score", "code_health_review"}:
        if not args.path:
            parser.error(f"--path is required for {args.tool}")
        results = run_server(args.repo, args.project_id, [
            {"tool": args.tool, "args": {"file_path": os.path.abspath(args.path)}},
        ])
    elif args.tool == "analyze_change_set":
        results = run_server(args.repo, args.project_id, [
            {"tool": args.tool, "args": {"git_repository_path": args.repo, "base_ref": args.base_ref}},
        ])
    elif args.tool == "pre_commit_code_health_safeguard":
        results = run_server(args.repo, args.project_id, [
            {"tool": args.tool, "args": {"git_repository_path": args.repo}},
        ])
    else:
        results = run_server(args.repo, args.project_id, [
            {"tool": args.tool, "args": {"project_id": args.project_id} if "project" in args.tool else {}},
        ])

    print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
