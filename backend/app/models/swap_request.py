import uuid
import enum
from datetime import datetime
from app.extensions import db

class SwapStatus(enum.Enum):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'

class SwapRequest(db.Model):
    __tablename__ = 'swap_requests'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    requestee_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    requester_slot_id = db.Column(db.String(36), db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    requestee_slot_id = db.Column(db.String(36), db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum(SwapStatus), default=SwapStatus.PENDING, nullable=False, index=True)
    message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    requester = db.relationship('User', foreign_keys=[requester_id], backref='swap_requests_sent')
    requestee = db.relationship('User', foreign_keys=[requestee_id], backref='swap_requests_received')
    requester_slot = db.relationship('Event', foreign_keys=[requester_slot_id])
    requestee_slot = db.relationship('Event', foreign_keys=[requestee_slot_id])

    def __init__(self, requester_id, requestee_id, requester_slot_id, requestee_slot_id, message=None):
        self.requester_id = requester_id
        self.requestee_id = requestee_id
        self.requester_slot_id = requester_slot_id
        self.requestee_slot_id = requestee_slot_id
        self.message = message

    def to_dict(self):
        return {
            'id': self.id,
            'requester_id': self.requester_id,
            'requestee_id': self.requestee_id,
            'requester_slot_id': self.requester_slot_id,
            'requestee_slot_id': self.requestee_slot_id,
            'message': self.message,
            'status': self.status.value if isinstance(self.status, SwapStatus) else self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'requester': self.requester.to_dict(include_email=False) if self.requester else None,
            'requestee': self.requestee.to_dict(include_email=False) if self.requestee else None,
            'requester_slot': self.requester_slot.to_dict() if self.requester_slot else None,
            'requestee_slot': self.requestee_slot.to_dict() if self.requestee_slot else None,
        }
