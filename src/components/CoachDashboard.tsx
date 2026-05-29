/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Landmark, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  ChevronRight, 
  Bookmark,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  RotateCcw
} from 'lucide-react';
import { TeacherProfile, EscrowTransaction, IA_Alert, LessonHomework } from '../types';

interface CoachDashboardProps {
  teachersList: TeacherProfile[];
  transactionsList: EscrowTransaction[];
  alertsList: IA_Alert[];
  lessonsList: LessonHomework[];
  onVerifyTeacher: (id: string) => void;
  onReleaseTransactionEscrow: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onUpdateTeachersList?: (list: TeacherProfile[]) => void;
  onUpdateTransactionsList?: (list: EscrowTransaction[]) => void;
  onUpdateLessonsList?: (list: LessonHomework[]) => void;
  onUpdateAlertsList?: (list: IA_Alert[]) => void;
}

export default function CoachDashboard({
  teachersList,
  transactionsList,
  alertsList,
  lessonsList,
  onVerifyTeacher,
  onReleaseTransactionEscrow,
  onResolveAlert,
  onUpdateTeachersList,
  onUpdateTransactionsList,
  onUpdateLessonsList,
  onUpdateAlertsList,
}: CoachDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'admin_control' | 'verifications' | 'escrows' | 'alerts'>('analytics');
  
  // Real-time Supreme Admin Control States
  const [adminSubtab, setAdminSubtab] = useState<'teachers' | 'lessons' | 'transactions' | 'alerts'>('teachers');

  // Teacher Form State
  const [tName, setTName] = useState('');
  const [tSubjects, setTSubjects] = useState('');
  const [tZone, setTZone] = useState('Akanda');
  const [tDiploma, setTDiploma] = useState('');
  const [tWallet, setTWallet] = useState(0);
  const [tVerified, setTVerified] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Lesson Form State
  const [lTitle, setLTitle] = useState('');
  const [lType, setLType] = useState('Quiz IA');
  const [lSubject, setLSubject] = useState('Maths');
  const [lTeacherName, setLTeacherName] = useState('');
  const [lStatus, setLStatus] = useState('Assigné');
  const [lScore, setLScore] = useState(15);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Transaction Form State
  const [txAmount, setTxAmount] = useState(5000);
  const [txType, setTxType] = useState('Airtel Money');
  const [txStatus, setTxStatus] = useState('Escrow');
  const [txParentName, setTxParentName] = useState('');
  const [txTeacherName, setTxTeacherName] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Alert Form State
  const [aStudentName, setAStudentName] = useState('');
  const [aType, setAType] = useState('Faible Score');
  const [aMessage, setAMessage] = useState('');
  const [aSeverity, setASeverity] = useState('high');
  const [aStatus, setAStatus] = useState('non_resolu');
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);

  // --- CRUD Handlers ---

  // 1. Teachers
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return alert("Veuillez entrer un nom d'éducateur.");
    const fields = {
      name: tName,
      subjects: tSubjects.split(',').map(s => s.trim()).filter(Boolean),
      zone: tZone,
      diplomaName: tDiploma || "Diplôme de l'éducation nationale",
      diplomaUrl: '#',
      savedWallet: Number(tWallet),
      verified: tVerified,
      rating: 4.8,
      pricePerSession: 5000,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=150&h=150',
      bio: 'Enseignant accrédité par DIS\'SCHOOL pour cours à domicile et suivi personnalisé.',
      email: `${tName.toLowerCase().replace(/\s+/g, '')}@disschool.ga`,
      phone: '+241 077 00 00 00',
    };
    if (editingTeacherId) {
      const updated = teachersList.map(t => t.id === editingTeacherId ? { ...t, ...fields } : t);
      onUpdateTeachersList?.(updated);
      setEditingTeacherId(null);
    } else {
      const newTeacher: TeacherProfile = {
        id: `teacher-${Date.now()}`,
        ...fields
      };
      onUpdateTeachersList?.([...teachersList, newTeacher]);
    }
    resetTeacherForm();
  };
  const resetTeacherForm = () => {
    setTName('');
    setTSubjects('');
    setTZone('Akanda');
    setTDiploma('');
    setTWallet(0);
    setTVerified(false);
    setEditingTeacherId(null);
  };
  const startEditTeacher = (t: TeacherProfile) => {
    setTName(t.name);
    setTSubjects(t.subjects.join(', '));
    setTZone(t.zone);
    setTDiploma(t.diplomaName);
    setTWallet(t.savedWallet || 0);
    setTVerified(t.verified || false);
    setEditingTeacherId(t.id);
  };
  const handleDeleteTeacher = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet enseignant ?")) {
      onUpdateTeachersList?.(teachersList.filter(t => t.id !== id));
    }
  };

  // 2. Lessons
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lTitle.trim()) return alert("Veuillez entrer un titre de devoir/leçon.");
    const fields = {
      title: lTitle,
      type: lType as any,
      subject: lSubject,
      teacherName: lTeacherName || "Pr. Armand Ndong",
      status: lStatus as any,
      aiScore: lStatus === 'Corrigé' ? Number(lScore) : null,
      recommendations: lStatus === 'Corrigé' ? "Travail régulier recommandé de la part du tuteur." : null,
      createdAt: new Date().toISOString()
    };
    if (editingLessonId) {
      const updated = lessonsList.map(l => l.id === editingLessonId ? { ...l, ...fields } : l);
      onUpdateLessonsList?.(updated);
      setEditingLessonId(null);
    } else {
      const newLesson = {
        id: `lesson-${Date.now()}`,
        studentId: 'eleve-1',
        studentName: 'Jean-Daniel Mvezogo',
        ...fields
      };
      onUpdateLessonsList?.([newLesson as any, ...lessonsList]);
    }
    resetLessonForm();
  };
  const resetLessonForm = () => {
    setLTitle('');
    setLType('Quiz IA');
    setLSubject('Maths');
    setLTeacherName('');
    setLStatus('Assigné');
    setLScore(15);
    setEditingLessonId(null);
  };
  const startEditLesson = (l: any) => {
    setLTitle(l.title);
    setLType(l.type);
    setLSubject(l.subject);
    setLTeacherName(l.teacherName);
    setLStatus(l.status);
    setLScore(l.aiScore || 15);
    setEditingLessonId(l.id);
  };
  const handleDeleteLesson = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce devoir ?")) {
      onUpdateLessonsList?.(lessonsList.filter(l => l.id !== id));
    }
  };

  // 3. Transactions
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txParentName.trim() || !txDesc.trim() || !txTeacherName.trim()) return alert("Veuillez remplir les informations obligatoires.");
    const fields = {
      amount: Number(txAmount),
      type: txType as any,
      status: txStatus as any,
      parentName: txParentName,
      teacherName: txTeacherName,
      serviceDescription: txDesc,
      date: new Date().toISOString()
    };
    if (editingTxId) {
      const updated = transactionsList.map(t => t.id === editingTxId ? { ...t, ...fields } : t);
      onUpdateTransactionsList?.(updated);
      setEditingTxId(null);
    } else {
      const newTx = {
        id: `tx-${Date.now()}`,
        parentId: 'parent-1',
        phoneNumber: '+241 077 45 67 89',
        teacherId: 'teacher-1',
        ...fields
      };
      onUpdateTransactionsList?.([newTx as any, ...transactionsList]);
    }
    resetTxForm();
  };
  const resetTxForm = () => {
    setTxAmount(5000);
    setTxType('Airtel Money');
    setTxStatus('Escrow');
    setTxParentName('');
    setTxTeacherName('');
    setTxDesc('');
    setEditingTxId(null);
  };
  const startEditTx = (t: EscrowTransaction) => {
    setTxAmount(t.amount);
    setTxType(t.type);
    setTxStatus(t.status);
    setTxParentName(t.parentName);
    setTxTeacherName(t.teacherName);
    setTxDesc(t.serviceDescription);
    setEditingTxId(t.id);
  };
  const handleDeleteTx = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette transaction ?")) {
      onUpdateTransactionsList?.(transactionsList.filter(t => t.id !== id));
    }
  };

  // 4. Alerts
  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aStudentName.trim() || !aMessage.trim()) return alert("Veuillez remplir les informations de l'alerte.");
    const fields = {
      studentName: aStudentName,
      type: aType as any,
      message: aMessage,
      severity: aSeverity as any,
      status: aStatus as any,
      createdAt: new Date().toISOString()
    };
    if (editingAlertId) {
      const updated = alertsList.map(a => a.id === editingAlertId ? { ...a, ...fields } : a);
      onUpdateAlertsList?.(updated);
      setEditingAlertId(null);
    } else {
      const newAlert = {
        id: `alert-${Date.now()}`,
        studentId: 'eleve-1',
        ...fields
      };
      onUpdateAlertsList?.([newAlert as any, ...alertsList]);
    }
    resetAlertForm();
  };
  const resetAlertForm = () => {
    setAStudentName('');
    setAType('Faible Score');
    setAMessage('');
    setASeverity('high');
    setAStatus('non_resolu');
    setEditingAlertId(null);
  };
  const startEditAlert = (a: IA_Alert) => {
    setAStudentName(a.studentName);
    setAType(a.type);
    setAMessage(a.message);
    setASeverity(a.severity);
    setAStatus(a.status);
    setEditingAlertId(a.id);
  };
  const handleDeleteAlert = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette alerte ?")) {
      onUpdateAlertsList?.(alertsList.filter(a => a.id !== id));
    }
  };
  
  // Analytics State loaded from full-stack api
  const [analytics, setAnalytics] = useState<any>({
    totalRevenue: 17000,
    escrowHolding: 5000,
    activeStudents: 3,
    teachersOnline: 2,
    zonesCount: {
      'Akanda': 2,
      'STFO': 1,
      'Libreville Centre': 1,
      'Owendo': 1
    }
  });

  const [selectedZoneMap, setSelectedZoneMap] = useState<string | null>('Akanda');

  // Fetch true stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [teachersList, transactionsList]);

  return (
    <div className="space-y-6 text-slate-100 select-none font-sans">
      
      {/* KPI Top Widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Volume Trésorerie Gabon</span>
            <h3 className="text-xl font-extrabold font-mono text-amber-500 mt-1">
              {analytics.totalRevenue.toLocaleString()} <span className="text-xs font-sans text-slate-400">FCFA</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Fonds Séquestrés (Escrow)</span>
            <h3 className="text-xl font-extrabold font-mono text-blue-400 mt-1">
              {analytics.escrowHolding.toLocaleString()} <span className="text-xs font-sans text-slate-400">FCFA</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Élèves Actifs</span>
            <h3 className="text-xl font-extrabold font-mono text-indigo-400 mt-1">
              {analytics.activeStudents}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Éducateurs Vétérans</span>
            <h3 className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
              {analytics.teachersOnline}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Internal Nav Tab togglers */}
      <div className="border-b border-slate-800 flex gap-4 text-xs font-bold overflow-x-auto">
        {[
          { key: 'analytics', label: 'Suivi Géographique Gabon' },
          { key: 'admin_control', label: '⚡ Super-Contrôle Global (Temps Réel)' },
          { key: 'verifications', label: 'Dossiers Répétiteurs (' + teachersList.filter(t => !t.verified).length + ')' },
          { key: 'escrows', label: 'Validation Trésorerie Escrow' },
          { key: 'alerts', label: 'Alertes & Modération IA (' + alertsList.filter(a => a.status === 'non_resolu').length + ')' }
        ].map((t) => (
          <button
            key={t.key}
            id={`coach-tab-${t.key}`}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.key
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          
          {/* Analytical vector Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Demandes de soutien scolaire par zone (Gabon)</h3>
              <span className="text-[10px] text-slate-500">Cliquez sur une zone pour détails</span>
            </div>

            {/* Gabon Map SVG with interactive metrics */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center justify-center h-[350px] relative overflow-hidden">
              <svg viewBox="0 0 500 400" className="w-full h-full max-h-[320px]">
                {/* Simplified border outline of Gabon */}
                <path
                  d="M 50 150 C 130 50, 360 40, 420 120 C 450 180, 430 310, 360 380 C 260 390, 100 370, 70 280 C 40 230, 30 180, 50 150 Z"
                  fill="#1E293B"
                  stroke="#475569"
                  strokeWidth="2.5"
                />

                {/* Dots / Pins representing zones */}
                
                {/* 1. Libreville / Akanda */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedZoneMap('Akanda')}
                >
                  <circle cx="110" cy="140" r="10" fill="#D4AF37" className="animate-ping opacity-35" />
                  <circle
                    cx="110"
                    cy="140"
                    r="6"
                    fill={selectedZoneMap === 'Akanda' ? '#F59E0B' : '#D4AF37'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text x="125" y="144" fill="#FFFFFF" fontSize="10" fontWeight="bold">Estuaire (Akanda / Libreville)</text>
                </g>

                {/* 2. STFO / Owendo */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedZoneMap('STFO')}
                >
                  <circle cx="140" cy="190" r="10" fill="#38BDF8" className="animate-ping opacity-35" />
                  <circle
                    cx="140"
                    cy="190"
                    r="6"
                    fill={selectedZoneMap === 'STFO' ? '#0EA5E9' : '#38BDF8'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text x="155" y="194" fill="#FFFFFF" fontSize="10" fontWeight="bold">STFO / Owendo</text>
                </g>

                {/* 3. Port-Gentil (Ogooué-Maritime) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedZoneMap('Port-Gentil')}
                >
                  <circle
                    cx="65"
                    cy="250"
                    r="6"
                    fill={selectedZoneMap === 'Port-Gentil' ? '#0EA5E9' : '#38BDF8'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text x="80" y="254" fill="#E2E8F0" fontSize="9">Port-Gentil</text>
                </g>

                {/* 4. Moanda / Franceville (Haut-Ogooué) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedZoneMap('Moanda')}
                >
                  <circle
                    cx="380"
                    cy="300"
                    r="6"
                    fill={selectedZoneMap === 'Moanda' ? '#0EA5E9' : '#38BDF8'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text x="315" y="304" fill="#E2E8F0" fontSize="9">Moanda</text>
                </g>
              </svg>

              {/* Little map helper floating legend */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-[10px] space-y-1.5 font-mono text-slate-400">
                <div className="font-bold text-slate-200">Légende :</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Haute densité</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400"></span> Moyenne densité</div>
              </div>
            </div>
          </div>

          {/* Right Col: Zone details metrics */}
          <div className="bg-slate-950 p-5 rounded-2xl h-fit border border-slate-850/80">
            {selectedZoneMap ? (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2 items-center text-amber-500 font-bold">
                  <MapPin className="w-4 h-4" />
                  <h4>Secteur : {selectedZoneMap}</h4>
                </div>
                <div className="h-px bg-slate-800"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Nombre d&apos;Élèves inscrits :</span>
                    <span className="font-bold text-slate-200">{analytics.zonesCount[selectedZoneMap] || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Enseignants à proximité :</span>
                    <span className="font-bold text-slate-200">
                      {teachersList.filter(t => t.zone === selectedZoneMap).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Taux de satisfaction :</span>
                    <span className="font-bold text-slate-200 font-mono">98% (Certifié)</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl leading-relaxed text-[10px] text-slate-400">
                  💡 Les demandes de cours sur **{selectedZoneMap}** augmentent de 15% le week-end. Recruter des professeurs de Sciences Physiques supplémentaires est préconisé.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">Sélectionnez une zone sur la carte du Gabon pour afficher les indicateurs.</p>
            )}
          </div>

        </div>
      )}

      {activeTab === 'admin_control' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-amber-500 flex items-center gap-2">
                ⚡ Consôle d&apos;Administration Suprême DIS&apos;SCHOOL
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Contrôle absolu en temps réel sur toutes les entités de l&apos;application (Répétiteurs, Quiz/Leçons, Trésorerie Escrow, Alertes IA).
              </p>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'teachers', label: '🎓 Répétiteurs' },
                { id: 'lessons', label: '📝 Quiz & Devoirs' },
                { id: 'transactions', label: '💰 Trésorerie/Wallets' },
                { id: 'alerts', label: '🚨 Alertes & Modération' }
              ].map((sub) => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => {
                    setAdminSubtab(sub.id as any);
                    resetTeacherForm();
                    resetLessonForm();
                    resetTxForm();
                    resetAlertForm();
                  }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    adminSubtab === sub.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtab 1: TEACHERS */}
          {adminSubtab === 'teachers' && (
            <div className="space-y-6">
              {/* Form card */}
              <form onSubmit={handleSaveTeacher} className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {editingTeacherId ? 'Modifier un dossier de Répétiteur' : 'Ajouter un nouveau Répétiteur sur DIS\'SCHOOL'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nom Complet</label>
                    <input
                      type="text"
                      value={tName}
                      onChange={(e) => setTName(e.target.value)}
                      placeholder="Pr. Armand Ndong"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Matières (séparées par virgule)</label>
                    <input
                      type="text"
                      value={tSubjects}
                      onChange={(e) => setTSubjects(e.target.value)}
                      placeholder="Mathématiques, Sciences Physiques"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Zone d&apos;intervention</label>
                    <select
                      value={tZone}
                      onChange={(e) => setTZone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="Akanda">Akanda</option>
                      <option value="STFO">STFO / Soduco</option>
                      <option value="Libreville Centre">Libreville Centre</option>
                      <option value="Owendo">Owendo</option>
                      <option value="Port-Gentil">Port-Gentil</option>
                      <option value="Franceville">Franceville</option>
                      <option value="Moanda">Moanda</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Diplôme / Justificatif</label>
                    <input
                      type="text"
                      value={tDiploma}
                      onChange={(e) => setTDiploma(e.target.value)}
                      placeholder="Master ENS - Certificat de scolarité"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Solde Compte Wallet (FCFA)</label>
                    <input
                      type="number"
                      value={tWallet}
                      onChange={(e) => setTWallet(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tVerified}
                        onChange={(e) => setTVerified(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      />
                      <span>Accrédité &amp; Certifié LDS Gabon</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetTeacherForm}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    {editingTeacherId ? 'Enregistrer les modifications' : 'Créer le Répétiteur'}
                  </button>
                </div>
              </form>

              {/* Table / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Liste active des instructeurs ({teachersList.length})</h4>
                <div className="grid grid-cols-1 gap-3">
                  {teachersList.map((t) => (
                    <div key={t.id} className="p-4 bg-slate-950 border border-slate-850/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-100 text-sm">{t.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                            t.verified 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {t.verified ? 'CERTIFIÉ LDS' : 'NON CERTIFIÉ'}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">Zone : <span className="font-semibold text-slate-200">{t.zone}</span> &bull; Spécialités : {t.subjects.join(', ')}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Dossier : {t.diplomaName} &bull; Solde : {t.savedWallet?.toLocaleString() || 0} FCFA</p>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => startEditTeacher(t)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="p-2 bg-slate-900 hover:bg-red-950/40 text-red-400 border border-slate-800 hover:border-red-500/35 rounded-xl transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab 2: LESSONS */}
          {adminSubtab === 'lessons' && (
            <div className="space-y-6">
              {/* Form card */}
              <form onSubmit={handleSaveLesson} className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {editingLessonId ? 'Modifier un Devoir / Quiz' : 'Ajouter un nouveau Devoir ou Quiz Pédagogique'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Titre de l&apos;Évaluation</label>
                    <input
                      type="text"
                      value={lTitle}
                      onChange={(e) => setLTitle(e.target.value)}
                      placeholder="Exercices d'application Trigonométrie"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Type de soutien</label>
                    <select
                      value={lType}
                      onChange={(e) => setLType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="Quiz IA">Quiz IA (Interactif Robotisé)</option>
                      <option value="Devoir">Devoir Écrit standard</option>
                      <option value="Explication">Fiche Explication de Cours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Matière</label>
                    <input
                      type="text"
                      value={lSubject}
                      onChange={(e) => setLSubject(e.target.value)}
                      placeholder="Mathématiques, SVT, Français"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nom de l&apos;enseignant rattaché</label>
                    <input
                      type="text"
                      value={lTeacherName}
                      onChange={(e) => setLTeacherName(e.target.value)}
                      placeholder="M. Roger Ondo"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Statut initial</label>
                    <select
                      value={lStatus}
                      onChange={(e) => setLStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="Assigné">Assigné (En attente d&apos;élève)</option>
                      <option value="Corrigé">Corrigé (Notation AI &amp; Feedback)</option>
                    </select>
                  </div>

                  {lStatus === 'Corrigé' && (
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Score d&apos;Évaluation IA /20</label>
                      <input
                        type="number"
                        max="20"
                        min="0"
                        value={lScore}
                        onChange={(e) => setLScore(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetLessonForm}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    {editingLessonId ? 'Enregistrer les modifications' : 'Diffuser l\'évaluation'}
                  </button>
                </div>
              </form>

              {/* Table / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Évaluations enregistrées ({lessonsList.length})</h4>
                <div className="grid grid-cols-1 gap-3">
                  {lessonsList.map((l) => (
                    <div key={l.id} className="p-4 bg-slate-950 border border-slate-850/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-100 text-sm">{l.title}</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-amber-500 font-mono uppercase">{l.type}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                            l.status === 'Corrigé' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>{l.status}</span>
                        </div>
                        <p className="text-slate-400 mt-1">Matière : <span className="text-slate-200 font-semibold">{l.subject}</span> &bull; Enseignant principal : {l.teacherName}</p>
                        {l.aiScore !== null && l.aiScore !== undefined && (
                          <p className="text-[10px] text-amber-500 font-mono mt-1">⭐ Score d&apos;Évaluation : {l.aiScore}/20</p>
                        )}
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => startEditLesson(l)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(l.id)}
                          className="p-2 bg-slate-900 hover:bg-red-950/40 text-red-400 border border-slate-800 hover:border-red-500/35 rounded-xl transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab 3: TRANSACTIONS */}
          {adminSubtab === 'transactions' && (
            <div className="space-y-6">
              {/* Form card */}
              <form onSubmit={handleSaveTransaction} className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {editingTxId ? 'Modifier un flux Trésorerie Escrow' : 'Saisir un dépôt de Trésorerie (Airtel/Moov)'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Montant global (FCFA)</label>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(Number(e.target.value))}
                      placeholder="12000"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Opérateur de Paiement</label>
                    <select
                      value={txType}
                      onChange={(e) => setTxType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="Airtel Money">Airtel Money Gabon</option>
                      <option value="Moov Money">Moov Money (Gabon Telecom)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Statut Escrow</label>
                    <select
                      value={txStatus}
                      onChange={(e) => setTxStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="Escrow">Séquestré en attente (Escrow)</option>
                      <option value="Libéré">Libéré directement au répétiteur (Released)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nom du Parent dépositaire</label>
                    <input
                      type="text"
                      value={txParentName}
                      onChange={(e) => setTxParentName(e.target.value)}
                      placeholder="Mme Bignoumba"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Bénéficiaire Répétiteur</label>
                    <input
                      type="text"
                      value={txTeacherName}
                      onChange={(e) => setTxTeacherName(e.target.value)}
                      placeholder="Pr. Armand Ndong"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Description des prestations</label>
                    <input
                      type="text"
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      placeholder="Abonnement Mensuel Physique - 10h"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetTxForm}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    {editingTxId ? 'Confirmer l\'édition financière' : 'Prendre acte du dépôt'}
                  </button>
                </div>
              </form>

              {/* Table / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Flux financiers ({transactionsList.length})</h4>
                <div className="grid grid-cols-1 gap-3">
                  {transactionsList.map((tx) => (
                    <div key={tx.id} className="p-4 bg-slate-950 border border-slate-850/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-500 text-sm">{tx.amount.toLocaleString()} FCFA</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-300 font-mono uppercase">{tx.type}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                            tx.status === 'Escrow' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>{tx.status}</span>
                        </div>
                        <p className="text-slate-450 mt-1">Prestation : <span className="text-slate-200 font-semibold">{tx.serviceDescription}</span></p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Parent : {tx.parentName} &bull; Répétiteur : {tx.teacherName}</p>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => startEditTx(tx)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTx(tx.id)}
                          className="p-2 bg-slate-900 hover:bg-red-950/40 text-red-400 border border-slate-800 hover:border-red-500/35 rounded-xl transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab 4: ALERTS */}
          {adminSubtab === 'alerts' && (
            <div className="space-y-6">
              {/* Form card */}
              <form onSubmit={handleSaveAlert} className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {editingAlertId ? 'Modifier le signalement' : 'Créer une alerte pédagogique ou de modération'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nom de l&apos;Élève ciblé</label>
                    <input
                      type="text"
                      value={aStudentName}
                      onChange={(e) => setAStudentName(e.target.value)}
                      placeholder="Marc-Aurel"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Type d&apos;Alerte IA</label>
                    <select
                      value={aType}
                      onChange={(e) => setAType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="Alerte Décrochage">Alerte Décrochage (Baisse de régime)</option>
                      <option value="Faible Score">Faible Score (Difficultés récurrentes)</option>
                      <option value="Langage Inapproprié">Langage Inapproprié (Modération chat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Gravité</label>
                    <select
                      value={aSeverity}
                      onChange={(e) => setASeverity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="low">Faible (Notification simple)</option>
                      <option value="medium">Modérée (Attention requise)</option>
                      <option value="high">Critique (Action requise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Message d&apos;alerte généré</label>
                  <textarea
                    value={aMessage}
                    onChange={(e) => setAMessage(e.target.value)}
                    placeholder="Baisse de régime constatée sur les quiz de fractions mathématiques."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans h-20 resize-none animate-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Statut</label>
                    <select
                      value={aStatus}
                      onChange={(e) => setAStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                    >
                      <option value="non_resolu">En cours (Non résolu)</option>
                      <option value="resolu">Résolu (Pris en charge)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetAlertForm}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    {editingAlertId ? 'Enregistrer les modifications' : 'Créer l\'alerte'}
                  </button>
                </div>
              </form>

              {/* Table / List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Alertes de modération actives ({alertsList.length})</h4>
                <div className="grid grid-cols-1 gap-3">
                  {alertsList.map((a) => (
                    <div key={a.id} className="p-4 bg-slate-950 border border-slate-850/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div className="flex gap-3">
                        <div className="p-2 rounded bg-red-500/10 text-red-500 shrink-0 select-none h-fit">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-100 text-sm">{a.studentName}</span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-300 font-mono uppercase">{a.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                              a.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>{a.severity}</span>
                            {a.status === 'resolu' && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 uppercase font-mono font-bold">RÉSOLU</span>
                            )}
                          </div>
                          <p className="text-slate-400 mt-1.5 italic font-sans">{a.message}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => startEditAlert(a)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(a.id)}
                          className="p-2 bg-slate-900 hover:bg-red-950/40 text-red-400 border border-slate-800 hover:border-red-500/35 rounded-xl transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            Demandes d&apos;accréditation Répétiteur en attente
          </h3>

          <div className="space-y-4">
             {teachersList.filter(t => !t.verified).map((t) => (
               <div key={t.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans">
                 <div>
                   <h4 className="font-bold text-slate-200 text-sm">{t.name}</h4>
                   <p className="text-slate-400 mt-1">Matières : {t.subjects.join(', ')} &bull; Zone intervention : {t.zone}</p>
                   <p className="text-[11px] text-amber-500/80 font-mono mt-2 underline flex items-center gap-1.5 cursor-pointer">
                     📄 Voir justificatif : {t.diplomaName}
                   </p>
                 </div>

                 <div className="flex gap-2 w-full md:w-auto">
                   <button
                     id={`reject-teacher-${t.id}`}
                     className="flex-1 md:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-400 hover:text-red-500 font-bold rounded-xl transition-all cursor-pointer text-center"
                   >
                     Rejeter
                   </button>
                   <button
                     id={`approve-teacher-${t.id}`}
                     onClick={() => onVerifyTeacher(t.id)}
                     className="flex-1 md:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all cursor-pointer text-center"
                   >
                     Approuver LDS
                   </button>
                 </div>
               </div>
             ))}

             {teachersList.filter(t => !t.verified).length === 0 && (
               <p className="text-xs text-slate-500 text-center py-8">Aucun dossier de répétiteur en attente de vérification.</p>
             )}
          </div>
        </div>
      )}

      {activeTab === 'escrows' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            Traitement de la Trésorerie Séquestre (Escrow)
          </h3>

          <div className="space-y-4">
            {transactionsList.filter(tx => tx.status === 'Escrow').map((tx) => (
              <div key={tx.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{tx.serviceDescription}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-600/10 text-red-500 border border-red-500/30 uppercase font-mono font-bold">Séquestré</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">ID Transac: {tx.id} &bull; Par Parent : {tx.parentName}</p>
                  <p className="text-slate-350 mt-1">Destinataire répétiteur : <span className="font-bold text-emerald-400">{tx.teacherName}</span></p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right font-mono text-sm leading-snug">
                    <p className="font-extrabold text-amber-500">{tx.amount.toLocaleString()} FCFA</p>
                    <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>

                  <button
                    id={`release-escrow-btn-${tx.id}`}
                    onClick={() => onReleaseTransactionEscrow(tx.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Débloquer Wallet
                  </button>
                </div>
              </div>
            ))}

            {transactionsList.filter(tx => tx.status === 'Escrow').length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">Aucun fonds d&apos;escrow en attente de déblocage.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            Alertes Scolaires &amp; Contenus non sollicités (Détéctions IA)
          </h3>

          <div className="space-y-4">
             {alertsList.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-start md:items-center flex-col md:flex-row gap-4 text-xs font-sans">
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded bg-red-500/10 text-red-500 mt-1 select-none shrink-0 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{a.studentName}</span>
                        <span className="font-mono text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">{a.type}</span>
                        {a.status === 'resolu' && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">RÉSOLU</span>}
                      </div>
                      <p className="text-slate-400 leading-relaxed font-sans mt-1 max-w-xl">{a.message}</p>
                    </div>
                  </div>

                  {a.status === 'non_resolu' && (
                    <button
                      id={`resolve-alert-btn-${a.id}`}
                      onClick={() => onResolveAlert(a.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs transition-all tracking-wide cursor-pointer w-full md:w-auto text-center"
                    >
                      Marquer résolu
                    </button>
                  )}
                </div>
             ))}

             {alertsList.length === 0 && (
               <p className="text-xs text-slate-500 text-center py-8">Aucun signalement pédagogique ou modération relevé par l&apos;IA.</p>
             )}
          </div>
        </div>
      )}

    </div>
  );
}
