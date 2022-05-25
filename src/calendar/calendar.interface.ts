export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: Date;
    timeZone: string;
  };
  end: {
    dateTime: Date;
    timeZone: string;
  };
  location: string;
}

export interface CalendarEventFromGoogle extends CalendarEvent {
  id: string;
}
