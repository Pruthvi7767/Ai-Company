from backend.agents.base_agent import BaseAgent
from pathlib import Path

class CybersecurityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="cybersecurity",
            department="Cybersecurity",
            soul_path=str(Path(__file__).parent.parent / "souls" / "cybersecurity.md"),
            tier="manager",
        )
