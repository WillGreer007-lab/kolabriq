"use client";

import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';

interface CloudinaryVideoProps {
  publicId: string;
  width?: number;
  height?: number;
  className?: string;
}

export function CloudinaryVideo({ publicId, width = 1280, height = 720, className }: CloudinaryVideoProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[var(--border-subtle)] ${className || ''}`}>
      <CldVideoPlayer
        width={width}
        height={height}
        src={publicId}
        colors={{
          accent: '#10B981', // Adswish Emerald
          base: '#072929',   // Adswish Dark
          text: '#F5F5F0'    // Adswish Light
        }}
        fontFace="Outfit"
        logo={{
          imageUrl: 'https://res.cloudinary.com/wvpjmagw/image/upload/v1/logo',
          onClickUrl: 'https://adswish.com'
        }}
        transformation={{
          quality: 'auto',
          fetch_format: 'auto'
        }}
      />
    </div>
  );
}
