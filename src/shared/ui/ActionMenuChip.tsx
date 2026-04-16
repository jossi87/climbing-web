import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Download, Loader2, type LucideIcon } from 'lucide-react';
import { downloadFileWithProgress, getUrl, useAccessToken } from '../../api';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

export type ActionMenuChipItem = {
  id: string;
  label: string;
  href: string;
  title?: string;
  kind?: 'download' | 'link';
};

type Props = {
  label: string;
  title?: string;
  icon?: LucideIcon;
  items: ActionMenuChipItem[];
};

/** Compact chip that opens a dropdown menu for related actions (PDF, Maps, etc). */
export const ActionMenuChip = ({ label, title, icon: Icon = Download, items }: Props) => {
  const accessToken = useAccessToken();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; minWidth: number }>({
    top: 0,
    left: 0,
    minWidth: 0,
  });

  const filteredItems = useMemo(() => items.filter((item) => item.href.trim().length > 0), [items]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = !!rootRef.current?.contains(target);
      const clickedMenu = !!menuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
        minWidth: rect.width,
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  if (filteredItems.length === 0) return null;

  const asAbsoluteHref = (href: string) =>
    href.startsWith('http://') || href.startsWith('https://') ? href : getUrl(href);

  const onDownload = async (item: ActionMenuChipItem) => {
    if (loadingId) return;
    setLoadingId(item.id);
    setProgress(0);
    try {
      await downloadFileWithProgress(accessToken, asAbsoluteHref(item.href), (p) => setProgress(p));
      setOpen(false);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setLoadingId(null);
      setProgress(null);
    }
  };

  return (
    <div ref={rootRef} className='relative inline-flex'>
      <button
        type='button'
        title={title ?? label}
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          designContract.surfaces.metaChipInteractive,
          open ? 'ring-brand-border/45 bg-surface-raised-hover' : '',
        )}
      >
        <Icon size={12} strokeWidth={2} className='shrink-0 text-slate-100' />
        <span className='min-w-0 leading-snug'>{label}</span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={cn('shrink-0 transition-transform', open ? 'rotate-180' : '')}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className='bg-surface-card border-surface-border fixed z-300 w-max max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border py-1.5 shadow-2xl'
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px`, minWidth: `${menuPos.minWidth}px` }}
          >
            {filteredItems.map((item) => {
              const isLoading = loadingId === item.id;
              const isDownload = (item.kind ?? 'download') === 'download';
              if (isDownload) {
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => onDownload(item)}
                    disabled={loadingId !== null}
                    title={item.title}
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-slate-200 transition-colors disabled:opacity-60'
                  >
                    {isLoading ? (
                      <Loader2 size={12} strokeWidth={2} className='text-brand shrink-0 animate-spin' />
                    ) : null}
                    <span className='min-w-0 truncate'>
                      {isLoading && progress ? `Downloading ${progress}%` : item.label}
                    </span>
                  </button>
                );
              }
              return (
                <a
                  key={item.id}
                  href={asAbsoluteHref(item.href)}
                  target='_blank'
                  rel='noreferrer noopener'
                  title={item.title}
                  onClick={() => setOpen(false)}
                  className='hover:bg-surface-raised-hover flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-slate-200 transition-colors'
                >
                  <span className='min-w-0 truncate'>{item.label}</span>
                </a>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};
