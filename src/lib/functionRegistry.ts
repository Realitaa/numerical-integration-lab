export interface FunctionDefinition {
	label: string;
	description: string;
	latex: string;
	evaluate: (x: number) => number;
	isInDomain: (x: number) => boolean;
	integral: ((a: number, b: number) => number) | null;
}

export const functionRegistry = {
	'x^2': {
		label: 'x²',
		description: 'f(x) = x²',
		latex: 'x^2',
		evaluate: (x: number) => x ** 2,
		isInDomain: (_x: number) => true,
		integral: (a: number, b: number) => (b ** 3 - a ** 3) / 3,
	},
	'x^2 + 1': {
		label: 'x² + 1',
		description: 'f(x) = x² + 1',
		latex: 'x^2 + 1',
		evaluate: (x: number) => x ** 2 + 1,
		isInDomain: (_x: number) => true,
		integral: (a: number, b: number) => (b ** 3 - a ** 3) / 3 + (b - a),
	},
	'x^3 + 1': {
		label: 'x³ + 1',
		description: 'f(x) = x³ + 1',
		latex: 'x^3 + 1',
		evaluate: (x: number) => x ** 3 + 1,
		isInDomain: (_x: number) => true,
		integral: (a: number, b: number) => (b ** 4 - a ** 4) / 4 + (b - a),
	},
	'e^x': {
		label: 'eˣ',
		description: 'f(x) = eˣ',
		latex: 'e^x',
		evaluate: (x: number) => Math.exp(x),
		isInDomain: (_x: number) => true,
		integral: (a: number, b: number) => Math.exp(b) - Math.exp(a),
	},
	'sin(x)': {
		label: 'sin(x)',
		description: 'f(x) = sin(x)',
		latex: '\\sin(x)',
		evaluate: (x: number) => Math.sin(x),
		isInDomain: (_x: number) => true,
		integral: (a: number, b: number) => Math.cos(a) - Math.cos(b),
	},
	'1/x': {
		label: '1/x',
		description: 'f(x) = 1/x (x ≠ 0)',
		latex: '\\frac{1}{x}',
		evaluate: (x: number) => 1 / x,
		isInDomain: (x: number) => x !== 0,
		integral: (a: number, b: number) => Math.log(Math.abs(b)) - Math.log(Math.abs(a)),
	},
	'abs(x)': {
		label: '|x|',
		description: 'f(x) = |x|',
		latex: '|x|',
		evaluate: (x: number) => Math.abs(x),
		isInDomain: (_x: number) => true,
		integral: null,
	},
	'sqrt(x)': {
		label: '√x',
		description: 'f(x) = √x (x ≥ 0)',
		latex: '\\sqrt{x}',
		evaluate: (x: number) => Math.sqrt(x),
		isInDomain: (x: number) => x >= 0,
		integral: (a: number, b: number) => (2 / 3) * (b ** 1.5 - a ** 1.5),
	},
} as const satisfies Record<string, FunctionDefinition>;

export type FunctionType = keyof typeof functionRegistry;
export type RegisteredFunction = (typeof functionRegistry)[FunctionType];

export const methodFunctionIds = {
	trapezoid: ['x^2 + 1', 'x^2'],
	simpson13: ['x^2', 'x^3 + 1'],
	simpson38: ['e^x'],
	midpoint: ['x^2'],
} as const satisfies Record<string, readonly FunctionType[]>;

export const methodExampleDefaults = {
	trapezoid: { functionId: 'x^2 + 1', a: 0, b: 2, n: 1 },
	simpson13: { functionId: 'x^2', a: 0, b: 2, n: 2 },
	simpson38: { functionId: 'e^x', a: 0, b: 4, n: 3 },
	midpoint: { functionId: 'x^2', a: 0, b: 1, n: 4 },
} as const satisfies Record<keyof typeof methodFunctionIds, { functionId: FunctionType; a: number; b: number; n: number }>;

export type RegisteredMethodType = keyof typeof methodFunctionIds;

export function isRegisteredMethod(method: string): method is RegisteredMethodType {
	return Object.prototype.hasOwnProperty.call(methodFunctionIds, method);
}

export function getFunctionsForMethod(method: RegisteredMethodType): FunctionType[] {
	return [...methodFunctionIds[method]];
}

export function getDefaultFunctionForMethod(method: RegisteredMethodType): FunctionType {
	return methodExampleDefaults[method].functionId;
}

export function isFunctionAllowedForMethod(method: string, id: string): boolean {
	return isRegisteredMethod(method) && isFunctionType(id) && (methodFunctionIds[method] as readonly string[]).includes(id);
}

export function getMethodFunctionConfig(method: RegisteredMethodType) {
	const functionIds = methodFunctionIds[method];
	const defaults = methodExampleDefaults[method];
	return {
		functionIds,
		defaultFunctionId: defaults.functionId,
		selectionMode: functionIds.length > 1 ? 'dropdown' as const : 'static' as const,
		defaults,
	};
}

export function isFunctionSelectionLocked(method: RegisteredMethodType): boolean {
	return getMethodFunctionConfig(method).selectionMode === 'static';
}

export const functionList = Object.entries(functionRegistry).map(([id, definition]) => ({
	id: id as FunctionType,
	label: definition.label,
	description: definition.description,
}));

export function isFunctionType(id: string): id is FunctionType {
	return Object.prototype.hasOwnProperty.call(functionRegistry, id);
}

export function getFunctionDefinition(id: string): RegisteredFunction {
	if (!isFunctionType(id)) throw new Error(`Unknown function ID: ${id}`);
	return functionRegistry[id];
}

export function validateFunctionInterval(id: string, a: number, b: number): void {
	const definition = getFunctionDefinition(id);
	if (!Number.isFinite(a) || !Number.isFinite(b)) {
		throw new RangeError('Integration bounds a and b must be finite numbers.');
	}

	const lower = Math.min(a, b);
	const upper = Math.max(a, b);
	if (!definition.isInDomain(lower) || !definition.isInDomain(upper)) {
		throw new RangeError(`Function ${id} is not defined on the full interval [${lower}, ${upper}].`);
	}
	if (id === '1/x' && lower < 0 && upper > 0) {
		throw new RangeError('Function 1/x has a singularity inside the integration interval.');
	}

	const samples = 100;
	for (let i = 0; i <= samples; i++) {
		const x = lower + ((upper - lower) * i) / samples;
		const value = definition.evaluate(x);
		if (!Number.isFinite(value)) {
			throw new RangeError(`Function ${id} is not finite on the integration interval (x=${x}).`);
		}
	}
}

export function getFunction(id: string): (x: number) => number {
	const definition = getFunctionDefinition(id);
	return (x) => {
		if (!Number.isFinite(x) || !definition.isInDomain(x)) {
			throw new RangeError(`Function ${id} is not defined at x=${x}.`);
		}
		const value = definition.evaluate(x);
		if (!Number.isFinite(value)) throw new RangeError(`Function ${id} is not finite at x=${x}.`);
		return value;
	};
}

export function getFunctionName(id: string): string {
	return getFunctionDefinition(id).latex;
}
