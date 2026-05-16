from backend.agents.base_agent import BaseAgent
from pathlib import Path

class BoardAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="board",
            department="Board",
            soul_path=str(Path(__file__).parent.parent / "souls" / "board.md"),
            tier="manager",
        )
