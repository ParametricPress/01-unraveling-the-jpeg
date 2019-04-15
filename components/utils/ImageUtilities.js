
var ace = require('brace');
var {fastDctLee} = require('./FastDct');
require('brace/mode/assembly_x86');
require('brace/theme/monokai');
require('brace/ext/searchbox');


// Polyfill for browsers besides chrome and firefox,
// taken from https://dev.to/nektro/createimagebitmap-polyfill-for-safari-and-edge-228
if (typeof window !== 'undefined' && !('createImageBitmap' in window)) {
	window.createImageBitmap = function(blob) {
		return new Promise((resolve, reject) => {
			let img = document.createElement('img');
			img.addEventListener('load', function() {
				resolve(this);
			});
			img.src = URL.createObjectURL(blob);
		});
	}
}

function pad(array) {
	// Pad an array with 0's to reach a power of 2 length.
	let nextPowerOf2 = 2 ** Math.ceil(Math.log2(array.length));
	for (let i = array.length; i < nextPowerOf2; i++) {
		array.push(0);
	}
	return array;
}

// Extracts the R, G, or B component from image data.
function extractComponentFromPixelData(pixelData, componentName) {
	let index = 0;
	if (componentName == 'G') index = 1;
	if (componentName == 'B') index = 2;

	let values = [];

	for (let i = 0; i < pixelData.length; i+= 4) {
		values.push(pixelData[i + index]);
	}

	return values;
}

// Fills the given image data's component with new values
function fillPixelData(pixelData, componentName, values) {
	let index = 0;
	if (componentName == 'G') index = 1;
	if (componentName == 'B') index = 2;

	let count = 0;

	for (let i = 0; i < pixelData.length; i+= 4) {
		pixelData[i + index] = values[count];
		count ++;
	}
}

function clampTo8bit(a) {
	return a < 0 ? 0 : a > 255 ? 255 : a;
}

let corruptedCache = {};

let componentMap = {
	'Y' : 0,
	'Cb' : 1,
	'Cr' : 2
}

function subsampleComponent(component, scale, width, height) {
	let biggerDimension = width > height ? width : height;
	if (scale > biggerDimension) scale = biggerDimension;

	for (let y = 0; y < height; y+= scale) {
		for (let x = 0; x < width; x+= scale) {
			// Compute the average of this block of pixels
			let sum = 0;
			let count = 0;
			for (let y_inner = 0; y_inner < scale; y_inner ++) {
				for (let x_inner = 0; x_inner < scale; x_inner++) {
					let finalX = x + x_inner;
					let finalY = y + y_inner;

					if (finalX > width - 1) finalX = width - 1;
					if (finalY > height - 1) finalY = height - 1;

					sum += component[0 | (finalY * width + finalX)];
					count ++;
				}
			}
			// Set all the pixels to this average
			let avg = sum / count;
			for (let y_inner = 0; y_inner < scale; y_inner ++) {
				for (let x_inner = 0; x_inner < scale; x_inner++) {
					let finalX = x + x_inner;
					let finalY = y + y_inner;

					if (finalX > width - 1) finalX = width - 1;
					if (finalY > height - 1) finalY = height - 1;

					component[0 | (finalY * width + finalX)] = avg;
				}
			}
		}
	}

	return component;
}

function getHeaderAndBody(buffer) {
	let data = {
		header : [],
		body: []
	};

	let bytes = new Uint8Array(buffer);
	let isBody = false;
	for (let i = 0; i < bytes.length; ++i) {
		// Start is FFDA (255 218)
		// End is FFD9 (255 217)
		// If there exists a thumbnail, it will trip this up
		// Maybe find a way to check for a thumbnail and ignore it?
		if (i < bytes.length - 1 && bytes[i] == 255 && bytes[i+1] == 218) {
			isBody = true;
		}

		if (isBody) {
			data.body.push(bytes[i]);
		} else {
			data.header.push(bytes[i]);
		}
	}

	return data;
}

