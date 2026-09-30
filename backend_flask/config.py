"""
Configuration module for FarmPro AI Flask Backend
Loads settings from .env file or default values.
"""
import os
from dotenv import load_dotenv

# Load root .env or local .env
load_dotenv()

class Config:
    # Flask settings
    PORT = int(os.getenv('FLASK_PORT', 5000))
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    SECRET_KEY = os.getenv('SECRET_KEY', 'farmpro-ai-super-secret-key-2026')

    # MySQL Database settings
    DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
    DB_PORT = int(os.getenv('MYSQL_PORT', 3306))
    DB_USER = os.getenv('MYSQL_USER', 'root')
    DB_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    DB_NAME = os.getenv('MYSQL_DATABASE', 'farmpro_db')

    # Gemini AI API Key
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
