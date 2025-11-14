export interface VehicleDataItem {
	name: string
	value: string | number
	label: string
}

export interface VehicleData {
	Status?: string
	Data?: Record<string, string | number>
}

export type VehicleDataArray = VehicleDataItem[]
