/**
 * Approximates the integral of f from a to b using the midpoint rule
 * with n subintervals.
 *
 * @param {Function} f - The function to integrate
 * @param {number} a  - Lower limit of integration
 * @param {number} b  - Upper limit of integration
 * @param {number} n  - Number of subintervals (must be >= 1)
 * @returns {number} - Approximate value of the integral
 */
function midpointRule(f, a, b, n) {
  const h = (b - a) / n;
  let result = 0;

  for (let i = 0; i < n; i++) {
    const mid = a + (i + 0.5) * h;
    result += f(mid);
  }

  return h * result;
}

// Example usage
const f = (x) => x ** 2;
const a = 0;
const b = 2;
const n = 4;

const approx = midpointRule(f, a, b, n);
const exact = (b ** 3 - a ** 3) / 3;
const error = Math.abs(approx - exact);

console.log(`Midpoint Approximation: ${approx.toFixed(6)}`);
console.log(`Exact Value:            ${exact.toFixed(6)}`);
console.log(`Error:                  ${error.toFixed(6)}`);
