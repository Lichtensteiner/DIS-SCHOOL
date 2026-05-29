/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Send, Sparkles, Image, Mic, MicOff, AlertCircle, RefreshCw, User, GraduationCap, ArrowRight } from 'lucide-react';
import { LessonHomework } from '../types';

interface AICoachProps {
  onSuggestBooking: (subject: string) => void;
  studentName?: string;
  gradeLevel?: string;
  onNewQuiz?: (quiz: LessonHomework) => void;
}

export default function AICoach({
  onSuggestBooking,
  studentName = 'Jean-Daniel Mvezogo',
  gradeLevel = 'Troisième',
  onNewQuiz,
}: AICoachProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ia'; text: string; isFallback?: boolean }>>([
    {
      sender: 'ia',
      text: `### Salut ${studentName} ! 👋
Je suis ton **Tuteur IA DIS'SCHOOL**, toujours là pour t'expliquer n'importe quel cours du programme gabonais (Mathématiques, Sciences, Français, etc.).

*   **Pose-moi tes questions** ou décris une formule que tu as du mal à comprendre.
*   **Enregistre un vocal** en cliquant sur le micro.
*   **Envoie-moi tes énoncés** en cliquant sur l'icône de photo (OCR) !`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [difficultyFlag, setDifficultyFlag] = useState(false);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested Topics for Gabon Quick Launch
  const suggestions = [
    { label: 'Théorème de Thalès', subject: 'Mathématiques' },
    { label: 'Accord du participe passé', subject: 'Français' },
    { label: 'Calcul de vitesse moyenne', subject: 'Physique' },
    { label: 'Structure de la terre', subject: 'SVT' },
  ];

  const handleSend = async (textToSend: string, isOcr = false, base64Img: string | null = null) => {
    if (!textToSend.trim() && !base64Img) return;

    // Add user message
    const userMsg = { sender: 'user' as const, text: textToSend || '📄 [Image chargée pour analyse]' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let endpoint = '/api/gemini/explain';
      let payload: any = { topic: textToSend, gradeLevel };

      if (isOcr || base64Img) {
        endpoint = '/api/gemini/ocr';
        payload = {
          base64Image: base64Img,
          textProblem: textToSend,
          gradeLevel,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      // Check if difficulty is critical (simple rule: keywords matching struggles)
      const lowercaseText = textToSend.toLowerCase();
      if (
        lowercaseText.includes('rien compris') || 
        lowercaseText.includes('bloqué') || 
        lowercaseText.includes('dur') || 
        lowercaseText.includes('difficile') ||
        lowercaseText.includes('échec') ||
        isOcr
      ) {
        setDifficultyFlag(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: data.text || 'Je rencontre un petit problème pour répondre. Essaye encore !',
          isFallback: data.isFallback,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: 'Désolé, je rencontre une erreur de réseau. Veuillez réessayer d&apos;ici peu.',
        },
      ]);
    } finally {
      setLoading(false);
      setSimulatedImage(null);
    }
  };

  // Start micro simulation
  const toggleRecording = () => {
    if (isRecording) {
      // Stopped: Send a simulated transcription
      setIsRecording(false);
      setInput('Peux-tu m\'expliquer comment résoudre une équation du second degré ?');
    } else {
      setIsRecording(true);
      setInput('🎤 Enregistrement de votre voix en cours...');
    }
  };

  // Simulated image upload (select a textbook exercise case)
  const handleSimulatedImageSelect = (type: 'math' | 'physics') => {
    let dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    let dummyText = '';
    
    if (type === 'math') {
      dummyText = 'Résoudre dans R l\'équation x² - 5x + 6 = 0';
    } else {
      dummyText = 'Calculer la vitesse d\'un taxi parcourant Libreville - Akanda (15 km) en 30 minutes.';
    }

    setSimulatedImage(type);
    setInput(dummyText);
  };

  const handleGenerateQuiz = () => {
    if (!onNewQuiz) return;
    
    // Create an elegant simulated quiz from the current AI coach session
    const mockQuiz: LessonHomework = {
      id: `lesson-ia-${Date.now()}`,
      title: 'Auto-évaluation DIS\'SCHOOL - Trigonométrie & Thalès',
      type: 'Quiz IA',
      studentId: 'eleve-1',
      studentName,
      teacherId: 'IA',
      teacherName: 'Conseiller Scolaire IA LDS',
      subject: 'Mathématiques',
      aiScore: null,
      recommendations: null,
      status: 'Assigné',
      questions: [
        {
          question: 'Si le rapport d\'agrandissement de Thalès est k = 2, les longueurs sont :',
          options: ['Multipliées par 2', 'Multipliées par 4', 'Divisées par 2', 'Restent identiques'],
          correctAnswer: 'Multipliées par 2'
        },
        {
          question: 'Le cosinus d\'un angle aigu dans un triangle rectangle est le rapport du :',
          options: ['Côté adjacent sur l\'hypoténuse', 'Côté opposé sur l\'hypoténuse', 'Côté adjacent sur opposé', 'Hypoténuse sur opposé'],
          correctAnswer: 'Côté adjacent sur l\'hypoténuse'
        }
      ],
      createdAt: new Date().toISOString()
    };

    onNewQuiz(mockQuiz);
    alert('🎯 Un nouveau Quiz IA interactif vient d\'être généré pour Jean-Daniel dans ses devoirs !');
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl h-[600px] overflow-hidden select-none">
      
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Conseiller Scolaire LDS IA</h3>
            <p className="text-[10px] text-slate-400">Tuteur intelligent francophone disponible 24h/7</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Actif (Gabon)</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-100">
        
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {m.sender === 'ia' && (
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-850 text-slate-200 rounded-tl-none'
              }`}
            >
              {/* Parse Markdown representation roughly */}
              <div className="space-y-2 whitespace-pre-wrap">
                {m.text}
              </div>

              {m.isFallback && (
                <div className="mt-2 text-[10px] text-amber-400 font-mono italic">
                  💡 Mode simulation local pédagogique actif (ajoutez votre clé dans Secrets si vous souhaitez utiliser le modèle d&apos;IA connecté).
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center text-slate-350 shrink-0 border border-slate-750">
                <User className="w-4 h-4" />
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-850 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300">
              Le Coach IA analyse et rédige votre cours...
            </div>
          </div>
        )}

        {/* Suggestion alert for hiring localized cert teacher if they are struggling */}
        {difficultyFlag && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="mt-1 p-1 rounded bg-amber-500/10 text-amber-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-500">Difficultés répétées détectées</h4>
                <p className="text-xs text-slate-350 leading-relaxed max-w-lg">
                  La notion présente des défis. Nous vous conseillons de planifier un accompagnement d&apos;une heure à domicile ou en visio avec un enseignant certifié LDS basé à Akanda ou Libreville.
                </p>
              </div>
            </div>
            <button
              id="coach-recruit-btn"
              onClick={() => onSuggestBooking('Mathématiques')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all w-full md:w-auto justify-center cursor-pointer"
            >
              Voir les Profs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Suggested chips (Maths shortcuts) */}
      <div className="px-6 py-2 bg-slate-950/50 border-t border-slate-800/40 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap">
        <span className="text-slate-400 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> Raccourcis Gabon :
        </span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            id={`suggest-chip-${i}`}
            onClick={() => handleSend(s.label)}
            className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-white rounded-full transition-all text-xs cursor-pointer"
          >
            {s.label}
          </button>
        ))}
        {onNewQuiz && (
          <button
            id="générer-quiz-ia-btn"
            onClick={handleGenerateQuiz}
            className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:text-white rounded-full transition-all text-xs cursor-pointer"
          >
            ✨ Générer Devoir IA
          </button>
        )}
      </div>

      {/* Input zone */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        
        {/* Real OCR Worksheet Simulators */}
        <div className="flex gap-2 mb-3">
          <span className="text-[10px] text-slate-400 self-center">Simuler photo :</span>
          <button
            id="sim-ocr-maths-btn"
            onClick={() => handleSimulatedImageSelect('math')}
            className={`px-2 py-1 rounded text-[10px] border transition-all ${
              simulatedImage === 'math'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850'
            }`}
          >
            📐 Photo Énoncé Algebre
          </button>
          <button
            id="sim-ocr-physics-btn"
            onClick={() => handleSimulatedImageSelect('physics')}
            className={`px-2 py-1 rounded text-[10px] border transition-all ${
              simulatedImage === 'physics'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850'
            }`}
          >
            🚕 Photo Énoncé Physique
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input, !!simulatedImage);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-xl border transition-all ${
              isRecording
                ? 'bg-red-500 text-white border-red-500 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
            } cursor-pointer`}
            title="Saisie vocale Gabon"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            placeholder={isRecording ? 'Transcription vocale...' : 'Saisissez votre question d&apos;exercice scolaire...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="p-3 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-600 transition-all font-bold cursor-pointer flex items-center justify-center"
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
