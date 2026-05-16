from backend.agents.base_agent import BaseAgent
from pathlib import Path

class SalesAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="sales",
            department="Sales",
            soul_path=str(Path(__file__).parent.parent / "souls" / "sales.md"),
            tier="manager",
        )
