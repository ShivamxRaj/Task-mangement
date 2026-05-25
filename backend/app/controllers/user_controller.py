# backend/app/controllers/user_controller.py
from backend.app.providers.supabase_provider import SupabaseProvider

class UserController:
    def __init__(self):
        self.supabase_provider = SupabaseProvider()

    def get_users(self):
        """
        Retrieves all users (profiles).
        """
        try:
            users = self.supabase_provider.get_all_users()
            return {"success": True, "data": users}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

    def get_user(self, user_id):
        """
        Retrieves a single user profile.
        """
        try:
            user = self.supabase_provider.get_user_by_id(user_id)
            if not user:
                return {"success": False, "error": "User not found"}, 404
            return {"success": True, "data": user}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500

    def update_profile(self, user_id, data):
        try:
            update_payload = {}
            if "full_name" in data:
                update_payload["full_name"] = data["full_name"]
            if "avatar_url" in data:
                update_payload["avatar_url"] = data["avatar_url"]

            updated_profile = self.supabase_provider.update_profile(user_id, update_payload)
            if not updated_profile:
                return {"success": False, "error": "Failed to update profile"}, 500
            return {"success": True, "data": updated_profile}, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500
