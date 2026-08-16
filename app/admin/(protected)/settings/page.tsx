import { AccessDenied } from '@/components/admin/AccessDenied';
import { FacilitiesEditor } from '@/components/admin/FacilitiesEditor';
import { PageHeader } from '@/components/admin/PageHeader';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { ADMIN_ONLY } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getFacilitiesForAdmin, getSettingsForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await requirePageSession('/admin/settings');

  /**
   * ⚠️ SUPER_ADMIN only, and this page must stay that way.
   *
   * Facilities are administered here as a sub-resource (D-B23). An earlier
   * draft of the permission matrix gave EDITOR facility rights while the only
   * editing surface was this SUPER_ADMIN-restricted page — a permission with no
   * route to exercise it. The tempting repair is to let EDITOR in here, which
   * would hand every content editor the school's contact details, statistics
   * and global SEO. The correct resolution, already taken, was to remove the
   * unusable permission (CHANGE-0009).
   */
  if (!ADMIN_ONLY.includes(user.role)) {
    return <AccessDenied />;
  }

  const [settings, facilities] = await Promise.all([
    getSettingsForAdmin(),
    getFacilitiesForAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Settings"
        description="School details, statistics and site-wide configuration. Changes appear on the public site immediately."
      />

      <SettingsForm settings={settings} />

      <section aria-labelledby="facilities-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="facilities-heading" className="font-serif text-h2 text-foreground">
            Facilities
          </h2>
          <p className="mt-1 max-w-prose-measure text-body text-foreground-muted">
            Library, laboratories, sports grounds, transport, medical room and so
            on. These appear on the Infrastructure page, and safety items also
            appear on the Safety page.
          </p>
        </div>

        <FacilitiesEditor
          facilities={facilities.map((facility) => ({
            id: facility.id,
            slug: facility.slug,
            name: facility.name,
            description: facility.description,
            category: facility.category,
            displayOrder: facility.displayOrder,
            status: facility.status,
          }))}
        />
      </section>
    </div>
  );
}
