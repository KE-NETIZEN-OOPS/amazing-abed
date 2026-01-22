# CRM System

A comprehensive Customer Relationship Management system designed for managing models, customers, spending records, calendars, and work queues.

## Features

### User Management
- **Two User Roles:**
  - **Chatter**: Can manage customers, spending records, calendars, and work queues
  - **Model**: Same as chatter, plus has a publicly accessible calendar view

### Model Management
- Select and view different models
- Online/Offline status toggle for each model
- Public calendar view for each model (models only)

### Customer Management
- Add customers with the following fields:
  - Name
  - Label (Shrimp, Fish, Dolphins, Whale)
  - Phone Number
  - Age
  - Preferences
  - Interests
  - General Notes
- Edit and delete customers
- Each customer has their own spending record

### Spending Records
- Track spending per customer:
  - Amount
  - Service
  - Date & Time
- Automatic total calculation per customer
- Model total earnings display (always visible when model is selected)
- Full audit trail (who added each record)

### Calendar System
- Unique calendar for each model
- Navigate through dates (defaults to current date)
- Online/Offline status display
- Add, edit, and delete calendar entries
- **Time Blocking**: Mark time slots as unavailable
- **Color Coding:**
  - Green: Not Started
  - Yellow: In Progress
  - Red: Done
- **Drag & Drop**: Move calendar entries to adjust times
- **Resize**: Adjust entry duration by dragging edges
- Click entries to view/edit details with notes
- Full audit trail (who created/updated each entry)

### Work Queue
- Date-bound tasks (not time-specific)
- Add tasks for specific dates
- Status management (Not Started, In Progress, Done)
- Color-coded by status
- Full audit trail

### Audit Trail
- All entries show who created them
- Updates show who last modified them
- Visible in:
  - Customer records
  - Spending records
  - Calendar entries
  - Work queue items

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Login**: Create a profile as either a "chatter" or "model"
2. **Select Model**: Choose which model's dashboard to view
3. **Manage Customers**: Add customers with all their details
4. **Track Spending**: Add spending records for each customer
5. **Schedule**: Use the calendar to manage appointments and time blocks
6. **Work Queue**: Add date-specific tasks that need to be completed

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Navigation
- **React Big Calendar** - Calendar component
- **Tailwind CSS** - Styling
- **date-fns** - Date utilities

## Data Persistence

Data is stored in browser localStorage, so it persists across sessions. To reset all data, clear your browser's localStorage.

## License

MIT
