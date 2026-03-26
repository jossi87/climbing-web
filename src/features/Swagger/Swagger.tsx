import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useMeta } from '../../shared/components/Meta/context';
import { FileJson } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';

const Swagger = () => {
  const meta = useMeta();

  return (
    <div className='w-full min-w-0'>
      <title>{`API Documentation | ${meta?.title}`}</title>
      <meta name='description' content='API Documentation' />

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='border-surface-border border-b p-4 sm:p-5'>
          <SectionHeader title='API Documentation' icon={FileJson} subheader='OpenAPI reference' />
        </div>
        <div className='overflow-hidden bg-white p-2 sm:p-3'>
          <SwaggerUI url='https://brattelinjer.no/com.buldreinfo.jersey.jaxb/openapi.json' />
        </div>
      </Card>
    </div>
  );
};

export default Swagger;
