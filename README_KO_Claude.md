# Synaptic Hatch

> Obsidian 창을 항상 위에 고정하고, 작업 흐름을 끊지 않는 퀵 메모 환경을 제공하는 플러그인

## 개요

**Synaptic Hatch**는 Obsidian을 더욱 유연하고 편리하게 사용할 수 있도록 도와주는 플러그인입니다. 다른 앱으로 작업하면서도 Obsidian 노트를 화면 위에 항상 띄워둘 수 있으며, 작업 중 떠오른 아이디어를 즉시 메모할 수 있는 퀵 노트 기능을 제공합니다.

### 이런 분들에게 추천합니다

- 🖥️ **듀얼 모니터 사용자**: 한쪽 화면에 참고 자료나 체크리스트를 항상 띄워두고 싶은 분
- ✍️ **빠른 메모가 필요한 분**: 코딩, 리서치, 글쓰기 중 떠오른 아이디어를 즉시 기록하고 싶은 분
- 📋 **워크플로우 자동화**: 특정 노트나 폴더를 단축키 하나로 바로 여는 커스텀 커맨드가 필요한 분
- 🔄 **매끄러운 작업 흐름**: 앱 전환으로 인한 흐름 단절 없이 메모하고 싶은 분

---

## 주요 기능

### 1. 창 고정 (Always-on-Top)

현재 활성화된 Obsidian 창을 다른 모든 창보다 위에 고정할 수 있습니다.

- **토글 방식**: 한 번 누르면 고정, 다시 누르면 해제
- **핀 표시기**: 창 우측 상단에 고정 상태를 표시하는 아이콘 제공 (옵션)
- **메인 창과 팝아웃 창 모두 지원**

### 2. 팝아웃 노트

현재 보고 있는 노트를 별도의 작은 창으로 띄웁니다.

- **자동 고정**: 팝아웃 창은 자동으로 Always-on-Top 상태로 열립니다
- **듀얼 모니터 활용**: 참고 자료나 체크리스트를 다른 화면에 띄워두기에 최적
- **포커스 복원**: 팝아웃 창을 닫으면 자동으로 이전 작업 화면으로 돌아갑니다

### 3. 퀵 메모 모드

작업 흐름을 전혀 방해하지 않는 빠른 메모 기능입니다.

- **메인 창 자동 최소화**: 퀵 메모 창을 열면 Obsidian 메인 창이 자동으로 뒤로 숨겨집니다
- **작업 복귀**: 메모를 마치고 창을 닫으면 바로 이전 작업으로 복귀
- **외부 앱과 연동**: Alfred, Raycast 등의 런처와 연동하여 어디서든 호출 가능

### 4. 커스텀 팝아웃 커맨드 ⭐

원하는 노트나 폴더를 단축키 하나로 팝아웃으로 여는 나만의 커맨드를 만들 수 있습니다.

#### 지원하는 커맨드 타입

| 타입 | 설명 | 사용 예시 |
|------|------|-----------|
| **빈 노트** (Blank) | 임시 파일명으로 새 노트 생성 | 빠른 임시 메모 |
| **특정 파일** (File) | 지정한 파일을 팝아웃으로 열기 | 자주 보는 체크리스트, 명령어 모음 |
| **폴더** (Folder) | 폴더 내에 새 파일 생성 | 프로젝트별 메모, 카테고리별 노트 |
| **저널** (Journal) | 날짜 기반 노트 자동 생성 | 일일/주간/월간 노트, 회의록 |

#### 커스텀 커맨드 고급 기능

- **파일명 규칙**: `{date}`, `{time}`, `{random}` 같은 변수를 사용하여 동적으로 파일명 생성
- **템플릿 적용**: 새 노트 생성 시 지정한 템플릿 자동 적용
- **저널 주기 선택**: Daily, Weekly, Monthly, Quarterly, Yearly 중 선택
- **URI 프로토콜**: 각 커맨드마다 고유한 URI 생성으로 외부에서 호출 가능

---

## 사용 방법

### 기본 커맨드

플러그인을 설치하면 다음 커맨드들을 바로 사용할 수 있습니다. 커맨드 팔레트(`Ctrl/Cmd + P`)에서 실행하거나, **Settings → Hotkeys**에서 단축키를 지정하세요.

#### 1. Toggle Window Pin for Always on Top

현재 창의 Always-on-Top 상태를 토글합니다.

