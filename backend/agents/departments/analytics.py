from backend.agents.base_agent import BaseAgent
from pathlib import Path

class AnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="analytics",
            department="Analytics",
            soul_path=str(Path(__file__).parent.parent / "souls" / "analytics.md"),
            tier="manager",
        )
