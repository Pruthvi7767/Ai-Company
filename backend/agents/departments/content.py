from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ContentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="content",
            department="Content",
            soul_path=str(Path(__file__).parent.parent / "souls" / "content.md"),
            tier="manager",
        )
