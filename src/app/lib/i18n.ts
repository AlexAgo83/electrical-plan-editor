import type { AppLocale } from "../types/app-controller";

export const DEFAULT_APP_LOCALE: AppLocale = "en";

const FR_TEXT_BY_EN_TEXT: Readonly<Record<string, string>> = {
  "Home": "Accueil",
  "Network Scope": "Périmètre réseau",
  "Modeling": "Modélisation",
  "Analysis": "Analyse",
  "Validation": "Validation",
  "Settings": "Paramètres",
  "Catalog": "Catalogue",
  "Connectors": "Connecteurs",
  "Splices": "Épissures",
  "Nodes": "Nœuds",
  "Segments": "Segments",
  "Wires": "Fils",
  "Connector": "Connecteur",
  "Splice": "Épissure",
  "Node": "Nœud",
  "Segment": "Segment",
  "Wire": "Fil",
  "Help": "Aide",
  "Resume": "Reprendre",
  "Quick start": "Démarrage rapide",
  "Workspace": "Espace de travail",
  "Workspace summary": "Résumé de l'espace de travail",
  "Entity navigation": "Navigation entités",
  "Home workspace": "Espace Accueil",
  "What's new": "Nouveautés",
  "Workspace hub": "Hub espace de travail",
  "Open Network Scope": "Ouvrir Périmètre réseau",
  "Create empty workspace": "Créer un espace vide",
  "Import from file": "Importer depuis un fichier",
  "Start a new workspace flow, import existing data, or open workspace management controls.": "Démarrez un nouveau flux d'espace de travail, importez des données existantes, ou ouvrez les contrôles de gestion d'espace.",
  "Continue where you left off using the current workspace context and active network.": "Reprenez là où vous vous êtes arrêté en utilisant le contexte courant et le réseau actif.",
  "Networks": "Réseaux",
  "State": "État",
  "Issues": "Issues",
  "Errors / Warnings": "Erreurs / Avertissements",
  "Saved": "Enregistré",
  "Unsaved": "Non enregistré",
  "Error": "Erreur",
  "Active network:": "Réseau actif :",
  "Network Scope workspace: active network context and lifecycle management.": "Espace Périmètre réseau : contexte du réseau actif et gestion du cycle de vie.",
  "Home workspace: start, resume, shortcuts, and quick preferences.": "Espace Accueil : démarrer, reprendre, raccourcis et préférences rapides.",
  "Modeling workspace: entity editor, operational lists, and analysis panels.": "Espace Modélisation : éditeur d'entités, listes opérationnelles et panneaux d'analyse.",
  "Validation center: grouped model integrity issues with one-click navigation.": "Centre de validation : issues d'intégrité du modèle regroupées avec navigation en un clic.",
  "Settings workspace: workspace preferences and project-level options.": "Espace Paramètres : préférences d'espace et options de niveau projet.",
  "Open menu": "Ouvrir le menu",
  "Close menu": "Fermer le menu",
  "Install app": "Installer l'app",
  "Update ready": "Mise à jour prête",
  "Ops & Health": "Ops et santé",
  "Clear": "Effacer",
  "No active network selected. Open Network Scope to choose or create one.": "Aucun réseau actif sélectionné. Ouvrez Périmètre réseau pour en choisir ou en créer un.",
  "Appearance preferences": "Préférences d'apparence",
  "Canvas render preferences": "Préférences de rendu canvas",
  "Canvas tools preferences": "Préférences des outils canvas",
  "Action bar and shortcuts": "Barre d'actions et raccourcis",
  "Catalog & BOM setup": "Configuration catalogue et BOM",
  "Global preferences": "Préférences globales",
  "Sample network controls": "Contrôles de l'échantillon réseau",
  "Defaults": "Valeurs par défaut",
  "Shortcuts": "Raccourcis",
  "Pricing": "Tarification",
  "Sample": "Échantillon",
  "Display": "Affichage",
  "Canvas Tools": "Outils canvas",
  "Canvas Render": "Rendu canvas",
  "Typography and rendering defaults used for labels, callouts, and view reset behavior.": "Paramètres de typographie et de rendu utilisés pour les libellés, cartouches et comportement de réinitialisation de vue.",
  "Default tool behavior and overlay visibility for the 2D network workspace.": "Comportement par défaut des outils et visibilité des surcouches pour l'espace réseau 2D.",
  "Global visual defaults for theme, table typography, density, and sorting across modeling and analysis views.": "Paramètres visuels globaux pour le thème, la typographie des tableaux, la densité et le tri dans les vues modélisation et analyse.",
  "Shared UI preferences applied across workspace screens (outside of screen-specific controls).": "Préférences UI partagées appliquées aux écrans de l'espace de travail (hors contrôles spécifiques à un écran).",
  "Enable keyboard helpers and keep a quick reference of available shortcuts.": "Activez les aides clavier et gardez un aide-mémoire des raccourcis disponibles.",
  "Workspace pricing context for catalog and BOM flows. Catalog prices stay stored as excl. tax values.": "Contexte de tarification d'espace pour les flux catalogue et BOM. Les prix catalogue restent stockés en valeurs HT.",
  "Tax/VAT settings only affect BOM calculations/export context. Disabling tax keeps HT-only outputs and preserves the last tax rate.": "Les réglages taxe/TVA n'affectent que les calculs BOM et le contexte d'export. Désactiver la taxe conserve des sorties HT et préserve le dernier taux.",
  "Quickly recreate baseline and QA-oriented sample data when testing flows or resetting your sandbox.": "Recréez rapidement des données échantillon baseline et orientées QA lors des tests de flux ou de la remise à zéro du bac à sable.",
  "Theme mode": "Mode de thème",
  "Theme": "Thème",
  "Dark": "Sombre",
  "Paper Blueprint (Light)": "Paper Blueprint (Clair)",
  "Warm Brown (Light)": "Warm Brown (Clair)",
  "Mist Gray (Light)": "Mist Gray (Clair)",
  "Sage Paper (Light)": "Sage Paper (Clair)",
  "Sand Slate (Light)": "Sand Slate (Clair)",
  "Ice Blue (Light)": "Ice Blue (Clair)",
  "Soft Teal (Light)": "Soft Teal (Clair)",
  "Dusty Rose (Light)": "Dusty Rose (Clair)",
  "Pale Olive (Light)": "Pale Olive (Clair)",
  "Cloud Lavender (Light)": "Cloud Lavender (Clair)",
  "Rose Quartz (Light)": "Rose Quartz (Clair)",
  "Lavender Haze (Light)": "Lavender Haze (Clair)",
  "Circle Mobility (Light)": "Circle Mobility (Clair)",
  "Slate Neon (Dark)": "Slate Neon (Sombre)",
  "Deep Green (Dark)": "Deep Green (Sombre)",
  "Burgundy Noir (Dark)": "Burgundy Noir (Sombre)",
  "Amber Night (Dark)": "Amber Night (Sombre)",
  "Cyberpunk (Dark)": "Cyberpunk (Sombre)",
  "Olive (Dark)": "Olive (Sombre)",
  "Steel Blue (Dark)": "Steel Blue (Sombre)",
  "Forest Graphite (Dark)": "Forest Graphite (Sombre)",
  "Petrol Slate (Dark)": "Petrol Slate (Sombre)",
  "Copper Night (Dark)": "Copper Night (Sombre)",
  "Moss Taupe (Dark)": "Moss Taupe (Sombre)",
  "Navy Ash (Dark)": "Navy Ash (Sombre)",
  "Charcoal Plum (Dark)": "Charcoal Plum (Sombre)",
  "Smoked Teal (Dark)": "Smoked Teal (Sombre)",
  "Circle Mobility (Dark)": "Circle Mobility (Sombre)",
  "Table density": "Densité des tableaux",
  "Table font size": "Taille de police des tableaux",
  "Default sort column": "Colonne de tri par défaut",
  "Default sort direction": "Sens de tri par défaut",
  "Default ID sort direction": "Sens de tri ID par défaut",
  "Comfortable": "Confortable",
  "Compact": "Compact",
  "Ascending": "Croissant",
  "Descending": "Décroissant",
  "Label stroke mode": "Mode de contour des libellés",
  "2D label size": "Taille des libellés 2D",
  "Callout text size": "Taille du texte des info-bulles",
  "2D label rotation": "Rotation des libellés 2D",
  "Auto segment label rotation": "Rotation auto des libellés de segment",
  "Reset zoom target (%)": "Cible de zoom de réinitialisation (%)",
  "Viewport resize behavior": "Comportement au redimensionnement",
  "Reset current view": "Réinitialiser la vue courante",
  "None": "Aucun",
  "Light": "Léger",
  "Normal": "Normal",
  "Extra small": "Très petite",
  "Small": "Petite",
  "Large": "Grande",
  "Extra large": "Très grande",
  "Yes": "Oui",
  "No": "Non",
  "Responsive content scaling": "Mise à l'échelle responsive du contenu",
  "Resize changes visible area only (default)": "Le redimensionnement change uniquement la zone visible (défaut)",
  "Show grid by default": "Afficher la grille par défaut",
  "Snap node movement by default": "Aligner le déplacement des nœuds par défaut",
  "Lock node movement by default": "Verrouiller le déplacement des nœuds par défaut",
  "Show info overlays by default": "Afficher les surcouches d'information par défaut",
  "Show segment names": "Afficher les noms de segments",
  "Show segment lengths by default": "Afficher les longueurs de segments par défaut",
  "Show connector/splice cable callouts by default": "Afficher les cartouches câble connecteur/épissure par défaut",
  "Show only selected connector/splice callout": "Afficher uniquement le cartouche connecteur/épissure sélectionné",
  "Show wire names in callout table": "Afficher les noms de fils dans le tableau des cartouches",
  "Keep connector/splice/node shape size constant while zooming": "Conserver la taille des formes connecteur/épissure/nœud pendant le zoom",
  "Node shape target size (%)": "Taille cible des formes de nœud (%)",
  "Export format": "Format d'export",
  "Include background in PNG export": "Inclure l'arrière-plan dans l'export PNG",
  "Show shortcut hints in the action bar": "Afficher les aides raccourcis dans la barre d'actions",
  "Enable keyboard shortcuts (undo/redo/navigation/issues/view)": "Activer les raccourcis clavier (annuler/rétablir/navigation/issues/vue)",
  "Undo last modeling action": "Annuler la dernière action de modélisation",
  "Redo": "Rétablir",
  "Redo (alternative shortcut)": "Rétablir (raccourci alternatif)",
  "Save active plan (export JSON)": "Enregistrer le plan actif (export JSON)",
  "Switch top-level workspace": "Basculer l'espace de travail principal",
  "Switch entity sub-screen": "Basculer l'onglet entité",
  "Fit network view to current graph": "Adapter la vue réseau au graphe courant",
  "Previous / next validation issue": "Issue de validation précédente / suivante",
  "Currency (Catalog/BOM)": "Devise (Catalogue/BOM)",
  "Enable tax / VAT (TVA)": "Activer la taxe / TVA",
  "Tax rate (%)": "Taux de taxe (%)",
  "Show floating inspector panel on supported screens": "Afficher le panneau inspecteur flottant sur les écrans compatibles",
  "Workspace panels layout": "Disposition des panneaux",
  "Responsive multi-column": "Multi-colonnes responsive",
  "Force single column": "Forcer une seule colonne",
  "Wide screen (remove app max width cap)": "Écran large (supprimer la largeur max de l'app)",
  "Default wire section (mm²)": "Section de fil par défaut (mm²)",
  "Default auto-create linked nodes for connectors/splices": "Auto-création de nœuds liés par défaut pour connecteurs/épissures",
  "Reset all UI preferences": "Réinitialiser toutes les préférences UI",
  "Apply language across all app screens (except changelog and import/export).": "Appliquer la langue à tous les écrans de l'app (hors changelog et import/export).",
  "Keyboard shortcuts": "Raccourcis clavier",
  "Connectors / Splices": "Connecteurs / Épissures",
  "Language": "Langue",
  "English": "English",
  "Français": "Français",
  "Last import:": "Dernier import :",
  "imported": "importé",
  "skipped": "ignoré",
  "warnings": "avertissements",
  "errors": "erreurs",
  "Sample workspace status": "État de l'espace échantillon",
  "Workspace:": "Espace :",
  "empty": "vide",
  "loaded": "chargé",
  "Sample signature:": "Signature échantillon :",
  "detected": "détectée",
  "missing": "manquante",
  "Recreate sample network": "Recréer le réseau échantillon",
  "Recreate validation issues sample": "Recréer l'échantillon d'issues de validation",
  "Recreate catalog validation issues sample": "Recréer l'échantillon d'issues de validation catalogue",
  "Recreate pricing / BOM QA sample": "Recréer l'échantillon QA tarification / BOM",
  "Reset sample network to baseline": "Réinitialiser l'échantillon réseau au baseline",
  "Create your first network": "Créez votre premier réseau",
  "Create catalog items first": "Créez d'abord les éléments catalogue",
  "Build the connectors and splices library": "Construisez la bibliothèque de connecteurs et d'épissures",
  "Create nodes for network points": "Créez les nœuds pour les points réseau",
  "Create segments between nodes": "Créez des segments entre les nœuds",
  "Create wires and cables": "Créez des fils et câbles",
  "Configure your workspace defaults": "Configurez vos préférences d'espace de travail",
  "Start in": "Commencez dans",
  "to create the harness/wiring plan container you will model, duplicate, and export.": "pour créer le conteneur de plan faisceau/câblage que vous allez modéliser, dupliquer et exporter.",
  "Create": "Créer",
  "first to define reusable manufacturer references and connection counts before creating connectors or splices. Connector/splice forms then reuse the selected catalog item.": "d'abord pour définir des références fabricant réutilisables et des nombres de connexions avant de créer des connecteurs ou des épissures. Les formulaires connecteur/épissure réutilisent ensuite l'élément catalogue sélectionné.",
  "Define reusable": "Définissez des",
  "from": "à partir de",
  "before placing them in the network. Create forms can also auto-create linked nodes.": "avant de les placer dans le réseau. Les formulaires de création peuvent aussi auto-créer les nœuds liés.",
  "to represent connectors, splices, and intermediate hubs in the network graph. You can rename node IDs safely in edit mode.": "pour représenter les connecteurs, épissures et hubs intermédiaires dans le graphe réseau. Vous pouvez renommer les ID de nœud en toute sécurité en mode édition.",
  "Use": "Utilisez",
  "to define physical links and lengths between nodes used by routed wires and route previews.": "pour définir les liens physiques et longueurs entre nœuds utilisés par les fils routés et les aperçus de route.",
  "wires/cables": "fils/câbles",
  "and route them across segments from endpoint A to endpoint B. Wire forms support section (mm²), optional colors, endpoint references, and endpoint occupancy guidance.": "et routez-les sur les segments du point A au point B. Les formulaires de fil supportent la section (mm²), les couleurs optionnelles, les références d'extrémité et l'aide d'occupation des extrémités.",
  "You can also enable": "Vous pouvez aussi activer",
  "mode and link it to a catalog item manufacturer reference when modeling protected wires.": "et le lier à une référence fabricant d'élément catalogue lors de la modélisation de fils protégés.",
  "Before continuing, review key": "Avant de continuer, passez en revue les",
  "for your default workflow ergonomics.": "pour l'ergonomie de votre flux de travail par défaut.",
  "Context help": "Aide contextuelle",
  "Close onboarding": "Fermer l'onboarding",
  "Close": "Fermer",
  "Dismiss onboarding overlay": "Fermer la surcouche d'onboarding",
  "Target panel:": "Panneau cible :",
  "Do not open automatically on app load": "Ne pas ouvrir automatiquement au chargement de l'app",
  "Next": "Suivant",
  "Finish": "Terminer",
  "Open Settings": "Ouvrir Paramètres",
  "Open target": "Ouvrir la cible",
  "Name": "Nom",
  "Technical ID": "ID tech.",
  "ID": "ID",
  "Color": "Couleur",
  "Endpoint A": "Extr. A",
  "Endpoint B": "Extr. B",
  "End A": "Extr. A",
  "End B": "Extr. B",
  "Section (mm²)": "Sect. (mm²)",
  "Sec": "Sect.",
  "Length (mm)": "Long. (mm)",
  "Len": "Long.",
  "Sub-network": "Sous-réseau",
  "Route mode": "Mode route",
  "Kind": "Type",
  "Reference": "Réf.",
  "Ref.": "Réf.",
  "Linked segments": "Seg. liés",
  "Segment ID": "ID segment",
  "Peer node": "Nœud pair",
  "Node A": "Nœud A",
  "Node B": "Nœud B"
};

