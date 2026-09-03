# ClaudeFence

A guardrail that blocks an AI coding agent in real time when it tries to touch files outside the requested scope.

## How it works

1. tree-sitter parses the whole target repo into a symbol map (`symbol-map.json`)
2. *(planned)* the Claude API turns the user's request into a contract (`contract.json`) — "this request may only touch these files"
3. a Claude Code PreToolUse hook checks every real Edit/Write against that contract and blocks it if it's out of scope

## Demo

_(video coming soon)_

## Current status (2026-09-03, Day 2 T12 done)

- [x] Symbol/import map extracted from a real repo (`../ru-vibe`, 14 TS/TSX files)
- [x] PreToolUse hook actually blocks/allows via exit code — but the contract is still a hardcoded, single-file placeholder
- [ ] Auto-generate the contract from a request via the Claude API
- [ ] Function-level scope checks (file-level only for now)

## Limitations (honest)

- The contract is still a hand-written placeholder. Auto-generation is the next step.
- Scope checks are file-level only. No function-level granularity yet.

## Dev log

Task-by-task progress and commits: see `docs/ROADMAP.md`.
