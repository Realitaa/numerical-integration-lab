/**
 * Approximates the integral of f from a to b using Simpson's 3/8 rule
 * with n subintervals (n must be divisible by 3).
 *
 * @param {Function} f - The function to integrate
 * @param {number} a  - Lower limit of integration
 * @param {number} b  - Upper limit of integration
 * @param {number} n  - Number of subintervals (must be divisible by 3 and >= 3)
 * @returns {number} - Approximate value of the integral
 */
function simpsonsThreeEighthsRule(f, a, b, n) {
  if (n % 3 !== 0) {
    throw new Error("n must be a multiple of 3 for Simpson's 3/8 rule.");
  }

  const h = (b - a) / n;
  let result = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    const x_i = a + i * h;
    if (i % 3 === 0) {
      result += 2 * f(x_i);
    } else {
      result += 3 * f(x_i);
    }
  }

  return (3 * h) / 8 * result;
}

// Example usage
const f = (x) => x ** 2;
const a = 0;
const b = 3;
const n = 6;  // must be divisible by 3

const approx = simpsonsThreeEighthsRule(f, a, b, n);
const exact = (b ** 3 - a ** 3) / 3;
const error = Math.abs(approx - exact);

console.log(`Simpson's 3/8 Approximation: ${approx.toFixed(6)}`);
console.log(`Exact Value:                 ${exact.toFixed(6)}`);
console.log(`Error:                       ${error.toFixed(6)}`);
