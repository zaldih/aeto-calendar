import { existsSync, mkdirSync } from "fs";

import { AetoPdfService } from "./aeto/aeto-pdf.service";
import { AetoService } from "./aeto/aeto.service";
import { CalendarService } from "./calendar/calendar.service";
import { MainController } from "./main.controller";

require("dotenv").config();

console.log("Start");
checkPrerequirements();
bootstrap();

function bootstrap() {
  const aetoService = new AetoService();
  const aetoPdfService = new AetoPdfService();
  const calendarService = new CalendarService();

  const mainController = new MainController(
    aetoService,
    aetoPdfService,
    calendarService,
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
