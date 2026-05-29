/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Award, CheckCircle2, Star, Plus, ShieldAlert, CreditCard, Landmark, Check } from 'lucide-react';
import { TeacherProfile } from '../types';

interface MarketplaceProps {
  teachersList: TeacherProfile[];
  onBookSuccess: (newTx: any) => void;
  selectedDefaultSubject?: string;
}

export default function Marketplace({
  teachersList,
  onBookSuccess,
  selectedDefaultSubject = ''
}: MarketplaceProps) {
  const [selectedSubject, setSelectedSubject] = useState(selectedDefaultSubject);
  const [selectedZone, setSelectedZone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout states
  const [bookingTeacher, setBookingTeacher] = useState<TeacherProfile | null>(null);
  const [operator, setOperator] = useState<'Airtel Money' | 'Moov Money'>('Airtel Money');
  const [mobilePhone, setMobilePhone] = useState('+241 077 45 89 12');
  const [checkingOut, setCheckingOut] = useState(false);
  const [successTx, setSuccessTx] = useState<any | null>(null);

  // Available filters in Gabon
  const subjects = ['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'Sciences de la Vie et de la Terre (SVT)', 'Histoire-Géographie'];
  const zones = ['Akanda', 'STFO', 'Libreville Centre', 'Owendo', 'Port-Gentil', 'Moanda'];

  // Match search criteria
  const filteredTeachers = teachersList.filter((teacher) => {
    const matchesSubject = selectedSubject === '' || teacher.subjects.includes(selectedSubject);
    const matchesZone = selectedZone === '' || teacher.zone === selectedZone;
    const matchesKeyword = searchQuery === '' || teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || teacher.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesZone && matchesKeyword;
  });

  const handlePayEscrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTeacher) return;

    setCheckingOut(true);
    try {
      // Send book transaction to full stack server
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bookingTeacher.pricePerSession,
          type: operator,
          teacherId: bookingTeacher.id,
          teacherName: bookingTeacher.name,
          parentId: 'parent-1',
          parentName: 'Martine Mvezogo',
          phoneNumber: mobilePhone,
          serviceDescription: `Cours particulier en ${bookingTeacher.subjects[0]} (${bookingTeacher.zone})`
        })
      });

      const newTx = await response.json();
      setSuccessTx(newTx);
      onBookSuccess(newTx);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la réservation sécurisée.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 select-none">
      
      {/* Search Header banner */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl">
        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          🧑‍🏫 Place de marché : Éducateurs Certifiés LDS
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tous nos enseignants transmettent leur extrait de casier judiciaire et diplômes au Pôle DIS&apos;SCHOOL pour authentification.
        </p>

        {/* Filters and Inputs row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Text input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              id="search-teacher-input"
              type="text"
              placeholder="Rechercher par nom, mot-clé ou lycée..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500"
            />
          </div>

          {/* Subject selector */}
          <select
            id="subject-filter-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">Toutes les matières Scolaires</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Zone Selector */}
          <select
            id="zone-filter-select"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">Toutes les zones (Gabon)</option>
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Teachers List Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-sm"
          >
            <div>
              {/* Profile card row header */}
              <div className="flex gap-4 items-start">
                <img
                  src={t.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/35 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-100 leading-snug">{t.name}</h3>
                    {t.verified && (
                      <span className="inline-flex items-center text-[8px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded px-1.5 py-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> LDS Certifié
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {t.zone} (Gabon)
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span className="font-bold font-mono text-slate-200">{t.rating}</span>
                  </div>
                </div>
              </div>

              {/* Bio & Description */}
              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans line-clamp-3">
                {t.bio}
              </p>

              {/* Subjects badges */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {t.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[9px] text-slate-300"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom pricing / actions block */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Tarif par heure</span>
                <span className="text-sm font-bold font-mono text-amber-500">
                  {t.pricePerSession.toLocaleString()} <span className="text-xs font-sans text-slate-400">FCFA</span>
                </span>
              </div>
              <button
                id={`book-btn-${t.id}`}
                onClick={() => {
                  setSuccessTx(null);
                  setBookingTeacher(t);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Réserver cours
              </button>
            </div>

          </div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <ShieldAlert className="w-10 h-10 text-amber-500/60 mx-auto mb-3" />
            <h4 className="text-slate-200 font-bold text-sm">Aucun enseignant ne correspond à ces filtres</h4>
            <p className="text-xs text-slate-500 mt-1">Essayez de retirer un filtre ou élargissez votre recherche.</p>
          </div>
        )}
      </div>

      {/* Airtel / Moov Money Escrow Payment Checkout modal */}
      {bookingTeacher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            
            <button
              id="close-checkout-modal"
              onClick={() => setBookingTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm bg-slate-950/50 p-2 rounded-full cursor-pointer h-8 w-8 flex items-center justify-center"
            >
              &times;
            </button>

            {!successTx ? (
              <div>
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <CreditCard className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Paiement Mobile Money Escrow</h3>
                    <p className="text-[10px] text-slate-400">Transaction sécurisée DIS&apos;SCHOOL Gabon</p>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850 space-y-2 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Répétiteur :</span>
                    <span className="font-bold text-slate-200">{bookingTeacher.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service :</span>
                    <span className="text-slate-200">1 Séance Particulière ({bookingTeacher.subjects[0]})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zone d&apos;intervention :</span>
                    <span className="text-slate-200">{bookingTeacher.zone}</span>
                  </div>
                  <div className="h-px bg-slate-800 my-2"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-300">Total à consigner :</span>
                    <span className="font-bold text-amber-500 font-mono">
                      {bookingTeacher.pricePerSession.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Operator selector */}
                <form onSubmit={handlePayEscrowSubmit} className="space-y-4">
                  
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Choisir votre opérateur mobile</label>
                    <div className="grid grid-cols-2 gap-3">
                      
                      <button
                        type="button"
                        id="choose-airtel-btn"
                        onClick={() => setOperator('Airtel Money')}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          operator === 'Airtel Money'
                            ? 'bg-red-600/10 border-red-500 text-red-500'
                            : 'bg-slate-950 border-slate-850 text-slate-400'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-red-500" />
                        Airtel Money
                      </button>

                      <button
                        type="button"
                        id="choose-moov-btn"
                        onClick={() => setOperator('Moov Money')}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          operator === 'Moov Money'
                            ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                            : 'bg-slate-950 border-slate-850 text-slate-400'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-blue-400" />
                        Moov Money
                      </button>

                    </div>
                  </div>

                  {/* Gabon phone number input */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Numéro de téléphone ({operator})</label>
                    <input
                      id="mobile-phone-escaped"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="+241 077 45 89 12"
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      required
                    />
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      💡 Un push de paiement USSD interactif sera simulé pour authentifier la transaction. 
                    </span>
                  </div>

                  {/* Warn about escrow */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-2 text-[10px] text-blue-300">
                    <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="leading-relaxed">
                      **Garantie Escrow DIS&apos;SCHOOL** : Les fonds restent bloqués par la plateforme et ne sont transférés sur le portefeuille de {bookingTeacher.name} qu&apos;après votre confirmation de fin de cours.
                    </p>
                  </div>

                  <button
                    type="submit"
                    id="submit-pay-escrow-final"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex justify-center items-center"
                    disabled={checkingOut}
                  >
                    {checkingOut ? 'Demande USSD envoyée...' : `Consigner ${bookingTeacher.pricePerSession.toLocaleString()} FCFA`}
                  </button>

                </form>
              </div>
            ) : (
              // Success Screen representation
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Paiement Escrow Consigné avec succès !</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    La transaction a bien été enregistrée pour {bookingTeacher.name}.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 font-mono text-[10px] space-y-1.5 text-left text-slate-350">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="text-slate-100 font-bold">{successTx.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut :</span>
                    <span className="text-amber-500 font-bold">ESCROW (BLOQUÉ)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant :</span>
                    <span className="text-slate-100">{successTx.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opérateur :</span>
                    <span className="text-slate-100">{successTx.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Téléphone :</span>
                    <span>{successTx.phoneNumber}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500">
                  Jean-Daniel recevra une notification automatique dans sa salle de cours virtuelle DIS&apos;SCHOOL pour démarrer la séance !
                </p>

                <button
                  id="tx-booking-done-close"
                  onClick={() => setBookingTeacher(null)}
                  className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
