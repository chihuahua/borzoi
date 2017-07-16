import {Event} from './event';
import {EventTarget} from './event-target';

export class Camera extends EventTarget {
  /**
   * The floating point location within the contig in base pairs.
   */
  private bp_location: number;

  /**
   * The zoom level. 0 is the lowest level.
   */
  private zoom: number;

  constructor(bp_location: number, zoom: number) {
    super();
    this.bp_location = bp_location;
    this.zoom = zoom;
  }

  setBpLocation(bp_location: number) {
    if (bp_location === this.bp_location) {
      return;
    }

    this.bp_location = bp_location;
    this.dispatchEvent(new Event('bp_location_changed'));
  }

  setZoom(zoom: number) {
    if (zoom === this.zoom) {
      return;
    }

    this.zoom = zoom;
    this.dispatchEvent(new Event('zoom_changed'));
  }
}