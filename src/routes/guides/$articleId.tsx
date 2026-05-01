import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/$articleId")({
  loader: async ({ params }) => {
    const { getGuideBySlug } = await import("@/lib/guides-data");
    const article = getGuideBySlug(params.articleId);
    if (!article) throw notFound();
    return { article };
  },
});
