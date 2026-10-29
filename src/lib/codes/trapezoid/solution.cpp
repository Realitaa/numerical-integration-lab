#include <iostream>
#include <cmath>
#include <functional>

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
double trapezoidalRule(std::function<double(double)> f, double a, double b, int n) {
    double h = (b - a) / n;
    double result = (f(a) + f(b)) / 2.0;

    for (int i = 1; i < n; i++) {
        double x_i = a + i * h;
        result += f(x_i);
    }

    return h * result;
}

int main() {
    // Define f(x) = x^2
    auto f = [](double x) { return x * x; };

    double a = 0.0;  // lower bound
    double b = 2.0;  // upper bound
    int n = 4;       // number of subintervals

    double approx = trapezoidalRule(f, a, b, n);
    double exact = (std::pow(b, 3) - std::pow(a, 3)) / 3.0;
    double error = std::abs(approx - exact);

    std::cout << "Trapezoidal Approximation: " << std::fixed << std::setprecision(6) << approx << std::endl;
    std::cout << "Exact Value:               " << std::fixed << std::setprecision(6) << exact << std::endl;
    std::cout << "Error:                     " << std::fixed << std::setprecision(6) << error << std::endl;

    return 0;
}
