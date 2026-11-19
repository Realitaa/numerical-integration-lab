export type MethodType = 'trapezoid' | 'simpson13' | 'simpson38' | 'midpoint';

import type { FunctionType } from './functionRegistry';
export type { FunctionType } from './functionRegistry';

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
	xMid?: number;
	yMid?: number;
	interiorPoints?: { x: number; y: number; weight: number }[];
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
	referenceValue: number;
	referenceKind: 'analytic' | 'numerical-estimate';
	referenceMethod: string;
	exact: number | null;
	approximation: number;
	error: number;
	relativeError: number | null;
	stepDetails: StepDetail[];
	needsEvenN: boolean;
}