class ImageUtilities {
	constructor(options) {
		let url = options.url;
		let that = this;
		this.editMode = options.editMode;
		this.corruptedImage = options.corruptedImage;
		this.imageWidth = 0;
		this.imageHeight = 0;
		this.showHeader = options.showHeader;

		this.savedComponents = {};

		if (this.showHeader == undefined) {
			this.showHeader = true;
		}

		if (this.corruptedImage == undefined) {
			this.corruptedImage = 'corrupted.png';
		}
		// Load the corrupted image from the cache if it exists.
		if (corruptedCache[this.corruptedImage]) {
			this.corruptedImage = corruptedCache[this.corruptedImage];
		} else {
			fetch('static/images/' + this.corruptedImage)
			.then(function(response) {
				return response.blob();
			})
			.then(function(blob) {
				return createImageBitmap(blob);
			})
			.then(function(imageBitmap) {
				corruptedCache[that.corruptedImage] = imageBitmap;
				that.corruptedImage = imageBitmap;
			})
			.catch(function(error) {
				console.log("Error creating corrupted image", error);
			})
		}

		this.highlightPixelOnClick = options.highlightPixelOnClick;

		this.readyPromise = fetch(url)
			.then(function(response) {
				return response.arrayBuffer();
			})
			.then(function(buffer) {
				if (that.editMode == 'raw') {
					let data = getHeaderAndBody(buffer);
					that.body = data.body;
					that.header = data.header;
					if (that.showHeader) {
						that.totalBytes = that.header.concat(that.body);
					} else {
						that.totalBytes = that.body;
					}

				} else {
					that.decodedImage = jpeg.decode(buffer, { useTArray:true });
					that.imageWidth = that.decodedImage.width;
					that.imageHeight = that.decodedImage.height;
				}
			})
			.catch(function(error) {
				console.log(error)
			});
	}

	fillDecodedComponent(componentName, values) {
		let component = this.decodedImage._decoder.components[componentMap[componentName]];
		let index = 0;
		for (let i = 0; i < component.lines.length; i++) {
			let line = component.lines[i];
			for (let j = 0; j < line.length; j++) {
				line[j] = values[index];
				index ++;
			}
		}
	}

	subsampleAndRedraw(componentName, scale) {
		if (componentName == 'Y' || componentName == 'Cb' || componentName == 'Cr') {
			let component = this.savedComponents[componentName];
			if (component == undefined) {
				component = this.getDecodedComponent(componentName);
				this.savedComponents[componentName] = component.slice();
			}
			component = component.slice();

			if (scale == 0) {
				for (let i = 0; i < component.length; i++) {
					let defaultVal = 128;

					component[i] = defaultVal;
				}
			} else {
				// TODO make sure to pass the right width and height here if the component is downsampled already?
				component = subsampleComponent(component, scale, this.decodedImage.width, this.decodedImage.height);
			}

			this.fillDecodedComponent(componentName, component);

			let decodedImage = this.decodedImage;
			decodedImage._decoder.copyToImageData({
				width: decodedImage.width,
				height: decodedImage.height,
				data: decodedImage.data
			});

			this.drawDecodedImage();
		} else if (componentName == 'R' || componentName == 'G' || componentName == 'B') {
			let decodedImage = this.decodedImage;
			let dataCopy = decodedImage.data.slice();
			let component = extractComponentFromPixelData(dataCopy, componentName);

			if (scale == 0) {
				for (let i = 0; i < component.length; i++) {
					component[i] = 0;
				}
			} else {
				component = subsampleComponent(component, scale, decodedImage.width, decodedImage.height);
			}

			fillPixelData(dataCopy, componentName, component);
			this.drawPixelData(dataCopy, decodedImage.width, decodedImage.height);
		}
	}

