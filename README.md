# Numerical Integration Lab 🧪📊

An interactive, modern web application designed to explore, calculate, and visualize numerical integration methods. Built with **Svelte 5**, **Tailwind CSS**, and **Shadcn-Svelte**.

---

## ✨ Features

- **Dynamic Reactive Navigation:** Seamlessly switch between different numerical integration methods using reactive URL query parameters (`/?method=trapezoid`, `/?method=simpson13`, `/?method=simpson38`, `/?method=midpoint`).
- **Interactive Calculator (Resizable Panels):** 
  - **Left Panel:** Input controls for functions ($x^2, \sin(x), e^x$, etc.), lower bound ($a$), upper bound ($b$), and number of subintervals ($n$).
  - **Right Panel:** Live, step-by-step mathematical calculations rendered cleanly using `svelte-math`.
- **Graphical Visualization:** Real-time chart rendering via `svelte-chartjs` and Chart.js, visualizing smooth original curves alongside geometric approximation shapes (trapezoids, midpoints, or parabolic segments) without external heavy plugins.
- **Multi-Language Code Implementation Tabs:** Inspect production-ready code implementations in **Python, JavaScript, Java, and C++**, cleanly imported as raw assets via Vite (`?raw`).
- **Theme Switcher:** Fully supports Light, Dark, and System modes with a customized pastel cyan-green aesthetic inspired by presentation slides.

---

## 🛠️ Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/) (Vite)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn-Svelte](https://www.shadcn-svelte.com/)
- **Math Rendering:** `svelte-math`
- **Charts:** `Chart.js` & `svelte-chartjs`
- **Language:** TypeScript

---

## 📂 Project Structure

```text
.
├── src
│   ├── App.svelte                # Main layout, router & query param state handler
│   ├── app.css                   # Tailwind & custom CSS variables configuration
│   ├── lib
│   │   ├── components            # UI components (Sidebar, Calculator, Chart, etc.)
│   │   ├── codes                 # Raw code implementations (?raw imports)
│   │   │   ├── trapezoid/
│   │   │   ├── simpson13/
│   │   │   ├── simpson38/
│   │   │   └── midpoint/
│   │   ├── data                  # Method metadata, formulas, and theories
│   │   └── mathUtils.ts          # Core numerical integration calculation logic
│   └── main.ts
├── package.json
└── vite.config.ts

```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and a package manager like `pnpm`, `npm`, or `yarn` installed.

### Installation & Run

1. **Clone the repository:**
```bash
git clone [https://github.com/Realitaa/numerical-integration-lab.git](https://github.com/Realitaa/numerical-integration-lab.git)
cd numerical-integration-lab

```


2. **Install dependencies:**
```bash
pnpm install
# or npm install

```


3. **Run the development server:**
```bash
pnpm dev
# or npm run dev

```


4. Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal).

---

## 📚 Covered Numerical Methods

1. **Trapezoid Rule:** Approximates the area under the curve using linear interpolation (straight lines forming trapezoids).
2. **Simpson's 1/3 Rule:** Uses quadratic polynomials (parabolic segments) to approximate the curve, requiring an even number of subintervals ($n$).
3. **Simpson's 3/8 Rule:** Utilizes cubic interpolation requiring subintervals divisible by 3 for higher accuracy.
4. **Midpoint Rule:** Approximates the integral using rectangular blocks evaluated at the midpoint of each subinterval.

---

## 📄 License

Distributed under the **MIT License**. Feel free to use this project for educational purposes or academic references.
