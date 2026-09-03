# ClaudeFence

AI 코딩 에이전트가 요청 범위 밖의 파일을 건드리려 하면 실시간으로 차단하는 가드레일.

## 어떻게 동작하는가

1. tree-sitter로 대상 레포 전체를 파싱해 심볼 지도(`symbol-map.json`)를 만든다
2. *(예정)* Claude API로 사용자 요청을 "이 요청은 이 파일들만 건드려도 된다"는 계약(`contract.json`)으로 바꾼다
3. Claude Code의 PreToolUse 훅이 실제 Edit/Write 요청을 이 계약과 대조해, 범위 밖이면 차단한다

## 현재 상태 (2026-09-03, Day 2 T12 완료)

- [x] 실제 레포(`../ru-vibe`, TS/TSX 14개 파일)에서 심볼·임포트 지도 추출
- [x] PreToolUse 훅이 계약과 대조해 exit code로 실제 차단/허용 — 단, 계약은 아직 파일 1개짜리 하드코딩 placeholder
- [ ] Claude API로 요청 → 계약 자동 생성
- [ ] 함수 단위 스코프 판정 (현재는 파일 단위)

## 한계 (정직하게)

- 계약이 아직 손으로 쓴 placeholder다. 자동 생성은 다음 단계에서 붙인다
- 스코프 판정이 파일 단위다. 함수 단위 판정은 아직 없다

## 개발 로그

태스크별 진행과 커밋 기록은 `docs/ROADMAP.md` 참고.
