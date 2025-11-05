from app.routes.auth import auth_bp
from app.routes.events import events_bp
from app.routes.swaps import swaps_bp


def init_routes(app):
    """Register all blueprints with the Flask app."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(swaps_bp)
