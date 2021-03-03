import { SubscriptionAction, MessageType, EventType, AtemEvent } from "enums";

export interface Message {
    type: string;
    data?: any;
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
    type: "tally";
    program: Channel;
    preview: Channel;
    inTransition: boolean;
}

export interface MediaStateMessage extends Message {
    type: "media";
    currentIndex: number;
    currentValues: {
        title: string;
        subtitle: string;
    };
}

export type AtemEventHandlers = { [key in keyof typeof AtemEvent]: Function[] };
