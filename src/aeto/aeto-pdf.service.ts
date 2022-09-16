import { AETOEvent } from "./aeto.interface";
import { MONTH } from "../shared/months.constant";
import { readFileSync } from "fs";
import pdfParse from "pdf-parse";

export class AetoPdfService {
  constructor() {}

  async getEventFromDocument(pdfPatch: string): Promise<AETOEvent> {
    const buffer = readFileSync(pdfPatch);
    const data = await pdfParse(buffer);

    const documentText: string = data.text;
    const splitedDocument = documentText.split("\n").map((line) => line.trim());

    const event: AETOEvent = {
      name: this.getName(splitedDocument),
      description: this.getDescription(splitedDocument),
      details: this.getDetails(splitedDocument),
      location: this.getLocation(splitedDocument),
      schedule: this.getSchedule(splitedDocument),
      places: this.getPlaces(splitedDocument),
      ...this.getEventDate(splitedDocument),
    };

    return event;
  }

  getUnifiedDescription(event: AETOEvent): string {
    return `
${event.description}

${event.schedule}

 ${event.details}

🪑 ${event.places} plazas


ℹ️ Consulta toda la info en https://juventud.malaga.eu/es/actividades-y-programas-00001/ocio/alterna-en-tu-ocio/`;
  }

  private getIndex(array: string[], toSearch: string) {
    const index = array.findIndex((element) => element.includes(toSearch));
    if (index === -1) {
      console.warn(array);
      throw new Error("Not element finded for: " + toSearch);
    }
    return index;
  }

  private sliceAndJoin(array: string[], start: number, end: number): string {
    const sliced = [...array].slice(start, end);
    // Remove unnecesary spaces.
    return sliced.join(" ").replace(/\s+/g, " ").trim();
  }

  private getName(splitedDocument: string[]): string {
    const index = this.getIndex(splitedDocument, "Descripción");
    return splitedDocument[index - 1];
  }

  private getDescription(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Descripción") + 2;
    const endIndex = this.getIndex(splitedDocument, "Fecha") - 1;

    const description = this.sliceAndJoin(
      splitedDocument,
      startIndex,
      endIndex
    );
    return description;
  }

  private getSchedule(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Información") + 1;
    const endIndex = this.getIndex(splitedDocument, "Observaciones") - 1;

    const schedule = [...splitedDocument]
      .slice(startIndex, endIndex)
      .map((line) => {
        line = line.replaceAll("", "-");
        line = line.replace(/\s+/g, " ");
        return line;
      })
      .join("\n")
      .trim();

    return schedule;
  }

  private getLocation(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Lugar") + 2;
    const endIndex = this.getIndex(splitedDocument, "Información");

    const location = this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return location;
  }

  private getDetails(splitedDocument: string[]): string {
    const startIndex = this.getIndex(splitedDocument, "Materiales") + 1;
    const endIndex = this.getIndex(splitedDocument, "Requisitos de");

    const details = this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return details;
  }

  private getPlaces(splitedDocument: string[]): number {
    const startIndex = this.getIndex(splitedDocument, "Horario y") + 1;
    const endIndex = this.getIndex(splitedDocument, "Lugar") - 1;

    const places = this.sliceAndJoin(splitedDocument, startIndex, endIndex);
    return +places.replace("plazas", "");
  }

  private getEventDate(splitedDocument: string[]): {
    startDate: Date;
    endDate: Date;
  } {
    // console.log(splitedDocument);
    const index = this.getIndex(splitedDocument, "Realización:") + 1;
    const index2 = this.getIndex(splitedDocument, "Lugar") - 1;

    const splitTimes = splitedDocument[index2].split(" ").filter(String);
    let startHour = splitTimes[1].replace("h", ":00").trim();
    let endHour = splitTimes[3].replace("h", ":00").trim();

    // Check is a correct time format and if not, set a extranger time.
    startHour = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startHour)
      ? startHour
      : "11:11";
    endHour = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endHour)
      ? endHour
      : "22:22";

    const date = splitedDocument[index].split(" ").filter(String);
    //@ts-ignore
    const month = MONTH[date[3]];
    const day = date[1];
    const year = date[5];

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
