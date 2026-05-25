# backend/app/utils/validators.py

def validate_task_payload(data):
    """
    Validates the task creation/update payload.
    Returns (is_valid, error_message).
    """
    if not data:
        return False, "Payload is empty"

    title = data.get('title')
    if not title or not isinstance(title, str) or not title.strip():
        return False, "Title is required and must be a non-empty string"

    status = data.get('status')
    if status and status not in ['todo', 'in_progress', 'completed']:
        return False, "Status must be one of: 'todo', 'in_progress', 'completed'"

    priority = data.get('priority')
    if priority and priority not in ['low', 'medium', 'high']:
        return False, "Priority must be one of: 'low', 'medium', 'high'"

    return True, None

def validate_assign_payload(data):
    """
    Validates task assignment payload.
    """
    if not data:
        return False, "Payload is empty"
        
    assigned_to = data.get('assigned_to')
    if not assigned_to:
        return False, "assigned_to field is required"
        
    return True, None
