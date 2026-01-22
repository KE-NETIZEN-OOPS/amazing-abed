import { useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useStore } from '../store/store';
import type { TaskStatus } from '../types';
import CalendarEventModal from './CalendarEventModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarSectionProps {
  modelId: string;
}

export default function CalendarSection({ modelId }: CalendarSectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  const calendarEntries = useStore((state) => state.calendarEntries);
  const models = useStore((state) => state.models);
  const addCalendarEntry = useStore((state) => state.addCalendarEntry);
  const updateCalendarEntry = useStore((state) => state.updateCalendarEntry);
  const deleteCalendarEntry = useStore((state) => state.deleteCalendarEntry);
  const moveCalendarEntry = useStore((state) => state.moveCalendarEntry);

  const model = models.find((m) => m.id === modelId);
  const modelEntries = calendarEntries.filter((e) => e.modelId === modelId);

  const events = modelEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    start: entry.start,
    end: entry.end,
    resource: entry,
  }));

  const eventStyleGetter = (event: any) => {
    const entry = event.resource as any;
    let backgroundColor = '#3174ad';
    
    // Status colors per requirements: Red=Not Started, Yellow=In Progress, Green=Done
    if (entry.status === 'not_started') {
      backgroundColor = '#ef4444'; // red
    } else if (entry.status === 'in_progress') {
      backgroundColor = '#eab308'; // yellow
    } else {
      backgroundColor = '#22c55e'; // green (done)
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ start, end, title: '', notes: '', status: 'not_started' as TaskStatus, isBlocked: false, isOnline: false });
    setShowAddModal(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setShowEventModal(true);
  };

  const handleEventDrop = ({ event, start, end }: any) => {
    if (event && event.id) {
      moveCalendarEntry(event.id, start, end);
    }
  };

  const handleEventResize = ({ event, start, end }: any) => {
    if (event && event.id) {
      moveCalendarEntry(event.id, start, end);
    }
  };

  const handleAddEvent = (eventData: any) => {
    addCalendarEntry({
      modelId,
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      notes: eventData.notes || '',
      status: eventData.status || 'not_started',
      isBlocked: eventData.isBlocked || false,
      isOnline: eventData.isOnline || false,
    });
    setShowAddModal(false);
    setSelectedEvent(null);
  };

  const handleUpdateEvent = (updates: any) => {
    if (selectedEvent) {
      updateCalendarEntry(selectedEvent.id, updates);
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteCalendarEntry(selectedEvent.id);
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Calendar - {model?.username}</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${model?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">Model: {model?.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            + Add Event
          </button>
        </div>
      </div>

      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          selectable
          resizable
          draggableAccessor={() => true}
          eventPropGetter={eventStyleGetter}
          defaultView="month"
        />
      </div>

      {showEventModal && selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {showAddModal && (
        <CalendarEventModal
          event={selectedEvent || { start: new Date(), end: new Date(), title: '', notes: '', status: 'not_started', isBlocked: false }}
          onClose={() => {
            setShowAddModal(false);
            setSelectedEvent(null);
          }}
          onSave={handleAddEvent}
          isNew={true}
        />
      )}
    </div>
  );
}
