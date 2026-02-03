// Central runtime config.
// Served as a static file so it can be edited without rebuilding JS bundles.
//
// OPSMIND_API_URL is read by services/* (e.g., services/ticketService.js)
// It can be overridden via a <script> tag before app scripts load.

// If not already set, default to relative /api.
window.OPSMIND_API_URL = window.OPSMIND_API_URL || '/api';
