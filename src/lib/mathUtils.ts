import type { FunctionType, MathFunction, ComputationResult, StepDetail, SubInterval } from './types';

// Function definition registry
export const functionList: MathFunction[] = [
	{ id: 'x^2', label: 'x²', description: 'f(x) = x^2' },
	{ id: 'sin(x)', label: 'sin(x)', description: 'f(x) = sin(x)' },
	{ id: 'e^x', label: 'eˣ', description: 'f(x) = e^x' },
	{ id: '1/x', label: '1/x', description: 'f(x) = 1/x' },
	{ id: 'sqrt(x)', label: '√x', description: 'f(x) = sqrt(x)' },
];

export function getFunction(fn: FunctionType): (x: number) => number {
	switch (fn) {
		case 'x^2':
			return (x) => x * x;
		case 'sin(x)':
			return (x) => Math.sin(x);
		case 'e^x':
			return (x) => Math.exp(x);
		case '1/x':
			return (x) => 1 / x;
		case 'sqrt(x)':
			return (x) => Math.sqrt(x);
		default:
			return (x) => x * x;
	}
}

export function getFunctionName(fn: FunctionType): string {
	switch (fn) {
		case 'x^2':
			return 'x^2';
		case 'sin(x)':
			return '\\sin(x)';
		case 'e^x':
			return 'e^x';
		case '1/x':
			return '\\frac{1}{x}';
		case 'sqrt(x)':
			return '\\sqrt{x}';
		default:
			return 'x^2';
	}
}

// High-precision integration for exact value using Simpson's rule with many intervals
export function simpsonExact(fn: (x: number) => number, a: number, b: number, n: number = 10000): number {
	if (n % 2 !== 0) n++;
	const h = (b - a) / n;
	let sum = fn(a) + fn(b);
	for (let i = 1; i < n; i++) {
		const x = a + i * h;
		sum += i % 2 === 0 ? 2 * fn(x) : 4 * fn(x);
	}
	return (h / 3) * sum;
}

// Adaptive Simpson's rule for a more accurate reference value
export function adaptiveSimpson(fn: (x: number) => number, a: number, b: number, tolerance: number = 1e-10): number {
	const simpson = (ll: number, rr: number): number => {
		const m = (ll + rr) / 2;
		return ((rr - ll) / 6) * (fn(ll) + 4 * fn(m) + fn(rr));
	};

	const recurse = (ll: number, rr: number, s: number): number => {
		const m = (ll + rr) / 2;
		const left = simpson(ll, m);
		const right = simpson(m, rr);
		if (Math.abs(left + right - s) < tolerance) return left + right;
		return recurse(ll, m, left) + recurse(m, rr, right);
	};

	return recurse(a, b, simpson(a, b));
}

// Trapezoid Rule
export function trapezoidRule(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const h = (b - a) / n;
	let sum = (fn(a) + fn(b)) / 2;
	const stepDetails: StepDetail[] = [];

	for (let i = 0; i < n; i++) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const y0 = fn(x0);
		const y1 = fn(x1);
		const contribution = (y0 + y1) / 2;
		sum += (i === 0 ? 0 : 0); // already counted endpoints
		stepDetails.push({
			index: i,
			a: x0,
			b: x1,
			yA: y0,
			yB: y1,
			contribution,
			approximate: true,
		});
	}

	// Recompute sum properly
	sum = (fn(a) + fn(b)) / 2;
	for (let i = 1; i < n; i++) {
		sum += fn(a + i * h);
	}
	const approximation = h * sum;

	// Recompute step contributions with correct formula
	stepDetails.length = 0;
	for (let i = 0; i < n; i++) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const y0 = fn(x0);
		const y1 = fn(x1);
		stepDetails.push({
			index: i,
			a: x0,
			b: x1,
			yA: y0,
			yB: y1,
			contribution: h * (y0 + y1) / 2,
			approximate: true,
		});
	}

	return { approximation, stepDetails, h };
}

// Simpson's 1/3 Rule
export function simpson13Rule(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const h = (b - a) / n;
	let sum = fn(a) + fn(b);
	const stepDetails: StepDetail[] = [];

	for (let i = 1; i < n; i++) {
		const x = a + i * h;
		sum += i % 2 === 0 ? 2 * fn(x) : 4 * fn(x);
	}

	const approximation = (h / 3) * sum;

	// Step details for pairs (each pair of subintervals forms a parabola)
	for (let i = 0; i < n; i += 2) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const x2 = a + (i + 2) * h;
		const y0 = fn(x0);
		const y1 = fn(x1);
		const y2 = fn(x2);
		stepDetails.push({
			index: i / 2,
			a: x0,
			b: x2,
			yA: y0,
			yB: y2,
			contribution: (h / 3) * (y0 + 4 * y1 + y2),
			approximate: true,
		});
	}

	return { approximation, stepDetails, h };
}

