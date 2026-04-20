import { BlogSlugRouteClient } from "./blog-slug-route-client";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogSlugRouteClient slug={slug} />;
}
