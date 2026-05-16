from backend.agents.base_agent import BaseAgent
from pathlib import Path

class WarehouseAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="warehouse",
            department="Warehouse",
            soul_path=str(Path(__file__).parent.parent / "souls" / "warehouse.md"),
            tier="manager",
        )
