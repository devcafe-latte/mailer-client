import { FetchWrapper } from './fetch/FetchWrapper';
import { Page, PageResult } from './util/Page';
import { QueuedEmail, EmailPage, MailContent } from './util/Mail';
import { MailerError } from './util/MailerError';

export class MailerClient {
  private _endpoint = "http://mailer:3010/";
  private _fetch: FetchWrapper;

  constructor(optionsOrUrl?: string|MailerClientOptions) {
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

    if (!m.language) {
      console.warn(`Email has no language.`, m);
      return false;
    }

    const result = await this._fetch.post("email-from-template", m);
    console.log(`Mail: "${m.template}" sent`);

    if (result.status === 200) return true;

    console.error("Mail error:", result.error);
    return false;
  }
  
}

export interface MailerClientOptions {
  endpoint: string;
}