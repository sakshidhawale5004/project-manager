import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, RemoteTeamMember } from '../types/project';
import { X, Save } from 'lucide-react';

interface ProjectFormModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  teamMembers?: RemoteTeamMember[];
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
  teamMembers,
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    projectLead: 'Sakshi',
    subLead: '',
    liveUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    initiationDate: new Date().toISOString().split('T')[0],
    technology: 'React / Next.js',
    framework: 'Tailwind CSS',
    design: 'In Progress',
    content: 'Client Provided',
    lastChange: 'Initial setup',
    status: 'In process',
    hosting: '',
    deadline: '',
    backup: '',
    remark: '',
    estimatedHours: 40,
    loggedHours: 0,
    clientUrgencyFlag: false,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: project.startDate || project.initiationDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        projectLead: 'Sakshi',
        subLead: '',
        liveUrl: '',
        startDate: new Date().toISOString().split('T')[0],
        initiationDate: new Date().toISOString().split('T')[0],
        technology: 'Next.js / TypeScript',
        framework: 'Tailwind CSS',
        design: 'Wireframing',
        content: 'Drafting',
        lastChange: 'New record created',
        status: 'In process',
        hosting: '',
        deadline: '2026-11-15',
        backup: '',
        remark: '',
        estimatedHours: 40,
        loggedHours: 0,
        clientUrgencyFlag: false,
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs text-neutral-800 dark:text-neutral-200 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white">
            {project ? `Edit Project: ${project.name}` : 'Create New Agency Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Project Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Acme Health Clinic"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Status</label>
              <select
                value={formData.status || 'In process'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="In process">In Process</option>
                <option value="Changes from Client">Changes from Client</option>
                <option value="Pending from client">Pending Client</option>
                <option value="Schedule Meeting">Schedule Meeting</option>
                <option value="Planning">Planning</option>
                <option value="Live">Live</option>
              </select>
            </div>
          </div>

          {/* Row 2: Leads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Project Lead (Remote)</label>
              <input
                list="modal-lead-options"
                type="text"
                value={formData.projectLead || ''}
                onChange={(e) => setFormData({ ...formData, projectLead: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                placeholder="Sakshi, Aishwarya, Suraj, Hasina, Jorden..."
              />
              <datalist id="modal-lead-options">
                {(teamMembers && teamMembers.length > 0
                  ? teamMembers.map((m) => m.name)
                  : ['Sakshi', 'Aishwarya', 'Suraj', 'Hasina', 'Jorden']
                ).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Sub Lead</label>
              <input
                type="text"
                value={formData.subLead || ''}
                onChange={(e) => setFormData({ ...formData, subLead: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                placeholder="Hasina, Jorden, Suraj..."
              />
            </div>
          </div>

          {/* Row 3: Live Link */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Current Live URL</label>
            <input
              type="url"
              value={formData.liveUrl || ''}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              placeholder="https://clientdomain.com/"
            />
          </div>

          {/* Row 4: Project Schedule - Starting Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                Starting Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate || formData.initiationDate || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: e.target.value,
                    initiationDate: e.target.value,
                  })
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                Target Deadline
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Row 4: Tech & Framework */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Technology</label>
              <input
                type="text"
                value={formData.technology || ''}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                placeholder="WordPress, React, Next.js, PHP"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Framework / Architecture</label>
              <input
                type="text"
                value={formData.framework || ''}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                placeholder="Tailwind CSS, Elementor, Bootstrap 5"
              />
            </div>
          </div>

          {/* Row 5: Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Estimated Hours</label>
              <input
                type="number"
                min="1"
                value={formData.estimatedHours || 40}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Logged Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.loggedHours || 0}
                onChange={(e) => setFormData({ ...formData, loggedHours: Number(e.target.value) })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700 dark:text-neutral-300 font-medium">
                <input
                  type="checkbox"
                  checked={formData.clientUrgencyFlag || false}
                  onChange={(e) => setFormData({ ...formData, clientUrgencyFlag: e.target.checked })}
                  className="rounded accent-[#F05A28]"
                />
                <span>Client Blocker / Urgent Flag</span>
              </label>
            </div>
          </div>

          {/* Hosting and Auth */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Hosting Details & Credentials</label>
            <textarea
              rows={2}
              value={formData.hosting || ''}
              onChange={(e) => setFormData({ ...formData, hosting: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              placeholder="e.g. theusher.digital@gmail.com (Hostinger) or cPanel credentials"
            />
          </div>

          {/* Backup Mega Link */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Mega.nz Cloud Backup Link</label>
            <input
              type="text"
              value={formData.backup || ''}
              onChange={(e) => setFormData({ ...formData, backup: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              placeholder="https://mega.nz/file/..."
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Remarks & Client Notes</label>
            <textarea
              rows={2}
              value={formData.remark || ''}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              placeholder="Important notes regarding client expectations or pending deliverables"
            />
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
