SCORE_WEIGHTS = {
    "market_demand": 0.20,
    "competition_level": 0.15,
    "profit_potential": 0.20,
    "setup_complexity": 0.10,
    "time_to_revenue": 0.15,
    "scalability": 0.10,
    "risk_level": 0.10,
}

THRESHOLD = 0.90

class BusinessScorer:
    @staticmethod
    async def score(opportunity: dict) -> dict:
        scores = {}
        for param, weight in SCORE_WEIGHTS.items():
            scores[param] = opportunity.get(param, 0.5) * weight
        total = sum(scores.values())
        return {"score": total, "passed": total >= THRESHOLD, "details": scores}

    @staticmethod
    async def score_opportunity(content: str) -> dict:
        """Score a business opportunity using LLM analysis across 7 parameters."""
        try:
            from backend.services.llm.model_selector import ModelSelector
            prompt = f"""
Analyze this business opportunity and score it across 7 parameters (0-100 each):

Content: {content[:1500]}

Return ONLY a JSON object with these fields:
- name: short name of the opportunity
- description: 2-3 sentence description
- market_demand: 0-100
- competition_level: 0-100 (100 = low competition, good for us)
- profit_potential: 0-100
- setup_complexity: 0-100 (100 = easy to set up)
- time_to_revenue: 0-100 (100 = fast revenue)
- scalability: 0-100
- risk_level: 0-100 (100 = low risk)
- market_size: estimated market size
- competition: brief competition analysis
- overall_score: weighted score 0-100

Weights: market_demand=0.20, competition_level=0.15, profit_potential=0.20,
setup_complexity=0.10, time_to_revenue=0.15, scalability=0.10, risk_level=0.10
"""
            result = await ModelSelector.complete(
                agent_id="business_scorer",
                tier="csuite",
                prompt=prompt
            )
            content_result = result.get("content", {})
            if isinstance(content_result, str):
                import json
                try:
                    content_result = json.loads(content_result)
                except:
                    content_result = {"name": "Unknown", "description": content_result, "overall_score": 50}

            return {
                "name": content_result.get("name", "Unknown Opportunity"),
                "description": content_result.get("description", ""),
                "market_size": content_result.get("market_size", "Unknown"),
                "competition": content_result.get("competition", "Unknown"),
                "score": content_result.get("overall_score", 50) / 100,
            }
        except Exception as e:
            print(f"[BUSINESS SCORER] LLM scoring failed: {e}, using fallback")
            return {
                "name": "Unknown Opportunity",
                "description": content[:200],
                "market_size": "Unknown",
                "competition": "Unknown",
                "score": 0.50,
            }
