# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## First Steps

1. **Create a Profile:**
   - Enter a username
   - Choose your role: "Chatter" or "Model"
   - Click "Login"

2. **If you're a Model:**
   - Your account is automatically created as a model
   - You can toggle your online/offline status
   - You have access to a public calendar view

3. **If you're a Chatter:**
   - You can manage all models' data
   - You can create additional model accounts if needed

4. **Select a Model:**
   - Click on a model card to view their dashboard
   - You'll see their customers, spending records, calendar, and work queue

## Key Features

### Adding Customers
- Click "+ Add Customer" in the Customers section
- Fill in all details (name, label, phone, age, preferences, interests, notes)
- Each customer automatically gets their own spending record section

### Tracking Spending
- Click "+ Add" next to a customer's spending record
- Enter amount, service, date, and time
- Total updates automatically
- Model's total earnings are displayed at the top

### Managing Calendar
- Click on the calendar to add events
- Drag events to move them
- Resize events by dragging edges
- Click events to edit details
- Use color coding: Green (Not Started), Yellow (In Progress), Red (Done)
- Toggle "Block Time" to mark as unavailable

### Work Queue
- Add date-specific tasks (not time-bound)
- Perfect for tasks like "Custom video - due today"
- Change status as you work on tasks
- Filter by date using the date picker

## Tips

- All data is saved automatically to your browser's localStorage
- Every entry shows who created/updated it (audit trail)
- Models can view their public calendar by clicking "View Public Calendar"
- You can navigate the calendar using the navigation buttons
- Use the "Today" button to jump to the current date
