# SmartLighting Backend Setup Instructions

## Dependencies Installed

The following dependencies have been added to `requirements.txt`:

### Core Framework
- `fastapi>=0.95.0` - Modern web framework for building APIs
- `uvicorn[standard]>=0.20.0` - ASGI server for running FastAPI

### Database
- `sqlalchemy>=1.4.0` - SQL toolkit and ORM
- `psycopg2-binary>=2.9.0` - PostgreSQL adapter for Python

### Authentication & Security
- `PyJWT>=2.6.0` - JSON Web Token implementation
- `passlib[bcrypt]>=1.7.4` - Password hashing library with bcrypt support

### Data Validation
- `pydantic>=1.10.0` - Data validation using Python type annotations
- `pydantic[email]` - Email validation support for Pydantic

### Configuration
- `python-dotenv>=0.20.0` - Load environment variables from .env file

### External Services
- `firebase-admin>=6.0.0` - Firebase Admin SDK for push notifications
- `requests>=2.28.0` - HTTP library for making API calls

### File Upload Support
- `python-multipart>=0.0.5` - Support for multipart/form-data

## Installation Steps

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   - Create a `.env` file in the backend directory
   - Copy variables from `environment_variables.txt`
   - Update values according to your setup

3. **Set up PostgreSQL database:**
   - Install PostgreSQL
   - Create database named `smartlighting`
   - Update database credentials in `.env`

4. **Run the application:**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API documentation:**
   - Open http://localhost:8000/docs in your browser

## Key Features Implemented

- Admin authentication and authorization
- Lantern management and control
- Breakdown tracking and reporting
- Renovation management
- Park management
- Statistics and analytics
- Mobile API endpoints
- IoT device communication
- Real-time notifications

## API Endpoints

The application includes the following main router groups:
- `/admin` - Admin management
- `/lantern` - Lantern control and monitoring
- `/breakdown` - Breakdown reporting and tracking
- `/renovation` - Renovation management
- `/park` - Park management
- `/repairman` - Repairman management
- `/company` - Company management
- `/mobile` - Mobile app specific endpoints
- `/statistics` - Analytics and reporting
- `/iot` - IoT device communication

## Notes

- All dependencies are compatible with Windows and don't require Rust compilation
- The application uses JWT for authentication
- PostgreSQL is required as the database backend
- Firebase Admin SDK is included for push notifications (optional)
- CORS is enabled for all origins (configure for production) 