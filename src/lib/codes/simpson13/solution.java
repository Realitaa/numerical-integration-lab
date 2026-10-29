public class SimpsonsOneThirdRule {

    @FunctionalInterface
    interface DoubleFunction {
        double apply(double x);
    }

    /**
     * Approximates the integral of f from a to b using Simpson's 1/3 rule
     * with n subintervals (n must be even).
     *
     * @param f the function to integrate
     * @param a lower limit of integration
     * @param b upper limit of integration
     * @param n number of subintervals (must be even and >= 2)
     * @return approximate value of the integral
     */
    public static double simpsonsOneThirdRule(DoubleFunction f, double a, double b, int n) {
        if (n % 2 != 0) {
            throw new IllegalArgumentException("n must be even for Simpson's 1/3 rule.");
        }

        double h = (b - a) / n;
        double result = f.apply(a) + f.apply(b);

        for (int i = 1; i < n; i++) {
            double x_i = a + i * h;
            if (i % 2 == 0) {
                result += 2 * f.apply(x_i);
            } else {
                result += 4 * f.apply(x_i);
            }
        }

        return (h / 3.0) * result;
    }

    public static void main(String[] args) {
        DoubleFunction f = x -> x * x;
        double a = 0;
        double b = 2;
        int n = 4;  // must be even

        double approx = simpsonsOneThirdRule(f, a, b, n);
        double exact = (Math.pow(b, 3) - Math.pow(a, 3)) / 3.0;
        double error = Math.abs(approx - exact);

        System.out.printf("Simpson's 1/3 Approximation: %.6f%n", approx);
        System.out.printf("Exact Value:                 %.6f%n", exact);
        System.out.printf("Error:                       %.6f%n", error);
    }
}
