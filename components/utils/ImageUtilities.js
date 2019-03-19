
var ace = require('brace');
var {fastDctLee} = require('./FastDct');
require('brace/mode/assembly_x86');
require('brace/theme/monokai');

function pad(array) {
	// Pad an array with 0's to reach a power of 2 length.
	let nextPowerOf2 = 2 ** Math.ceil(Math.log2(array.length));
	for (let i = array.length; i < nextPowerOf2; i++) {
		array.push(0);
	}
	return array;
}

let componentMap = {
	'Y' : 0,
	'Cb' : 1,
	'Cr' : 2
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
		this.highlightPixelOnClick = options.highlightPixelOnClick;

    console.log('initing', url);
		this.readyPromise = fetch(url)
			.then(function(response) {
        console.log('fetched');
				return response.arrayBuffer();
			})
			.then(function(buffer) {
        console.log('got the buffer');
				if (that.editMode == 'raw') {
          console.log('raw edit mode');
					let data = getHeaderAndBody(buffer);
					that.body = data.body;
					that.header = data.header;
				} else {
          console.log('normal edit mode');
          that.decodedImage = jpeg.decode(buffer, { useTArray:true });
          console.log(that.decodedImage)
          console.log('decoded');
				}
			})
			.catch(function(error) {
				console.log(error)
			});
	}

	onEditorChange() {
		if (this.editMode == 'raw') {
			// Update the body, since it's the only thing in the editor right now
			let values  = this.getValuesFromEditor();
			this.body = values;
			this.drawRawBytes();
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

			if (Yblocks.length != editorBlocks.length) {
				// TODO: Maybe make up the rest by filling with 0's?
				console.error("Expected", Yblocks.length, "blocks. Found", editorBlocks.length + ".");
			}

			for (let i = 0; i < editorBlocks.length; i++) {
				let block = editorBlocks[i];
				let Yblock = Yblocks[i];
				let values = block.trim().split(' ');
				for (let j = 0; j < 64; j++) {
					Yblock[j] = Number(values[j])
				}
			}

			this.reEncodeImage();
			this.drawDecodedImage();
		}

		if (this.editMode == 'dctBlue') {
			let text = this.editor.getSession().getValue();
			let editorBlocks = text.trim().split('\n');
			let rawBlocks = this.decodedImage._decoder.frames[0].components[componentMap['Cb'] + 1].blocks;
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
	}

	reEncodeImage() {
    console.log('re-encoding component');
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
	}

	getLineLength() {
		return this.editor.getSession().getValue().trim().split('\n')[0].length;
	}

	getValuesFromEditor() {
		// Takes the text in the editor and converts it to an array of numbers.
		let text = this.editor.getSession().getValue();
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
			this.resetText = text;
			this.resetButton.onclick = function(event) {
				let instance = event.target.editorInstance;
				instance.editor.setValue(instance.resetText, -1);
			}
		}

		this.editor.setValue(text, -1);
	}

	createImageEditor(containerElement) {

    let outerContainer = containerElement;
    containerElement = document.createElement('div');
    containerElement.className = 'image-editor';
    outerContainer.appendChild(containerElement);

		// Create ace editor
		let editorContainer = document.createElement('div');
		editorContainer.className = 'byte-editor';

		// Reset button
		this.resetButton = document.createElement('button');
		this.resetButton.innerHTML = 'Reset';
    this.resetButton.editorInstance	= this;


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
				let scale = 1;
				// Then divide x and y by 8
				x /= 8; y/= 8;
				x /= scale; y/= scale;
				// Then the line no is x * blocksPerLine + y * blocksPerColumn
				let lineNo = Math.floor(x) + Math.floor(y) * componentData.blocksPerLine;
				event.target.editor.scrollToLine(lineNo);
			});
		}

		// let clearDiv = document.createElement('div');
		// clearDiv.style = 'clear:both;';
		// containerElement.appendChild(clearDiv);
    outerContainer.appendChild(this.resetButton);
	}

	drawRawBytes() {
		// Take the header and body bytes and draw them.
		const byteArray = new Uint8Array((this.header + ',' + this.body).split(',').map(parseFloat));
    	let blob = new Blob([byteArray.buffer], {type: 'image/jpeg'});
    	let that = this;

    	createImageBitmap(blob)
    	.then(function(imageBitmap) {
    		let canvas = that.canvas;
    		canvas.width = imageBitmap.width;
    		canvas.height = imageBitmap.height;
    		let ctx = canvas.getContext('2d');

    		ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
    	})
    	.catch(function(error) {
    		let canvas = that.canvas;
    		let ctx = canvas.getContext('2d');
    		let corruptedImage = that.corruptedImage;

    		ctx.drawImage(corruptedImage, 0, 0, canvas.width, canvas.height);
    	});
	}

	drawDecodedImage() {
		let canvas = this.canvas;
		let image = this.decodedImage;

		canvas.width = image.width;
		canvas.height = image.height;
		var ctx = canvas.getContext('2d');
		var imageData = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
		ctx.putImageData(imageData, 0, 0);
	}

	drawLuminance(yValues, width, height) {
		let canvas = this.canvas;

		canvas.width = width;
		canvas.height = height;
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

	ycbcrToRgb(y, cb, cr) {

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
    console.log('gdc 1')
    console.log(this.decodedImage._decoder.components);
    let lines = this.decodedImage._decoder.components[componentMap[component]].lines;
    console.log('gdc 2')
		let values = [];
		for (let i = 0; i < lines.length; i++) {
			for (let j = 0; j < lines[i].length; j++) {
				values.push(lines[i][j])
			}
		}
    console.log('gdc 3')
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