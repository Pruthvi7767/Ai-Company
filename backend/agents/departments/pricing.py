from backend.agents.base_agent import BaseAgent
from pathlib import Path

class PricingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="pricing",
            department="Pricing",
            soul_path=str(Path(__file__).parent.parent / "souls" / "pricing.md"),
            tier="manager",
        )
