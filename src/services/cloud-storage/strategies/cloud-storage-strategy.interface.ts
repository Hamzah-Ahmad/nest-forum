export interface ImageCloudUploadPayload {
  buffer: Buffer,
  mimeType: string,
}
export interface CloudStorageStrategy {
  uploadFile(payload: ImageCloudUploadPayload): Promise<string>;
}
