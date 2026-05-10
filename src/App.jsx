<<<<<<< HEAD
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
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import PublicTrip from './pages/PublicTrip';
import Budget from './pages/Budget';
import Packing from './pages/Packing';
import Notes from './pages/Notes';
import Explore from './pages/Explore';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<Auth />} />

        {/* Public share — no auth needed */}
        <Route path="/share/:tripId" element={<PublicTrip />} />

        {/* Protected app routes */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"                element={<Dashboard />} />
          <Route path="trips"                    element={<MyTrips />} />
          <Route path="trips/new"                element={<CreateTrip />} />
          <Route path="trip/:tripId/build"       element={<ItineraryBuilder />} />
          <Route path="trip/:tripId/view"        element={<ItineraryView />} />
          <Route path="trip/:tripId/budget"      element={<Budget />} />
          <Route path="trip/:tripId/packing"     element={<Packing />} />
          <Route path="trip/:tripId/notes"       element={<Notes />} />

          <Route path="explore" element={<Explore />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
