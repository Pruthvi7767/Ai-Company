from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ProductAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="product",
            department="Product",
            soul_path=str(Path(__file__).parent.parent / "souls" / "product.md"),
            tier="manager",
        )
