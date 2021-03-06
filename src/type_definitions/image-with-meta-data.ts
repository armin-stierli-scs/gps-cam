export interface ImageWithMetaData {
  status: ImageStatus;
  location: Position; // includes a timestamp etc.
  issueBox: IssueBox;
}

export interface IssueBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  state: RectangleState;
}

export enum RectangleState {
  NONE,
  ONE_CORNER,
  BOTH_CORNERS
}

export enum ImageStatus {
  NONE,
  ACCEPT,
  DISCARD
}
