import { useState } from "react"
import MathFoundations from "./components/MathFoundations"
import FGSM from "./components/FGSM"
import FedLearning from "./components/FedLearning"
import LLMRedTeam from "./components/LLMRedTeam"
import MIA from "./components/MIA"
import "./index.css"

const SECTIONS = [
  { id: "math", label: "Math Foundations", tag: "Prerequisites", desc: "Functions, derivatives, gradients, backpropagation" },
  { id: "fgsm", label: "Adversarial Images", tag: "Attack", desc: "Fast Gradient Sign Method on ResNet50" },
  { id: "fed", label: "Federated Poisoning", tag: "Attack + Defense", desc: "Label flipping, random poisoning, trimmed mean" },
  { id: "llm", label: "LLM Red Teaming", tag: "Attack", desc: "4-agent jailbreak system with guardrail defense" },
  { id: "mia", label: "Membership Inference", tag: "Attack + Defense", desc: "Privacy leakage, AUC, differential privacy" },
]

const TAG_COLORS = {
  "Prerequisites": { bg: "#e8f0fe", color: "#1a73e8" },
  "Attack": { bg: "#fce8e6", color: "#c5221f" },
  "Attack + Defense": { bg: "#fef7e0", color: "#b06000" },
}

const VIEWS = { math: <Math />, fgsm: <FGSM />, fed: <FedLearning />, llm: <LLMRedTeam />, mia: <MIA /> }

export default function App() {
  const [active, setActive] = useState("math")
  const current = SECTIONS.find(s => s.id === active)

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Sidebar */}
      <div style={{
        width: 260, flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: "1.5rem 0",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
        background: "var(--surface)"
      }}>
        <div style={{ padding: "0 1.25rem 1.25rem", borderBottom: "1px solid var(--border)", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>ML Attack Visualizer</div>
          <div style={{ fontSize: 12, color: "var(--faint)" }}>Four AI security projects, taught from the ground up</div>
        </div>
        {SECTIONS.map(s => {
          const tag = TAG_COLORS[s.tag]
          return (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "0.75rem 1.25rem",
              background: active === s.id ? "var(--accent-bg)" : "transparent",
              borderLeft: `3px solid ${active === s.id ? "var(--accent)" : "transparent"}`,
              border: "none",
              borderLeft: `3px solid ${active === s.id ? "var(--accent)" : "transparent"}`,
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: active === s.id ? 600 : 500, color: active === s.id ? "var(--accent)" : "var(--text)" }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: tag.bg, color: tag.color }}>{s.tag}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>{s.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 2.5rem" }}>
          <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{current.label}</h1>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                background: TAG_COLORS[current.tag].bg,
                color: TAG_COLORS[current.tag].color
              }}>{current.tag}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--faint)" }}>{current.desc}</p>
          </div>
          {VIEWS[active]}
        </div>
      </div>
    </div>
  )
}