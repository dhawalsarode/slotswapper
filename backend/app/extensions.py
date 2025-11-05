"""
Flask extensions initialization module.
Extensions are initialized here to avoid circular imports.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO

# Initialize extensions without app context
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")


def init_extensions(app):
    """
    Initialize all Flask extensions with the application instance.
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    migrate.init_app(app, db)
    socketio.init_app(app)
