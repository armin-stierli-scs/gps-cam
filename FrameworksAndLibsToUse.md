#Frameworks and Libraries to use

## GPS
javascript:  
- `navigator.geolocation.getCurrentPosition(pos => console.log(pos))` can be used to captor the position just once.
- `navigator.geolocation.watchPosition(...)` continuously tracks the position and updates whenever the position significantly changes
- remember to call `navigator.geolocation.clearWatch(this.watchId);` in the end
- for demonstration purposes I included both, but you probably only want to use the latter.

## Taking Pictures
- use: `ngx-webcam`

## Improve Code Quality and Maintainability
TODOs:
- Add a `GeoLocationService` that knows the current Location
- Consider using an Object that includes `WebImage`s along with metadata cf. `WebcamImagesWithMetaData` namely you want to have geo location
 together with your image
- Divide the app into components
- Remove style attributes from the html template

