from backend.agents.base_agent import BaseAgent
from pathlib import Path

class BusinessDevAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="business_dev",
            department="Business Dev",
            soul_path=str(Path(__file__).parent.parent / "souls" / "business_dev.md"),
            tier="manager",
        )
