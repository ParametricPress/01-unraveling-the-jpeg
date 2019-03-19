/*
 * Fast discrete cosine transform algorithms (JavaScript)
 *
 * Copyright (c) 2019 Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/fast-discrete-cosine-transform-algorithms
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

"use strict";


var fastDct8 = new function() {

	// DCT type II, scaled. Algorithm by Arai, Agui, Nakajima, 1988.
	// See: https://web.stanford.edu/class/ee398a/handouts/lectures/07-TransformCoding.pdf#page=30
	this.transform = function(vector) {
		var v0 = vector[0] + vector[7];
		var v1 = vector[1] + vector[6];
		var v2 = vector[2] + vector[5];
		var v3 = vector[3] + vector[4];
		var v4 = vector[3] - vector[4];
		var v5 = vector[2] - vector[5];
		var v6 = vector[1] - vector[6];
		var v7 = vector[0] - vector[7];

		var v8 = v0 + v3;
		var v9 = v1 + v2;
		var v10 = v1 - v2;
		var v11 = v0 - v3;
		var v12 = -v4 - v5;
		var v13 = (v5 + v6) * A[3];
		var v14 = v6 + v7;

		var v15 = v8 + v9;
		var v16 = v8 - v9;
		var v17 = (v10 + v11) * A[1];
		var v18 = (v12 + v14) * A[5];

		var v19 = -v12 * A[2] - v18;
		var v20 = v14 * A[4] - v18;

		var v21 = v17 + v11;
		var v22 = v11 - v17;
		var v23 = v13 + v7;
		var v24 = v7 - v13;

		var v25 = v19 + v24;
		var v26 = v23 + v20;
		var v27 = v23 - v20;
		var v28 = v24 - v19;

		vector[0] = S[0] * v15;
		vector[1] = S[1] * v26;
		vector[2] = S[2] * v21;
		vector[3] = S[3] * v28;
		vector[4] = S[4] * v16;
		vector[5] = S[5] * v25;
		vector[6] = S[6] * v22;
		vector[7] = S[7] * v27;
	};


	// DCT type III, scaled. A straightforward inverse of the forward algorithm.
	this.inverseTransform = function(vector) {
		var v15 = vector[0] / S[0];
		var v26 = vector[1] / S[1];
		var v21 = vector[2] / S[2];
		var v28 = vector[3] / S[3];
		var v16 = vector[4] / S[4];
		var v25 = vector[5] / S[5];
		var v22 = vector[6] / S[6];
		var v27 = vector[7] / S[7];

		var v19 = (v25 - v28) / 2;
		var v20 = (v26 - v27) / 2;
		var v23 = (v26 + v27) / 2;
		var v24 = (v25 + v28) / 2;

		var v7  = (v23 + v24) / 2;
		var v11 = (v21 + v22) / 2;
		var v13 = (v23 - v24) / 2;
		var v17 = (v21 - v22) / 2;

		var v8 = (v15 + v16) / 2;
		var v9 = (v15 - v16) / 2;

		var v18 = (v19 - v20) * A[5];  // Different from original
		var v12 = (v19 * A[4] - v18) / (A[2] * A[5] - A[2] * A[4] - A[4] * A[5]);
		var v14 = (v18 - v20 * A[2]) / (A[2] * A[5] - A[2] * A[4] - A[4] * A[5]);

		var v6 = v14 - v7;
		var v5 = v13 / A[3] - v6;
		var v4 = -v5 - v12;
		var v10 = v17 / A[1] - v11;

		var v0 = (v8 + v11) / 2;
		var v1 = (v9 + v10) / 2;
		var v2 = (v9 - v10) / 2;
		var v3 = (v8 - v11) / 2;

		vector[0] = (v0 + v7) / 2;
		vector[1] = (v1 + v6) / 2;
		vector[2] = (v2 + v5) / 2;
		vector[3] = (v3 + v4) / 2;
		vector[4] = (v3 - v4) / 2;
		vector[5] = (v2 - v5) / 2;
		vector[6] = (v1 - v6) / 2;
		vector[7] = (v0 - v7) / 2;
	};


	var S = [];
	var C = [];
	for (var i = 0; i < 8; i++) {
		C.push(Math.cos(Math.PI / 16 * i));
		S.push(1 / (4 * C[i]));
	}
	S[0] = 1 / (2 * Math.sqrt(2));
	var A = [NaN, C[4], C[2] - C[6], C[4], C[6] + C[2], C[6]];
};



var fastDctLee = new function() {

	// DCT type II, unscaled. Algorithm by Byeong Gi Lee, 1984.
	// See: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.118.3056&rep=rep1&type=pdf#page=34
	this.transform = function(vector) {
		var n = vector.length;
		if (n <= 0 || (n & (n - 1)) != 0)
			throw "Length must be power of 2";
		transformInternal(vector, 0, n, new Float64Array(n));
	};


	function transformInternal(vector, off, len, temp) {
		if (len == 1)
			return;
		var halfLen = Math.floor(len / 2);
		for (var i = 0; i < halfLen; i++) {
			var x = vector[off + i];
			var y = vector[off + len - 1 - i];
			temp[off + i] = x + y;
			temp[off + i + halfLen] = (x - y) / (Math.cos((i + 0.5) * Math.PI / len) * 2);
		}
		transformInternal(temp, off, halfLen, vector);
		transformInternal(temp, off + halfLen, halfLen, vector);
		for (var i = 0; i < halfLen - 1; i++) {
			vector[off + i * 2 + 0] = temp[off + i];
			vector[off + i * 2 + 1] = temp[off + i + halfLen] + temp[off + i + halfLen + 1];
		}
		vector[off + len - 2] = temp[off + halfLen - 1];
		vector[off + len - 1] = temp[off + len - 1];
	}


	// DCT type III, unscaled. Algorithm by Byeong Gi Lee, 1984.
	// See: https://www.nayuki.io/res/fast-discrete-cosine-transform-algorithms/lee-new-algo-discrete-cosine-transform.pdf
	this.inverseTransform = function(vector) {
		var n = vector.length;
		if (n <= 0 || (n & (n - 1)) != 0)
			throw "Length must be power of 2";
		vector[0] /= 2;
		inverseTransformInternal(vector, 0, n, new Float64Array(n));
	};


	function inverseTransformInternal(vector, off, len, temp) {
		if (len == 1)
			return;
		var halfLen = Math.floor(len / 2);
		temp[off + 0] = vector[off + 0];
		temp[off + halfLen] = vector[off + 1];
		for (var i = 1; i < halfLen; i++) {
			temp[off + i] = vector[off + i * 2];
			temp[off + i + halfLen] = vector[off + i * 2 - 1] + vector[off + i * 2 + 1];
		}
		inverseTransformInternal(temp, off, halfLen, vector);
		inverseTransformInternal(temp, off + halfLen, halfLen, vector);
		for (var i = 0; i < halfLen; i++) {
			var x = temp[off + i];
			var y = temp[off + i + halfLen] / (Math.cos((i + 0.5) * Math.PI / len) * 2);
			vector[off + i] = x + y;
			vector[off + len - 1 - i] = x - y;
		}
	}

};



var fastDctFft = new function() {

	// DCT type II, unscaled.
	this.transform = function(vector) {
		var len = vector.length;
		var halfLen = Math.floor(len / 2);
		var real = new Float64Array(len);
		for (var i = 0; i < halfLen; i++) {
			real[i] = vector[i * 2];
			real[len - 1 - i] = vector[i * 2 + 1];
		}
		if (len % 2 == 1)
			real[halfLen] = vector[len - 1];
		for (var i = 0; i < len; i++)
			vector[i] = 0;
		transform(real, vector);
		for (var i = 0; i < len; i++) {
			var temp = i * Math.PI / (len * 2);
			vector[i] = real[i] * Math.cos(temp) + vector[i] * Math.sin(temp);
		}
	};


	// DCT type III, unscaled.
	this.inverseTransform = function(vector) {
		var len = vector.length;
		if (len > 0)
			vector[0] /= 2;
		var real = new Float64Array(len);
		for (var i = 0; i < len; i++) {
			var temp = i * Math.PI / (len * 2);
			real[i] = vector[i] * Math.cos(temp);
			vector[i] *= -Math.sin(temp);
		}
		transform(real, vector);

		var halfLen = Math.floor(len / 2);
		for (var i = 0; i < halfLen; i++) {
			vector[i * 2 + 0] = real[i];
			vector[i * 2 + 1] = real[len - 1 - i];
		}
		if (len % 2 == 1)
			vector[len - 1] = real[halfLen];
	};

};

module.exports = {
  fastDctFft,
  fastDctLee,
  fastDct8
}