/******/ var __webpack_modules__ = ({

/***/ "./src/domain/audio/AudioConstants.ts":
/*!********************************************!*\
  !*** ./src/domain/audio/AudioConstants.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AudioConstants)
/* harmony export */ });
//
//  AudioConstants.ts
//
//  Created by David Rowe on 11 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/*@devdoc
 *  The <code>AudioConstants</code> namespace provides the values of audio constants used in the SDK.
 *  <p>C++: <code>AudioConstants</code></p>
 *
 *  @namespace AudioConstants
 *
 *  @property {number} SAMPLE_RATE - <code>24000</code> - The audio sample rate, in Hz.
 *
 *  @property {number} STEREO - <code>2</code> - The number of audio channels for stereo.
 *
 *  @property {number} NETWORK_FRAME_SAMPLES_STEREO - <code>480</code> - The number of samples in a network packet for a stereo
 *      channel.
 *  @property {number} NETWORK_FRAME_SAMPLES_PER_CHANNEL - <code>240</code> - The number of samples in a network packet per
 *      channel.
 *
 *  @property {number} NETWORK_FRAME_SECS - <code>0.01</code> - The interval between audio network packets, in seconds.
 *  @property {number} NETWORK_FRAME_MSECS - <code>10</code> - The interval between audio network packets, in milliseconds.
 *
 *  @property {number} AUDIO_WORKLET_BLOCK_SIZE - <code>128</code> - The number of frames in and audio worklet audio block.
 */
const AudioConstants = new class {
    // C++  AudioConstants
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    SAMPLE_RATE = 24000;
    STEREO = 2;
    NETWORK_FRAME_SAMPLES_STEREO = 480;
    NETWORK_FRAME_SAMPLES_PER_CHANNEL = 240;
    NETWORK_FRAME_SECS = this.NETWORK_FRAME_SAMPLES_PER_CHANNEL / this.SAMPLE_RATE;
    NETWORK_FRAME_MSECS = this.NETWORK_FRAME_SECS * 1000;
    AUDIO_WORKLET_BLOCK_SIZE = 128; // 128 frames of samples.
}();



/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!****************************************************!*\
  !*** ./src/domain/worklets/AudioInputProcessor.ts ***!
  \****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../audio/AudioConstants */ "./src/domain/audio/AudioConstants.ts");
//
//  AudioInputProcessor.ts
//
//  Created by David Rowe on 23 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>AudioInputProcessor</code> class implements a Web Audio
 *  {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor|AudioWorkletProcessor} that takes incoming Web
 *  Audio and provides it for the SDK to use. It is used as a node in a Web Audio graph in {@link AudioInput}.
 *  <p>It runs on its own thread and buffers incoming samples as needed in order to provide the samples to the SDK in the
 *  required network frame size.</p>
 *  <p>C++: <code>N/A</code></p>
 *  @class AudioInputProcessor
 *  @param {AudioWorkletNodeOptions} options -
 *    {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor|AudioWorkletProcessor}
 *    options.
 *
 *  @property {MessagePort} port - Used to communicate between the AudioWorkletProcessor object and its internal code. See
 *    {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/port|AudioWorkletNode.port}.
 */
