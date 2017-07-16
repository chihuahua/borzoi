import {Camera} from './camera';
import {DataManager} from './data-manager';
import {Event} from './event';
import {EventTarget} from './event-target';

export class DataRequester extends EventTarget {
  /**
   * The index of the current request. Used for removing stale data.
   */
  private requestIndex: number;

  /**
   * The camera that we keep up to date with.
   */
  private camera: Camera;

  /**
   * Stores data we load. Used for rendering.
   */
  private dataManager: DataManager;

  /**
   * The current XHR in flight.
   */
  private pendingXhr: XMLHttpRequest;

  constructor(camera: Camera, dataManager: DataManager) {
    super();
    this.requestIndex = 1;
    this.camera = camera;
    this.dataManager = dataManager;

    // When the camera changes, load new data.
    camera.addEventListener('change', () => {
      this.requestNewData();
    });
  }

  private requestNewData() {
    if (this.pendingXhr) {
      // Cancel the previous request.
      this.pendingXhr.abort();
    }

    // Issue a new request for data.
    const requestIndex = ++this.requestIndex;
    this.pendingXhr = new XMLHttpRequest();

    // Encode the parameters.
    const contig = this.camera.getContig();
    const contigLength = this.dataManager.getContigLength(contig);
    var url = '/subsequence?contig=' + contig;

    // Obtain some data that is far to the left and right of the current view so
    // that the user has a smooth experience panning.
    var length = Math.min(contigLength, 6042);
    var leftBound = Math.floor(this.camera.getBpLocation()) - 3000;

    // Do not go out of bounds on the left.
    leftBound = Math.max(0, leftBound);

    // ... or on the right.
    leftBound = Math.min(contigLength - length, leftBound);

    // Do not go out of bounds.
    url += '&start_index=' + leftBound;
    url += '&length=' + length;

    // When we are done loading, update the data manager.
    const originalXhr = this.pendingXhr;
    this.pendingXhr.onload = () => {
      if (requestIndex === this.requestIndex) {
        this.pendingXhr = null;
      } else {
        // This request is no longer relevant.
        return;
      }

      // Update the camera.
      const responseData = JSON.parse(originalXhr.responseText);
      this.dataManager.setData(
          responseData['contig'],
          responseData['start_index'],
          responseData['sequence']);
    };

    // If the request fails, remove the reference to the XHR.
    this.pendingXhr.onerror = this.pendingXhr.onabort = () => {
      if (requestIndex === this.requestIndex) {
        this.pendingXhr = null;
      }
    };

    // Issue the request.
    this.pendingXhr.open('GET', url, true);
    this.pendingXhr.send();
  }

  requestContigs() {
    var xhr = new XMLHttpRequest(),
    method = 'GET',
    url = '/contigs';

    xhr.open(method, url, true);
    xhr.onload = () => {
      const listOfContigs = JSON.parse(xhr.responseText);
      const contigsObject: {[key: string]: number} = {};
      for (var i = 0; i < listOfContigs.length; i++) {
        contigsObject[listOfContigs[i].name] = listOfContigs[i].length;
      }
      this.dataManager.setContigToLength(contigsObject);
    };
    xhr.send();
  }
}