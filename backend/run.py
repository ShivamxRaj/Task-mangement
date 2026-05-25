# backend/run.py
import os
from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    # Default to port 5000 for TaskFlow API service
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    app.run(host='0.0.0.0', port=port, debug=debug)
