from backend.agents.base_agent import BaseAgent
from pathlib import Path

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="risk",
            department="Risk",
            soul_path=str(Path(__file__).parent.parent / "souls" / "risk.md"),
            tier="manager",
        )
