export interface FavouriteOutfit {
  id: string;
  topId: string;
  bottomId: string;
  outerwearId?: string;
  shoesId?: string;
  accessoriesId?: string;
  savedAt: Date;
  sessionId: string;
}
