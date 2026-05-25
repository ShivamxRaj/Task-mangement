# backend/app/models/notification.py

class NotificationLog:
    def __init__(self, id=None, user_id=None, task_id=None, type="", sent_at=None, email_sent=False):
        self.id = id
        self.user_id = user_id
        self.task_id = task_id
        self.type = type # 'task_created', 'task_assigned', 'task_completed'
        self.sent_at = sent_at
        self.email_sent = email_sent

    @staticmethod
    def from_dict(data):
        if not data:
            return None
        return NotificationLog(
            id=data.get('id'),
            user_id=data.get('user_id'),
            task_id=data.get('task_id'),
            type=data.get('type', ''),
            sent_at=data.get('sent_at'),
            email_sent=data.get('email_sent', False)
        )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task_id': self.task_id,
            'type': self.type,
            'sent_at': self.sent_at,
            'email_sent': self.email_sent
        }
