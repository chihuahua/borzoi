/**
 * Manages a drag of the genome viewer. Instantiated when the user starts a
 * drag. Disposed when the drag ends.
 */

import {Camera} from './camera';
import {DataManager} from './data-manager';
import {Event} from './event';
import {EventTarget} from './event-target';

export class Drag extends EventTarget {
  /**
   * Manages the current view into the genome.
   */
  private camera: Camera;

  /**
   * Manages data.
   */
  private dataManager: DataManager;

  /**
   * The starting X coordinate of the drag.
   */
  private startingX: number;

  /**
   * The starting base pair location.
   */
  private startingBasePairLocation: number;

  /**
   * The number of pixels per base pair.
   */
  private pixelsPerBasePair: number;

  /**
   * The function to call when canceling the drag.
   */
  private cancelFunction: Object;

  constructor(
      camera: Camera,
      dataManager: DataManager,
      startingX: number,
      pixelsPerBasePair: number) {
    super();
    this.camera = camera;
    this.dataManager = dataManager;
    this.startingX = startingX;
    this.pixelsPerBasePair = pixelsPerBasePair;
    this.startingBasePairLocation = camera.getBpLocation();

    const mouseMoveHandler = this._handleMouseMove.bind(this);
    window.addEventListener('mousemove', mouseMoveHandler);

    const mouseUpCallback = () => {
      (this.cancelFunction as Function)();
    };
    this.cancelFunction = (mouseUpEvent) => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpCallback);
      this.cancelFunction = null;

      // Dispatch an event indicating that dragging has ended.
      this.dispatchEvent(new Event('ended'));
    };
    window.addEventListener('mouseup', mouseUpCallback);
  }

  /**
   * Cancels the drag.
   */
  cancel() {
    (this.cancelFunction as Function)();
  }

  private _handleMouseMove(mouseMoveEvent) {
    // Compute displacement from the starting X coordinate.
    const displacement = mouseMoveEvent.pageX - this.startingX;

    // Compute the delta in base pairs. And then the target location.
    const basePairDisplacement = displacement / this.pixelsPerBasePair;

    // We move in the opposite direction of the displacement, ie if the user
    // drags left, the camera moves right to expose more of the left.
    let targetBasePairLocation =
        this.startingBasePairLocation - basePairDisplacement;

    // Make sure that value is within bounds.
    targetBasePairLocation = Math.max(targetBasePairLocation, 0);
    targetBasePairLocation = Math.min(
        targetBasePairLocation,
        this.dataManager.getContigLength(this.camera.getContig()) - 1);

    // Set the camera to the new location.
    this.camera.setBpLocation(targetBasePairLocation);
  }
}