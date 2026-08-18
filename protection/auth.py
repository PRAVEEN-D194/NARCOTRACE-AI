import jwt
import datetime
from typing import Dict, Optional

# Secret key for JWT signing (minimum 32 bytes for HS256)
SECRET_KEY = "narco_trace_secure_secret_key_member_4_long"
ALGORITHM = "HS256"

# Mock database of users with roles
USERS_DB = {
    "investigator1": {
        "username": "investigator1",
        "name": "Inspector Naveen",
        "role": "INVESTIGATOR",
        "password": "password123",
        "clearance_level": "LEVEL_1"
    },
    "senior_analyst1": {
        "username": "senior_analyst1",
        "name": "Superintendent Sharma",
        "role": "SENIOR_ANALYST",
        "password": "password123",
        "clearance_level": "LEVEL_3"
    },
    "admin1": {
        "username": "admin1",
        "name": "System Admin",
        "role": "ADMIN",
        "password": "adminpassword",
        "clearance_level": "LEVEL_MAX"
    }
}

def authenticate_user(username: str, password: str) -> Optional[Dict]:
    user = USERS_DB.get(username)
    if user and user["password"] == password:
        return {
            "username": user["username"],
            "name": user["name"],
            "role": user["role"],
            "clearance_level": user["clearance_level"]
        }
    return None

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    now = datetime.datetime.now(datetime.timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=120)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_payload
    except jwt.PyJWTError:
        return None
