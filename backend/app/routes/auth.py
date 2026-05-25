# backend/app/routes/auth.py
from flask import Blueprint, jsonify, g
from backend.app.middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/verify', methods=['POST'])
@token_required
def verify_token_route():
    """
    Verify auth token and return user profile details.
    """
    return jsonify({
        "success": True, 
        "data": g.current_user
    }), 200
