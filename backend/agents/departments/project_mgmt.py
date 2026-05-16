from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ProjectMgmtAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="project_mgmt",
            department="Project Mgmt",
            soul_path=str(Path(__file__).parent.parent / "souls" / "project_mgmt.md"),
            tier="manager",
        )
