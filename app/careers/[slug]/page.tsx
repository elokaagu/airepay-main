import { CareersSlugRouteClient } from "./careers-slug-route-client";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CareersSlugRouteClient slug={slug} />;
}