```
사용 시나리오:
- 참고 자료 노트를 화면 위에 계속 띄워두고 싶을 때
- 코딩하면서 옵시디언 노트를 옆에 고정해두고 싶을 때
```

#### 2. Open Always-On-Top Popout

현재 보고 있는 노트를 팝아웃 창으로 엽니다.

```
사용 시나리오:
- 듀얼 모니터에서 한쪽 화면에 노트를 띄워두고 싶을 때
- 메인 옵시디언은 그대로 두고, 특정 노트만 별도로 보고 싶을 때
```

#### 3. Open Always-On-Top Popout For Quick Note

퀵 메모 모드로 팝아웃 창을 엽니다. (메인 창 자동 숨김)

```
사용 시나리오:
- 작업 중 갑자기 떠오른 아이디어를 빠르게 메모하고 싶을 때
- 외부 앱을 사용하면서도 옵시디언 메모를 방해받지 않고 작성하고 싶을 때
```

### 커스텀 팝아웃 커맨드 만들기

자주 사용하는 노트나 워크플로우를 단축키 하나로 실행할 수 있습니다.

#### 설정 방법

1. **Settings → Synaptic Hatch** 열기
2. **Custom Popout Commands** 섹션의 토글 활성화
3. **Add Command** 버튼 클릭
4. 커맨드 설정:
   - **Command Name**: 커맨드 이름 (예: "Daily Note", "Meeting Memo")
   - **Command Type**: 아래 4가지 중 선택

#### 타입별 설정 가이드

##### 📝 Blank (빈 노트)

임시 메모를 빠르게 작성할 때 사용합니다.

```
설정 항목:
- File Name Rule: 파일명 패턴 (예: "Quick-{date}-{time}")
- Use Template: 템플릿 사용 여부
- Template Path: 템플릿 파일 경로

예시:
- 파일명: "Temp-{date}-{random}"
- 결과: "Temp-2024-01-15-a8k2.md"
```

##### 📄 File (특정 파일)

특정 파일을 빠르게 팝아웃으로 엽니다.

```
설정 항목:
- File Path: 열고 싶은 파일 경로 (자동완성 지원)

사용 예시:
- "Resources/Command Cheatsheet.md" → 명령어 모음 노트
- "Projects/Current Tasks.md" → 현재 작업 대시보드
- "Daily/Checklist.md" → 일일 체크리스트
```

##### 📁 Folder (폴더)

특정 폴더에 새 파일을 생성합니다.

```
설정 항목:
- Folder Path: 파일을 생성할 폴더 경로
- File Name Rule: 파일명 패턴
- Use Template: 템플릿 사용 여부
- Template Path: 템플릿 파일 경로

사용 예시:
폴더: "Meetings"
파일명: "Meeting-{date}-{time}"
템플릿: "Templates/Meeting Template.md"
→ "Meetings/Meeting-2024-01-15-14:30.md" 생성
```

##### 📅 Journal (저널)

날짜 기반 저널 노트를 자동으로 생성합니다.

```
설정 항목:
- Journal Period: Daily / Weekly / Monthly / Quarterly / Yearly
- Use Template: 템플릿 사용 여부
- Template Path: 템플릿 파일 경로

사용 예시:
- Daily: 매일의 일기나 업무 일지
- Weekly: 주간 회고나 계획
- Monthly: 월간 리뷰
- Quarterly: 분기별 목표 점검
- Yearly: 연간 회고

※ Periodic Notes 플러그인이 설치되어 있어야 합니다.
※ 각 주기별 설정은 Periodic Notes 플러그인 설정을 따릅니다.
```

#### 파일명 규칙에 사용 가능한 변수

- `{date}`: 현재 날짜 (설정의 Date Format 따름, 기본값: YYYY-MM-DD)
- `{time}`: 현재 시간 (HH:mm 형식)
- `{random}`: 랜덤 문자열 (4자리)

예시:
- `Meeting-{date}` → `Meeting-2024-01-15.md`
- `Note-{date}-{time}` → `Note-2024-01-15-14:30.md`
- `Temp-{random}` → `Temp-k8d2.md`

---

## URI 프로토콜로 외부에서 호출하기

### 퀵 메모 URI

어디서든 Obsidian 퀵 메모를 바로 열 수 있는 URI입니다.

```
obsidian://aot-popup
```

#### 활용 방법

