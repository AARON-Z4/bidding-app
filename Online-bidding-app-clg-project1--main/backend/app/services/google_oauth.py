"""
Google OAuth Service
Handles Google OAuth authentication flow
"""
from google.oauth2 import id_token
from google.auth.transport import requests
import httpx
from typing import Optional, Dict
from app.core.config import settings


class GoogleOAuthService:
    """Service for handling Google OAuth operations"""
    
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        
    def get_authorization_url(self) -> str:
        """
        Generate Google OAuth authorization URL
        """
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Optional[Dict]:
        """
        Exchange authorization code for access token
        """
        token_url = "https://oauth2.googleapis.com/token"
        
        data = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            
            if response.status_code == 200:
                return response.json()
            return None
    
    async def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify Google ID token and extract user info
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.client_id
            )
            
            # Token is valid, return user info
            return {
                "google_id": idinfo.get("sub"),
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "profile_picture": idinfo.get("picture"),
                "email_verified": idinfo.get("email_verified", False)
            }
        except ValueError:
            # Invalid token
            return None
    
    async def get_user_info(self, access_token: str) -> Optional[Dict]:
        """
        Get user information from Google using access token
        """
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "google_id": data.get("id"),
                    "email": data.get("email"),
                    "name": data.get("name"),
                    "profile_picture": data.get("picture"),
                    "email_verified": data.get("verified_email", False)
                }
            return None


# Singleton instance
google_oauth_service = GoogleOAuthService()