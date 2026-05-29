/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Calendar, PlusCircle, BookOpen, Clock, Heart, MessageSquare, ChevronRight, CheckCircle, ShieldCheck, Landmark, RefreshCw } from 'lucide-react';
import { LessonHomework, VideoSession, EscrowTransaction, ChatMessage } from '../types';

interface ParentDashboardProps {
  lessonsList: LessonHomework[];
  transactionsList: EscrowTransaction[];
  sessionsList: VideoSession[];
  onOpenVirtualClass: (session: VideoSession) => void;
  onNavigateToMarketplace: (defaultSubject?: string) => void;
  onNavigateToAICoach: () => void;
  isMobileDeviceSimulator?: boolean;
}

export default function ParentDashboard({
  lessonsList,
  transactionsList,
  sessionsList,
  onOpenVirtualClass,
  onNavigateToMarketplace,
  onNavigateToAICoach,
  isMobileDeviceSimulator = false,
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'transactions' | 'chats'>('overview');
  const [mobileShowMenu, setMobileShowMenu] = useState(true);
  
  // Interactive Chat State
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { id: '1', senderId: 'teacher-2', senderName: 'Mme Rose Obone', senderRole: 'teacher', recipientId: 'parent-1', text: 'Bonjour, Jean-Daniel s\'est beaucoup appliqué aujourd\'hui. Nous avons révisé l\'accord du participe passé dans l\'œuvre L\'Enfant Noir. Il reste des blocages mineurs sur les exceptions.', createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
    { id: '2', senderId: 'parent-1', senderName: 'Martine Mvezogo', senderRole: 'parent', recipientId: 'teacher-2', text: 'Merci beaucoup Madame pour ce retour précieux. Est-ce qu\'il a des devoirs supplémentaires à réviser pour ce week-end ?', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: '3', senderId: 'teacher-2', senderName: 'Mme Rose Obone', senderRole: 'teacher', recipientId: 'parent-1', text: 'Oui, je lui ai assigné un exercice d\'auto-évaluation sur la plateforme. Il pourra le faire directement sur son espace élève avec l\'assistance du Coach IA.', createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString() }
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const [iaHelperResult, setIaHelperResult] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'parent-1',
      senderName: 'Martine Mvezogo',
      senderRole: 'parent',
      recipientId: 'teacher-2',
      text: newMessageText,
      createdAt: new Date().toISOString()
    };

    setChatLog((prev) => [...prev, newMsg]);
    setNewMessageText('');
    setIaHelperResult(null);
  };

  // Call Gemini Helper
  const handleCallIAHelper = async (actionType: 'summarize' | 'simplify' | 'translate') => {
    setIaLoading(true);
    setIaHelperResult(null);
    try {
      const response = await fetch('/api/gemini/chat-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatLog.map((c) => ({ author: c.senderName, text: c.text })),
          action: actionType
        })
      });

      const data = await response.json();
      setIaHelperResult(data.result);
    } catch (err) {
      console.error(err);
      setIaHelperResult('Oups, impossible de se connecter à l&apos;IA.');
    } finally {
      setIaLoading(false);
    }
  };

  const isMobileView = isMobileDeviceSimulator || (typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  if (isMobileView) {
    return (
      <div className="space-y-6 text-slate-100 select-none">
        
        {/* Header Student Picker Panel */}
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500 font-extrabold text-sm shrink-0">
              JD
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Martine Mvezogo <span className="text-[8px] bg-slate-800 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Parent</span>
              </h2>
              <p className="text-[10px] text-slate-400">Élève : <span className="text-slate-200 font-bold">Jean-Daniel (3ème)</span></p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="parent-ask-ia-btn-mob"
              onClick={onNavigateToAICoach}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer justify-center"
            >
              <Sparkles className="w-3.5 h-3.5" /> Poser question IA
            </button>
            <button
              id="parent-hire-teacher-btn-mob"
              onClick={() => onNavigateToMarketplace()}
              className="flex-1 px-3 py-2 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-850 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer justify-center"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Recruter Répétiteur
            </button>
          </div>
        </div>

        {mobileShowMenu ? (
          <div className="space-y-4">
            <div className="px-1">
              <h3 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">📁 Menu de Contrôle Parent</h3>
              <p className="text-[10px] text-slate-500 mb-2">Sélectionnez une section pour un suivi d&apos;élites :</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <button
                id="mob-card-overview"
                onClick={() => {
                  setActiveTab('overview');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Vue d&apos;ensemble &amp; Séances</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Calendrier des visioconférences actives</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

              <button
                id="mob-card-notes"
                onClick={() => {
                  setActiveTab('notes');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-500">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Moyenne de l&apos;élève (15.5/20)</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Auto-évaluations, quiz et bulletins scolaires</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

              <button
                id="mob-card-transactions"
                onClick={() => {
                  setActiveTab('transactions');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Paiements USSD en Escrow</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Suivi de consignations Airtel / Moov Money</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

              <button
                id="mob-card-chats"
                onClick={() => {
                  setActiveTab('chats');
                  setMobileShowMenu(false);
                }}
                className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/45 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-sky-500/15 text-sky-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500 transition-colors">Messagerie Répétiteurs &amp; IA</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Échanges scolaires &amp; avis pédagogique du bot</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono">&rarr;</span>
              </button>

            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Back to Parent Hub Button */}
            <button
              onClick={() => setMobileShowMenu(true)}
              className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 hover:bg-slate-850 transition-all font-sans cursor-pointer w-fit"
            >
              ⬅️ Retour au Menu Parent
            </button>

            {/* Render actual subtab inside mobile context */}
            {activeTab === 'overview' && (
              <div className="space-y-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1 mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" /> Séances planifiées
                </h3>
                <div className="space-y-3">
                  {sessionsList.filter(s => s.status === 'À venir').map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{s.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Prof: {s.teacherName} &bull; Heure : {new Date(s.startTime).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => onOpenVirtualClass(s)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer text-center"
                      >
                        Rejoindre Visio
                      </button>
                    </div>
                  ))}
                  {sessionsList.filter(s => s.status === 'À venir').length === 0 && (
                    <p className="text-[11px] text-slate-500 text-center py-4">Aucune séance planifiée pour le moment.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Carnet de notes : Jean-Daniel</h3>
                <div className="space-y-2.5">
                  {lessonsList.map((lesson) => (
                    <div key={lesson.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-100">{lesson.title}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{lesson.subject} &bull; Par {lesson.teacherName}</p>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-amber-500 shrink-0">
                        {lesson.aiScore !== null ? `${lesson.aiScore}/20` : 'En correction'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Trésorerie Escrow</h3>
                <div className="space-y-3">
                  {transactionsList.map((tx) => (
                    <div key={tx.id} className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-slate-100 text-[11px]">{tx.serviceDescription}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">ID: {tx.id} &bull; {tx.type}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                          tx.status === 'Escrow' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>{tx.status === 'Escrow' ? 'Séquestré' : 'Libéré'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] border-t border-slate-850 pt-2 text-slate-400">
                        <span>Bénéficiaire: {tx.teacherName}</span>
                        <span className="font-bold font-mono text-amber-500">{tx.amount.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'chats' && (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden h-[450px] flex flex-col justify-between">
                <div className="p-3 bg-slate-950 border-b border-slate-800">
                  <h4 className="font-bold text-xs text-slate-100">Discussions : Mme Rose Obone</h4>
                  <p className="text-[9px] text-amber-500 font-bold">Répétiteur Certifié </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                  {chatLog.map((c) => (
                    <div key={c.id} className={`flex ${c.senderId === 'parent-1' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl p-3 ${
                        c.senderId === 'parent-1'
                          ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                          : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
                      }`}>
                        {c.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-150 focus:outline-none focus:border-amber-500"
                    placeholder="Répondre..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                  />
                  <button type="submit" className="px-3 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all">
                    Envoyer
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 select-none">
      
      {/* 1. Header Student Picker Panel */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500 font-extrabold text-lg">
            JD
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Martine Mvezogo <span className="text-[10px] bg-slate-800 text-amber-500 px-2 py-0.5 rounded font-mono font-bold uppercase">Parent</span>
            </h2>
            <p className="text-xs text-slate-400">Élève suivi : <span className="text-slate-200 font-bold">Jean-Daniel Mvezogo (Classe de Troisième)</span></p>
          </div>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            id="parent-ask-ia-btn"
            onClick={onNavigateToAICoach}
            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer justify-center"
          >
            <Sparkles className="w-4 h-4" /> Poser question IA
          </button>
          
          <button
            id="parent-hire-teacher-btn"
            onClick={() => onNavigateToMarketplace()}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-850 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer justify-center"
          >
            <PlusCircle className="w-4 h-4" /> Recruter Répétiteur
          </button>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="border-b border-slate-800 flex gap-4 overflow-x-auto text-xs font-bold">
        {[
          { key: 'overview', label: 'Vue d\'ensemble' },
          { key: 'notes', label: 'Notes & Devoirs' },
          { key: 'transactions', label: 'Paiements USSD en Escrow' },
          { key: 'chats', label: 'Discussions Répétiteurs' }
        ].map((t) => (
          <button
            key={t.key}
            id={`parent-tab-${t.key}`}
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

      {/* Grid Content based on Active Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main left cols */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick stats rounded boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Note Moyenne Générale (IA)</span>
                    <h3 className="text-2xl font-bold font-mono text-amber-500 mt-2">15.5 / 20</h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Calculé sur la base de 4 quiz interactifs certifiés LDS.</p>
              </div>

              <div className="bg-slate-900 border border-slate-850/80 p-5 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Statut des fonds consignés</span>
                    <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-2">5,000 FCFA</h3>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Landmark className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-emerald-400 mt-3 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 1 transaction bloquée sous séquestre
                </p>
              </div>

            </div>

            {/* Upcoming Lesson Sessions */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Prochaines Séances planifiées
              </h3>

              <div className="space-y-4">
                {sessionsList.filter(s => s.status === 'À venir').map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{s.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Prof: <span className="text-slate-350">{s.teacherName}</span> &bull; Heure : {new Date(s.startTime).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      id={`join-session-btn-${s.id}`}
                      onClick={() => onOpenVirtualClass(s)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all w-full md:w-auto text-center cursor-pointer"
                    >
                      Rejoindre Visio
                    </button>
                  </div>
                ))}

                {sessionsList.filter(s => s.status === 'À venir').length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">Aucune séance planifiée de suite.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Col: Parent news & Gabon School Alert Feed */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-fit">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">Actualités éducatives</h3>
            
            <div className="space-y-4">
              
              <div className="space-y-1">
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded font-mono font-bold">Gabon - IPN</span>
                <h4 className="text-xs font-bold text-slate-200">Sortie officielle de nouvelles fiches récaps Beepc</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-0.5">
                  L&apos;Institut Pédagogique National libère les nouveaux sujets types corrigés pour la session 2026.
                </p>
              </div>

              <div className="h-px bg-slate-850"></div>

              <div className="space-y-1">
                <span className="text-[8px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">Avis de grève - Néant</span>
                <h4 className="text-xs font-bold text-slate-200">Continuité pédagogique assurée</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-0.5">
                  Les cours de répétitions et devoirs corrigés DIS&apos;SCHOOL restent opérationnels chaque soir de la semaine.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            Carnet de notes : Jean-Daniel
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono">
                  <th className="py-3">Matière / Évaluation</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Tuteur</th>
                  <th className="py-3">Date</th>
                  <th className="py-3 text-right">Note de l&apos;Élève</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-200">
                {lessonsList.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-950/20">
                    <td className="py-3.5">
                      <p className="font-bold">{lesson.title}</p>
                      <p className="text-[10px] text-slate-400">{lesson.subject}</p>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lesson.type === 'Quiz IA' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {lesson.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-350">{lesson.teacherName}</td>
                    <td className="py-3.5 text-slate-400">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-sm">
                      {lesson.aiScore !== null ? (
                        <span className={lesson.aiScore >= 12 ? 'text-emerald-400' : 'text-amber-500'}>
                          {lesson.aiScore} / 20
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">En correction</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase">
              Historique des transactions Mobile Money (Escrow)
            </h3>
            <span className="text-xs text-slate-400 font-mono tracking-tight shadow">Séquestre actif</span>
          </div>

          <div className="space-y-4">
            {transactionsList.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">{tx.serviceDescription}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      tx.status === 'Escrow' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {tx.status === 'Escrow' ? 'Séquestre' : 'Libéré'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID Transac : {tx.id} &bull; Opérateur : {tx.type} ({tx.phoneNumber})
                  </p>
                  <p className="text-[11px] text-slate-350">
                    Destinataire : <span className="font-bold text-slate-200">{tx.teacherName}</span>
                  </p>
                </div>

                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="text-sm font-bold font-mono text-amber-500">{tx.amount.toLocaleString()} FCFA</p>
                  <p className="text-[10px] text-slate-500 mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden h-[600px]">
          
          {/* Messages Feed drawer */}
          <div className="lg:col-span-2 flex flex-col justify-between h-full">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs">Mme Rose Obone</h4>
                <p className="text-[10px] text-emerald-400 font-bold">Répétiteur de Français Certifié LDS</p>
              </div>
            </div>

            {/* Chats Feed body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatLog.map((c) => (
                <div key={c.id} className={`flex gap-3.5 ${c.senderId === 'parent-1' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs ${
                    c.senderId === 'parent-1'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
                  }`}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                id="parent-chat-text-input"
                type="text"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="Rédiger votre réponse à l&apos;enseignant..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
              />
              <button
                type="submit"
                id="parent-chat-send-btn"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Envoyer
              </button>
            </form>
          </div>

          {/* Right 1 Col: Integrated Gemini "Aide IA" translation module */}
          <div className="bg-slate-950/40 p-5 border-l border-slate-800 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  Aide IA Intégrée LDS
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed leading-relaxed font-sans">
                Besoin de résumer le fil ou d&apos;adapter votre réponse ? Sollicitez l&apos;avis du robot conseiller.
              </p>

              {/* helper triggers */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  id="ia-btn-summarize"
                  onClick={() => handleCallIAHelper('summarize')}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10px] font-bold text-slate-200 rounded-xl transition-all cursor-pointer"
                  disabled={iaLoading}
                >
                  Résumer le fil
                </button>
                <button
                  id="ia-btn-simplify"
                  onClick={() => handleCallIAHelper('simplify')}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10px] font-bold text-slate-200 rounded-xl transition-all cursor-pointer"
                  disabled={iaLoading}
                >
                  Vulgariser
                </button>
                <button
                  id="ia-btn-translate"
                  onClick={() => handleCallIAHelper('translate')}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10px] font-bold text-slate-200 rounded-xl col-span-2 transition-all cursor-pointer"
                  disabled={iaLoading}
                >
                  Résumer + Salutations Dialectes
                </button>
              </div>

              {iaLoading && (
                <div className="flex gap-2 items-center py-4 justify-center text-xs text-amber-500/80 font-mono animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Le bot LDS formule...
                </div>
              )}

              {iaHelperResult && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mt-4 select-text">
                  <p className="text-[10px] font-bold text-amber-500 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Recommandation IA :
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{iaHelperResult}</p>
                </div>
              )}
            </div>

            <div className="text-[9px] text-slate-500 text-center">
              Aide IA utilise la modération pour exclure le langage inapproprié.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
