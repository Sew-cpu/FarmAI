"""
Quản Lý Số Lần Thử Lại (retry_manager.py)
Theo đặc tả Bài 6 & 7: Bước 24 & 25
"""

class RetryManager:
    def __init__(self, max_retries=2):
        self.max_retries = max_retries

    def should_retry(self, critic_msg, count):
        decision = critic_msg.payload.get("decision") if hasattr(critic_msg, "payload") else critic_msg.get("decision")
        if decision == "APPROVE":
            return False
        if count >= self.max_retries:
            return False
        return True

    def get_retry_count(self, count):
        return count + 1
