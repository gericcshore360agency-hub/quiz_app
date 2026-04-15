import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

function Quiz() {
  const [status, setStatus] = useState('idle')
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [formError, setFormError] = useState('')
  const [questions, setQuestions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    question: '',
    letterA: '',
    letterB: '',
    letterC: '',
    letterD: '',
    correctAnswer: 'A',
  })

  const loadCount = async () => {
    setStatus('loading')
    setError('')

    try {
      const snapshot = await getDocs(collection(db, 'quiz'))
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setQuestions(items)
      setCount(snapshot.size)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Firestore')
      setStatus('error')
    }
  }

  useEffect(() => {
    loadCount()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSaveStatus('loading')

    const isValid =
      form.question.trim() &&
      form.letterA.trim() &&
      form.letterB.trim() &&
      form.letterC.trim() &&
      form.letterD.trim()

    if (!isValid) {
      setSaveStatus('error')
      setFormError('Please complete all fields.')
      return
    }

    try {
      if (editingId) {
        const ref = doc(db, 'quiz', editingId)
        await updateDoc(ref, {
          question: form.question.trim(),
          letterA: form.letterA.trim(),
          letterB: form.letterB.trim(),
          letterC: form.letterC.trim(),
          letterD: form.letterD.trim(),
          correctAnswer: form.correctAnswer,
        })
      } else {
        await addDoc(collection(db, 'quiz'), {
          question: form.question.trim(),
          letterA: form.letterA.trim(),
          letterB: form.letterB.trim(),
          letterC: form.letterC.trim(),
          letterD: form.letterD.trim(),
          correctAnswer: form.correctAnswer,
          createdAt: serverTimestamp(),
        })
      }

      setSaveStatus('success')
      setForm({
        question: '',
        letterA: '',
        letterB: '',
        letterC: '',
        letterD: '',
        correctAnswer: 'A',
      })
      setEditingId(null)
      await loadCount()
    } catch (err) {
      setSaveStatus('error')
      setFormError(err instanceof Error ? err.message : 'Failed to save question.')
    }
  }

  const startEdit = (question) => {
    setEditingId(question.id)
    setForm({
      question: question.question ?? '',
      letterA: question.letterA ?? '',
      letterB: question.letterB ?? '',
      letterC: question.letterC ?? '',
      letterD: question.letterD ?? '',
      correctAnswer: question.correctAnswer ?? 'A',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({
      question: '',
      letterA: '',
      letterB: '',
      letterC: '',
      letterD: '',
      correctAnswer: 'A',
    })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Delete this question?')
    if (!confirmDelete) return

    try {
      const ref = doc(db, 'quiz', id)
      await deleteDoc(ref)
      await loadCount()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete question.')
    }
  }

  return (
    <section className="page panel">
      <h1>Quiz Manager</h1>
      <p className="section-subtitle">Add, edit, or delete questions</p>
      {status === 'loading' && <p className="status-message">Checking Firestore connection...</p>}
      {status === 'success' && <p>Connected. Documents in quiz: {count}</p>}
      {status === 'error' && <p>Connection failed: {error}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          className="input"
          name="question"
          value={form.question}
          onChange={handleChange}
          placeholder="Question"
        />
        <input
          className="input"
          name="letterA"
          value={form.letterA}
          onChange={handleChange}
          placeholder="Letter A"
        />
        <input
          className="input"
          name="letterB"
          value={form.letterB}
          onChange={handleChange}
          placeholder="Letter B"
        />
        <input
          className="input"
          name="letterC"
          value={form.letterC}
          onChange={handleChange}
          placeholder="Letter C"
        />
        <input
          className="input"
          name="letterD"
          value={form.letterD}
          onChange={handleChange}
          placeholder="Letter D"
        />

        <label className="form-label">
          Correct Answer
          <select className="input" name="correctAnswer" value={form.correctAnswer} onChange={handleChange}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>

        <button type="submit" className="btn btn-primary" disabled={saveStatus === 'loading'}>
          {saveStatus === 'loading' ? 'Saving...' : editingId ? 'Update Question' : 'Save Question'}
        </button>

        {editingId && (
          <button type="button" className="btn" onClick={cancelEdit}>
            Cancel Edit
          </button>
        )}

        {saveStatus === 'success' && <p className="success-message">Question saved to Firestore.</p>}
        {formError && <p className="error-message">Save failed: {formError}</p>}
      </form>

      {questions.length > 0 && (
        <div className="questions-section">
          <h2>Questions</h2>
          <ul className="questions-list">
            {questions.map((q) => (
              <li key={q.id} className="question-card">
                <strong>{q.question}</strong>
                <div className="option-text">A. {q.letterA}</div>
                <div className="option-text">B. {q.letterB}</div>
                <div className="option-text">C. {q.letterC}</div>
                <div className="option-text">D. {q.letterD}</div>
                <div className="correct-answer">Correct: {q.correctAnswer}</div>
                <div className="action-row">
                  <button type="button" className="btn" onClick={() => startEdit(q)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(q.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default Quiz
