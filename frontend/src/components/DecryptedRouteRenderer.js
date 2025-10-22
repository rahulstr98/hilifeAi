import { useParams } from 'react-router-dom';
import { decryptRoute } from './encryptRoute';
import routeComponentMap from './routeMap';

const DecryptedRouteRenderer = () => {
  const { encryptedRoute } = useParams();
  let decryptedPath = '';

  try {
    decryptedPath = decryptRoute(encryptedRoute);
  } catch (err) {
    console.error('Decryption failed:', err);
    return <h2>Invalid or corrupted route</h2>;
  }

  const Component = routeComponentMap[decryptedPath];
  return Component ? <Component /> : <h2>404 - Page Not Found</h2>;
};

export default DecryptedRouteRenderer;
