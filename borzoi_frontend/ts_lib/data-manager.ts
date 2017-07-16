import {Event} from './event';
import {EventTarget} from './event-target';

export class DataManager extends EventTarget {
  /**
   * The contig of the current cached data.
   */
  private contig: string;

  /**
   * The starting base pair location of the cached data.
   */
  private starting_index: number;

  /**
   * The cached string of DNA. Could be very long.
   */
  private dna_string: string;

  /**
   * A mapping between contig and length.
   */
  private contig_to_length: {[key: string]: number};

  constructor(contig: string, starting_index: number, dna_string: string) {
    super();
    this.setData(contig, starting_index, dna_string);
  }

  setData(contig: string, starting_index: number, dna_string: string) {
    if (this.contig === contig && starting_index === this.starting_index) {
      // Nothing to set.
      return;
    }

    this.contig = contig;
    this.starting_index = starting_index;
    this.dna_string = dna_string;
    this.dispatchEvent(new Event('change'));
  }

  getContigLength(contig: string) {
    return this.contig_to_length[contig];
  }

  getAllContigs(): string[] {
    return Object.keys(this.contig_to_length);
  }

  setContigToLength(contig_to_length: {[key: string]: number}) {
    this.contig_to_length = contig_to_length;
    this.dispatchEvent(new Event('contig_lengths_set'));
  }

  /**
   * Obtains the base pair character (a length-1 string) at a certain location
   * within a contig. Returns the empty string if not available yet.
   */
  getBasePair(contig: string, bp_location: number): string {
    const sentinel_value = '';
    if (contig != this.contig) {
      return sentinel_value;
    }

    if (bp_location < 0 ||
        bp_location > this.starting_index + this.dna_string.length) {
      // Out of range of available data.
      return sentinel_value;
    }

    const target_local_index = bp_location - this.starting_index;
    return this.dna_string.substring(
        target_local_index, target_local_index + 1);
  }
}