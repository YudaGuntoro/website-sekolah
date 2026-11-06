'use client'
import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src' | 'unoptimized'> & { imageUrl: string; defaultSrc: string }
export default function HomepageImage({ imageUrl, defaultSrc, ...props }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const selected = imageUrl.trim() || defaultSrc
  return <Image {...props} unoptimized src={failedUrl === selected ? defaultSrc : selected} onError={() => setFailedUrl(selected)} />
}
