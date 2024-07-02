import { existsSync, mkdirSync } from "fs";

import { AetoPdfService } from "./aeto/aeto-pdf.service";
import { AetoService } from "./aeto/aeto.service";
import { CalendarService } from "./calendar/calendar.service";
import { MainController } from "./main.controller";
import { NotificationsService } from "./notifications/notifications.service";

require("dotenv").config();

console.log("Start");
checkPrerequirements();
bootstrap();

function bootstrap() {
  const aetoService = new AetoService();
  const aetoPdfService = new AetoPdfService();
  const calendarService = new CalendarService();
  const notificationsService = new NotificationsService(
    process.env.NTFY_ENDPOINT || "",
  );

  const mainController = new MainController(
    aetoService,
    aetoPdfService,
    calendarService,
    notificationsService,
  );

  mainController.init();
}

function checkPrerequirements() {
  const dataFolder = "data";
  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder);
    console.log("data folder created");
  }
}
