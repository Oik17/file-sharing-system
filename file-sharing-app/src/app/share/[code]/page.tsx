import SharedFile from '@/components/SharedFile';
// import { type Metadata } from 'next';


export default function SharePage({ params }: { params: { code: string } }) {
  return <SharedFile code={params.code} />;
}
