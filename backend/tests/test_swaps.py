"""
Comprehensive test suite for Swap API endpoints.
Tests cover creation, acceptance, rejection, and edge cases.
"""

import pytest
import json
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Event, SwapRequest, SwapStatus, EventStatus


@pytest.fixture
def app():
    """Create app instance with testing configuration."""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def app_context(app):
    """Push app context for database operations."""
    with app.app_context():
        yield app


@pytest.fixture
def create_users(app_context):
    """Create test users."""
    user1 = User(email='user1@test.com', name='User One')
    user1.set_password('password123')
    user2 = User(email='user2@test.com', name='User Two')
    user2.set_password('password123')
    
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()
    
    return user1, user2


@pytest.fixture
def create_events(app_context, create_users):
    """Create test events."""
    user1, user2 = create_users
    
    now = datetime.utcnow()
    event1 = Event(
        user_id=user1.id,
        title='User1 Meeting',
        start_time=now + timedelta(hours=1),
        end_time=now + timedelta(hours=2),
        status=EventStatus.SWAPPABLE
    )
    event2 = Event(
        user_id=user2.id,
        title='User2 Meeting',
        start_time=now + timedelta(hours=3),
        end_time=now + timedelta(hours=4),
        status=EventStatus.SWAPPABLE
    )
    event3 = Event(
        user_id=user2.id,
        title='User2 Busy Event',
        start_time=now + timedelta(hours=5),
        end_time=now + timedelta(hours=6),
        status=EventStatus.BUSY
    )
    
    db.session.add(event1)
    db.session.add(event2)
    db.session.add(event3)
    db.session.commit()
    
    return event1, event2, event3


@pytest.fixture
def auth_headers(app_context, create_users):
    """Generate JWT auth headers for testing."""
    from flask_jwt_extended import create_access_token
    user1, user2 = create_users
    
    token1 = create_access_token(identity=user1.id)
    token2 = create_access_token(identity=user2.id)
    
    return {
        'user1': {'Authorization': f'Bearer {token1}'},
        'user2': {'Authorization': f'Bearer {token2}'}
    }


