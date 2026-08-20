# 로드맵 · 검증 정답지 · 면접 질문

> 규칙과 상대 수준은 `CLAUDE.md`에 있다. 여기선 **다음 태스크가 속한 Day 섹션만** 읽으면 된다.

## 로드맵 — 6일 · 25 커밋

진행하면서 이 체크박스를 갱신할 것. 커밋 메시지는 그대로 쓴다.

Day 1 다음에 **"가짜 데이터로 끝까지 연결하는 뼈대"**를 먼저 만든다(Day 1.5).
그래야 5일차까지 안 가도 이번 주 안에 "차단되는 장면"을 한 번 본다. 이후 Day 2~4는
이 가짜 조각(`symbol-map.json`, `contract.json`)을 같은 파일 경로에 진짜 내용으로
하나씩 갈아끼우는 작업이다 — 경로가 같아서 자연히 교체된다. Day 5는 그래서
"함수 단위까지 보기" 하나만 남는다.

### Day 1 — 배선 (터미널 ↔ 스크립트 ↔ 파일)

가장 모르는 영역. tree-sitter는 오늘 등장하지 않는다.

- [x] **T1** 레포 뼈대 — `package.json`(`type: module`), `tsconfig.json`, `.gitignore`
      · 검증 `npx tsx --version` · `chore: bootstrap TS project`
- [x] **T2** 화면에 찍은 글자를 파일로 보내기 ← **새 용어: 표준출력**
      · `src/build.ts`가 `console.log(JSON.stringify({hello:"world"}))` 한 줄만
      · 검증 `npx tsx src/build.ts > out.json && cat out.json`
      · **드릴** 위에 `console.log("시작")` 한 줄 추가 후 `node -e "JSON.parse(require('fs').readFileSync('out.json','utf8'))"`
      → 규칙 도출: **stdout엔 JSON 한 덩이만. 사람이 읽을 말은 전부 `console.error`**
      · `feat: emit JSON to stdout`
- [x] **T3** 대상 경로를 밖에서 받기 ← **새 용어: 실행 인자(process.argv)**
      · 없으면 `console.error` + `process.exit(1)`
      · **드릴** `console.error(process.argv)` 찍어서 앞 두 칸에 뭐가 있는지 관찰
      · 검증: 인자 없이 / 없는 경로 / 진짜 경로 3번, 종료 코드가 달라야 함
      · `feat: take target repo path from argv`
- [x] **T4** `.ts`/`.tsx` 파일 목록 — `node_modules`·`.next`·`.git`·`dist` 제외
      · 힌트 `fs.readdirSync(dir, { recursive: true })`
      · **정답: 14개** · **드릴** 제외 필터를 지우고 개수 관찰
      · `feat: collect ts/tsx files`
- [ ] **T5** grep 대조 → `docs/why-ast.md` 📌 **면접 재료**
      · `grep -c "function" ../ru-vibe/components/capture/PolaroidCanvas.tsx` vs 실제 함수 수
      · 주석 속/문자열 속 `function`이 어떻게 잡히는지 숫자로 기록
      · `docs: why grep is not enough`

### Day 1.5 — 가짜 데이터로 끝까지 연결 (뼈대)

새 개념 없음 — Day 1에서 배운 stdout/stdin/argv만 재사용해서 ①→②→③을 가짜 내용으로 잇는다.
여기서 만드는 파일 경로(`symbol-map.json`, `.claudefence/contract.json`)는 최종 경로와 같다.
Day 2~4는 이 안의 **내용만** 진짜로 바꾸는 작업이 된다.

- [ ] **T6** 가짜 `symbol-map.json` — `build.ts`가 진짜 파싱 대신 하드코딩된 심볼 1~2개를 출력
      · 힌트: 배열 안에 `{ file, symbols: [{name, kind, exported}] }` 모양 객체 하나 정도
      · 검증 `npx tsx src/build.ts ../ru-vibe > symbol-map.json && cat symbol-map.json`
      · `feat: emit placeholder symbol map`
- [ ] **T7** 가짜 `contract.json` — `.claudefence/contract.json`에 허용 파일 1개만 하드코딩
      · 모양: `{ allowedFiles: ["..."], reason: "placeholder" }`
      · `feat: add placeholder contract`
- [ ] **T8** 훅 뼈대 — stdin으로 JSON 받아 가짜 계약과 대조 ← **새 용어: 표준입력**
      · **Day 1이 회수되는 지점**: T2는 화면 출력을 파일로 보냈다. 이번엔 반대로,
        Claude Code가 파일에 쓰기 직전 그 요청(JSON)을 훅 스크립트의 **입력**으로 흘려보낸다
      · 실제로 들어오는 필드: `tool_name`, `tool_input.file_path`, `cwd`, `hook_event_name` —
        일단 받은 걸 파일에 로그로 남겨서 눈으로 확인부터
      · `tool_input.file_path`가 `allowedFiles`에 없으면 `console.error` + `exit(2)`, 있으면 `exit(0)`
      · `.claude/settings.json`에 `PreToolUse` + `matcher: "Edit|Write"` 등록
        (경로는 `${CLAUDE_PROJECT_DIR}`, 이 설정 파일도 커밋 대상)
      · **드릴** 계약 밖 파일을 고치라고 시켜서 차단되는 걸 본다 🎬 **여기서 스크린샷 하나 남겨두기**
        (가짜 데이터 기준 — Day 5에서 진짜 데이터로 다시 찍는다)
      · `feat: hook skeleton against placeholder contract`

