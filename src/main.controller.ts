import { readdirSync } from "fs";
import { basename } from "path";

import { AetoPdfService } from "./aeto/aeto-pdf.service";
import { AETOEvent } from "./aeto/aeto.interface";
import { AetoService } from "./aeto/aeto.service";
import {
  CalendarEvent,
  CalendarEventFromGoogle,
} from "./calendar/calendar.interface";
import { CalendarService } from "./calendar/calendar.service";
import { ADD_HOURS } from "./calendar/time.functions";
import { NotificationsService } from "./notifications/notifications.service";

export class MainController {
  constructor(
    private aetoService: AetoService,
    private eventService: AetoPdfService,
    private calendarService: CalendarService,
    private notificationsService: NotificationsService,
  ) {}

  async init() {
    const urls: string[] = await this.aetoService.getEventsUrl();
    const filesPaths = await this.downloadEvents(urls);
    const events = await this.getEventsFromFiles(filesPaths);
    await this.addEventsToCalendar(events);
  }

  private async downloadEvents(urls: string[]): Promise<string[]> {
    console.log("Downloading activities...");
    return await Promise.all(
      urls.map(async (url) => {
        return await this.aetoService.downloadFile(url);
      }),
    ).then((data) => {
      console.log(
        "Activities PDF: ",
        data.map((path) => basename(path)),
      );
      console.log("Done");
      return data;
    });
  }

  private async getEventsFromFiles(
    paths: string[],
  ): Promise<(void | AETOEvent)[]> {
    console.log("Parsing activities...");
    return Promise.all(
      paths.map((path) =>
        this.eventService
          .getPdfText(path)
          .then((pdfText) => {
            const cleanedText = this.eventService.cleanPdfText(pdfText);
            // console.log({ cleanedText });
            return this.eventService.getEventFromText(cleanedText);
          })
          .catch((error) => {
            console.error("#getEventsFromFiles", error);
          }),
      ),
    ).then((data) => {
      console.log("Activities: ", data);
      console.log("Done");
      return data;
    });
  }

  private async addEventsToCalendar(events: any[]) {
    console.log("Adding activities to calendar...");
    for await (const event of events) {
      await this.addEventToCalendar(event).catch((error) =>
        console.error("#addEventsToCalendar", error),
      );
    }
    console.log("#addEventsToCalendar done");
  }

  private async addEventToCalendar(event: AETOEvent) {
    const similarExistingEvents = (
      await this.calendarService.get({
        timeMin: ADD_HOURS(event.startDate, -1),
        timeMax: ADD_HOURS(event.endDate, 1),
      })
    ).data.items.filter(
      (calendarEvent: any) => calendarEvent.summary === event.name,
    );

    // await this.removeDuplicateEvent(similarExistingEvents);
    // If the same event already exist, skip.
    if (similarExistingEvents.length) {
      console.log(`[Skip] ${event.name} already inserted in Calendar.`);
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
    console.log(`[Added] ${event.name} added to calendar.`);
    await this.notificationsService
      .send({
        title: `${event.name}`,
        body: `Start: ${event.startDate.toLocaleString()}`,
        tags: "calendar",
      })
      .catch(() =>
        console.warn(
          "Error sending notification to " +
            this.notificationsService.endpointUrl,
        ),
      );
    return eventAdded;
  }

  private async removeDuplicateEvent(
    duplicatedEvents: CalendarEventFromGoogle[],
  ): Promise<void> {
    // If the same event already exist, delete.
    for (let i = 0; i < duplicatedEvents.length; i++) {
      const event = duplicatedEvents[i];
      console.log(`Removing duplicated event ${event.summary} (${event.id})`);
      await this.calendarService.delete(event.id);
    }
  }
}
