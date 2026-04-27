import { useState } from "react"
import Quiz from "./Quiz"

function LossViz() {
  return (
    <div className="card">
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>
        Loss distribution: training records vs unseen records
      </div>
      <svg width="100%" viewBox="0 0 400 140" style={{ maxWidth: 400 }}>
        {/* Training data distribution; tight, low loss */}
        {Array.from({ length: 30 }, (_, i) => {
          const x = 20 + i * 4
          const height = Math.max(4, 80 * Math.exp(-Math.pow((x - 50) / 20, 2)))
          return <rect key={`t${i}`} x={x} y={110 - height} width={3} height={height} fill="#1a73e8" opacity={0.6} rx={1} />
        })}
        {/* Test data distribution; spread, higher loss */}
        {Array.from({ length: 30 }, (_, i) => {
          const x = 150 + i * 6
          const height = Math.max(4, 60 * Math.exp(-Math.pow((x - 270) / 50, 2)))
          return <rect key={`u${i}`} x={x} y={110 - height} width={5} height={height} fill="#c5221f" opacity={0.6} rx={1} />
        })}
        <line x1="0" y1="115" x2="400" y2="115" stroke="#e8eaed" strokeWidth="1" />
        <text x="50" y="130" fontSize="11" fill="#1a73e8" textAnchor="middle">Training (low loss)</text>
        <text x="270" y="130" fontSize="11" fill="#c5221f" textAnchor="middle">Unseen (high loss)</text>
      </svg>
      <p style={{ fontSize: 13, margin: "0.75rem 0 0" }}>
        The separation between these two distributions is the attacker's signal. A wider gap means a more successful attack.
      </p>
    </div>
  )
}

