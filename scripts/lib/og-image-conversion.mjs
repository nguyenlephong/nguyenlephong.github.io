import { promises as fs } from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

export const DEFAULT_OG_JPEG_QUALITY = 86
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function assertQuality(quality) {
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
    throw new Error(`[og-image] JPEG quality must be an integer from 1 to 100, received: ${String(quality)}`)
  }
}

function ogJpegPipeline(input, quality) {
  assertQuality(quality)
  return sharp(input)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality, mozjpeg: true })
}

export async function renderOgJpeg(input, { quality = DEFAULT_OG_JPEG_QUALITY } = {}) {
  return ogJpegPipeline(input, quality).toBuffer()
}

export async function convertToOgJpeg(
  input,
  outputPath,
  { quality = DEFAULT_OG_JPEG_QUALITY } = {},
) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  return ogJpegPipeline(input, quality).toFile(outputPath)
}

async function signatureOf(input, length) {
  if (Buffer.isBuffer(input) || input instanceof Uint8Array) {
    return Buffer.from(input).subarray(0, length)
  }

  const handle = await fs.open(input, 'r')
  try {
    const signature = Buffer.alloc(length)
    const { bytesRead } = await handle.read(signature, 0, length, 0)
    return signature.subarray(0, bytesRead)
  } finally {
    await handle.close()
  }
}

export async function validateOgImage(input, { format, label = 'OG image' }) {
  if (format !== 'png' && format !== 'jpeg') {
    throw new Error(`[og-image] unsupported validation format: ${String(format)}`)
  }

  const expectedSignatureLength = format === 'png' ? PNG_SIGNATURE.length : 3
  const signature = await signatureOf(input, expectedSignatureLength)
  const signatureMatches =
    format === 'png'
      ? signature.equals(PNG_SIGNATURE)
      : signature.length === 3 && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff

  if (!signatureMatches) {
    throw new Error(`[og-image] ${label} does not have a valid ${format.toUpperCase()} signature`)
  }

  let metadata
  try {
    metadata = await sharp(input).metadata()
  } catch (error) {
    throw new Error(`[og-image] ${label} cannot be decoded`, { cause: error })
  }

  if (metadata.format !== format) {
    throw new Error(
      `[og-image] ${label} decoded as ${metadata.format ?? 'unknown'}; expected ${format}`,
    )
  }
  if (metadata.width !== OG_IMAGE_WIDTH || metadata.height !== OG_IMAGE_HEIGHT) {
    throw new Error(
      `[og-image] ${label} is ${metadata.width ?? 'unknown'}x${metadata.height ?? 'unknown'}; expected ${OG_IMAGE_WIDTH}x${OG_IMAGE_HEIGHT}`,
    )
  }
  if ((metadata.pages ?? 1) !== 1) {
    throw new Error(`[og-image] ${label} must contain exactly one frame`)
  }

  return metadata
}