class TestCreateSwapRequest:
    """Tests for creating swap requests."""
    
    def test_create_swap_request_success(self, client, create_events, auth_headers, create_users):
        """Test successful swap request creation."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        payload = {
            'requestee_id': user2.id,
            'my_event_id': event1.id,
            'requestee_event_id': event2.id,
            'message': 'Would love to swap slots!'
        }
        
        response = client.post(
            '/api/requests/swap',
            data=json.dumps(payload),
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 201
        assert response.json['success'] is True
        assert 'swap' in response.json
    
    def test_create_swap_missing_fields(self, client, auth_headers, create_users):
        """Test swap creation fails with missing fields."""
        user1, user2 = create_users
        
        payload = {
            'requestee_id': user2.id,
            # Missing my_event_id and requestee_event_id
        }
        
        response = client.post(
            '/api/requests/swap',
            data=json.dumps(payload),
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 400
        assert 'Required fields missing' in response.json['message']
    
    def test_create_swap_self_swap_fails(self, client, create_events, auth_headers, create_users):
        """Test user cannot swap with themselves."""
        user1, user2 = create_users
        event1, _, _ = create_events
        
        payload = {
            'requestee_id': user1.id,  # Same as requester
            'my_event_id': event1.id,
            'requestee_event_id': event1.id
        }
        
        response = client.post(
            '/api/requests/swap',
            data=json.dumps(payload),
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 400
        assert 'Cannot swap with yourself' in response.json['message']
    
    def test_create_swap_nonexistent_requestee(self, client, create_events, auth_headers, create_users):
        """Test swap creation fails with invalid requestee."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        payload = {
            'requestee_id': 'nonexistent-user-id',
            'my_event_id': event1.id,
            'requestee_event_id': event2.id
        }
        
        response = client.post(
            '/api/requests/swap',
            data=json.dumps(payload),
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 404
        assert 'Requested user not found' in response.json['message']
    
    def test_create_swap_not_own_event(self, client, create_events, auth_headers, create_users):
        """Test swap creation fails when using unowned event."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        payload = {
            'requestee_id': user2.id,
            'my_event_id': event2.id,  # This event belongs to user2, not user1
            'requestee_event_id': event1.id
        }
        
        response = client.post(
            '/api/requests/swap',
            data=json.dumps(payload),
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 404
        assert 'Your event not found or not owned' in response.json['message']
    
    def test_create_swap_busy_event_fails(self, client, create_events, auth_headers, create_users):
        """Test swap creation fails if event is BUSY."""
        user1, user2 = create_users
        event1, _, event3 = create_events
        
        payload = {
            'requestee_id': user2.id,
            'my_event_id': event1.id,
            'requestee_event_id': event3.id  # This event is BUSY
        }
        
        response = client.post(
            '/api/requests/swap',
            data=json.dumps(payload),
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 400
        assert 'Both events must be in SWAPPABLE status' in response.json['message']


class TestAcceptSwapRequest:
    """Tests for accepting swap requests."""
    
    def test_accept_swap_success(self, client, app_context, create_events, auth_headers, create_users):
        """Test successful swap acceptance and event ownership transfer."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        # Create swap request
        swap = SwapRequest(
            requester_id=user1.id,
            requestee_id=user2.id,
            requester_slot_id=event1.id,
            requestee_slot_id=event2.id,
            status=SwapStatus.PENDING
        )
        db.session.add(swap)
        db.session.commit()
        
        # Accept swap
        response = client.post(
            f'/api/requests/{swap.id}/accept',
            headers={**auth_headers['user2'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 200
        assert 'Swap accepted successfully' in response.json['message']
        
        # Verify ownership swapped
        db.session.refresh(event1)
        db.session.refresh(event2)
        assert event1.user_id == user2.id
        assert event2.user_id == user1.id
    
    def test_accept_swap_not_requestee_fails(self, client, app_context, create_events, auth_headers, create_users):
        """Test only requestee can accept swap."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        swap = SwapRequest(
            requester_id=user1.id,
            requestee_id=user2.id,
            requester_slot_id=event1.id,
            requestee_slot_id=event2.id,
            status=SwapStatus.PENDING
        )
        db.session.add(swap)
        db.session.commit()
        
        # Try to accept as non-requestee (user1)
        response = client.post(
            f'/api/requests/{swap.id}/accept',
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 403
        assert 'You do not have permission' in response.json['message']
    
    def test_accept_nonexistent_swap_fails(self, client, auth_headers):
        """Test accepting nonexistent swap fails."""
        response = client.post(
            '/api/requests/nonexistent-id/accept',
            headers={**auth_headers['user2'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 404
        assert 'Swap request not found' in response.json['message']


class TestRejectSwapRequest:
    """Tests for rejecting swap requests."""
    
    def test_reject_swap_success(self, client, app_context, create_events, auth_headers, create_users):
        """Test successful swap rejection."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        swap = SwapRequest(
            requester_id=user1.id,
            requestee_id=user2.id,
            requester_slot_id=event1.id,
            requestee_slot_id=event2.id,
            status=SwapStatus.PENDING
        )
        db.session.add(swap)
        db.session.commit()
        
        response = client.post(
            f'/api/requests/{swap.id}/reject',
            headers={**auth_headers['user2'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 200
        assert 'Swap rejected successfully' in response.json['message']
        
        # Verify status changed
        db.session.refresh(swap)
        assert swap.status == SwapStatus.REJECTED
    
    def test_reject_swap_not_requestee_fails(self, client, app_context, create_events, auth_headers, create_users):
        """Test only requestee can reject swap."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        swap = SwapRequest(
            requester_id=user1.id,
            requestee_id=user2.id,
            requester_slot_id=event1.id,
            requestee_slot_id=event2.id,
            status=SwapStatus.PENDING
        )
        db.session.add(swap)
        db.session.commit()
        
        response = client.post(
            f'/api/requests/{swap.id}/reject',
            headers={**auth_headers['user1'], 'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 403
        assert 'You do not have permission' in response.json['message']


class TestGetPendingSwaps:
    """Tests for retrieving pending swaps."""
    
    def test_get_pending_swaps_success(self, client, app_context, create_events, auth_headers, create_users):
        """Test retrieving pending swaps for a user."""
        user1, user2 = create_users
        event1, event2, _ = create_events
        
        # Create multiple swaps
        swap1 = SwapRequest(
            requester_id=user1.id,
            requestee_id=user2.id,
            requester_slot_id=event1.id,
            requestee_slot_id=event2.id,
            status=SwapStatus.PENDING
        )
        swap2 = SwapRequest(
            requester_id=user1.id,
            requestee_id=user2.id,
            requester_slot_id=event1.id,
            requestee_slot_id=event2.id,
            status=SwapStatus.ACCEPTED
        )
        db.session.add(swap1)
        db.session.add(swap2)
        db.session.commit()
        
        response = client.get(
            '/api/requests/pending',
            headers=auth_headers['user2']
        )
        
        assert response.status_code == 200
        assert len(response.json['pending_swaps']) == 1  # Only PENDING swaps
        assert response.json['pending_swaps'][0]['status'] == 'PENDING'
