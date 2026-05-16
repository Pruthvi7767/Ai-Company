from backend.agents.base_agent import BaseAgent
from pathlib import Path

class QaAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="qa",
            department="Qa",
            soul_path=str(Path(__file__).parent.parent / "souls" / "qa.md"),
            tier="manager",
        )
