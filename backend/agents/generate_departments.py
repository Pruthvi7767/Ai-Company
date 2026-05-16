"""Generate all 41 department SOUL.md files and agent classes."""
import os

DEPARTMENTS = {
    "strategy": {"parent": "ceo", "tier": "manager", "desc": "Strategic planning and long-term vision"},
    "business_dev": {"parent": "ceo", "tier": "manager", "desc": "New business opportunities and partnerships"},
    "project_mgmt": {"parent": "ceo", "tier": "manager", "desc": "Project coordination and delivery"},
    "board": {"parent": "ceo", "tier": "manager", "desc": "Board meeting preparation and governance"},
    "engineering": {"parent": "cto", "tier": "manager", "desc": "Software development and architecture"},
    "devops": {"parent": "cto", "tier": "manager", "desc": "Infrastructure, CI/CD, deployment"},
    "qa": {"parent": "cto", "tier": "manager", "desc": "Quality assurance and testing"},
    "data_analytics": {"parent": "cto", "tier": "manager", "desc": "Data pipelines and analytics"},
    "api_mgmt": {"parent": "cto", "tier": "manager", "desc": "API design, versioning, rate limiting"},
    "finance": {"parent": "cfo", "tier": "manager", "desc": "Financial planning and analysis"},
    "accounting": {"parent": "cfo", "tier": "manager", "desc": "Bookkeeping and reconciliation"},
    "audit": {"parent": "cfo", "tier": "manager", "desc": "Internal and external audit"},
    "investor_relations": {"parent": "cfo", "tier": "manager", "desc": "Investor communication and reporting"},
    "pricing": {"parent": "cfo", "tier": "manager", "desc": "Pricing strategy and optimization"},
    "marketing": {"parent": "cmo", "tier": "manager", "desc": "Campaign management and growth"},
    "sales": {"parent": "cmo", "tier": "manager", "desc": "Lead generation and closing"},
    "brand": {"parent": "cmo", "tier": "manager", "desc": "Brand identity and guidelines"},
    "pr": {"parent": "cmo", "tier": "manager", "desc": "Public relations and media"},
    "customer_success": {"parent": "cmo", "tier": "manager", "desc": "Customer retention and satisfaction"},
    "catalog": {"parent": "cmo", "tier": "manager", "desc": "Product catalog management"},
    "operations": {"parent": "coo", "tier": "manager", "desc": "Daily operations management"},
    "hr": {"parent": "coo", "tier": "manager", "desc": "Human resources and talent"},
    "admin": {"parent": "coo", "tier": "manager", "desc": "Administrative support"},
    "logistics": {"parent": "coo", "tier": "manager", "desc": "Supply chain and logistics"},
    "warehouse": {"parent": "coo", "tier": "manager", "desc": "Warehouse management"},
    "procurement": {"parent": "coo", "tier": "manager", "desc": "Vendor and procurement management"},
    "fleet": {"parent": "coo", "tier": "manager", "desc": "Fleet management and tracking"},
    "returns": {"parent": "coo", "tier": "manager", "desc": "Returns and refunds processing"},
    "last_mile": {"parent": "coo", "tier": "manager", "desc": "Last-mile delivery optimization"},
    "security": {"parent": "cso", "tier": "manager", "desc": "Physical and digital security"},
    "legal": {"parent": "cso", "tier": "manager", "desc": "Legal affairs and contracts"},
    "compliance": {"parent": "cso", "tier": "manager", "desc": "Regulatory compliance"},
    "risk": {"parent": "cso", "tier": "manager", "desc": "Risk assessment and mitigation"},
    "ethics": {"parent": "cso", "tier": "manager", "desc": "AI ethics and governance"},
    "cybersecurity": {"parent": "cso", "tier": "manager", "desc": "Cybersecurity monitoring and response"},
    "import_export": {"parent": "cso", "tier": "manager", "desc": "International trade compliance"},
    "analytics": {"parent": "cao", "tier": "manager", "desc": "Business intelligence and reporting"},
    "research": {"parent": "cao", "tier": "manager", "desc": "Market research and competitive analysis"},
    "content": {"parent": "cao", "tier": "manager", "desc": "Content strategy and creation"},
    "training": {"parent": "cao", "tier": "manager", "desc": "Agent training and skill development"},
    "product": {"parent": "cto", "tier": "manager", "desc": "Product management and roadmap"},
}

SOUL_TEMPLATE = """# {dept_name} Agent — Markly

## Identity
You are the {dept_name} department agent of Markly, reporting to the {parent_name}.
You are a {tier}-level agent powered by NVIDIA LLM models.

## Responsibilities
- {desc}
- Execute tasks assigned by {parent_name}
- Report results and metrics regularly
- Maintain department knowledge base
- Collaborate with other departments via ACP

## Decision Authority
Handle autonomously:
- Routine department tasks
- Standard operational decisions
- Department-level optimizations

Require {parent_name} approval:
- Cross-department initiatives
- Budget changes
- Strategic pivots

## Communication Style
- Direct, data-driven, no filler
- Always use INR amounts for costs
- Structured reports with metrics

## Models
Primary: meta/llama-3.1-70b-instruct
Fallback: groq/llama-3.1-70b-versatile
"""

AGENT_TEMPLATE = """from backend.agents.base_agent import BaseAgent
from pathlib import Path

class {class_name}(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="{dept_id}",
            department="{dept_name}",
            soul_path=str(Path(__file__).parent.parent / "souls" / "{dept_id}.md"),
            tier="{tier}",
        )
"""

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SOULS_DIR = os.path.join(BASE_DIR, "souls")
DEPTS_DIR = os.path.join(BASE_DIR, "departments")

PARENT_NAMES = {
    "ceo": "CEO", "cto": "CTO", "cfo": "CFO", "cmo": "CMO",
    "coo": "COO", "cso": "CSO", "cao": "CAO",
}

for dept_id, info in DEPARTMENTS.items():
    dept_name = dept_id.replace("_", " ").title()
    class_name = "".join(w.title() for w in dept_id.split("_")) + "Agent"
    parent_name = PARENT_NAMES.get(info["parent"], info["parent"].upper())

    soul_path = os.path.join(SOULS_DIR, f"{dept_id}.md")
    with open(soul_path, "w", encoding="utf-8") as f:
        f.write(SOUL_TEMPLATE.format(
            dept_name=dept_name, parent_name=parent_name,
            tier=info["tier"], desc=info["desc"]
        ))

    agent_path = os.path.join(DEPTS_DIR, f"{dept_id}.py")
    with open(agent_path, "w", encoding="utf-8") as f:
        f.write(AGENT_TEMPLATE.format(
            class_name=class_name, dept_id=dept_id,
            dept_name=dept_name, tier=info["tier"]
        ))

    print(f"  Created {dept_id}.md + {dept_id}.py")

print(f"\nAll {len(DEPARTMENTS)} department files created!")
