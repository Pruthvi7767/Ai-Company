from backend.agents.base_agent import BaseAgent
from pathlib import Path

class BrandAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="brand",
            department="Brand",
            soul_path=str(Path(__file__).parent.parent / "souls" / "brand.md"),
            tier="manager",
        )
