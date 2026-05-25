# backend/app/controllers/email_controller.py
from backend.app.providers.gmail_provider import GmailProvider
from backend.app.utils.email_templates import get_task_assigned_template, get_task_completed_template
from backend.config import Config

class EmailController:
    def __init__(self):
        self.gmail_provider = GmailProvider()
        self.app_url = Config.FRONTEND_URL

    def notify_task_created(self, task, assigned_user, assigner_name):
        """
        Notify assigned user of a new task.
        """
        if not assigned_user or not assigned_user.get('email'):
            return False

        subject = f"New Task Assigned: {task.get('title')}"
        html_body = get_task_assigned_template(
            task_title=task.get('title'),
            task_desc=task.get('description'),
            priority=task.get('priority', 'medium'),
            due_date=task.get('due_date'),
            assigner_name=assigner_name,
            app_url=self.app_url
        )

        return self.gmail_provider.send_email(
            to=assigned_user.get('email'),
            subject=subject,
            html_body=html_body
        )

    def notify_task_completed(self, task, creator_user, assignee_user):
        """
        Notify both the creator and the assignee that the task is completed.
        """
        # Determine who completed the task
        completed_by = "a teammate"
        if assignee_user:
            completed_by = assignee_user.get('full_name') or assignee_user.get('email')
        elif creator_user:
            completed_by = creator_user.get('full_name') or creator_user.get('email')

        subject = f"Task Completed: {task.get('title')}"
        html_body = get_task_completed_template(
            task_title=task.get('title'),
            completed_by_name=completed_by,
            app_url=self.app_url
        )

        emails_to_notify = []
        if creator_user and creator_user.get('email'):
            emails_to_notify.append(creator_user.get('email'))
        if assignee_user and assignee_user.get('email') and assignee_user.get('email') not in emails_to_notify:
            emails_to_notify.append(assignee_user.get('email'))

        success = True
        for email in emails_to_notify:
            res = self.gmail_provider.send_email(to=email, subject=subject, html_body=html_body)
            if not res:
                success = False

        return success
