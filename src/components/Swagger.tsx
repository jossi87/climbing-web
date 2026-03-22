import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useMeta } from './common/meta/context';
import { FileJson, ChevronRight } from 'lucide-react';

const Swagger = () => {
  const meta = useMeta();

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`API Documentation | ${meta?.title}`}</title>
      <meta name='description' content='API Documentation' />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <FileJson size={14} className='text-brand' />
            <span className='uppercase'>API Documentation</span>
          </div>
        </nav>
      </div>

      <div className='bg-white border border-surface-border rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6'>
        <SwaggerUI url='https://brattelinjer.no/com.buldreinfo.jersey.jaxb/openapi.json' />
      </div>
    </div>
  );
};

export default Swagger;
