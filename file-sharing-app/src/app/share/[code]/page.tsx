import SharedFile from '@/components/SharedFile';

type Params = Promise<{ code: string }>;

export default async function SharePage({ params }: { params: Params }) {
  const { code } = await params;
  return <SharedFile code={code} />;
}
