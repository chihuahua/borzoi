/**
 * Axis objects are bound to create axis lines (paths).
 */
export class Event {
  /**
   * The type of the event.
   */
  public type: string;

  /**
   * The target that dispatched this event.
   */
  public target: Object;

  constructor(eventType: string) {
    this.type = eventType;
  }
}