// Simpson's 3/8 Rule
export function simpson38Rule(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const h = (b - a) / n;
	let sum = fn(a) + fn(b);
	const stepDetails: StepDetail[] = [];

	for (let i = 1; i < n; i++) {
		const x = a + i * h;
		sum += i % 3 === 0 ? 2 * fn(x) : 3 * fn(x);
	}

	const approximation = (3 * h) / 8 * sum;

	// Step details for triplets (each triplet of subintervals forms a parabola)
	for (let i = 0; i < n; i += 3) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const x2 = a + (i + 2) * h;
		const x3 = a + (i + 3) * h;
		const y0 = fn(x0);
		const y1 = fn(x1);
		const y2 = fn(x2);
		const y3 = fn(x3);
		stepDetails.push({
			index: i / 3,
			a: x0,
			b: x3,
			yA: y0,
			yB: y3,
			contribution: (3 * h) / 8 * (y0 + 3 * y1 + 3 * y2 + y3),
			approximate: true,
		});
	}

	return { approximation, stepDetails, h };
}

// Midpoint Rule
export function midpointRule(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const h = (b - a) / n;
	let sum = 0;
	const stepDetails: StepDetail[] = [];

	for (let i = 0; i < n; i++) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const mid = (x0 + x1) / 2;
		const yMid = fn(mid);
		const contribution = h * yMid;
		sum += yMid;
		stepDetails.push({
			index: i,
			a: x0,
			b: x1,
			yA: fn(x0),
			yB: fn(x1),
			contribution,
			approximate: true,
		});
	}

	const approximation = h * sum;

	return { approximation, stepDetails, h };
}

// Main computation dispatcher
export function computeIntegration(
	method: 'trapezoid' | 'simpson13' | 'simpson38' | 'midpoint',
	fn: FunctionType,
	a: number,
	b: number,
	n: number
): ComputationResult {
	const f = getFunction(fn);
	const needsEvenN = method === 'simpson13';

	// Ensure valid n
	let validN = n;
	if (validN < 1) validN = 1;
	if (method === 'simpson13' && validN % 2 !== 0) validN += 1;
	if (method === 'simpson38' && validN % 3 !== 0) {
		validN = Math.ceil(validN / 3) * 3;
	}

	let result: { approximation: number; stepDetails: StepDetail[]; h: number };

	switch (method) {
		case 'trapezoid':
			result = trapezoidRule(f, a, b, validN);
			break;
		case 'simpson13':
			result = simpson13Rule(f, a, b, validN);
			break;
		case 'simpson38':
			result = simpson38Rule(f, a, b, validN);
			break;
		case 'midpoint':
			result = midpointRule(f, a, b, validN);
			break;
		default:
			result = trapezoidRule(f, a, b, validN);
	}

	// Compute exact value using adaptive Simpson with high precision
	const exact = adaptiveSimpson(f, a, b);
	const error = Math.abs(result.approximation - exact);
	const relativeError = exact !== 0 ? error / Math.abs(exact) : 0;

	return {
		method,
		function: functionList.find((f) => f.id === fn) ?? functionList[0],
		a,
		b,
		n: validN,
		h: result.h,
		exact,
		approximation: result.approximation,
		error,
		relativeError,
		stepDetails: result.stepDetails,
		needsEvenN,
	};
}

// Generate points for plotting
export function generatePlotPoints(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number,
	method: 'trapezoid' | 'simpson13' | 'simpson38' | 'midpoint'
): { smooth: SubInterval[]; approximation: SubInterval[] } {
	const h = (b - a) / n;
	const smooth: SubInterval[] = [];
	const nSmooth = n * 50;
	const hSmooth = (b - a) / nSmooth;
	for (let i = 0; i <= nSmooth; i++) {
		const x = a + i * hSmooth;
		smooth.push({ x, y: fn(x) });
	}

	const approximation: SubInterval[] = [];

	switch (method) {
		case 'trapezoid':
			for (let i = 0; i <= n; i++) {
				const x = a + i * h;
				approximation.push({ x, y: fn(x) });
			}
			break;
		case 'simpson13':
			for (let i = 0; i <= n; i++) {
				const x = a + i * h;
				approximation.push({ x, y: fn(x) });
			}
			break;
		case 'simpson38':
			for (let i = 0; i <= n; i++) {
				const x = a + i * h;
				approximation.push({ x, y: fn(x) });
			}
			break;
		case 'midpoint':
			for (let i = 0; i < n; i++) {
				const x0 = a + i * h;
				const x1 = a + (i + 1) * h;
				const mid = (x0 + x1) / 2;
				approximation.push({ x: x0, y: fn(mid) });
				approximation.push({ x: x1, y: fn(mid) });
			}
			break;
	}

	return { smooth, approximation };
}

