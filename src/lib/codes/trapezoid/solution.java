public class TrapezoidalRule {

    /**
     * Functional interface for the function to integrate.
     */
    @FunctionalInterface
    interface DoubleFunction {
        double apply(double x);
    }

    /**
     * Approximates the integral of f from a to b using the trapezoidal rule
     * with n subintervals.
     *
     * @param f the function to integrate
     * @param a lower limit of integration
     * @param b upper limit of integration
     * @param n number of subintervals (must be >= 1)
     * @return approximate value of the integral
     */
    public static double trapezoidalRule(DoubleFunction f, double a, double b, int n) {
        double h = (b - a) / n;
        double result = (f.apply(a) + f.apply(b)) / 2.0;

        for (int i = 1; i < n; i++) {
            double x_i = a + i * h;
            result += f.apply(x_i);
        }

        return h * result;
    }

    public static void main(String[] args) {
        DoubleFunction f = x -> x * x;  // f(x) = x^2
        double a = 0;                   // lower bound
        double b = 2;                   // upper bound
        int n = 4;                      // number of subintervals

        double approx = trapezoidalRule(f, a, b, n);
        double exact = (Math.pow(b, 3) - Math.pow(a, 3)) / 3.0;
        double error = Math.abs(approx - exact);

        System.out.printf("Trapezoidal Approximation: %.6f%n", approx);
        System.out.printf("Exact Value:               %.6f%n", exact);
        System.out.printf("Error:                     %.6f%n", error);
    }
}