### Day 2 — 파싱 (① 완성)

- [ ] **T9** 파서 붙이고 파일 1개만 뜯기 ← **새 용어: 노드 종류(node type)**
      · `npm i tree-sitter tree-sitter-typescript` (**버전 직접 지정 금지** → 이 문서의 「실측 정답지」)
      · `new Parser()` → `setLanguage(TS.tsx)` → `parse(src)` → `tree.rootNode.namedChildren`
      · 각 자식의 `.type`, `.startPosition.row + 1`을 **`console.error`로** 출력 (T2 규칙!)
      · **드릴** `TS.tsx` 대신 `TS.typescript`로 `.tsx` 파싱 → 뭐가 달라지나
      · `feat: parse a single file with tree-sitter`
- [ ] **T10** 최상위 심볼 추출 → `{ name, kind, exported, default, line }`
      · 대상: `function_declaration`, `lexical_declaration`, 이들을 **감싸는** `export_statement`
      · **경계 사례** `next.config.ts`의 `export default nextConfig;` — 선언이 없다.
        처리 방식과 **그 이유를 커밋 메시지에** 쓴다
      · 오늘은 최상위만. 중첩 함수·화살표 컴포넌트는 Day 3
      · `feat: extract top-level symbols`
- [ ] **T11** import 추출 → `{ source, kind, names, typeOnly, line, resolved: null }`
      · `kind`: default / named / namespace / side-effect (ru-vibe에 4종 다 있음)
      · 검증: side-effect import(`./globals.css`)가 빠지지 않았는지
      · `feat: extract imports`
- [ ] **T12** 조립 + `stats` → `symbol-map.json` ✅ **1단계 완료** — T6의 가짜 데이터를 진짜로 교체
      · `feat: emit full symbol map`

### Day 3 — 지도 완성

- [ ] **T13** `@/…`를 실제 파일 경로로 ← **새 용어: 모듈 해석**
      · tsconfig의 `paths`를 **읽어서** 푼다(하드코딩 금지). `.ts`/`.tsx`/`index.*` 순으로 탐색
      · 패키지(`react`, `next/link`)는 `"external"` 표시
      · 검증: ru-vibe의 `@/` import가 전부 실제 파일로 이어질 것 (하나라도 null이면 버그)
      · `feat: resolve import paths via tsconfig paths`
- [ ] **T14** 역방향 인덱스 — "이 파일을 누가 import 하나"
      · ③단계에서 *영향 범위*를 계산하려면 필요하다
      · `feat: build reverse import index`
- [ ] **T15** 다른 레포로 돌려보기 (Sublet 프로젝트)
      · 하드코딩된 가정이 드러난다. 깨지면 고친다 → "우리 레포 전용 아님"의 증거
      · `fix: handle repo-specific assumptions`

### Day 4 — 계약서 (② 단계)

> ⚠️ 이 날 시작할 때 **`/claude-api` 스킬을 먼저 호출**할 것. 모델 ID·SDK 사용법은
> 이 문서에 적지 않는다 (낡을 수 있음). 스킬이 최신 사실을 준다. 기본 모델은 `claude-opus-5`.

- [ ] **T16** SDK 붙이고 첫 호출 — 요청문 하나를 그냥 요약시켜 보기
      · `ANTHROPIC_API_KEY`는 `.env`로, `.gitignore` 확인 필수 (**키 커밋 사고 방지**)
      · `feat: wire anthropic sdk`
- [ ] **T17** 요청문 + 심볼맵 → 허용 목록 JSON (구조화 출력)
      · 입력: `"로그인 버튼 색만 바꿔줘"` + 파일/심볼 목록
      · 출력: `{ allowedFiles: [], allowedSymbols: [], reason: "" }`
      · 심볼맵 전체를 넣지 말 것 — 경로+심볼 이름만 압축해서 넣는다
      · `feat: generate contract from request`
- [ ] **T18** 계약서 저장 `.claudefence/contract.json` + CLI 서브커맨드 — T7의 가짜 계약을 진짜로 교체
      · `feat: persist contract`
- [ ] **T19** 프롬프트 튜닝 + **실패 케이스 3개 기록** 📌 **면접 재료**
      · 애매한 요청("전체적으로 정리해줘")에서 뭐가 깨지는지 `docs/failure-cases.md`에
      · `docs: contract failure cases`

