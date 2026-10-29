/**
 * Approximates the integral of f from a to b using the trapezoidal rule
 * with n subintervals.
 *
 * @param {Function} f - The function to integrate
 * @param {number} a  - Lower limit of integration
 * @param {number} b  - Upper limit of integration
 * @param {number} n  - Number of subintervals (must be >= 1)
 * @returns {number} - Approximate value of the integral
 */
function trapezoidalRule(f, a, b, n) {
  const h = (b - a) / n;
  let result = (f(a) + f(b)) / 2;

  for (let i = 1; i < n; i++) {
    const x_i = a + i * h;
    result += f(x_i);
  }

  return h * result;
}

// Example usage
const f = (x) => x ** 2;
const a = 0;   // lower bound
const b = 2;   // upper bound
const n = 4;   // number of subintervals

const approx = trapezoidalRule(f, a, b, n);
const exact = (b ** 3 - a ** 3) / 3;
const error = Math.abs(approx - exact);

console.log(`Trapezoidal Approximation: ${approx.toFixed(6)}`);
console.log(`Exact Value:               ${exact.toFixed(6)}`);
console.log(`Error:                     ${error.toFixed(6)}`);