	onEditorChange() {
		if (this.editMode == 'raw') {
			// Update the body, since it's the only thing in the editor right now
			let values  = this.getValuesFromEditor();
			this.totalBytes = values;
			if (!this.showHeader) {
				this.totalBytes = this.header.concat(values);
			}
			this.drawRawBytes();
		}

		if (this.editMode == 'chroma') {
			// Extract components, each (scale) numbers is Y, then Cb and Cr.
			let scale = this.scale;
			let values  = this.getValuesFromEditor();
			let Y = [];
			let Cb = [];
			let Cr = [];
			for (let i = 0; i < values.length; i+= scale + 2) {
				for (let j = 0; j < scale; j++) {
					Y.push(values[i + j])
				}
				Cb.push(values[i + scale])
				Cr.push(values[i + scale + 1]);
			}

			// To draw these components, we copy them back into the decoded image
			// and redraw it.
			this.fillDecodedComponent('Y', Y);
			this.fillDecodedComponent('Cb', Cb);
			this.fillDecodedComponent('Cr', Cr);

			let decodedImage = this.decodedImage;

			decodedImage._decoder.copyToImageData({
				width: decodedImage.width,
				height: decodedImage.height,
				data: decodedImage.data
			});
			this.drawDecodedImage();
		}

		if (this.editMode == 'full-dctLuminance') {
			let values = this.getValuesFromEditor();

			if (this.numberOfCoefficients != undefined) {
				// Fill in missing numbers with 0.
				// This allows the user to easily 0 out chunks at the bottom by deleting them.
				for (let i = values.length; i < this.numberOfCoefficients; i++) {
					values[i] = 0;
				}
			}

			values = this.inverseDct(values);
			this.drawLuminance(values, this.decodedImage.width, this.decodedImage.height);
		}

		if (this.editMode == 'dctLuminance') {
			// Put the edited coefficients back into the image.
			// In the editor, each block MUST be on its own line
			let text = this.editor.getSession().getValue();
			let editorBlocks = text.trim().split('\n');
			let rawYBlocks = this.decodedImage._decoder.frames[0].components[componentMap['Y'] + 1].blocks;
			let Yblocks = [];
			for (let i = 0; i < rawYBlocks.length; i++) {
				for (let j = 0; j < rawYBlocks[i].length; j++) {
					Yblocks.push(rawYBlocks[i][j]);
				}
			}

			for (let i = 0; i < Yblocks.length; i++) {
				let block = '';
				if (i <= editorBlocks.length - 1) block = editorBlocks[i];
				let Yblock = Yblocks[i];
				let values = block.trim().split(' ');
				for (let j = 0; j < 64; j++) {
					let val = 0;
					if (j <= values.length - 1) val = Number(values[j]);
					Yblock[j] = val;
				}
			}

			this.reEncodeImage();
			this.drawDecodedImage();
		}

		if (this.editMode == 'justY' || this.editMode == 'justCb' || this.editMode == 'justCr') {
			let components = ['Cb', 'Cr'];
			if (this.editMode == 'justCb') components = ['Y', 'Cr'];
			if (this.editMode == 'justCr') components = ['Y', 'Cb'];

			for (let comp of components) {
				let rawBlocks = this.decodedImage._decoder.frames[0].components[componentMap[comp] + 1].blocks;
				for (let i = 0; i < rawBlocks.length; i++) {
					for (let j = 0; j < rawBlocks[i].length; j++) {
						rawBlocks[i][j] = 0;
					}
				}
			}

			this.reEncodeImage();
			this.drawDecodedImage();
		}

		if (this.editMode == 'dctBlue' || this.editMode == 'dctRed') {
			let text = this.editor.getSession().getValue();
			let editorBlocks = text.trim().split('\n');
			let component = this.editMode == 'dctBlue' ? 'Cb' : 'Cr';
			let rawBlocks = this.decodedImage._decoder.frames[0].components[componentMap[component] + 1].blocks;
			let blocks = [];
			for (let i = 0; i < rawBlocks.length; i++) {
				for (let j = 0; j < rawBlocks[i].length; j++) {
					blocks.push(rawBlocks[i][j]);
				}
			}

			if (blocks.length != editorBlocks.length) {
				// TODO: Maybe make up the rest by filling with 0's?
				console.error("Expected", blocks.length, "blocks. Found", editorBlocks.length + ".");
			}

			for (let i = 0; i < editorBlocks.length; i++) {
				let block = editorBlocks[i];
				let originalBlock = blocks[i];
				let values = block.trim().split(' ');
				for (let j = 0; j < 64; j++) {
					originalBlock[j] = Number(values[j])
				}
			}

			this.reEncodeImage();
			this.drawDecodedImage();
		}

		// Update byte counter
		this.updateByteCounter();
	}

