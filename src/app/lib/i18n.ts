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
  "Help": "Aide",
  "Resume": "Reprendre",
  "What's new": "Nouveautés",
  "Workspace hub": "Hub espace de travail",
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
  "Theme mode": "Mode de thème",
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
  "Language": "Langue",
  "English": "English",
  "Français": "Français",
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

  return input;
}
