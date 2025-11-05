from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import User, Event, SwapRequest, SwapStatus, EventStatus
from app.utils.decorators import jwt_required_with_user

swaps_bp = Blueprint('swaps', __name__, url_prefix='/api/requests')

@swaps_bp.route('/swap', methods=['POST'])
@jwt_required_with_user
def create_swap_request(current_user):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        requestee_id = data.get('requestee_id', '').strip()
        my_event_id = data.get('my_event_id', '').strip()
        requestee_event_id = data.get('requestee_event_id', '').strip()
        message = data.get('message')

        if not requestee_id or not my_event_id or not requestee_event_id:
            return jsonify({'message': 'Required fields missing'}), 400

        if requestee_id == current_user.id:
            return jsonify({'message': 'Cannot swap with yourself'}), 400

        requestee = User.query.get(requestee_id)
        if not requestee:
            return jsonify({'message': 'Requested user not found'}), 404

        my_event = Event.query.get(my_event_id)
        if not my_event or my_event.user_id != current_user.id:
            return jsonify({'message': 'Your event not found or not owned'}), 404

        their_event = Event.query.get(requestee_event_id)
        if not their_event or their_event.user_id != requestee_id:
            return jsonify({'message': 'Requested event not found or not owned'}), 404

        if my_event.status == EventStatus.BUSY or their_event.status == EventStatus.BUSY:
            return jsonify({'message': 'Both events must be in SWAPPABLE status'}), 400

        new_swap = SwapRequest(
            requester_id=current_user.id,
            requestee_id=requestee_id,
            requester_slot_id=my_event_id,
            requestee_slot_id=requestee_event_id,
            message=message
        )
        db.session.add(new_swap)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Swap request created successfully', 'swap': new_swap.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Swap request creation failed: {str(e)}'}), 500


@swaps_bp.route('/<swap_id>/accept', methods=['POST'])
@jwt_required_with_user
def accept_swap_request(current_user, swap_id):
    try:
        swap = SwapRequest.query.get(swap_id)
        if not swap:
            return jsonify({'message': 'Swap request not found'}), 404
        if swap.requestee_id != current_user.id:
            return jsonify({'message': 'You do not have permission to accept this swap'}), 403
        if swap.status != SwapStatus.PENDING:
            return jsonify({'message': f'Swap is already {swap.status.value}'}), 400

        # Swap event ownerships
        requester_event = swap.requester_slot
        requestee_event = swap.requestee_slot
        requester_event.user_id, requestee_event.user_id = requestee_event.user_id, requester_event.user_id

        swap.status = SwapStatus.ACCEPTED
        db.session.commit()

        return jsonify({'message': 'Swap accepted successfully', 'swap': swap.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Swap acceptance failed: {str(e)}'}), 500


@swaps_bp.route('/<swap_id>/reject', methods=['POST'])
@jwt_required_with_user
def reject_swap_request(current_user, swap_id):
    try:
        swap = SwapRequest.query.get(swap_id)
        if not swap:
            return jsonify({'message': 'Swap request not found'}), 404
        if swap.requestee_id != current_user.id:
            return jsonify({'message': 'You do not have permission to reject this swap'}), 403
        if swap.status != SwapStatus.PENDING:
            return jsonify({'message': f'Swap is already {swap.status.value}'}), 400

        swap.status = SwapStatus.REJECTED
        db.session.commit()

        return jsonify({'message': 'Swap rejected successfully', 'swap': swap.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Swap rejection failed: {str(e)}'}), 500
    
@swaps_bp.route('/pending', methods=['GET'])
@jwt_required_with_user
def get_pending_swaps(current_user):
    swaps = SwapRequest.query.filter_by(
        requestee_id=current_user.id,
        status=SwapStatus.PENDING
    ).all()
    return jsonify({'pending_swaps': [s.to_dict() for s in swaps]}), 200
