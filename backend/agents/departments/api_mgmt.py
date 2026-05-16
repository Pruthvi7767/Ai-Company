from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ApiMgmtAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="api_mgmt",
            department="Api Mgmt",
            soul_path=str(Path(__file__).parent.parent / "souls" / "api_mgmt.md"),
            tier="manager",
        )
