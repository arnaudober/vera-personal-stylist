export interface FavouriteOutfit {
  id: string;
  topId: string;
  bottomId: string;
  outerwearId?: string;
  shoesId?: string;
  accessoriesIds?: string[];
  savedAt: Date;
  sessionId: string;
}
