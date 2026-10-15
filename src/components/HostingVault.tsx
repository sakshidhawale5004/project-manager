import React, { useState, useMemo } from 'react';
import { Project } from '../types/project';
import {
  Server,
  Shield,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  HardDrive,
  Search,
  Lock
} from 'lucide-react';

interface HostingVaultProps {
  projects: Project[];
}

export const HostingVault: React.FC<HostingVaultProps> = ({ projects }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (p.hosting || p.backup) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.hosting.toLowerCase().includes(search.toLowerCase()) ||
          p.projectLead.toLowerCase().includes(search.toLowerCase()))
    );
  }, [projects, search]);

  return (
    <div className="space-y-6">
      {/* Vault Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Cloud Hosting & Backup Repository
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Centralized registry of client cPanel logins, Hostinger accounts, database keys, and offsite Mega.nz cloud snapshot backups across all agency web deployments.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search servers, emails, logins..."
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Credentials & Backup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const isRevealed = revealedIds.has(project.id);
          const isCopied = copiedId === project.id;

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3.5 flex flex-col justify-between shadow-sm transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-xs">
                      {project.name}
                    </h3>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Lead: {project.projectLead} {project.subLead ? `· Sub: ${project.subLead}` : ''}
                    </div>
                  </div>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-indigo-600 dark:text-neutral-500 dark:hover:text-indigo-400 transition-colors p-1"
                      title="Open live URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Hosting & Credentials Box */}
                <div className="mt-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      HOSTING & AUTH
                    </span>
                    <button
                      onClick={() => toggleReveal(project.id)}
                      className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1"
                    >
                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{isRevealed ? 'Mask' : 'Reveal'}</span>
                    </button>
                  </div>

                  <div className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 break-all select-all">
                    {project.hosting ? (
                      isRevealed ? (
                        project.hosting
                      ) : (
                        project.hosting.replace(/(password|pass|Domain@|Sociale@|Jyoti|nayesha|Banana)[\w!#%@]+/gi, '••••••••')
                      )
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-600">No credentials recorded</span>
                    )}
                  </div>

                  {project.hosting && (
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleCopy(project.id, project.hosting)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700/60 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded text-[10px] transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" /> Copy String
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cloud Backup Section */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                {project.backup ? (
                  <a
                    href={project.backup}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-[11px] transition-colors"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Mega.nz Cloud Backup</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-neutral-400 dark:text-neutral-500 text-[11px]">No backup link attached</span>
                )}

                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                  #{project.srNo}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
