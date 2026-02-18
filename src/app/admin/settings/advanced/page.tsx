import SettingsManager from "@/components/admin/SettingsManager"
import { initializeDefaultSettings } from "@/app/actions/settings"

export default async function AdvancedSettingsPage() {
    await initializeDefaultSettings() // Ensure defaults exist

    return (
        <div>
            <SettingsManager />
        </div>
    )
}
