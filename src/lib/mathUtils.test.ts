import { describe, expect, it } from 'vitest';
import {
	absoluteError, adaptiveSimpson, computeIntegration, functionList, functionRegistry,
	generateMidpointPoints, generatePlotPoints, generateSimpson13Points, generateSimpson38Points,
	generateTrapezoidPoints, getFunction, getFunctionName, midpointRule, relativeError,
	simpson13Rule, simpson38Rule, simpsonExact, trapezoidRule, validateFunctionInterval,
} from './mathUtils';
import {
	getDefaultFunctionForMethod, getFunctionDefinition, getFunctionsForMethod,
	getMethodFunctionConfig, isFunctionAllowedForMethod, isFunctionSelectionLocked, isFunctionType, methodExampleDefaults,
} from './functionRegistry';

const x2 = (x: number) => x * x;

describe('method function availability', () => {
	it.each([
		['trapezoid', ['x^2 + 1', 'x^2'], 'x^2 + 1', false],
		['simpson13', ['x^2', 'x^3 + 1'], 'x^2', false],
		['simpson38', ['e^x'], 'e^x', true],
		['midpoint', ['x^2'], 'x^2', true],
	] as const)('%s exposes only PPT functions and chooses expected default', (method, allowed, defaultId, locked) => {
		expect(getFunctionsForMethod(method)).toEqual(allowed);
		expect(getDefaultFunctionForMethod(method)).toBe(defaultId);
		expect(isFunctionSelectionLocked(method)).toBe(locked);
		for (const id of allowed) expect(isFunctionAllowedForMethod(method, id)).toBe(true);
		expect(methodExampleDefaults[method].functionId).toBe(defaultId);
		expect(getMethodFunctionConfig(method).selectionMode).toBe(allowed.length > 1 ? 'dropdown' : 'static');
		expect(getMethodFunctionConfig(method).defaults.functionId).toBe(defaultId);
	});

	it('resets selected function and PPT parameters on each method switch', () => {
		const methodOrder = ['simpson38', 'trapezoid', 'simpson13', 'midpoint'] as const;
		const resolved = methodOrder.map((method) => getMethodFunctionConfig(method));
		expect(resolved.map((config) => config.defaultFunctionId)).toEqual(['e^x', 'x^2 + 1', 'x^2', 'x^2']);
		expect(resolved.map(({ defaults }) => [defaults.a, defaults.b, defaults.n])).toEqual([
			[0, 4, 3], [0, 2, 1], [0, 2, 2], [0, 1, 4],
		]);
		expect(resolved.map(({ selectionMode }) => selectionMode)).toEqual(['static', 'dropdown', 'dropdown', 'static']);
	});

	it('rejects unlisted and unknown functions explicitly in calculation layer', () => {
		expect(isFunctionAllowedForMethod('simpson38', 'x^2')).toBe(false);
		expect(isFunctionAllowedForMethod('midpoint', 'e^x')).toBe(false);
		expect(isFunctionAllowedForMethod('trapezoid', 'not-registered')).toBe(false);
		expect(() => computeIntegration('simpson38', 'x^2', 0, 4, 3)).toThrow(/not allowed for method simpson38/);
		expect(() => computeIntegration('midpoint', 'e^x', 0, 1, 4)).toThrow(/not allowed for method midpoint/);
		expect(() => computeIntegration('trapezoid', 'not-registered' as never, 0, 1, 1)).toThrow(/Unknown function ID/);
	});
});

 describe('function registry', () => {
	it('lists all permitted presets and metadata', () => {
		expect(functionList.map(({ id }) => id)).toEqual(Object.keys(functionRegistry));
		for (const [id, entry] of Object.entries(functionRegistry)) {
			expect(entry.label).toBeTruthy();
			expect(entry.description).toBeTruthy();
			expect(entry.latex).toBeTruthy();
			expect(entry.isInDomain(0)).toBe(id !== '1/x' || false);
		}
	});
	it.each(Object.keys(functionRegistry))('evaluates registered function %s and returns its display name', (id) => {
		const definition = getFunctionDefinition(id);
		const x = id === '1/x' ? 2 : 0.25;
		expect(getFunction(id)(x)).toBeCloseTo(definition.evaluate(x));
		expect(getFunctionName(id)).toBe(definition.latex);
	});
	it('detects invalid IDs without fallback', () => {
		expect(isFunctionType('x^2')).toBe(true);
		expect(isFunctionType('x^999')).toBe(false);
		expect(() => getFunction('x^999')).toThrow('Unknown function ID');
		expect(() => getFunctionName('x^999')).toThrow('Unknown function ID');
	});
	it.each([
		['x^2', 0, 2, 8 / 3], ['x^2 + 1', 0, 2, 14 / 3], ['x^3 + 1', 0, 2, 6],
		['e^x', 0, 3, Math.exp(3) - 1], ['sin(x)', 0, Math.PI, 2], ['1/x', 1, 4, Math.log(4)],
		['sqrt(x)', 0, 1, 2 / 3],
	] as const)('integrates preset %s analytically', (id, a, b, expected) => {
		expect(getFunctionDefinition(id).integral?.(a, b)).toBeCloseTo(expected);
	});
	it('keeps unlisted no-antiderivative presets unavailable to PPT methods', () => {
		expect(getFunctionDefinition('abs(x)').integral).toBeNull();
		expect(() => computeIntegration('simpson13', 'abs(x)', -1, 1, 2)).toThrow(/not allowed for method/);
	});
	it('validates domains and finite intervals', () => {
		expect(() => validateFunctionInterval('1/x', -1, 2)).toThrow(/singularity/);
		expect(() => validateFunctionInterval('1/x', 0, 2)).toThrow(/not defined/);
		expect(() => validateFunctionInterval('sqrt(x)', -1, 2)).toThrow(/not defined/);
		expect(() => validateFunctionInterval('x^2', 0, Infinity)).toThrow(/finite/);
		expect(() => getFunction('sqrt(x)')(-0.1)).toThrow(/not defined/);
		expect(() => getFunction('1/x')(0)).toThrow(/not defined/);
	});
});

