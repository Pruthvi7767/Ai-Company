from backend.database import FTS5Client

class SkillsHub:
    def __init__(self):
        self.fts = FTS5Client()

    async def publish(self, skill: dict):
        await self.fts.insert_skill(skill)

    async def search(self, query: str, department: str = None, limit: int = 5) -> list:
        return await self.fts.search(query, limit, department)
