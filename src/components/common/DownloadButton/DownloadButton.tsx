import { useCallback, useState, MouseEvent } from 'react';
import { Icon, Label, LabelProps, SemanticICONS } from 'semantic-ui-react';
import { getUrl, downloadFile, useAccessToken } from '../../../api';

type Props = {
  href: string;
  icon?: SemanticICONS;
  children: string;
};

export const DownloadButton = ({ href, icon = 'file pdf outline', children }: Props) => {
  const accessToken = useAccessToken();
  const [loading, setLoading] = useState(false);
  const onClick: LabelProps['onClick'] = useCallback(
    (e: MouseEvent<HTMLElement>, _data: LabelProps) => {
      const url = (e.currentTarget as HTMLElement).getAttribute('href');
      if (!url) {
        return;
      }

      e.preventDefault();
      setLoading(true);
      downloadFile(accessToken, url).finally(() => {
        setLoading(false);
      });
    },
    [accessToken],
  );

  return (
    <Label
      href={getUrl(href)}
      onClick={onClick}
      rel='noreferrer noopener'
      target='_blank'
      image
      basic
    >
      <Icon name={loading ? 'spinner' : icon} loading={loading} />
      {children}
    </Label>
  );
};
