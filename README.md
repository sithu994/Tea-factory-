# Tea Factory Management System

A Tea Factory Management System built with React, TypeScript, and Vite, with an
English and Sinhala interface for Sri Lankan tea factory operations.

## Features

- 🔐 Role-based login (Staff & Supplier)
- 📋 Daily tea entry management (gross weight, deductions, net weight)
- 📊 Supplier pay sheets by month or year (LKR)
- 💬 Real-time chat between staff and suppliers
- 📎 File and image sharing in chat
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express
- **Database**: SQLite
- **SMS recovery**: Twilio Verify
- **UI**: Tailwind CSS v4, Radix UI, Lucide Icons
- **State**: React useState/useEffect
- **Storage**: localStorage

Accounts are stored in the backend database. Sign in with your username or supplier ID
and password. Registration and password recovery use the account phone number in
international format (for example, `+94771234567`). Registration does not send an SMS;
password recovery sends a one-time code to the account phone.
Supplier accounts should use the supplier ID entered on tea delivery records.
Accounts previously stored only in a browser are not imported; create a new account.

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tea-factory-management.git

# Navigate to project
cd tea-factory-management

# Install dependencies
npm install

# Optional: configure Twilio credentials for SMS password recovery (see below)
Copy-Item .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### SMS setup

Create a Twilio Verify service and set these values in `.env`:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

Forgot-password SMS recovery requires valid Twilio credentials; account registration
and sign-in work without them. Keep `.env` private and never commit real credentials.

## Usage

### Staff Login
- Select **Staff** role on the login page
- Add daily tea collection entries
- Search and filter records by supplier ID or date

### Supplier Login
- Select **Supplier** role and enter the supplier ID used on tea delivery records
- View monthly or annual delivery records and payment totals
- Check payment amounts in LKR

### Staff Records
- Set the delivery date at the top of the dashboard before entering supplier deliveries
- Search records by supplier ID or select an exact date to see all suppliers recorded that day

### Chat Feature
- Open the chat bubble (bottom-right corner)
- Staff and Supplier can message each other in real-time
- Supports text, images, and file attachments

## Project Structure

```
├── app/
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # React entry point
│   └── components/
│       ├── login-page.tsx         # Login with role selection
│       ├── staff-dashboard.tsx    # Tea entry management
│       ├── supplier-portal.tsx    # Monthly reports & stats
│       ├── chat-panel.tsx         # Real-time chat panel
│       └── ui/                    # Reusable UI components
├── styles/
│   ├── index.css                  # Main CSS entry
│   ├── theme.css                  # Design tokens & theme
│   ├── tailwind.css               # Tailwind imports
│   └── fonts.css                  # Typography
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
└── package.json
```

## License

MIT License — feel free to use and modify.
