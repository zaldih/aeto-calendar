import axios from "axios";

export interface SendOptions {
  title: string;
  body: string;
  tags?: string;
}

export class NotificationsService {
  isEnabled = false;

  constructor(private readonly endpoint: string) {
    if (endpoint && endpoint !== "null") {
      this.isEnabled = true;
    }
  }

  send({ title, body, tags }: SendOptions) {
    return axios.post(this.endpoint, body, {
      headers: {
        Title: title,
        Tags: tags || "",
      },
    });
  }

  get endpointUrl(): string {
    return this.endpoint;
  }
}
