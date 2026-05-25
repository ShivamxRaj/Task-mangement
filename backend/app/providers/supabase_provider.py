# backend/app/providers/supabase_provider.py
import uuid
from datetime import datetime
from supabase import create_client, Client
from backend.config import Config

class SupabaseProvider:
    # In-memory mock data database fallbacks for offline demo purposes
    _mock_profiles = [
        {
            "id": "d9b50e2d-dc99-43ef-b387-052637738f61",
            "email": "intern.developer@example.com",
            "full_name": "Intern Developer",
            "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
        },
        {
            "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            "email": "manager.lead@example.com",
            "full_name": "Product Manager",
            "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80"
        }
    ]

    _mock_tasks = [
        {
            "id": "1",
            "title": "Welcome to TaskFlow! (Demo Task)",
            "description": "This is an in-memory task running on your localhost bypass login. You can edit this task, change its status, or delete it.",
            "status": "in_progress",
            "priority": "high",
            "created_by": "d9b50e2d-dc99-43ef-b387-052637738f61",
            "assigned_to": "d9b50e2d-dc99-43ef-b387-052637738f61",
            "due_date": "2026-05-30",
            "created_at": "2026-05-25T10:00:00Z",
            "updated_at": "2026-05-25T10:00:00Z"
        },
        {
            "id": "2",
            "title": "Review Internship Documentation",
            "description": "Prepare structural files, stubs, and dependencies description for project submission.",
            "status": "todo",
            "priority": "medium",
            "created_by": "d9b50e2d-dc99-43ef-b387-052637738f61",
            "assigned_to": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            "due_date": "2026-06-05",
            "created_at": "2026-05-25T10:00:00Z",
            "updated_at": "2026-05-25T10:00:00Z"
        }
    ]

    def __init__(self):
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_SERVICE_ROLE_KEY
        self.client = None
        
        # Check if URL/key placeholders or empty
        if not url or not key or "your-supabase-project-id" in url:
            print("INFO: Supabase not configured or template URL detected. Using offline mock DB mode.")
            return
            
        try:
            self.client = create_client(url, key)
            print("INFO: Supabase Client initialized successfully.")
        except Exception as e:
            print(f"WARNING: Failed to initialize Supabase Client: {e}. Using offline mock DB mode.")

    def get_all_tasks(self):
        if not self.client:
            # Return in-memory tasks joined with mock profiles
            tasks_copy = []
            for t in self._mock_tasks:
                tc = t.copy()
                tc["created_by_profile"] = next((p for p in self._mock_profiles if p["id"] == t["created_by"]), None)
                tc["assigned_to_profile"] = next((p for p in self._mock_profiles if p["id"] == t["assigned_to"]), None)
                tasks_copy.append(tc)
            return tasks_copy

        response = self.client.table('tasks') \
            .select('*, created_by:profiles!tasks_created_by_fkey(*), assigned_to:profiles!tasks_assigned_to_fkey(*)') \
            .order('created_at', desc=True) \
            .execute()
        return response.data

    def get_task_by_id(self, task_id):
        if not self.client:
            t = next((task for task in self._mock_tasks if task["id"] == task_id), None)
            if t:
                tc = t.copy()
                tc["created_by_profile"] = next((p for p in self._mock_profiles if p["id"] == t["created_by"]), None)
                tc["assigned_to_profile"] = next((p for p in self._mock_profiles if p["id"] == t["assigned_to"]), None)
                return tc
            return None

        response = self.client.table('tasks') \
            .select('*, created_by:profiles!tasks_created_by_fkey(*), assigned_to:profiles!tasks_assigned_to_fkey(*)') \
            .eq('id', task_id) \
            .execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def create_task(self, task_data):
        if not self.client:
            t = task_data.copy()
            t["id"] = str(uuid.uuid4())
            t["created_at"] = datetime.utcnow().isoformat() + "Z"
            t["updated_at"] = datetime.utcnow().isoformat() + "Z"
            self._mock_tasks.append(t)
            
            # Auto register mock profile if creator/assignee does not exist
            creator_id = t["created_by"]
            if not any(p["id"] == creator_id for p in self._mock_profiles):
                self._mock_profiles.append({
                    "id": creator_id,
                    "email": "intern.developer@example.com",
                    "full_name": "Intern Developer",
                    "avatar_url": ""
                })
            
            return self.get_task_by_id(t["id"])

        response = self.client.table('tasks').insert(task_data).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def update_task(self, task_id, update_data):
        if not self.client:
            t = next((task for task in self._mock_tasks if task["id"] == task_id), None)
            if t:
                for k, v in update_data.items():
                    t[k] = v
                t["updated_at"] = datetime.utcnow().isoformat() + "Z"
                return self.get_task_by_id(task_id)
            return None

        response = self.client.table('tasks').update(update_data).eq('id', task_id).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def delete_task(self, task_id):
        if not self.client:
            initial_count = len(self._mock_tasks)
            self._mock_tasks = [task for task in self._mock_tasks if task["id"] != task_id]
            return len(self._mock_tasks) < initial_count

        response = self.client.table('tasks').delete().eq('id', task_id).execute()
        return len(response.data) > 0

    def get_all_users(self):
        if not self.client:
            return self._mock_profiles
        response = self.client.table('profiles').select('*').order('full_name').execute()
        return response.data

    def get_user_by_id(self, user_id):
        if not self.client:
            return next((u for u in self._mock_profiles if u["id"] == user_id), None)
        response = self.client.table('profiles').select('*').eq('id', user_id).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def log_notification(self, notification_data):
        if not self.client:
            return notification_data
        response = self.client.table('notifications').insert(notification_data).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def update_profile(self, user_id, update_data):
        if not self.client:
            p = next((profile for profile in self._mock_profiles if profile["id"] == user_id), None)
            if p:
                for k, v in update_data.items():
                    p[k] = v
                return p
            return None

        response = self.client.table('profiles').update(update_data).eq('id', user_id).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None
