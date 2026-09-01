import { redirect } from 'next/navigation';

export default function PayRedirectPage({ params }: { params: { token: string } }) {
  redirect(`/i/${params.token}`);
}
