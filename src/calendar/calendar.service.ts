import { CalendarEvent } from "./calendar.interface";
import { TIMEZONE } from "./time.constants";

const { google } = require("googleapis");
const calendar = google.calendar("v3");

export class CalendarService {
  private credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS + "");
  private calendarId: string = process.env.CALENDAR_ID + "";
  private auth: any;

  constructor() {
    this.initService();
  }

  private initService() {
    const scope = "https://www.googleapis.com/auth/calendar";
    this.auth = new google.auth.JWT(
      this.credentials.client_email,
      null,
      this.credentials.private_key,
      scope
    );
  }

  add(event: CalendarEvent) {
    return calendar.events.insert({
      auth: this.auth,
      timeZone: TIMEZONE,
      calendarId: this.calendarId,
      resource: event,
    });
  }

  get(parameters: any) {
    return calendar.events.list({
      auth: this.auth,
      timeZone: TIMEZONE,
      calendarId: this.calendarId,
      ...parameters,
    });
  }

  delete(eventId: string) {
    return calendar.events.delete({
      auth: this.auth,
      timeZone: TIMEZONE,
      calendarId: this.calendarId,
      eventId,
    });
  }
}
