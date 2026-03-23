import { RedirectType, redirect } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  redirect('/login', RedirectType.replace);
}
