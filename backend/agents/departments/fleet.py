from backend.agents.base_agent import BaseAgent
from pathlib import Path

class FleetAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="fleet",
            department="Fleet",
            soul_path=str(Path(__file__).parent.parent / "souls" / "fleet.md"),
            tier="manager",
        )
