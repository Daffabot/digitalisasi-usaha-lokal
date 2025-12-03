"""
Routes Package
"""
from routes.ocr import ocr_bp
from routes.health import health_bp


def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(ocr_bp)
    app.register_blueprint(health_bp)
