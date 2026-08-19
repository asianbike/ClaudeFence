# 로드맵 · 검증 정답지 · 면접 질문

> 규칙과 상대 수준은 `CLAUDE.md`에 있다. 여기선 **다음 태스크가 속한 Day 섹션만** 읽으면 된다.

## 로드맵 — 6일 · 24 커밋

진행하면서 이 체크박스를 갱신할 것. 커밋 메시지는 그대로 쓴다.

### Day 1 — 배선 (터미널 ↔ 스크립트 ↔ 파일)

가장 모르는 영역. tree-sitter는 오늘 등장하지 않는다.

- [x] **T1** 레포 뼈대 — `package.json`(`type: module`), `tsconfig.json`, `.gitignore`
      · 검증 `npx tsx --version` · `chore: bootstrap TS project`
- [ ] **T2** 화면에 찍은 글자를 파일로 보내기 ← **새 용어: 표준출력**
      · `src/build.ts`가 `console.log(JSON.stringify({hello:"world"}))` 한 줄만
      · 검증 `npx tsx src/build.ts > out.json && cat out.json`
      · **드릴** 위에 `console.log("시작")` 한 줄 추가 후 `node -e "JSON.parse(require('fs').readFileSync('out.json','utf8'))"`
      → 규칙 도출: **stdout엔 JSON 한 덩이만. 사람이 읽을 말은 전부 `console.error`**
      · `feat: emit JSON to stdout`
- [ ] **T3** 대상 경로를 밖에서 받기 ← **새 용어: 실행 인자(process.argv)**
      · 없으면 `console.error` + `process.exit(1)`
      · **드릴** `console.error(process.argv)` 찍어서 앞 두 칸에 뭐가 있는지 관찰
      · 검증: 인자 없이 / 없는 경로 / 진짜 경로 3번, 종료 코드가 달라야 함
      · `feat: take target repo path from argv`
- [ ] **T4** `.ts`/`.tsx` 파일 목록 — `node_modules`·`.next`·`.git`·`dist` 제외
      · 힌트 `fs.readdirSync(dir, { recursive: true })`
      · **정답: 14개** · **드릴** 제외 필터를 지우고 개수 관찰
      · `feat: collect ts/tsx files`
- [ ] **T5** grep 대조 → `docs/why-ast.md` 📌 **면접 재료**
      · `grep -c "function" ../ru-vibe/components/capture/PolaroidCanvas.tsx` vs 실제 함수 수
      · 주석 속/문자열 속 `function`이 어떻게 잡히는지 숫자로 기록
      · `docs: why grep is not enough`

### Day 2 — 파싱 (① 완성)

- [ ] **T6** 파서 붙이고 파일 1개만 뜯기 ← **새 용어: 노드 종류(node type)**
      · `npm i tree-sitter tree-sitter-typescript` (**버전 직접 지정 금지** → 이 문서의 「실측 정답지」)
      · `new Parser()` → `setLanguage(TS.tsx)` → `parse(src)` → `tree.rootNode.namedChildren`
      · 각 자식의 `.type`, `.startPosition.row + 1`을 **`console.error`로** 출력 (T2 규칙!)
      · **드릴** `TS.tsx` 대신 `TS.typescript`로 `.tsx` 파싱 → 뭐가 달라지나
      · `feat: parse a single file with tree-sitter`
- [ ] **T7** 최상위 심볼 추출 → `{ name, kind, exported, default, line }`
      · 대상: `function_declaration`, `lexical_declaration`, 이들을 **감싸는** `export_statement`
      · **경계 사례** `next.config.ts`의 `export default nextConfig;` — 선언이 없다.
        처리 방식과 **그 이유를 커밋 메시지에** 쓴다
      · 오늘은 최상위만. 중첩 함수·화살표 컴포넌트는 Day 3
      · `feat: extract top-level symbols`
- [ ] **T8** import 추출 → `{ source, kind, names, typeOnly, line, resolved: null }`
      · `kind`: default / named / namespace / side-effect (ru-vibe에 4종 다 있음)
      · 검증: side-effect import(`./globals.css`)가 빠지지 않았는지
      · `feat: extract imports`
- [ ] **T9** 조립 + `stats` → `symbol-map.json` ✅ **1단계 완료**
      · `feat: emit full symbol map`

### Day 3 — 지도 완성

- [ ] **T10** `@/…`를 실제 파일 경로로 ← **새 용어: 모듈 해석**
      · tsconfig의 `paths`를 **읽어서** 푼다(하드코딩 금지). `.ts`/`.tsx`/`index.*` 순으로 탐색
      · 패키지(`react`, `next/link`)는 `"external"` 표시
      · 검증: ru-vibe의 `@/` import가 전부 실제 파일로 이어질 것 (하나라도 null이면 버그)
      · `feat: resolve import paths via tsconfig paths`
