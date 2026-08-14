import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getEventPerformance } from "@/lib/analytics-server";
import { getAdminEvents } from "@/lib/events";
import { getAdminCatalog } from "@/lib/catalog";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin/login");

  const [events, catalog, analytics] = await Promise.all([
    getAdminEvents(),
    getAdminCatalog(),
    getEventPerformance()
  ]);

  return (
    <AdminDashboard
      initialEvents={events}
      initialVenues={catalog.venues}
      initialGenres={catalog.genres}
      performance={analytics.performance}
      initialSales={analytics.sales}
      analyticsReady={analytics.ready}
    />
  );
}
