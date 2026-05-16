from backend.agents.base_agent import BaseAgent
from pathlib import Path

class InvestorRelationsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="investor_relations",
            department="Investor Relations",
            soul_path=str(Path(__file__).parent.parent / "souls" / "investor_relations.md"),
            tier="manager",
        )
