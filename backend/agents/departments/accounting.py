from backend.agents.base_agent import BaseAgent
from pathlib import Path

class AccountingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="accounting",
            department="Accounting",
            soul_path=str(Path(__file__).parent.parent / "souls" / "accounting.md"),
            tier="manager",
        )