- [ ] **T11** 역방향 인덱스 — "이 파일을 누가 import 하나"
      · ③단계에서 *영향 범위*를 계산하려면 필요하다
      · `feat: build reverse import index`
- [ ] **T12** 다른 레포로 돌려보기 (Sublet 프로젝트)
      · 하드코딩된 가정이 드러난다. 깨지면 고친다 → "우리 레포 전용 아님"의 증거
      · `fix: handle repo-specific assumptions`

### Day 4 — 계약서 (② 단계)

> ⚠️ 이 날 시작할 때 **`/claude-api` 스킬을 먼저 호출**할 것. 모델 ID·SDK 사용법은
> 이 문서에 적지 않는다 (낡을 수 있음). 스킬이 최신 사실을 준다. 기본 모델은 `claude-opus-5`.

- [ ] **T13** SDK 붙이고 첫 호출 — 요청문 하나를 그냥 요약시켜 보기
      · `ANTHROPIC_API_KEY`는 `.env`로, `.gitignore` 확인 필수 (**키 커밋 사고 방지**)
      · `feat: wire anthropic sdk`
- [ ] **T14** 요청문 + 심볼맵 → 허용 목록 JSON (구조화 출력)
      · 입력: `"로그인 버튼 색만 바꿔줘"` + 파일/심볼 목록
      · 출력: `{ allowedFiles: [], allowedSymbols: [], reason: "" }`
      · 심볼맵 전체를 넣지 말 것 — 경로+심볼 이름만 압축해서 넣는다
      · `feat: generate contract from request`
- [ ] **T15** 계약서 저장 `.claudefence/contract.json` + CLI 서브커맨드
      · `feat: persist contract`
- [ ] **T16** 프롬프트 튜닝 + **실패 케이스 3개 기록** 📌 **면접 재료**
      · 애매한 요청("전체적으로 정리해줘")에서 뭐가 깨지는지 `docs/failure-cases.md`에
      · `docs: contract failure cases`

### Day 5 — 훅 (③ 단계) — 여기가 데모다

> **Day 1이 회수되는 지점**: 훅은 **stdin으로 JSON을 받고**, **exit code로 대답한다**.
> T2에서 배운 출력의 반대 방향이다. 이 연결을 반드시 짚고 갈 것.

- [ ] **T17** 훅 뼈대 — stdin JSON을 읽고 그냥 통과(`exit 0`) ← **새 용어: 표준입력**
      · 받은 걸 파일에 로그로 남겨서 **어떤 필드가 오는지 눈으로 확인**
      · 실제 필드: `tool_name`, `tool_input.file_path`, `cwd`, `hook_event_name`
      · `feat: hook skeleton reading stdin`
- [ ] **T18** 계약과 대조 → 위반이면 **`exit 2`** (stderr 메시지가 Claude에게 전달됨)
      · `feat: block writes outside contract`
- [ ] **T19** `.claude/settings.json`에 등록하고 **실제로 막히는지 확인** 🎬 **데모 장면**
      · `PreToolUse` + `matcher: "Edit|Write"` + `command`, 경로는 `${CLAUDE_PROJECT_DIR}` 사용
      · 이 파일은 커밋한다 (설정도 포트폴리오다)
      · **드릴** 일부러 계약 밖 파일을 고치라고 시켜서 차단되는 걸 본다 → **여기서 스크린샷**
      · `feat: register PreToolUse hook`
- [ ] **T20** 심볼 단위 검증 — 파일은 허용인데 *다른 함수*를 고친 경우
      · 파일 단위 검사보다 한 단계 깊다. 이게 이 프로젝트의 차별점
      · `feat: symbol-level violation check`

### Day 6 — 포트폴리오화

- [ ] **T21** 데모 GIF/스크린샷 (차단되는 장면) → `docs/demo.gif`
      · `docs: add demo`
- [ ] **T22** README 재작성 — 문제 → 데모 → 아키텍처 → 숫자 → 설치
      · CLAUDE.md의 10초 규칙 적용. 설치법을 맨 위에 두지 말 것
      · `docs: rewrite readme`
- [ ] **T23** 한계 + 향후 계획 섹션 (정직하게)
      · 예: 화살표 컴포넌트 미지원 / LLM 계약이 틀릴 수 있음 / TS만 지원
      · `docs: known limitations`
- [ ] **T24** 최종 점검 — 클린 클론에서 처음부터 실행, `v0.1.0` 태그
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
   → 가장 날카로운 질문. Day 4 T16의 `docs/failure-cases.md`가 그 답이다.
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
- 커밋 24개, 각각 태스크 하나
- 이 문서의 면접 질문 3개에 문서로 답할 수 있음
