import { Address } from './Mail';
import { Moment } from 'moment';
import { Serializer } from './Serializer';

export interface Transport {
  id?: number;
  name: string;
  type: MailTransportType;
  active?: boolean;
  weight?: number;
  default?: boolean;

  sib?: SendInBlueSettings;
  mg?: MailgunSettings;
  smtp?: SmtpSettings;
}

export type settingsType = SendInBlueSettings | MailgunSettings | SmtpSettings;

export interface SendInBlueSettings extends TransportSettings {
  apiKey: string;
  apiUrl?: string;
}

export interface MailgunSettings extends TransportSettings {
  apiKey: string;
  domain: string;
  host: string;
}

export interface SmtpSettings extends TransportSettings {
  server: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export interface TransportSettings {
  id?: number;
  transportId?: number;
}

export enum MailTransportType {
  MOCK = "mock",
  MAILGUN = "mailgun",
  SENDINBLUE = "sendinblue",
  SMTP = "smtp",
}

export interface DefaultMailSettings {
  from: Address;
  language: string;
}

export class TransportStats {
  start: Moment = null;
  end: Moment = null;
  stats: TransportStat[] = [];

  static deserialize(data: any): TransportStats {
    const m = {
      start: 'moment',
      end: 'moment',
    }
    return Serializer.deserialize(TransportStats, data, m);
  }
}

export interface TransportStat {
  transportId: number;
  count: number;
}