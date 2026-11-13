"use client";

import { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import { pillarName, statusInfo, type Pillar, type Project, type Status } from "../lib/content";

const pillarOptions: (Pillar | "all")[] = ["all", "ai", "platforms", "research"];
const statusOptions: (Status | "all")[] = ["all", "operational", "initiative", "poc", "historical"];

export default function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [pillar, setPillar] = useState<Pillar | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");

  const list = useMemo(
    () => projects.filter((p) => (pillar === "all" || p.pillar === pillar) && (status === "all" || p.status === status)),
    [projects, pillar, status],
  );

  return (
    <div>
      <div className="filters">
        <fieldset>
          <legend>Domain</legend>
          {pillarOptions.map((o) => (
            <button key={o} type="button" className="chip" aria-pressed={pillar === o} onClick={() => setPillar(o)}>
              {o === "all" ? "All domains" : pillarName[o]}
            </button>
          ))}
        </fieldset>
        <fieldset>
          <legend>Status</legend>
          {statusOptions.map((o) => (
            <button key={o} type="button" className="chip" aria-pressed={status === o} onClick={() => setStatus(o)}>
              {o === "all" ? "All statuses" : statusInfo[o].label}
            </button>
          ))}
        </fieldset>
      </div>
      <p className="filter-count" role="status" aria-live="polite">{list.length} {list.length === 1 ? "project" : "projects"}</p>
      <div className="project-grid">
        {list.map((p) => <ProjectCard key={p.slug} project={p} />)}
      </div>
      {list.length === 0 && <p className="empty">No projects match these filters.</p>}
    </div>
  );
}
