import React from 'react'
import { VehicleDataArray } from '../types'
import { formatValue, getDataValue, getLogoSrc } from '../utils/vehicleApi'

interface VehicleInfoProps {
	data: VehicleDataArray
	vinCode: string
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ data, vinCode }) => {
	const excludedFields = new Set([
		'TovarniZnacka',
		'Typ',
		'DatumPrvniRegistrace',
		'VIN',
		'PravidelnaTechnickaProhlidkaDo'
	])

	const brand = getDataValue(data, 'TovarniZnacka', 'Neznámá značka')
	const brandLogoSrc = getLogoSrc(brand)
	const model = getDataValue(data, 'Typ', 'Neznámý model')
	const obchodniOznaceni = getDataValue(data, 'ObchodniOznaceni', '')
	const firstRegistration = getDataValue(
		data,
		'DatumPrvniRegistrace',
		'Neznámé datum'
	)
	const techInspection = getDataValue(
		data,
		'PravidelnaTechnickaProhlidkaDo',
		'Neznámé datum'
	)

	// Parse and check tech inspection date
	const currentDate = new Date()
	let techInspectionDate: Date | null = null
	if (techInspection && techInspection !== 'Neznámé datum') {
		const [day, month, year] = techInspection.split('.')
		if (day && month && year) {
			techInspectionDate = new Date(`${year}-${month}-${day}`)
		}
	}

	const isExpired =
		techInspectionDate && techInspectionDate.getTime() < currentDate.getTime()
	const color = isExpired ? 'red' : 'green'

	const filteredData = data.filter(
		(item) =>
			!excludedFields.has(item.name) && item.value !== '' && item.value != null
	)

	return (
		<div className="mt-4 mb-5">
			<div className="row mt-5 mb-5 align-items-center">
				{/* Brand logo column */}
				<div className="col-md-3 text-center">
					<img
						src={brandLogoSrc}
						alt={`${brand} Logo`}
						loading="lazy"
						decoding="async"
						className="img-fluid logo-img brand-logo"
					/>
				</div>

				{/* Vehicle info column */}
				<div className="col-md-4">
					<div className="vehicle-info">
						<div>
							<strong>Značka:</strong> {brand}
						</div>
						<div>
							<strong>Model:</strong> {model}
						</div>
						<div>
							<strong>Obchodní označení:</strong> {obchodniOznaceni}
						</div>
						<div>
							<strong>Datum první registrace:</strong> {firstRegistration}
						</div>
						<div>
							<strong>VIN:</strong> {vinCode}
						</div>
					</div>
				</div>

				{/* Technical inspection column */}
				<div className="col-md-4">
					<div>
						<strong>Pravidelná technická prohlídka do:</strong>{' '}
						<span style={{ color }}>{techInspection}</span>
					</div>

					{/* Insurance buttons */}
					<div className="mt-3">
						<a
							href="#/povinne-ruceni"
							className="btn btn-outline-primary w-90 mt-1 mb-1"
							role="button"
						>
							Povinné ručení
						</a>
						<a
							href="#/havarijni-pojisteni"
							className="btn btn-outline-primary w-90 mt-1 mb-1"
							role="button"
						>
							Havarijní pojištění
						</a>
						<br />
						<a
							href="#/kompletni-historie-vozu"
							className="btn btn-outline-primary w-100 mt-1 mb-1"
							role="button"
						>
							Kompletní historie vozu
						</a>
					</div>
				</div>
			</div>

			{/* Detailed data table */}
			{filteredData.length > 0 && (
				<table className="table mt-4">
					<tbody>
						{filteredData.map((item) => (
							<tr key={item.name}>
								<th>{item.label}</th>
								<td
									dangerouslySetInnerHTML={{ __html: formatValue(item.value) }}
								/>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}

export default VehicleInfo
