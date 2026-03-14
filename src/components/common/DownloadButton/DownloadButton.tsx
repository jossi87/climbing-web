import { Icon, Label, type LabelProps, type SemanticICONS } from 'semantic-ui-react';
import { getUrl, downloadFile, useAccessToken } from '../../../api';

type Props = {
  href: string;
  icon?: SemanticICONS;
  children: string;
};

export const DownloadButton = ({ href, icon = 'file pdf outline', children }: Props) => {
  const accessToken = useAccessToken();

  const onClick: LabelProps['onClick'] = (e) => {
    const fullUrl = e.currentTarget.getAttribute('href');
    if (!fullUrl) return;

    e.preventDefault();
    downloadFile(accessToken, fullUrl);
  };

  return (
    <Label
      href={getUrl(href)}
      onClick={onClick}
      rel='noreferrer noopener'
      target='_blank'
      image
      size='mini'
      basic
    >
      <Icon name={icon} />
      {children}
    </Label>
  );
};
