import { lazy, Suspense, useEffect, useId, useRef, useState, type ChangeEvent, type ReactElement, type ReactNode, type RefObject } from "react";
import { HOME_CHANGELOG_ENTRY_SUMMARIES, loadHomeChangelogEntryContent } from "../../lib/changelogFeed";
import type { UndoHistoryEntry } from "../../types/app-controller";
import { NetworkRecentChangesList } from "./NetworkRecentChangesPanel";

const CHANGELOG_INITIAL_BATCH_SIZE = 4;
const CHANGELOG_INCREMENT_BATCH_SIZE = 4;

interface HomeWorkspacePostMvpModules {
  sessionSummary?: ReactNode;
  activityHistory?: ReactNode;
  healthSnapshot?: ReactNode;
}

interface HomeWorkspaceContentProps {
  hasActiveNetwork: boolean;
  activeNetworkName: string | null;
  activeNetworkTechnicalId: string | null;
  recentChangesForActiveNetwork: UndoHistoryEntry[];
  networkCount: number;
  onCreateEmptyWorkspace: () => void;
  onSaveWorkspace: () => void;
  onOpenImportPicker: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onOpenNetworkScope: () => void;
  onOpenModeling: () => void;
  onOpenRecentChangeTarget?: (entry: UndoHistoryEntry) => void;
  onOpenOnboardingHelp?: () => void;
  postMvpModules?: HomeWorkspacePostMvpModules;
}

interface ChangelogCollapsibleSection {
  title: string;
  body: string;
}

interface ChangelogSectionsSplit {
  beforeCollapsibleSections: string;
  collapsibleSections: ChangelogCollapsibleSection[];
}

const MAJOR_HIGHLIGHTS_SECTION_TITLE = "Major Highlights";
const HIDDEN_CHANGELOG_SECTION_TITLES = new Set(["Validation and Regression Evidence"]);
const LEVEL_TWO_HEADING_MATCHER = /^ {0,3}##\s+(.+?)\s*#*\s*$/;
const CHANGELOG_TITLE_MATCHER = /^ {0,3}#\s+Changelog\s+\(`[^`]+`\)\s*#*\s*$/i;

const MarkdownBlock = lazy(async () => {
  const [{ default: ReactMarkdown }, { default: remarkGfm }] = await Promise.all([import("react-markdown"), import("remark-gfm")]);

  return {
    default: function LoadedMarkdownBlock({ content }: { content: string }): ReactElement {
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
    }
  };
});

function ChangelogMarkdownBlock({ content }: { content: string }): ReactElement {
  return (
    <Suspense fallback={<p className="meta-line">Loading changelog...</p>}>
      <MarkdownBlock content={content} />
    </Suspense>
  );
}

function normalizeHeadingTitle(value: string): string {
  return value.trim().toLowerCase();
}

function removeChangelogTitleLine(markdown: string): string {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !CHANGELOG_TITLE_MATCHER.test(line))
    .join("\n")
    .trim();
}

function readLevelTwoHeadingTitle(line: string): string | null {
  const match = line.match(LEVEL_TWO_HEADING_MATCHER);
  if (match === null) {
    return null;
  }
  const title = match[1];
  if (title === undefined) {
    return null;
  }
  return title.trim();
}

function splitCollapsibleSections(markdown: string): ChangelogSectionsSplit | null {
  const lines = removeChangelogTitleLine(markdown).split(/\r?\n/);
  const levelTwoHeadings: Array<{ index: number; title: string }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) {
      continue;
    }
    const headingTitle = readLevelTwoHeadingTitle(line);
    if (headingTitle !== null) {
      levelTwoHeadings.push({ index, title: headingTitle });
    }
  }

  if (levelTwoHeadings.length === 0) {
    return null;
  }

  const majorHighlightsIndex = levelTwoHeadings.findIndex(
    (heading) => normalizeHeadingTitle(heading.title) === normalizeHeadingTitle(MAJOR_HIGHLIGHTS_SECTION_TITLE)
  );
  if (majorHighlightsIndex === -1) {
    return null;
  }

  const startHeadingIndex = majorHighlightsIndex + 1;
  if (startHeadingIndex >= levelTwoHeadings.length) {
    return null;
  }

  const firstCollapsibleHeading = levelTwoHeadings[startHeadingIndex];
  if (firstCollapsibleHeading === undefined) {
    return null;
  }

  const collapsibleSections = levelTwoHeadings
    .slice(startHeadingIndex)
    .map((heading, index, headings) => {
      const nextHeading = headings[index + 1];
      const sectionEndIndex = nextHeading?.index ?? lines.length;
      return {
        title: heading.title,
        body: lines.slice(heading.index + 1, sectionEndIndex).join("\n").trim()
      };
    })
    .filter((section) => !HIDDEN_CHANGELOG_SECTION_TITLES.has(section.title));

  return {
    beforeCollapsibleSections: lines.slice(0, firstCollapsibleHeading.index).join("\n").trim(),
    collapsibleSections
  };
}

