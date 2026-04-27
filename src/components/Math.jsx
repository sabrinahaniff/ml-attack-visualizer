import Quiz from "./Quiz"

function FunctionViz() {
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
        f(x) = x²; the output changes based on the input
      </div>
      <svg width="100%" viewBox="0 0 400 160" style={{ maxWidth: 400 }}>
        <line x1="0" y1="120" x2="400" y2="120" stroke="#e8eaed" strokeWidth="1" />
        <line x1="200" y1="0" x2="200" y2="160" stroke="#e8eaed" strokeWidth="1" />
        <polyline
          points={Array.from({ length: 80 }, (_, i) => {
            const x = (i / 79) * 400
            const val = (i - 39.5) / 10
            const y = 120 - val * val * 8
            return `${x},${Math.max(5, y)}`
          }).join(" ")}
          fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round"
        />
        <text x="205" y="135" fontSize="11" fill="#9aa0a6">0</text>
        <text x="320" y="135" fontSize="11" fill="#9aa0a6">+x</text>
        <text x="55" y="135" fontSize="11" fill="#9aa0a6">-x</text>
        <text x="205" y="15" fontSize="11" fill="#9aa0a6">f(x)</text>
      </svg>
      <p style={{ fontSize: 13, margin: "0.75rem 0 0" }}>
        At x=0, the curve is flat; meaning small changes in x barely change f(x).And at x=3, the curve is steep; meaning a tiny change in x causes a large change in f(x). That steepness is the derivative.
      </p>
    </div>
  )
}

function DerivativeViz() {
  return (
    <div className="card">
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Slope at different points on f(x) = x²</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[[-3, -6], [-1, -2], [0, 0], [1, 2], [3, 6]].map(([x, slope]) => (
          <div key={x} style={{ flex: 1, minWidth: 70, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 4 }}>x = {x}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: slope === 0 ? "var(--faint)" : slope > 0 ? "var(--accent)" : "var(--red)" }}>{slope}</div>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>slope</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, margin: "0.75rem 0 0" }}>
        For f(x) = x², the derivative is f'(x) = 2x. At x=3, slope is 6; this is steep. At x=0, slope is 0; this is flat. The derivative tells you exactly how sensitive the output is to changes in the input at every point.
      </p>
    </div>
  )
}

