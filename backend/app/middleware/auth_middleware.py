# backend/app/middleware/auth_middleware.py
from functools import wraps
from flask import request, jsonify, g
from backend.app.providers.auth_provider import AuthProvider

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "success": False, 
                "error": "Authentication token is missing. Please log in."
            }), 401

        try:
            current_user = AuthProvider.verify_token(token)
            if not current_user:
                return jsonify({
                    "success": False, 
                    "error": "Invalid or expired token. Access denied."
                }), 401
            
            # Save user to flask request context local variable `g`
            g.current_user = current_user
        except Exception as e:
            return jsonify({
                "success": False, 
                "error": f"Authentication failed: {str(e)}"
            }), 401

        return f(*args, **kwargs)
    return decorated
