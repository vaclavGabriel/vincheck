import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import VehicleInfo from '../components/VehicleInfo'
import { VehicleDataArray } from '../types'
import { fetchVehicleInfo, getDataValue } from '../utils/vehicleApi'

const HomePage: React.FC = () => {
	const navigate = useNavigate()

	useEffect(() => {
		document.title =
			'Kontrola VIN kódu zdarma | Prověření vozidla v registru ČR | VIN Info.cz'

		// Update meta description
		const metaDescription = document.querySelector('meta[name="description"]')
		if (metaDescription) {
			metaDescription.setAttribute(
				'content',
				'Zdarma zkontrolujte VIN kód, číslo TP nebo ORV vozidla v českém registru. Získejte informace o stáří vozidla, technické údaje, datum první registrace, platnost STK a dalších 90+ údajů o vozidle. Rychlá a bezplatná kontrola vozidel v ČR.'
			)
		}

		// Add structured data (JSON-LD) for better SEO
		const script = document.createElement('script')
		script.type = 'application/ld+json'
		script.text = JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: 'VIN Info.cz - Kontrola vozidel zdarma',
			description:
				'Bezplatná kontrola VIN kódu, čísla TP a ORV vozidla v českém registru vozidel. Získejte technické údaje, historii vozidla a další informace.',
			url: 'https://vininfo.cz',
			applicationCategory: 'UtilityApplication',
			operatingSystem: 'Web',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'CZK'
			},
			featureList: [
				'Kontrola VIN kódu',
				'Kontrola čísla TP',
				'Kontrola čísla ORV',
				'Technické údaje vozidla',
				'Datum první registrace',
				'Platnost technické prohlídky STK',
				'Historie vozidla'
			]
		})
		document.head.appendChild(script)

		return () => {
			// Cleanup: remove script on unmount
			const existingScript = document.querySelector(
				'script[type="application/ld+json"]'
			)
			if (existingScript?.textContent?.includes('VIN Info')) {
				existingScript.remove()
			}
		}
	}, [])
	const [vin, setVin] = useState('')
	const [tp, setTp] = useState('')
	const [orv, setOrv] = useState('')
	const [vehicleData, setVehicleData] = useState<VehicleDataArray | null>(null)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [showSearch, setShowSearch] = useState(true)

	const vinInputRef = useRef<HTMLInputElement>(null)
	const tpInputRef = useRef<HTMLInputElement>(null)
	const orvInputRef = useRef<HTMLInputElement>(null)

	// Button disabled states
	const isVinValid = vin.trim().length === 17
	const isTpValid = tp.trim().length >= 6 && tp.trim().length <= 10
	const isOrvValid = orv.trim().length >= 5 && orv.trim().length <= 9

	const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
		setVin(value)
	}

	const handleTpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
		setTp(value)
	}

	const handleOrvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
		setOrv(value)
	}

	const handleSubmit = async () => {
		setError('')
		setLoading(true)

		try {
			const data = await fetchVehicleInfo(
				vin || undefined,
				tp || undefined,
				orv || undefined
			)

			// Navigate to appropriate detail page based on search type
			if (vin && vin.trim().length === 17) {
				// Get VIN from response data or use the input value
				const vinCode = getDataValue(data, 'VIN', vin)

				// Navigate to the VIN detail page if we have a valid VIN
				if (vinCode && vinCode.length === 17) {
					navigate(`/vin/${vinCode}`)
					return // Exit early, navigation will handle the rest
				}
			} else if (tp && tp.trim().length >= 6 && tp.trim().length <= 10) {
				// Navigate to TP detail page
				const cleanTp = tp.replace(/[^a-zA-Z0-9]/g, '')
				navigate(`/tp/${cleanTp}`)
				return
			} else if (orv && orv.trim().length >= 5 && orv.trim().length <= 9) {
				// Navigate to ORV detail page
				const cleanOrv = orv.replace(/[^a-zA-Z0-9]/g, '')
				navigate(`/orv/${cleanOrv}`)
				return
			}

			// Fallback: show on homepage if navigation didn't happen
			setVehicleData(data)
			setShowSearch(false)
		} catch (err) {
			console.error('Chyba při načítání dat:', err)
			setError(
				'Chyba při načítání dat. Zadaný VIN/TP/ORV pravděpodobně neexistuje v Registru silničních vozidel.\nZkontrolujte kód a zkuste to znovu.'
			)
		} finally {
			setLoading(false)
		}
	}

	const handleNewSearch = () => {
		setVehicleData(null)
		setError('')
		setVin('')
		setTp('')
		setOrv('')
		setShowSearch(true)
	}

	const handleKeyPress = (
		e: React.KeyboardEvent<HTMLInputElement>,
		isValid: boolean
	) => {
		if (e.key === 'Enter' && isValid && !loading) {
			handleSubmit()
		}
	}

	const vinCode = vehicleData
		? getDataValue(vehicleData, 'VIN', 'Neznámý VIN')
		: ''

	return (
		<>
			<Navigation />
			<main className="container mt-5">
				<header>
					<h1>Kontrola VIN kódu zdarma - Prověření vozidla v registru ČR</h1>
					<p className="lead">
						Bezplatná kontrola vozidla v českém registru vozidel. Zkontrolujte
						VIN kód, číslo TP nebo ORV a získejte okamžitý přístup k technickým
						údajům, datu první registrace, platnosti STK a dalším důležitým
						informacím o vozidle.
					</p>
				</header>

				<section aria-labelledby="search-heading">
					<h2 id="search-heading" className="visually-hidden">
						Vyhledávání vozidla
					</h2>
					<p>
						Při koupi ojetého vozidla je nezbytné prověřit jeho historii a
						technický stav. Naše služba umožňuje zdarma zkontrolovat klíčové
						informace o vozidle přímo z oficiálního registru vozidel České
						republiky. Stačí zadat VIN kód (17 znaků), číslo TP (6-10 znaků)
						nebo číslo ORV (5-9 znaků) a během několika sekund získáte přístup
						k více než 90 údajům o vozidle.
					</p>

					{showSearch && (
					<div className="row mt-5" id="searchSection">
						<div className="col-md-12 mb-4">
							<div className="alert alert-info" role="alert">
								<h3 className="h5 mb-2">Jak zkontrolovat vozidlo?</h3>
								<p className="mb-2">
									<strong>VIN kód</strong> je unikátní 17místný identifikátor
									vozidla (Vehicle Identification Number), který najdete na
									technickém průkazu nebo v motorovém prostoru vozidla.
								</p>
								<p className="mb-2">
									<strong>Číslo TP</strong> (6-10 znaků) je číslo velkého
									technického průkazu vozidla, které je také unikátní
									identifikátor vozidla v České republice.
								</p>
								<p className="mb-0">
									<strong>Číslo ORV</strong> (5-9 znaků) je číslo osvědčení o
									registraci vozidla, známé také jako "malý techničák". Tento
									identifikátor můžete použít pro kontrolu vozidla v registru.
								</p>
							</div>
						</div>

						<div className="col-md-6">
							<label htmlFor="vinInput" className="form-label">
								<strong>Zadejte VIN kód vozidla:</strong>
								<br />
								<small className="text-muted">
									Unikátní 17místný identifikátor vozidla
								</small>
							</label>
							<input
								ref={vinInputRef}
								type="text"
								className="form-control"
								id="vinInput"
								name="vin"
								placeholder="Např. WF0FXXWPCFHD05923"
								value={vin}
								onChange={handleVinChange}
								onKeyPress={(e) => handleKeyPress(e, isVinValid)}
								aria-label="VIN kód vozidla (17 znaků)"
								maxLength={17}
								autoComplete="off"
							/>
						</div>
						<div className="col-md-6 d-flex align-items-end justify-content-md-end mt-md-0 mt-3">
							<button
								type="button"
								className="btn btn-primary w-100"
								onClick={handleSubmit}
								id="getInfoBtn"
								disabled={!isVinValid || loading}
							>
								Vyhledat vozidlo dle VIN
							</button>
						</div>

						<div className="col-md-6 mt-5">
							<label htmlFor="tpInput" className="form-label">
								<strong>Zadejte číslo TP vozidla:</strong>
								<br />
								<small className="text-muted">
									Číslo velkého technického průkazu (6-10 znaků)
								</small>
							</label>
							<input
								ref={tpInputRef}
								type="text"
								className="form-control"
								id="tpInput"
								name="tp"
								placeholder="Např. UI036202"
								value={tp}
								onChange={handleTpChange}
								onKeyPress={(e) => handleKeyPress(e, isTpValid)}
								aria-label="Číslo TP vozidla (6-10 znaků)"
								maxLength={10}
								autoComplete="off"
							/>
						</div>
						<div className="col-md-6 d-flex align-items-end justify-content-md-end mt-md-0 mt-3">
							<button
								type="button"
								className="btn btn-primary w-100"
								onClick={handleSubmit}
								id="getTpInfoBtn"
								disabled={!isTpValid || loading}
							>
								Vyhledat vozidlo dle TP
							</button>
						</div>

						<div className="col-md-6 mt-5">
							<label htmlFor="orvInput" className="form-label">
								<strong>Zadejte číslo ORV vozidla:</strong>
								<br />
								<small className="text-muted">
									Číslo osvědčení o registraci vozidla (5-9 znaků)
								</small>
							</label>
							<input
								ref={orvInputRef}
								type="text"
								className="form-control"
								id="orvInput"
								name="orv"
								placeholder="Např. UAA000000"
								value={orv}
								onChange={handleOrvChange}
								onKeyPress={(e) => handleKeyPress(e, isOrvValid)}
								aria-label="Číslo ORV vozidla (5-9 znaků)"
								maxLength={9}
								autoComplete="off"
							/>
						</div>
						<div className="col-md-6 d-flex align-items-end justify-content-md-end mt-md-0 mt-3">
							<button
								type="button"
								className="btn btn-primary w-100"
								onClick={handleSubmit}
								id="getOrvInfoBtn"
								disabled={!isOrvValid || loading}
							>
								Vyhledat vozidlo dle ORV
							</button>
						</div>

						{error && (
							<div className="mt-4 mb-1">
								<p className="text-danger">{error}</p>
							</div>
						)}

						<section
							className="jumbotron jumbotron-fluid mt-5"
							aria-labelledby="features-heading"
						>
							<div className="container">
								<h3 id="features-heading" className="h4 mb-3">
									Co zjistíte při kontrole vozidla zdarma?
								</h3>
								<ul className="list-unstyled">
									<li className="mb-2">
										✅ <strong>Základní údaje o vozidle</strong> - značka,
										model, obchodní označení
									</li>
									<li className="mb-2">
										✅ <strong>Datum první registrace</strong> - kdy bylo
										vozidlo poprvé zaregistrováno
									</li>
									<li className="mb-2">
										✅ <strong>Platnost technické prohlídky STK</strong> - do
										kdy je vozidlo technicky způsobilé
									</li>
									<li className="mb-2">
										✅ <strong>Technické údaje vozidla</strong> - motorizace,
										objem motoru, výkon, palivo
									</li>
									<li className="mb-2">
										✅ <strong>Více než 90 dalších údajů</strong> - barva,
										karoserie, počet míst, emisní norma a další
									</li>
									<li className="mb-0">
										❌ <strong>Poznámka:</strong> Vozidlo musí být zaregistrované
										v českém registru vozidel
									</li>
								</ul>
							</div>
						</section>
						</div>
					)}
				</section>

				{!showSearch && (
					<div
						className="mt-4"
						style={{ display: 'flex', justifyContent: 'center' }}
					>
						<button
							type="button"
							className="btn btn-primary w-75"
							onClick={handleNewSearch}
						>
							Vyhledat jiné vozidlo
						</button>
					</div>
				)}

				{vehicleData && (
					<section aria-labelledby="vehicle-info-heading">
						<h2 id="vehicle-info-heading" className="visually-hidden">
							Informace o vozidle
						</h2>
						<VehicleInfo data={vehicleData} vinCode={vinCode} />
					</section>
				)}
			</main>
			<Footer />
		</>
	)
}

export default HomePage
