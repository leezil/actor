export type ActorProfile = {
  id: string;
  name: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  specialties: string;
  hobbies: string;
  filmography: string;
  youtubeUrl?: string;
  profilePhotoKey: string;
  profilePhoto: string;
  detailPhotoKeys: string[];
  detailPhotos: string[];
  createdAt: string;
  updatedAt: string;
};
