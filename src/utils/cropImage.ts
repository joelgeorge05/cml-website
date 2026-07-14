export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  maxSize = 800 // default max size to compress and speed up loading
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  
  // First canvas: Rotate and flip the entire source image
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return null

  tempCanvas.width = image.width
  tempCanvas.height = image.height

  tempCtx.translate(image.width / 2, image.height / 2)
  tempCtx.rotate((rotation * Math.PI) / 180)
  tempCtx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  tempCtx.translate(-image.width / 2, -image.height / 2)
  tempCtx.drawImage(image, 0, 0)

  // Determine scaled dimensions to prevent massive file sizes
  let targetWidth = pixelCrop.width
  let targetHeight = pixelCrop.height

  if (pixelCrop.width > maxSize || pixelCrop.height > maxSize) {
    const aspectRatio = pixelCrop.width / pixelCrop.height
    if (aspectRatio > 1) {
      targetWidth = maxSize
      targetHeight = Math.round(maxSize / aspectRatio)
    } else {
      targetHeight = maxSize
      targetWidth = Math.round(maxSize * aspectRatio)
    }
  }

  // Second canvas: Crop the region and scale it down
  const finalCanvas = document.createElement('canvas')
  const finalCtx = finalCanvas.getContext('2d')
  if (!finalCtx) return null

  finalCanvas.width = targetWidth
  finalCanvas.height = targetHeight

  // Draw the crop area from the temp canvas onto the final canvas with scaling
  finalCtx.drawImage(
    tempCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  )

  // Export as WebP format at 80% quality for optimal file sizes and speed
  return new Promise((resolve) => {
    finalCanvas.toBlob((file) => {
      resolve(file)
    }, 'image/webp', 0.8)
  })
}
