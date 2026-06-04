# Tea Factory Management System

A full-stack Tea Factory Management System built with React, TypeScript, and Vite.
Supports bilingual interface (English + Sinhala) for Sri Lankan tea factory operations.

## Features

- 🔐 Role-based login (Staff & Supplier)
- 📋 Daily tea entry management (gross weight, deductions, net weight)
- 📊 Monthly supplier reports with payment calculations (LKR)
- 💬 Real-time chat between staff and suppliers
- 📎 File and image sharing in chat
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS v4, Radix UI, Lucide Icons
- **State**: React useState/useEffect
- **Storage**: localStorage (MongoDB Atlas integration ready)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tea-factory-management.git

# Navigate to project
cd tea-factory-management

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Staff Login
- Select **Staff** role on the login page
- Add daily tea collection entries
- Search and filter records by supplier ID or date

### Supplier Login
- Select **Supplier** role on the login page
- View monthly tea delivery reports
- Check payment amounts in LKR

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
