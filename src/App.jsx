import { useEffect, useRef, useState } from 'react'

const initial = { name: '', email: '', phone: '', message: '', reply: false }
const fields = [['name', 'Имя'], ['email', 'Email'], ['phone', 'Телефон'], ['message', 'Сообщение']]

function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  const number = (/^[78]/.test(digits) ? digits.slice(1) : digits).slice(0, 10)
  if (!number) return digits ? '+7' : ''
  const area = number.slice(0, 3)
  const local = number.slice(3, 6)
  return '+7 (' + area + (local ? ') ' + local : '') +
    (number.length > 6 ? '-' + number.slice(6, 8) : '') +
    (number.length > 8 ? '-' + number.slice(8) : '')
}

function validate({ name, email, phone, message, reply }) {
  return {
    name: name.trim().length < 2 ? 'Введите минимум 2 символа' :
      /^[\p{L}\s-]+$/u.test(name.trim()) ? '' : 'Допустимы буквы, пробелы и дефис',
    email: !email.trim() && !reply ? '' :
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : 'Введите корректный email',
    phone: phone && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone) ? 'Введите полный номер +7 (XXX) XXX-XX-XX' : '',
    message: message.trim().length < 10 || message.length > 500 ? 'Нужно от 10 до 500 символов' : '',
  }
}

function FeedbackForm() {
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle')
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  const errors = validate(values)

  function submit(event) {
    event.preventDefault()
    if (status === 'sending') return
    setTouched(Object.fromEntries(fields.map(([key]) => [key, true])))
    if (Object.values(errors).some(Boolean)) return
    setStatus('sending')
    timer.current = setTimeout(() => {
      setValues(initial)
      setTouched({})
      setStatus('done')
    }, 1500)
  }

  function update(key, value) {
    setValues(previous => ({ ...previous, [key]: key === 'phone' ? formatPhone(value) : value }))
    setStatus('idle')
  }

  return <form className="panel stack" noValidate onSubmit={submit}>
    <fieldset className="stack" disabled={status === 'sending'}>
      <legend>Обратная связь</legend>
      {fields.map(([key, title]) => {
        const error = touched[key] && errors[key]
        const props = {
          value: values[key],
          onChange: event => update(key, event.target.value),
          onBlur: () => setTouched(previous => ({ ...previous, [key]: true })),
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? key + '-error' : undefined,
          'data-valid': Boolean(touched[key] && !error && values[key].trim()),
        }
        return <label key={key}>{title}{key === 'email' && values.reply ? ' (обязательно)' : ''}
          {key === 'message' ? <textarea {...props} rows={5} maxLength={500} /> :
            <input {...props} type={key === 'name' ? 'text' : key === 'phone' ? 'tel' : 'email'} />}
          {key === 'message' && <small>{values.message.length} / 500</small>}
          {error && <small className="error" id={key + '-error'}>{error}</small>}
        </label>
      })}
      <label><input type="checkbox" checked={values.reply} onChange={event => update('reply', event.target.checked)} /> Хочу получить ответ</label>
      <button>{status === 'sending' ? 'Отправка…' : 'Отправить'}</button>
    </fieldset>
    {status === 'done' && <p role="status">Сообщение принято в учебном режиме.</p>}
  </form>
}

export default function App() {
  return <main style={{ maxWidth: 680 }}><h1>Форма обратной связи</h1><FeedbackForm /></main>
}
