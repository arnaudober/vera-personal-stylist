export interface OutfitHistoryEntry {
  id: string;
  topId: string;
  bottomId: string;
  outerwearId?: string;
  shoesId?: string;
  accessoriesIds?: string[];
  wornAt: Date;
  sessionId: string;
}
