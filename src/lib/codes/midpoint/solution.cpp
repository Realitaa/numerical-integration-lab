#include <iostream>
#include <cmath>
#include <functional>

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
double midpointRule(std::function<double(double)> f, double a, double b, int n) {
    double h = (b - a) / n;
    double result = 0;

    for (int i = 0; i < n; i++) {
        double mid = a + (i + 0.5) * h;
        result += f(mid);
    }

    return h * result;
}

int main() {
    auto f = [](double x) { return x * x; };
    double a = 0.0;
    double b = 2.0;
    int n = 4;

    double approx = midpointRule(f, a, b, n);
    double exact = (std::pow(b, 3) - std::pow(a, 3)) / 3.0;
    double error = std::abs(approx - exact);

    std::cout << "Midpoint Approximation: " << std::fixed << std::setprecision(6) << approx << std::endl;
    std::cout << "Exact Value:            " << std::fixed << std::setprecision(6) << exact << std::endl;
    std::cout << "Error:                  " << std::fixed << std::setprecision(6) << error << std::endl;

    return 0;
}
