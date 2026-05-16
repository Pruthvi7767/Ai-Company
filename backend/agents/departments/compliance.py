from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ComplianceAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="compliance",
            department="Compliance",
            soul_path=str(Path(__file__).parent.parent / "souls" / "compliance.md"),
            tier="manager",
        )
