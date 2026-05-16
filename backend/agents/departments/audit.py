from backend.agents.base_agent import BaseAgent
from pathlib import Path

class AuditAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="audit",
            department="Audit",
            soul_path=str(Path(__file__).parent.parent / "souls" / "audit.md"),
            tier="manager",
        )
