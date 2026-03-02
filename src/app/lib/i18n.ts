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
  "Undo": "Annuler",
  "Open": "Ouvrir",
  "Resume": "Reprendre",
  "New": "Nouveau",
  "Edit": "Modifier",
  "Delete": "Supprimer",
  "Idle": "Inactif",
  "All": "Tous",
  "Any": "Tout",
  "Filter": "Filtrer",
  "Free": "Libre",
  "Occupied": "Occupé",
  "Auto": "Auto",
  "Locked": "Verrouillé",
  "Default": "Par défaut",
  "Tagged": "Tagué",
  "Endpoints": "Extrémités",
  "Intermediate": "Intermédiaire",
  "Ways": "Voies",
  "Ports": "Ports",
  "Branches": "Branches",
  "Occup.": "Occup.",
  "Go to": "Aller à",
  "Operations and health": "Opérations et santé",
  "State:": "État :",
  "Total issues:": "Total issues :",
  "Errors:": "Erreurs :",
  "Warnings:": "Avertissements :",
  "Issue navigator:": "Navigateur d'issues :",
  "Scope:": "Périmètre :",
  "Current issue:": "Issue courante :",
  "Previous": "Précédent",
  "Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo.": "Raccourcis : Ctrl/Cmd+Z annuler, Ctrl/Cmd+Shift+Z ou Ctrl/Cmd+Y rétablir.",
  "Nav: Alt+1..5 screens, Alt+Shift+1..5 entity tabs, Alt+V/N/G/C/R modes, Alt+F fit canvas, Alt+J/K issue nav.": "Navigation : Alt+1..5 écrans, Alt+Shift+1..5 onglets entité, Alt+V/N/G/C/R modes, Alt+F adapter canvas, Alt+J/K navigation issues.",
  "Validation summary": "Résumé de validation",
  "Total issues": "Total issues",
  "Visible": "Visibles",
  "Validation center": "Centre de validation",
  "Issue filters": "Filtres d'issues",
  "Active filters:": "Filtres actifs :",
  "No integrity issue found in the current model.": "Aucune issue d'intégrité trouvée dans le modèle courant.",
  "No integrity issue matches the current filters.": "Aucune issue d'intégrité ne correspond aux filtres courants.",
  "Severity": "Sévérité",
  "Issue": "Issue",
  "Actions": "Actions",
  "Category": "Catégorie",
  "Screen": "Écran",
  "Latest release notes from available changelog files.": "Dernières notes de version issues des fichiers changelog disponibles.",
  "No changelog available.": "Aucun changelog disponible.",
  "No listed changes in this section.": "Aucun changement listé dans cette section.",
  "Activity history": "Historique d'activité",
  "Health snapshot": "Instantané de santé",
  "No connector yet.": "Aucun connecteur pour l'instant.",
  "No connector matches the current filters.": "Aucun connecteur ne correspond aux filtres courants.",
  "No splice yet.": "Aucune épissure pour l'instant.",
  "No splice matches the current filters.": "Aucune épissure ne correspond aux filtres courants.",
  "No node yet.": "Aucun nœud pour l'instant.",
  "No node matches the current filters.": "Aucun nœud ne correspond aux filtres courants.",
  "No segment yet.": "Aucun segment pour l'instant.",
  "No segment matches the current filters.": "Aucun segment ne correspond aux filtres courants.",
  "No wire yet.": "Aucun fil pour l'instant.",
  "No wire matches the current filters.": "Aucun fil ne correspond aux filtres courants.",
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
  "Import / Export networks": "Importer / Exporter des réseaux",
  "Portability": "Portabilité",
  "Deterministic JSON import/export for active, selected, or full network scopes.": "Import/export JSON déterministe pour les périmètres réseau actif, sélectionné ou complet.",
  "Export active, selected, or all networks as deterministic JSON payloads. Import preserves existing local data and resolves conflicts with deterministic suffixes.": "Exportez le réseau actif, les réseaux sélectionnés ou tous les réseaux en payloads JSON déterministes. L'import conserve les données locales existantes et résout les conflits avec des suffixes déterministes.",
  "Export active": "Exporter actif",
  "Export selected": "Exporter sélection",
  "Export all": "Exporter tout",
  "Selected networks for export": "Réseaux sélectionnés pour l'export",
  "Imported": "Importés",
  "Skipped": "Ignorés",
  "Warnings": "Avertissements",
  "Errors": "Erreurs",
  "No network available.": "Aucun réseau disponible.",
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
  "Apply language across all app screens (except changelog).": "Appliquer la langue à tous les écrans de l'app (hors changelog).",
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
  "Expand": "Développer",
  "Collapse": "Réduire",
  "Inspector context": "Contexte inspecteur",
  "Focused entity:": "Entité ciblée :",
  "No entity selected. Select a row or a canvas item to inspect details here.": "Aucune entité sélectionnée. Sélectionnez une ligne ou un élément du canvas pour inspecter les détails ici.",
  "Canvas controls": "Contrôles canvas",
  "Zoom -": "Zoom -",
  "Zoom +": "Zoom +",
  "Reset view": "Réinitialiser la vue",
  "Fit network": "Ajuster le réseau",
  "Generate": "Générer",
  "View:": "Vue :",
  "% zoom. Hold": "% de zoom. Maintenez",
  "and drag empty canvas to pan.": "et faites glisser une zone vide du canvas pour vous déplacer.",
  "Sub-networks": "Sous-réseaux",
  "No sub-network tags yet.": "Aucun tag de sous-réseau pour l'instant.",
  "Enable all": "Tout activer",
  "DEFAULT": "PAR DÉFAUT",
  "segment(s),": "segment(s),",
  "mm total": "mm total",
  "Graph statistics": "Statistiques du graphe",
  "Route preview": "Aperçu de route",
  "Start node": "Nœud de départ",
  "End node": "Nœud d'arrivée",
  "Start": "Départ",
  "End": "Arrivée",
  "No route currently exists between the selected start and end nodes.": "Aucune route n'existe actuellement entre les nœuds de départ et d'arrivée sélectionnés.",
  "Route found": "Route trouvée",
  "Shortest path computed from current selection.": "Chemin le plus court calculé à partir de la sélection courante.",
  "Segments path": "Chemin des segments",
  "Nodes path": "Chemin des nœuds",
  "Select start and end nodes to preview shortest path routing.": "Sélectionnez les nœuds de départ et d'arrivée pour prévisualiser le routage du plus court chemin.",
  "Connector analysis": "Analyse connecteur",
  "Select a connector to view ways and synthesis.": "Sélectionnez un connecteur pour voir les voies et la synthèse.",
  "Way index": "Index de voie",
  "Reserve way": "Réserver la voie",
  "Suggested next free way: C": "Prochaine voie libre suggérée : C",
  "No available ways on this connector.": "Aucune voie disponible sur ce connecteur.",
  "No wire currently connected to this connector.": "Aucun fil actuellement connecté à ce connecteur.",
  "Node analysis": "Analyse nœud",
  "Select a node to inspect associated segments.": "Sélectionnez un nœud pour inspecter les segments associés.",
  "Selected node": "Nœud sélectionné",
  "Associated segments": "Segments associés",
  "No segment is connected to this node.": "Aucun segment n'est connecté à ce nœud.",
  "Segment analysis": "Analyse segment",
  "Select a segment to inspect traversing wires.": "Sélectionnez un segment pour inspecter les fils qui le traversent.",
  "Selected segment": "Segment sélectionné",
  "No wire traverses this segment.": "Aucun fil ne traverse ce segment.",
  "Splice analysis": "Analyse épissure",
  "Select a splice to view ports and synthesis.": "Sélectionnez une épissure pour voir les ports et la synthèse.",
  "Capacity:": "Capacité :",
  "Branch count:": "Nombre de branches :",
  "Port index": "Index de port",
  "Reserve port": "Réserver le port",
  "Suggested next free port: P": "Prochain port libre suggéré : P",
  "No available ports on this splice.": "Aucun port disponible sur cette épissure.",
  "+ Add visible port(s)": "+ Ajouter des ports visibles",
  "No wire currently connected to this splice.": "Aucun fil actuellement connecté à cette épissure.",
  "Wire analysis": "Analyse fil",
  "Select a wire to lock a forced route or reset to auto shortest path.": "Sélectionnez un fil pour verrouiller une route forcée ou revenir au plus court chemin automatique.",
  "Selected wire": "Fil sélectionné",
  "Current route": "Route actuelle",
  "Endpoint references": "Références d'extrémité",
  "Forced route segment IDs (comma-separated)": "IDs de segments de route forcée (séparés par des virgules)",
  "Lock forced route": "Verrouiller la route forcée",
  "Reset to auto route": "Revenir à la route auto",
  "(none)": "(aucun)",
  "(default)": "(par défaut)",
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
  "Node B": "Nœud B",
  "2D network diagram": "Diagramme réseau 2D",
  "Adjacency entries": "Entrées d'adjacence",
  "All categories": "Toutes catégories",
  "All severities": "Toutes sévérités",
  "Auto route": "Route auto",
  "Begin ID": "ID début",
  "Begin pin": "Broche début",
  "Cabin junction": "Jonction cabine",
  "Cable colors": "Couleurs câble",
  "Cancel edit": "Annuler l'édition",
  "Catalog filter field": "Champ filtre catalogue",
  "connector / splice / intermediate": "connecteur / épissure / intermédiaire",
  "Connector analysis view": "Vue analyse connecteurs",
  "Connector filter field": "Champ filtre connecteurs",
  "Connector form": "Formulaire connecteur",
  "Connector name": "Nom connecteur",
  "Connector occupancy filter": "Filtre d'occupation connecteurs",
  "Connector/Splice or ID": "Connecteur/Épissure ou ID",
  "Create catalog item": "Créer un élément catalogue",
  "Create Connector": "Créer Connecteur",
  "Create mode": "Mode création",
  "Create network": "Créer réseau",
  "Create Node": "Créer Nœud",
  "Create Segment": "Créer Segment",
  "Create Splice": "Créer Épissure",
  "Create Wire": "Créer Fil",
  "Edit catalog item": "Modifier l'élément catalogue",
  "Edit Connector": "Modifier Connecteur",
  "Edit mode": "Mode édition",
  "Edit network": "Modifier réseau",
  "Edit Node": "Modifier Nœud",
  "Edit Segment": "Modifier Segment",
  "Edit Splice": "Modifier Épissure",
  "Edit Wire": "Modifier Fil",
  "End ID": "ID fin",
  "End pin": "Broche fin",
  "Endpoint A connection ref": "Réf. connexion extrémité A",
  "Endpoint A seal ref": "Réf. joint extrémité A",
  "Endpoint B connection ref": "Réf. connexion extrémité B",
  "Endpoint B seal ref": "Réf. joint extrémité B",
  "Enter a valid port index.": "Saisissez un index de port valide.",
  "Enter a valid way index.": "Saisissez un index de voie valide.",
  "Feed wire": "Fil d'alimentation",
  "Focused network entity counters": "Compteurs d'entités réseau ciblées",
  "Free color left unspecified": "Couleur libre non spécifiée",
  "Graph nodes": "Nœuds du graphe",
  "Graph segments": "Segments du graphe",
  "ID, kind, reference...": "ID, type, référence...",
  "ID, nodes, sub-network...": "ID, nœuds, sous-réseau...",
  "Import CSV": "Importer CSV",
  "Local port": "Port local",
  "Local way": "Voie locale",
  "Locked route": "Route verrouillée",
  "Manufacturer ref": "Réf. fabricant",
  "Manufacturer reference": "Référence fabricant",
  "Manufacturer reference or name": "Référence fabricant ou nom",
  "Mfr Ref": "Réf. fabr.",
  "Mnf ref": "Réf. fabr.",
  "Model health": "Santé du modèle",
  "Name or technical ID": "Nom ou ID technique",
  "Name or technical ID...": "Nom ou ID technique...",
  "Name, technical ID, endpoint...": "Nom, ID technique, extrémité...",
  "Network filter field": "Champ filtre réseau",
  "Network name": "Nom du réseau",
  "Network summary display options": "Options d'affichage du résumé réseau",
  "Networks list": "Liste des réseaux",
  "No color": "Aucune couleur",
  "No connection ref": "Aucune réf. connexion",
  "No seal ref": "Aucune réf. joint",
  "Node filter field": "Champ filtre nœuds",
  "Node form": "Formulaire nœud",
  "Node ID": "ID nœud",
  "Node kind": "Type de nœud",
  "Node kind filter": "Filtre type de nœud",
  "No available ways.": "Aucune voie disponible.",
  "No available ports.": "Aucun port disponible.",
  "Occupant reference": "Référence occupant",
  "Optional (e.g. Beige/Brown mix)": "Optionnel (ex. mélange Beige/Marron)",
  "Optional description": "Description optionnelle",
  "Optional display name": "Nom d'affichage optionnel",
  "Port count": "Nombre de ports",
  "Port count (from catalog)": "Nombre de ports (du catalogue)",
  "Port mode": "Mode port",
  "Quick entity navigation": "Navigation rapide entités",
  "Quick entity navigation strip": "Bandeau de navigation rapide entités",
  "Rear body connector": "Connecteur arrière carrosserie",
  "Recent changes for active network": "Modifications récentes du réseau actif",
  "Recent changes list": "Liste des modifications récentes",
  "Save network": "Enregistrer réseau",
  "Segment filter field": "Champ filtre segments",
  "Segment form": "Formulaire segment",
  "Segment sub-network filter": "Filtre sous-réseau segment",
  "Select node": "Sélectionner nœud",
  "Selection ID": "ID de sélection",
  "Selection kind": "Type de sélection",
  "Session summary": "Résumé de session",
  "Splice analysis view": "Vue analyse épissures",
  "Splice filter field": "Champ filtre épissures",
  "Splice form": "Formulaire épissure",
  "Splice name": "Nom épissure",
  "Splice occupancy filter": "Filtre d'occupation épissures",
  "Splice port occupancy grid": "Grille d'occupation des ports épissure",
  "Validation category filter": "Filtre catégorie validation",
  "Validation severity filter": "Filtre sévérité validation",
  "Vehicle platform A": "Plateforme véhicule A",
  "Way occupancy grid": "Grille d'occupation des voies",
  "Wire filter field": "Champ filtre fils",
  "Wire form": "Formulaire fil",
  "Wire ID": "ID fil",
  "Wire name": "Nom fil",
  "Wire route mode filter": "Filtre mode de route fil",
  "(missing catalog item)": "(élément catalogue manquant)",
  "∞ (unbounded)": "∞ (non borné)",
  "All issues": "Toutes les issues",
  "Filtered issues": "Issues filtrées",
  "No issue": "Aucune issue",
  "Catalog integrity": "Intégrité catalogue",
  "Incomplete required fields": "Champs obligatoires incomplets",
  "Missing reference": "Référence manquante",
  "Occupancy conflict": "Conflit d'occupation",
  "Route lock validity": "Validité du verrouillage de route",
  "All fields are required and way count must be >= 1.": "Tous les champs sont requis et le nombre de voies doit être >= 1.",
  "Both segment endpoints are required.": "Les deux extrémités de segment sont requises.",
  "Bounded splice port count must be an integer >= 1.": "Le nombre de ports bornés de l'épissure doit être un entier >= 1.",
  "Catalog selection switched capacity mode to bounded.": "La sélection catalogue a basculé le mode capacité en borné.",
  "Clear catalog selection before switching splice capacity to unbounded.": "Effacez la sélection catalogue avant de passer la capacité d'épissure en non borné.",
  "Connection count must be an integer >= 1.": "Le nombre de connexions doit être un entier >= 1.",
  "Connector created, but the linked connector node could not be created automatically. Create it manually in Nodes.": "Connecteur créé, mais le nœud connecteur lié n'a pas pu être créé automatiquement. Créez-le manuellement dans Nœuds.",
  "Create a catalog item first to define manufacturer reference and connection count.": "Créez d'abord un élément catalogue pour définir la référence fabricant et le nombre de connexions.",
  "Delete catalog item": "Supprimer l'élément catalogue",
  "Delete connector": "Supprimer le connecteur",
  "Delete network": "Supprimer le réseau",
  "Delete node": "Supprimer le nœud",
  "Delete segment": "Supprimer le segment",
  "Delete splice": "Supprimer l'épissure",
  "Delete wire": "Supprimer le fil",
  "Endpoint A connector is required.": "Le connecteur d'extrémité A est requis.",
  "Endpoint A splice is required.": "L'épissure d'extrémité A est requise.",
  "Endpoint B connector is required.": "Le connecteur d'extrémité B est requis.",
  "Endpoint B splice is required.": "L'épissure d'extrémité B est requise.",
  "Export is not available in this environment.": "L'export n'est pas disponible dans cet environnement.",
  "Export the active network now?": "Exporter le réseau actif maintenant ?",
  "Fuse catalog item is required.": "L'élément catalogue fusible est requis.",
  "Intermediate node label is required.": "Le libellé du nœud intermédiaire est requis.",
  "Invalid import file.": "Fichier d'import invalide.",
  "Manufacturer reference is required.": "La référence fabricant est requise.",
  "Manufacturer reference must be 120 characters or fewer.": "La référence fabricant doit faire 120 caractères maximum.",
  "Network name and technical ID are required.": "Le nom réseau et l'ID technique sont requis.",
  "No network available for the selected export scope.": "Aucun réseau disponible pour le périmètre d'export sélectionné.",
  "No network selected for editing.": "Aucun réseau sélectionné pour l'édition.",
  "No network was imported. Check file errors.": "Aucun réseau n'a été importé. Vérifiez les erreurs du fichier.",
  "Node ID is required.": "L'ID nœud est requis.",
  "Port is already occupied. No available ports on selected splice.": "Le port est déjà occupé. Aucun port disponible sur l'épissure sélectionnée.",
  "Provide at least one segment ID to lock a forced route.": "Fournissez au moins un ID segment pour verrouiller une route forcée.",
  "Refresh built-in sample networks with the catalog validation issues sample? User-created networks are preserved.": "Rafraîchir les réseaux échantillon intégrés avec l'échantillon d'issues validation catalogue ? Les réseaux créés par l'utilisateur sont conservés.",
  "Refresh built-in sample networks with the pricing / BOM QA sample? User-created networks are preserved.": "Rafraîchir les réseaux échantillon intégrés avec l'échantillon QA tarification / BOM ? Les réseaux créés par l'utilisateur sont conservés.",
  "Refresh built-in sample networks with the validation issues sample? User-created networks are preserved.": "Rafraîchir les réseaux échantillon intégrés avec l'échantillon d'issues validation ? Les réseaux créés par l'utilisateur sont conservés.",
  "Replace built-in sample content": "Remplacer le contenu échantillon intégré",
  "Reset sample network": "Réinitialiser le réseau échantillon",
  "Reset the sample network to baseline? This removes any changes made to sample entities.": "Réinitialiser le réseau échantillon au baseline ? Cela supprime toutes les modifications faites sur les entités échantillon.",
  "Save active network": "Enregistrer le réseau actif",
  "Segment ID is required.": "L'ID segment est requis.",
  "Segment length must be >= 1 mm.": "La longueur de segment doit être >= 1 mm.",
  "Select a catalog item first.": "Sélectionnez d'abord un élément catalogue.",
  "Select a connector to create a connector node.": "Sélectionnez un connecteur pour créer un nœud connecteur.",
  "Select a splice to create a splice node.": "Sélectionnez une épissure pour créer un nœud épissure.",
  "Selected catalog item is incompatible: occupied port indexes exceed the catalog connection count.": "L'élément catalogue sélectionné est incompatible : les index de ports occupés dépassent le nombre de connexions catalogue.",
  "Selected catalog item is incompatible: occupied way indexes exceed the catalog connection count.": "L'élément catalogue sélectionné est incompatible : les index de voies occupées dépassent le nombre de connexions catalogue.",
  "Selected catalog item is incompatible: wire endpoint port indexes exceed the catalog connection count.": "L'élément catalogue sélectionné est incompatible : les index de ports d'extrémités fil dépassent le nombre de connexions catalogue.",
  "Selected catalog item is incompatible: wire endpoint way indexes exceed the catalog connection count.": "L'élément catalogue sélectionné est incompatible : les index de voies d'extrémités fil dépassent le nombre de connexions catalogue.",
  "Selected catalog item is invalid.": "L'élément catalogue sélectionné est invalide.",
  "Selected fuse catalog item is missing a manufacturer reference.": "L'élément catalogue fusible sélectionné n'a pas de référence fabricant.",
  "Selected fuse catalog item no longer exists.": "L'élément catalogue fusible sélectionné n'existe plus.",
  "Selected network no longer exists.": "Le réseau sélectionné n'existe plus.",
  "Splice created, but the linked splice node could not be created automatically. Create it manually in Nodes.": "Épissure créée, mais le nœud épissure lié n'a pas pu être créé automatiquement. Créez-le manuellement dans Nœuds.",
  "Splice name and technical ID are required.": "Le nom d'épissure et l'ID technique sont requis.",
  "Unable to create network. Check technical ID uniqueness.": "Impossible de créer le réseau. Vérifiez l'unicité de l'ID technique.",
  "Unable to read selected file.": "Impossible de lire le fichier sélectionné.",
  "Unable to rename node.": "Impossible de renommer le nœud.",
  "Unbounded mode allows any positive port index (∞).": "Le mode non borné autorise tout index de port positif (∞).",
  "Unit price (excl. tax) must be a valid number >= 0.": "Le prix unitaire (HT) doit être un nombre valide >= 0.",
  "URL must be empty or a valid absolute http/https URL.": "L'URL doit être vide ou une URL absolue http/https valide.",
  "Way is already occupied. No available ways on selected connector.": "La voie est déjà occupée. Aucune voie disponible sur le connecteur sélectionné.",
  "Wire endpoint references must be 120 characters or fewer.": "Les références d'extrémité fil doivent faire 120 caractères maximum.",
  "Wire name and technical ID are required.": "Le nom fil et l'ID technique sont requis.",
  "Wire section must be a positive value in mm².": "La section fil doit être une valeur positive en mm².",
  "Catalog item": "Élément catalogue",
  "cavity occupied": "cavité occupée",
  "cavity released": "cavité libérée",
  "port occupied": "port occupé",
  "port released": "port libéré",
  "route locked": "route verrouillée",
  "route reset": "route réinitialisée",
  "view updated": "vue mise à jour",
  "Workspace state replaced": "État d'espace de travail remplacé"
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

  const occupiedCountMatch = /^(\d+)\s*\/\s*Occupied\s+(\d+)$/i.exec(trimmed);
  if (occupiedCountMatch !== null) {
    const [, totalCount, occupiedCount] = occupiedCountMatch;
    return input.replace(trimmed, `${totalCount} / Occupé ${occupiedCount}`);
  }

  const wayIndexRangeMatch = /^Way index must be between 1 and (\d+)\.$/i.exec(trimmed);
  if (wayIndexRangeMatch !== null) {
    const [, maxIndex] = wayIndexRangeMatch;
    return input.replace(trimmed, `L'index de voie doit être entre 1 et ${maxIndex}.`);
  }

  const portIndexRangeMatch = /^Port index must be between 1 and (\d+)\.$/i.exec(trimmed);
  if (portIndexRangeMatch !== null) {
    const [, maxIndex] = portIndexRangeMatch;
    return input.replace(trimmed, `L'index de port doit être entre 1 et ${maxIndex}.`);
  }

  const wayUsedMatch = /^Way\s+C(\d+)\s+is already used\s+\((.+)\)\.(.*)$/i.exec(trimmed);
  if (wayUsedMatch !== null) {
    const [, wayIndex, occupantRef, suffixRaw] = wayUsedMatch;
    const suffix = (suffixRaw ?? "").trim();
    const translatedSuffix = suffix.length > 0 ? ` ${translateTextValue(locale, suffix).trim()}` : "";
    return input.replace(trimmed, `La voie C${wayIndex} est déjà utilisée (${occupantRef}).${translatedSuffix}`);
  }

  const portUsedMatch = /^Port\s+P(\d+)\s+is already used\s+\((.+)\)\.(.*)$/i.exec(trimmed);
  if (portUsedMatch !== null) {
    const [, portIndex, occupantRef, suffixRaw] = portUsedMatch;
    const suffix = (suffixRaw ?? "").trim();
    const translatedSuffix = suffix.length > 0 ? ` ${translateTextValue(locale, suffix).trim()}` : "";
    return input.replace(trimmed, `Le port P${portIndex} est déjà utilisé (${occupantRef}).${translatedSuffix}`);
  }

  const suggestedWayMatch = /^Suggested:\s*C(\d+)\.$/i.exec(trimmed);
  if (suggestedWayMatch !== null) {
    const [, wayIndex] = suggestedWayMatch;
    return input.replace(trimmed, `Suggestion : C${wayIndex}.`);
  }

  const suggestedPortMatch = /^Suggested:\s*P(\d+)\.$/i.exec(trimmed);
  if (suggestedPortMatch !== null) {
    const [, portIndex] = suggestedPortMatch;
    return input.replace(trimmed, `Suggestion : P${portIndex}.`);
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

  const importedNetworksMatch = /^Imported\s+(\d+)\s+network\(s\)\.$/i.exec(trimmed);
  if (importedNetworksMatch !== null) {
    const count = Number(importedNetworksMatch[1] ?? "0");
    return input.replace(trimmed, `${count} réseau${count > 1 ? "x" : ""} importé${count > 1 ? "s" : ""}.`);
  }

  return input;
}
