from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)

# MongoDB connection
mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
try:
    client = MongoClient(mongodb_uri)
    db = client.cfms
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    db = None

# JSON encoder for ObjectId
class JSONEncoder:
    @staticmethod
    def encode(obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

# Helper function for admin-only routes
def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')

        if not name or not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400

        if db.users.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role,
            'department': data.get('department', 'N/A'),
            'status': 'active',
            'created_at': datetime.now(),
            'last_login': None
        }

        result = db.users.insert_one(user)
        access_token = create_access_token(identity=str(result.inserted_id))

        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'user': {
                'id': str(result.inserted_id),
                'name': name,
                'email': email,
                'role': role
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Missing credentials'}), 400

        user = db.users.find_one({'email': email})
        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401

        if user.get('status') != 'active':
            return jsonify({'error': 'Account is not active'}), 403

        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.now()}}
        )

        access_token = create_access_token(identity=str(user['_id']))

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'department': user.get('department', 'N/A')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Complaints Routes
@app.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    try:
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        
        if user['role'] == 'admin':
            complaints = list(db.complaints.find().sort('created_at', -1))
        else:
            complaints = list(db.complaints.find({'user_id': current_user_id}).sort('created_at', -1))

        for complaint in complaints:
            complaint['_id'] = str(complaint['_id'])
            complaint['user_id'] = str(complaint['user_id'])

        return jsonify(complaints), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        complaint = {
            'title': data.get('title'),
            'description': data.get('description'),
            'category': data.get('category'),
            'priority': data.get('priority', 'medium'),
            'status': 'open',
            'user_id': current_user_id,
            'anonymous': data.get('anonymous', False),
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'assigned_to': None,
            'department': None,
            'progress': 0
        }

        result = db.complaints.insert_one(complaint)
        complaint['_id'] = str(result.inserted_id)

        return jsonify(complaint), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints/<complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    try:
        current_user_id = get_jwt_identity()
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})

        if not complaint:
            return jsonify({'error': 'Complaint not found'}), 404

        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user['role'] != 'admin' and complaint['user_id'] != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        complaint['_id'] = str(complaint['_id'])
        complaint['user_id'] = str(complaint['user_id'])

        return jsonify(complaint), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints/<complaint_id>', methods=['PUT'])
@jwt_required()
def update_complaint(complaint_id):
    try:
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        data = request.json
        update_data = {
            'updated_at': datetime.now()
        }

        if 'status' in data:
            update_data['status'] = data['status']
        if 'assigned_to' in data:
            update_data['assigned_to'] = data['assigned_to']
        if 'department' in data:
            update_data['department'] = data['department']
        if 'priority' in data:
            update_data['priority'] = data['priority']
        if 'progress' in data:
            update_data['progress'] = data['progress']
        if 'estimated_resolution' in data:
            update_data['estimated_resolution'] = data['estimated_resolution']

        db.complaints.update_one(
            {'_id': ObjectId(complaint_id)},
            {'$set': update_data}
        )

        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
        complaint['_id'] = str(complaint['_id'])
        complaint['user_id'] = str(complaint['user_id'])

        return jsonify(complaint), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints/<complaint_id>', methods=['DELETE'])
