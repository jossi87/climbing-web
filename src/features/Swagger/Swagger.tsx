import { useEffect } from 'react';

const Swagger = () => {
  useEffect(() => {
    window.open('/api/swagger-ui/index.html', '_blank', 'noopener,noreferrer');
    window.history.back();
  }, []);

  return null;
};

export default Swagger;
