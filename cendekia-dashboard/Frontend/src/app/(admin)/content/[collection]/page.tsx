import { notFound, redirect } from "next/navigation";
import ContentManager from "@/cms/ContentManager";
import { collections } from "@/cms/collections";
export default async function ContentPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (collection === "spmb") redirect("/spmb/informasi");
  const config = collections.find(c => c.key === collection);
  if (!config) notFound();
  return <ContentManager key={config.key} collection={config.key} />;
}
