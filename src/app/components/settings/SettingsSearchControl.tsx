import { translateCurrent as t } from "../../lib/i18n";
import { type ChangeEvent, type ReactElement } from "react";
import { useSettingsSearchDock } from "./SettingsSearchDock";

export function SettingsSearchControl({ variant = "panel" }: { variant?: "panel" | "header" }): ReactElement {
  const { settingsSearchQuery, setSettingsSearchQuery } = useSettingsSearchDock();
  const searchFieldClassName =
    variant === "header"
      ? "settings-search-field settings-search-field--header"
      : "settings-search-field";

  return (
    <label className={searchFieldClassName} data-settings-search-source={variant === "panel" ? "true" : undefined}>
      <span className="settings-search-label">
        <span className="settings-search-label-icon" aria-hidden="true" />
        <span className="settings-search-label-text">{t("ui.settingssearchcontrolSearchSettings")}</span>
      </span>
      <input
        type="search"
        value={settingsSearchQuery}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setSettingsSearchQuery(event.target.value)}
        placeholder={t("ui.settingssearchcontrolSearchBySettingLabel")}
      />
    </label>
  );
}
