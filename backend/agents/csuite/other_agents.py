from backend.agents.base_agent import BaseAgent
from pathlib import Path

class CTOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="cto", department="C-Suite", soul_path=str(Path(__file__).parent.parent / "souls" / "cto.md"), tier="csuite")

class CFOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="cfo", department="C-Suite", soul_path=str(Path(__file__).parent.parent / "souls" / "cfo.md"), tier="csuite")

class CMOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="cmo", department="C-Suite", soul_path=str(Path(__file__).parent.parent / "souls" / "cmo.md"), tier="csuite")

class COOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="coo", department="C-Suite", soul_path=str(Path(__file__).parent.parent / "souls" / "coo.md"), tier="csuite")

class CSOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="cso", department="C-Suite", soul_path=str(Path(__file__).parent.parent / "souls" / "cso.md"), tier="csuite")

class CAOAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_id="cao", department="C-Suite", soul_path=str(Path(__file__).parent.parent / "souls" / "cao.md"), tier="csuite")
