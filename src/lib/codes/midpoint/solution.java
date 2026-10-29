public class MidpointRule {

    @FunctionalInterface
    interface DoubleFunction {
        double apply(double x);
    }

    /**
     * Approximates the integral of f from a to b using the midpoint rule
     * with n subintervals.
     *
     * @param f the function to integrate
     * @param a lower limit of integration
     * @param b upper limit of integration
     * @param n number of subintervals (must be >= 1)
     * @return approximate value of the integral
     */
    public static double midpointRule(DoubleFunction f, double a, double b, int n) {
        double h = (b - a) / n;
        double result = 0;

        for (int i = 0; i < n; i++) {
            double mid = a + (i + 0.5) * h;
            result += f.apply(mid);
        }

        return h * result;
    }

    public static void main(String[] args) {
        DoubleFunction f = x -> x * x;
        double a = 0;
        double b = 2;
        int n = 4;

        double approx = midpointRule(f, a, b, n);
        double exact = (Math.pow(b, 3) - Math.pow(a, 3)) / 3.0;
        double error = Math.abs(approx - exact);

        System.out.printf("Midpoint Approximation: %.6f%n", approx);
        System.out.printf("Exact Value:            %.6f%n", exact);
        System.out.printf("Error:                  %.6f%n", error);
    }
}
