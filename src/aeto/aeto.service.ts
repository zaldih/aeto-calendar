import { BASE_URL, URL_EVENTS } from "./aeto.constants";

import { createWriteStream } from "fs";
import { resolve } from "path";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");

export class AetoService {
  constructor() {}

  async getEventsUrl(): Promise<string[]> {
    const html = (await this.getHtml(URL_EVENTS)).data;
    const { document } = new JSDOM(html).window;
    const linksNodes = document.querySelectorAll("a[href*='ocio/ALT']");
    return [...linksNodes]
      .map((link: any) => {
        const path = link.href;
        if (!path) return "";
        return `${BASE_URL}${path}`;
      })
      .filter((x) => x);
  }

  async downloadFile(url: string): Promise<string> {
    const splitedUrl = url.split("/");
    const fileName = splitedUrl[splitedUrl.length - 1];
    const path = resolve("data", fileName);
    const writer = createWriteStream(path);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(path));
      writer.on("error", reject);
    });
  }

  private getHtml(url: string) {
    return axios.get(url);
  }
}
