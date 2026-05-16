from backend.agents.base_agent import BaseAgent
from pathlib import Path

class FinanceAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="finance",
            department="Finance",
            soul_path=str(Path(__file__).parent.parent / "souls" / "finance.md"),
            tier="manager",
        )
