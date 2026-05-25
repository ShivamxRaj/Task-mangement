# backend/app/models/user.py

class UserProfile:
    def __init__(self, id=None, email="", full_name="", avatar_url="", created_at=None):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.avatar_url = avatar_url
        self.created_at = created_at

    @staticmethod
    def from_dict(data):
        if not data:
            return None
        return UserProfile(
            id=data.get('id'),
            email=data.get('email', ''),
            full_name=data.get('full_name', ''),
            avatar_url=data.get('avatar_url', ''),
            created_at=data.get('created_at')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at
        }
