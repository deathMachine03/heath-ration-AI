import { Routes, Route, Navigate } from 'react-router-dom'

function Home() {
  return <h1>Home</h1>
}

function About() {
  return <h1>About</h1>
}

function NotFound() {
  return <h1>404 - Page Not Found</h1>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      
      {/* redirect example */}
      <Route path="/main" element={<Navigate to="/" replace />} />
      
      {/* fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App 