export default function Math() {
  return (
    <div>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.7 }}>
        Before understanding any of these attacks, it is best to understand three mathematical ideas: functions, derivatives, and gradients. These are the foundation everything else is built on.
      </p>

      {/* Functions */}
      <h3>1. What is a function?</h3>
      <p>
        A function takes an input and produces an output. You give it something, it gives you something back. Written as f(x), where x is the input and f(x) is the output.
      </p>
      <p>
        Example: f(x) = x². If you put in x=3, you get f(3) = 9. If you put in x=5, you get f(5) = 25. The function defines the relationship between input and output.
      </p>
      <FunctionViz />
      <p>
        In machine learning, the model itself is a function. You put in pixel values, it outputs class probabilities. The loss function takes those probabilities and outputs a single number measuring how wrong the model is.
      </p>

      {/* Derivatives */}
      <h3>2. What is a derivative?</h3>
      <p>
        The derivative of a function at a given point tells you the slope of the function at that point. Slope just means: how fast is the output changing as the input changes?
      </p>
      <p>
        If the slope is steep, a tiny change in input causes a large change in output. If the slope is flat, a tiny change in input barely changes the output.
      </p>
      <p>
        Formally: the derivative f'(x) answers the question "if I increase x by an infinitesimally small amount, how much does f(x) change?" It is the rate of change of the function at that point.
      </p>
      <DerivativeViz />

      <div className="callout">
        <p>Why derivatives matter for ML: during training, the model computes the derivative of the loss function with respect to every weight. This tells the model; if I increase this weight slightly, does the loss go up or down? The model then adjusts all weights in the direction that reduces loss.</p>
      </div>

      {/* Partial Derivatives */}
      <h3>3. What is a partial derivative?</h3>
      <p>
        A regular derivative works when a function has one input. But most ML functions have thousands of inputs (weights, pixels, etc.). A partial derivative extends the idea to multiple inputs.
      </p>
      <p>
        If f(x, y) = x² + y², the partial derivative with respect to x asks: holding y constant, how fast does f change as x changes? The answer is 2x. The partial derivative with respect to y asks the same thing for y. The answer is 2y.
      </p>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Example with two inputs</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, background: "var(--surface2)", padding: "0.75rem 1rem", borderRadius: 8, color: "var(--text)" }}>
          <div>f(x, y) = x² + y²</div>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>∂f/∂x = 2x  (how fast f changes as x changes)</div>
          <div style={{ color: "var(--muted)" }}>∂f/∂y = 2y  (how fast f changes as y changes)</div>
          <div style={{ marginTop: 6 }}>At point (3, 2):</div>
          <div style={{ color: "var(--accent)" }}>∂f/∂x = 6, ∂f/∂y = 4</div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>x is changing faster than y at this point</div>
        </div>
      </div>
      <p>
        In FGSM, you compute the partial derivative of the loss with respect to every single pixel. Each partial derivative tells you: if I change this one pixel slightly, how much does the loss change?
      </p>

      {/* Gradient */}
      <h3>4. What is a gradient?</h3>
      <p>
        The gradient is just the collection of all partial derivatives packaged together as a vector. For a function with thousands of inputs, the gradient is a vector with thousands of values; one partial derivative per input.
      </p>
      <p>
        The gradient points in the direction of steepest increase of the function. If you follow the gradient, the function increases as fast as possible. If you go against the gradient, the function decreases as fast as possible.
      </p>
      <div className="callout green">
        <p>In training: you compute the gradient of the loss, then move the model weights in the opposite direction (against the gradient). This reduces loss. Called gradient descent.</p>
      </div>
      <div className="callout">
        <p>In FGSM: you compute the gradient of the loss with respect to the input pixels, then move the pixels in the same direction as the gradient. This increases loss. The model gets maximally confused.</p>
      </div>

      {/* Backpropagation */}
      <h3>5. What is backpropagation?</h3>
      <p>
        A neural network is a composition of many functions stacked on top of each other. Layer 1 takes input and produces output. Layer 2 takes Layer 1's output and produces its own output. And so on through hundreds of layers.
      </p>
      <p>
        Computing the gradient of the final loss with respect to every single weight across every single layer requires the chain rule from calculus. Backpropagation is the algorithm that efficiently applies the chain rule backwards through every layer to compute all these gradients in one pass.
      </p>
      <p>
        Understanding the math of backpropagation in detail is not needed. What matters is: when you call <code>loss.backward()</code> in PyTorch, it runs backpropagation automatically and gives you the gradient of the loss with respect to every parameter you asked it to track.
      </p>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>The forward and backward pass</div>
        {[
          ["Forward pass", "Input flows through every layer. The model makes a prediction. Loss is computed."],
          ["Backward pass", "PyTorch walks backwards through every layer using the chain rule. Gradients are computed for every tracked parameter."],
          ["Update", "Parameters are adjusted using their gradients to reduce loss (in training) or inputs are adjusted to increase loss (in FGSM)."]
        ].map(([title, desc], i) => (
          <div key={i} className="step">
            <div className="step-num">{i + 1}</div>
            <div className="step-text"><strong>{title}:</strong> {desc}</div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <Quiz
        question="The gradient of a loss function at a given point tells you what?"
        options={[
          "The exact value of the loss at that point",
          "The direction and rate of steepest increase of the loss",
          "The average loss across all training samples",
          "How many layers the neural network has"
        ]}
        correct={1}
        explanation="The gradient is a vector of partial derivatives that points in the direction of steepest increase of the function. In training you move against it to reduce loss. In FGSM you move with it to increase loss."
      />

      <Quiz
        question="What is the difference between a derivative and a partial derivative?"
        options={[
          "A derivative is more accurate than a partial derivative",
          "A derivative works for functions with one input. A partial derivative extends this to functions with many inputs by measuring how the output changes when you vary one input while holding all others constant.",
          "A partial derivative is only used in deep learning",
          "There is no difference, they are the same thing"
        ]}
        correct={1}
        explanation="Correct. A derivative handles one input. A partial derivative handles multiple inputs by isolating the effect of each one individually. The gradient collects all partial derivatives into a single vector."
      />
    </div>
  )
}