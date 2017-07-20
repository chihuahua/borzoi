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
   * The initial base pair location when a throw begins.
   */
  private throwBeginBpLocation: number;

  /**
   * The initial velocity of the camera in pixels / ms on a throw.
   */
  private initialVelocity = 0;

  /**
   * How much to decelerate by every ms on the throw. Determined via manually
   * trying out viewport throws.
   */
  private decelarationMagnitude = 0.03;

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

      this.throwBeginBpLocation = this.camera.getBpLocation();

      // Velocity is backwards because we move against it.
      this.initialVelocity = (recordA.xLocation - recordB.xLocation) / (
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
    if (this.initialVelocity === 0) {
      // No viewport throw at the moment.
      return;
    }

    // If velocity is supposed to change direction, stop the throw.
    const timePassedInMs = Date.now() - this.mouseMoveRecords[1].timeInMs;
    if (Math.abs(this.initialVelocity) <
        this.decelarationMagnitude * timePassedInMs) {
      this.initialVelocity = 0;

      // End the throw.
      (this.cancelFunction as Function)();
      return;
    }

    // Move in the direction of velocity. Decelerate.
    const deceleration = this.initialVelocity > 0 ?
        (-this.decelarationMagnitude) : this.decelarationMagnitude;
    const targetPixelLocation =
        this.throwBeginBpLocation * this.pixelsPerBasePair +
        this.initialVelocity * timePassedInMs +
        0.5 * deceleration * timePassedInMs * timePassedInMs;

    const targetBasePairLocation = this._clampBasePairLocation(
        targetPixelLocation / this.pixelsPerBasePair);
    this.camera.setBpLocation(targetBasePairLocation);
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
    // drags left, the camera moves right to expose more of the left. Also, make
    // sure that the location is within bounds.
    let targetBasePairLocation = this._clampBasePairLocation(
        this.startingBasePairLocation - basePairDisplacement);

    // We record the last 2 mouse move events.
    this.mouseMoveRecords.push(
        new MouseMoveRecord(mouseMoveEvent.pageX, Date.now()));
    if (this.mouseMoveRecords.length > 2) {
      this.mouseMoveRecords.shift();
    }

    // Set the camera to the new location.
    this.camera.setBpLocation(targetBasePairLocation);
  }

  private _clampBasePairLocation(basePairLocation): number {
    basePairLocation = Math.max(basePairLocation, 0);
    basePairLocation = Math.min(
        basePairLocation,
        this.dataManager.getContigLength(this.camera.getContig()) - 1);
    return basePairLocation;
  }
}