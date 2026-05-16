from .strategy import StrategyAgent
from .business_dev import BusinessDevAgent
from .project_mgmt import ProjectMgmtAgent
from .board import BoardAgent
from .engineering import EngineeringAgent
from .devops import DevopsAgent
from .qa import QaAgent
from .data_analytics import DataAnalyticsAgent
from .api_mgmt import ApiMgmtAgent
from .finance import FinanceAgent
from .accounting import AccountingAgent
from .audit import AuditAgent
from .investor_relations import InvestorRelationsAgent
from .pricing import PricingAgent
from .marketing import MarketingAgent
from .sales import SalesAgent
from .brand import BrandAgent
from .pr import PrAgent
from .customer_success import CustomerSuccessAgent
from .catalog import CatalogAgent
from .operations import OperationsAgent
from .hr import HrAgent
from .admin import AdminAgent
from .logistics import LogisticsAgent
from .warehouse import WarehouseAgent
from .procurement import ProcurementAgent
from .fleet import FleetAgent
from .returns import ReturnsAgent
from .last_mile import LastMileAgent
from .security import SecurityAgent
from .legal import LegalAgent
from .compliance import ComplianceAgent
from .risk import RiskAgent
from .ethics import EthicsAgent
from .cybersecurity import CybersecurityAgent
from .import_export import ImportExportAgent
from .analytics import AnalyticsAgent
from .research import ResearchAgent
from .content import ContentAgent
from .training import TrainingAgent
from .product import ProductAgent

__all__ = [
    'StrategyAgent', 'BusinessDevAgent', 'ProjectMgmtAgent', 'BoardAgent',
    'EngineeringAgent', 'DevopsAgent', 'QaAgent', 'DataAnalyticsAgent', 'ApiMgmtAgent',
    'FinanceAgent', 'AccountingAgent', 'AuditAgent', 'InvestorRelationsAgent', 'PricingAgent',
    'MarketingAgent', 'SalesAgent', 'BrandAgent', 'PrAgent', 'CustomerSuccessAgent', 'CatalogAgent',
    'OperationsAgent', 'HrAgent', 'AdminAgent', 'LogisticsAgent', 'WarehouseAgent',
    'ProcurementAgent', 'FleetAgent', 'ReturnsAgent', 'LastMileAgent',
    'SecurityAgent', 'LegalAgent', 'ComplianceAgent', 'RiskAgent', 'EthicsAgent',
    'CybersecurityAgent', 'ImportExportAgent', 'AnalyticsAgent', 'ResearchAgent',
    'ContentAgent', 'TrainingAgent', 'ProductAgent',
]

DEPARTMENT_MAP = {
    'strategy': StrategyAgent,
    'business_dev': BusinessDevAgent,
    'project_mgmt': ProjectMgmtAgent,
    'board': BoardAgent,
    'engineering': EngineeringAgent,
    'devops': DevopsAgent,
    'qa': QaAgent,
    'data_analytics': DataAnalyticsAgent,
    'api_mgmt': ApiMgmtAgent,
    'finance': FinanceAgent,
    'accounting': AccountingAgent,
    'audit': AuditAgent,
    'investor_relations': InvestorRelationsAgent,
    'pricing': PricingAgent,
    'marketing': MarketingAgent,
    'sales': SalesAgent,
    'brand': BrandAgent,
    'pr': PrAgent,
    'customer_success': CustomerSuccessAgent,
    'catalog': CatalogAgent,
    'operations': OperationsAgent,
    'hr': HrAgent,
    'admin': AdminAgent,
    'logistics': LogisticsAgent,
    'warehouse': WarehouseAgent,
    'procurement': ProcurementAgent,
    'fleet': FleetAgent,
    'returns': ReturnsAgent,
    'last_mile': LastMileAgent,
    'security': SecurityAgent,
    'legal': LegalAgent,
    'compliance': ComplianceAgent,
    'risk': RiskAgent,
    'ethics': EthicsAgent,
    'cybersecurity': CybersecurityAgent,
    'import_export': ImportExportAgent,
    'analytics': AnalyticsAgent,
    'research': ResearchAgent,
    'content': ContentAgent,
    'training': TrainingAgent,
    'product': ProductAgent,
}

def get_agent_for_department(department: str):
    """Get the agent class for a given department name."""
    return DEPARTMENT_MAP.get(department.lower().replace("-", "_").replace(" ", "_"))
