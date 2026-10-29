import math


def trapezoidal_rule(f, a, b, n):
    """
    Approximates the integral of f from a to b using the trapezoidal rule
    with n subintervals.

    Parameters:
        f : callable -> function to integrate
        a : float    -> lower limit of integration
        b : float    -> upper limit of integration
        n : int      -> number of subintervals (must be >= 1)

    Returns:
        float -> approximate value of the integral
    """
    h = (b - a) / n
    result = (f(a) + f(b)) / 2.0

    for i in range(1, n):
        x_i = a + i * h
        result += f(x_i)

    return h * result


# Example usage
if __name__ == "__main__":
    # Define the function f(x) = x^2
    def f(x):
        return x ** 2

    a = 0       # lower bound
    b = 2       # upper bound
    n = 4       # number of subintervals

    approx = trapezoidal_rule(f, a, b, n)
    exact = (b ** 3 - a ** 3) / 3.0
    error = abs(approx - exact)

    print(f"Trapezoidal Approximation: {approx:.6f}")
    print(f"Exact Value:               {exact:.6f}")
    print(f"Error:                     {error:.6f}")
