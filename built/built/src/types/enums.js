"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtemEvent = exports.EventType = exports.SubscriptionAction = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Event"] = 0] = "Event";
    MessageType[MessageType["Subscription"] = 1] = "Subscription";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var SubscriptionAction;
(function (SubscriptionAction) {
    SubscriptionAction[SubscriptionAction["Subscribe"] = 0] = "Subscribe";
    SubscriptionAction[SubscriptionAction["Unsubscribe"] = 1] = "Unsubscribe";
})(SubscriptionAction = exports.SubscriptionAction || (exports.SubscriptionAction = {}));
var EventType;
(function (EventType) {
    EventType[EventType["ChannelStateChange"] = 0] = "ChannelStateChange";
})(EventType = exports.EventType || (exports.EventType = {}));
var AtemEvent;
(function (AtemEvent) {
    AtemEvent["stateChanged"] = "stateChanged";
    AtemEvent["connected"] = "connected";
    AtemEvent["error"] = "error";
    AtemEvent["info"] = "info";
})(AtemEvent = exports.AtemEvent || (exports.AtemEvent = {}));
//# sourceMappingURL=enums.js.map