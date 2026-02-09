export interface RideSchedule {
    id: string;
    title: string;
    description: string;
    date: Date;
    startTime: string;
    duration: number; // hours
    meetingLocation: string;
    difficultyLevel: "beginner" | "intermediate" | "advanced";
    status: "proposed" | "scheduled" | "completed" | "cancelled";
}

export interface RideParticipant {
    rideId: string;
    memberId: string;
    status: "registered" | "confirmed" | "cancelled";
    needsCarpool: boolean;
    registeredAt: Date;
}