export function normalizeAppLocale(value: unknown): AppLocale {
  return value === "fr" ? "fr" : "en";
}

function preserveCase(source: string, translated: string): string {
  if (source.toUpperCase() === source) {
    return translated.toUpperCase();
  }
  return translated;
}

export function translateTextValue(locale: AppLocale, input: string): string {
  if (locale === "en") {
    return input;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return input;
  }

  const direct = FR_TEXT_BY_EN_TEXT[trimmed];
  if (direct !== undefined) {
    return input.replace(trimmed, preserveCase(trimmed, direct));
  }

  const stepMatch = /^Step\s+(\d+)\s+of\s+(\d+)$/i.exec(trimmed);
  if (stepMatch !== null) {
    const [, step, total] = stepMatch;
    return input.replace(trimmed, `Étape ${step} sur ${total}`);
  }

  const openMatch = /^Open\s+(.+)$/i.exec(trimmed);
  if (openMatch !== null) {
    const openTarget = openMatch[1] ?? "";
    return input.replace(trimmed, `Ouvrir ${translateTextValue(locale, openTarget).trim()}`);
  }

  const scrollToMatch = /^Scroll to\s+(.+)$/i.exec(trimmed);
  if (scrollToMatch !== null) {
    const scrollTarget = scrollToMatch[1] ?? "";
    return input.replace(trimmed, `Aller à ${translateTextValue(locale, scrollTarget).trim()}`);
  }

  const lastImportMatch =
    /^Last import:\s*(\d+)\s+imported\s*\/\s*(\d+)\s+skipped(?:\s*\/\s*(\d+)\s+warnings)?(?:\s*\/\s*(\d+)\s+errors)?\.$/i.exec(
      trimmed
    );
  if (lastImportMatch !== null) {
    const importedCount = Number(lastImportMatch[1] ?? "0");
    const skippedCount = Number(lastImportMatch[2] ?? "0");
    const warningsCountRaw = lastImportMatch[3];
    const errorsCountRaw = lastImportMatch[4];
    let translated = `Dernier import : ${importedCount} importé${importedCount > 1 ? "s" : ""} / ${skippedCount} ignoré${skippedCount > 1 ? "s" : ""}`;
    if (warningsCountRaw !== undefined) {
      const warningsCount = Number(warningsCountRaw);
      translated += ` / ${warningsCount} avertissement${warningsCount > 1 ? "s" : ""}`;
    }
    if (errorsCountRaw !== undefined) {
      const errorsCount = Number(errorsCountRaw);
      translated += ` / ${errorsCount} erreur${errorsCount > 1 ? "s" : ""}`;
    }
    translated += ".";
    return input.replace(trimmed, translated);
  }

  const validationCounterMatch = /^(\d+)\s+validation issue(?:s)?(?:,\s+(\d+)\s+error(?:s)?)?(?:,\s+no errors)?$/i.exec(trimmed);
  if (validationCounterMatch !== null) {
    const issueCount = Number(validationCounterMatch[1] ?? "0");
    const errorCountRaw = validationCounterMatch[2];
    if (errorCountRaw !== undefined) {
      const errorCount = Number(errorCountRaw);
      return input.replace(
        trimmed,
        `${issueCount} issue${issueCount > 1 ? "s" : ""} de validation, ${errorCount} erreur${errorCount > 1 ? "s" : ""}`
      );
    }
    return input.replace(trimmed, `${issueCount} issue${issueCount > 1 ? "s" : ""} de validation, aucune erreur`);
  }

  const issueCounterMatch = /^(\d+)\s+issue(?:s)?(?:,\s+(\d+)\s+error(?:s)?)?(?:,\s+no errors)?$/i.exec(trimmed);
  if (issueCounterMatch !== null) {
    const issueCount = Number(issueCounterMatch[1] ?? "0");
    const errorCountRaw = issueCounterMatch[2];
    if (errorCountRaw !== undefined) {
      const errorCount = Number(errorCountRaw);
      return input.replace(trimmed, `${issueCount} issue${issueCount > 1 ? "s" : ""}, ${errorCount} erreur${errorCount > 1 ? "s" : ""}`);
    }
    return input.replace(trimmed, `${issueCount} issue${issueCount > 1 ? "s" : ""}, aucune erreur`);
  }

  return input;
}
