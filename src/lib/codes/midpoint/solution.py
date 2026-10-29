import math


def midpoint_rule(f, a, b, n):
    """
    Approximates the integral of f from a to b using the midpoint rule
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
    result = 0.0

    for i in range(n):
        mid = a + (i + 0.5) * h
        result += f(mid)

    return h * result


# Example usage
if __name__ == "__main__":
    def f(x):
        return x ** 2

    a = 0
    b = 2
    n = 4

    approx = midpoint_rule(f, a, b, n)
    exact = (b ** 3 - a ** 3) / 3.0
    error = abs(approx - exact)

    print(f"Midpoint Approximation: {approx:.6f}")
    print(f"Exact Value:            {exact:.6f}")
    print(f"Error:                  {error:.6f}")
