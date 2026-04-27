import { useState } from "react"
import Quiz from "./Quiz"

function FedViz({ malicious }) {
  const total = 10
  const honest = total - malicious
  const trimCut = Math.floor(total * 0.2)
  const survive = Math.max(0, malicious - trimCut)
  const safe = survive === 0
  return (
    <div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "0.75rem 0" }}>
        {Array(honest).fill(0).map((_, i) => (
          <div key={`h${i}`} style={{ width: 36, height: 36, borderRadius: 6, background: "var(--green-bg)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--green)", fontWeight: 700 }}>H</div>
        ))}
        {Array(malicious).fill(0).map((_, i) => (
          <div key={`m${i}`} style={{ width: 36, height: 36, borderRadius: 6, background: "var(--red-bg)", border: "1px solid var(--red-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--red)", fontWeight: 700 }}>M</div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
        Trimmed mean removes {trimCut} from each end. {survive === 0 ? "All malicious updates eliminated." : `${survive} malicious update${survive > 1 ? "s" : ""} survive into the average.`}
      </p>
      <div style={{ padding: "10px 14px", borderRadius: 8, background: safe ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${safe ? "var(--green-border)" : "var(--red-border)"}`, fontSize: 13, fontWeight: 600, color: safe ? "var(--green)" : "var(--red)" }}>
        {safe ? "Defense holds. All poisoned updates were trimmed." : `Defense failing. ${survive} poisoned update${survive > 1 ? "s" : ""} in the average.`}
      </div>
    </div>
  )
}

function AggregationViz({ malicious }) {
  const updates = Array.from({ length: 10 }, (_, i) => {
    if (i < 10 - malicious) return { val: (0.9 + Math.sin(i) * 0.1).toFixed(2), type: "honest" }
    return { val: (-1.0).toFixed(2), type: "malicious" }
  })
  const allVals = updates.map(u => parseFloat(u.val))
  const fedavg = (allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(3)
  const sorted = [...allVals].sort((a, b) => a - b)
  const cut = Math.floor(allVals.length * 0.2)
  const trimmed = sorted.slice(cut, allVals.length - cut)
  const trimmedMean = (trimmed.reduce((a, b) => a + b, 0) / trimmed.length).toFixed(3)
  return (
    <div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {updates.map((u, i) => (
          <div key={i} style={{ padding: "4px 8px", borderRadius: 6, background: u.type === "honest" ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${u.type === "honest" ? "var(--green-border)" : "var(--red-border)"}`, fontSize: 12, fontWeight: 600, color: u.type === "honest" ? "var(--green)" : "var(--red)" }}>
            {u.val}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div className="metric">
          <div className="metric-label">FedAvg result</div>
          <div className="metric-val" style={{ fontSize: 18, color: parseFloat(fedavg) < 0.5 ? "var(--red)" : "var(--green)" }}>{fedavg}</div>
          <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>true value is ~1.0</div>
        </div>
        <div className="metric">
          <div className="metric-label">Trimmed mean result</div>
          <div className="metric-val" style={{ fontSize: 18, color: parseFloat(trimmedMean) > 0.7 ? "var(--green)" : "var(--red)" }}>{trimmedMean}</div>
          <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>true value is ~1.0</div>
        </div>
      </div>
    </div>
  )
}

export default function FedLearning() {
  const [malicious, setMalicious] = useState(2)
  return (
    <div>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.7 }}>
        Federated learning was designed to enable collaborative model training without sharing raw data. But it introduces a new attack surface: malicious clients can corrupt the global model by sending poisoned updates, without ever exposing their own data.
      </p>

      <h3>How federated learning works</h3>
      <p>
        In traditional machine learning, you send all your data to a central server which trains a model on it. This is a privacy risk. In federated learning, each client (a hospital, a phone, a research institution) trains a local model on their own data and sends only the model updates, not the raw data, to a central server.
      </p>
      <p>
        The server aggregates these updates into a global model and sends it back. Clients then train on the improved global model. This repeats over many rounds. No raw data ever leaves the client. That is the privacy guarantee.
      </p>
      <div className="callout">
        <p>The vulnerability: the server cannot verify whether each update is honest. A malicious client can send any values it wants. The server has no way to distinguish a legitimate update from a poisoned one just by looking at the numbers.</p>
      </div>

      <h3>What model updates actually are</h3>
      <p>
        When a client trains locally, it adjusts the model weights to reduce loss on its local data. The update it sends to the server is essentially the direction and magnitude of those weight adjustments. In the simplified simulation, this is abstracted to a single numerical value representing the direction of the update.
      </p>
      <p>
        Honest clients send updates near 1.0, representing the true gradient direction. Malicious clients can send -1.0 (the opposite direction, label flipping) or random values (random poisoning).
      </p>

      <h3>The two attacks simulated</h3>
      <div className="step">
        <div className="step-num" style={{ background: "var(--red)" }}>1</div>
        <div className="step-text">
          <strong>Label flipping:</strong> the malicious client sends the exact opposite of the true gradient direction. In a real system this maps to flipping training labels, telling the model a malignant tumor is benign. The update actively pushes the global model in the wrong direction.
        </div>
      </div>
      <div className="step">
        <div className="step-num" style={{ background: "var(--red)" }}>2</div>
        <div className="step-text">
          <strong>Random poisoning:</strong> the malicious client sends completely random values. This models a maximally disruptive attacker who just wants to introduce noise into the aggregation, regardless of direction.
        </div>
      </div>

      <h3>FedAvg: the naive aggregation</h3>
      <p>
        FedAvg, the original Google federated averaging algorithm, simply takes the mean of all client updates. This works perfectly when every client is honest. But it has a critical weakness: a single malicious client with an extreme value pulls the mean toward them.
      </p>
      <p>
        With 7 honest clients near 1.0 and 3 malicious clients at -1.0, the mean is (7 × 1.0 + 3 × -1.0) / 10 = 0.4. That is significantly corrupted from the true value of 1.0.
      </p>

      <h3>Trimmed mean: the defense</h3>
      <p>
        Instead of averaging all updates equally, trimmed mean sorts all client updates, removes the most extreme values from both ends, then averages what remains. With trim=0.2 it removes the bottom 20% and top 20% before averaging. Malicious clients sending extreme values get eliminated before they influence the global model.
      </p>
      <p>
        The critical assumption: trimmed mean only works if malicious updates are concentrated at the extremes of the distribution. Once malicious clients exceed the trim threshold, their updates spread across the full distribution. Some land in the middle and survive into the average.
      </p>

      <hr className="divider" />

      <div className="card">
        <h4 style={{ margin: "0 0 0.75rem" }}>Interactive: adjust malicious client count</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0.75rem 0" }}>
          <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 80 }}>Malicious</span>
          <input type="range" min={0} max={9} value={malicious} onChange={e => setMalicious(+e.target.value)} />
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 40 }}>{malicious} / 10</span>
        </div>
        <FedViz malicious={malicious} />
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Aggregation comparison</div>
          <AggregationViz malicious={malicious} />
        </div>
      </div>

      <h3>Key findings</h3>
      {[
        ["10 to 20% malicious", "Trimmed mean reduces error by over 90%. Defense is highly effective.", "var(--green-bg)", "var(--green)"],
        ["30% malicious", "Improvement drops to roughly 38%. Poisoned updates beginning to survive the trim.", "var(--amber-bg)", "var(--amber)"],
        ["50% malicious", "Defense crossover point. Trimmed mean stops providing any benefit.", "var(--red-bg)", "var(--red)"],
        ["Above 50%", "Defense becomes counterproductive. Trimmed mean starts cutting honest updates instead of malicious ones.", "var(--red-bg)", "var(--red)"],
      ].map(([label, desc, bg, color]) => (
        <div key={label} className="result-row" style={{ background: bg }}>
          <span className="result-label" style={{ color }}>{label}</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{desc}</span>
        </div>
      ))}

      <div className="callout amber" style={{ marginTop: "1.5rem" }}>
        <p>This hard threshold at 20% is a known limitation of trimmed mean. It motivates more sophisticated defenses like RECESS, which tracks client behavior across multiple rounds rather than evaluating each round independently.</p>
      </div>

      <Quiz
        question="Why does trimmed mean fail when malicious clients exceed 20%?"
        options={[
          "The sorting algorithm breaks at high malicious ratios.",
          "Poisoned updates are no longer all at the extremes. They spread across the full distribution and some land in the middle where they survive the trim entirely.",
          "The server runs out of computational resources at high client counts.",
          "Honest clients start sending incorrect updates in response to poisoning."
        ]}
        correct={1}
        explanation="Trimmed mean assumes malicious updates are outliers at the distribution extremes. Once malicious clients outnumber the trim buffer, their updates spread too widely. Some inevitably land in the middle of the sorted list where the trim does not reach them."
      />

      <Quiz
        question="What is the fundamental vulnerability in FedAvg that makes poisoning attacks possible?"
        options={[
          "FedAvg uses too much memory.",
          "FedAvg takes a plain mean of all updates, so any client can corrupt the global model by sending extreme values. There is no mechanism to detect or filter dishonest updates.",
          "FedAvg requires all clients to be online simultaneously.",
          "FedAvg cannot handle more than 10 clients."
        ]}
        correct={1}
        explanation="FedAvg is mathematically simple: it takes the mean. The mean is highly sensitive to outliers. A small number of malicious clients sending extreme values can significantly corrupt the global model because there is nothing filtering out dishonest contributions."
      />
    </div>
  )
}