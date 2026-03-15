import { Icon, Label, type LabelProps, type SemanticICONS } from 'semantic-ui-react';
import { getUrl, downloadFileWithProgress, useAccessToken } from '../../../api';
import { useState } from 'react';

type Props = {
  href: string;
  icon?: SemanticICONS;
  children: string;
};

export const DownloadButton = ({ href, icon = 'file pdf outline', children }: Props) => {
  const accessToken = useAccessToken();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(0);

  const onClick: LabelProps['onClick'] = async (e) => {
    const fullUrl = e.currentTarget.getAttribute('href');
    if (!fullUrl || loading) return;

    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      await downloadFileWithProgress(accessToken, fullUrl, (p) => setProgress(p));
    } catch (err) {
      console.error('Download failed', err);
      // You could use a toast notification here instead of alert
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
    <Label
      as='a'
      href={getUrl(href)}
      onClick={onClick}
      image
      size='mini'
      basic
      style={{
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.8 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
    >
      <Icon name={loading ? 'spinner' : icon} loading={loading} />
      {getLabelText()}
    </Label>
  );
};
