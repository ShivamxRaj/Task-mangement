# backend/app/controllers/task_controller.py
from backend.app.providers.supabase_provider import SupabaseProvider
from backend.app.controllers.email_controller import EmailController

class TaskController:
    def __init__(self):
        self.supabase_provider = SupabaseProvider()
        self.email_controller = EmailController()

    def get_tasks(self, current_user):
        """
        Get all tasks. Since we are in the backend and using the service role key,
        we fetch all tasks. The frontend will filter if needed, or we return all.
        """
        try:
            tasks = self.supabase_provider.get_all_tasks()
            return {"success": True, "data": tasks}, 200
        except Exception as e:
            return {"success": False, "error": f"Failed to retrieve tasks: {str(e)}"}, 500

    def get_task_by_id(self, task_id, current_user):
        try:
            task = self.supabase_provider.get_task_by_id(task_id)
            if not task:
                return {"success": False, "error": "Task not found"}, 404
            return {"success": True, "data": task}, 200
        except Exception as e:
            return {"success": False, "error": f"Failed to retrieve task: {str(e)}"}, 500

    def create_task(self, data, current_user):
        """
        Create task → log notification → send email to assigned user.
        """
        try:
            # Build task data
            task_payload = {
                "title": data.get("title"),
                "description": data.get("description"),
                "status": data.get("status", "todo"),
                "priority": data.get("priority", "medium"),
                "created_by": current_user.get("id"),
                "assigned_to": data.get("assigned_to"),
                "due_date": data.get("due_date")
            }

            created_task = self.supabase_provider.create_task(task_payload)
            if not created_task:
                return {"success": False, "error": "Failed to create task"}, 500

            task_id = created_task.get("id")
            assigned_to = created_task.get("assigned_to")
            email_sent = False

            # Log creation notification
            self.supabase_provider.log_notification({
                "user_id": current_user.get("id"),
                "task_id": task_id,
                "type": "task_created",
                "email_sent": False
            })

            # If assigned to a user, send email and log assignment notification
            if assigned_to:
                assigned_user = self.supabase_provider.get_user_by_id(assigned_to)
                if assigned_user:
                    assigner_name = current_user.get("full_name") or current_user.get("email")
                    email_sent = self.email_controller.notify_task_created(
                        task=created_task,
                        assigned_user=assigned_user,
                        assigner_name=assigner_name
                    )

                    # Log assignment notification
                    self.supabase_provider.log_notification({
                        "user_id": assigned_to,
                        "task_id": task_id,
                        "type": "task_assigned",
                        "email_sent": email_sent
                    })

            # Fetch complete task object with joined profile details to return to the frontend
            full_task = self.supabase_provider.get_task_by_id(task_id)
            return {"success": True, "data": full_task}, 201

        except Exception as e:
            return {"success": False, "error": f"Failed to create task: {str(e)}"}, 500

    def update_task(self, task_id, data, current_user):
        """
        Generic task update logic. Handles task completions and updates.
        """
        try:
            # Check if task exists and capture current status
            existing_task = self.supabase_provider.get_task_by_id(task_id)
            if not existing_task:
                return {"success": False, "error": "Task not found"}, 404

            # Prepare update payloads
            update_payload = {}
            if "title" in data:
                update_payload["title"] = data["title"]
            if "description" in data:
                update_payload["description"] = data["description"]
            if "status" in data:
                update_payload["status"] = data["status"]
            if "priority" in data:
                update_payload["priority"] = data["priority"]
            if "assigned_to" in data:
                update_payload["assigned_to"] = data["assigned_to"]
            if "due_date" in data:
                update_payload["due_date"] = data["due_date"]

            update_payload["updated_at"] = "now()" # Database will update

            updated_task = self.supabase_provider.update_task(task_id, update_payload)
            if not updated_task:
                return {"success": False, "error": "Failed to update task"}, 500

            # If task status changed to 'completed', trigger completion email
            prev_status = existing_task.get("status")
            new_status = updated_task.get("status")

            if new_status == "completed" and prev_status != "completed":
                self._handle_task_completion(updated_task, current_user)
            
            # If assignee changed, send assignment notification
            prev_assignee = existing_task.get("assigned_to")
            new_assignee = updated_task.get("assigned_to")
            if new_assignee and new_assignee != prev_assignee:
                self._handle_task_reassignment(updated_task, current_user)

            full_task = self.supabase_provider.get_task_by_id(task_id)
            return {"success": True, "data": full_task}, 200

        except Exception as e:
            return {"success": False, "error": f"Failed to update task: {str(e)}"}, 500

    def delete_task(self, task_id, current_user):
        try:
            # Check if exists
            existing = self.supabase_provider.get_task_by_id(task_id)
            if not existing:
                return {"success": False, "error": "Task not found"}, 404

            success = self.supabase_provider.delete_task(task_id)
            if success:
                return {"success": True, "data": {"id": task_id}}, 200
            else:
                return {"success": False, "error": "Failed to delete task"}, 500
        except Exception as e:
            return {"success": False, "error": f"Failed to delete task: {str(e)}"}, 500

    def assign_task(self, task_id, user_id, current_user):
        """
        Assign task → send notification email.
        """
        return self.update_task(task_id, {"assigned_to": user_id}, current_user)

    def update_task_status(self, task_id, status, current_user):
        """
        Update status → if completed, send email to creator + assignee.
        """
        return self.update_task(task_id, {"status": status}, current_user)

    def _handle_task_completion(self, task, current_user):
        task_id = task.get("id")
        creator_id = task.get("created_by")
        assignee_id = task.get("assigned_to")

        creator = self.supabase_provider.get_user_by_id(creator_id) if creator_id else None
        assignee = self.supabase_provider.get_user_by_id(assignee_id) if assignee_id else None

        email_sent = self.email_controller.notify_task_completed(
            task=task,
            creator_user=creator,
            assignee_user=assignee
        )

        # Log completion notification for the assignee or user completing it
        user_to_log = assignee_id or creator_id
        if user_to_log:
            self.supabase_provider.log_notification({
                "user_id": user_to_log,
                "task_id": task_id,
                "type": "task_completed",
                "email_sent": email_sent
            })

    def _handle_task_reassignment(self, task, current_user):
        task_id = task.get("id")
        assigned_to = task.get("assigned_to")
        assigned_user = self.supabase_provider.get_user_by_id(assigned_to)
        
        if assigned_user:
            assigner_name = current_user.get("full_name") or current_user.get("email")
            email_sent = self.email_controller.notify_task_created(
                task=task,
                assigned_user=assigned_user,
                assigner_name=assigner_name
            )

            self.supabase_provider.log_notification({
                "user_id": assigned_to,
                "task_id": task_id,
                "type": "task_assigned",
                "email_sent": email_sent
            })
