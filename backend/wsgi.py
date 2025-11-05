"""WSGI entry point for production deployments."""

import os
from app import create_app, db
from app.models import User, Event, SwapRequest

# Get environment from .env or default to development
config_name = os.environ.get('FLASK_ENV', 'development')

# Create app instance
app = create_app(config_name)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run()
