/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Mic, MicOff, Hand, Trash2, Edit3, Circle, Play, Square, Video } from 'lucide-react';

interface VirtualClassroomProps {
  sessionTitle?: string;
  teacherName?: string;
  studentName?: string;
  onCloseSession?: () => void;
}

export default function VirtualClassroom({
  sessionTitle = 'TRIGONOMÉTRIE ET RAPPORTS DE THALÈS',
  teacherName = 'Pr. Armand Ndong',
  studentName = 'Jean-Daniel Mvezogo',
  onCloseSession,
}: VirtualClassroomProps) {
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [brushColor, setBrushColor] = useState('#D4AF37'); // Gold default
  const [brushSize, setBrushSize] = useState(4);
  const [classroomMessages, setClassroomMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: teacherName, text: 'Bonjour Jean-Daniel, prépare ton équerre et ta règle.' },
    { sender: studentName, text: 'Bonjour Monsieur, je suis prêt !' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Initialize canvas with some initial drawing (Thales triangle illustration)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear background
        ctx.fillStyle = '#0F172A'; // Slate-900 background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw coordinate axes or sample lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let i = 40; i < canvas.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let j = 40; j < canvas.height; j += 40) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(canvas.width, j);
          ctx.stroke();
        }

        // Draw a simulated school exercise triangle
        ctx.strokeStyle = '#D4AF37'; // Gold
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(80, 240); // Point A
        ctx.lineTo(360, 240); // Point B
        ctx.lineTo(80, 60);  // Point C
        ctx.closePath();
        ctx.stroke();

        // Draw parallel line (Thales application)
        ctx.strokeStyle = '#38BDF8'; // Sky-400
        ctx.beginPath();
        ctx.moveTo(180, 240); // Point M
        ctx.lineTo(180, 140); // Point N
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('A (Rectangle)', 60, 260);
        ctx.fillText('B', 370, 260);
        ctx.fillText('C', 70, 50);
        ctx.fillText('M', 175, 260);
        ctx.fillText('N', 175, 130);

        ctx.fillStyle = '#38BDF8';
        ctx.fillText('(MN) // (AC)', 210, 80);
      }
    }
  }, []);

  // Drawing event handlers for Whiteboard
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get true canvas dimensions
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    isDrawingRef.current = true;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setClassroomMessages((prev) => [...prev, { sender: studentName, text: chatInput }]);
    setChatInput('');
  };

  return (
    <div className="bg-slate-950 text-slate-100 flex flex-col h-[700px] rounded-3xl border border-slate-800 overflow-hidden font-sans select-none">
      
      {/* Upper header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-amber-500">{sessionTitle}</h2>
            <p className="text-xs text-slate-400">Salle Animée par : <span className="text-slate-200 font-bold">{teacherName}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Recording Badge */}
          {isRecording && (
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] rounded-full font-mono flex items-center gap-1.5 font-bold animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-600"></span> REC (ENREGISTREMENT)
            </div>
          )}

          {onCloseSession && (
            <button
              id="quitter-visio-btn"
              onClick={onCloseSession}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Quitter la Session
            </button>
          )}
        </div>
      </div>

      {/* Main split work space */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Left 3 Cols: Classroom Canvas Whiteboard + Feeds */}
        <div className="lg:col-span-3 flex flex-col p-4 space-y-4 overflow-y-auto">
          
          {/* Whiteboard module */}
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
            {/* Whiteboard Controls */}
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider font-mono">Tableau Blanc Interactif</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Brush Colors */}
                <span className="text-[10px] text-slate-500">Pinceau :</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#D4AF37', label: 'Or' },
                    { color: '#38BDF8', label: 'Bleu' },
                    { color: '#F43F5E', label: 'Rouge' },
                    { color: '#10B981', label: 'Vert' },
                    { color: '#FFFFFF', label: 'Blanc' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      id={`color-choice-${c.label}`}
                      onClick={() => setBrushColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        brushColor === c.color ? 'border-amber-500 scale-110' : 'border-transparent opacity-80'
                      }`}
                      title={c.label}
                    />
                  ))}
                  <button
                    id="pencil-eraser-btn"
                    onClick={() => setBrushColor('#0F172A')} // Erase matches bg
                    className={`p-1 bg-slate-900 border text-slate-300 hover:text-white rounded transition-all cursor-pointer ${
                      brushColor === '#0F172A' ? 'border-amber-500 bg-slate-800' : 'border-slate-850'
                    }`}
                    title="Gomme"
                  >
                    Gomme
                  </button>
                </div>

                <div className="h-5 w-px bg-slate-800"></div>

                {/* Clear trigger */}
                <button
                  id="clear-whiteboard-btn"
                  onClick={clearCanvas}
                  className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 text-red-400 hover:text-red-500 border border-slate-850 hover:border-red-500/20 rounded text-xs transition-all cursor-pointer flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Recommencer
                </button>
              </div>
            </div>

            {/* True Interactive Canvas */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              <canvas
                id="whiteboard-canvas-main"
                ref={canvasRef}
                width={700}
                height={350}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="bg-slate-950 cursor-crosshair max-w-full"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/80 border border-slate-800 rounded font-mono text-[9px] text-slate-400 pointer-events-none">
                📊 Écriture possible – Dessinez ou tracez vos triangles !
              </div>
            </div>
          </div>

          {/* Bottom Row - Cam Streams block */}
          <div className="grid grid-cols-2 gap-4 h-[130px] shrink-0">
            {/* Teacher live slot */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative">
              {camActive ? (
                <div className="h-full w-full bg-slate-950 relative flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=350"
                    alt={teacherName}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-bold rounded px-1.5 py-0.5 text-[8px] font-mono">
                    PROFS
                  </div>
                </div>
              ) : (
                <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                  <CameraOff className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">Caméra désactivée</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[10px] flex items-center gap-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {teacherName}
              </div>
            </div>

            {/* Student slot */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative">
              {camActive ? (
                <div className="h-full w-full bg-slate-950 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/25 border border-amber-500/50 flex items-center justify-center text-amber-500 text-lg font-bold">
                      J.D
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold rounded px-1.5 py-0.5 text-[8px] font-mono">
                    ÉLÈVE
                  </div>
                </div>
              ) : (
                <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                  <CameraOff className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">Caméra masquée</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[10px] flex items-center gap-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {studentName}
                {handRaised && <span className="bg-amber-500 text-slate-900 text-[8px] p-0.5 rounded font-bold">✋ Lever de main</span>}
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Chat, Alerts & Controls Panel */}
        <div className="lg:col-span-1 bg-slate-900/60 border-l border-slate-800 p-4 flex flex-col justify-between">
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-3">Mur de la classe</h3>
            
            {/* Panel chat log */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-slate-300">
              {classroomMessages.map((cm, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-850">
                  <p className="text-[10px] font-bold text-amber-500">{cm.sender}</p>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">{cm.text}</p>
                </div>
              ))}
            </div>

            {/* Room Chat Form */}
            <form onSubmit={handleSendChat} className="mt-3 flex gap-1.5 shadow">
              <input
                type="text"
                placeholder="Message à la classe..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 text-slate-100"
              />
              <button
                type="submit"
                id="send-classroom-chat-btn"
                className="px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                +
              </button>
            </form>
          </div>

          {/* Hard Bottom Action Controls */}
          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
            
            {/* Raise Hand State indicator */}
            <button
              id="lever-la-main-btn"
              onClick={() => setHandRaised(!handRaised)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                handRaised
                  ? 'bg-amber-500 text-slate-950 border border-amber-500'
                  : 'bg-slate-950/80 hover:bg-slate-800 select-none text-amber-500 border border-amber-500/20'
              }`}
            >
              <Hand className={`w-4 h-4 ${handRaised ? 'fill-current' : ''}`} />
              {handRaised ? 'Baisser la main (Signalé)' : 'Lever la Main ✋'}
            </button>

            {/* Media controllers */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="mic-mute-btn"
                onClick={() => setMicActive(!micActive)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  micActive
                    ? 'bg-slate-950 text-slate-300 border-slate-850 hover:bg-slate-800'
                    : 'bg-red-500/10 text-red-500 border-red-500/30'
                }`}
              >
                {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                {micActive ? 'Micro On' : 'Micro Off'}
              </button>

              <button
                id="cam-mute-btn"
                onClick={() => setCamActive(!camActive)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  camActive
                    ? 'bg-slate-950 text-slate-300 border-slate-850 hover:bg-slate-800'
                    : 'bg-red-500/10 text-red-500 border-red-500/30'
                }`}
              >
                {camActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                {camActive ? 'Cam On' : 'Cam Off'}
              </button>
            </div>

            <button
              id="record-toggle-btn"
              onClick={() => setIsRecording(!isRecording)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              {isRecording ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRecording ? 'Arrêter Enregistrement' : 'Enregistrer le Cours'}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
