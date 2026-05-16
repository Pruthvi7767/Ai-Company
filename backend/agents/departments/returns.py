from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ReturnsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="returns",
            department="Returns",
            soul_path=str(Path(__file__).parent.parent / "souls" / "returns.md"),
            tier="manager",
        )