	updateByteCounter() {
		if (this.byteCounter == undefined) return;
		let values  = this.getValuesFromEditor();
		this.byteCounter.innerHTML = "Size: " + (values.length / 1000).toFixed(2) + " kb.";
		this.byteCounter.innerHTML += " Dimensions: " + this.imageWidth + " x " + this.imageHeight;
	}

	reEncodeImage() {
		let decodedImage = this.decodedImage;

		decodedImage._decoder.components = [];
		let frame = decodedImage._decoder.frames[0];
		for (var i = 0; i < frame.componentsOrder.length; i++) {
			var component = frame.components[frame.componentsOrder[i]];
			decodedImage._decoder.components.push({
			  lines: decodedImage._decoder.buildComponentData(frame, component),
			  scaleX: component.h / frame.maxH,
			  scaleY: component.v / frame.maxV
			});
		}
		decodedImage._decoder.copyToImageData({
			width: decodedImage.width,
			height: decodedImage.height,
			data: decodedImage.data
		});

		this.imageWidth = decodedImage.width;
		this.imageHeight = decodedImage.height;
		this.updateByteCounter();
	}

	getLineLength() {
		return this.editor.getSession().getValue().trim().split('\n')[0].length;
	}

	getValuesFromEditor(overrideText) {
		// Takes the text in the editor and converts it to an array of numbers.
		let text = overrideText;
		if (text == undefined) {
			text = this.editor.getSession().getValue();
		}
		let lines = text.trim().split('\n');
		let values = [];
		for (let line of lines) {
			let characters = line.trim().split(' ');
			for (let char of characters) {
				values.push(Number(char));
			}
		}

		return values;
	}

	setResetText(text) {
		this.resetText = text;
		this.resetButton.onclick = function(event) {
			let instance = event.target.editorInstance;
			instance.currentValues = instance.finalValues;// Resets the DCT animations
			instance.editor.setValue(instance.resetText, -1);

			if (window.currentInterval) {
	          clearInterval(window.currentInterval);
	          window.currentInterval = undefined;
	        }
		}
	}

	putValuesInEditor(values, linebreakIndex, useForReset) {
		// Puts the values separated by space, and optionally line breaks, in the editor
		let text = '';
		if (linebreakIndex == undefined) linebreakIndex = -1;

		for (let i = 0; i < values.length; i ++) {
			if (linebreakIndex != -1 && i != 0 && i % linebreakIndex == 0) {
				text += '\n';
			}
			text += values[i] + ' ';
		}

		if (useForReset) {
			this.setResetText(text);
		}

		this.editor.setValue(text, -1);
	}

