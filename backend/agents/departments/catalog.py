from backend.agents.base_agent import BaseAgent
from pathlib import Path

class CatalogAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="catalog",
            department="Catalog",
            soul_path=str(Path(__file__).parent.parent / "souls" / "catalog.md"),
            tier="manager",
        )
