import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Maximize2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useLayoutStore } from '../stores/useLayoutStore';
import { Client, ProjectType } from '../types';
import toast from 'react-hot-toast';

export const CreateProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setRoomDimensions, setRoomDetails } = useLayoutStore();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [projectName, setProjectName] = useState('Modern Bedroom');
  const [selectedClientId, setSelectedClientId] = useState('cli-1');
  const [projectType, setProjectType] = useState<ProjectType>('BEDROOM');
  const [projectDescription, setProjectDescription] = useState('Interior design for master bedroom.');
  const [clients, setClients] = useState<Client[]>([]);

  const [roomType, setRoomType] = useState('Bedroom');
  const [lengthFt, setLengthFt] = useState<number>(12);
  const [widthFt, setWidthFt] = useState<number>(10);
  const [heightFt, setHeightFt] = useState<number>(9);

  useEffect(() => {
    apiService.getClients().then(setClients);
  }, []);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      toast.error('Please enter a project name');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lengthFt || !widthFt) {
      toast.error('Please enter valid room dimensions');
      return;
    }

    const createdProject = await apiService.createProject({
      name: projectName,
      description: projectDescription,
      type: projectType,
      clientId: selectedClientId,
    });

    setRoomDimensions(lengthFt, widthFt, heightFt);
    setRoomDetails(projectName, roomType, createdProject.id);

    toast.success('Room ready — opening studio');
    navigate(`/projects/${createdProject.id}/design`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-space-rise">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">New space</p>
        <h1 className="font-display text-4xl text-ink tracking-tight">
          {currentStep === 1 ? 'Name the project' : 'Set the room'}
        </h1>
        <p className="text-sm text-ink-muted mt-2">
          {currentStep === 1
            ? 'Client and room type — then we size the space.'
            : 'Dimensions feed the live room preview and studio canvas.'}
        </p>
      </header>

      <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
        <span className={currentStep >= 1 ? 'text-primary' : 'text-ink-muted'}>01 Project</span>
        <span className="h-px flex-1 max-w-[4rem] bg-surface-border" />
        <span className={currentStep >= 2 ? 'text-primary' : 'text-ink-muted'}>02 Room</span>
        <span className="h-px flex-1 max-w-[4rem] bg-surface-border" />
        <span className="text-ink-muted">03 Studio</span>
      </div>

      {currentStep === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-5 panel-quiet p-6 md:p-8 animate-fade-in">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
              Project name *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Modern Bedroom"
              className="input-studio"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
                Client *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="input-studio"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city || 'Client'})
                  </option>
                ))}
                {clients.length === 0 && (
                  <option value="cli-1">Rohan Mehta (Mumbai)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
                Project type *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="input-studio"
              >
                <option value="BEDROOM">Bedroom</option>
                <option value="LIVING_ROOM">Living Room</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="BATHROOM">Bathroom</option>
                <option value="OFFICE">Home Office</option>
                <option value="FULL_HOME">Full Home</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
              Notes
            </label>
            <textarea
              rows={4}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Style, constraints, client preferences…"
              className="input-studio resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={handleStep2Submit} className="panel-quiet p-6 md:p-8 animate-fade-in space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
                  Room type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="input-studio"
                >
                  <option value="Bedroom">Bedroom</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Living Room">Living Room</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Dining Room">Dining Room</option>
                  <option value="Home Office">Home Office</option>
                </select>
              </div>

              {(['Length', 'Width', 'Height'] as const).map((label) => {
                const value = label === 'Length' ? lengthFt : label === 'Width' ? widthFt : heightFt;
                const set =
                  label === 'Length' ? setLengthFt : label === 'Width' ? setWidthFt : setHeightFt;
                const min = label === 'Height' ? 7 : 4;
                return (
                  <div key={label}>
                    <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
                      {label} (ft)
                    </label>
                    <input
                      type="number"
                      min={min}
                      max={label === 'Height' ? 30 : 100}
                      step={0.5}
                      required
                      value={value}
                      onChange={(e) => set(parseFloat(e.target.value) || 0)}
                      className="input-studio font-semibold"
                    />
                  </div>
                );
              })}

              <div className="flex items-center gap-2 text-xs text-primary font-medium pt-1">
                <Maximize2 className="w-4 h-4 shrink-0" />
                <span>
                  Floor area: <strong>{lengthFt * widthFt} sq ft</strong>
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 min-h-[340px] bg-[#C9B8A0]/35 border border-surface-border relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#5C574E_1px,transparent_1px)] [background-size:14px_14px]" />
              <div className="relative w-full max-w-sm aspect-video flex items-center justify-center">
                <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-md">
                  <polygon
                    points="80,180 200,240 320,180 200,120"
                    fill="#E2D4C3"
                    stroke="#8C7A65"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <polygon
                    points="80,180 80,70 200,30 200,120"
                    fill="#ECE5DC"
                    stroke="#A89B8C"
                    strokeWidth="2"
                  />
                  <polygon
                    points="200,120 200,30 320,70 320,180"
                    fill="#DFD5C8"
                    stroke="#A89B8C"
                    strokeWidth="2"
                  />
                  <line x1="80" y1="180" x2="200" y2="240" stroke="#2C4A3E" strokeWidth="2.5" />
                  <line x1="200" y1="240" x2="320" y2="180" stroke="#2C4A3E" strokeWidth="2.5" />
                  <g transform="translate(130, 225)">
                    <rect x="-24" y="-12" width="48" height="20" rx="2" fill="#F7F6F2" stroke="#2C4A3E" strokeWidth="1" />
                    <text x="0" y="2" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1814">
                      {lengthFt} ft
                    </text>
                  </g>
                  <g transform="translate(275, 220)">
                    <rect x="-24" y="-12" width="48" height="20" rx="2" fill="#F7F6F2" stroke="#2C4A3E" strokeWidth="1" />
                    <text x="0" y="2" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1814">
                      {widthFt} ft
                    </text>
                  </g>
                  <g transform="translate(345, 125)">
                    <rect x="-22" y="-10" width="44" height="20" rx="2" fill="#F7F6F2" stroke="#5C574E" strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1814">
                      {heightFt} ft
                    </text>
                  </g>
                </svg>
              </div>
              <p className="relative mt-3 text-xs font-semibold text-ink-muted">Live room outline</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
              <span>Open design studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
