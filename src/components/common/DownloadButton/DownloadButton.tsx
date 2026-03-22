import { useState } from 'react';
import { FileText, Loader2, type LucideIcon } from 'lucide-react';
import { getUrl, downloadFileWithProgress, useAccessToken } from '../../../api';
import { cn } from '../../../lib/utils';

type Props = {
  href: string;
  icon?: LucideIcon;
  children: string;
};

export const DownloadButton = ({ href, icon: Icon = FileText, children }: Props) => {
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
        'inline-flex items-center gap-2 px-2 py-1 rounded-md border transition-all text-[10px] font-bold uppercase tracking-tight',
        'bg-surface-nav border-surface-border text-slate-400 hover:text-white hover:border-brand/50',
        loading ? 'cursor-wait opacity-70 pointer-events-none' : 'cursor-pointer',
      )}
    >
      {loading ? <Loader2 size={12} className='animate-spin text-brand' /> : <Icon size={12} />}
      <span>{getLabelText()}</span>
    </a>
  );
};
