import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useMeta } from '../../shared/components/Meta/context';
import { FileJson, ChevronRight } from 'lucide-react';
import { designContract } from '../../design/contract';

const Swagger = () => {
  const meta = useMeta();

  return (
    <div className={designContract.layout.pageShell}>
      <title>{`API Documentation | ${meta?.title}`}</title>
      <meta name='description' content='API Documentation' />

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <FileJson size={14} className='text-brand' />
            <span className='uppercase'>API Documentation</span>
          </div>
        </nav>
      </div>

      <div className='border-surface-border overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-6'>
        <SwaggerUI url='https://brattelinjer.no/com.buldreinfo.jersey.jaxb/openapi.json' />
      </div>
    </div>
  );
};

export default Swagger;
