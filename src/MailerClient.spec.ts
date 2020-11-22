import { MailerClient } from './MailerClient';
import { MailContent } from './util/Mail';
import * as dotenv from 'dotenv';

describe("Mail Client Basics", () => {
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

describe("Mail Client Templates", () => {
  let mailer: MailerClient;

  beforeEach(async (done) => {
    dotenv.config();
    mailer = new MailerClient(process.env.TEST_MAILER_ENDPOINT);
    done();
  });

  it("gets templates", async (done) => {
    const ts = await mailer.getTemplates();
    expect(ts.length).toBeGreaterThan(0);
    done();
  });

  it("create new template", async (done) => {
    const data = {
      name: 'some-test-template',
      language: 'nz',
      subject: 'I saw a kiwi',
      text: "They're weird little critters.",
    };
    //Cleanup old test data
    await mailer.removeTemplate(data.name, data.language).catch(() => { });

    const t = await mailer.createTemplate(data);
    expect(t.id).toBeGreaterThan(0);

    done();
  });

  it("updates template", async (done) => {
    const data = {
      name: 'some-test-template',
      language: 'nz',
      subject: 'I saw a kiwi',
      text: "They're weird little critters.",
    };
    //Post test data
    await mailer.createTemplate(data).catch(() => { });

    const updated = await mailer.updateTemplate({ name: data.name, language: data.language, subject: 'chookity' });

    expect(updated.subject).toBe('chookity');

    done();
  });

});