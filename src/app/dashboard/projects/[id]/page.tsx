import ProjectDetailClient from '@/components/project-detail-client';

type PageProps = {
  params: { id: string };
};

// This page will now be dynamically rendered
export default function ProjectDetailPage({ params }: PageProps) {
  return <ProjectDetailClient projectId={params.id} />;
}
