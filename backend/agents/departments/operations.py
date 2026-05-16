from backend.agents.base_agent import BaseAgent
from pathlib import Path

class OperationsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="operations",
            department="Operations",
            soul_path=str(Path(__file__).parent.parent / "souls" / "operations.md"),
            tier="manager",
        )
