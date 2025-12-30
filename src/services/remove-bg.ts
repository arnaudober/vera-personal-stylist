class UploadService {
  private removeBgAPIKey: string = import.meta.env.VITE_REMOVE_BG_API_KEY;

  async removeBackground(file: File): Promise<Blob> {
    if (!this.removeBgAPIKey) {
      throw new Error("Remove.bg API key is not configured.");
    }

    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-API-Key": this.removeBgAPIKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.errors?.[0]?.title ||
          `Failed to remove background: ${response.statusText}`,
      );
    }

    return await response.blob();
  }
}

export const uploadService = new UploadService();
