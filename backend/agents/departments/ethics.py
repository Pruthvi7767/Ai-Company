from backend.agents.base_agent import BaseAgent
from pathlib import Path

class EthicsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="ethics",
            department="Ethics",
            soul_path=str(Path(__file__).parent.parent / "souls" / "ethics.md"),
            tier="manager",
        )
