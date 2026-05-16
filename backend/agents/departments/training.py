from backend.agents.base_agent import BaseAgent
from pathlib import Path

class TrainingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="training",
            department="Training",
            soul_path=str(Path(__file__).parent.parent / "souls" / "training.md"),
            tier="manager",
        )
