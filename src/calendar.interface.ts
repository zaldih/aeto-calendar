export interface CalendarEvent {
  summary: String;
  description: String;
  start: {
    dateTime: Date;
    timeZone: string;
  };
  end: {
    dateTime: Date;
    timeZone: string;
  };
  location: String;
}

export interface CalendarEventFromGoogle extends CalendarEvent {
  id: string;
}
