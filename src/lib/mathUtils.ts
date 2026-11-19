import type { FunctionType, ComputationResult, StepDetail, SubInterval, MethodType } from './types';
import { functionRegistry, functionList, getFunction, getFunctionName, getFunctionDefinition, validateFunctionInterval, isFunctionAllowedForMethod, isRegisteredMethod } from './functionRegistry';

export { functionList, getFunction, getFunctionName };

function assertFiniteBounds(a: number, b: number): void {
	if (!Number.isFinite(a) || !Number.isFinite(b)) throw new RangeError('Integration bounds a and b must be finite numbers.');
}

function assertValidN(n: number, method: MethodType): void {
	if (!Number.isFinite(n) || !Number.isInteger(n)) throw new RangeError('n must be a finite integer.');
	const min = method === 'simpson13' ? 2 : method === 'simpson38' ? 3 : 1;
	if (n < min) throw new RangeError(`${method} requires n >= ${min}.`);
	if (method === 'simpson13' && n % 2 !== 0) throw new RangeError('Simpson 1/3 requires an even n.');
	if (method === 'simpson38' && n % 3 !== 0) throw new RangeError('Simpson 3/8 requires n to be a multiple of 3.');
}

function checkedEvaluator(fn: (x: number) => number): (x: number) => number {
	return (x) => {
		const value = fn(x);
		if (!Number.isFinite(value)) throw new RangeError(`Function returned a non-finite value at x=${x}.`);
		return value;
	};
}

function validateRuleInputs(fn: (x: number) => number, a: number, b: number, n: number, method: MethodType): (x: number) => number {
	assertFiniteBounds(a, b);
	assertValidN(n, method);
	return checkedEvaluator(fn);
}

export function trapezoidRule(fn: (x: number) => number, a: number, b: number, n: number): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const f = validateRuleInputs(fn, a, b, n, 'trapezoid');
	const h = (b - a) / n;
	const nodes = Array.from({ length: n + 1 }, (_, i) => a + i * h);
	const values = nodes.map(f);
	const stepDetails = Array.from({ length: n }, (_, i) => ({
		index: i, a: nodes[i], b: nodes[i + 1], yA: values[i], yB: values[i + 1],
		contribution: (h / 2) * (values[i] + values[i + 1]), approximate: true,
	}));
	const weightedSum = values[0] / 2 + values.slice(1, -1).reduce((sum, value) => sum + value, 0) + values[n] / 2;
	return { approximation: h * weightedSum, stepDetails, h };
}

export function simpson13Rule(fn: (x: number) => number, a: number, b: number, n: number): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const f = validateRuleInputs(fn, a, b, n, 'simpson13');
	const h = (b - a) / n;
	const values = Array.from({ length: n + 1 }, (_, i) => f(a + i * h));
	let sum = values[0] + values[n];
	for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * values[i];
	const stepDetails = [];
	for (let i = 0; i < n; i += 2) {
		const x0 = a + i * h, x1 = a + (i + 1) * h, x2 = a + (i + 2) * h;
		stepDetails.push({
			index: i / 2, a: x0, b: x2, yA: values[i], yB: values[i + 2],
			interiorPoints: [{ x: x1, y: values[i + 1], weight: 4 }],
			contribution: (h / 3) * (values[i] + 4 * values[i + 1] + values[i + 2]), approximate: true,
		});
	}
	return { approximation: (h / 3) * sum, stepDetails, h };
}

export function simpson38Rule(fn: (x: number) => number, a: number, b: number, n: number): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const f = validateRuleInputs(fn, a, b, n, 'simpson38');
	const h = (b - a) / n;
	const values = Array.from({ length: n + 1 }, (_, i) => f(a + i * h));
	let sum = values[0] + values[n];
	for (let i = 1; i < n; i++) sum += (i % 3 === 0 ? 2 : 3) * values[i];
	const stepDetails = [];
	for (let i = 0; i < n; i += 3) {
		const x0 = a + i * h, x1 = a + (i + 1) * h, x2 = a + (i + 2) * h, x3 = a + (i + 3) * h;
		stepDetails.push({
			index: i / 3, a: x0, b: x3, yA: values[i], yB: values[i + 3],
			interiorPoints: [{ x: x1, y: values[i + 1], weight: 3 }, { x: x2, y: values[i + 2], weight: 3 }],
			contribution: (3 * h / 8) * (values[i] + 3 * values[i + 1] + 3 * values[i + 2] + values[i + 3]), approximate: true,
		});
	}
	return { approximation: (3 * h / 8) * sum, stepDetails, h };
}

