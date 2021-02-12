enum LiveStatus {
  None = 0,
  Preview = 1,
  Program = 2,
}

interface CameraState {
  index: number;
  shortName: string;
  longName: string;
  status: LiveStatus;
}
