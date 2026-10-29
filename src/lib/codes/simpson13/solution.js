/**
 * Approximates the integral of f from a to b using Simpson's 1/3 rule
 * with n subintervals (n must be even).
 *
 * @param {Function} f - The function to integrate
 * @param {number} a  - Lower limit of integration
 * @param {number} b  - Upper limit of integration
 * @param {number} n  - Number of subintervals (must be even and >= 2)
 * @returns {number} - Approximate value of the integral
 */
function simpsonOneThirdRule(f, a, b, n) {
  if (n % 2 !== 0) {
    throw new Error("n must be even for Simpson's 1/3 rule.");
  }

  const h = (b - a) / n;
  let result = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    const x_i = a + i * h;
    if (i % 2 === 0) {
      result += 2 * f(x_i);
    } else {
      result += 4 * f(x_i);
    }
  }

  return (h / 3) * result;
}

// Example usage
const f = (x) => x ** 2;
const a = 0;
const b = 2;
const n = 4;  // must be even

const approx = simpsonOneThirdRule(f, a, b, n);
const exact = (b ** 3 - a ** 3) / 3;
const error = Math.abs(approx - exact);

console.log(`Simpson's 1/3 Approximation: ${approx.toFixed(6)}`);
console.log(`Exact Value:                 ${exact.toFixed(6)}`);
console.log(`Error:                       ${error.toFixed(6)}`);