describe('trapezoidRule', () => {
	it('computes single trapezoid (n=1)', () => {
		expect(trapezoidRule((x) => x * x + 1, 0, 2, 1).approximation).toBeCloseTo(6);
	});
	it('computes composite example with n=2 and reports panel contributions', () => {
		const result = trapezoidRule(x2, 0, 4, 2);
		expect(result.h).toBe(2);
		expect(result.approximation).toBe(24);
		expect(result.stepDetails).toHaveLength(2);
		expect(result.stepDetails.reduce((sum, step) => sum + step.contribution, 0)).toBeCloseTo(result.approximation);
	});
	it('handles reversed bounds and rejects invalid parameters/non-finite integrands', () => {
		expect(trapezoidRule(x2, 2, 0, 2).approximation).toBeCloseTo(-trapezoidRule(x2, 0, 2, 2).approximation);
		expect(() => trapezoidRule(x2, 0, 1, 0)).toThrow(/n >= 1/);
		expect(() => trapezoidRule(x2, 0, 1, 1.5)).toThrow(/integer/);
		expect(() => trapezoidRule(x2, NaN, 1, 1)).toThrow(/finite/);
		expect(() => trapezoidRule(() => Infinity, 0, 1, 1)).toThrow(/non-finite/);
	});
});

describe('simpson13Rule', () => {
	it('computes basic Simpson 1/3 with n=2', () => {
		expect(simpson13Rule(x2, 0, 2, 2).approximation).toBeCloseTo(8 / 3);
	});
	it('computes composite cubic example with n=4', () => {
		const result = simpson13Rule((x) => x ** 3 + 1, 0, 2, 4);
		expect(result.approximation).toBeCloseTo(6);
		expect(result.stepDetails).toHaveLength(2);
		expect(result.stepDetails[0].interiorPoints?.[0].weight).toBe(4);
	});
	it('rejects odd, too-small, fractional, or non-finite n', () => {
		expect(() => simpson13Rule(x2, 0, 1, 1)).toThrow(/n >= 2/);
		expect(() => simpson13Rule(x2, 0, 1, 3)).toThrow(/even/);
		expect(() => simpson13Rule(x2, 0, 1, 2.5)).toThrow(/integer/);
		expect(() => simpson13Rule(x2, 0, 1, Infinity)).toThrow(/integer/);
	});
});

describe('simpson38Rule', () => {
	it('computes basic Simpson 3/8 with n=3', () => {
		expect(simpson38Rule((x) => x ** 3, 0, 4, 3).approximation).toBeCloseTo(64);
	});
	it('computes composite case n=6 with correct node weights', () => {
		const result = simpson38Rule((x) => x ** 3, 0, 3, 6);
		expect(result.approximation).toBeCloseTo(81 / 4);
		expect(result.stepDetails).toHaveLength(2);
		expect(result.stepDetails[0].interiorPoints?.map((point) => point.weight)).toEqual([3, 3]);
	});
	it('rejects invalid multiples, small n, fractions, and non-finite n', () => {
		expect(() => simpson38Rule(x2, 0, 1, 1)).toThrow(/n >= 3/);
		expect(() => simpson38Rule(x2, 0, 1, 4)).toThrow(/multiple of 3/);
		expect(() => simpson38Rule(x2, 0, 1, 3.5)).toThrow(/integer/);
		expect(() => simpson38Rule(x2, 0, 1, NaN)).toThrow(/integer/);
	});
});

