import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateTrip    from './pages/CreateTrip'
import ItineraryView from './pages/ItineraryView'
import PublicTrip    from './pages/PublicTrip'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ color: 'white', padding: 40, fontFamily: 'sans-serif' }}>
            <h1>🌍 Traveloop</h1>
            <a href="/create" style={{ color: '#facc15', fontSize: 18 }}>→ Create a Trip</a>
          </div>
        } />
        <Route path="/create"            element={<CreateTrip />} />
        <Route path="/trip/:tripId/view" element={<ItineraryView />} />
        <Route path="/share/:token"      element={<PublicTrip />} />
      </Routes>
    </BrowserRouter>
  )
}