import {
  defaultDashboardLayout,
  validateDashboardLayout,
} from "./layoutTemplates";
import { loadPreference, savePreference } from "./preferenceStorage";
import type { DashboardLayoutState } from "../types/dashboard";

const preferenceKey = "dashboard.layout";
const legacyLayoutStorageKey = "devdash.dashboardLayout";

function parseLayout(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return validateDashboardLayout(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function loadDashboardLayout() {
  return (
    parseLayout(await loadPreference(preferenceKey)) ??
    parseLayout(localStorage.getItem(legacyLayoutStorageKey)) ??
    defaultDashboardLayout
  );
}

export async function saveDashboardLayout(layout: DashboardLayoutState) {
  await savePreference(preferenceKey, JSON.stringify(layout));
}