	createImageEditor(containerElement) {

		let outerContainer = containerElement;

		/**
		 * Control bar section
		 */
		let headerContainerElement = document.createElement('div');
		headerContainerElement.className = 'image-editor-header';
		outerContainer.appendChild(headerContainerElement);

		// Size counter
		this.byteCounter = document.createElement('div');
		this.byteCounter.innerHTML = "Size: 0 kb";

		// Reset button
		let resetContainer = document.createElement('div');
		this.resetButton = document.createElement('button');
		resetContainer.appendChild(this.resetButton);
		this.resetButton.innerHTML = 'Reset';
		this.resetButton.editorInstance	= this;

		// Title
		this.editorTitle = document.createElement('div');
		this.editorTitle.innerHTML = 'JPEG Editor';

		headerContainerElement.appendChild(resetContainer);
		headerContainerElement.appendChild(this.editorTitle);
		headerContainerElement.appendChild(this.byteCounter);

		/**
		 * Content section
		 */
		containerElement = document.createElement('div');
		containerElement.className = 'image-editor';
		outerContainer.appendChild(containerElement);


		// Create ace editor
		let editorContainer = document.createElement('div');
		editorContainer.className = 'byte-editor';


		let editorElement = document.createElement('div');
		editorContainer.appendChild(editorElement);
		editorElement.className = 'ace-editor';
		containerElement.appendChild(editorContainer);


		let editor = ace.edit(editorElement, {
			useWorker: false
		});

		this.editor = editor;
		let that = this;
		editor.setTheme("ace/theme/monokai");
		editor.session.setMode("ace/mode/assembly_x86");
		editor.getSession().setUseWrapMode(true);
		editor.getSession().on('change', function() {
			if (editor.getValue().length == 0)
				return;
			that.onEditorChange();
		});
		// Create canvas
		let viewerElement = document.createElement('div');
		let canvas = document.createElement('canvas');
		this.canvas = canvas;
		viewerElement.appendChild(canvas);
		containerElement.appendChild(viewerElement);
		viewerElement.className = 'image-viewer';

		if (this.highlightPixelOnClick) {
			canvas.editor = this.editor;
			canvas.addEventListener("click", function(event) {
				var rect = event.target.getBoundingClientRect();
				var x = event.clientX - rect.left; //x position within the element.
				var y = event.clientY - rect.top;  //y position within the element.

				// Need to know which component, to get the scale.
				let componentData = that.decodedImage._decoder.frames[0].components[componentMap['Y'] + 1];// Hardcoded to 'Y';
				let scale = 1; // You can compute the scale for a component by doing
				// scaleX: component.h / frame.maxH
				// scaleY: component.v / frame.maxV

				// Then divide x and y by 8
				x /= 8; y/= 8;
				x /= scale; y/= scale;
				let cssScaleX = canvas.width / canvas.offsetWidth;
    			let cssScaleY = canvas.height / canvas.offsetHeight;
    			x *= cssScaleX;
    			y *= cssScaleY;

				// Then the line no is x * blocksPerLine + y * blocksPerColumn
				let lineNo = Math.floor(x) + Math.floor(y) * componentData.blocksPerLine;
				event.target.editor.scrollToLine(lineNo);
			});
		}

		// let clearDiv = document.createElement('div');
		// clearDiv.style = 'clear:both;';
		// containerElement.appendChild(clearDiv);
	}

	drawRawBytes() {
			const byteArray = new Uint8Array(this.totalBytes);
			// Take the header and body bytes and draw them.
			//const byteArray = new Uint8Array((this.header + ',' + this.body).split(',').map(parseFloat));
    	let blob = new Blob([byteArray.buffer], {type: 'image/jpeg'});
    	let that = this;

			createImageBitmap(blob)
    	.then(function(imageBitmap) {
    		let canvas = that.canvas;
    		canvas.width = imageBitmap.width;
				canvas.height = imageBitmap.height;

				that.imageWidth = imageBitmap.width;
				that.imageHeight = imageBitmap.height;
				that.updateByteCounter();

    		let ctx = canvas.getContext('2d');
    		ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
    	})
    	.catch(function(error) {
				console.log(error);
    		let canvas = that.canvas;
    		let ctx = canvas.getContext('2d');
    		let corruptedImage = that.corruptedImage;
    		ctx.drawImage(corruptedImage, 0, 0, canvas.width, canvas.height);
    	})
	}

	drawPixelData(pixelData, width, height) {
		let canvas = this.canvas;
		canvas.width = width;
		canvas.height = height;
		let ctx = canvas.getContext('2d');
		let imageData = new ImageData(new Uint8ClampedArray(pixelData), width, height);
		ctx.putImageData(imageData, 0, 0);
	}

	drawDecodedImage(mode) {
		let canvas = this.canvas;
		let image = this.decodedImage;

		canvas.width = image.width;
		canvas.height = image.height;
		this.imageWidth = image.width;
		this.imageHeight = image.height;
		this.updateByteCounter();

		var ctx = canvas.getContext('2d');
		var imageData = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);

		if (mode != undefined) {
			let indices = [1, 2];
			if (mode == 'justG') {
				indices = [0, 2];
			} else if (mode == 'justB') {
				indices = [0, 1];
			}

			for (let i = 0; i < image.data.length; i+= 4) {
				for (let index of indices) image.data[i+index] = 0;
			}
			imageData = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
		}

