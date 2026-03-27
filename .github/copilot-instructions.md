# Copilot Instructions for Signal Copilot

This document provides key context for AI assistants working on the Signal Copilot codebase.

## Project Overview

**Signal Copilot** is an AI-augmented communication optimizer for high-stakes technical interviews. It provides real-time feedback on voice dynamics (Volume, Pace, Clarity) and logical consistency in interview responses.

- **Architecture**: Azure-based infrastructure orchestrated via k3s (lightweight Kubernetes)
- **AI Services**: Azure AI Speech Services + Azure OpenAI Service
- **Development**: Heavily automated with GitHub Copilot for IaC and code synthesis

## Current Status

The project is in **Phase 1: Signal Foundation (IN PROGRESS)** with focus on:
- Real-time audio telemetry (dB/WPM monitoring)
- k3s cluster infrastructure on Azure
- IaC automation for reproducible deployments

Currently minimal implementation—mostly architectural planning and infrastructure design.

## Tech Stack & Principles

### Core Technologies
- **Infrastructure**: Azure Virtual Machines + k3s (Lightweight Kubernetes)
- **AI/ML**: Azure AI Speech Services, Azure OpenAI Service
- **Development Velocity**: GitHub Copilot for code synthesis, Copilot CLI for infrastructure provisioning

### Key Principles
1. **Low Latency & Edge-Ready**: Design for fast, portable deployments
2. **IaC First**: All infrastructure defined as code; minimize manual Azure configuration
3. **Real-time Feedback**: Prioritize sub-second signal processing for interview scenarios
4. **Scalability**: Assume k3s will run across multiple zones (eventually)

## Phases & Roadmap

### Phase 1: Signal Foundation (Current)
Focus: Audio telemetry, infrastructure setup
- dB Level Monitor (prevent mumbling)
- WPM Counter (prevent rushing)
- k3s cluster provisioning

### Phase 2: Cognitive Intelligence
Focus: Interview logic validation & feedback
- STAR Method Logic Validator (Situation, Task, Action, Result)
- Sentiment & Tone Alignment analyzer
- Automated Tactical Debrief PDF generation

### Phase 3: Global Mastery
Focus: Multi-persona practice & wearable integration
- Singapore/Global accent optimization
- Haptic bio-feedback on smartwatches
- AI Interviewer Simulator (Aggressive/Collaborative/Technical personas)

## Code Organization (When Implemented)

Expected structure (to be created as implementation begins):
- `infrastructure/` - IaC templates (Terraform/Bicep for Azure, k3s config)
- `backend/` - API services (Speech processing, logic validation)
- `frontend/` - Web UI for dashboard & feedback
- `models/` - Custom ML models & prompt templates for Azure OpenAI
- `scripts/` - Deployment & automation scripts

## Build & Test Commands

*To be defined as implementation begins. Update this section when build/test infrastructure is created.*

Common patterns when established:
- `make deploy` or `terraform apply` for infrastructure
- `npm test` / `pytest` for unit tests
- `make k3s-up` / `make k3s-down` for local k3s clusters

## Key Conventions

*To be established as codebase grows. Conventions to consider:*

- **IaC Naming**: Follow Azure resource naming standards (prefix-env-type convention)
- **Container Images**: Tag with semver (e.g., `signal-api:0.1.0`)
- **API Versioning**: Use `/api/v1/` prefix for stable endpoints
- **Logging**: All services should emit structured logs (JSON format) to support aggregation
- **Metrics**: Instrument with Prometheus-compatible metrics for monitoring in k3s

## Azure & k3s Deployment Notes

### Prerequisites
- Azure CLI configured with correct subscription
- kubectl configured for k3s cluster access
- GitHub Copilot CLI for IaC automation

### Typical Workflow
1. Infrastructure changes → Define in IaC (Bicep/Terraform)
2. Use Copilot CLI to validate & deploy infrastructure
3. Container images built & pushed to Azure Container Registry (ACR)
4. k3s deployments via kubectl manifests or Helm charts
5. Monitor via Azure Monitor & k3s dashboards

## Known Challenges & Design Decisions

- **Sub-second Latency**: Azure AI Speech may introduce latency; consider edge processing or WebRTC integration
- **WPM Calculation**: Requires accurate speech-to-text; fallback strategies needed for accent variations
- **Kubernetes Complexity**: k3s is lightweight but still requires cluster management (RBAC, storage classes, etc.)

## Useful Resources

- [Azure AI Speech Services Docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Azure OpenAI API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
- [k3s Documentation](https://docs.k3s.io/)
- STAR Method: Situation, Task, Action, Result framework for structured interview responses

## Team Context

- **Jungmin Hong**: AI Platform Engineer (Upstage) - Infrastructure & LLM Ops lead
- **Gichan Lee**: Solution Architect (Bithabit) - System Design & optimization

---

**Last Updated**: Phase 1 planning phase  
**Maintained by**: Development team  

*This document evolves with the project. Update as architecture solidifies and conventions emerge.*
