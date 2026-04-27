import { useState } from "react"

export default function Quiz({ question, options, correct, explanation }) {
  const [sel, setSel] = useState(null)
  return (
    <div className="quiz-wrap">
      <div className="quiz-q">{question}</div>
      {options.map((opt, i) => (
        <button
          key={i}
          className={`quiz-opt${sel !== null && i === correct ? " correct" : ""}${sel !== null && i === sel && i !== correct ? " wrong" : ""}`}
          onClick={() => setSel(i)}
          disabled={sel !== null}
        >
          {opt}
        </button>
      ))}
      {sel !== null && (
        <div className={`quiz-feedback ${sel === correct ? "correct" : "wrong"}`}>
          {sel === correct ? "Correct. " : "Not quite. "}{explanation}
        </div>
      )}
    </div>
  )
}