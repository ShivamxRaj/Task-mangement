# backend/app/routes/users.py
from flask import Blueprint, jsonify, g
from backend.app.controllers.user_controller import UserController
from backend.app.middleware.auth_middleware import token_required

users_bp = Blueprint('users', __name__)
user_controller = UserController()

@users_bp.route('', methods=['GET'])
@token_required
def get_users():
    """
    List all user profiles for assign dropdown
    """
    result, status_code = user_controller.get_users()
    return jsonify(result), status_code

@users_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_user_by_id(user_id):
    """
    Get profile of a specific user
    """
    result, status_code = user_controller.get_user(user_id)
    return jsonify(result), status_code

@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """
    Update profile of the logged-in user
    """
    from flask import request
    current_user_id = g.current_user.get('id')
    data = request.json or {}
    result, status_code = user_controller.update_profile(current_user_id, data)
    return jsonify(result), status_code
