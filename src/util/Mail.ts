import { Moment } from 'moment';
import { ObjectMapping, Serializer } from './Serializer';

export interface MailContent {
  from: Address;
  to: string | Address;
  replyTo?: string | Address;
  template: string;
  language: string;
  params?: any;
}

export interface Address {
  name: string;
  address: string;
}

export interface EmailPage {
  emails: QueuedEmail[];
  lastPage: number;
  perPage: number;
  currentPage: number;
}

export class QueuedEmail {
  id: number = null;

  from: string = null;
  to: string = null;
  subject: string = null;
  text: string = null;
  html?: string = null;

  maxRetries: number = null;
  attempt: number = null;
  status: string = null;
  error?: string = null;
  sent?: Moment = null;
  created: Moment = null;
  retryAfter?: Moment = null;

  static deserialize(data: any): QueuedEmail {

    let m: ObjectMapping = {
      created: 'moment',
      retryAfter: 'moment',
      sent: 'moment',
    };

    const result = Serializer.deserialize<QueuedEmail>(QueuedEmail, data, m);

    return result;
  }
}