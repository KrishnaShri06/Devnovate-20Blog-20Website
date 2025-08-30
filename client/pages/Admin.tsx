import { Layout } from "@/components/site/Layout";

export default function Admin() {
  return (
    <Layout>
      <section className="container py-16">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review pending submissions, approve or reject. Admin UI to be
            implemented.
          </p>
        </div>
      </section>
    </Layout>
  );
}
