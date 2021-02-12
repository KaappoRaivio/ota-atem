import { SubscriptionAction, MessageType, EventType } from "./enums";

export interface Message {
  type: MessageType;
  data?: any;
}

export interface SubscriptionMessage extends Message {
  type: MessageType.Subscription;
  action: SubscriptionAction;
  event: string;
}

export interface Channel {
  index: number;
  shortName: string;
  longName: string;
}

export interface EventMessage extends Message {
  event: EventType;
}

export interface ChannelStateMessage extends Message {
  program: Channel;
  preview: Channel;
  inTransition: boolean;
}
