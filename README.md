<div align="center">

<a id="english"></a>

# 🎙️ copilot_for_interviews

**An AI-powered interview coach that listens to you in real time.**

Track your voice, get live feedback, and review your answers — all in your browser.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![OpenAI Whisper](https://img.shields.io/badge/OpenAI-Whisper-412991?logo=openai)
![License](https://img.shields.io/badge/license-MIT-blue)

**🌐 Language / 언어**  
[🇺🇸 English](#english) · [🇰🇷 한국어](#korean)

</div>

---

## 🚀 Built Entirely with GitHub Copilot CLI

This project was developed from **zero to production** during a hackathon using **GitHub Copilot CLI** as the primary development accelerator.

### 💡 Development Highlights

**🎓 Microsoft Ecosystem Hackathon**
- **GitHub Pro via Student Pack** — Free access to premium AI models (Claude Sonnet 4.5, GPT-5 mini unlimited)
- **Azure Free Trial** — $200 free credit for cloud infrastructure and services
- **Microsoft-First Development** — Built entirely on Microsoft's developer tools and cloud platform

**⚡ End-to-End Copilot CLI Automation**
- **Azure Account Setup → Deployment** — All Azure CLI commands generated and executed via Copilot CLI
- **Infrastructure as Code** — Terraform configurations automated through conversational prompts
- **Full Stack Development** — Frontend, backend, Docker, k8s configs all built with AI assistance
- **Infrastructure Repository:** [bookseal/azure_infra](https://github.com/bookseal/azure_infra)

**🏗️ Technology Philosophy**
- **Human Architects + AI Executors = Exponential Velocity**
- Traditional timeline: 2-3 weeks → Actual timeline: 1 hackathon day
- When your interview coaching system is built by AI coaching developers, you've closed the loop 🎯

### 🎯 Why This Service is Different

| Traditional Interview Prep | copilot_for_interviews |
|---|---|
| Record → Upload → Wait for analysis | **Real-time feedback as you speak** |
| Focus only on content | **Voice dynamics (dB, WPM) + Content** |
| English-only tools | **Korean & English native support** |
| Expensive coaching services | **Free & open-source** |
| Post-session review only | **Live alerts during practice** |

---

## What it does

copilot_for_interviews helps you practice for technical interviews by giving you real-time feedback on **how** you speak, not just what you say.

- 🎤 **Live mic** — monitors your volume (dB) and speaking pace (WPM) as you talk
- 📝 **Auto subtitles** — transcribes your Korean or English speech using OpenAI Whisper (near real-time)
- ⏱️ **Answer timer** — starts automatically when you speak, pauses when you stop
- 📊 **Feedback report** — scores your answer after the session (filler words, pace, STAR structure)

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Dashboard — idle</b></td>
    <td align="center"><b>Live session with charts</b></td>
  </tr>
  <tr>
    <td><img src="phase-1/docs/screenshots/01-dashboard.png" width="480"/></td>
    <td><img src="phase-1/docs/screenshots/02-live-session.png" width="480"/></td>
  </tr>
  <tr>
    <td align="center"><b>Live transcript (Korean)</b></td>
    <td align="center"><b>AI Feedback report</b></td>
  </tr>
  <tr>
    <td><img src="phase-1/docs/screenshots/03-transcript.png" width="480"/></td>
    <td><img src="phase-1/docs/screenshots/04-report.png" width="480"/></td>
  </tr>
</table>

---

## Quick Start

**You need Node.js 18+ and an OpenAI API key.**

```bash
# 1. Install dependencies
cd phase-1
npm install

# 2. Set your API key
cp .env.example .env
# Edit .env → set OPENAI_API_KEY=sk-...

# 3. Start the server
npm start

# 4. Open the dashboard
open http://localhost:3000
```

> **No API key?** It still works in Mock mode — just skip the API key and enjoy simulated telemetry.

### Docker

```bash
docker-compose up --build
open http://localhost:3000
```

---

## How it works

When you speak, your browser processes audio in two parallel ways simultaneously.

**① Microphone input — handled entirely in the browser**

The browser reads your microphone in two ways at the same time.

One measures your volume: every 100ms it calculates how loud you are in dB. This uses a built-in browser feature — no external service, no cost.

The other records your speech: it saves your voice as small audio file chunks. When you stop speaking, it automatically sends that chunk to the server 0.6 seconds later.

**② Speech → Text — OpenAI Whisper**

The server receives the audio chunk and forwards it to the OpenAI Whisper API. Whisper is one of the most accurate speech recognition models available today, supporting both Korean and English. The text comes back in about 1–2 seconds and appears as subtitles on screen.

**③ Real-time data delivery — WebSocket**

Live data like dB, WPM, and alerts are delivered to the browser over WebSocket. Unlike regular HTTP, WebSocket keeps a persistent connection open — so the server can push data to the browser at any time. This is why the charts update smoothly without refreshing.

**④ Feedback analysis — server-side, no extra AI cost**

When you finish, the server analyzes your session directly — no additional OpenAI calls. It counts filler words, calculates your average pace, checks whether your answer covered the STAR structure, and produces a score. Instant, and free.

```mermaid
flowchart TD
    MIC([🎤 Microphone]) --> WA[Web Audio API\ndB measurement every 100ms]
    MIC --> MR[MediaRecorder\nRecords audio chunks]

    WA -->|dB value| WS_SERVER[Node.js Server]
    MR -->|audio chunk .webm\nafter 0.6s silence| API_TRANSCRIBE[POST /transcribe]

    API_TRANSCRIBE --> WHISPER[OpenAI Whisper API\nwhisper-1 · ko / en]
    WHISPER -->|transcript text| WS_SERVER

    WS_SERVER -->|WebSocket push\ndB · WPM · alerts| DASHBOARD[📊 Live Dashboard]
    WS_SERVER -->|subtitles| TRANSCRIPT[📝 Live Transcript Panel]

    FINISH([🏁 Finish Interview]) --> ANALYZER[feedbackAnalyzer.js\nRule-based · No API call]
    ANALYZER -->|score · suggestions\nSTAR · filler words| REPORT[📋 Feedback Report]

    style WHISPER fill:#412991,color:#fff
    style ANALYZER fill:#238636,color:#fff
    style DASHBOARD fill:#1f6feb,color:#fff
```

---

## Features

| Feature | Detail |
|---|---|
| 🎙️ **Live dB monitor** | Alerts if you're too quiet or too loud |
| 🏃 **WPM tracker** | 30-second rolling window — alerts if you rush or speak too slowly |
| 📝 **Whisper subtitles** | Korean & English, VAD-triggered for low latency |
| ⏱️ **Answer timer** | Auto-start on speech, auto-pause on silence |
| 📋 **Feedback report** | Score (0–100), filler word count, STAR analysis, suggestions |
| 🔵 **Mock mode** | Full demo with simulated data — no API key required |

---

## Feedback scoring

After you finish, the app scores your answer out of 100:

- **Filler words** — "음", "그러니까", "like", "um", "you know"
- **Speaking pace** — penalised if average WPM is outside 100–180
- **Volume stability** — flags if dB was consistently too low or high
- **STAR structure** — checks if your answer covered Situation, Task, Action, Result
- **Answer length** — too short (<30s) or too long (>3min) costs points

---

## Thresholds (configurable via `.env`)

| Signal | Recommended zone | Alert |
|---|---|---|
| Volume | -40 dB to -10 dB | `VOLUME_LOW` / `VOLUME_HIGH` |
| Pace | 100 – 180 WPM | `PACE_SLOW` / `PACE_FAST` |

---

## Project structure

```
phase-1/
├── src/
│   ├── server.js                  # Express + WebSocket server
│   ├── engines/
│   │   ├── audioProcessor.js      # dB calculation, WPM rolling window
│   │   ├── sessionManager.js      # Session lifecycle + transcript storage
│   │   ├── feedbackAnalyzer.js    # Rule-based scoring engine
│   │   └── whisperClient.js       # OpenAI Whisper API client
│   ├── api/
│   │   ├── sessions.js            # Session + transcribe endpoints
│   │   └── metrics.js             # Telemetry endpoints
│   └── dashboard/
│       └── index.html             # Single-page dashboard
├── tests/
│   ├── audioProcessor.test.js     # 15 unit tests
│   ├── api.test.js                # 9 integration tests
│   └── feedbackAnalyzer.test.js   # 16 unit tests
├── docs/screenshots/              # README screenshots
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Tests

```bash
npm test   # 40 tests (unit + integration)
```

---

## Team

| Name | Role | Affiliation |
|---|---|---|
| **Jungmin Hong** | AI Platform Engineer | Upstage — AI Infrastructure, LLM Ops |
| **Gichan Lee** | Solution Architect | Bithabit — System Design, Optimization |

---

## System Architecture

```mermaid
graph TD
    subgraph "Browser"
        A[🎤 Microphone] --> B[Web Audio API\ndB every 100ms]
        A --> C[MediaRecorder\naudio chunks]
    end

    subgraph "Node.js Server"
        D[Express REST API]
        E[WebSocket Server]
        F[feedbackAnalyzer.js\nrule-based · no API cost]
    end

    subgraph "External AI"
        G[OpenAI Whisper API\nwhisper-1 · ko / en]
    end

    B -->|dB value| E
    C -->|POST /transcribe| D
    D --> G
    G -->|transcript text| D
    D --> F
    E -->|push dB · WPM · alerts| B
    F -->|score · suggestions| H[📋 Feedback Report]

    style G fill:#412991,color:#fff
    style F fill:#238636,color:#fff
    style E fill:#1f6feb,color:#fff
```

---

## Roadmap

```mermaid
timeline
    title copilot_for_interviews Evolution
    section Phase 1 · Signal Foundation (Mar 2026)
        Real-time dB & WPM monitoring
        OpenAI Whisper STT in Korean & English
        Rule-based feedback report
    section Phase 2 · Cognitive Intelligence (Apr 2026)
        STAR Method Logic Validator via GPT-4
        Sentiment & Tone Alignment
        Live coaching suggestions
    section Phase 3 · Global Mastery (May 2026)
        Multi-persona AI Interviewer Simulator
        Haptic bio-feedback on smartwatches
        Enterprise HR Training Module
```

---

## Development Powered by GitHub Copilot CLI

This project was built during a hackathon using **GitHub Copilot CLI** as the primary development accelerator.

**What Copilot CLI did:**
- Generated the full project boilerplate — Express server, WebSocket, REST API, 40 tests — from a single prompt
- Debugged tricky issues: `ws://` blocked on ngrok HTTPS, Korean regex `\b` boundary failures
- Advised on architecture decisions: Web Speech API vs Whisper tradeoffs, VAD-based latency reduction

**The result:** From idea to working prototype with live mic, Whisper STT, real-time charts, and AI feedback — in one session.

> *Powered by **OpenAI Whisper** | Developed with **GitHub Copilot CLI** | Built by **Jungmin & Gichan***

---

## Built by

**Jungmin Hong** — AI Platform Engineer  
**Gichan Lee** — Solution Architect

---

---

<div align="center">

<a id="korean"></a>

# 🎙️ copilot_for_interviews 한국어

**실시간으로 당신의 목소리를 듣고 피드백을 주는 AI 면접 코치.**

브라우저에서 바로 실행 — 목소리를 모니터링하고, 실시간 자막을 보고, 면접 후 분석 리포트를 확인하세요.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![OpenAI Whisper](https://img.shields.io/badge/OpenAI-Whisper-412991?logo=openai)
![License](https://img.shields.io/badge/license-MIT-blue)

**🌐 Language / 언어**  
[🇺🇸 English](#english) · [🇰🇷 한국어](#korean)

</div>

---

## 무엇을 하나요?

copilot_for_interviews은 기술 면접 연습을 도와주는 도구입니다. **무슨 말을 하는지**가 아니라 **어떻게 말하는지**에 집중합니다.

- 🎤 **라이브 마이크** — 말하는 동안 실시간으로 음량(dB)과 말 속도(WPM)를 측정
- 📝 **자동 자막** — OpenAI Whisper로 한국어/영어 음성을 실시간 텍스트로 변환
- ⏱️ **답변 타이머** — 말하면 자동 시작, 멈추면 자동 일시정지
- 📊 **피드백 리포트** — 세션이 끝나면 점수와 개선 제안 제공 (필러워드, 속도, STAR 구조 분석)

---

## 스크린샷

<table>
  <tr>
    <td align="center"><b>대시보드 — 시작 전</b></td>
    <td align="center"><b>라이브 세션 (차트 실시간 업데이트)</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/01-dashboard.png" width="480"/></td>
    <td><img src="docs/screenshots/02-live-session.png" width="480"/></td>
  </tr>
  <tr>
    <td align="center"><b>실시간 자막 (한국어)</b></td>
    <td align="center"><b>AI 피드백 리포트</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/03-transcript.png" width="480"/></td>
    <td><img src="docs/screenshots/04-report.png" width="480"/></td>
  </tr>
</table>

---

## 빠른 시작

**Node.js 18 이상과 OpenAI API 키가 필요합니다.**

```bash
# 1. 의존성 설치
cd phase-1
npm install

# 2. API 키 설정
cp .env.example .env
# .env 파일을 열어서 OPENAI_API_KEY=sk-... 입력

# 3. 서버 시작
npm start

# 4. 브라우저에서 열기
open http://localhost:3000
```

> **API 키 없어도 됩니다.** Mock 모드로 실행하면 시뮬레이션 데이터로 모든 기능을 체험할 수 있습니다.

### Docker로 실행

```bash
docker-compose up --build
open http://localhost:3000
```

#### 🎨 Interactive Mockup Dashboard

Experience the Phase 1 prototype with our **Gradio-based mockup dashboard**:

📂 **[View Phase 1 Mockup Documentation](phase1_mockup/MOCKUP_README.md)**

**Key Features:**
- Real-time dB Level & WPM monitoring with mock data
- 5-second persistent alert system
- High-contrast dark mode UI optimized for visibility
- Interactive Plotly time-series charts
- Auto-refresh dashboard (2-second intervals)

**Quick Start:**
```bash
# Install dependencies
pip install -r requirements.txt

# Launch dashboard
python3 phase1_mockup/mockup.py
```

Access at: http://localhost:7860

---

## 작동 원리

말을 하면 브라우저가 오디오를 두 가지 방식으로 동시에 처리합니다.

**① 마이크 입력 — 브라우저가 직접 처리**

브라우저가 마이크를 두 가지 방식으로 동시에 읽습니다.

하나는 음량 측정입니다. 100ms마다 지금 얼마나 크게 말하는지를 dB 숫자로 계산합니다. 브라우저 내장 기능이라 별도 비용이 없습니다.

다른 하나는 녹음입니다. 말하는 동안 음성을 파일 조각으로 저장합니다. 말이 멈추면 0.6초 후에 자동으로 그 조각을 서버로 보냅니다.

**② 음성 → 텍스트 변환 — OpenAI Whisper**

서버가 오디오 조각을 받으면 OpenAI Whisper API로 전달합니다. Whisper는 현재 가장 정확한 음성인식 모델 중 하나로, 한국어와 영어를 모두 지원합니다. 약 1~2초 후에 텍스트가 돌아오고, 화면의 자막으로 표시됩니다.

**③ 실시간 데이터 전달 — WebSocket**

dB, WPM, 알림 같은 실시간 데이터는 WebSocket으로 브라우저에 전달됩니다. HTTP와 달리 연결을 계속 유지하기 때문에 서버가 언제든지 브라우저로 데이터를 밀어넣을 수 있습니다. 차트가 끊기지 않고 실시간으로 움직이는 이유입니다.

**④ 피드백 분석 — 서버 자체 계산, 추가 AI 비용 없음**

면접이 끝나면 서버가 직접 분석합니다. OpenAI를 추가로 호출하지 않습니다. 쌓인 자막에서 필러워드를 세고, 평균 속도를 계산하고, STAR 구조 키워드가 있었는지 확인해서 점수를 냅니다. 즉각적이고 추가 비용이 없습니다.

```mermaid
flowchart TD
    MIC([🎤 마이크]) --> WA[Web Audio API\n100ms마다 dB 측정]
    MIC --> MR[MediaRecorder\n음성 청크 녹음]

    WA -->|dB 값| WS_SERVER[Node.js 서버]
    MR -->|오디오 청크 .webm\n침묵 0.6초 후 전송| API_TRANSCRIBE[POST /transcribe]

    API_TRANSCRIBE --> WHISPER[OpenAI Whisper API\nwhisper-1 · 한국어 / 영어]
    WHISPER -->|텍스트 반환| WS_SERVER

    WS_SERVER -->|WebSocket 푸시\ndB · WPM · 알림| DASHBOARD[📊 실시간 대시보드]
    WS_SERVER -->|자막| TRANSCRIPT[📝 실시간 자막 패널]

    FINISH([🏁 면접 종료]) --> ANALYZER[feedbackAnalyzer.js\n규칙 기반 · API 호출 없음]
    ANALYZER -->|점수 · 제안\nSTAR · 필러워드| REPORT[📋 피드백 리포트]

    style WHISPER fill:#412991,color:#fff
    style ANALYZER fill:#238636,color:#fff
    style DASHBOARD fill:#1f6feb,color:#fff
```

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 🎙️ **라이브 음량 모니터** | 너무 작거나 크면 경고 |
| 🏃 **말 속도 측정** | 30초 롤링 윈도우 — 너무 빠르거나 느리면 경고 |
| 📝 **Whisper 자막** | 한국어·영어 지원, VAD 기반 저지연 자막 |
| ⏱️ **답변 타이머** | 말하면 자동 시작, 침묵하면 자동 일시정지 |
| 📋 **피드백 리포트** | 100점 기준 점수, 필러워드 횟수, STAR 분석, 개선 제안 |
| 🔵 **Mock 모드** | API 키 없이도 시뮬레이션 데이터로 전체 기능 체험 |

---

## 피드백 채점 기준

면접이 끝나면 100점 기준으로 채점합니다:

- **필러워드** — "음", "그러니까", "like", "um", "you know" 등
- **말 속도** — 평균 WPM이 100~180 범위를 벗어나면 감점
- **음량 안정성** — dB가 지속적으로 너무 낮거나 높으면 감점
- **STAR 구조** — 상황(Situation), 과제(Task), 행동(Action), 결과(Result) 포함 여부
- **답변 길이** — 30초 미만이거나 3분 초과 시 감점

---

## 임계값 설정 (`.env`에서 변경 가능)

| 신호 | 권장 범위 | 경고 종류 |
|---|---|---|
| 음량 | -40 dB ~ -10 dB | `VOLUME_LOW` / `VOLUME_HIGH` |
| 속도 | 100 ~ 180 WPM | `PACE_SLOW` / `PACE_FAST` |

---

## 프로젝트 구조

```
phase-1/
├── src/
│   ├── server.js                  # Express + WebSocket 서버
│   ├── engines/
│   │   ├── audioProcessor.js      # dB 계산, WPM 롤링 윈도우
│   │   ├── sessionManager.js      # 세션 관리 + 자막 저장
│   │   ├── feedbackAnalyzer.js    # 규칙 기반 채점 엔진
│   │   └── whisperClient.js       # OpenAI Whisper API 클라이언트
│   ├── api/
│   │   ├── sessions.js            # 세션 + 자막 변환 엔드포인트
│   │   └── metrics.js             # 텔레메트리 엔드포인트
│   └── dashboard/
│       └── index.html             # 단일 페이지 대시보드
├── tests/                         # 40개 테스트 (유닛 + 통합)
├── docs/screenshots/              # README 스크린샷
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 테스트

```bash
npm test   # 40개 테스트 실행
```

---

## 팀 소개

| 이름 | 역할 | 소속 |
|---|---|---|
| **홍정민 (Jungmin Hong)** | AI Platform Engineer | Upstage — AI 인프라, LLM Ops |
| **이기찬 (Gichan Lee)** | Solution Architect | Bithabit — 시스템 설계, 최적화 |

---

## 시스템 아키텍처

```mermaid
graph TD
    subgraph "브라우저"
        A[🎤 마이크] --> B[Web Audio API\n100ms마다 dB 측정]
        A --> C[MediaRecorder\n오디오 청크 녹음]
    end

    subgraph "Node.js 서버"
        D[Express REST API]
        E[WebSocket 서버]
        F[feedbackAnalyzer.js\n규칙 기반 · 추가 비용 없음]
    end

    subgraph "외부 AI"
        G[OpenAI Whisper API\nwhisper-1 · 한국어 / 영어]
    end

    B -->|dB 값| E
    C -->|POST /transcribe| D
    D --> G
    G -->|텍스트 반환| D
    D --> F
    E -->|dB · WPM · 알림 푸시| B
    F -->|점수 · 제안| H[📋 피드백 리포트]

    style G fill:#412991,color:#fff
    style F fill:#238636,color:#fff
    style E fill:#1f6feb,color:#fff
```

---

## 로드맵

```mermaid
timeline
    title copilot_for_interviews 발전 계획
    section Phase 1 · Signal Foundation (2026년 3월)
        실시간 dB & WPM 모니터링
        OpenAI Whisper 한국어·영어 자막
        규칙 기반 피드백 리포트
    section Phase 2 · Cognitive Intelligence (2026년 4월)
        GPT-4 기반 STAR 구조 검증
        감정 & 톤 분석
        실시간 코칭 제안
    section Phase 3 · Global Mastery (2026년 5월)
        멀티 페르소나 AI 면접관 시뮬레이터
        스마트워치 햅틱 바이오피드백
        기업 HR 트레이닝 모듈
```

---

## GitHub Copilot CLI로 개발했습니다

이 프로젝트는 해커톤에서 **GitHub Copilot CLI**를 주요 개발 가속 도구로 활용해 만들었습니다.

**Copilot CLI가 한 일:**
- 프롬프트 하나로 전체 보일러플레이트 생성 — Express 서버, WebSocket, REST API, 테스트 40개
- 까다로운 버그 즉시 해결: ngrok HTTPS에서 `ws://` 차단 문제, 한국어 정규식 `\b` 경계 오류
- 아키텍처 결정 조언: Web Speech API vs Whisper 트레이드오프, VAD 기반 지연 감소

**결과:** 아이디어에서 라이브 마이크 + Whisper 자막 + 실시간 차트 + AI 피드백까지 — 한 세션 만에 완성.

> *OpenAI Whisper 기반 | **GitHub Copilot CLI**로 개발 | **Jungmin & Gichan** 제작*

---

## 🧪 Testing & Running the Mockup

### Prerequisites Check

Before running the Gradio mockup, verify that all dependencies are installed:

```bash
# Check if Gradio is installed
python3 -c "import gradio; print(f'✅ Gradio {gradio.__version__} is installed')" 2>/dev/null || echo "❌ Gradio not installed"

# Check if Plotly is installed
python3 -c "import plotly; print(f'✅ Plotly {plotly.__version__} is installed')" 2>/dev/null || echo "❌ Plotly not installed"

# Check if NumPy is installed
python3 -c "import numpy; print(f'✅ NumPy {numpy.__version__} is installed')" 2>/dev/null || echo "❌ NumPy not installed"
```

### Installation

If dependencies are missing, install them:

```bash
# Install all requirements (recommended)
pip install -r requirements.txt

# Or install specific packages
pip install gradio plotly numpy pandas
```

### Running the Mockup Dashboard

```bash
# Standard launch
python3 mockup.py

# Alternative: Using Gradio CLI
gradio mockup.py
```

The dashboard will be available at:
- **Local URL:** http://localhost:7860
- **Public URL:** Gradio will generate a shareable link (visible in terminal output)

### Automated Verification Script

Use this one-liner to check and install:

```bash
# Check all dependencies and install if missing
python3 -c "
import sys
missing = []
try:
    import gradio
except ImportError:
    missing.append('gradio')
try:
    import plotly
except ImportError:
    missing.append('plotly')
try:
    import numpy
except ImportError:
    missing.append('numpy')

if missing:
    print(f'❌ Missing: {missing}')
    print('Run: pip install -r requirements.txt')
    sys.exit(1)
else:
    print('✅ All dependencies installed!')
"
```

### Expected Output

When the mockup runs successfully, you should see:

```
Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://xxxxx.gradio.live

This share link expires in 72 hours.
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'gradio'` | Run `pip install gradio` |
| Port 7860 already in use | Kill existing process: `lsof -ti:7860 \| xargs kill -9` |
| Gradio version mismatch | Upgrade: `pip install --upgrade gradio>=4.0.0` |

---

## 🧠 Development Powered by GitHub Copilot CLI

This entire project was developed during a hackathon using **GitHub Copilot CLI** as the primary development accelerator.

### Real-World Hackathon Experience

**✅ Strengths:**
1. **🤖 Claude Sonnet 4.5 Access:** Enterprise-grade AI reasoning (claude-sonnet-4.5) for rapid prototyping with sufficient token budget for hackathon needs
2. **💰 Cost-Effective Intelligence:** GitHub Pro (via Student Pack) enables virtually free access to premium AI models—GPT-5 mini unlimited for experimentation
3. **⚡ End-to-End Azure Workflow:** Seamlessly executed the full DevOps pipeline:
   - Azure CLI provisioning → Terraform IaC → k3s deployment → AI service integration
   - Zero friction across technology boundaries
4. **🎯 Familiar Developer UX:** Intuitive shortcuts (`Shift+Tab`, `/init`, `/compact`, `/exit`) enable immediate productivity without learning curve

**⚠️ Challenges & Workarounds:**
- **Silent Background Execution:** Long-running tasks (agents, builds, tests) may appear idle without visible progress indicators
  - **Solution:** Use `list_agents` or `list_bash` commands to check active processes
  - **Context:** Unlike other AI CLI tools with token counters, Copilot CLI doesn't show real-time "thinking" indicators
  - **Tip:** For tasks >5 minutes, open a new terminal to monitor system resources independently

### The Hackathon Philosophy

**Real Validation, Not Marketing:**  
The "70% TTM reduction" metric in our architecture diagram isn't aspirational—it's measured reality. During this hackathon, we:
- Deployed complete Azure infrastructure (VMs, Load Balancers, k3s clusters)
- Integrated Azure AI Speech + Azure OpenAI services
- Built and tested the Phase 1 Gradio mockup dashboard

All orchestrated through Copilot CLI's conversational interface. What traditionally takes days was compressed into hours.

**The Meta-Narrative:**  
This project embodies recursive AI augmentation:
- **Human Architects** (Strategic Design) + **AI Executors** (Implementation) = **Exponential Velocity**
- **GitHub Copilot CLI** isn't just a development tool—it's the **meta-layer** of how modern software gets built
- When your interview coaching system is *itself* built by AI coaching developers, you've closed the loop 🚀

### Recommendations for Hackathon Teams

| Use Case | Best Practice |
|----------|---------------|
| **Quick Prototypes** | Use GPT-5 mini (unlimited) for rapid iteration |
| **Complex Architecture** | Switch to Claude Sonnet 4.5 for strategic decisions |
| **Long Deployments** | Run in background, monitor via separate terminal |
| **Learning New Tools** | Ask Copilot CLI to generate examples + explanations inline |

**Bottom Line:** If you have GitHub Pro (free via Student Pack), Copilot CLI is a hackathon force multiplier. Just understand its async execution model and you'll ship faster than any solo human could.

---

> *Powered by **Azure** | Crafted with **GitHub Copilot** | Engineered by **Jungmin & Gichan***
