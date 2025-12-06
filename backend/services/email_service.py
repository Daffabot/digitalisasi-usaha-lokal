"""
Email Service using Resend
"""
import requests
from config import RESEND_API_KEY, EMAIL_FROM, FRONTEND_URL


def send_verification_email(email: str, token: str, full_name: str) -> dict:
    """
    Send verification email using Resend API
    
    Args:
        email: User's email address
        token: Verification token
        full_name: User's full name
    
    Returns:
        dict with success status or error
    """
    if not RESEND_API_KEY:
        print("Warning: RESEND_API_KEY not configured, skipping email send")
        return {"error": "Email service not configured"}
    
    verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
    
    text_content = f"""Hello {full_name},

Thank you for registering! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 1 hour.

If you didn't create an account, you can safely ignore this email.

---
PaddleOCR API Server
"""
    
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": EMAIL_FROM,
                "to": [email],
                "subject": "Verify your email address",
                "text": text_content
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return {"success": True, "message_id": response.json().get("id")}
        else:
            return {"error": f"Failed to send email: {response.text}"}
            
    except Exception as e:
        return {"error": f"Email service error: {str(e)}"}