describe('midpointRule', () => {
	it('computes PPT example x² on [0,1] with n=4 and records midpoint values', () => {
		const result = midpointRule(x2, 0, 1, 4);
		expect(result.approximation).toBeCloseTo(0.328125);
		expect(result.stepDetails[0].xMid).toBeCloseTo(0.125);
		expect(result.stepDetails[0].yMid).toBeCloseTo(0.015625);
		expect(result.stepDetails[0].contribution).toBeCloseTo(0.00390625);
	});
	it('supports n=1 and rejects invalid parameters', () => {
		expect(midpointRule(x2, 0, 1, 1).approximation).toBeCloseTo(0.25);
		expect(() => midpointRule(x2, 0, 1, 0)).toThrow(/n >= 1/);
		expect(() => midpointRule(x2, 0, 1, 2.2)).toThrow(/integer/);
	});
});

describe('error and reference integration helpers', () => {
	it('computes absolute error and rejects non-finite values', () => {
		expect(absoluteError(2, 3)).toBe(1);
		expect(() => absoluteError(NaN, 1)).toThrow(/finite/);
	});
	it('returns null relative error when reference value is zero', () => {
		expect(relativeError(2, 0)).toBeNull();
		expect(relativeError(2, 4)).toBe(0.5);
		expect(() => relativeError(Infinity, 1)).toThrow(/finite/);
	});
	it('computes Simpson reference integral and validates n', () => {
		expect(simpsonExact(x2, 0, 2, 4)).toBeCloseTo(8 / 3);
		expect(simpsonExact(x2, 0, 2, 3)).toBeCloseTo(8 / 3);
		expect(() => simpsonExact(x2, 0, 1, 1)).toThrow(/>= 2/);
	});
	it('computes adaptive Simpson estimate and validates tolerance/domain outputs', () => {
		expect(adaptiveSimpson((x) => Math.exp(x), 0, 3)).toBeCloseTo(Math.exp(3) - 1, 9);
		expect(adaptiveSimpson(x2, 2, 2)).toBe(0);
		expect(() => adaptiveSimpson(x2, 0, 1, 0)).toThrow(/positive/);
		expect(() => adaptiveSimpson(() => NaN, 0, 1)).toThrow(/non-finite/);
	});
	it.each([
		['trapezoid', 'x^2 + 1', 0, 2, 1, 6],
		['trapezoid', 'x^2', 0, 4, 2, 24],
		['simpson13', 'x^2', 0, 2, 2, 8 / 3],
		['simpson13', 'x^3 + 1', 0, 2, 4, 6],
		['simpson38', 'e^x', 0, 4, 3, null],
		['midpoint', 'x^2', 0, 1, 4, 0.328125],
	] as const)('dispatches PPT example %s %s', (method, fn, a, b, n, expected) => {
		const result = computeIntegration(method, fn, a, b, n);
		if (expected !== null) expect(result.approximation).toBeCloseTo(expected);
		expect(result.error).toBeCloseTo(Math.abs(result.approximation - result.referenceValue));
	});
	it('reports relative error as N/A for zero analytic integral', () => {
		const result = computeIntegration('trapezoid', 'x^2', 1, 1, 1);
		expect(result.referenceValue).toBeCloseTo(0);
		expect(result.relativeError).toBeNull();
	});
	it('validates dispatch method, function, interval and n', () => {
		expect(() => computeIntegration('simpson13', 'x^2', 0, 1, 3)).toThrow(/even/);
		expect(() => computeIntegration('simpson38', 'e^x', 0, 1, 4)).toThrow(/multiple/);
		expect(() => computeIntegration('simpson38', 'x^2', 0, 1, 3)).toThrow(/not allowed for method/);
		expect(() => computeIntegration('trapezoid', '1/x', -1, 1, 2)).toThrow(/not allowed for method/);
		expect(() => computeIntegration('trapezoid', 'x^999' as never, 0, 1, 1)).toThrow(/Unknown function ID/);
		expect(() => computeIntegration('bad' as never, 'x^2', 0, 1, 1)).toThrow(/Unknown integration method/);
	});
});

describe('plot generators', () => {
	it('generates generic approximation points for all methods', () => {
		for (const method of ['trapezoid', 'simpson13', 'simpson38', 'midpoint'] as const) {
			const result = generatePlotPoints(x2, 0, 2, method === 'simpson13' ? 2 : method === 'simpson38' ? 3 : 1, method);
			expect(result.smooth.length).toBeGreaterThan(0);
			expect(result.approximation.length).toBeGreaterThan(0);
		}
	});
	it('generates each specialized method shape and rejects invalid n', () => {
		expect(generateTrapezoidPoints(x2, 0, 1, 1).fillPoints).toHaveLength(2);
		expect(generateSimpson13Points(x2, 0, 1, 2).fillPoints.length).toBe(31);
		expect(generateSimpson38Points(x2, 0, 1, 3).fillPoints.length).toBe(41);
		expect(generateMidpointPoints(x2, 0, 1, 2).fillPoints).toHaveLength(2);
		expect(() => generateSimpson13Points(x2, 0, 1, 3)).toThrow(/even/);
		expect(() => generateSimpson38Points(x2, 0, 1, 2)).toThrow(/n >= 3/);
	});
});
