# Signal Copilot for Interviews - Development Guide

## Project Overview

Signal Copilot is an AI-augmented communication optimizer for technical interviews. The system provides real-time feedback on voice dynamics (Volume, Pace, Clarity) through:

- **Frontend:** Audio capture and real-time feedback dashboard
- **Backend:** k3s-orchestrated microservices on Azure
- **AI Services:** Azure AI Speech (speech-to-text) and Azure OpenAI (logic evaluation)

## Architecture Pattern

### Multi-Phase System Design

The project follows a phased approach:

1. **Phase 1 (Signal Foundation):** Real-time audio telemetry (dB/WPM), k3s cluster on Azure
2. **Phase 2 (Cognitive Architecture):** STAR method validation, sentiment analysis, debrief reports
3. **Phase 3 (Global Mastery):** Accent optimization, haptic feedback, multi-persona simulation

### Service Separation

- **Speech-to-Text Pod:** Integrates with Azure AI Speech Services for audio processing
- **Logic Analysis Pod:** Uses Azure OpenAI for STAR framework validation and sentiment analysis
- **k3s Ingress:** Routes traffic through Azure Load Balancer

## Infrastructure Conventions

### k3s on Azure

- Use **lightweight Kubernetes (k3s)** for orchestration, not full K8s
- Infrastructure provisioning should be automated via IaC (Infrastructure as Code)
- Target edge-ready deployments for low latency
- All cluster configs should support Azure VM deployment

### Azure Services Integration

- **Azure AI Speech:** For sub-second audio signal processing
- **Azure OpenAI:** For logical consistency checks and STAR validation
- Configure services to minimize latency for real-time feedback

## Key Technical Requirements

### Real-Time Audio Processing

- Monitor **dB levels** to prevent mumbling (too quiet)
- Track **WPM (Words Per Minute)** to detect rushing
- Maintain optimal signal ranges for interview communication
- Alert thresholds: configurable per user/context

### STAR Method Validation

When implementing logic validation:
- Parse for **Situation**, **Task**, **Action**, **Result** components
- Flag incomplete or missing framework elements
- Provide specific tactical feedback on structure gaps

### Cultural Tone Matching

Sentiment analysis should categorize responses as:
- **Aggressive:** Direct, assertive communication style
- **Collaborative:** Team-oriented, inclusive language
- **Neutral:** Balanced, professional tone

Match analysis to target company culture preferences.

## Development Focus Areas

### Singapore/Global Standards

- Optimize for **Clarity** and **Efficiency** metrics
- Support global accent variations
- Calibrate for Big Tech interview standards

### Haptic Feedback Integration (Phase 3)

When implementing wearable alerts:
- Target smartwatch platforms for haptic feedback
- Trigger vibrations when speech parameters drift from optimal ranges
- Keep latency under 500ms for real-time effectiveness

## Target Metrics

- **TTM Reduction:** Aim for 70%+ reduction in Time-To-Market through AI-assisted development
- **Audio Latency:** Sub-second processing for speech-to-text
- **Real-time Feedback:** <100ms delay for dB/WPM alerts
- **STAR Validation:** <2s response time for logic analysis

## Development Workflow

- Use **GitHub Copilot** and **Copilot CLI** for accelerated development
- Automate Azure provisioning to minimize manual configuration errors
- Prioritize edge-ready architecture for portability

## Team Context

**Jungmin Hong** (AI Platform Engineer @ Upstage): AI Infrastructure, Scalability, LLM Ops  
**Gichan Lee** (Solution Architect @ Bithabit): System Design, Strategic Architecture, Optimization
