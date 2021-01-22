import { MailerClient } from './MailerClient';
import { MailContent } from './util/Mail';
import * as dotenv from 'dotenv';
import { MailTransportType, Transport } from './util/Transport';
import moment from 'moment';

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


describe("Mail Transport Configs", () => {
  let mailer: MailerClient;

  beforeEach(async (done) => {
    dotenv.config();
    mailer = new MailerClient(process.env.TEST_MAILER_ENDPOINT);
    done();
  });

  it("gets transport Stats", async (done) => {
    let stats = await mailer.getStats();
    expect(Array.isArray(stats.stats)).toBe(true);
    expect(stats.start).toBe(null);
    expect(stats.end).toBe(null);

    console.log(stats);

    //With start and end
    const start = moment().subtract(1, 'week').startOf('day');
    const end = moment().startOf('day');

    stats = await mailer.getStats(start, end);
    expect(Array.isArray(stats.stats)).toBe(true);
    expect(stats.start.isSame(start)).toBe(true);
    expect(stats.end.isSame(end)).toBe(true);

    console.log(stats);

    done();
  });

  it("gets transports", async (done) => {
    const ts = await mailer.getTransports();
    expect(ts.length).toBeGreaterThan(0);
    done();
  });

  it("create new transport", async (done) => {
    const data: Transport = {
      name: 'some-test-transport-' + Math.floor(Math.random() * 1000) ,
      type: MailTransportType.SENDINBLUE,
      weight: 100,
      active: false,
      default: true,
      sib: {
        apiKey: 'some-key-from-client'
      }
    };
    
    const t = await mailer.createTransport(data);
    expect(t.id).toBeGreaterThan(0);
    
    //Cleanup old test data
    await mailer.removeTransport(t.id).catch(() => { });
    
    done();
  });

  it("updates Transport", async (done) => {
    const data: Transport = {
      name: 'some-test-transport-' + Math.floor(Math.random() * 1000) ,
      type: MailTransportType.SENDINBLUE,
      weight: 100,
      active: false,
      default: true,
      sib: {
        apiKey: 'some-key-from-client'
      }
    };
    //Post test data
    const posted = await mailer.createTransport(data);

    const updated = await mailer.updateTransport({ id: posted.id, name: 'chookity' });

    expect(updated.name).toBe('chookity');

    await mailer.removeTransport(posted.id);

    done();
  });

});