from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ProcurementAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="procurement",
            department="Procurement",
            soul_path=str(Path(__file__).parent.parent / "souls" / "procurement.md"),
            tier="manager",
        )