function AUCExplainer({ auc }) {
  const width = Math.round(auc * 200)
  const color = auc > 0.65 ? "var(--red)" : auc > 0.55 ? "var(--amber)" : "var(--green)"
  const bg = auc > 0.65 ? "var(--red-bg)" : auc > 0.55 ? "var(--amber-bg)" : "var(--green-bg)"
  return (
    <div style={{ margin: "0.5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
        <span>Random guessing (0.5)</span>
        <span>Perfect attack (1.0)</span>
      </div>
      <div style={{ background: "var(--surface2)", borderRadius: 4, height: 12, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(auc - 0.5) / 0.5 * 100}%`, background: color, borderRadius: 4, transition: "width 0.3s" }} />
        <div style={{ position: "absolute", left: "0%", top: -2, height: 16, width: 2, background: "#9aa0a6" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginTop: 3 }}>
        <span>0.5</span>
        <span style={{ fontWeight: 700, color }}>Current: {auc.toFixed(3)}</span>
        <span>1.0</span>
      </div>
      <div style={{ marginTop: 8, padding: "8px 12px", background: bg, borderRadius: 6, fontSize: 13, color, fontWeight: 500 }}>
        {auc <= 0.52 ? "Attacker is essentially guessing. No usable signal remains." :
          auc <= 0.55 ? "Attacker has minimal signal. Privacy risk is low." :
          auc <= 0.65 ? "Attacker has a meaningful signal. This is a privacy concern for sensitive data." :
          "Attacker is highly successful. Model is leaking significant membership information."}
      </div>
    </div>
  )
}

export default function MIA() {
  const [eps, setEps] = useState(50)
  const epsilon = (eps / 10).toFixed(1)
  const auc = eps < 10 ? 0.510 : eps < 30 ? 0.541 : eps < 60 ? 0.580 : eps < 80 ? 0.650 : 0.709
  const rc = auc > 0.65 ? "var(--red)" : auc > 0.55 ? "var(--amber)" : "var(--green)"

  return (
    <div>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.7 }}>
        Membership inference is the attack that asks: given black-box access to a trained model, can an attacker determine whether a specific individual's data was used to train it? This is one of the core privacy threats in machine learning and is directly connected to the differential privacy work.
      </p>

      <h3>The threat model</h3>
      <p>
        The attacker has black-box access to the model. This means they can send queries and observe outputs, but they cannot see the model weights, the training data, or the training process. This is the realistic scenario for any deployed ML API.
      </p>
      <p>
        The attacker's goal: given a specific data record (for example, a patient's medical history), determine whether that record was in the training set. In a healthcare context, confirming that someone was in a clinical trial dataset is itself a privacy violation, even without knowing what the model learned about them.
      </p>

      <h3>Why overfitting enables the attack</h3>
      <p>
        When a model is overfit, it memorizes its training data rather than learning generalizable patterns. This memorization causes a measurable behavioral difference: the model is more confident and produces lower loss on records it has seen before, and less confident with higher loss on records it has not seen.
      </p>
      <p>
        This is not a bug in the model's architecture. It is a consequence of training too aggressively on too small a dataset without sufficient regularization. The model essentially encodes information about individual training records into its weights.
      </p>
      <LossViz />

      <h3>How the attack works</h3>
      <div className="step"><div className="step-num">1</div><div className="step-text">Query the target model with the record you want to test. Observe the output probabilities.</div></div>
      <div className="step"><div className="step-num">2</div><div className="step-text">Compute the loss on that record. Low loss means the model is very confident. High loss means uncertain.</div></div>
      <div className="step"><div className="step-num">3</div><div className="step-text">Train an attack model (a simple logistic regression) that learns: low loss predicts member, high loss predicts non-member.</div></div>
      <div className="step"><div className="step-num">4</div><div className="step-text">Use the attack model to classify target records. Evaluate success using accuracy and AUC.</div></div>

      <div className="callout">
        <p>The attack model only needs the loss value as its input. It does not need to know anything about the target model's architecture or training process. Just query and measure.</p>
      </div>

      <h3>Understanding AUC</h3>
      <p>
        AUC stands for Area Under the ROC Curve. The ROC (Receiver Operating Characteristic) curve plots the attacker's true positive rate against their false positive rate across all possible decision thresholds. AUC summarizes this curve as a single number.
      </p>
      <p>
        The most intuitive interpretation: AUC is the probability that, given one training record and one non-training record, the attacker correctly identifies which is which. It measures ranking ability, not just accuracy at a single threshold.
      </p>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AUC reference values</div>
        {[
          ["AUC = 0.5", "Random guessing. The attacker has zero signal. The model's behavior on training and non-training records is indistinguishable.", "var(--green-bg)", "var(--green)"],
          ["AUC = 0.55 to 0.65", "Weak signal. Attacker is slightly better than random. Concerning for sensitive applications but not catastrophic.", "var(--amber-bg)", "var(--amber)"],
          ["AUC = 0.65 to 0.75", "Strong signal. Attacker succeeds meaningfully. Significant privacy risk for any sensitive dataset.", "var(--red-bg)", "var(--red)"],
          ["AUC above 0.75", "Very strong signal. Model is heavily memorizing training data. Serious privacy violation in production.", "var(--red-bg)", "var(--red)"],
        ].map(([label, desc, bg, color]) => (
          <div key={label} className="result-row" style={{ background: bg, marginBottom: 5 }}>
            <span className="result-label" style={{ color, minWidth: 120, fontSize: 11 }}>{label}</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{desc}</span>
          </div>
        ))}
      </div>

      <h3>The three defenses compared</h3>
      <p>
        Three conditions were tested: no defense, regularization only, and differential privacy at various epsilon values.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, margin: "1rem 0" }}>
        {[
          ["No Defense", "AUC 0.709", "Loss gap: 1.178", "var(--red-bg)", "var(--red)"],
          ["Regularization", "AUC 0.541", "Loss gap: 0.070", "var(--amber-bg)", "var(--amber)"],
          ["DP (epsilon=0.5)", "AUC 0.480", "Loss gap: 0.000", "var(--green-bg)", "var(--green)"],
        ].map(([label, auc, gap, bg, color]) => (
          <div key={label} style={{ background: bg, borderRadius: 10, padding: "1rem" }}>
            <div style={{ fontSize: 11, color, opacity: 0.8, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color, marginBottom: 3 }}>{auc}</div>
            <div style={{ fontSize: 12, color, opacity: 0.7 }}>{gap}</div>
          </div>
        ))}
      </div>

      <p>
        Regularization reduces the loss gap from 1.178 to 0.070 by preventing the model from memorizing training data as aggressively. But the attacker still has a signal at AUC 0.541. Differential privacy at epsilon=0.5 destroys the gap entirely and drops AUC to 0.480, below random guessing. The attacker performs worse than a coin flip.
      </p>

      <hr className="divider" />

      <div className="card">
        <h4 style={{ margin: "0 0 0.75rem" }}>Interactive: adjust epsilon and observe attack success</h4>
        <p style={{ fontSize: 13, marginBottom: "0.75rem" }}>
          Smaller epsilon adds more noise during training, making it harder for the model to memorize individual records. Watch how the attack AUC changes.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0.75rem 0" }}>
          <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 55 }}>Epsilon</span>
          <input type="range" min={1} max={100} value={eps} onChange={e => setEps(+e.target.value)} />
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 44, color: "var(--text)" }}>{epsilon}</span>
        </div>
        <AUCExplainer auc={auc} />
        <div className="metric-grid" style={{ marginTop: "1rem" }}>
          <div className="metric">
            <div className="metric-label">Attack AUC</div>
            <div className="metric-val" style={{ color: rc }}>{auc.toFixed(3)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">vs random baseline</div>
            <div className="metric-val" style={{ color: rc }}>{auc >= 0.5 ? "+" : ""}{((auc - 0.5) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <h3>How this connects to differential privacy</h3>
      <p>
        The epsilon parameter in membership inference is the same epsilon from the differential privacy demo. In DP training, noise is added to the gradients during each training step. This noise prevents the model from fitting too precisely to any individual record, which closes the loss gap that the membership inference attacker exploits.
      </p>
      <p>
        Smaller epsilon means more noise per training step, which means less memorization, which means a smaller loss gap, which means a weaker attack signal. The privacy-accuracy tradeoff from the DP demo manifests here as a privacy-vulnerability tradeoff.
      </p>

      <h3>How this connects to federated learning</h3>
      <p>
        In federated learning, clients send model updates to a central server without sharing raw data. But if a server can run membership inference against the model updates themselves, it can potentially determine which records a client trained on. The privacy guarantee of federated learning can be undermined even without direct data access. This connection motivates combining federated learning with differential privacy, which is an active research area.
      </p>

      <Quiz
        question="An attacker achieves AUC of 0.71 against a healthcare model. What does this mean practically?"
        options={[
          "The model's test accuracy is 71%.",
          "Given one training record and one non-training record, the attacker correctly identifies the training record 71% of the time. This is a significant privacy violation.",
          "71% of training data was directly extracted from the model.",
          "The model's loss on training data is 0.71."
        ]}
        correct={1}
        explanation="AUC of 0.71 means the attacker correctly ranks training records above non-training records 71% of the time. The random baseline is 0.5. So the attacker is 21 percentage points better than chance, which is a serious vulnerability for any model trained on sensitive data."
      />

      <Quiz
        question="Why does differential privacy at small epsilon values reduce AUC below 0.5 in this simulation?"
        options={[
          "The model becomes too inaccurate to be queried.",
          "The DP noise added during training prevents the model from memorizing individual records, which collapses the loss gap between training and non-training data. Without a gap, the attacker has no signal and performs below random.",
          "Small epsilon values cause the model to output random predictions.",
          "The attack model cannot train properly when epsilon is small."
        ]}
        correct={1}
        explanation="Differential privacy adds calibrated noise to the training process that prevents memorization of individual records. When the model cannot memorize, training and non-training records produce similar loss values. The attacker's signal disappears. AUC below 0.5 means the attack is actually counterproductive, the attacker would do better flipping a coin."
      />
    </div>
  )
}