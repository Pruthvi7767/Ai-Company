from backend.agents.base_agent import BaseAgent
from pathlib import Path

class LogisticsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="logistics",
            department="Logistics",
            soul_path=str(Path(__file__).parent.parent / "souls" / "logistics.md"),
            tier="manager",
        )
