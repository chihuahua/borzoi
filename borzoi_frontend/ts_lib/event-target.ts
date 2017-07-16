import {Event} from './event';

/**
 * Dispatches events.
 */
export class EventTarget {
  /**
   * A mapping from event type to a list of listeners.
   */
  private listeners: {[key: string]: Function[]}

  constructor() {
    this.listeners = {};
  }

  addEventListener(eventType: string, callback: Function) {
    if (!(eventType in this.listeners)) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  removeEventListener(eventType: string, callback: Function) {
    if (!(eventType in this.listeners)) {
      return;
    }
    var stack = this.listeners[eventType];
    for (var i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback){
        stack.splice(i, 1);
        return;
      }
    }
  }

  dispatchEvent(event: Event) {
    var stack = this.listeners[event.type];
    event.target = this;
    for (var i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event);
    }
  }
}