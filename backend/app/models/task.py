# backend/app/models/task.py
from datetime import datetime

class Task:
    def __init__(self, id=None, title="", description="", status="todo", priority="medium", 
                 created_by=None, assigned_to=None, due_date=None, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.status = status # 'todo', 'in_progress', 'completed'
        self.priority = priority # 'low', 'medium', 'high'
        self.created_by = created_by # UUID of profile
        self.assigned_to = assigned_to # UUID of profile
        self.due_date = due_date
        self.created_at = created_at
        self.updated_at = updated_at

    @staticmethod
    def from_dict(data):
        if not data:
            return None
        return Task(
            id=data.get('id'),
            title=data.get('title', ''),
            description=data.get('description', ''),
            status=data.get('status', 'todo'),
            priority=data.get('priority', 'medium'),
            created_by=data.get('created_by'),
            assigned_to=data.get('assigned_to'),
            due_date=data.get('due_date'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'created_by': self.created_by,
            'assigned_to': self.assigned_to,
            'due_date': self.due_date,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @property
    def is_overdue(self):
        if not self.due_date:
            return False
        # Remove timezone offset or parse dynamically
        try:
            # Assumes ISO string with timezone or z
            due = datetime.fromisoformat(self.due_date.replace('Z', '+00:00'))
            now = datetime.now(due.tzinfo)
            return due < now and self.status != 'completed'
        except Exception:
            return False
