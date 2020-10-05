import {WebcamImage} from 'ngx-webcam';

interface RectangleCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface WebcamImageWithMetaData {
  webcamImage: WebcamImage;
  status: WebcamImageStatus;
  location: Position; // includes a timestamp etc.
  issueBox: RectangleCoords;
}

export enum WebcamImageStatus {
  NONE,
  ACCEPT,
  DISCARD
}