class AudioInputProcessor extends AudioWorkletProcessor {
    // FIXME: All these fields should be private (#s) but Firefox is handling transpiled code with them (Sep 2021).
    FLOAT_TO_INT = 32767;
    LITTLE_ENDIAN = true;
    _channelCount;
    _output;
    _outputView;
    _outputSize;
    _outputSampleSize;
    _outputIndex = 0;
    _inputSampleRate;
    _inputFraction = 0.0;
    _inputSampleCount = 0;
    // Downsampling.
    _downsampleRatio = 1.0;
    _inputAccumulator = [0.0, 0.0];
    // Upsampling.
    _upsampleRatio = 1.0;
    _lastInputValues = [0.0, 0.0];
    _processor;
    _haveReportedUpSampleError = false;
    constructor(options) {
        super(options); // eslint-disable-line
        this._channelCount = options?.channelCount ? options.channelCount : 1; // Default to mono.
        this._channelCount = Math.min(this._channelCount, 2); // Mono or stereo output, only.
        this._inputSampleRate = sampleRate;
        if (this._inputSampleRate === _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__["default"].SAMPLE_RATE) {
            this._processor = this._convert;
        }
        else if (this._inputSampleRate > _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__["default"].SAMPLE_RATE) {
            this._processor = this._downsample;
            this._downsampleRatio = _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__["default"].SAMPLE_RATE / this._inputSampleRate; // < 1.0
            this._inputFraction = 0.0;
        }
        else {
            this._processor = this._upsample;
            this._upsampleRatio = this._inputSampleRate / _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__["default"].SAMPLE_RATE; // < 1.0
            this._inputFraction = this._upsampleRatio;
        }
        this._outputSize = this._channelCount === 1
            ? _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__["default"].NETWORK_FRAME_SAMPLES_PER_CHANNEL
            : _audio_AudioConstants__WEBPACK_IMPORTED_MODULE_0__["default"].NETWORK_FRAME_SAMPLES_STEREO;
        this._outputSampleSize = this._outputSize / this._channelCount;
        this._output = new Int16Array(this._outputSize);
        this._outputView = new DataView(this._output.buffer);
        this.port.onmessage = this.onMessage;
    }
    /*@devdoc
     *  Acts upon commands posted to the audio worklet's message port.
     *  @function AudioInputProcessor.onMessage
     *  @param {MessageEvent} message - The message posted to the audio worklet, with <code>message.data</code> being a string
     *      signifying the command. The following command is expected:
     *      <p><code>"clear"</code>: Clear the audio sample buffer.</p>
     */
    onMessage = (message) => {
        if (message.data === "clear") {
            this._resetInput();
            this._resetOutput();
        }
    };
    /*@devdoc
     *  Called by the Web Audio pipeline to handle the next block of input audio samples, converting them to int16 samples at a
     *  24000Hz sample rate and outputting them 240 frames at a time by posting a message on the AudioWorkletProcessor port.
     *  @param {Float32Array[][]} inputList - Input PCM audio samples. An array of inputs, each of which is an array of
     *      channels, each of which has 128 float32 samples in the range <code>-1.0</code> &ndash; <code>1.0</code>.
     *  @param {Float32Array[][]} outputList - Output PCM audio samples. <em>Not used.</em>
     *  @param {Record<string, Float32Array>} parameters - Processing parameters. <em>Not used.</em>
     *  @returns {boolean} <code>true</code> to keep the processor node alive.
     */
    // eslint-disable-next-line
    // @ts-ignore
    process(inputList /* , outputList: Float32Array[][], parameters: Record<string, Float32Array> */) {
        if (!inputList || !inputList[0] || !inputList[0][0] || this._channelCount === 2 && !inputList[0][1]) {
            return true;
        }
        this._processor(inputList[0]);
        return true;
    }
    _resetOutput() {
        this._output = new Int16Array(this._outputSize);
        this._outputView = new DataView(this._output.buffer);
        this._outputIndex = 0;
    }
    _resetInput() {
        this._inputSampleCount = 0;
        this._inputFraction = 0.0;
        this._inputAccumulator = [0.0, 0.0];
        // Do not reset this._lastInputValue.
    }
    _convert = (input) => {
        // A straight conversion from float32 to int16 values, posting the output buffer when full.
        const BYTES_PER_INT16_SAMPLE = 2;
        const BYTES_PER_INT16_FRAME = this._channelCount * BYTES_PER_INT16_SAMPLE;
        for (let i = 0, inputSize = input[0].length; i < inputSize; i++) {
            const rawIndex = this._outputIndex * BYTES_PER_INT16_FRAME;
            for (let channel = 0; channel < this._channelCount; channel++) {
                const inputSample = input[channel][i];
                const rawChannel = channel * BYTES_PER_INT16_SAMPLE;
                this._outputView.setInt16(rawIndex + rawChannel, inputSample * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
            }
            this._outputIndex += 1;
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }
        }
    };
    _downsample = (input) => {
        // A simple low-pass filter that assigns proportions of each input sample to output samples, posting the output buffer
        // when full. Values are resynchronized every second to avoid error accumulation.
        const BYTES_PER_INT16_SAMPLE = 2;
        const BYTES_PER_INT16_FRAME = this._channelCount * BYTES_PER_INT16_SAMPLE;
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        for (let i = 0, inputSize = input[0].length; i < inputSize; i++) {
            this._inputSampleCount += 1;
            if (this._inputFraction + this._downsampleRatio < 1.0 && this._inputSampleCount !== this._inputSampleRate) {
                // End of input sample < end of output sample, provided that it's not the final sample in a second (avoid
                // possible accumulated error condition).
                for (let channel = 0; channel < this._channelCount; channel++) {
                    // Add whole of input to input accumulator.
                    this._inputAccumulator[channel] += input[channel][i];
                    this._inputFraction += this._downsampleRatio;
                }
            }
            else {
                // End of input sample >= end of output sample, or final sample of a second.
                const rawIndex = this._outputIndex * BYTES_PER_INT16_FRAME;
                for (let channel = 0; channel < this._channelCount; channel++) {
                    // Add proportion of input to input accumulator.
                    const proportion = (1 - this._inputFraction) / this._downsampleRatio;
                    const value = input[channel][i];
                    this._inputAccumulator[channel] += proportion * value;
                    // Convert and write output.
                    const rawChannel = channel * BYTES_PER_INT16_SAMPLE;
                    this._outputView.setInt16(rawIndex + rawChannel, this._inputAccumulator[channel] * this._downsampleRatio * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
                    // Set input accumulator to remainder of input.
                    const remainder = 1.0 - proportion;
                    this._inputFraction = remainder * this._downsampleRatio;
                    this._inputAccumulator[channel] = remainder * value;
                }
                this._outputIndex += 1;
            }
            // Post output if buffer full.
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }
            // Reset input each second to avoid accumulated errors.
            if (this._inputSampleCount === this._inputSampleRate) {
                this._resetInput();
            }
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
        }
    };
    _upsample = (input) => {
        // A simple linear interpolation resampler, posting the output buffer when full. Values are resynchronized every second
        // to avoid error accumulation.
        const BYTES_PER_INT16_SAMPLE = 2;
        const BYTES_PER_INT16_FRAME = this._channelCount * BYTES_PER_INT16_SAMPLE;
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const inputSize = input[0].length;
        let inputIndex = 0;
        let inputValues = [];
        for (let channel = 0; channel < this._channelCount; channel++) {
            inputValues.push(input[channel][0]);
        }
        // Process input into output.
        while (inputIndex < inputSize) {
            // Calculate output value = last-input-value + fraction * (this-input-value - last-input-value).
            const rawIndex = this._outputIndex * BYTES_PER_INT16_FRAME;
            for (let channel = 0; channel < this._channelCount; channel++) {
                const rawChannel = channel * BYTES_PER_INT16_SAMPLE;
                const lastValue = this._lastInputValues[channel];
                const nextValue = inputValues[channel];
                this._outputView.setInt16(rawIndex + rawChannel, lastValue + this._inputFraction * (nextValue - lastValue) * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
            }
            this._outputIndex += 1;
            // Post output if buffer full.
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }
            this._inputFraction += this._upsampleRatio;
            if (this._inputFraction > 1.0) {
                // Advance to the next pair of inputs.
                this._lastInputValues = inputValues;
                inputIndex += 1;
                if (inputIndex < inputSize) {
                    this._inputSampleCount += 1;
                    inputValues = [];
                    for (let channel = 0; channel < this._channelCount; channel++) {
                        inputValues.push(input[channel][inputIndex]);
                    }
                }
                this._inputFraction -= 1.0;
            }
            // Reset input each second to avoid accumulated errors.
            if (this._inputSampleCount === this._inputSampleRate) {
                this._resetInput();
            }
        }
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    };
}
registerProcessor("vircadia-audio-input-processor", AudioInputProcessor);

})();


//# sourceMappingURL=vircadia-audio-input.js.map