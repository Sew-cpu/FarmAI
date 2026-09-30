"""
Lớp cơ sở BaseAgent (agents/base_agent.py)
Theo đặc tả Bài 6 & 7
"""
from abc import ABC, abstractmethod
from typing import Any
from models.agent_message import AgentMessage

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def process(self, message: AgentMessage) -> Any:
        pass
