from backend.agents.base_agent import BaseAgent
from pathlib import Path

class CustomerSuccessAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="customer_success",
            department="Customer Success",
            soul_path=str(Path(__file__).parent.parent / "souls" / "customer_success.md"),
            tier="manager",
        )
