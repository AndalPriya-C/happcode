import { Toast } from './components/Toast';
import { useIde } from './hooks/useIde';
import { useMediaQuery } from './hooks/useMediaQuery';
import { DesktopLayout } from './layouts/DesktopLayout';
import { MobileLayout } from './layouts/MobileLayout';

export default function App() {
  const ide = useIde();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const stacked = useMediaQuery('(max-width: 1023px)');

  return (
    <>
      {isMobile ? <MobileLayout ide={ide} /> : <DesktopLayout ide={ide} stacked={stacked} />}
      <Toast message={ide.toast?.message} mobile={isMobile} />
    </>
  );
}
