"""
Event model for calendar slots and scheduling.
"""

import uuid
from datetime import datetime
from enum import Enum
from app.extensions import db

class EventStatus(str, Enum):
    """Enumeration for event status types."""
    BUSY = 'BUSY'
    SWAPPABLE = 'SWAPPABLE'
    SWAP_PENDING = 'SWAP_PENDING'

class Event(db.Model):
    """Event model representing calendar time slots."""
    
    __tablename__ = 'events'
    
    # Primary key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key to user
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Event details
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum(EventStatus), default=EventStatus.SWAPPABLE, nullable=False, index=True)  # <-- FIXED
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __init__(self, user_id, title, start_time, end_time, status=EventStatus.SWAPPABLE):
        """
        Initialize a new event.
        
        Args:
            user_id (str): UUID of the event owner
            title (str): Event title
            start_time (datetime): Event start time
            end_time (datetime): Event end time
            status (EventStatus): Event status (default: SWAPPABLE)
        """
        self.user_id = user_id
        self.title = title
        self.start_time = start_time
        self.end_time = end_time
        self.status = status
    
    def to_dict(self, include_owner=False):
        """
        Convert event to dictionary representation.
        
        Args:
            include_owner (bool): Whether to include owner information
            
        Returns:
            dict: Event data as dictionary
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status.value if isinstance(self.status, EventStatus) else self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_owner and self.owner:
            data['owner'] = {
                'id': self.owner.id,
                'name': self.owner.name,
                'email': self.owner.email
            }
        
        return data
    
    @property
    def duration_minutes(self):
        """Calculate event duration in minutes."""
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time).total_seconds() / 60)
        return 0
    
    def __repr__(self):
        """String representation of the event."""
        return f'<Event {self.title} ({self.status.value})>'
