import {WebcamImage} from 'ngx-webcam';

export interface WebcamImageWithMetaData {
  webcamImage: WebcamImage;
  status: WebcamImageStatus;
  location: Position; // includes a timestamp etc.
}

export enum WebcamImageStatus {
  NONE,
  ACCEPT,
  DISCARD
}
