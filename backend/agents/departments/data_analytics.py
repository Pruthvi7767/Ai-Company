from backend.agents.base_agent import BaseAgent
from pathlib import Path

class DataAnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="data_analytics",
            department="Data Analytics",
            soul_path=str(Path(__file__).parent.parent / "souls" / "data_analytics.md"),
            tier="manager",
        )