export function midpointRule(fn: (x: number) => number, a: number, b: number, n: number): { approximation: number; stepDetails: StepDetail[]; h: number } {
	const f = validateRuleInputs(fn, a, b, n, 'midpoint');
	const h = (b - a) / n;
	const stepDetails = Array.from({ length: n }, (_, i) => {
		const x0 = a + i * h, x1 = a + (i + 1) * h, xMid = (x0 + x1) / 2;
		const yMid = f(xMid);
		return { index: i, a: x0, b: x1, yA: f(x0), yB: f(x1), xMid, yMid, contribution: h * yMid, approximate: true };
	});
	return { approximation: stepDetails.reduce((sum, step) => sum + step.contribution, 0), stepDetails, h };
}

export function absoluteError(approximation: number, referenceValue: number): number {
	if (!Number.isFinite(approximation) || !Number.isFinite(referenceValue)) throw new RangeError('Approximation and reference value must be finite.');
	return Math.abs(approximation - referenceValue);
}

export function relativeError(approximation: number, referenceValue: number): number | null {
	if (!Number.isFinite(approximation) || !Number.isFinite(referenceValue)) throw new RangeError('Approximation and reference value must be finite.');
	return referenceValue === 0 ? null : absoluteError(approximation, referenceValue) / Math.abs(referenceValue);
}

export function simpsonExact(fn: (x: number) => number, a: number, b: number, n = 10000): number {
	assertFiniteBounds(a, b);
	if (!Number.isInteger(n) || n < 2 || !Number.isFinite(n)) throw new RangeError('Simpson reference n must be a finite integer >= 2.');
	if (n % 2 !== 0) n++;
	const f = checkedEvaluator(fn), h = (b - a) / n;
	let sum = f(a) + f(b);
	for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
	return (h / 3) * sum;
}

export function adaptiveSimpson(fn: (x: number) => number, a: number, b: number, tolerance = 1e-10): number {
	assertFiniteBounds(a, b);
	if (!Number.isFinite(tolerance) || tolerance <= 0) throw new RangeError('Tolerance must be a finite positive number.');
	const f = checkedEvaluator(fn);
	if (a === b) return 0;
	const simpson = (left: number, right: number) => ((right - left) / 6) * (f(left) + 4 * f((left + right) / 2) + f(right));
	const recurse = (left: number, right: number, whole: number, tol: number, depth: number): number => {
		const middle = (left + right) / 2, leftEstimate = simpson(left, middle), rightEstimate = simpson(middle, right);
		const delta = leftEstimate + rightEstimate - whole;
		if (Math.abs(delta) <= 15 * tol || depth === 0) return leftEstimate + rightEstimate + delta / 15;
		return recurse(left, middle, leftEstimate, tol / 2, depth - 1) + recurse(middle, right, rightEstimate, tol / 2, depth - 1);
	};
	return recurse(a, b, simpson(a, b), tolerance, 30);
}

export function computeIntegration(method: MethodType, fn: FunctionType, a: number, b: number, n: number): ComputationResult {
	if (!isRegisteredMethod(method)) throw new Error(`Unknown integration method: ${method}`);
	const definition = getFunctionDefinition(fn);
	if (!isFunctionAllowedForMethod(method, fn)) {
		throw new RangeError(`Function ${fn} is not allowed for method ${method}.`);
	}
	validateFunctionInterval(fn, a, b);
	assertValidN(n, method);
	const evaluator = getFunction(fn);
	const result = method === 'trapezoid' ? trapezoidRule(evaluator, a, b, n)
		: method === 'simpson13' ? simpson13Rule(evaluator, a, b, n)
			: method === 'simpson38' ? simpson38Rule(evaluator, a, b, n)
				: method === 'midpoint' ? midpointRule(evaluator, a, b, n)
					: (() => { throw new Error(`Unknown integration method: ${method}`); })();
	const analyticValue = definition.integral?.(a, b) ?? null;
	const referenceKind = analyticValue !== null && Number.isFinite(analyticValue) ? 'analytic' as const : 'numerical-estimate' as const;
	const referenceValue = referenceKind === 'analytic' ? analyticValue as number : adaptiveSimpson(evaluator, a, b);
	if (!Number.isFinite(referenceValue)) throw new RangeError('Reference integral could not be evaluated as a finite value.');
	const error = absoluteError(result.approximation, referenceValue);
	return {
		method, function: { id: fn, label: definition.label, description: definition.description }, a, b, n, h: result.h,
		referenceValue, referenceKind, referenceMethod: referenceKind === 'analytic' ? 'Antiturunan analitik' : 'Adaptive Simpson (estimasi numerik)',
		exact: referenceKind === 'analytic' ? referenceValue : null, approximation: result.approximation, error,
		relativeError: relativeError(result.approximation, referenceValue), stepDetails: result.stepDetails, needsEvenN: method === 'simpson13',
	};
}

