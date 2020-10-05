import {Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {WebcamImageStatus, WebcamImageWithMetaData} from '../type_definitions/webcam-image-with-meta-data';

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
}
