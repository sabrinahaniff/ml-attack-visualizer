import Quiz from "./Quiz"

const max = (a, b) => a > b ? a : b
const exp = (x) => window.Math.exp(x)
const pow = (x, y) => window.Math.pow(x, y)

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
            return `${x},${max(5, y)}`
          }).join(" ")}
          fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round"
        />
        <text x="205" y="135" fontSize="11" fill="#9aa0a6">0</text>
        <text x="320" y="135" fontSize="11" fill="#9aa0a6">+x</text>
        <text x="55" y="135" fontSize="11" fill="#9aa0a6">-x</text>
        <text x="205" y="15" fontSize="11" fill="#9aa0a6">f(x)</text>
      </svg>
      <p style={{ fontSize: 13, margin: "0.75rem 0 0" }}>
        At x=0, the curve is flat. Small changes in x barely change f(x). At x=3, the curve is steep. A tiny change in x causes a large change in f(x). That steepness is the derivative.
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
        For f(x) = x², the derivative is f'(x) = 2x. At x=3, slope is 6. At x=0, slope is 0. The derivative tells you exactly how sensitive the output is to changes in the input at every point.
      </p>
    </div>
  )
}

export default function MathFoundations() {
  return (
    <div>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.7 }}>
        Before understanding any of these attacks, you need three mathematical ideas: functions, derivatives, and gradients. These are the foundation everything else is built on.
      </p>

      <h3>1. What is a function?</h3>
      <p>
        A function takes an input and produces an output. Written as f(x), where x is the input and f(x) is the output. You give it something, it gives you something back.
      </p>
      <p>
        Example: f(x) = x². If you put in x=3, you get f(3) = 9. If you put in x=5, you get f(5) = 25. The function defines the relationship between input and output.
      </p>
      <FunctionViz />
      <p>
        In machine learning, the model itself is a function. You put in pixel values, it outputs class probabilities. The loss function takes those probabilities and outputs a single number measuring how wrong the model is.
      </p>

      <h3>2. What is a derivative?</h3>
      <p>
        The derivative of a function at a given point tells you the slope of the function at that point. Slope means: how fast is the output changing as the input changes?
      </p>
      <p>
        If the slope is steep, a tiny change in input causes a large change in output. If the slope is flat, a tiny change in input barely changes the output. The derivative f'(x) answers: if I increase x by a tiny amount, how much does f(x) change?
      </p>
      <DerivativeViz />
      <div className="callout">
        <p>Why derivatives matter for ML: during training, the model computes the derivative of the loss function with respect to every weight. This tells the model whether increasing or decreasing each weight would reduce loss. The model then adjusts all weights accordingly.</p>
      </div>

      <h3>3. What is a partial derivative?</h3>
      <p>
        A regular derivative works when a function has one input. Most ML functions have thousands of inputs. A partial derivative extends the idea to multiple inputs by measuring how the output changes when you vary one input while holding all others constant.
      </p>
      <p>
        If f(x, y) = x² + y², the partial derivative with respect to x is 2x. The partial derivative with respect to y is 2y. Each one isolates the effect of a single input.
      </p>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Example with two inputs</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, background: "var(--surface2)", padding: "0.75rem 1rem", borderRadius: 8 }}>
          <div>f(x, y) = x² + y²</div>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>df/dx = 2x &nbsp; (effect of x on f)</div>
          <div style={{ color: "var(--muted)" }}>df/dy = 2y &nbsp; (effect of y on f)</div>
          <div style={{ marginTop: 6 }}>At point (3, 2):</div>
          <div style={{ color: "var(--accent)" }}>df/dx = 6 &nbsp; df/dy = 4</div>
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>x is changing faster than y at this point</div>
        </div>
      </div>
      <p>
        In FGSM, you compute the partial derivative of the loss with respect to every single pixel. Each one tells you: if I change this pixel slightly, how much does the loss change?
      </p>

      <h3>4. What is a gradient?</h3>
      <p>
        The gradient is the collection of all partial derivatives packed into a single vector. For a function with 150,000 pixel inputs, the gradient is a vector with 150,000 values, one per pixel.
      </p>
      <p>
        The gradient points in the direction of steepest increase of the function. Follow the gradient and the function increases as fast as possible. Go against the gradient and it decreases as fast as possible.
      </p>
      <div className="callout green">
        <p>In training: compute the gradient of the loss, then move the model weights in the opposite direction. This reduces loss. This is called gradient descent.</p>
      </div>
      <div className="callout">
        <p>In FGSM: compute the gradient of the loss with respect to the input pixels, then move the pixels in the same direction as the gradient. This increases loss. The model gets maximally confused.</p>
      </div>

      <h3>5. What is backpropagation?</h3>
      <p>
        A neural network is hundreds of functions stacked on top of each other. Computing the gradient of the final loss with respect to every weight requires the chain rule from calculus applied backwards through every layer. That is what backpropagation does.
      </p>
      <p>
        You do not need to understand the chain rule derivation. What matters: when you call <code>loss.backward()</code> in PyTorch, it runs backpropagation automatically and gives you the gradient of the loss with respect to every parameter you asked it to track.
      </p>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Forward and backward pass</div>
        {[
          ["Forward pass", "Input flows through every layer. The model predicts. Loss is computed."],
          ["Backward pass", "PyTorch walks backwards through every layer using the chain rule. Gradients computed for every tracked parameter."],
          ["Update", "Parameters adjusted using their gradients. In training: reduce loss. In FGSM: increase loss."]
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
          "The direction and rate of steepest increase of the loss function",
          "The average loss across all training samples",
          "How many layers the neural network has"
        ]}
        correct={1}
        explanation="The gradient is a vector of partial derivatives pointing in the direction of steepest increase. In training you move against it to reduce loss. In FGSM you move with it to increase loss."
      />

      <Quiz
        question="What is the difference between a derivative and a partial derivative?"
        options={[
          "A derivative is more accurate than a partial derivative",
          "A derivative measures rate of change for a function with one input. A partial derivative does the same for functions with multiple inputs, isolating the effect of one input at a time.",
          "Partial derivatives are only used in deep learning",
          "There is no difference"
        ]}
        correct={1}
        explanation="A derivative handles one input. A partial derivative handles multiple inputs by isolating the effect of each one individually. The gradient collects all partial derivatives into a single vector."
      />
    </div>
  )
}