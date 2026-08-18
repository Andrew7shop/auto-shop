import { getShopProfile } from "@/lib/shop-profile";
import { updateShopProfile } from "./actions";
import { Field, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function ShopSettingsPage() {
  const profile = await getShopProfile();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Shop Profile</h2>
        <p className="text-sm text-zinc-500">
          This information appears on printed invoices and reports.
        </p>
      </div>

      <form action={updateShopProfile} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field name="name" label="Shop name" required defaultValue={profile?.name ?? ""} />
          <Field name="shopId" label="Shop ID" defaultValue={profile?.shopId ?? undefined} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="licenseNumber"
            label="License number"
            defaultValue={profile?.licenseNumber ?? undefined}
          />
          <Field name="taxId" label="Tax ID" defaultValue={profile?.taxId ?? undefined} />
        </div>
        <Field name="phone" label="Phone number" type="tel" defaultValue={profile?.phone ?? undefined} />
        <Field name="address" label="Address" defaultValue={profile?.address ?? undefined} />
        <div className="grid grid-cols-3 gap-4">
          <Field name="city" label="City" defaultValue={profile?.city ?? undefined} />
          <Field name="state" label="State" defaultValue={profile?.state ?? undefined} />
          <Field name="postalCode" label="Postal code" defaultValue={profile?.postalCode ?? undefined} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
