from backend.agents.base_agent import BaseAgent
from pathlib import Path

class DevopsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="devops",
            department="Devops",
            soul_path=str(Path(__file__).parent.parent / "souls" / "devops.md"),
            tier="manager",
        )
