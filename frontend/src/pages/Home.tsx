import { useAuth } from '../contexts/AuthContext';
import { ContentSwiper } from '../components/ContentSwiper';
import { PhoneShell } from '../components/PhoneShell';

export function Home() {
  const { } = useAuth();
  return (
    <PhoneShell>
      <ContentSwiper posts={[]} />
    </PhoneShell>
  );
}