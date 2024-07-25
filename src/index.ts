import { existsSync, mkdirSync } from "fs";

import { AetoPdfService } from "./aeto/aeto-pdf.service";
import { AETOEvent } from "./aeto/aeto.interface";
import { AetoService } from "./aeto/aeto.service";
import { CalendarService } from "./calendar/calendar.service";
import { MainController } from "./main.controller";
import { NotificationsService } from "./notifications/notifications.service";

require("dotenv").config();

checkPrerequirements();
const mainController = getController();

function checkPrerequirements() {
  const dataFolder = "data/aeto-files";
  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder, { recursive: true });
    console.log("data folder created");
  }
}

function getController() {
  const aetoService = new AetoService();
  const aetoPdfService = new AetoPdfService();
  const calendarService = new CalendarService();
  const notificationsService = new NotificationsService(
    process.env["NTFY_ENDPOINT"] || "",
  );

  return new MainController(
    aetoService,
    aetoPdfService,
    calendarService,
    notificationsService,
  );
}

/** Download all published activities for analysis.
    Returns the list of events. 
**/
export async function getAetoEvents(): Promise<AETOEvent[]> {
  const result = await mainController.getEvents();
  return result;
}

export function getAndAddEventsToCalendar() {
  return mainController.getAndAddEventsToCalendar();
}

export * from "./aeto/aeto.interface";
