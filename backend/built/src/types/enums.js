export var MessageType;
(function (MessageType) {
    MessageType[MessageType["Event"] = 0] = "Event";
    MessageType[MessageType["Subscription"] = 1] = "Subscription";
})(MessageType || (MessageType = {}));
export var SubscriptionAction;
(function (SubscriptionAction) {
    SubscriptionAction[SubscriptionAction["Subscribe"] = 0] = "Subscribe";
    SubscriptionAction[SubscriptionAction["Unsubscribe"] = 1] = "Unsubscribe";
})(SubscriptionAction || (SubscriptionAction = {}));
export var EventType;
(function (EventType) {
    EventType[EventType["ChannelStateChange"] = 0] = "ChannelStateChange";
})(EventType || (EventType = {}));
export var AtemEvent;
(function (AtemEvent) {
    AtemEvent["stateChanged"] = "stateChanged";
    AtemEvent["connected"] = "connected";
    AtemEvent["error"] = "error";
    AtemEvent["info"] = "info";
})(AtemEvent || (AtemEvent = {}));
//# sourceMappingURL=enums.js.map