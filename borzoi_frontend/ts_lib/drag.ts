/**
 * Manages a drag of the genome viewer. Instantiated when the user starts a
 * drag. Disposed when the drag ends.
 */

import {Camera} from './camera';
import {DataManager} from './data-manager';
import {Event} from './event';
import {EventTarget} from './event-target';

/**
 * A record of when a mouse move occurred. Used for computing the viewport throw
 * after the drag.
 */
class MouseMoveRecord {
  /**
   * The x location in pixels at the time of the mouse move event.
   */
  xLocation: number;

  /**
   * The timestamp in ms at the time of the mouse move event.
   */
  timeInMs: number;

  constructor(xLocation: number, timeInMs: number) {
    this.xLocation = xLocation;
    this.timeInMs = timeInMs;
  }
}

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

  /**
   * A record of mouse move events. Used to compute the viewport throw later.
   */
  private mouseMoveRecords: MouseMoveRecord[] = [];

  /**
   * The current velocity of the camera in pixels / ms. 0 if none.
   */
  private velocity = 0;

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
      window.removeEventListener('mousemove', mouseMoveHandler);
      if (this.mouseMoveRecords.length < 2) {
        // Do not throw.
        (this.cancelFunction as Function)();
        return;
      }

      const recordB = this.mouseMoveRecords[1];
      const recordA = this.mouseMoveRecords[0];

      this.velocity = (recordB.xLocation - recordA.xLocation) / (
          recordB.timeInMs - recordA.timeInMs);
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
   * Called before rendering on every frame during the drag.
   */
  possiblyHandleViewportThrow() {
    if (this.velocity === 0) {
      // No viewport throw at the moment.
      return;
    }

    // TODO: Change camera position in response to viewport throw.
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

    // We record the last 2 mouse move events.
    this.mouseMoveRecords.push(
        new MouseMoveRecord(mouseMoveEvent.pageX, Date.now()));
    if (this.mouseMoveRecords.length > 2) {
      this.mouseMoveRecords.shift();
    }

    // Set the camera to the new location.
    this.camera.setBpLocation(targetBasePairLocation);
  }
}