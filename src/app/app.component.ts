import {Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {IssueBox, RectangleState, ImageStatus} from '../type_definitions/image-with-meta-data';
import {WebcamImageWithMetaData} from '../type_definitions/webcam-image-with-meta-data';
import {UrlImageWithMetaData} from '../type_definitions/url-image-with-meta-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'gps-cam';
  singlePosition: Position;
  trackedPosition: Position;
  private watchId: number;
  public geoErrors: PositionError[] = [];

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public webcamErrors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private snapshotTrigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  public capturesWebcam: Array<WebcamImageWithMetaData> = [];

  // user can draw a rectangle on an image, the image comes from the array `captures`
  public captureIndexWebcam = 0;
  public leftOffsetWebcam: number;

  public capturesUrl: Array<UrlImageWithMetaData> = [];
  public captureIndexUrl = 0;
  public leftOffsetUrl: number;


  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.snapshotTrigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.webcamErrors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleWebcamImage(webcamImage: WebcamImage): void {
    console.log('received webcam image', webcamImage);
    const imageWithMeta = {} as WebcamImageWithMetaData;
    imageWithMeta.webcamImage = webcamImage;
    imageWithMeta.status = ImageStatus.NONE;
    imageWithMeta.location = this.trackedPosition ? JSON.parse(JSON.stringify(this.trackedPosition)) : null; // clone
    imageWithMeta.issueBox = {} as IssueBox;
    imageWithMeta.issueBox.state = RectangleState.NONE;
    this.capturesWebcam.push(imageWithMeta);
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
  }

  public get snapshotTriggerObservable(): Observable<void> {
    return this.snapshotTrigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  getGeoLocation(): void {
    if (this.watchId) {
      this.stopTrackingGeoLocation();
    }

    navigator.geolocation.getCurrentPosition(
      position => this.singlePosition = position,
      error => this.geoErrors.push(error)
    );
  }

  trackGeoLocation(): void {
    this.watchId = navigator.geolocation.watchPosition(position => this.trackedPosition = position);
  }

  stopTrackingGeoLocation(): void {
    navigator.geolocation.clearWatch(this.watchId);
  }

  toLocaleString(timestamp: number): string {
    const myDate = new Date(timestamp);
    return myDate.toLocaleString('de-CH');
  }

  removeUnwantedWebImages(): void {
    this.capturesWebcam.forEach(
      (capture, index, all) => {
        if (capture.status === ImageStatus.DISCARD) {
          all.splice(index, 1);
        }
      });
  }
  removeUnwantedUrlImages(): void {
    this.capturesUrl.forEach(
      (capture, index, all) => {
        if (capture.status === ImageStatus.DISCARD) {
          all.splice(index, 1);
        }
      });
  }

  toggleWebcamImageState(i: number): void {
    this.capturesWebcam[i].status += 1;
    this.capturesWebcam[i].status %= 3;
  }

  toggleUrlImageState(i: number): void {
    this.capturesUrl[i].status += 1;
    this.capturesUrl[i].status %= 3;
  }

  uploadChosenImages(): void {
    alert('To be implemented');
  }

  selectForDrawingOntoWebcamImage(imageIndex: number): void {
    this.captureIndexWebcam = imageIndex;
  }

  selectForDrawingOntoUrlImage(imageIndex: number): void {
    this.captureIndexUrl = imageIndex;
  }


  getRectangleTopWebcam(): number {
    return Math.min(this.capturesWebcam[this.captureIndexWebcam].issueBox.y1, this.capturesWebcam[this.captureIndexWebcam].issueBox.y2);
  }

  getRectangleLeftWebcam(): number {
    return this.leftOffsetWebcam
      + Math.min(this.capturesWebcam[this.captureIndexWebcam].issueBox.x1, this.capturesWebcam[this.captureIndexWebcam].issueBox.x2);
  }

  getRectangleWidthWebcam(): number {
    return Math.abs(this.capturesWebcam[this.captureIndexWebcam].issueBox.x2 - this.capturesWebcam[this.captureIndexWebcam].issueBox.x1);
  }

  getRectangleHeightWebcam(): number {
    return Math.abs(this.capturesWebcam[this.captureIndexWebcam].issueBox.y2 - this.capturesWebcam[this.captureIndexWebcam].issueBox.y1);
  }

  getRectangleTopUrl(): number {
    return Math.min(this.capturesUrl[this.captureIndexUrl].issueBox.y1, this.capturesUrl[this.captureIndexUrl].issueBox.y2);
  }

  getRectangleLeftUrl(): number {
    return this.leftOffsetUrl
      + Math.min(this.capturesUrl[this.captureIndexUrl].issueBox.x1, this.capturesUrl[this.captureIndexUrl].issueBox.x2);
  }

  getRectangleWidthUrl(): number {
    return Math.abs(this.capturesUrl[this.captureIndexUrl].issueBox.x2 - this.capturesUrl[this.captureIndexUrl].issueBox.x1);
  }

  getRectangleHeightUrl(): number {
    return Math.abs(this.capturesUrl[this.captureIndexUrl].issueBox.y2 - this.capturesUrl[this.captureIndexUrl].issueBox.y1);
  }

  startDraggingWebcamImage($event: MouseEvent): void {
    $event.stopPropagation();
    this.leftOffsetWebcam = $event.pageX - $event.offsetX;
    const issueBox = this.capturesWebcam[this.captureIndexWebcam].issueBox;
    issueBox.state = RectangleState.ONE_CORNER;
    issueBox.x2 = issueBox.x1 = $event.offsetX;
    issueBox.y2 = issueBox.y1 = $event.offsetY;
  }

  startDraggingUrlImage($event: MouseEvent): void {
    $event.stopPropagation();
    this.leftOffsetUrl = $event.pageX - $event.offsetX;
    const issueBox = this.capturesUrl[this.captureIndexUrl].issueBox;
    issueBox.state = RectangleState.ONE_CORNER;
    issueBox.x2 = issueBox.x1 = $event.offsetX;
    issueBox.y2 = issueBox.y1 = $event.offsetY;
  }

  onMouseMoveWebcamImage($event: MouseEvent): void {
    $event.stopPropagation();
    const issueBox = this.capturesWebcam[this.captureIndexWebcam].issueBox;
    if (issueBox.state === RectangleState.ONE_CORNER) {
      issueBox.x2 = $event.offsetX;
      issueBox.y2 = $event.offsetY;
    }
  }
  onMouseMoveUrlImage($event: MouseEvent): void {
    $event.stopPropagation();
    const issueBox = this.capturesUrl[this.captureIndexUrl].issueBox;
    if (issueBox.state === RectangleState.ONE_CORNER) {
      issueBox.x2 = $event.offsetX;
      issueBox.y2 = $event.offsetY;
    }
  }

  finalizeRectangleWebcamImage(): void {
    if (this.getRectangleWidthWebcam() + this.getRectangleHeightWebcam() > 0) {
      this.capturesWebcam[this.captureIndexWebcam].issueBox.state = RectangleState.BOTH_CORNERS;
    } else {
      this.capturesWebcam[this.captureIndexWebcam].issueBox.state = RectangleState.NONE;
    }
  }

  finalizeRectangleUrlImage(): void {
    if (this.getRectangleWidthUrl() + this.getRectangleHeightUrl() > 0) {
      this.capturesUrl[this.captureIndexUrl].issueBox.state = RectangleState.BOTH_CORNERS;
    } else {
      this.capturesUrl[this.captureIndexUrl].issueBox.state = RectangleState.NONE;
    }
  }

  onFileChanged(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // Read file as data url
      reader.onloadend = (e) => {
        const urlImage = e.target.result;
        const imageWithMeta = {} as UrlImageWithMetaData;
        imageWithMeta.imageAsUrl = urlImage;
        imageWithMeta.status = ImageStatus.NONE;
        imageWithMeta.location = this.trackedPosition ? JSON.parse(JSON.stringify(this.trackedPosition)) : null; // clone
        imageWithMeta.issueBox = {} as IssueBox;
        imageWithMeta.issueBox.state = RectangleState.NONE;
        this.capturesUrl.push(imageWithMeta);
      };
    }
  }

  onTouchMove($event: TouchEvent): void {
    $event.preventDefault();
  }
}
