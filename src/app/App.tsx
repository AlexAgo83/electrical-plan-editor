import { type ReactElement, useSyncExternalStore } from "react";
import { appStore } from "./store";
import { selectConnectors, selectNodes, selectSegments, selectSplices, selectWires } from "../store";
import "./styles.css";

function useAppSnapshot() {
  return useSyncExternalStore(appStore.subscribe, appStore.getState, appStore.getState);
}

export function App(): ReactElement {
  const state = useAppSnapshot();

  return (
    <main className="app-shell">
      <section>
        <h1>Electrical Plan Editor</h1>
        <p>V1 foundation initialized. Domain contracts and store skeleton are ready.</p>
      </section>

      <section className="stats-grid" aria-label="Entity counters">
        <article>
          <h2>Connectors</h2>
          <p>{selectConnectors(state).length}</p>
        </article>
        <article>
          <h2>Splices</h2>
          <p>{selectSplices(state).length}</p>
        </article>
        <article>
          <h2>Nodes</h2>
          <p>{selectNodes(state).length}</p>
        </article>
        <article>
          <h2>Segments</h2>
          <p>{selectSegments(state).length}</p>
        </article>
        <article>
          <h2>Wires</h2>
          <p>{selectWires(state).length}</p>
        </article>
      </section>
    </main>
  );
}