### Day 5 — 훅 심화 (③ 완성) — 진짜 데모

훅 자체는 Day 1.5에서 이미 동작한다. 남은 건 파일 단위를 넘어서는 것과, 가짜가 아닌
진짜 데이터로 다시 확인하는 것.

- [ ] **T20** 심볼 단위 검증 — 파일은 허용인데 *다른 함수*를 고친 경우
      · 파일 단위 검사보다 한 단계 깊다. 이게 이 프로젝트의 차별점
      · `feat: symbol-level violation check`
- [ ] **T21** 엔드투엔드 확인 — 진짜 `symbol-map.json`(T12) + 진짜 `contract.json`(T18)으로
      전체 파이프라인이 작동하는지 확인 🎬 **진짜 데모 장면**
      · **드릴** 계약 밖 파일 수정을 시켜서 차단 확인 → 여기서 스크린샷 (Day 1.5 것 대체)
      · `docs: end-to-end verification with real contract`

### Day 6 — 포트폴리오화

- [ ] **T22** 데모 GIF/스크린샷 (T21의 차단되는 장면) → `docs/demo.gif`
      · `docs: add demo`
- [ ] **T23** README 재작성 — 문제 → 데모 → 아키텍처 → 숫자 → 설치
      · CLAUDE.md의 10초 규칙 적용. 설치법을 맨 위에 두지 말 것
      · `docs: rewrite readme`
- [ ] **T24** 한계 + 향후 계획 섹션 (정직하게)
      · 예: 화살표 컴포넌트 미지원 / LLM 계약이 틀릴 수 있음 / TS만 지원
      · `docs: known limitations`
- [ ] **T25** 최종 점검 — 클린 클론에서 처음부터 실행, `v0.1.0` 태그
      · `chore: v0.1.0`

---

## 실측 정답지 (검증용 — 이미 확인된 값)

**대상 레포**: `asianbike/ru-vibe` (Next.js App Router + Supabase, TS/TSX만)

- TS/TSX **14개 파일 / 1,524줄** (`node_modules` 제외), `.tsx` 8개
- `tsconfig.json` → `paths: { "@/*": ["./*"] }`, barrel(`index.ts`) **없음**

**설치 함정 (확인됨)**: `tree-sitter-typescript`의 peer 범위는 `^0.21.0`인데 `tree-sitter`
최신은 `0.25.x`다. **버전을 명시하면 깨진다.** 그냥 `npm i tree-sitter tree-sitter-typescript`
하면 npm이 `0.21.1 + 0.23.2`로 맞춰 깔고 정상 동작한다.

**파싱 결과 (실제 확인)**

| 파일 | 최상위 노드 | 심볼 |
|---|---|---|
| `app/layout.tsx` | `import_statement`×3, `lexical_declaration`×2, `export_statement`×2 | `geistSans`, `geistMono`, `metadata`, `RootLayout`(default) = **4** |
| `lib/supabase/client.ts` | import×1, export×1 | `createClient`(exported) = **1** |
| `proxy.ts` | import×2, export×2 | `proxy`, `config` (둘 다 exported) = **2** |
| `next.config.ts` | import×1, `lexical_declaration`×1, export×1 | `export default nextConfig;` ← **경계 사례** |

**최상위에 등장하는 모든 모양**: `export default function` / `export function` /
`export async function` / `export const X = {}` / `export default <식별자>;` / 안 내보내는 `function`·`const`

---

## 면접 예상 질문 — 답할 수 있어야 완성

1. **"정규식이나 grep으로는 안 되나요?"**
   → Day 1 T5의 숫자로 답한다. `docs/why-ast.md`에 근거가 있어야 한다
2. **"tree-sitter 말고 TypeScript 컴파일러 API를 쓰면 더 정확하지 않나요?"**
   → 맞다. 트레이드오프를 알고 골랐다고 답해야 한다 (속도·언어 확장성 vs 타입 정보).
     "몰라서 안 썼다"와 "알고 안 썼다"는 완전히 다른 답이다
3. **"LLM이 계약서를 잘못 만들면 어떻게 되나요?"**
   → 가장 날카로운 질문. Day 4 T19의 `docs/failure-cases.md`가 그 답이다.
     "훅은 계약을 집행할 뿐 계약의 정확도는 별개 문제이고, 그래서 실패 케이스를 기록했다"

---

## 완료 조건

```bash
npx tsx src/build.ts ../ru-vibe > symbol-map.json
node -e "console.log(require('./symbol-map.json').stats)"
```

- `stats.files === 14`, `app/layout.tsx`의 심볼 4개, `RootLayout.default === true`
- side-effect import(`./globals.css`)가 누락되지 않음
- 계약 밖 파일 수정이 **실제로 차단되는** 스크린샷이 README에 있음
- 커밋 25개, 각각 태스크 하나
- 이 문서의 면접 질문 3개에 문서로 답할 수 있음
