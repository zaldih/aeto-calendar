import {readFileSync} from "fs";
import pdfParse from "pdf-parse";

import {MONTH} from "../shared/months.constant";

import {AETOEvent} from "./aeto.interface";

export class AetoPdfService {
  constructor() {}

  async getEventFromDocument(pdfPatch: string): Promise<AETOEvent> {
    const buffer = readFileSync(pdfPatch);
    const data = await pdfParse(buffer);

    const documentText: string = data.text;
    const splitedDocument = documentText.split("\n")
                                .map((line) => line.replace(/\s+/g, ' ').trim())
                                .filter((line) => line !== "");

    const event: AETOEvent = {
      name : this.getName(splitedDocument),
      description : this.getDescription(splitedDocument),
      details : this.getDetails(splitedDocument),
      location : this.getLocation(splitedDocument),
      schedule : this.getSchedule(splitedDocument),
      places : this.getPlaces(splitedDocument),
      ...this.getEventDate(splitedDocument),
    };

    return event;
  }

  getUnifiedDescription(event: AETOEvent): string {
    return `
${event.description}

${event.schedule}

 ${event.details}

🪑 ${event.places}


ℹ️ Consulta toda la info en https://juventud.malaga.eu/es/actividades-y-programas-00001/ocio/alterna-en-tu-ocio/`;
  }

  private getIndex(array: string[], toSearch: string) {
    const index = array.findIndex((element) => element.includes(toSearch));
    if (index === -1) {
      console.warn("Not element finded for: " + toSearch, array);
      throw new Error("Not element finded for: " + toSearch);
    }
    return index;
  }

  private sliceAndJoin(array: string[], start: number, end: number): string {
    const sliced = [...array ].slice(start, end);
    // Remove unnecesary spaces.
    return sliced.join(" ").replace(/\s+/g, " ").trim();
  }

  private getName(splitedDocument: string[]): string {
    const index = this.getIndex(splitedDocument, "Descripción de");
    return splitedDocument[index - 1];
  }

  private getDescription(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Descripción de") + 2;
    const endIndex = this.getIndex(splitedDocument, "Fecha");

    const description =
        this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return description;
  }

  private getSchedule(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "¿Qué haremos?");
    const endIndex = this.getIndex(splitedDocument, "Ten en cuenta");

    const details = this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return details;
  }

  private getLocation(splitedDocument: string[]): string {
    const LUGAR_REALIZACION = "Lugar de realización:"
    const locationIndex = this.getIndex(splitedDocument, LUGAR_REALIZACION);
    const fullText = splitedDocument[locationIndex];
    const location = fullText.replace(LUGAR_REALIZACION, "").trim();
    return location;
  }

  private getDetails(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Ten en cuenta");
    const endIndex = this.getIndex(splitedDocument, "Requisitos");

    const details = this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return details;
  }

  private getPlaces(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Básica") + 1;
    const endIndex = this.getIndex(splitedDocument, "Hora de inicio");

    const places = this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return places
  }

  private getEventDate(splitedDocument: string[]):
      {startDate: Date; endDate : Date;} {

    const dayIndex = this.getIndex(splitedDocument, "Realización:") + 1;
    // Del 7 al 9 de junio Viernes 9 de junio de 2023
    const inscriptionAndRealization =
        splitedDocument[dayIndex].split(" ").filter(text => text !== "de");
    ;
    const datesLenght = inscriptionAndRealization.length;
    //@ts-ignore
    const month = MONTH[inscriptionAndRealization[datesLenght - 2]];
    const day = inscriptionAndRealization[datesLenght - 3];
    const year = inscriptionAndRealization[datesLenght - 1];

    // Hora de inicio: 21h Hora finalización: 0h (hora límite de finalización)
    const index = this.getIndex(splitedDocument, "Hora de inicio:");

    const splitTimes = splitedDocument[index].split(" ")
    const aa = (text: string):
        string => {
          if (text.includes(":")) {
            return text.replace("h", "")
          } else {
            return text.replace("h", ":00")
          }
        }

    let startHour = aa(splitTimes[3])
    let endHour = aa(splitTimes[6])

    // Check is a correct time format and if not, set a extranger time.
    startHour = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startHour) ? startHour
                                                                    : "00:00";
    endHour =
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endHour) ? endHour : "23:59";

    const startDate = new Date(`${month} ${day} ${year} ${startHour}`);
    const endDate = new Date(`${month} ${day} ${year} ${endHour}`);

    // End day is next
    if (endDate.getTime() < startDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1);
    }

    return {
      startDate,
      endDate,
    };
  }
}
