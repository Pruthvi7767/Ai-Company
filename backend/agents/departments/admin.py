from backend.agents.base_agent import BaseAgent
from pathlib import Path

class AdminAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="admin",
            department="Admin",
            soul_path=str(Path(__file__).parent.parent / "souls" / "admin.md"),
            tier="manager",
        )
