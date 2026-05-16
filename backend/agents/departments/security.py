from backend.agents.base_agent import BaseAgent
from pathlib import Path

class SecurityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="security",
            department="Security",
            soul_path=str(Path(__file__).parent.parent / "souls" / "security.md"),
            tier="manager",
        )
