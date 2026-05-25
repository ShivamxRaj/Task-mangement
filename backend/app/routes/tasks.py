# backend/app/routes/tasks.py
from flask import Blueprint, request, jsonify, g
from backend.app.controllers.task_controller import TaskController
from backend.app.middleware.auth_middleware import token_required
from backend.app.utils.validators import validate_task_payload, validate_assign_payload

tasks_bp = Blueprint('tasks', __name__)
task_controller = TaskController()

@tasks_bp.route('', methods=['GET'])
@token_required
def get_all_tasks():
    """
    Get all tasks for authenticated user dashboard.
    """
    result, status_code = task_controller.get_tasks(g.current_user)
    return jsonify(result), status_code

@tasks_bp.route('/<task_id>', methods=['GET'])
@token_required
def get_task_by_id(task_id):
    """
    Get a single task by ID.
    """
    result, status_code = task_controller.get_task_by_id(task_id, g.current_user)
    return jsonify(result), status_code

@tasks_bp.route('', methods=['POST'])
@token_required
def create_new_task():
    """
    Create a new task.
    """
    data = request.json or {}
    
    # Validate payload
    is_valid, err_msg = validate_task_payload(data)
    if not is_valid:
        return jsonify({"success": False, "error": err_msg}), 400

    result, status_code = task_controller.create_task(data, g.current_user)
    return jsonify(result), status_code

@tasks_bp.route('/<task_id>', methods=['PUT'])
@token_required
def update_task_by_id(task_id):
    """
    Update details of a task (title, desc, status, priority, due_date, assignee).
    """
    data = request.json or {}
    result, status_code = task_controller.update_task(task_id, data, g.current_user)
    return jsonify(result), status_code

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@token_required
def delete_task_by_id(task_id):
    """
    Delete a task.
    """
    result, status_code = task_controller.delete_task(task_id, g.current_user)
    return jsonify(result), status_code

@tasks_bp.route('/<task_id>/assign', methods=['PUT'])
@token_required
def assign_task_to_user(task_id):
    """
    Assign or reassign a task to a user.
    """
    data = request.json or {}
    is_valid, err_msg = validate_assign_payload(data)
    if not is_valid:
        return jsonify({"success": False, "error": err_msg}), 400

    assigned_to = data.get('assigned_to')
    result, status_code = task_controller.assign_task(task_id, assigned_to, g.current_user)
    return jsonify(result), status_code

@tasks_bp.route('/<task_id>/complete', methods=['PUT'])
@token_required
def mark_task_as_complete(task_id):
    """
    Mark a task status as completed.
    """
    result, status_code = task_controller.update_task_status(task_id, "completed", g.current_user)
    return jsonify(result), status_code
