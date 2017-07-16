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
import {DataRequester} from '../../ts_lib/data-requester';

Polymer({
  is: 'borzoi-app',
  properties: {
    contigsHaveBeenFetched: Boolean,
    camera: Object,
    dataManager: Object,
  },
  ready() {
    // Create a camera and a data manager.
    this.set('camera', new Camera('', 0, 0));
    this.set('dataManager', new DataManager('', 0, ''));

    // This requests data when we need it.
    const dataRequester = new DataRequester(this.camera, this.dataManager);

    // Request contigs.
    const contigLengthsSetHandler = () => {
      // The contigs will only be ever loaded once.
      this.dataManager.removeEventListener(
          'contig_lengths_set', contigLengthsSetHandler);
      this.set('contigsHaveBeenFetched', true);

      // TODO(chizeng): Handle degenerate case of no contigs.

      // Set the camera to the first contig.
      this.camera.setContig(this.dataManager.getAllContigs()[0]);
    };

    // When the contigs are set, we can render subsequences.
    this.dataManager.addEventListener(
        'contig_lengths_set', contigLengthsSetHandler);
    dataRequester.requestContigs();
  },
});