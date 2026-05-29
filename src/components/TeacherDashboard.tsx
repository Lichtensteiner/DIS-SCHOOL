/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Plus, Wallet, FileText, UploadCloud, CheckCircle2, AlertCircle, Video, Eye, Send } from 'lucide-react';
import { LessonHomework, TeacherProfile } from '../types';

interface TeacherDashboardProps {
  teacherProfile: TeacherProfile;
  lessonsList: LessonHomework[];
  onAddNewHomework: (homeworkData: any) => void;
  onStartVisioRoom: (roomTitle?: string) => void;
  isMobileDeviceSimulator?: boolean;
}

export default function TeacherDashboard({
  teacherProfile,
  lessonsList,
  onAddNewHomework,
  onStartVisioRoom,
  isMobileDeviceSimulator = false,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'homework' | 'profile'>('wallet');
  const [mobileShowMenu, setMobileShowMenu] = useState(true);
  
  // Homework Creator State
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('Mathématiques');
  const [hwType, setHwType] = useState<'Quiz IA' | 'Devoir'>('Quiz IA');
  
  // Custom PDF upload state
  const [uploadedPDFName, setUploadedPDFName] = useState<string | null>(null);
  
  // Cashout / Virement State
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [cashoutPhone, setCashoutPhone] = useState(teacherProfile.phone);
  const [cashoutOperator, setCashoutOperator] = useState<'Airtel Money' | 'Moov Money'>('Airtel Money');
  const [virementSuccess, setVirementSuccess] = useState(false);

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    let mockQuestions = [];
    if (hwType === 'Quiz IA') {
      mockQuestions = [
        {
          question: 'Quelle est la valeur approchée du nombre Pi au centième près ?',
          options: ['3.14', '3.1416', '3.12', '3.18'],
          correctAnswer: '3.14'
        },
        {
          question: 'Dans la formule d&apos;aire d&apos;un disque S = Pi * R², R désigne :',
          options: ['Le rayon du disque', 'Le diamètre du disque', 'Le périmètre', 'Le volume'],
          correctAnswer: 'Le rayon du disque'
        }
      ];
    }

    onAddNewHomework({
      title: hwTitle,
      type: hwType,
      studentId: 'eleve-1',
      studentName: 'Jean-Daniel Mvezogo',
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.name,
      subject: hwSubject,
      questions: mockQuestions
    });

    setHwTitle('');
    alert('📝 Devoir assigné avec succès à Jean-Daniel !');
  };

  const handleCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashoutAmount || parseInt(cashoutAmount) <= 0) return;
    
    setVirementSuccess(true);
    setTimeout(() => {
      setVirementSuccess(false);
      teacherProfile.savedWallet -= parseInt(cashoutAmount);
      setCashoutAmount('');
    }, 3000);
  };

  const isMobileView = isMobileDeviceSimulator || (typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  if (isMobileView) {
    return (
      <div className="space-y-6 text-slate-100 select-none">
        
        {/* Header Profil Summary */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src={teacherProfile.photoUrl}
              alt={teacherProfile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/50"
            />
            <div>
              <h2 className="text-xs font-bold flex items-center gap-1">
                {teacherProfile.name}
                <span className="text-[7px] tracking-wider uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1 py-0.5 rounded">
                  Certifié
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Pôle : {teacherProfile.subjects.join(', ')}</p>
            </div>
          </div>

          <button
            id="teacher-start-class-btn-mob"
            onClick={() => onStartVisioRoom('TRIGONOMÉTRIE ET RAPPORTS DE THALÈS')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all w-full cursor-pointer"
          >
            <Video className="w-4 h-4" /> Lancer Classe Virtuelle
          </button>
        </div>

        {mobileShowMenu ? (
          <div className="space-y-4">
            <div className="px-1">
              <h3 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">📁 Menu Enseignant</h3>
              <p className="text-[10px] text-slate-500 mb-2">Gérez vos reversements et envoyez des quiz d&apos;élites :</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <button
                id="teacher-mob-card-wallet"
                onClick={() => {
                  setActiveTab('wallet');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Portefeuille ({teacherProfile.savedWallet.toLocaleString()} FCFA)</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Demande de reversement Airtel &amp; Moov Money</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

              <button
                id="teacher-mob-card-homework"
                onClick={() => {
                  setActiveTab('homework');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Assigner Devoir / Quiz</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Quiz réactif IA & les devoirs de français/maths</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

              <button
                id="teacher-mob-card-profile"
                onClick={() => {
                  setActiveTab('profile');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Diplômes &amp; Accréditations</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Label doré et pièces justificatives ENS/UOB</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Back to Teacher Hub Button */}
            <button
              onClick={() => setMobileShowMenu(true)}
              className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 hover:bg-slate-850 transition-all font-sans cursor-pointer w-fit"
            >
              ⬅️ Retour au Menu Prof
            </button>

            {/* Wallet subtab inside mobile context */}
            {activeTab === 'wallet' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wide">Solde disponible</span>
                  <h3 className="text-2xl font-extrabold font-mono text-amber-500 mt-1">
                    {teacherProfile.savedWallet.toLocaleString()} <span className="text-xs font-sans text-slate-400">FCFA</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-2">Revenus accumulés par heures de cours dispensées.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="font-bold text-xs tracking-wide text-slate-200 mb-4">Reversement Mobile Money</h3>
                  {virementSuccess ? (
                    <div className="text-center py-4 text-xs text-emerald-400 font-bold">Virement de {parseInt(cashoutAmount).toLocaleString()} FCFA initié !</div>
                  ) : (
                    <form onSubmit={handleCashoutSubmit} className="space-y-3 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-400 uppercase tracking-wider block">Montant (FCFA)</label>
                        <input
                          type="number"
                          max={teacherProfile.savedWallet}
                          min="1000"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono text-slate-200 focus:outline-none"
                          placeholder="Ex: 5000"
                          value={cashoutAmount}
                          onChange={(e) => setCashoutAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-400 uppercase tracking-wider block">Opérateur</label>
                        <select
                          value={cashoutOperator}
                          onChange={(e) => setCashoutOperator(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                        >
                          <option value="Airtel Money">Airtel Money</option>
                          <option value="Moov Money">Moov Money</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-lg transition-all"
                        disabled={teacherProfile.savedWallet === 0}
                      >
                        Valider reversement
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Homework creator subtab inside mobile context */}
            {activeTab === 'homework' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <h3 className="font-bold text-xs text-slate-200 mb-3 block">Assigner Devoir / Quiz</h3>
                  <form onSubmit={handleCreateAssignmentSubmit} className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 block uppercase">Intitulé</label>
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                        placeholder="Ex: Quiz verbes irréguliers"
                        value={hwTitle}
                        onChange={(e) => setHwTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 block uppercase">Matière</label>
                      <select
                        value={hwSubject}
                        onChange={(e) => setHwSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                      >
                        {teacherProfile.subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-lg transition-all">
                      Créer &amp; Assigner
                    </button>
                  </form>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h3 className="font-bold text-xs text-slate-200">Évaluations en cours</h3>
                  <div className="space-y-2">
                    {lessonsList.filter(l => l.teacherId === teacherProfile.id || l.teacherId === 'IA').map((l) => (
                      <div key={l.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex justify-between items-center text-[11px]">
                        <div>
                          <p className="font-bold text-slate-200">{l.title}</p>
                          <p className="text-[9px] text-slate-400">Élève: {l.studentName}</p>
                        </div>
                        <span className="text-[10px] text-amber-500 font-bold">{l.aiScore !== null ? `${l.aiScore}/20` : 'Saisie'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile upload verification subtab inside mobile context */}
            {activeTab === 'profile' && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-xs text-slate-250 uppercase tracking-widest font-mono">Portail d&apos;Accréditation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Transmettez une copie de vos diplômes ENS/UOB au format PDF pour débloquer votre badge gold Certifié.</p>
                <div className="p-5 border-2 border-dashed border-slate-800 bg-slate-950/80 rounded-xl text-center">
                  <UploadCloud className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">Diplome_ArmandNdong.pdf</p>
                  <button
                    type="button"
                    onClick={() => setUploadedPDFName('Diplome_ENS_CAPES_ArmandNdong.pdf')}
                    className="mt-3 px-3 py-1 bg-slate-900 border border-slate-850 rounded text-[10px] hover:bg-slate-850 text-slate-200"
                  >
                    Sélectionner Fichier
                  </button>
                </div>
                {uploadedPDFName && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-[10px] rounded text-center">
                    Chargé et prêt pour l&apos;ANINF.
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 select-none">
      
      {/* 1. Header Profil Summary */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img
            src={teacherProfile.photoUrl}
            alt={teacherProfile.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50"
          />
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {teacherProfile.name} 
              {teacherProfile.verified ? (
                <span className="inline-flex items-center text-[8px] tracking-wider uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Enseignant Certifié LDS
                </span>
              ) : (
                <span className="inline-flex items-center text-[8px] tracking-wider uppercase font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded">
                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> En attente validation
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">Pôle : <span className="text-slate-200">{teacherProfile.subjects.join(', ')}</span> &bull; Tarif : {teacherProfile.pricePerSession.toLocaleString()} FCFA / Séance</p>
          </div>
        </div>

        {/* Action class launcher */}
        <button
          id="teacher-start-class-btn"
          onClick={() => onStartVisioRoom('TRIGONOMÉTRIE ET RAPPORTS DE THALÈS')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all w-full md:w-auto justify-center cursor-pointer"
        >
          <Video className="w-4 h-4" /> Lancer Classe Virtuelle
        </button>
      </div>

      {/* Tab select bar */}
      <div className="border-b border-slate-800 flex gap-4 text-xs font-bold overflow-x-auto">
        {[
          { key: 'wallet', label: 'Portefeuille & Reversements' },
          { key: 'homework', label: 'Assigner Exercices / Quiz' },
          { key: 'profile', label: 'Diplômes & Profil LDS' }
        ].map((t) => (
          <button
            key={t.key}
            id={`teacher-tab-${t.key}`}
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

      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Earnings card widget */}
          <div className="lg:col-span-1 space-y-4">
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Wallet className="w-28 h-28 text-amber-500" />
              </div>
              
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wide">Solde disponible</span>
              <h3 className="text-3xl font-extrabold font-mono text-amber-500 mt-2">
                {teacherProfile.savedWallet.toLocaleString()} <span className="text-xs font-sans text-slate-400">FCFA</span>
              </h3>
              
              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-sans">
                💡 Vos revenus proviennent des heures dispensées avec validation du parent (déblocage d&apos;Escrow). Plafond USSD de 500,000 FCFA/virement appliqué selon l&apos;ANINF.
              </p>
            </div>

            {/* Simulated mini analytics */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-xs space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Répartition d&apos;activité</span>
              <div className="flex justify-between text-slate-350">
                <span>Séances effectuées (Total) :</span>
                <span className="font-bold text-slate-100">4 cours</span>
              </div>
              <div className="flex justify-between text-slate-350">
                <span>Retours favorables parents :</span>
                <span className="font-bold text-slate-100">100%</span>
              </div>
            </div>

          </div>

          {/* Virement Cashout money form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-2">Demander un reversement Mobile Money</h3>
            <p className="text-xs text-slate-400 mb-6">
              Le montant demandé sera versé directement sur votre compte Mobile Money Gabonais certifié.
            </p>

            {virementSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Virement en cours de traitement !</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Notre banque d&apos;épargne traite le reversement de {parseInt(cashoutAmount).toLocaleString()} FCFA vers votre compte {cashoutOperator}.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCashoutSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Montant du virement (FCFA)</label>
                    <input
                      id="cashout-amount-input"
                      type="number"
                      max={teacherProfile.savedWallet}
                      min="1000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="Ex: 10000"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Choisir Mode de virement</label>
                    <select
                      id="cashout-operator-select"
                      value={cashoutOperator}
                      onChange={(e) => setCashoutOperator(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Airtel Money">Airtel Money Gabon</option>
                      <option value="Moov Money">Moov Money Gabon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Numéro de virement associé</label>
                  <input
                    id="cashout-phone-input"
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="+241 077 45 89 12"
                    value={cashoutPhone}
                    onChange={(e) => setCashoutPhone(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  id="submit-cashout-btn"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex justify-center items-center"
                  disabled={teacherProfile.savedWallet === 0}
                >
                  Valider la demande de reversement
                </button>

              </form>
            )}
          </div>

        </div>
      )}

      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Homework Creator */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl h-fit">
            <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" /> Assigner Devoir / Quiz
            </h3>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4">
              
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Intitulé de l&apos;Évaluation</label>
                <input
                  id="assign-homework-title-input"
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Devoir de trigonométrie"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Matière liée</label>
                <select
                  id="assign-homework-subject-select"
                  value={hwSubject}
                  onChange={(e) => setHwSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {teacherProfile.subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Format de devoir</label>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <button
                    type="button"
                    onClick={() => setHwType('Quiz IA')}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hwType === 'Quiz IA' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-850'
                    }`}
                  >
                    Quiz Interactif IA
                  </button>
                  <button
                    type="button"
                    onClick={() => setHwType('Devoir')}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hwType === 'Devoir' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-850'
                    }`}
                  >
                    Devoir Rédigé Libre
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-assign-homework-btn"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 hover:text-slate-950 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Assigner Devoir
              </button>

            </form>
          </div>

          {/* Assigned lists */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h3 className="font-bold text-sm text-slate-200 mb-4">Devoirs en cours de traitement</h3>

            <div className="space-y-4">
              {lessonsList.filter(l => l.teacherId === teacherProfile.id || l.teacherId === 'IA').map((l) => (
                <div key={l.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-200">{l.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Sujet: {l.subject} &bull; Élève: {l.studentName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      l.status === 'Corrigé' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {l.status}
                    </span>
                    {l.aiScore !== null && <span className="font-mono font-bold text-slate-200">{l.aiScore}/20</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-4">Portail d&apos;Accréditation Pédagogique LDS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload form block */}
            <div className="space-y-4 text-xs font-sans">
              <p className="text-slate-400 leading-relaxed font-sans">
                Pour acquérir le label **LDS Certifié**, vous devez transmettre une pièce d&apos;identité nationale gabonaise ainsi que vos diplômes d&apos;enseignement supérieur en format PDF.
              </p>

              <div className="p-8 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-2xl bg-slate-950/80 text-center transition-all">
                <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="font-bold text-slate-300">Glisser-déposer votre Diplôme (PDF)</p>
                <p className="text-[10px] text-slate-500 mt-1">ENS Libreville, UOB, CAPES ou CAP-Collège accepté (Max 5Mo)</p>
                
                <input
                  id="pdf-credential-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedPDFName(file.name);
                    }
                  }}
                  ref={(input) => {
                    if (input) {
                      // Custom ref layout trigger
                    }
                  }}
                />
                
                <button
                  type="button"
                  id="credential-upload-dummy-trigger"
                  onClick={() => setUploadedPDFName('Diplome_ENS_CAPES_ArmandNdong.pdf')}
                  className="mt-4 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-[11px] font-mono border border-slate-850 cursor-pointer"
                >
                  Simuler Sélection de Fichier
                </button>
              </div>

              {uploadedPDFName && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-[11px] rounded-xl flex items-center justify-between">
                  <span className="truncate">{uploadedPDFName}</span>
                  <span className="font-bold">Chargé &amp; Prêt pour validation</span>
                </div>
              )}
            </div>

            {/* Accreditations requirements box */}
            <div className="bg-slate-950 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200">Avantages Enseignant Certifié LDS :</h4>
              <ul className="space-y-2 text-[11px] text-slate-400 list-disc pl-4">
                <li>Priorité sur la place de marché de Libreville, Owendo et Akanda.</li>
                <li>Label de confiance doré visible par tous les parents d&apos;élèves.</li>
                <li>Assurance de séquestre automatique (garantie d&apos;être payé après le cours).</li>
                <li>Commission réduite à 0% en phase pilote.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
