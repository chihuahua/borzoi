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

Polymer({
  is: 'genome-position-indicator',
  properties: {
    camera: Object,
    bpLocation: Number,
    contigs: Array,
    selectedContig: {
      type: String,
      notify: true,
    },
  },
  observers: [
    '_selectedContigChanged(selectedContig)',
  ],
  ready() {
    this.$$('#position-form').addEventListener(
        'submit', this.onFormSubmit.bind(this));

    this.camera.addEventListener(
        'bp_location_changed', this.bpLocationChanged.bind(this));
    this.bpLocationChanged();

    this.camera.addEventListener(
        'contig_changed', this.contigChanged.bind(this));
    this.contigChanged();
  },
  onFormSubmit(event) {
    // Do not submit the form.
    event.preventDefault();

    // Update the camera.
    let targetIndex = parseInt(this.$$('#position-text').value);
    if (isNaN(targetIndex) || targetIndex < 0) {
      // Do not navigate.
      this.$$('#position-text').value = this.camera.getBpLocation();
    } else {
      // Navigate to the destination.
      this.camera.setBpLocation(targetIndex);
    }

    // Do not submit the form.
    return false;
  },
  bpLocationChanged() {
    this.set('bpLocation', this.camera.getBpLocation());
  },
  contigChanged() {
    this.set('selectedContig', this.camera.getContig());
  },
  _selectedContigChanged(selectedContig) {
    this.camera.setContig(selectedContig);
  },
});