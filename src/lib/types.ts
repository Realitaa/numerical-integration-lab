export type MethodType = 'trapezoid' | 'simpson13' | 'simpson38' | 'midpoint';

export type FunctionType = 'x^2' | 'sin(x)' | 'e^x' | '1/x' | 'sqrt(x)';

export interface MathFunction {
	id: FunctionType;
	label: string;
	description: string;
}

export interface SubInterval {
	x: number;
	y: number;
}

export interface StepDetail {
	index: number;
	a: number;
	b: number;
	yA: number;
	yB: number;
	contribution: number;
	approximate: boolean;
}

export interface ComputationResult {
	method: MethodType;
	function: MathFunction;
	a: number;
	b: number;
	n: number;
	h: number;
	exact: number;
	approximation: number;
	error: number;
	relativeError: number;
	stepDetails: StepDetail[];
	needsEvenN: boolean;
}
