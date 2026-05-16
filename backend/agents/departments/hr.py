from backend.agents.base_agent import BaseAgent
from pathlib import Path

class HrAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="hr",
            department="Hr",
            soul_path=str(Path(__file__).parent.parent / "souls" / "hr.md"),
            tier="manager",
        )
