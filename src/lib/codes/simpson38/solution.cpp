#include <iostream>
#include <cmath>
#include <functional>
#include <stdexcept>

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
double simpsonsThreeEighthsRule(std::function<double(double)> f, double a, double b, int n) {
    if (n % 3 != 0) {
        throw std::invalid_argument("n must be a multiple of 3 for Simpson's 3/8 rule.");
    }

    double h = (b - a) / n;
    double result = f(a) + f(b);

    for (int i = 1; i < n; i++) {
        double x_i = a + i * h;
        if (i % 3 == 0) {
            result += 2 * f(x_i);
        } else {
            result += 3 * f(x_i);
        }
    }

    return (3 * h) / 8.0 * result;
}

int main() {
    auto f = [](double x) { return x * x; };
    double a = 0.0;
    double b = 3.0;
    int n = 6;  // must be divisible by 3

    double approx = simpsonsThreeEighthsRule(f, a, b, n);
    double exact = (std::pow(b, 3) - std::pow(a, 3)) / 3.0;
    double error = std::abs(approx - exact);

    std::cout << "Simpson's 3/8 Approximation: " << std::fixed << std::setprecision(6) << approx << std::endl;
    std::cout << "Exact Value:                 " << std::fixed << std::setprecision(6) << exact << std::endl;
    std::cout << "Error:                       " << std::fixed << std::setprecision(6) << error << std::endl;

    return 0;
}
