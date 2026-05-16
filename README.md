# Markly AI Company Platform

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)

**Autonomous AI Business Platform** - A multi-agent system that runs a complete digital business autonomously.

[Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

---

## 🚀 Overview

Markly is an autonomous AI business platform that deploys a hierarchy of intelligent agents to manage and operate multiple income streams. The system features a C-Suite of executive agents (CEO, COO, CTO, CMO, CFO, CSO, CAO) that coordinate department-level agents to execute business operations across connected platforms.

### Key Capabilities

- **🤖 Multi-Agent Hierarchy** - C-Suite executives manage department agents with task delegation
- **💰 Income Stream Management** - Automated SaaS, E-commerce, Affiliate, and Content revenue streams
- ** Platform Connectors** - Integrations with Stripe, Shopify, Twitter, LinkedIn, YouTube, and more
- **📊 Real-Time Analytics** - Live dashboards for revenue, agent performance, and platform growth
- ** Email Intelligence** - IMAP/SMTP connectors for Gmail, Outlook, Yahoo, iCloud
- **🔒 Approval Workflow** - Human-in-the-loop approval system for critical decisions
- **📋 Board Meetings** - Automated meeting transcripts and action items
- **🧠 Knowledge Base** - Shared intelligence across all agents

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Markly Platform                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Vite)                       │
│  ├── Dashboard          ├── Agent Chat                      │
│  ├── Analytics          ├── Connectors                      │
│  ├── Earnings           ├── Settings                        │
│  └── 15+ Pages          └── Real-time WebSocket Updates     │
├─────────────────────────────────────────────────────────────┤
│  Backend (FastAPI + SQLite/Supabase)                        │
│  ├── Agent Management   ├── Income Streams                  │
│  ├── Connectors         ├── Analytics Engine                │
│  ├── WebSocket Server   ├── Approval System                 │
│  └── LLM Integration    └── Audit Logging                   │
├─────────────────────────────────────────────────────────────┤
│  AI Layer                                                     │
│  ├── NVIDIA Nemotron 340B (C-Suite)                        │
│  ├── NVIDIA Llama 70B (Department)                         │
│  ├── Groq Llama 3.3 70B (Fallback)                         │
│  └── Model Selector with Tier-based Routing                │
└─────────────────────────────────────────────────────────────┘
```

### Agent Hierarchy

```
CEO Agent (C-Suite)
├── COO Agent → Operations Department
├── CTO Agent → Engineering Department
── CMO Agent → Marketing Department
├── CFO Agent → Finance Department
├── CSO Agent → Security Department
└── CAO Agent → Analytics Department
```

---

## ✨ Features

### Agent System
- **7 C-Suite Agents** with specialized roles and responsibilities
- **Dynamic Agent Spawning** - Create task-specific agents on demand
- **Task Delegation** - Automatic routing of tasks to appropriate agents
- **Performance Tracking** - Real-time metrics on tasks, success rate, and ROI

### Income Streams
| Stream | Description | Platforms |
|--------|-------------|-----------|
| SaaS | Subscription software revenue | Stripe, Gumroad |
| E-commerce | Online product sales | Shopify, Amazon |
| Affiliate | Commission-based marketing | Amazon Associates, ShareASale |
| Content | Ad revenue and sponsorships | YouTube, Medium, Twitter |

### Connectors
- **Payments**: Stripe, PayPal
- **E-commerce**: Shopify, Amazon
- **Social**: Twitter/X, LinkedIn, YouTube
- **Email**: Gmail, Outlook, Yahoo, iCloud (IMAP/SMTP)
- **Content**: Medium, Substack

---

##  Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Pruthvi7767/ai-company.git
cd ai-company

# Setup Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your API keys
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Setup Frontend (in a new terminal)
cd app
npm install
npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📡 API Reference

### Agents
```http
GET    /api/agents              # List all agents
GET    /api/agents/{id}         # Get agent details
POST   /api/agents/{id}/task    # Assign task to agent
```

### Connectors
```http
GET    /api/connectors          # List all connectors
POST   /api/connectors/{id}/connect    # Connect platform
DELETE /api/connectors/{id}/disconnect # Disconnect platform
```

### Analytics
```http
GET    /api/analytics/overview      # Dashboard overview
GET    /api/analytics/revenue       # Revenue analytics
GET    /api/analytics/platforms     # Platform performance
GET    /api/analytics/competitive   # Market intelligence
```

### Income Streams
```http
GET    /api/income-streams          # List all streams
GET    /api/earnings                # Earnings data
GET    /api/dashboard/summary       # Dashboard summary
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| **Backend** | FastAPI, Pydantic, SQLite/Supabase |
| **AI/ML** | NVIDIA Nemotron, Llama 3.1/3.3, Groq |
| **Real-time** | WebSockets |
| **Storage** | SQLite (local), Supabase (cloud) |
| **Email** | IMAP/SMTP connectors |

---

## 📁 Project Structure

```
ai-company/
├── backend/
│   ├── api/              # API route handlers
│   ├── database/         # Database clients (SQLite/Supabase)
│   ├── services/         # Business logic services
│   │   ├── llm/          # LLM model selection & routing
│   │   └── agents/       # Agent management
│   ├── config.py         # Application configuration
│   ├── main.py           # FastAPI application entry
│   └── requirements.txt  # Python dependencies
├── app/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React context providers
│   │   └── data/         # Static data & configurations
│   ├── package.json      # Node dependencies
│   └── vite.config.ts    # Vite configuration
├── data/                 # Local SQLite database
── docs/                 # Documentation
── README.md             # Project documentation
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# LLM API Keys
NVIDIA_API_KEY=your_nvidia_api_key
GROQ_API_KEY=your_groq_api_key

# Database (optional - uses SQLite by default)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Email Connectors
IMAP_SERVER=imap.gmail.com
SMTP_SERVER=smtp.gmail.com
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd app
npm test
```

---

##  System Status

| Component | Status | Endpoint |
|-----------|--------|----------|
| Backend API | ✅ Online | `/health` |
| Frontend | ✅ Online | `/` |
| Agent System | ✅ Running | `/api/agents` |
| WebSocket | ✅ Active | `/ws/activity` |
| Database | ✅ Connected | SQLite/Supabase |

---

##  Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- NVIDIA for Nemotron and Llama models
- Groq for high-speed inference
- FastAPI team for the excellent framework
- React community for the ecosystem

---

<div align="center">

**Markly AI Company Platform v2.0.0**

Built with ❤️ by the Markly Team

</div>
