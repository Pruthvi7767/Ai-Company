from backend.agents.base_agent import BaseAgent
from pathlib import Path

SOUL_PATH = str(Path(__file__).parent.parent / "souls" / "ceo.md")

class CEOAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="ceo",
            department="C-Suite",
            soul_path=SOUL_PATH,
            tier="csuite",
        )
