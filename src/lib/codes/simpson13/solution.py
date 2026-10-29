import math


def simpson_one_third_rule(f, a, b, n):
    """
    Approximates the integral of f from a to b using Simpson's 1/3 rule
    with n subintervals (n must be even).

    Parameters:
        f : callable -> function to integrate
        a : float    -> lower limit of integration
        b : float    -> upper limit of integration
        n : int      -> number of subintervals (must be even and >= 2)

    Returns:
        float -> approximate value of the integral
    """
    if n % 2 != 0:
        raise ValueError("n must be even for Simpson's 1/3 rule.")

    h = (b - a) / n
    result = f(a) + f(b)

    for i in range(1, n):
        x_i = a + i * h
        if i % 2 == 0:
            result += 2 * f(x_i)
        else:
            result += 4 * f(x_i)

    return (h / 3) * result


# Example usage
if __name__ == "__main__":
    def f(x):
        return x ** 2

    a = 0
    b = 2
    n = 4  # must be even

    approx = simpson_one_third_rule(f, a, b, n)
    exact = (b ** 3 - a ** 3) / 3.0
    error = abs(approx - exact)

    print(f"Simpson's 1/3 Approximation: {approx:.6f}")
    print(f"Exact Value:                 {exact:.6f}")
    print(f"Error:                       {error:.6f}")
