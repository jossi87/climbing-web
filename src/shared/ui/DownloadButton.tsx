import { useState } from 'react';
import { Download, Loader2, type LucideIcon } from 'lucide-react';
import { getUrl, downloadFileWithProgress, useAccessToken } from '../../api';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  href: string;
  icon?: LucideIcon;
  children: string;
};

/** Matches {@link Badge} / condition-row chip styling */
export const DownloadButton = ({ href, icon: Icon = Download, children }: Props) => {
  const accessToken = useAccessToken();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(0);

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const fullUrl = e.currentTarget.getAttribute('href');
    if (!fullUrl || loading) return;

    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      await downloadFileWithProgress(accessToken, fullUrl, (p) => setProgress(p));
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setLoading(false);
    }
  };

  const getLabelText = () => {
    if (!loading) return children;
    if (progress === null || progress === 0) return 'Preparing...';
    return `Downloading ${progress}%`;
  };

  return (
    <a
      href={getUrl(href)}
      onClick={onClick}
      className={cn(
        designContract.surfaces.metaChipInteractive,
        loading ? 'pointer-events-none cursor-wait opacity-60' : '',
      )}
    >
      {loading ? (
        <Loader2 size={11} strokeWidth={2} className='text-brand shrink-0 animate-spin' />
      ) : (
        <Icon size={11} strokeWidth={2} className='shrink-0 text-slate-100' />
      )}
      <span className='min-w-0 leading-snug'>{getLabelText()}</span>
    </a>
  );
};
