import SharedFile from '@/components/SharedFile';

interface SharePageProps {
  params: {
    code: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  return <SharedFile code={params.code} />;
}

