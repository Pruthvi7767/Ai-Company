from backend.agents.base_agent import BaseAgent
from pathlib import Path

class EngineeringAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="engineering",
            department="Engineering",
            soul_path=str(Path(__file__).parent.parent / "souls" / "engineering.md"),
            tier="manager",
        )
