"""
Events routes for calendar slot management.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.extensions import db
from app.models import User, Event, EventStatus
from app.utils.decorators import jwt_required_with_user

# Create blueprint for events routes
events_bp = Blueprint('events', __name__, url_prefix='/api/events')

@events_bp.route('', methods=['POST'])
@jwt_required_with_user
def create_event(current_user):
    """
    Create a new calendar event.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        title = data.get('title', '').strip()
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')
        status = data.get('status', 'BUSY')

        if not title or len(title) < 1:
            return jsonify({'message': 'Title is required'}), 400
        if not start_time_str or not end_time_str:
            return jsonify({'message': 'Start and end times are required'}), 400

        try:
            start_time = datetime.fromisoformat(start_time_str)
            end_time = datetime.fromisoformat(end_time_str)
        except ValueError:
            return jsonify({'message': 'Invalid datetime format. Use ISO format: YYYY-MM-DDTHH:MM:SS'}), 400
        if start_time >= end_time:
            return jsonify({'message': 'End time must be after start time'}), 400

        try:
            event_status = EventStatus[status]
        except KeyError:
            return jsonify({'message': f'Invalid status. Must be one of: {", ".join([e.value for e in EventStatus])}'}), 400

        new_event = Event(
            user_id=current_user.id,
            title=title,
            start_time=start_time,
            end_time=end_time,
            status=event_status
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            'message': 'Event created successfully',
            'event': new_event.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Event creation failed: {str(e)}'}), 500

@events_bp.route('', methods=['GET'])
@jwt_required_with_user
def get_events(current_user):
    """
    Get all events for all users (for swap UI).
    Returns:
        200: List of all events + current user's id
    """
    try:
        events = Event.query.order_by(Event.start_time.desc()).all()
        return jsonify({
            'events': [event.to_dict() for event in events],
            'user_id': current_user.id
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch events: {str(e)}'}), 500

@events_bp.route('/<event_id>', methods=['GET'])
@jwt_required_with_user
def get_event(current_user, event_id):
    """
    Get a specific event by ID.
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'message': 'Event not found'}), 404
        # Optional: restrict or include owner info as needed
        return jsonify({
            'event': event.to_dict(include_owner=True)
        }), 200

    except Exception as e:
        return jsonify({'message': f'Failed to fetch event: {str(e)}'}), 500

@events_bp.route('/<event_id>', methods=['PUT'])
@jwt_required_with_user
def update_event(current_user, event_id):
    """
    Update an event.
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'message': 'Event not found'}), 404
        if event.user_id != current_user.id:
            return jsonify({'message': 'You do not have permission to update this event'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        if 'title' in data:
            title = data['title'].strip()
            if not title:
                return jsonify({'message': 'Title cannot be empty'}), 400
            event.title = title
        if 'start_time' in data:
            try:
                event.start_time = datetime.fromisoformat(data['start_time'])
            except ValueError:
                return jsonify({'message': 'Invalid start_time format'}), 400
        if 'end_time' in data:
            try:
                event.end_time = datetime.fromisoformat(data['end_time'])
            except ValueError:
                return jsonify({'message': 'Invalid end_time format'}), 400
        if 'status' in data:
            try:
                event.status = EventStatus[data['status']]
            except KeyError:
                return jsonify({'message': f'Invalid status: {data["status"]}'}), 400
        if event.start_time >= event.end_time:
            return jsonify({'message': 'End time must be after start time'}), 400

        db.session.commit()

        return jsonify({
            'message': 'Event updated successfully',
            'event': event.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Event update failed: {str(e)}'}), 500

@events_bp.route('/<event_id>', methods=['DELETE'])
@jwt_required_with_user
def delete_event(current_user, event_id):
    """
    Delete an event.
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({'message': 'Event not found'}), 404
        if event.user_id != current_user.id:
            return jsonify({'message': 'You do not have permission to delete this event'}), 403

        db.session.delete(event)
        db.session.commit()

        return jsonify({
            'message': 'Event deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Event deletion failed: {str(e)}'}), 500
