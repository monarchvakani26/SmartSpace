import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles, Box, Layers, Maximize2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useLayoutStore } from '../stores/useLayoutStore';
import { Client, ProjectType } from '../types';
import toast from 'react-hot-toast';

export const CreateProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setRoomDimensions, setRoomDetails } = useLayoutStore();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Project Info
  const [projectName, setProjectName] = useState('Modern Bedroom');
  const [selectedClientId, setSelectedClientId] = useState('cli-1');
  const [projectType, setProjectType] = useState<ProjectType>('BEDROOM');
  const [projectDescription, setProjectDescription] = useState('Interior design for master bedroom.');
  const [clients, setClients] = useState<Client[]>([]);

  // Step 2: Room Details
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

    toast.success('Room initialized! Opening Design Studio...');
    navigate(`/projects/${createdProject.id}/design`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {currentStep === 1 ? 'Create Project' : 'Room Setup'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {currentStep === 1 
            ? 'Define basic project metadata and assigned client.'
            : 'Configure precise spatial dimensions to generate the parametric layout canvas.'}
        </p>
      </div>

      {/* Step Tracker (Matching Reference) */}
      <div className="card !p-4">
        <div className="flex items-center justify-center max-w-xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep >= 1 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-400'
            }`}>
              1
            </div>
            <span className={`text-xs font-semibold ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              Project Info
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep >= 2 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className={`text-xs font-semibold ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Room Details
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-4 bg-slate-200" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Design
            </span>
          </div>
        </div>
      </div>

      {/* Step 1 Content: Project Info Form (Reference Screen 4) */}
      {currentStep === 1 && (
        <div className="card animate-fade-in">
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Modern Bedroom, 3BHK Apartment"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Type *
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Project Description
              </label>
              <textarea
                rows={4}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Write specific design requirements, client preferences, style guidelines..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 resize-none"
              />
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 Content: Room Setup / Dimensions (Reference Screen 5) */}
      {currentStep === 2 && (
        <div className="card animate-fade-in">
          <form onSubmit={handleStep2Submit} className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Number Inputs */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  >
                    <option value="Bedroom">Bedroom</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Home Office">Home Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={100}
                    step={0.5}
                    required
                    value={lengthFt}
                    onChange={(e) => setLengthFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={100}
                    step={0.5}
                    required
                    value={widthFt}
                    onChange={(e) => setWidthFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Height (ft)
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={30}
                    step={0.5}
                    required
                    value={heightFt}
                    onChange={(e) => setHeightFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-semibold"
                  />
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-2 text-xs text-primary font-medium">
                  <Maximize2 className="w-4 h-4 shrink-0" />
                  <span>Total Floor Area: <strong>{lengthFt * widthFt} sq ft</strong> ({lengthFt} ft × {widthFt} ft)</span>
                </div>
              </div>

              {/* Right Column: Live Isometric Room Outline (Matching Screen 5) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-100 min-h-[340px] relative">
                
                {/* SVG Isometric Box Outline */}
                <div className="relative w-full max-w-sm aspect-video flex items-center justify-center">
                  <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-md">
                    {/* Isometric Floor Polygon */}
                    <polygon
                      points="80,180 200,240 320,180 200,120"
                      fill="#E2D4C3"
                      stroke="#8C7A65"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />

                    {/* Back Left Wall */}
                    <polygon
                      points="80,180 80,70 200,30 200,120"
                      fill="#ECE5DC"
                      stroke="#A89B8C"
                      strokeWidth="2"
                    />

                    {/* Back Right Wall */}
                    <polygon
                      points="200,120 200,30 320,70 320,180"
                      fill="#DFD5C8"
                      stroke="#A89B8C"
                      strokeWidth="2"
                    />

                    {/* Front Floor Corner Highlight */}
                    <line x1="80" y1="180" x2="200" y2="240" stroke="#5B4FE0" strokeWidth="2.5" />
                    <line x1="200" y1="240" x2="320" y2="180" stroke="#5B4FE0" strokeWidth="2.5" />

                    {/* Dimension Edge Labels (Matching Reference Screen 5) */}
                    {/* Length Label */}
                    <g transform="translate(130, 225)">
                      <rect x="-24" y="-12" width="48" height="20" rx="4" fill="#FFFFFF" stroke="#5B4FE0" strokeWidth="1" />
                      <text x="0" y="2" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0F1629">
                        {lengthFt} ft
                      </text>
                    </g>

                    {/* Width Label */}
                    <g transform="translate(275, 220)">
                      <rect x="-24" y="-12" width="48" height="20" rx="4" fill="#FFFFFF" stroke="#5B4FE0" strokeWidth="1" />
                      <text x="0" y="2" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0F1629">
                        {widthFt} ft
                      </text>
                    </g>

                    {/* Height Label */}
                    <g transform="translate(345, 125)">
                      <rect x="-22" y="-10" width="44" height="20" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
                      <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0F1629">
                        {heightFt} ft
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-xs font-semibold text-slate-500">Live Parametric Room Preview</span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-outline flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm shadow-md shadow-primary/30"
              >
                <span>Launch Design Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
