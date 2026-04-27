import { useState } from "react"
import Quiz from "./Quiz"

function PixelGrid({ epsilon }) {
  const signs = [1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,1,-1,1]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 28px)", gap: 3, margin: "0.75rem 0" }}>
      {signs.map((g, i) => {
        const intensity = Math.min(220, Math.round(epsilon * 2.2))
        const r = g > 0 ? intensity : 20
        const b = g < 0 ? intensity : 20
        return (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: 4,
            background: `rgb(${r},20,${b})`,
            transition: "background 0.2s",
            border: "1px solid rgba(0,0,0,0.05)"
          }} />
        )
      })}
    </div>
  )
}

export default function FGSM() {
  const [eps, setEps] = useState(10)
  const epsilon = (eps / 1000).toFixed(3)
  const visible = eps > 50

  return (
    <div>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.7 }}>
        The Fast Gradient Sign Method is one of the foundational adversarial attacks in ML security. It shows that a trained image classifier can be completely fooled by making pixel changes so small a human cannot see them.
      </p>

      <h3>What the model actually sees</h3>
      <p>
        A neural network does not see images the way humans do. It sees a grid of numbers. Each pixel is a value between 0 and 255 across three color channels (red, green, blue). ResNet50 takes roughly 150,000 of these numbers, processes them through hundreds of layers of matrix multiplication, and outputs a probability score for each possible class label.
      </p>
      <p>
        You see a cat. The model sees a 150,000-dimensional numerical vector. This distinction is important because it means small coordinated changes to those numbers can completely shift which pattern the model recognizes, even when the image looks identical to a human.
      </p>

      <h3>Loss in the context of image classification</h3>
      <p>
        The loss function measures how wrong the model is on a given prediction. When the true label is "tiger cat" and the model outputs "tiger cat: 99%", loss is nearly zero. When the model outputs "Egyptian Mau: 87%" for that same image, loss is high.
      </p>
      <p>
        More precisely, for classification tasks the loss is typically cross-entropy: it measures the difference between the model's predicted probability distribution and the true distribution (which is 100% probability on the correct class).
      </p>
      <div className="callout">
        <p>The attacker's goal is to maximize loss. Maximizing loss means forcing the model to be as wrong as possible about what it is looking at.</p>
      </div>

      <h3>Applying the gradient to pixels</h3>
      <p>
        From the math foundations section, you know the gradient points in the direction of steepest increase of a function. In FGSM, you compute the gradient of the loss with respect to the input pixels.
      </p>
      <p>
        For each pixel, the gradient answers: if I increase this pixel's value by a tiny amount, how much does the loss increase? A large positive gradient on a pixel means increasing that pixel strongly increases loss. A large negative gradient means decreasing that pixel strongly increases loss.
      </p>
      <p>
        In PyTorch, this requires one key change from normal training. You set <code>image.requires_grad = True</code> to tell PyTorch to track gradients for the image pixels, not just the model weights. Then <code>loss.backward()</code> computes those gradients automatically.
      </p>

      <h3>The sign function</h3>
      <p>
        The actual gradient values tell you both direction and magnitude. But for FGSM you only care about direction. You want to know: should this pixel go up or down to hurt the model the most?
      </p>
      <p>
        <code>sign(gradient)</code> converts every gradient value to either +1 or -1. Positive gradient becomes +1 (increase this pixel). Negative gradient becomes -1 (decrease this pixel). You lose information about how steep the gradient is, but you get a clean directional signal for every single pixel.
      </p>

      <h3>The attack formula</h3>
      <div className="card" style={{ fontFamily: "var(--mono)", fontSize: 15, textAlign: "center", letterSpacing: "0.02em" }}>
        <div style={{ color: "var(--text)" }}>x_adv = x + epsilon × sign(∇_x L(x, y))</div>
        <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 10, fontFamily: "var(--font)", letterSpacing: "normal" }}>
          x_adv = adversarial image &nbsp;|&nbsp; x = original image &nbsp;|&nbsp; epsilon = step size &nbsp;|&nbsp; ∇_x L = gradient of loss w.r.t. pixels
        </div>
      </div>
      <p>
        Epsilon controls how large each pixel nudge is. At epsilon=0.01 the changes are invisible to humans. At epsilon=0.1 you might start to notice slight color shifts. The attack is most impressive at small epsilon values where the image looks completely unchanged but the model is thoroughly confused.
      </p>

      <h3>Why coordination is the key</h3>
      <p>
        One pixel nudged by 0.01 does nothing. The model does not care. But 150,000 pixels all nudged by 0.01 in the mathematically optimal direction simultaneously breaks the model completely. This is not random noise. Random noise cancels out because different pixels push in different random directions. FGSM does not cancel out. Every single pixel is pushing loss upward at the same time. That coordination is what makes the attack so effective at such small perturbation sizes.
      </p>

      <h3>Step by step</h3>
      <div className="step"><div className="step-num">1</div><div className="step-text">Take a correctly classified image. Set <code>image.requires_grad = True</code>.</div></div>
      <div className="step"><div className="step-num">2</div><div className="step-text">Run forward pass. Model predicts correctly. Loss is low.</div></div>
      <div className="step"><div className="step-num">3</div><div className="step-text">Call <code>loss.backward()</code>. PyTorch computes the gradient of loss with respect to every pixel.</div></div>
      <div className="step"><div className="step-num">4</div><div className="step-text">Extract <code>image.grad.sign()</code>. Convert every gradient to +1 or -1.</div></div>
      <div className="step"><div className="step-num">5</div><div className="step-text">Compute <code>adversarial = image + epsilon × sign(gradient)</code>. Every pixel nudged in the worst direction for the model.</div></div>
      <div className="step"><div className="step-num">6</div><div className="step-text">Run the adversarial image through the model. Loss spikes. Misclassification occurs.</div></div>

      <hr className="divider" />

      <div className="card">
        <h4 style={{ margin: "0 0 0.75rem" }}>Interactive: epsilon's effect on pixel perturbations</h4>
        <p style={{ fontSize: 13, marginBottom: "0.5rem" }}>
          Red pixels are being nudged up. Blue pixels are being nudged down. In a real attack, epsilon is 0.01 and these changes are invisible to humans.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0.75rem 0" }}>
          <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 55 }}>Epsilon</span>
          <input type="range" min={1} max={100} value={eps} onChange={e => setEps(+e.target.value)} />
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 44, color: "var(--text)" }}>{epsilon}</span>
        </div>
        <PixelGrid epsilon={eps} />
        <div className="metric-grid" style={{ marginTop: "0.75rem" }}>
          <div className="metric">
            <div className="metric-label">Perturbation</div>
            <div className="metric-val">{epsilon}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Visible to human</div>
            <div className="metric-val" style={{ color: visible ? "var(--red)" : "var(--green)" }}>{visible ? "Yes" : "No"}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Model confused</div>
            <div className="metric-val" style={{ color: "var(--red)" }}>Yes</div>
          </div>
        </div>
        <p style={{ fontSize: 13, margin: "0.75rem 0 0", color: "var(--muted)" }}>
          Result at epsilon=0.01: ResNet50 misclassified a tiger cat as an Egyptian Mau with 87% confidence. The pixel changes were completely invisible.
        </p>
      </div>

       <Quiz
        question="Why is FGSM not the same as adding random noise to an image?"
        options={[
          "FGSM changes more pixels than random noise does.",
          "Random noise cancels out because pixels push in random directions. FGSM uses the gradient to push every pixel in the specific direction that increases loss the most, so nothing cancels out.",
          "Random noise uses a larger epsilon value.",
          "FGSM only changes pixels on the edges of the image."
        ]}
        correct={1}
        explanation="The gradient gives you the mathematically optimal direction for every single pixel simultaneously. Random noise has no such structure — the nudges cancel each other out. Coordination is what makes FGSM so effective at tiny epsilon values."
      />

      <Quiz
        question="What does setting image.requires_grad = True do in PyTorch?"
        options={[
          "It makes the image larger for better processing.",
          "It tells PyTorch to track gradients for the image pixels, so loss.backward() can compute how changing each pixel affects the loss.",
          "It freezes the model weights so they cannot change.",
          "It converts the image to a format PyTorch can read."
        ]}
        correct={1}
        explanation="Normally PyTorch only tracks gradients for model weights. Setting requires_grad = True on the image tensor tells PyTorch to also compute gradients for those pixels during backpropagation. Without this, image.grad would be None after loss.backward()."
      />
     
    </div>
  )
}