# backend/app/__init__.py
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend application requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from backend.app.routes.auth import auth_bp
    from backend.app.routes.users import users_bp
    from backend.app.routes.tasks import tasks_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "success": True, 
            "status": "healthy",
            "message": "TaskFlow Backend API is running."
        }), 200

    return app
