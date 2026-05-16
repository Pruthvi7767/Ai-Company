from backend.agents.base_agent import BaseAgent
from pathlib import Path

class LastMileAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="last_mile",
            department="Last Mile",
            soul_path=str(Path(__file__).parent.parent / "souls" / "last_mile.md"),
            tier="manager",
        )
