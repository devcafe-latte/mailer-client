import { FetchWrapper } from './fetch/FetchWrapper';
import { Page, PageResult } from './util/Page';
import { QueuedEmail, EmailPage, MailContent, MailTemplate } from './util/Mail';
import { MailerError } from './util/MailerError';
import { Transport, TransportStats } from './util/Transport';
import { Moment } from 'moment';

export class MailerClient {
  private _endpoint = "http://mailer:3010/";
  private _fetch: FetchWrapper;

  constructor(optionsOrUrl?: string | MailerClientOptions) {
    if (!optionsOrUrl) {
      //let it be.
    } else if (typeof optionsOrUrl === "string") {
      this._endpoint = optionsOrUrl;
    } else {
      this._endpoint = optionsOrUrl.endpoint;
    }

    this._fetch = new FetchWrapper(this._endpoint);
  }

  async ping(): Promise<boolean> {
    const result = await this._fetch.get("");

    return result.status === 200;
  }

  async getEmails(page = 0): Promise<Page<QueuedEmail>> {
    const result = await this._fetch.get(`emails?page=${page}&perPage=10`);
    if (result.status !== 200) {
      console.error("Error getting emails", result.error);
      throw MailerError.new("Can't get emails", 500);
    }

    result.body.emails = result.body.emails.map((e: any) => QueuedEmail.deserialize(e));
    const receivedPage: EmailPage = result.body;
    const pageResult: PageResult = {
      items: receivedPage.emails,
      perPage: receivedPage.perPage,
      lastPage: receivedPage.lastPage,
      currentPage: receivedPage.currentPage,
    }
    return new Page(pageResult);
  }

  async send(m: MailContent): Promise<boolean> {
    if (!m.template) {
      console.warn("Email has no template.", m);
      return false;
    }

    const result = await this._fetch.post("email-from-template", m);
    console.log(`Mail: "${m.template}" sent`);

    if (result.status === 200) return true;

    console.error("Mail error:", result.status, result.error || result.body);
    return false;
  }


  /* Region Templates */
  async getTemplates(): Promise<MailTemplate[]> {
    const result = await this._fetch.get('templates');
    if (result.status !== 200) {
      console.error("Error getting templates", result.status, result.error || result.body);
      throw MailerError.new("Can't get Templates", 500);
    }

    return result.body.templates;
  }

  async updateTemplate(t: Partial<MailTemplate>): Promise<MailTemplate> {
    const result = await this._fetch.put('templates', t);
    if (result.status !== 200) {
      console.error("Error updating template", result.status, result.error || result.body);
      throw MailerError.new("Can't update Template", 500);
    }

    return result.body.template;
  }

  async createTemplate(t: MailTemplate): Promise<MailTemplate> {
    const result = await this._fetch.post('templates', t);
    if (result.status !== 200) {
      console.error("Error creating template", result.status, result.error || result.body);
      throw MailerError.new("Can't create Template", 500);
    }

    return result.body.template;
  }

  async removeTemplate(name: string, language: string) {
    const result = await this._fetch.delete(`templates/${name}/${language}`);
    if (result.status !== 200) {
      console.error("Error deleting template", result.status, result.error || result.body);
      throw MailerError.new("Can't delete Template", 500);
    }
  }
  /* End region */

  /* Region Transports */
  async getStats(start?: Moment, end?: Moment): Promise<TransportStats> {
    let params = [];
    if (start) params.push(`start=${start.unix()}`);
    if (end) params.push(`end=${end.unix()}`);

    const result = await this._fetch.get(`transport-stats?${params.join("&")}`);
    if (result.status !== 200) {
      console.error("Error getting Stats", result.status, result.error || result.body);
      throw MailerError.new("Can't get Stats", 500);
    }
    return TransportStats.deserialize(result.body.stats);
  }

  async getTransports(): Promise<Transport[]> {
    const result = await this._fetch.get(`transports`);
    if (result.status !== 200) {
      console.error("Error getting transports", result.status, result.error || result.body);
      throw MailerError.new("Can't get transports", 500);
    }
    return result.body.transports;
  }

  async updateTransport(t: Partial<Transport>): Promise<Transport> {
    const result = await this._fetch.put('transports', t);
    if (result.status !== 200) {
      console.error("Error updating transport", result.status, result.error || result.body);
      throw MailerError.new("Can't update Transport", 500);
    }

    return result.body.transport;
  }

  async createTransport(t: Transport): Promise<Transport> {
    const result = await this._fetch.post('transports', t);
    if (result.status !== 200) {
      console.error("Error creating transport", result.status, result.error || result.body);
      throw MailerError.new("Can't create transport", 500);
    }

    return result.body.transport;
  }

  async removeTransport(id: number) {
    const result = await this._fetch.delete(`transport/${id}`);
    if (result.status !== 200) {
      console.error("Error deleting transport", result.status, result.error || result.body);
      throw MailerError.new("Can't delete transport", 500);
    }
  }
  /* End region */

}

export interface MailerClientOptions {
  endpoint: string;
}