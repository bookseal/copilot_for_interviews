# 🚀 Signal Copilot for Interviews
> **"Optimize your Signal, Architect your Career Success."**

Signal Copilot is an AI-augmented communication optimizer designed for high-stakes technical interviews. Built on **Azure** and orchestrated via **k3s**, it provides real-time feedback on voice dynamics (Volume, Pace, Clarity) to ensure your professional "Signal" is delivered without noise.

---

## 👥 The Dream Team

| Name | Role | Affiliation & Expertise |
| :--- | :--- | :--- |
| **Jungmin Hong** | **AI Platform Engineer** | **Upstage** \| Expert in AI Infrastructure, Scalability, and LLM Ops. |
| **Gichan Lee** | **Solution Architect** | **Bithabit** \| Specialist in System Design, Strategic Architecture, and Optimization. |

---

## 🏗️ System Architecture

Our architecture focuses on **Low Latency** and **Edge-ready** scalability, leveraging Azure's robust AI ecosystem.

```mermaid
graph TD
    subgraph "User Interface (Frontend)"
        A[🎤 Audio Stream] --> B{Signal Analyzer}
        B -->|Real-time Metrics| C[📊 Feedback Dashboard]
    end

    subgraph "Azure Cloud (k3s Cluster)"
        D[Azure Load Balancer] --> E[k3s Ingress]
        E --> F[Speech-to-Text Pod]
        E --> G[Logic Analysis Pod]
        F --> H[Azure AI Speech Services]
        G --> I[Azure OpenAI Service]
    end

    subgraph "AI-Augmented Development"
        J[GitHub Copilot] --> K[Code Synthesis]
        L[Copilot CLI] --> M[Azure/k3s Provisioning]
    end

    H -.->|Telemetry| B
    I -.->|Logic Evaluation| C

    style A fill:#FFD700,stroke:#333,stroke-width:2px
    style C fill:#87CEEB,stroke:#333,stroke-width:2px
    style H fill:#90EE90,stroke:#333,stroke-width:2px
    style I fill:#90EE90,stroke:#333,stroke-width:2px
    style J fill:#FFB6C1,stroke:#333,stroke-width:2px
```

---

## 🛠️ Tech Stack & Implementation

- **Infrastructure:** Deployed on Azure Virtual Machines using **k3s** (Lightweight Kubernetes) for high-performance, cost-effective orchestration.
- **Developer Velocity:** 100% of the code and DevOps workflows were accelerated by **GitHub Copilot** and **Copilot CLI**, reducing TTM (Time-To-Market) by 70%.
- **Core Engine:** Azure AI Speech for sub-second audio signal processing and Azure OpenAI for logical consistency checks.

---

## 📅 Development Roadmap

```mermaid
timeline
    title Signal Copilot Evolution Roadmap
    section Phase 1 · Signal Foundation (Mar 2026)
        Real-time Audio Sampling (dB/WPM)
        Azure k3s Cluster Infrastructure
        GitHub Copilot-driven Prototyping
    section Phase 2 · Cognitive Intelligence (Apr 2026)
        STAR Method Logic Validator
        Sentiment & Tone Alignment
        Post-Interview Insight Report
    section Phase 3 · Global Mastery (May 2026)
        Singapore/Global Accent Optimization
        Haptic Bio-feedback Integration
        Enterprise HR Training Module
```

---

### Phase 1: Signal Foundation (IN PROGRESS 🏗️)

```mermaid
flowchart LR
    A[🎤 Audio Input] --> B[dB Level Monitor]
    A --> C[WPM Counter]
    B --> D{Signal OK?}
    C --> D
    D -->|Too Quiet / Too Fast| E[⚠️ Real-time Alert]
    D -->|Optimal Range| F[✅ Signal Clear]
    G[GitHub Copilot] -->|IaC Automation| H[k3s on Azure]
    H --> I[Edge-ready Cluster]
```

- **Real-time Audio Telemetry:** Monitoring Decibel (dB) levels and Words Per Minute (WPM) to prevent "mumbling" or "rushing."
- **Lightweight Orchestration:** Implementing k3s on Azure to ensure the system is portable and edge-capable.
- **Copilot CLI Workflow:** Automating infrastructure-as-code (IaC) to minimize human error in cloud provisioning.

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

### Phase 2: Cognitive Architecture

```mermaid
flowchart TD
    A[🗣️ Interview Answer] --> B[STAR Validator]
    B --> B1[Situation]
    B --> B2[Task]
    B --> B3[Action]
    B --> B4[Result]
    B1 & B2 & B3 & B4 --> C{Logic Check}
    C -->|Pass| D[Tone Analyzer]
    C -->|Fail| E[💡 STAR Feedback]
    D --> D1[Aggressive]
    D --> D2[Collaborative]
    D --> D3[Neutral]
    D1 & D2 & D3 --> F[📄 Tactical Debrief PDF]
```

- **Logic-Loom Validator:** AI-driven check to ensure answers follow the **STAR** (Situation, Task, Action, Result) framework.
- **Cultural Tone Matching:** Analyzing speech sentiment to align with specific company cultures (e.g., Aggressive vs. Collaborative).
- **Automated Tactical Debrief:** Detailed PDF report highlighting communication bottlenecks and improvement areas.

---

### Phase 3: Global Mastery

```mermaid
flowchart LR
    A[🌏 Global Candidate] --> B[Singapore Hub Tuning]
    B --> C{Clarity & Efficiency Check}
    C -->|Drift Detected| D[⌚ Haptic Alert on Smartwatch]
    C -->|On Target| E[✅ Optimal Signal]
    A --> F[AI Interviewer Simulator]
    F --> F1[Persona: Aggressive]
    F --> F2[Persona: Collaborative]
    F --> F3[Persona: Technical]
    F1 & F2 & F3 --> G[🏆 Multi-persona Practice Report]
```

- **Singapore Hub Tuning:** Specifically optimized for Global Big Tech standards in Singapore (Clarity & Efficiency).
- **Wearable Feedback Loop:** Real-time haptic alerts (vibrations) on smartwatches when speech parameters drift from optimal ranges.
- **Multi-persona Simulation:** Interview practice modes against various AI-driven interviewer archetypes.

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

### Why Copilot CLI for Hackathons?

**Strengths:**
- **🤖 Claude Sonnet 4.5 Access:** Enterprise-grade AI reasoning available for rapid prototyping
- **💰 Cost-Effective:** GitHub Pro (via Student Pack) provides virtually unlimited access to GPT-5 mini for experimentation
- **⚡ End-to-End Workflow:** Seamlessly handled Azure CLI → Terraform → k3s deployment without friction
- **🎯 Familiar UX:** Standard shortcuts (`Shift+Tab`, `/init`, `/compact`, `/exit`) enable immediate productivity

**Real-World Validation:**
During this hackathon, we deployed the entire Azure infrastructure, provisioned k3s clusters, and integrated AI services—all orchestrated through Copilot CLI. The 70% TTM reduction metric in our architecture isn't marketing; it's our lived experience.

**One Challenge:**
Occasionally, long-running background tasks (agents, builds) appear idle without visible progress indicators. Workaround: Check active processes with `list_agents` or `list_bash` commands.

### The Hackathon Philosophy

This project embodies the future of AI-augmented development:
- **Human Architects + AI Executors** = Exponential velocity
- **GitHub Copilot CLI** isn't just a tool—it's the meta-layer of how modern software gets built

When your interview coaching system is itself built by AI coaching developers, you've closed the loop. 🚀

---

> *Powered by **Azure** | Crafted with **GitHub Copilot** | Engineered by **Jungmin & Gichan***