**macOS (Alfred, Raycast)**
```
1. Alfred Workflow나 Raycast Extension 생성
2. Open URL 액션 추가: obsidian://aot-popup
3. 시스템 전역 단축키 지정 (예: Cmd+Shift+N)
```

**Windows (AutoHotkey)**
```ahk
^!n::  ; Ctrl+Alt+N
Run, obsidian://aot-popup
return
```

### 커스텀 커맨드 URI

각 커스텀 커맨드마다 고유한 URI가 생성됩니다.

```
obsidian://custom-popout?vault=볼트명&id=커맨드ID
```

#### URI 복사 방법

1. **Settings → Synaptic Hatch → Custom Popout Commands**로 이동
2. 원하는 커맨드 우측의 **Copy URI** 버튼 클릭
3. 클립보드에 복사된 URI를 런처나 스크립트에 활용

#### 활용 예시

**시나리오 1: 회의록 단축키**
```
1. "Meeting Note" 커스텀 커맨드 생성 (폴더: Meetings, 템플릿 적용)
2. URI 복사: obsidian://custom-popout?vault=MyVault&id=meeting-note
3. Alfred/Raycast에서 Ctrl+M에 할당
4. 회의 시작 시 Ctrl+M만 누르면 자동으로 오늘 날짜의 회의록 생성
```

**시나리오 2: 프로젝트 대시보드**
```
1. "Project Dashboard" 커스텀 커맨드 생성 (파일: Projects/Dashboard.md)
2. URI를 Raycast에 등록
3. 언제든 Cmd+D로 프로젝트 현황 팝업 확인
```

---

## 설정 가이드

### Pin Indicator (핀 표시기)

창의 고정 상태를 시각적으로 표시하는 아이콘입니다.

#### Main Window Indicator (메인 창 표시기)

```
기본 동작: 창이 고정되었을 때만 표시
설정 가능 항목:
- 표시 여부: 켜기/끄기
- 세로 위치: 상단으로부터의 거리 (픽셀)
- 가로 위치: 우측으로부터의 거리 (픽셀)
- 아이콘 크기: 전체 크기 및 아이콘 크기
```

#### Popout Window Indicator (팝아웃 창 표시기)

```
기본 동작: 항상 표시 (고정 시 강조 색상)
설정 가능 항목:
- 표시 여부: 켜기/끄기
- 위치 및 크기: 메인 창과 동일하게 조정 가능
```

#### 표시기 동작

- **핀 해제 상태**: 반투명 회색 아이콘
- **핀 고정 상태**: 진한 파란색 아이콘
- **클릭 시**: 고정 상태 토글 (Toggle Window Pin 커맨드와 동일)

### Custom Popout Commands

커스텀 커맨드를 사용하려면 섹션 상단의 토글을 먼저 활성화해야 합니다.

#### 커맨드 관리

- **추가**: Add Command 버튼
- **수정**: 커맨드 제목 클릭하여 펼치기/접기
- **삭제**: Delete Command 버튼
- **활성화/비활성화**: 각 커맨드의 Enabled 토글

#### Date Format 설정

커스텀 커맨드에서 `{date}` 변수 사용 시 적용되는 날짜 형식입니다.

```
기본값: YYYY-MM-DD
예시:
- YYYY-MM-DD → 2024-01-15
- YYYYMMDD → 20240115
- YYYY/MM/DD → 2024/01/15
- DD-MM-YYYY → 15-01-2024
```

---

## 설치 방법

### 커뮤니티 플러그인에서 설치 (권장)

1. Obsidian 실행 후 **Settings** 열기
2. **Community plugins** 섹션으로 이동
3. **Browse** 버튼 클릭
4. 검색창에 `Synaptic Hatch` 입력
5. **Install** 클릭 후 **Enable** 활성화

### 수동 설치

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/obsidian-synaptic-hatch.git

# 2. 의존성 설치 및 빌드
cd obsidian-synaptic-hatch
npm install
npm run build

# 3. 플러그인 폴더에 파일 복사
# 생성된 main.js, manifest.json, styles.css를
# <볼트경로>/.obsidian/plugins/synaptic-hatch/ 에 복사

# 4. Obsidian 재시작 또는 플러그인 새로고침
```

---

## 팁과 활용 예시

### 💡 추천 워크플로우

#### 1. 코딩 중 빠른 메모
```
설정:
- "Quick Note" 커맨드 생성 (Blank 타입, Inbox 폴더)
- Alfred에서 Cmd+Shift+N에 URI 할당

