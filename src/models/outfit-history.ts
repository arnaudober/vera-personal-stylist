export interface OutfitHistoryEntry {
  id: string;
  topId: string;
  bottomId: string;
  outerwearId?: string;
  shoesId?: string;
  accessoriesId?: string;
  wornAt: Date;
  sessionId: string;
}