@jwt_required()
def delete_complaint(complaint_id):
    try:
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})

        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        result = db.complaints.delete_one({'_id': ObjectId(complaint_id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Complaint not found'}), 404

        return jsonify({'message': 'Complaint deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Feedback Routes
@app.route('/api/feedback', methods=['GET'])
@jwt_required()
def get_feedback():
    try:
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        
        if user['role'] == 'admin':
            feedback = list(db.feedback.find().sort('created_at', -1))
        else:
            feedback = list(db.feedback.find({'user_id': current_user_id}).sort('created_at', -1))

        for item in feedback:
            item['_id'] = str(item['_id'])
            item['user_id'] = str(item['user_id'])

        return jsonify(feedback), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
@jwt_required()
def create_feedback():
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        feedback = {
            'rating': data.get('rating'),
            'category': data.get('category'),
            'comments': data.get('comments'),
            'status': 'pending',
            'user_id': current_user_id,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        result = db.feedback.insert_one(feedback)
        feedback['_id'] = str(result.inserted_id)

        return jsonify(feedback), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback/<feedback_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_feedback(feedback_id):
    try:
        data = request.json
        update_data = {
            'updated_at': datetime.now()
        }

        if 'status' in data:
            update_data['status'] = data['status']

        db.feedback.update_one(
            {'_id': ObjectId(feedback_id)},
            {'$set': update_data}
        )

        feedback = db.feedback.find_one({'_id': ObjectId(feedback_id)})
        feedback['_id'] = str(feedback['_id'])
        feedback['user_id'] = str(feedback['user_id'])

        return jsonify(feedback), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Routes
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    try:
        users = list(db.users.find().sort('created_at', -1))
        for user in users:
            user_id_str = str(user['_id'])
            user_id_obj = user['_id']
            user['_id'] = user_id_str
            user['id'] = user_id_str  # Add id field for compatibility
            if 'password' in user:
                del user['password']
            
            # Count tickets/complaints for this user
            # Check both string and ObjectId formats for backward compatibility
            ticket_count = db.complaints.count_documents({
                '$or': [
                    {'user_id': user_id_str},
                    {'user_id': user_id_obj}
                ]
            })
            user['tickets_submitted'] = ticket_count
            
            # Count resolved tickets if user is staff
            if user.get('role') == 'staff':
                resolved_count = db.complaints.count_documents({
                    'assigned_to': user.get('name'),
                    'status': 'resolved'
                })
                user['tickets_resolved'] = resolved_count

        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')
        department = data.get('department', 'N/A')

        if not name or not email or not password:
            return jsonify({'error': 'Missing required fields: name, email, and password are required'}), 400

        if db.users.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role,
            'department': department,
            'status': 'active',
            'created_at': datetime.now(),
            'last_login': None
        }

        result = db.users.insert_one(user)
        user['_id'] = str(result.inserted_id)
        user['id'] = str(result.inserted_id)
        if 'password' in user:
            del user['password']
        user['tickets_submitted'] = 0
        if role == 'staff':
            user['tickets_resolved'] = 0

        return jsonify(user), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    try:
        total_complaints = db.complaints.count_documents({})
        total_feedback = db.feedback.count_documents({})
        
        open_complaints = db.complaints.count_documents({'status': 'open'})
        resolved_complaints = db.complaints.count_documents({'status': 'resolved'})
        
        avg_rating = db.feedback.aggregate([
            {'$group': {'_id': None, 'avgRating': {'$avg': '$rating'}}}
        ])
        avg_rating_result = list(avg_rating)
        avg_rating_value = avg_rating_result[0]['avgRating'] if avg_rating_result else 0

        stats = {
            'total_tickets': total_complaints,
            'avg_resolution_time': '2.4 hours',
            'high_priority_alerts': db.complaints.count_documents({'priority': 'high', 'status': 'open'}),
            'customer_satisfaction': round(avg_rating_value, 1),
            'total_feedback': total_feedback,
            'open_complaints': open_complaints,
            'resolved_complaints': resolved_complaints
        }

        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/insights', methods=['GET'])
@jwt_required()
@admin_required
def get_insights():
    try:
        # Category distribution
        category_pipeline = [
            {'$group': {'_id': '$category', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        
        complaints_by_category = list(db.complaints.aggregate(category_pipeline))
        feedback_by_category = list(db.feedback.aggregate(category_pipeline))

        # Sentiment analysis
        sentiment_pipeline = [
            {'$group': {'_id': '$rating', 'count': {'$sum': 1}}}
        ]
        feedback_ratings = list(db.feedback.aggregate(sentiment_pipeline))

        positive = sum(1 for f in feedback_ratings if f['_id'] >= 4)
        neutral = sum(1 for f in feedback_ratings if f['_id'] == 3)
        negative = sum(1 for f in feedback_ratings if f['_id'] <= 2)

        insights = {
            'category_distribution': {
                'complaints': complaints_by_category,
                'feedback': feedback_by_category
            },
            'sentiment': {
                'positive': positive,
                'neutral': neutral,
                'negative': negative
            },
            'total_feedback': db.feedback.count_documents({})
        }

        return jsonify(insights), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')

