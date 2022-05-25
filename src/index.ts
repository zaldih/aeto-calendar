import { existsSync, mkdirSync } from "fs";

import { AetoService } from "./aeto.service";
import { CalendarService } from "./calendar.service";
import { EventService } from "./event.service";
import { MainController } from "./main.controller";

require("dotenv").config();

console.log("Start");
checkPrerequirements();

const aetoService = new AetoService();
const eventService = new EventService();
const calendarService = new CalendarService();

const mainController = new MainController(
  aetoService,
  eventService,
  calendarService
);

mainController.init();

function checkPrerequirements() {
  const dataFolder = "data";
  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder);
    console.log("data folder created");
  }
}
