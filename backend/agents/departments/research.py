from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="research",
            department="Research",
            soul_path=str(Path(__file__).parent.parent / "souls" / "research.md"),
            tier="manager",
        )