		ctx.putImageData(imageData, 0, 0);
	}

	drawYCbCr(Y, Cb, Cr) {
		let width = this.imageWidth;
		let height = this.imageHeight;
		let pixels = new Uint8ClampedArray(width * height * 4);

		for(let i = 0; i < Y.length; i++) {
			let index = i * 4;
			let rgb = this.ycbcrToRgb(Y[i], Cb[i], Cr[i]);
			pixels[index] = rgb.R;
			pixels[index + 1] = rgb.G;
			pixels[index + 2] = rgb.B;
			pixels[index + 3] = 255;
		}

		let canvas = this.canvas;
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		var imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
		ctx.putImageData(imageData, 0, 0);
	}

	drawLuminance(yValues, width, height) {
		let canvas = this.canvas;

		canvas.width = width;
		canvas.height = height;
		this.imageWidth = canvas.width;
		this.imageHeight = canvas.height;
		this.updateByteCounter();
		var ctx = canvas.getContext('2d');
		var pixels = new Uint8ClampedArray(width * height * 4);

		for (let i = 0; i < yValues.length; i++) {
			let index = i * 4;
			let Y = yValues[i];
			pixels[index] = Y;
			pixels[index + 1] = Y;
			pixels[index + 2] = Y;
			pixels[index + 3] = 255;
		}

		var imageData = new ImageData(pixels, width, height);
		ctx.putImageData(imageData, 0, 0);
	}

	rgbToYcbcr(r, g, b) {

	}

	ycbcrToRgb(Y, Cb, Cr) {
		let R = clampTo8bit(Y + 1.402 * (Cr - 128));
		let G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
		let B = clampTo8bit(Y + 1.772 * (Cb - 128));
		return {R:R, G:G, B:B};
	}

	fill(array, value, start, end) {
		if (value == undefined) value = 0;
		if (start == undefined) start = 0;
		if (end == undefined) end = array.length;

		for (let i = start; i < end; i++) {
			array[i] = value;
		}

		return array;
	}

	getDecodedComponent(component) {
    	let lines = this.decodedImage._decoder.components[componentMap[component]].lines;
		let values = [];
		for (let i = 0; i < lines.length; i++) {
			//if ( i >= this.decodedImage.height) break; // Account for byte stuffing?
			for (let j = 0; j < lines[i].length; j++) {
				//if (j >= this.decodedImage.width) break;
				values.push(lines[i][j])
			}
		}
		return values;
	}

	getDctComponent(component) {
		let blocks = this.decodedImage._decoder.frames[0].components[componentMap[component] + 1].blocks;
		let values = [];
		for (let i = 0; i < blocks.length; i++) {
			for (let j = 0; j < blocks[i].length; j++) {
				for (let k = 0; k < blocks[i][j].length; k++) {
					values.push(blocks[i][j][k]);
				}
			}
		}

		return values;
	}

	forwardDct(values, round) {
		// Takes an array of length n^2 and returns n^2 unscaled DCT coefficients that represent these values.
		// If the given array is not of length n^2, it will be padded with 0's.
		let valuesCopy = values.slice(0, values.length);
		pad(valuesCopy);

		fastDctLee.transform(valuesCopy);
		if (round) {
			for (let i = 0; i < valuesCopy.length; i++) {
				valuesCopy[i] = Math.round(valuesCopy[i]);
			}
		}
		return valuesCopy;
	}

	inverseDct(coefficients) {
		// Takes an array of n^2 coefficients, and reconstructs the original n^2 values.
		// If the given array is not of length n^2, it will be padded with 0's.
		var coefficientsCopy = coefficients.slice(0, coefficients.length);
		pad(coefficientsCopy);

		fastDctLee.inverseTransform(coefficientsCopy);
		// Scale back the numbers
		let scale = coefficientsCopy.length / 2;
		for (let i = 0; i < coefficientsCopy.length; i++) {
			coefficientsCopy[i] /= scale;
			// Round the numbers for aesthetic reasons. This is a lossy step.
			coefficientsCopy[i] = Math.round(coefficientsCopy[i]);
		}

		return coefficientsCopy;
	}
}

module.exports = ImageUtilities;