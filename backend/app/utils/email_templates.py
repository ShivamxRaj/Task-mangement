# backend/app/utils/email_templates.py

def get_task_assigned_template(task_title: str, task_desc: str, priority: str, due_date: str, assigner_name: str, app_url: str) -> str:
    """
    Returns HTML template for task assignment notification.
    """
    priority_colors = {
        'high': '#EF4444',
        'medium': '#F59E0B',
        'low': '#10B981'
    }
    color = priority_colors.get(priority.lower(), '#3B82F6')
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Task Assigned</title>
        <style>
            body {{ font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ background-color: #0F172A; padding: 32px 24px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }}
            .content {{ padding: 32px 24px; }}
            .greeting {{ font-size: 16px; line-height: 24px; font-weight: 600; color: #0F172A; margin-top: 0; }}
            .task-card {{ background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }}
            .task-title {{ font-size: 18px; font-weight: 700; margin: 0 0 8px 0; color: #0F172A; }}
            .task-desc {{ font-size: 14px; line-height: 20px; color: #475569; margin: 0 0 16px 0; }}
            .badge-group {{ display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }}
            .badge {{ display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; text-transform: uppercase; }}
            .badge-priority {{ background-color: {color}20; color: {color}; }}
            .due-date {{ font-size: 13px; color: #64748B; }}
            .btn {{ display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 8px; text-align: center; margin-top: 16px; }}
            .footer {{ background: #F1F5F9; text-align: center; padding: 24px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>TaskFlow Notification</h1>
            </div>
            <div class="content">
                <p class="greeting">Hi there,</p>
                <p><strong>{assigner_name}</strong> has assigned a new task to you.</p>
                
                <div class="task-card">
                    <div class="task-title">{task_title}</div>
                    <div class="task-desc">{task_desc or "No description provided."}</div>
                    <div class="badge-group">
                        <span class="badge badge-priority">{priority.upper()} Priority</span>
                    </div>
                    {f'<div class="due-date"><strong>Due Date:</strong> {due_date}</div>' if due_date else ''}
                </div>
                
                <a href="{app_url}" class="btn" target="_blank">View Task in TaskFlow</a>
            </div>
            <div class="footer">
                This is an automated notification from TaskFlow. Please do not reply directly.
            </div>
        </div>
    </body>
    </html>
    """

def get_task_completed_template(task_title: str, completed_by_name: str, app_url: str) -> str:
    """
    Returns HTML template for task completion notification.
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Completed</title>
        <style>
            body {{ font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ background-color: #0F172A; padding: 32px 24px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }}
            .content {{ padding: 32px 24px; }}
            .greeting {{ font-size: 16px; line-height: 24px; font-weight: 600; color: #0F172A; margin-top: 0; }}
            .success-card {{ background: #ECFDF5; border-left: 4px solid #10B981; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }}
            .task-title {{ font-size: 16px; font-weight: 700; margin: 0; color: #065F46; }}
            .btn {{ display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 8px; text-align: center; margin-top: 16px; }}
            .footer {{ background: #F1F5F9; text-align: center; padding: 24px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>TaskFlow Notification</h1>
            </div>
            <div class="content">
                <p class="greeting">Hi there,</p>
                <p>Great news! The task <strong>"{task_title}"</strong> has been completed by <strong>{completed_by_name}</strong>.</p>
                
                <div class="success-card">
                    <div class="task-title">✓ Task Completed: {task_title}</div>
                </div>
                
                <a href="{app_url}" class="btn" target="_blank">Go to Dashboard</a>
            </div>
            <div class="footer">
                This is an automated notification from TaskFlow. Please do not reply directly.
            </div>
        </div>
    </body>
    </html>
    """
