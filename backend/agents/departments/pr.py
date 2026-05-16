from backend.agents.base_agent import BaseAgent
from pathlib import Path

class PrAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="pr",
            department="Pr",
            soul_path=str(Path(__file__).parent.parent / "souls" / "pr.md"),
            tier="manager",
        )
