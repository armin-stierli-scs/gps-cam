import {WebcamImage} from 'ngx-webcam';
import {ImageWithMetaData} from './image-with-meta-data';

export interface WebcamImageWithMetaData extends ImageWithMetaData {
  webcamImage: WebcamImage;
}
