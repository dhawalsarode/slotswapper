"""
Custom decorators for route protection and validation.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User


def jwt_required_with_user(fn):
    """
    Decorator that validates JWT and injects current user into the route.
    
    Usage:
        @jwt_required_with_user
        def my_route(current_user):
            # current_user is automatically injected
            pass
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Verify the JWT token is present and valid
        verify_jwt_in_request()
        
        # Get the user identity from the token
        current_user_id = get_jwt_identity()
        
        # Fetch the user from database
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Inject current_user into the route function
        return fn(current_user=current_user, *args, **kwargs)
    
    return wrapper
