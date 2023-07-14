import { useRouter } from 'next/router';
import { useEffect } from 'react';

const IndexPage = () => {
  const router = useRouter();

  // Perform the redirect on component mount
  useEffect(() => {
    router.push('/quiz');
  }, []);

  return (
    <div>
      {/* Your landing page content */}
    </div>
  );
};

export default IndexPage;