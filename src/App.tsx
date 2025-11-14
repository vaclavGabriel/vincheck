import { Route, HashRouter as Router, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import HavarijniPojisteniPage from './pages/HavarijniPojisteniPage'
import HomePage from './pages/HomePage'
import KompletniHistorieVozuPage from './pages/KompletniHistorieVozuPage'
import PovinneRuceniPage from './pages/PovinneRuceniPage'
import VehicleDetailPage from './pages/VehicleDetailPage'

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/povinne-ruceni" element={<PovinneRuceniPage />} />
				<Route
					path="/havarijni-pojisteni"
					element={<HavarijniPojisteniPage />}
				/>
				<Route
					path="/kompletni-historie-vozu"
					element={<KompletniHistorieVozuPage />}
				/>
				<Route path="/vin/:code" element={<VehicleDetailPage type="vin" />} />
				<Route path="/tp/:code" element={<VehicleDetailPage type="tp" />} />
				<Route path="/orv/:code" element={<VehicleDetailPage type="orv" />} />
				{/* Legacy route for direct access (auto-detects VIN/TP/ORV from code length) */}
				<Route path="/:code" element={<VehicleDetailPage />} />
				{/* Catch-all redirect to home page */}
				<Route path="*" element={<HomePage />} />
			</Routes>
		</Router>
	)
}

export default App
