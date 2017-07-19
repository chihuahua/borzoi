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

import {Camera} from '../../ts_lib/camera';
import {DataManager} from '../../ts_lib/data-manager';

Polymer({
  is: 'genome-viewer',
  properties: {
    camera: Object,
    dataManager: Object,
    renderPending: Boolean,
  },
  ready() {
    // When either the camera or data updates, re-render.
    (this.camera as Camera).addEventListener(
        'change', this.scheduleRender.bind(this));
    (this.dataManager as DataManager).addEventListener(
        'change', this.scheduleRender.bind(this));
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
    const camera = this.camera as Camera;
    const dataManager = this.dataManager as DataManager;

    // At a zoom level of 0, place 100px between the centers of base pairs.
    const spacing = Math.floor(100 / Math.pow(2, camera.getZoom()));

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
});