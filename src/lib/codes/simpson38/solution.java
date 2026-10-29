public class SimpsonsThreeEighthsRule {

    @FunctionalInterface
    interface DoubleFunction {
        double apply(double x);
    }

    /**
     * Approximates the integral of f from a to b using Simpson's 3/8 rule
     * with n subintervals (n must be divisible by 3).
     *
     * @param f the function to integrate
     * @param a lower limit of integration
     * @param b upper limit of integration
     * @param n number of subintervals (must be divisible by 3 and >= 3)
     * @return approximate value of the integral
     */
    public static double simpsonsThreeEighthsRule(DoubleFunction f, double a, double b, int n) {
        if (n % 3 != 0) {
            throw new IllegalArgumentException("n must be a multiple of 3 for Simpson's 3/8 rule.");
        }

        double h = (b - a) / n;
        double result = f.apply(a) + f.apply(b);

        for (int i = 1; i < n; i++) {
            double x_i = a + i * h;
            if (i % 3 == 0) {
                result += 2 * f.apply(x_i);
            } else {
                result += 3 * f.apply(x_i);
            }
        }

        return (3 * h) / 8.0 * result;
    }

    public static void main(String[] args) {
        DoubleFunction f = x -> x * x;
        double a = 0;
        double b = 3;
        int n = 6;  // must be divisible by 3

        double approx = simpsonsThreeEighthsRule(f, a, b, n);
        double exact = (Math.pow(b, 3) - Math.pow(a, 3)) / 3.0;
        double error = Math.abs(approx - exact);

        System.out.printf("Simpson's 3/8 Approximation: %.6f%n", approx);
        System.out.printf("Exact Value:                 %.6f%n", exact);
        System.out.printf("Error:                       %.6f%n", error);
    }
}
