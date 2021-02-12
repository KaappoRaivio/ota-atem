enum MessageType {
  Event = 0,
  Subscription = 1,
}

interface Message {
  type: MessageType;
  data?: any;
}

enum SubscriptionAction {
  Subscribe = 0,
  Unsubscribe = 1,
}

interface SubscriptionMessage extends Message {
  type: MessageType.Subscription;
  action: SubscriptionAction;
  index: number;
}

enum CameraStatus {
  None = 0,
  Preview = 1,
  Program = 2,
}

interface CameraStateMessage extends Message {
  type: MessageType.Event;
  index: number;
  shortName: string;
  longName: string;
  status: CameraStatus;
}
