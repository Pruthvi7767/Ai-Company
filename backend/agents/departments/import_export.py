from backend.agents.base_agent import BaseAgent
from pathlib import Path

class ImportExportAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="import_export",
            department="Import Export",
            soul_path=str(Path(__file__).parent.parent / "souls" / "import_export.md"),
            tier="manager",
        )
