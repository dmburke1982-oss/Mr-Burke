import React, { useState } from "react";
import TeachingHub from "./components/TeachingHub";
import TeacherAIHub from "./components/TeacherAIHub";

/**
 * App root — routes between the TeachingHub dashboard and the TeacherAIHub
 * prompt tool. The URL hash controls the active view:
 *   #/              → TeachingHub (default)
 *   #/ai-hub        → TeacherAIHub prompt shortcuts
 */
function getViewFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash === "ai-hub" ? "ai-hub" : "dashboard";
}

export default function App() {
  const [view, setView] = useState(getViewFromHash);

  // Keep hash in sync when view changes programmatically
  React.useEffect(() => {
    const onHashChange = () => setView(getViewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (view === "ai-hub") {
    return <TeacherAIHub />;
  }

  return <TeachingHub />;
}
