export interface Media {
    id: string;
    type: "photo" | "video";
    url: string;
    thumbnailUrl?: string;
    uploadedBy: string;
    uploadedAt: Date;
    rideId?: string;
    caption?: string;
    tags?: string[];
    people?: string[];
    postedToInsta: boolean;
}

export interface MediaAlbum {
    id: string;
    title: string;
    description?: string;
    coverImageUrl?: string;
    rideId?: string;
    createdBy: string;
    createdAt: Date;
    mediaIds: string[];
}
