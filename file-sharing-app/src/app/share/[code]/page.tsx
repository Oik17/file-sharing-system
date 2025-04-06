import SharedFile from '@/components/SharedFile';

type SharePageProps = {
  params: { code: string };
};

export default function SharePage({ params }: SharePageProps) {
  return <SharedFile code={params.code} />;
}