function validatePlotInputs(fn: (x: number) => number, a: number, b: number, n: number, method: MethodType): (x: number) => number {
	return validateRuleInputs(fn, a, b, n, method);
}

export function generatePlotPoints(fn: (x: number) => number, a: number, b: number, n: number, method: MethodType): { smooth: SubInterval[]; approximation: SubInterval[] } {
	const f = validatePlotInputs(fn, a, b, n, method), h = (b - a) / n;
	const smooth = Array.from({ length: n * 50 + 1 }, (_, i) => { const x = a + i * h / 50; return { x, y: f(x) }; });
	const approximation: SubInterval[] = [];
	if (method === 'midpoint') {
		for (let i = 0; i < n; i++) { const x0 = a + i * h, x1 = a + (i + 1) * h, y = f((x0 + x1) / 2); approximation.push({ x: x0, y }, { x: x1, y }); }
	} else for (let i = 0; i <= n; i++) { const x = a + i * h; approximation.push({ x, y: f(x) }); }
	return { smooth, approximation };
}

export function generateTrapezoidPoints(fn: (x: number) => number, a: number, b: number, n: number): { smooth: SubInterval[]; fillPoints: SubInterval[] } {
	const points = generatePlotPoints(fn, a, b, n, 'trapezoid');
	return { smooth: points.smooth, fillPoints: points.approximation };
}

export function generateSimpson13Points(fn: (x: number) => number, a: number, b: number, n: number): { smooth: SubInterval[]; fillPoints: SubInterval[] } {
	const f = validatePlotInputs(fn, a, b, n, 'simpson13'), h = (b - a) / n;
	const smooth = Array.from({ length: n * 50 + 1 }, (_, i) => { const x = a + i * h / 50; return { x, y: f(x) }; });
	const fillPoints: SubInterval[] = [];
	for (let i = 0; i < n; i += 2) {
		const x0 = a + i * h, x1 = a + (i + 1) * h, x2 = a + (i + 2) * h;
		const y0 = f(x0), y1 = f(x1), y2 = f(x2);
		for (let j = 0; j <= 30; j++) { const x = x0 + (x2 - x0) * j / 30; const y = y0 * (x - x1) * (x - x2) / ((x0 - x1) * (x0 - x2)) + y1 * (x - x0) * (x - x2) / ((x1 - x0) * (x1 - x2)) + y2 * (x - x0) * (x - x1) / ((x2 - x0) * (x2 - x1)); fillPoints.push({ x, y }); }
	}
	return { smooth, fillPoints };
}

export function generateSimpson38Points(fn: (x: number) => number, a: number, b: number, n: number): { smooth: SubInterval[]; fillPoints: SubInterval[] } {
	const f = validatePlotInputs(fn, a, b, n, 'simpson38'), h = (b - a) / n;
	const smooth = Array.from({ length: n * 50 + 1 }, (_, i) => { const x = a + i * h / 50; return { x, y: f(x) }; });
	const fillPoints: SubInterval[] = [];
	for (let i = 0; i < n; i += 3) {
		const xs = [a + i * h, a + (i + 1) * h, a + (i + 2) * h, a + (i + 3) * h], ys = xs.map(f);
		for (let j = 0; j <= 40; j++) { const x = xs[0] + (xs[3] - xs[0]) * j / 40; let y = 0; for (let k = 0; k < 4; k++) { let term = ys[k]; for (let m = 0; m < 4; m++) if (m !== k) term *= (x - xs[m]) / (xs[k] - xs[m]); y += term; } fillPoints.push({ x, y }); }
	}
	return { smooth, fillPoints };
}

export function generateMidpointPoints(fn: (x: number) => number, a: number, b: number, n: number): { smooth: SubInterval[]; fillPoints: { x: number; y: number; x0: number; x1: number }[] } {
	const f = validatePlotInputs(fn, a, b, n, 'midpoint'), h = (b - a) / n;
	const smooth = Array.from({ length: n * 50 + 1 }, (_, i) => { const x = a + i * h / 50; return { x, y: f(x) }; });
	const fillPoints = Array.from({ length: n }, (_, i) => { const x0 = a + i * h, x1 = a + (i + 1) * h, x = (x0 + x1) / 2; return { x, y: f(x), x0, x1 }; });
	return { smooth, fillPoints };
}

export { functionRegistry, validateFunctionInterval };