function ChangelogEntryMarkdown({ content }: { content: string }): ReactElement {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const collapsibleSections = splitCollapsibleSections(content);
  const collapsibleSectionsIdPrefix = useId();

  if (collapsibleSections === null) {
    return <ChangelogMarkdownBlock content={removeChangelogTitleLine(content)} />;
  }

  return (
    <>
      {collapsibleSections.beforeCollapsibleSections.length > 0 ? (
        <ChangelogMarkdownBlock content={collapsibleSections.beforeCollapsibleSections} />
      ) : null}
      {collapsibleSections.collapsibleSections.map((section, index) => {
        const panelId = `${collapsibleSectionsIdPrefix}-${index}`;
        const isExpanded = expandedSections[index] === true;

        return (
          <section key={`${section.title}-${index}`} className="home-changelog-collapsible" data-changelog-collapsible={section.title}>
            <button
              type="button"
              className="home-changelog-collapsible-toggle"
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => {
                setExpandedSections((current) => ({
                  ...current,
                  [index]: !isExpanded
                }));
              }}
            >
              {section.title}
            </button>
            {isExpanded ? (
              <div id={panelId} className="home-changelog-collapsible-content">
                {section.body.length > 0 ? (
                  <ChangelogMarkdownBlock content={section.body} />
                ) : (
                  <p className="meta-line">No listed changes in this section.</p>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}

export function HomeWorkspaceContent({
  hasActiveNetwork,
  activeNetworkName,
  recentChangesForActiveNetwork,
  networkCount,
  onCreateEmptyWorkspace,
  onSaveWorkspace,
  onOpenImportPicker,
  importFileInputRef,
  onImportFileChange,
  onOpenNetworkScope,
  onOpenModeling,
  onOpenRecentChangeTarget,
  onOpenOnboardingHelp,
  postMvpModules
}: HomeWorkspaceContentProps): ReactElement {
  const homeExtensionEntries = [
    ["session", "Session summary", postMvpModules?.sessionSummary],
    ["history", "Activity history", postMvpModules?.activityHistory],
    ["health", "Health snapshot", postMvpModules?.healthSnapshot]
  ] as const;

  const hasPostMvpModules = homeExtensionEntries.some(([, , content]) => content !== undefined && content !== null);
  const [visibleChangelogCount, setVisibleChangelogCount] = useState(() =>
    Math.min(CHANGELOG_INITIAL_BATCH_SIZE, HOME_CHANGELOG_ENTRY_SUMMARIES.length)
  );
  const [changelogContentBySourcePath, setChangelogContentBySourcePath] = useState<Record<string, string>>({});
  const changelogScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const changelogSentinelRef = useRef<HTMLDivElement | null>(null);
  const canLoadMoreChangelogs = visibleChangelogCount < HOME_CHANGELOG_ENTRY_SUMMARIES.length;
  const visibleChangelogEntries = HOME_CHANGELOG_ENTRY_SUMMARIES.slice(0, visibleChangelogCount);

  useEffect(() => {
    setVisibleChangelogCount(Math.min(CHANGELOG_INITIAL_BATCH_SIZE, HOME_CHANGELOG_ENTRY_SUMMARIES.length));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const missingEntries = visibleChangelogEntries.filter((entry) => changelogContentBySourcePath[entry.sourcePath] === undefined);
    if (missingEntries.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    void Promise.all(
      missingEntries.map(async (entry) => [entry.sourcePath, await loadHomeChangelogEntryContent(entry.sourcePath)] as const)
    ).then((loadedEntries) => {
      if (cancelled) {
        return;
      }
      setChangelogContentBySourcePath((current) => {
        const next = { ...current };
        for (const [sourcePath, content] of loadedEntries) {
          next[sourcePath] = content;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [changelogContentBySourcePath, visibleChangelogEntries]);

  useEffect(() => {
    if (!canLoadMoreChangelogs) {
      return;
    }

    if (typeof IntersectionObserver !== "function") {
      setVisibleChangelogCount(HOME_CHANGELOG_ENTRY_SUMMARIES.length);
      return;
    }

    const root = changelogScrollContainerRef.current;
    const sentinel = changelogSentinelRef.current;
    if (root === null || sentinel === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (!isIntersecting) {
          return;
        }
        setVisibleChangelogCount((current) =>
          Math.min(current + CHANGELOG_INCREMENT_BATCH_SIZE, HOME_CHANGELOG_ENTRY_SUMMARIES.length)
        );
      },
      {
        root,
        rootMargin: "0px 0px 18% 0px",
        threshold: 0.01
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [canLoadMoreChangelogs]);

  return (
    <section className="home-workspace-grid" aria-label="Home workspace">
      <div className="home-left-column">
        <section className="panel home-panel home-quick-start-panel">
          <header className="home-panel-header">
            <h2>Quick start</h2>
            <div className="home-panel-header-tools">
              <span className="settings-panel-chip">Home</span>
            </div>
          </header>
          <p className="settings-panel-intro home-start-intro">
            Start a new workspace flow, import existing data, or open workspace management controls.
          </p>
          <div className="row-actions home-primary-actions">
            <button type="button" className="button-with-icon" onClick={onOpenModeling} disabled={!hasActiveNetwork}>
              <span className="action-button-icon is-edit" aria-hidden="true" />
              <span>Resume</span>
            </button>
            <button type="button" className="button-with-icon" onClick={onOpenNetworkScope}>
              <span className="action-button-icon is-home-start" aria-hidden="true" />
              <span>Load network</span>
            </button>
            {onOpenOnboardingHelp !== undefined ? (
              <button type="button" className="button-with-icon" onClick={onOpenOnboardingHelp}>
                <span className="action-button-icon is-help" aria-hidden="true" />
                <span>Help</span>
              </button>
            ) : null}
            <button type="button" className="button-with-icon" onClick={onCreateEmptyWorkspace}>
              <span className="action-button-icon is-home-create" aria-hidden="true" />
              <span>Create empty workspace</span>
            </button>
            <button type="button" className="button-with-icon" onClick={onSaveWorkspace} disabled={networkCount === 0}>
              <span className="action-button-icon is-save" aria-hidden="true" />
              <span>Save workspace</span>
            </button>
            <button type="button" className="button-with-icon" onClick={onOpenImportPicker}>
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              <span>Import workspace</span>
            </button>
          </div>
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            className="home-hidden-file-input"
            onChange={(event) => {
              void onImportFileChange(event);
            }}
          />
        </section>

        <section className="panel home-panel home-workspace-resume-panel">
          <header className="home-panel-header">
            <h2>Workspace</h2>
            <span className="settings-panel-chip">
              {hasActiveNetwork && activeNetworkName !== null ? activeNetworkName : "No active network"}
            </span>
          </header>
          <p className="settings-panel-intro home-resume-intro">
            Continue where you left off using the current workspace context and active network.
          </p>
          <NetworkRecentChangesList entries={recentChangesForActiveNetwork} onOpenEntryTarget={onOpenRecentChangeTarget} />
        </section>
      </div>
      <section className="panel home-panel home-whats-new-panel">
        <header className="home-panel-header">
          <h2>What's new</h2>
          <span className="settings-panel-chip">Changelog</span>
        </header>
        <p className="settings-panel-intro home-whats-new-intro">
          Latest release notes from available changelog files.
        </p>
        <div
          ref={changelogScrollContainerRef}
          className="home-whats-new-scroll"
          aria-label="Changelog feed"
          tabIndex={0}
          data-visible-changelog-count={visibleChangelogCount}
          data-locale-exempt="true"
        >
          {HOME_CHANGELOG_ENTRY_SUMMARIES.length === 0 ? (
            <p className="empty-copy">No changelog available.</p>
          ) : (
            visibleChangelogEntries.map((entry) => {
              const content = changelogContentBySourcePath[entry.sourcePath];
              return (
                <article key={entry.sourcePath} className="home-changelog-entry" aria-label={`Changelog v${entry.version}`}>
                  <h3 className="home-changelog-version-heading" data-changelog-version={entry.version}>
                    v{entry.version}
                  </h3>
                  <div className="home-changelog-markdown">
                    {content === undefined ? <p className="meta-line">Loading changelog...</p> : <ChangelogEntryMarkdown content={content} />}
                  </div>
                </article>
              );
            })
          )}
          {canLoadMoreChangelogs ? <div ref={changelogSentinelRef} className="home-changelog-sentinel" aria-hidden="true" /> : null}
        </div>
      </section>

      {hasPostMvpModules ? (
        <section className="panel home-panel home-extension-panel">
          <header className="home-panel-header">
            <h2>Workspace hub</h2>
            <span className="settings-panel-chip">Post-MVP</span>
          </header>
          <p className="settings-panel-intro">Extension-ready region for session, history, health, and release notes modules.</p>
          <div className="home-extension-grid">
            {homeExtensionEntries.map(([key, title, content]) =>
              content !== undefined && content !== null ? (
                <section key={key} className="home-extension-slot" aria-label={title}>
                  <h3>{title}</h3>
                  {content}
                </section>
              ) : null
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
