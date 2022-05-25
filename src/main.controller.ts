import { CalendarEvent, CalendarEventFromGoogle } from "./calendar.interface";

import { AETOEvent } from "./event.interface";
import { AetoService } from "./aeto.service";
import { CalendarService } from "./calendar.service";
import { EventService } from "./event.service";
import { readdirSync } from "fs";

export class MainController {
  constructor(
    private aetoService: AetoService,
    private eventService: EventService,
    private calendarService: CalendarService
  ) {}

  async init() {
    const urls: string[] = await this.aetoService.getEventsUrl();

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const file = await this.aetoService.downloadFile(url);
      const event = await this.eventService.getEventFromDocument(file);
      console.log(event);
      await this.addEventToCalendar(event).catch((error) =>
        console.error(error)
      );
    }
  }

  async test() {
    const files = readdirSync("data");
    for (let i = 0; i < files.length; i++) {
      const event = await this.eventService.getEventFromDocument(
        "data/" + files[i]
      );
      console.log(event);
      await this.addEventToCalendar(event);
    }
  }

  private async addEventToCalendar(event: AETOEvent) {
    const similarExistingEvents = (
      await this.calendarService.get({
        timeMin: new Date(new Date().setDate(event.startDate.getDate() - 1)),
        timeMax: new Date(new Date().setDate(event.endDate.getDate() + 1)),
      })
    ).data.items.filter(
      (calendarEvent: any) => calendarEvent.summary === event.name
    );

    // await this.removeDuplicateEvent(similarExistingEvents);
    // If the same event already exist, skip.
    if (similarExistingEvents.length) {
      console.log(`${event.name} already inserted in Calendar. Skip`);
      return;
    }

    return this.insertEvent(event);
  }

  private async insertEvent(event: AETOEvent) {
    const calendarEvent: CalendarEvent = {
      summary: event.name,
      start: {
        dateTime: event.startDate,
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: event.endDate,
        timeZone: "Europe/Madrid",
      },
      location: event.location,
      description: this.eventService.getUnifiedDescription(event),
    };

    const eventAdded = await this.calendarService.add(calendarEvent);
    console.log(`${event.name} added to calendar.`);
    return eventAdded;
  }

  private async removeDuplicateEvent(
    duplicatedEvents: CalendarEventFromGoogle[]
  ): Promise<void> {
    // If the same event already exist, delete.
    for (let i = 0; i < duplicatedEvents.length; i++) {
      const event = duplicatedEvents[i];
      console.log(`Removing duplicated event ${event.summary} (${event.id})`);
      await this.calendarService.delete(event.id);
    }
  }
}
