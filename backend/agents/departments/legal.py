from backend.agents.base_agent import BaseAgent
from pathlib import Path

class LegalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="legal",
            department="Legal",
            soul_path=str(Path(__file__).parent.parent / "souls" / "legal.md"),
            tier="manager",
        )
