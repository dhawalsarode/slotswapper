from flask import Flask
from app.extensions import db, jwt, bcrypt, cors, migrate, socketio
from app.routes.auth import auth_bp
from app.routes.events import events_bp
from app.routes.swaps import swaps_bp
from app.config import config

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    migrate.init_app(app, db)
    socketio.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(swaps_bp)

    # Root endpoint for health check / debug
    @app.route('/')
    def index():
        return {'message': 'SlotSwapper API is running!'}

    return app

from app.extensions import db
