from backend.agents.base_agent import BaseAgent
from pathlib import Path

class MarketingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="marketing",
            department="Marketing",
            soul_path=str(Path(__file__).parent.parent / "souls" / "marketing.md"),
            tier="manager",
        )
