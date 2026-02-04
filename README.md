# OpsMind Frontend

A modern, responsive IT Service Management (ITSM) frontend built with HTML5, CSS3, Bootstrap 5, and Vanilla JavaScript.

## Features

- **Login Page** - Secure authentication with email/password
- **Dashboard** - Overview with stats, charts, activity feed, priority tickets
- **Tickets** - Full ticket management with filters, search, and AI recommendations
- **Workflows** - Workflow management and execution history

## Quick Start

### Running the Application

1. Start a local HTTP server in this directory:

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js (if http-server is installed)
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

2. Open http://localhost:8080 in your browser

### Demo Credentials

The application includes a mock API for demo purposes. Use these credentials to log in:

| Email | Password | Role |
|-------|----------|------|
| demo@opsmind.io | demo | Technician |
| admin@opsmind.io | admin123 | Admin |
| tech@opsmind.io | tech123 | Technician |
| manager@opsmind.io | manager123 | Manager |

## Project Structure

```
opsmind_frontend/
├── index.html              # Login page
├── dashboard.html          # Dashboard overview
├── tickets.html            # Ticket management
├── workflows.html          # Workflow management
├── assets/
│   ├── css/
│   │   └── main.css        # All custom styles
│   └── js/
│       ├── app.js          # Main application controller
│       ├── auth.js         # Login page script
│       ├── mock-api.js     # Mock API for demo mode
│       ├── router.js       # Client-side routing
│       ├── ui.js           # UI utilities (toasts, modals, etc.)
│       └── pages/
│           ├── dashboard.js
│           ├── tickets.js
│           └── workflows.js
├── components/
│   ├── navbar.html         # Top navigation bar
│   ├── sidebar.html        # Left sidebar navigation
│   └── modal.html          # Modal templates
└── services/
    ├── authService.js      # Authentication API
    ├── ticketService.js    # Ticket API
    ├── workflowService.js  # Workflow API
    └── aiService.js        # AI recommendations API
```

## Tech Stack

- **HTML5** - Semantic, accessible markup
- **CSS3** - Custom properties, Flexbox, Grid
- **Bootstrap 5** - Responsive framework
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript (ES6+)** - No frameworks, ES modules

## Features by Page

### Login (`index.html`)
- Email/password authentication
- Password visibility toggle
- Remember me option
- Form validation with error messages
- Loading state during authentication

### Dashboard (`dashboard.html`)
- Statistics cards (Open Tickets, Avg Response Time, etc.)
- Ticket trend chart (weekly)
- Category distribution chart
- Recent activity feed
- Priority tickets list
- Active workflows status

### Tickets (`tickets.html`)
- Ticket list with table/card view toggle
- Filter by status, priority, category, date range
- Search by ticket ID or subject
- Pagination
- Create new ticket modal
- Ticket detail view with AI recommendations
- Trigger workflow from ticket

### Workflows (`workflows.html`)
- Workflow list with status toggles
- Execution history tab
- Workflow detail modal with step visualization
- Execution detail with step status
- Create new workflow modal

## Connecting to a Real Backend

To connect to a real backend API:

1. Set the API URL before loading the app:
```html
<script>
    window.OPSMIND_API_URL = 'https://your-api-server.com/api';
</script>
```

2. Remove or comment out the mock-api.js script in the HTML files

3. Ensure your backend implements the expected API endpoints (see services/*.js for API contracts)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

© 2026 OpsMind. All rights reserved./////////
