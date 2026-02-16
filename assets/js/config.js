// Central runtime config.
// Served as a static file so it can be edited without rebuilding JS bundles.
//
// OPSMIND_API_URL is read by services/* (e.g., services/ticketService.js)
// OPSMIND_AI_API_URL is read by aiService.js for AI/ML endpoints
// They can be overridden via a <script> tag before app scripts load.

// Backend API Configuration
window.OPSMIND_API_URL = window.OPSMIND_API_URL || 'http://localhost:3001';
window.OPSMIND_AI_API_URL = window.OPSMIND_AI_API_URL || 'http://localhost:8000';

// Google Gemini AI Configuration
window.GEMINI_API_KEY = 'AIzaSyDyqkKcGlp6H82L-NQFhOaeWi7zo38nt78';
window.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
