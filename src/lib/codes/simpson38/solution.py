import math


def simpson_three_eighths_rule(f, a, b, n):
    """
    Approximates the integral of f from a to b using Simpson's 3/8 rule
    with n subintervals (n must be divisible by 3).

    Parameters:
        f : callable -> function to integrate
        a : float    -> lower limit of integration
        b : float    -> upper limit of integration
        n : int      -> number of subintervals (must be divisible by 3 and >= 3)

    Returns:
        float -> approximate value of the integral
    """
    if n % 3 != 0:
        raise ValueError("n must be a multiple of 3 for Simpson's 3/8 rule.")

    h = (b - a) / n
    result = f(a) + f(b)

    for i in range(1, n):
        x_i = a + i * h
        if i % 3 == 0:
            result += 2 * f(x_i)
        else:
            result += 3 * f(x_i)

    return (3 * h) / 8 * result


# Example usage
if __name__ == "__main__":
    def f(x):
        return x ** 2

    a = 0
    b = 3
    n = 6  # must be divisible by 3

    approx = simpson_three_eighths_rule(f, a, b, n)
    exact = (b ** 3 - a ** 3) / 3.0
    error = abs(approx - exact)

    print(f"Simpson's 3/8 Approximation: {approx:.6f}")
    print(f"Exact Value:                 {exact:.6f}")
    print(f"Error:                       {error:.6f}")
