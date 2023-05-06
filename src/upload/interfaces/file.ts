export interface FileInterface {
  originalName: string,
  encoding: string,
  busBoyMimeType: string,
  buffer: Buffer,
  size: number
  fileType: {
    ext: string,
    mime: string
  }
}