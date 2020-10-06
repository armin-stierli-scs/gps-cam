import {Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {IssueBox, RectangleState, WebcamImageStatus, WebcamImageWithMetaData} from '../type_definitions/webcam-image-with-meta-data';

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
  public captures: Array<WebcamImageWithMetaData> = [];

  // user can draw a rectangle on an image, the image comes from the array `captures`
  public captureIndex = 0;
  public leftOffset: number;
  public imageUrl: string | ArrayBuffer;


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

  public handleImage(webcamImage: WebcamImage): void {
    console.log('received webcam image', webcamImage);
    const imageWithMeta = {} as WebcamImageWithMetaData;
    imageWithMeta.webcamImage = webcamImage;
    imageWithMeta.status = WebcamImageStatus.NONE;
    imageWithMeta.location = this.trackedPosition ? JSON.parse(JSON.stringify(this.trackedPosition)) : null; // clone
    imageWithMeta.issueBox = {} as IssueBox;
    imageWithMeta.issueBox.state = RectangleState.NONE;
    this.captures.push(imageWithMeta);
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
    this.captures.forEach(
      (capture, index, all) => {
        if (capture.status === WebcamImageStatus.DISCARD) {
          all.splice(index, 1);
        }
      });
  }

  toggleWebcamImageState(i: number): void {
    this.captures[i].status += 1;
    this.captures[i].status %= 3;
  }

  uploadChosenWebImages(): void {
    alert('To be implemented');
  }

  selectForDrawingOnto(imageIndex: number): void {
    this.captureIndex = imageIndex;
  }


  getRectangleTop(): number {
    return Math.min(this.captures[this.captureIndex].issueBox.y1, this.captures[this.captureIndex].issueBox.y2);
  }

  getRectangleLeft(): number {
    return this.leftOffset
      + Math.min(this.captures[this.captureIndex].issueBox.x1, this.captures[this.captureIndex].issueBox.x2);
  }

  getRectangleWidth(): number {
    return Math.abs(this.captures[this.captureIndex].issueBox.x2 - this.captures[this.captureIndex].issueBox.x1);
  }

  getRectangleHeight(): number {
    return Math.abs(this.captures[this.captureIndex].issueBox.y2 - this.captures[this.captureIndex].issueBox.y1);
  }

  startDragging($event: MouseEvent): void {
    $event.preventDefault();
    this.leftOffset = $event.pageX - $event.offsetX;
    const issueBox = this.captures[this.captureIndex].issueBox;
    issueBox.state = RectangleState.ONE_CORNER;
    issueBox.x2 = issueBox.x1 = $event.offsetX;
    issueBox.y2 = issueBox.y1 = $event.offsetY;
  }

  onMouseMove($event: MouseEvent): void {
    const issueBox = this.captures[this.captureIndex].issueBox;
    if (issueBox.state === RectangleState.ONE_CORNER) {
      issueBox.x2 = $event.offsetX;
      issueBox.y2 = $event.offsetY;
    }
  }

  finalizeRectangle($event: MouseEvent): void {
    $event.preventDefault();
    if (this.getRectangleWidth() + this.getRectangleHeight() > 0) {
      this.captures[this.captureIndex].issueBox.state = RectangleState.BOTH_CORNERS;
    } else {
      this.captures[this.captureIndex].issueBox.state = RectangleState.NONE;
    }
  }



  onFileChanged(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // Read file as data url
      reader.onloadend = (e) => {
        this.imageUrl = e.target.result; // Set image in element
      };
    }
  }
}
