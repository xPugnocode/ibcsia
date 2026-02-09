export interface CarpoolGroup {
    id: string;
    rideId: string;
    driverID: string;
    passengerIDs: string[];
    maxCapacity: number;
    notes?: string;
}
