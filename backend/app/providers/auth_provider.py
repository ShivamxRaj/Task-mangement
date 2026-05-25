# backend/app/providers/auth_provider.py
import requests
from backend.config import Config

class AuthProvider:
    @staticmethod
    def verify_token(token: str) -> dict:
        """
        Verify Supabase JWT token by calling Supabase Auth server.
        Returns user data dictionary if valid, otherwise raises exception or returns None.
        Supports fallback 'mock-access-token' for offline/local demonstration.
        """
        if not token:
            raise ValueError("Token is required")

        # Mock token bypass check
        if token == 'mock-access-token':
            return {
                "id": "d9b50e2d-dc99-43ef-b387-052637738f61",
                "email": "intern.developer@example.com",
                "full_name": "Intern Developer",
                "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
            }

        supabase_url = Config.SUPABASE_URL
        service_role_key = Config.SUPABASE_SERVICE_ROLE_KEY

        if not supabase_url or not service_role_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured.")

        # Request user details from Supabase Auth Server using the token
        url = f"{supabase_url}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": service_role_key
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                user_data = response.json()
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "full_name": user_data.get("user_metadata", {}).get("full_name") or user_data.get("user_metadata", {}).get("name", ""),
                    "avatar_url": user_data.get("user_metadata", {}).get("avatar_url") or user_data.get("user_metadata", {}).get("picture", "")
                }
            else:
                return None
        except requests.exceptions.RequestException as e:
            print(f"Error calling Supabase Auth API: {e}")
            return None
