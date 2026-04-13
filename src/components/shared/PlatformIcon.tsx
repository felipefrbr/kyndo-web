import { SiTiktok, SiYoutube, SiInstagram } from 'react-icons/si';
import type { PlatformKey } from '@/types/campaign.types';

const ICONS = {
  tiktok: { Icon: SiTiktok, label: 'TikTok', color: '#000000' },
  youtube: { Icon: SiYoutube, label: 'YouTube', color: '#FF0000' },
  instagram: { Icon: SiInstagram, label: 'Instagram', color: '#E4405F' },
} as const;

interface PlatformIconProps {
  platform: PlatformKey;
  size?: number;
  colored?: boolean;
  className?: string;
}

export function PlatformIcon({ platform, size = 18, colored = true, className }: PlatformIconProps) {
  const meta = ICONS[platform];
  if (!meta) return null;
  return (
    <meta.Icon
      size={size}
      color={colored ? meta.color : undefined}
      className={className}
      aria-label={meta.label}
    />
  );
}

export function platformLabel(platform: PlatformKey): string {
  return ICONS[platform]?.label ?? platform;
}
