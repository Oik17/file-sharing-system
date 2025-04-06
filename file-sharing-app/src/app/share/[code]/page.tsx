import SharedFile from '@/components/SharedFile';

export default function SharePage({ params }: { params: { code: string } }) {
  return <SharedFile code={params.code} />;
}
