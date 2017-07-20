/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Drag} from '../../ts_lib/drag';

Polymer({
  is: 'genome-viewer',
  properties: {
    camera: Object,
    dataManager: Object,

    // A drag object for the drag currently going on. Null if none.
    drag: Object,

    renderPending: Boolean,
    spacingAtZoom0: {
      type: Number,
      value: 100,
      readOnly: true,
    }
  },
  ready() {
    // When either the camera or data updates, re-render.
    this.camera.addEventListener('change', this.scheduleRender.bind(this));
    this.dataManager.addEventListener('change', this.scheduleRender.bind(this));

    // When the user mouses down, start a drag.
    this.$$('#viewer-container').addEventListener(
        'mousedown', this._handleMouseDown.bind(this));
  },
  attached() {
    // Render once after attaching (when we know the width).
    this.scheduleRender();
  },
  scheduleRender() {
    if (this.renderPending) {
      // We have already scheduled a render.
      return;
    }

    this.renderPending = true;
    requestAnimationFrame(() => {
      this.renderPending = false;
      this.render();
    });
  },
  render() {
    if (this.drag) {
      // If a drag is occuring, always schedule a subsequent frame.
      this.scheduleRender();

      // Possibly update the camera based on a viewport throw.
      this.drag.possiblyHandleViewportThrow();
    }

    const camera = this.camera;
    const dataManager = this.dataManager;

    // Space the centers of base pairs.
    const spacing = this._computePixelsPerBasePair();

    // Convert the current base pair location to pixel space.
    const currentPixelSpaceLocation = camera.getBpLocation() * spacing;

    // Start rendering 100px before starting.
    var renderingBpIndex = Math.floor(
        (currentPixelSpaceLocation - 100) / spacing);
    const startingRenderingPixels = renderingBpIndex * spacing;

    // Compute the first pixel location at which to start rendering base pairs.
    this.customStyle['--base-pair-spacing'] = spacing + 'px';
    var pixelOffset = startingRenderingPixels - currentPixelSpaceLocation;
    // The characters are center-aligned.
    pixelOffset -= spacing / 2;
    this.customStyle['--viewer-container-indentation'] =
        '' + pixelOffset + 'px';

    // Clear any previous base pairs.
    this.$$('#viewer-container').innerHTML = '';

    // Re-render the base pairs.
    const bufferedViewerWidth = 100 + this.$$('#viewer-container').clientWidth;
    while (pixelOffset < bufferedViewerWidth) {
      const basePairContainer = document.createElement('div');
      basePairContainer.setAttribute('class', 'base-pair-container');

      // Print the letter of the base pair.
      const basePairText = document.createElement('div');
      basePairText.setAttribute('class', 'base-pair-text');
      basePairText.textContent = dataManager.getBasePair(
          camera.getContig(), renderingBpIndex);
      basePairContainer.appendChild(basePairText);

      // TODO(chizeng): At deep zooms, do not always print the index.

      // Print the index of the base pair.
      const basePairIndexText = document.createElement('div');
      basePairIndexText.setAttribute('class', 'base-pair-index-text');
      basePairIndexText.textContent = String(renderingBpIndex);
      basePairContainer.appendChild(basePairIndexText);

      Polymer.dom(this.$$('#viewer-container')).appendChild(basePairContainer);

      pixelOffset += spacing;
      renderingBpIndex += 1
    }

    this.updateStyles();
  },
  _computePixelsPerBasePair() {
    return Math.floor(this.spacingAtZoom0 / Math.pow(2, this.camera.getZoom()));
  },
  _handleMouseDown(mouseDownEvent) {
    if (this.drag) {
      // A drag is already happening. Cancel it. Maybe the user moused out of
      // the browser and then moused up, so we did not detect the end of a drag.
      this.drag.cancel();
    }

    // Start a new drag.
    this.drag = new Drag(
        this.camera,
        this.dataManager,
        mouseDownEvent.pageX,
        this._computePixelsPerBasePair());

    // Set to null after drag ends.
    this.drag.addEventListener('ended', () => {
      this.drag = null;
    });
  },
});