// Generate trapezoid-specific points for chart fill
export function generateTrapezoidPoints(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { smooth: SubInterval[]; fillPoints: SubInterval[] } {
	const h = (b - a) / n;
	const smooth: SubInterval[] = [];
	const nSmooth = n * 50;
	const hSmooth = (b - a) / nSmooth;
	for (let i = 0; i <= nSmooth; i++) {
		const x = a + i * hSmooth;
		smooth.push({ x, y: fn(x) });
	}

	const fillPoints: SubInterval[] = [];
	for (let i = 0; i <= n; i++) {
		const x = a + i * h;
		fillPoints.push({ x, y: fn(x) });
	}

	return { smooth, fillPoints };
}

// Generate Simpson 1/3 parabolic segments
export function generateSimpson13Points(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { smooth: SubInterval[]; fillPoints: SubInterval[] } {
	const h = (b - a) / n;
	const smooth: SubInterval[] = [];
	const nSmooth = n * 50;
	const hSmooth = (b - a) / nSmooth;
	for (let i = 0; i <= nSmooth; i++) {
		const x = a + i * hSmooth;
		smooth.push({ x, y: fn(x) });
	}

	// Generate parabolic arc points for each pair of subintervals
	const fillPoints: SubInterval[] = [];
	for (let i = 0; i < n; i += 2) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const x2 = a + (i + 2) * h;
		const y0 = fn(x0);
		const y1 = fn(x1);
		const y2 = fn(x2);

		// Lagrange interpolation for parabola through 3 points
		const parabolaY = (x: number): number => {
			return y0 * ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) +
				y1 * ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) +
				y2 * ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
		};

		const nPoints = 30;
		for (let j = 0; j <= nPoints; j++) {
			const t = j / nPoints;
			const x = x0 + t * (x2 - x0);
			fillPoints.push({ x, y: parabolaY(x) });
		}
	}

	return { smooth, fillPoints };
}

// Generate Simpson 3/8 parabolic segments
export function generateSimpson38Points(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { smooth: SubInterval[]; fillPoints: SubInterval[] } {
	const h = (b - a) / n;
	const smooth: SubInterval[] = [];
	const nSmooth = n * 50;
	const hSmooth = (b - a) / nSmooth;
	for (let i = 0; i <= nSmooth; i++) {
		const x = a + i * hSmooth;
		smooth.push({ x, y: fn(x) });
	}

	const fillPoints: SubInterval[] = [];
	for (let i = 0; i < n; i += 3) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const x2 = a + (i + 2) * h;
		const x3 = a + (i + 3) * h;
		const y0 = fn(x0);
		const y1 = fn(x1);
		const y2 = fn(x2);
		const y3 = fn(x3);

		// Cubic interpolation for Simpson 3/8
		const interpY = (x: number): number => {
			// Lagrange cubic interpolation
			return y0 * ((x - x1) * (x - x2) * (x - x3)) / ((x0 - x1) * (x0 - x2) * (x0 - x3)) +
				y1 * ((x - x0) * (x - x2) * (x - x3)) / ((x1 - x0) * (x1 - x2) * (x1 - x3)) +
				y2 * ((x - x0) * (x - x1) * (x - x3)) / ((x2 - x0) * (x2 - x1) * (x2 - x3)) +
				y3 * ((x - x0) * (x - x1) * (x - x2)) / ((x3 - x0) * (x3 - x1) * (x3 - x2));
		};

		const nPoints = 40;
		for (let j = 0; j <= nPoints; j++) {
			const t = j / nPoints;
			const x = x0 + t * (x3 - x0);
			fillPoints.push({ x, y: interpY(x) });
		}
	}

	return { smooth, fillPoints };
}

// Generate Midpoint rectangle points
export function generateMidpointPoints(
	fn: (x: number) => number,
	a: number,
	b: number,
	n: number
): { smooth: SubInterval[]; fillPoints: { x: number; y: number; x0: number; x1: number }[] } {
	const h = (b - a) / n;
	const smooth: SubInterval[] = [];
	const nSmooth = n * 50;
	const hSmooth = (b - a) / nSmooth;
	for (let i = 0; i <= nSmooth; i++) {
		const x = a + i * hSmooth;
		smooth.push({ x, y: fn(x) });
	}

	const fillPoints: { x: number; y: number; x0: number; x1: number }[] = [];
	for (let i = 0; i < n; i++) {
		const x0 = a + i * h;
		const x1 = a + (i + 1) * h;
		const mid = (x0 + x1) / 2;
		const yMid = fn(mid);
		fillPoints.push({ x: mid, y: yMid, x0, x1 });
	}

	return { smooth, fillPoints };
}
