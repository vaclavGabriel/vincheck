export interface VehicleDataItem {
	name: string
	value: string | number | boolean
	label: string
}

export interface VehicleData {
	Status?: string
	Data?: Record<string, string | number | boolean>
}

export type VehicleDataArray = VehicleDataItem[]
