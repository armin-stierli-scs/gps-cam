import {ImageWithMetaData} from './image-with-meta-data';

export interface UrlImageWithMetaData extends ImageWithMetaData {
  imageAsUrl: string | ArrayBuffer;
}
