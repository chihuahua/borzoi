import {Event} from './event';
import {EventTarget} from './event-target';

export class Camera extends EventTarget {
  /**
   * The name of the current contig.
   */
  private contig: string;

  /**
   * The floating point location within the contig in base pairs. Could be a
   * non-integer.
   */
  private bp_location: number;

  /**
   * The zoom level. 0 is the lowest level.
   */
  private zoom: number;

  constructor(contig: string, bp_location: number, zoom: number) {
    super();
    this.contig = contig;
    this.bp_location = bp_location;
    this.zoom = zoom;
  }

  getContig(): string {
    return this.contig;
  }

  setContig(contig: string) {
    if (contig === this.contig) {
      return;
    }

    this.contig = contig;
    this.dispatchEvent(new Event('change'));
    this.dispatchEvent(new Event('contig_changed'));
  }

  getBpLocation(): number {
    return this.bp_location;
  }

  setBpLocation(bp_location: number) {
    if (bp_location === this.bp_location) {
      return;
    }

    this.bp_location = bp_location;
    this.dispatchEvent(new Event('change'));
    this.dispatchEvent(new Event('bp_location_changed'));
  }

  getZoom(): number {
    return this.zoom;
  }

  setZoom(zoom: number) {
    if (zoom === this.zoom) {
      return;
    }

    this.zoom = zoom;
    this.dispatchEvent(new Event('change'));
    this.dispatchEvent(new Event('zoom_changed'));
  }
}