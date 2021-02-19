export enum MessageType {
    Event = 0,
    Subscription = 1,
}

export enum SubscriptionAction {
    Subscribe = 0,
    Unsubscribe = 1,
}

export enum EventType {
    ChannelStateChange,
}

export enum AtemEvent {
    stateChanged = "stateChanged",
    connected = "connected",
    error = "error",
    info = "info",
}
