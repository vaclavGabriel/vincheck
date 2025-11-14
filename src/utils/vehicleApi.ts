import { VehicleData, VehicleDataArray, VehicleDataItem } from '../types'

// Serverless function endpoint
// Always use Vercel endpoint since GitHub Pages doesn't support serverless functions
const getProxyApiUrl = (): string => {
	// Always use the Vercel serverless function endpoint
	// GitHub Pages is static hosting and doesn't support serverless functions
	return 'https://vincheck-lk50sdfjl-vaclavs-projects-47bb9be1.vercel.app/api/vehicle'
}

// Field name to label mapping (Czech labels)
const fieldLabels: Record<string, string> = {
	VIN: 'VIN',
	TovarniZnacka: 'Tovární značka',
	Typ: 'Typ',
	ObchodniOznaceni: 'Obchodní označení',
	DatumPrvniRegistrace: 'Datum první registrace',
	PravidelnaTechnickaProhlidkaDo: 'Pravidelná technická prohlídka do',
	VozidloDruh: 'Druh vozidla',
	VozidloDruh2: 'Druh vozidla 2',
	Kategorie: 'Kategorie',
	VozidloVyrobce: 'Výrobce vozidla',
	MotorVyrobce: 'Výrobce motoru',
	MotorTyp: 'Typ motoru',
	MotorMaxVykon: 'Maximální výkon motoru',
	Palivo: 'Palivo',
	MotorZdvihObjem: 'Objem motoru',
	VozidloKaroserieBarva: 'Barva karoserie',
	Rozmery: 'Rozměry',
	RozmeryRozvor: 'Rozvor',
	HmotnostiProvozni: 'Provozní hmotnost',
	CisloTp: 'Číslo TP',
	CisloOrv: 'Číslo ORV',
	StatusNazev: 'Status',
	PocetVlastniku: 'Počet vlastníků',
	PocetProvozovatelu: 'Počet provozovatelů'
}

// Brand logo mapping
export const brandLogos: Record<string, string> = {
	'ALFA-ROMEO': 'logos/alfa-romeo.svg',
	AUDI: 'logos/audi.svg',
	BMW: 'logos/bmw.svg',
	CHEVROLET: 'logos/chevrolet.svg',
	CITROEN: 'logos/citroen.svg',
	CUPRA: 'logos/cupra.svg',
	DACIA: 'logos/dacia.svg',
	FERRARI: 'logos/ferrari.svg',
	FIAT: 'logos/fiat.svg',
	FORD: 'logos/ford.svg',
	HONDA: 'logos/honda.svg',
	HYUNDAI: 'logos/hyundai.svg',
	KIA: 'logos/kia.svg',
	LANCIA: 'logos/lancia.svg',
	'LAND-ROVER': 'logos/land-rover.svg',
	MAZDA: 'logos/mazda.svg',
	'MERCEDES-BENZ': 'logos/mercedes-benz.svg',
	MITSUBISHI: 'logos/mitsubishi.svg',
	OPEN: 'logos/opel.svg',
	PEUGEOT: 'logos/peugeot.svg',
	PORSCHE: 'logos/porsche.svg',
	RENAULT: 'logos/renault.svg',
	SAAB: 'logos/saab.svg',
	SEAT: 'logos/seat.svg',
	SKODA: 'logos/skoda.svg',
	ŠKODA: 'logos/skoda.svg',
	TOYOTA: 'logos/toyota.svg',
	VOLKSWAGEN: 'logos/volkswagen.svg',
	VOLVO: 'logos/volvo.svg',
	VW: 'logos/volkswagen.svg'
}

// Helper function to transform API response to expected format
export function transformApiResponse(
	apiResponse: VehicleData | VehicleDataArray
): VehicleDataArray {
	// Check if it's already in the expected array format
	if (Array.isArray(apiResponse)) {
		return apiResponse
	}

	// Transform from {Status, Data: {...}} format to array format
	if (apiResponse.Status && apiResponse.Data) {
		const dataArray: VehicleDataItem[] = []
		const data = apiResponse.Data

		// Convert object to array
		for (const [key, value] of Object.entries(data)) {
			if (value !== null && value !== undefined && value !== '') {
				dataArray.push({
					name: key,
					value: value,
					label: fieldLabels[key] || key
				})
			}
		}

		return dataArray
	}

	// If format is unknown, return empty array
	return []
}

// Helper function to get data value by name
export function getDataValue(
	data: VehicleDataArray,
	name: string,
	defaultValue: string = ''
): string {
	const item = data.find((item) => item.name === name)
	return item?.value?.toString() || defaultValue
}

// Optimized logo source getter
export function getLogoSrc(brand: string): string {
	return brandLogos[brand] || 'logos/default_logo.svg'
}

// Sanitize and format string value for display
export function formatValue(value: string | number): string {
	if (typeof value !== 'string') {
		value = String(value)
	}
	return value.replace(/\n/g, '<br>')
}

// Main function to fetch vehicle info
export async function fetchVehicleInfo(
	vin?: string,
	tp?: string,
	orv?: string
): Promise<VehicleDataArray> {
	// Get the API URL at runtime
	const apiUrl = getProxyApiUrl()
	// Build proxy URL with query parameters
	let proxyUrl = `${apiUrl}?`
	if (vin) {
		proxyUrl += `vin=${encodeURIComponent(vin)}`
	} else if (tp) {
		proxyUrl += `tp=${encodeURIComponent(tp)}`
	} else if (orv) {
		proxyUrl += `orv=${encodeURIComponent(orv)}`
	} else {
		throw new Error('At least one parameter (vin, tp, or orv) is required')
	}

	const response = await fetch(proxyUrl, {
		cache: 'no-cache',
		mode: 'cors',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json'
		}
	})

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`)
	}

	const responseData: VehicleData | VehicleDataArray = await response.json()
	const data = transformApiResponse(responseData)

	if (!Array.isArray(data) || data.length === 0) {
		throw new Error('Invalid or empty response from API')
	}

	return data
}
