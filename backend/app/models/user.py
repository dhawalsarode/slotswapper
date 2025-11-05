"""
User model for authentication and user management.
"""

import uuid
from datetime import datetime
from app.extensions import db, bcrypt


class User(db.Model):
    """User model representing registered users in the system."""
    
    __tablename__ = 'users'
    
    # Primary key using UUID for better security
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User credentials and information
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Timestamps for audit trail
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    events = db.relationship('Event', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, name, email, password):
        """
        Initialize a new user with hashed password.
        
        Args:
            name (str): User's full name
            email (str): User's email address
            password (str): Plain text password (will be hashed)
        """
        self.name = name
        self.email = email
        self.set_password(password)
    
    def set_password(self, password):
        """
        Hash and set the user's password.
        
        Args:
            password (str): Plain text password
        """
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """
        Verify a password against the stored hash.
        
        Args:
            password (str): Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_email=True):
        """
        Convert user object to dictionary representation.
        
        Args:
            include_email (bool): Whether to include email in response
            
        Returns:
            dict: User data as dictionary
        """
        data = {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_email:
            data['email'] = self.email
        return data
    
    def __repr__(self):
        """String representation of the user."""
        return f'<User {self.email}>'