사용:
코딩 중 → Cmd+Shift+N → 메모 작성 → 창 닫기 → 즉시 코딩 복귀
```

#### 2. 듀얼 모니터 참고 자료
```
설정:
- "Cheatsheet" 커맨드 생성 (File 타입, 자주 보는 치트시트 파일)
- Hotkey: Ctrl+Alt+C

사용:
듀얼 모니터 한쪽에 치트시트를 Always-on-Top으로 고정
```

#### 3. 일일 저널 자동화
```
설정:
- "Daily Journal" 커맨드 생성 (Journal 타입, Daily)
- 템플릿 적용 (날씨, 기분, 할 일 섹션 포함)
- Hotkey: Ctrl+D

사용:
매일 아침 Ctrl+D → 오늘의 저널 자동 생성 → 바로 작성
```

#### 4. 회의 중 빠른 회의록
```
설정:
- "Meeting" 커맨드 생성 (Folder 타입, Meetings 폴더)
- 파일명: "Meeting-{date}-{time}"
- 회의록 템플릿 적용

사용:
회의 시작 → 단축키 → 회의록 팝업 → 메모 → 닫기
```

### ⚠️ 주의사항

#### 시스템 권한

- **macOS**: 일부 시스템 앱(Finder, System Preferences 등)은 Always-on-Top보다 우선순위가 높을 수 있습니다.
- **Windows**: 일부 전체 화면 앱이나 게임은 Always-on-Top을 무시할 수 있습니다.

#### Periodic Notes 플러그인

- Journal 타입의 커스텀 커맨드를 사용하려면 **Periodic Notes** 플러그인이 필요합니다.
- Periodic Notes에서 각 주기별 폴더와 템플릿을 먼저 설정해야 합니다.

#### 포커스 관리

- 퀵 메모 모드에서 메인 창을 자동으로 숨기는 기능은 OS에 따라 동작이 다를 수 있습니다.
- 문제가 발생하면 일반 팝아웃 모드를 사용하세요.

#### 성능

- 많은 수의 커스텀 커맨드를 생성하면 커맨드 팔레트가 복잡해질 수 있습니다.
- 자주 사용하는 커맨드만 Enabled 상태로 유지하고, 나머지는 비활성화하는 것을 권장합니다.

---

## 호환성

- **Obsidian 최소 버전**: 0.15.0 이상
- **지원 플랫폼**: Windows, macOS, Linux (데스크톱 전용)
- **모바일**: 미지원 (`isDesktopOnly: true`)

---

## 문제 해결

### 창이 고정되지 않아요

1. Obsidian이 최신 버전인지 확인
2. 플러그인을 비활성화했다가 다시 활성화
3. Obsidian 재시작
4. 운영체제의 권한 설정 확인

### 커스텀 커맨드가 보이지 않아요

1. **Settings → Synaptic Hatch**에서 "Custom Popout Commands" 섹션이 활성화되어 있는지 확인
2. 해당 커맨드의 "Enabled" 토글이 켜져 있는지 확인
3. Obsidian 재시작

### 저널 커맨드가 작동하지 않아요

1. **Periodic Notes** 플러그인이 설치되어 있는지 확인
2. Periodic Notes 설정에서 해당 주기(Daily, Weekly 등)가 활성화되어 있는지 확인
3. 폴더 경로와 템플릿이 올바르게 설정되어 있는지 확인

### URI가 작동하지 않아요

1. URI를 정확히 복사했는지 확인
2. 볼트 이름이 URI에 올바르게 포함되어 있는지 확인
3. Obsidian이 실행 중인지 확인

---

## 라이선스

MIT License

---

## 기여 및 피드백

이슈나 기능 제안은 GitHub 저장소의 Issues 섹션에 남겨주세요.

**제작자**: Yongmini  
**Twitter**: [@Facilitate4U](https://x.com/Facilitate4U)

---

## 버전 히스토리

### v0.1.0 (현재)
- 초기 릴리스
- Always-on-Top 토글 기능
- 팝아웃 노트 기능
- 퀵 메모 모드
- 커스텀 팝아웃 커맨드 (4가지 타입)
- URI 프로토콜 지원
- 핀 표시기 (위치 조정 가능)

