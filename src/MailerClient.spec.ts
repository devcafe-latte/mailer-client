import { MailerClient } from './MailerClient';
import { MailContent } from './util/Mail';
import * as dotenv from 'dotenv';

describe("Mail Client", () => {
  let mailer: MailerClient;

  beforeEach(async (done) => {
    dotenv.config();
    mailer = new MailerClient(process.env.TEST_MAILER_ENDPOINT);
    done();
  });

  it("gets the status", async (done) => {
    expect(await mailer.ping()).toBe(true);

    const wrongMailer = new MailerClient("http://localhost:9999");
    expect(await wrongMailer.ping()).toBe(false, "Endpoint is wrong.");

    done();
  });

  it("Queues an email", async (done) => {
    const id = Math.floor(Math.random() * 10000);

    const mail: MailContent = {
      from: {
        address: `${id}@example.com`,
        name: "Co de Boswachter"
      },
      to: {
        address: "karel@example.com",
        name: "Karel Appel"
      },
      template: 'test-mail',
      params: {
        name: 'Karel',
        foo: 'bar',
        confirmLink: 'http://example.com/confirm?token=123456789'
      },
      language: 'en'
    }

    expect(await mailer.send(mail)).toBe(true);

    //Test getEmails as well.
    const page = await mailer.getEmails();

    const lastEmail = page.items[0];
    expect(lastEmail.from).toBe(`Co de Boswachter <${id}@example.com>`);

    //get latest emails
    done();
  });
});