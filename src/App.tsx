import React, { useState, useEffect } from 'react';
import LDSLogo from './components/LDSLogo';
import Onboarding from './components/Onboarding';
import AICoach from './components/AICoach';
import VirtualClassroom from './components/VirtualClassroom';
import Marketplace from './components/Marketplace';
import ParentDashboard from './components/ParentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CoachDashboard from './components/CoachDashboard';

import { UserRole, TeacherProfile, LessonHomework, VideoSession, EscrowTransaction, IA_Alert, UserProfile } from './types';
import { Sparkles, BookOpen, GraduationCap, Clock, LogOut } from 'lucide-react';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  seedDatabaseIfEmpty,
  initialTeachers,
  initialLessons,
  initialSessions,
  initialTransactions,
  initialAlerts
} from './lib/firebaseSeeder';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  
  // Real-time clock for top header representation
  const [gabonTime, setGabonTime] = useState<string>('');

  // Sandbox Simulator mode state when DB rules are restricted
  const [isUsingSandbox, setIsUsingSandbox] = useState<boolean>(() => {
    return localStorage.getItem('lds_use_sandbox') === 'true';
  });

  // Core global data arrays
  const [teachersList, setTeachersList] = useState<TeacherProfile[]>(() => {
    const stored = localStorage.getItem('lds_teachers');
    return stored ? JSON.parse(stored) : initialTeachers;
  });
  const [transactionsList, setTransactionsList] = useState<EscrowTransaction[]>(() => {
    const stored = localStorage.getItem('lds_transactions');
    return stored ? JSON.parse(stored) : initialTransactions;
  });
  const [lessonsList, setLessonsList] = useState<LessonHomework[]>(() => {
    const stored = localStorage.getItem('lds_lessons');
    return stored ? JSON.parse(stored) : initialLessons;
  });
  const [sessionsList, setSessionsList] = useState<VideoSession[]>(() => {
    const stored = localStorage.getItem('lds_sessions');
    return stored ? JSON.parse(stored) : initialSessions;
  });
  const [alertsList, setAlertsList] = useState<IA_Alert[]>(() => {
    const stored = localStorage.getItem('lds_alerts');
    return stored ? JSON.parse(stored) : initialAlerts;
  });

  // Helper storage synchronization functions
  const updateTeachersList = (val: TeacherProfile[]) => {
    setTeachersList(val);
    localStorage.setItem('lds_teachers', JSON.stringify(val));
  };
  const updateTransactionsList = (val: EscrowTransaction[]) => {
    setTransactionsList(val);
    localStorage.setItem('lds_transactions', JSON.stringify(val));
  };
  const updateLessonsList = (val: LessonHomework[]) => {
    setLessonsList(val);
    localStorage.setItem('lds_lessons', JSON.stringify(val));
  };
  const updateSessionsList = (val: VideoSession[]) => {
    setSessionsList(val);
    localStorage.setItem('lds_sessions', JSON.stringify(val));
  };
  const updateAlertsList = (val: IA_Alert[]) => {
    setAlertsList(val);
    localStorage.setItem('lds_alerts', JSON.stringify(val));
  };

  // Sub-Navigation within Student View
  const [studentTab, setStudentTab] = useState<'ai_coach' | 'homeworks' | 'classroom'>('ai_coach');
  const [studentMobileShowMenu, setStudentMobileShowMenu] = useState<boolean>(true);

  // Mobile Device Simulator and Marketplace modal states
  const [isMobileSimulatorActive, setIsMobileSimulatorActive] = useState<boolean>(false);
  const [isMarketplaceActiveOnMobile, setIsMarketplaceActiveOnMobile] = useState<boolean>(false);

  // Interactive Quiz Active state
  const [activeQuizToSolve, setActiveQuizToSolve] = useState<LessonHomework | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: string }>({});

  // Active Live Classroom Session Screen
  const [activeVisioSession, setActiveVisioSession] = useState<VideoSession | null>(null);

  // Suggested marketplace filter from AI coach
  const [suggestedSubjectMarketplace, setSuggestedSubjectMarketplace] = useState<string>('');

  useEffect(() => {
    // 2. Setup Firebase Authentication listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let profile: UserProfile;
          try {
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              profile = userSnap.data() as UserProfile;
            } else {
              // Profile fallback
              profile = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Élève Gabonais',
                email: firebaseUser.email || '',
                role: 'élève',
                phone: '+241 077 00 00 00',
                zone: 'Akanda'
              };
              try {
                await setDoc(userDocRef, profile);
              } catch (writeErr) {
                console.warn("Could not write fallback profile to Firestore, proceeding with local profile state.", writeErr);
              }
            }
          } catch (readErr) {
            console.warn("Firestore permissions blocked reading user profile, using local/provider information.", readErr);
            // Guess role based on user email or displayName if login was demo or standard
            let guessedRole: UserRole = 'élève';
            if (firebaseUser.email?.includes('admin')) {
              guessedRole = 'coach_admin';
            } else if (firebaseUser.email?.includes('prof') || firebaseUser.email?.includes('teacher') || firebaseUser.email?.includes('eleve-teacher')) {
              guessedRole = 'teacher';
            } else if (firebaseUser.email?.includes('parent')) {
              guessedRole = 'parent';
            }

            profile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Élève Gabonais',
              email: firebaseUser.email || '',
              role: guessedRole,
              phone: '+241 077 00 00 00',
              zone: 'Akanda'
            };
          }
          setCurrentUser(profile);
          setRole(profile.role);
        } catch (err) {
          console.error("Error reading auth profile document", err);
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
    });

    // 3. Gabon real-time top-header clock
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const gabon = new Date(utc + 3600000 * 1); // Gabon UTC+1
      setGabonTime(gabon.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' Libreville');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      unsubscribeAuth();
      clearInterval(interval);
    };
  }, []);

  // 4. Setup real-time Firebase collection listeners gated by active authentication state
  useEffect(() => {
    if (!currentUser) {
      // Clean up lists on sign out
      setTeachersList([]);
      setTransactionsList([]);
      setLessonsList([]);
      setSessionsList([]);
      setAlertsList([]);
      return;
    }

    if (isUsingSandbox) {
      // Load current local states to make sure they match
      setTeachersList(JSON.parse(localStorage.getItem('lds_teachers') || 'null') || initialTeachers);
      setTransactionsList(JSON.parse(localStorage.getItem('lds_transactions') || 'null') || initialTransactions);
      setLessonsList(JSON.parse(localStorage.getItem('lds_lessons') || 'null') || initialLessons);
      setSessionsList(JSON.parse(localStorage.getItem('lds_sessions') || 'null') || initialSessions);
      setAlertsList(JSON.parse(localStorage.getItem('lds_alerts') || 'null') || initialAlerts);
      return;
    }

    // Secure database seeding on successful authentication
    seedDatabaseIfEmpty();

    const unsubscribeTeachers = onSnapshot(collection(db, 'teachers'), (snap) => {
      const list: TeacherProfile[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as TeacherProfile);
      });
      updateTeachersList(list);
    }, (err) => {
      setIsUsingSandbox(true);
      localStorage.setItem('lds_use_sandbox', 'true');
      updateTeachersList(initialTeachers);
      try {
        handleFirestoreError(err, OperationType.GET, 'teachers');
      } catch (logErr) {
        console.warn("Falling back to local teachers simulation:", logErr);
      }
    });

    const unsubscribeTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      const list: EscrowTransaction[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as EscrowTransaction);
      });
      updateTransactionsList(list);
    }, (err) => {
      setIsUsingSandbox(true);
      localStorage.setItem('lds_use_sandbox', 'true');
      updateTransactionsList(initialTransactions);
      try {
        handleFirestoreError(err, OperationType.GET, 'transactions');
      } catch (logErr) {
        console.warn("Falling back to local transactions simulation:", logErr);
      }
    });

    const unsubscribeLessons = onSnapshot(collection(db, 'lessons'), (snap) => {
      const list: LessonHomework[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as LessonHomework);
      });
      // Sort newest homeworks first
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      updateLessonsList(list);
    }, (err) => {
      setIsUsingSandbox(true);
      localStorage.setItem('lds_use_sandbox', 'true');
      updateLessonsList(initialLessons);
      try {
        handleFirestoreError(err, OperationType.GET, 'lessons');
      } catch (logErr) {
        console.warn("Falling back to local lessons simulation:", logErr);
      }
    });

    const unsubscribeSessions = onSnapshot(collection(db, 'sessions'), (snap) => {
      const list: VideoSession[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as VideoSession);
      });
      updateSessionsList(list);
    }, (err) => {
      setIsUsingSandbox(true);
      localStorage.setItem('lds_use_sandbox', 'true');
      updateSessionsList(initialSessions);
      try {
        handleFirestoreError(err, OperationType.GET, 'sessions');
      } catch (logErr) {
        console.warn("Falling back to local sessions simulation:", logErr);
      }
    });

    const unsubscribeAlerts = onSnapshot(collection(db, 'alerts'), (snap) => {
      const list: IA_Alert[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as IA_Alert);
      });
      updateAlertsList(list);
    }, (err) => {
      setIsUsingSandbox(true);
      localStorage.setItem('lds_use_sandbox', 'true');
      updateAlertsList(initialAlerts);
      try {
        handleFirestoreError(err, OperationType.GET, 'alerts');
      } catch (logErr) {
        console.warn("Falling back to local alerts simulation:", logErr);
      }
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeTransactions();
      unsubscribeLessons();
      unsubscribeSessions();
      unsubscribeAlerts();
    };
  }, [currentUser, isUsingSandbox]);

  // Action logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setRole(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Add new transaction on Booking
  const handleBookSuccess = async (newTx: any) => {
    // Synchronize locally first
    const updatedTxs = [...transactionsList, newTx];
    updateTransactionsList(updatedTxs);

    const sessId = `session-${Date.now()}`;
    const newSess: VideoSession = {
      id: sessId,
      title: `Soutien en direct - ${newTx.serviceDescription}`,
      startTime: new Date().toISOString(),
      durationMinutes: 60,
      studentId: currentUser?.role === 'élève' ? currentUser.id : 'eleve-1',
      studentName: currentUser?.role === 'élève' ? currentUser.name : 'Jean-Daniel Mvezogo',
      teacherId: newTx.teacherId,
      teacherName: newTx.teacherName,
      status: 'À venir'
    };
    const updatedSesses = [...sessionsList, newSess];
    updateSessionsList(updatedSesses);

    if (!isUsingSandbox) {
      try {
        // Save directly to Firestore in real-time
        await setDoc(doc(db, 'transactions', newTx.id), newTx);
        await setDoc(doc(db, 'sessions', sessId), newSess);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'transactions');
      }
    }
  };

  // Action: Add Teacher custom homework
  const handleAddNewHomework = async (newHomeworkData: any) => {
    const homeworkId = `lesson-${Date.now()}`;
    const newHomework = {
      ...newHomeworkData,
      id: homeworkId,
      aiScore: null,
      recommendations: null,
      status: 'Assigné',
      createdAt: new Date().toISOString()
    };
    const updatedLessons = [newHomework, ...lessonsList];
    updateLessonsList(updatedLessons);

    if (!isUsingSandbox) {
      try {
        await setDoc(doc(db, 'lessons', homeworkId), newHomework);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'lessons');
      }
    }
  };

  // Action: Resolve system-generated alert
  const handleResolveAlert = async (id: string) => {
    const updatedAlerts = alertsList.map(a => a.id === id ? { ...a, status: 'resolu' as const } : a);
    updateAlertsList(updatedAlerts);

    if (!isUsingSandbox) {
      try {
        await updateDoc(doc(db, 'alerts', id), { status: 'resolu' });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `alerts/${id}`);
      }
    }
  };

  // Action: Release Escrow transaction balance to teacher
  const handleReleaseEscrow = async (id: string) => {
    const updatedTxs = transactionsList.map(t => t.id === id ? { ...t, status: 'Released' as const } : t);
    updateTransactionsList(updatedTxs);

    const tx = transactionsList.find(t => t.id === id);
    if (tx) {
      const updatedTeachers = teachersList.map(t => {
        if (t.id === tx.teacherId) {
          const currentEarning = t.savedWallet || 0;
          return { ...t, savedWallet: currentEarning + tx.amount };
        }
        return t;
      });
      updateTeachersList(updatedTeachers);
    }

    alert('🪙 Fonds libérés ! Le portefeuille de l\'éducateur a reçu le montant de la séance.');

    if (!isUsingSandbox) {
      try {
        await updateDoc(doc(db, 'transactions', id), { status: 'Released' });
        if (tx) {
          const teacherRef = doc(db, 'teachers', tx.teacherId);
          const tSnap = await getDoc(teacherRef);
          if (tSnap.exists()) {
            const teacherData = tSnap.data();
            const currentEarning = teacherData.savedWallet || 0;
            await updateDoc(teacherRef, { savedWallet: currentEarning + tx.amount });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `transactions/${id}`);
      }
    }
  };

  // Action: Set Teacher to verified status
  const handleVerifyTeacher = async (id: string) => {
    const updatedTeachers = teachersList.map(t => t.id === id ? { ...t, verified: true } : t);
    updateTeachersList(updatedTeachers);

    alert('✅ Enseignant approuvé avec succès ! Le badge LDS doré est dorénavant actif.');

    if (!isUsingSandbox) {
      try {
        await updateDoc(doc(db, 'teachers', id), { verified: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `teachers/${id}`);
      }
    }
  };

  // Action: Submit Quiz answers and retrieve Gemini score evaluation 
  const handleSolveQuizSubmit = async () => {
    if (!activeQuizToSolve || !activeQuizToSolve.questions) return;

    const ansTextArray = activeQuizToSolve.questions.map((q, idx) => {
      return quizAnswers[idx] || '';
    });

    try {
      // Direct call to Gemini Evaluation API on Full Stack server
      const response = await fetch('/api/gemini/quiz-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: activeQuizToSolve.id,
          answers: ansTextArray
        })
      });

      if (response.ok) {
        const data = await response.json();
        const evaluatedLesson = data.lesson;

        // Synchronize locally first
        const updatedLessons = lessonsList.map(l => {
          if (l.id === activeQuizToSolve.id) {
            return {
              ...l,
              status: 'Corrigé' as const,
              aiScore: evaluatedLesson.aiScore,
              recommendations: evaluatedLesson.recommendations,
              studentAnswers: ansTextArray,
              feedbackText: evaluatedLesson.feedbackText
            };
          }
          return l;
        });
        updateLessonsList(updatedLessons);

        let newAlert: any = null;
        // Trigger alert of low scores
        if (evaluatedLesson.aiScore < 10) {
          const alertId = `alert-score-${Date.now()}`;
          newAlert = {
            id: alertId,
            studentId: currentUser?.id || 'eleve-1',
            studentName: currentUser?.name || 'Jean-Daniel Mvezogo',
            type: 'Faible Score',
            message: `${currentUser?.name || 'Jean-Daniel'} a obtenu la note de ${evaluatedLesson.aiScore}/20 sur le quiz « ${activeQuizToSolve.title} ».`,
            severity: 'high' as const,
            createdAt: new Date().toISOString(),
            status: 'non_resolu' as const
          };
          const updatedAlerts = [newAlert, ...alertsList];
          updateAlertsList(updatedAlerts);
        }

        setActiveQuizToSolve(null);
        setQuizAnswers({});
        alert('🎯 Quiz soumis et validé ! Votre note a bien été transmise à vos parents.');

        if (!isUsingSandbox) {
          try {
            await updateDoc(doc(db, 'lessons', activeQuizToSolve.id), {
              status: 'Corrigé',
              aiScore: evaluatedLesson.aiScore,
              recommendations: evaluatedLesson.recommendations,
              studentAnswers: ansTextArray,
              feedbackText: evaluatedLesson.feedbackText
            });

            if (newAlert) {
              await setDoc(doc(db, 'alerts', newAlert.id), newAlert);
            }
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.WRITE, 'lessons');
          }
        }
      } else {
        alert("Une erreur est survenue lors de l'évaluation automatique par IA.");
      }
    } catch (error) {
      console.error('Quiz Evaluation Error', error);
      alert('Erreur technique lors de la notation par le conseiller IA.');
    }
  };

  const handleSuggestBookingMarketplace = (subject: string) => {
    setSuggestedSubjectMarketplace(subject);
    setRole('parent'); // marketplace inside parent view
  };

  // Helper to render the actual active view when simulated as mobile frame
  const renderSimulatedMobileContent = () => {
    if (role === 'parent') {
      return (
        <div className="space-y-4">
          <ParentDashboard
            lessonsList={lessonsList}
            transactionsList={transactionsList}
            sessionsList={sessionsList}
            onOpenVirtualClass={(sess) => {
              setActiveVisioSession(sess);
            }}
            onNavigateToMarketplace={(defSub) => {
              setSuggestedSubjectMarketplace(defSub || '');
              setIsMarketplaceActiveOnMobile(true);
            }}
            onNavigateToAICoach={() => setRole('élève')}
            isMobileDeviceSimulator={true}
          />

          {isMarketplaceActiveOnMobile && (
            <div className="space-y-4 mt-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <button
                onClick={() => setIsMarketplaceActiveOnMobile(false)}
                className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-slate-950 border border-slate-850 rounded-lg px-3.5 py-1.5 hover:bg-slate-850 transition-all cursor-pointer w-fit"
              >
                ⬅️ Retour au Menu Parent
              </button>
              <Marketplace
                teachersList={teachersList}
                onBookSuccess={(tx) => {
                  handleBookSuccess(tx);
                  setIsMarketplaceActiveOnMobile(false);
                }}
                selectedDefaultSubject={suggestedSubjectMarketplace}
              />
            </div>
          )}
        </div>
      );
    }

    if (role === 'élève') {
      return (
        <div className="space-y-4">
          {studentMobileShowMenu ? (
            <div className="space-y-4">
              <div className="px-1 text-slate-100">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">📁 Tableau de bord Élève</h3>
                <p className="text-[10px] text-slate-500">Sélectionnez votre outil de progression :</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  id="student-mob-card-coach"
                  onClick={() => {
                    setStudentTab('ai_coach');
                    setStudentMobileShowMenu(false);
                  }}
                  className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-500">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500">Tuteur IA Gabon 24h/24</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Saisie vocale, scans de cahier et fiches Beepc</p>
                    </div>
                  </div>
                  <span className="text-slate-600 text-xs">&rarr;</span>
                </button>

                <button
                  id="student-mob-card-homeworks"
                  onClick={() => {
                    setStudentTab('homeworks');
                    setStudentMobileShowMenu(false);
                  }}
                  className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500">Mes Evaluations ({lessonsList.filter(l => l.status === 'Assigné').length})</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Faites vos quiz en mathématiques &amp; français</p>
                    </div>
                  </div>
                  <span className="text-slate-600 text-xs">&rarr;</span>
                </button>

                <button
                  id="student-mob-card-visio"
                  onClick={() => {
                    setStudentTab('classroom');
                    setStudentMobileShowMenu(false);
                  }}
                  className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-500">Classe Réactive en Direct</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Séance vidéo en direct avec votre répétiteur</p>
                    </div>
                  </div>
                  <span className="text-slate-600 text-xs">&rarr;</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setStudentMobileShowMenu(true)}
                className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 hover:bg-slate-850 transition-all font-sans cursor-pointer w-fit"
              >
                ⬅️ Retour au Menu Élève
              </button>

              <div className="bg-slate-900/40 border border-slate-850 p-1 rounded-2xl">
                {studentTab === 'ai_coach' && (
                  <AICoach
                    onSuggestBooking={handleSuggestBookingMarketplace}
                    onNewQuiz={async (quiz) => {
                      try {
                        await setDoc(doc(db, 'lessons', quiz.id), quiz);
                        setStudentTab('homeworks');
                      } catch (err) {
                        handleFirestoreError(err, OperationType.WRITE, 'lessons');
                      }
                    }}
                  />
                )}

                {studentTab === 'homeworks' && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-xs text-slate-200">Mes auto-évaluations</h3>
                    <div className="space-y-2.5 bg-transparent">
                      {lessonsList.map((lesson) => (
                        <div key={lesson.id} className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                          <div>
                            <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">{lesson.type}</span>
                            <h4 className="font-bold text-slate-100 text-xs mt-1">{lesson.title}</h4>
                            <p className="text-[9px] text-slate-500 mt-0.5">Sujet: {lesson.subject} &bull; Par: {lesson.teacherName}</p>
                          </div>
                          <div>
                            {lesson.aiScore !== null ? (
                              <p className="font-mono text-xs font-bold text-emerald-400">Note : {lesson.aiScore}/20</p>
                            ) : (
                              <button
                                onClick={() => {
                                  if (lesson.type === 'Quiz IA' && lesson.questions) {
                                    setActiveQuizToSolve(lesson);
                                    setQuizAnswers({});
                                  } else {
                                    alert("Prenez une capture photo de votre feuille d'exercice de mathématiques dans le Coach IA pour qu'il la scanne et l'évalue automatiquement.");
                                    setStudentTab('ai_coach');
                                  }
                                }}
                                className="w-full py-1.5 bg-amber-500 text-slate-950 text-[11px] font-bold rounded-lg cursor-pointer"
                              >
                                {lesson.type === 'Quiz IA' ? 'Faire le Quiz' : 'Analyser par IA'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {studentTab === 'classroom' && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-xs text-slate-200">Classe Virtuelle</h3>
                    <div className="space-y-2.5">
                      {sessionsList.map((s) => (
                        <div key={s.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-bold text-slate-200 text-[11px]">{s.title}</h4>
                            <p className="text-[9px] text-slate-500 font-sans">Prof: {s.teacherName}</p>
                          </div>
                          <button
                            onClick={() => setActiveVisioSession(s)}
                            className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10px] cursor-pointer"
                          >
                            Entrer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (role === 'teacher') {
      const activeTeacher = teachersList.find(t => t.email === currentUser?.email) || teachersList[0];
      return (
        <TeacherDashboard
          teacherProfile={activeTeacher}
          lessonsList={lessonsList}
          onAddNewHomework={handleAddNewHomework}
          onStartVisioRoom={(title) => {
            setActiveVisioSession({
              id: 'session-visio-teacher',
              title: title || 'Séance Géométrie Thalès',
              startTime: new Date().toISOString(),
              durationMinutes: 60,
              studentId: 'eleve-1',
              studentName: 'Jean-Daniel Mvezogo',
              teacherId: activeTeacher.id,
              teacherName: activeTeacher.name,
              status: 'En cours'
            });
          }}
          isMobileDeviceSimulator={true}
        />
      );
    }

    if (role === 'coach_admin') {
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-250 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400">Pôle LDS Admin</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">Veuillez basculer sur ordinateur pour une gestion complète des transactions scolaires et de l&apos;accréditation des enseignants gabonais.</p>
          <button
            onClick={() => setIsMobileSimulatorActive(false)}
            className="w-full py-2 bg-amber-500 text-slate-950 text-xs font-bold font-sans rounded-xl cursor-pointer"
          >
            Pivoter sur Mode PC (🖥️)
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* Header Navigation panel */}
      <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setRole(currentUser?.role || null)}>
            <LDSLogo size="md" showText={false} />
            <div className="hidden sm:block">
              <h1 className="text-sm font-display font-bold tracking-tight text-slate-100 uppercase">
                DIS&apos;SCHOOL <span className="text-[10px] text-amber-500 font-mono italic">Gabon</span>
              </h1>
              <p className="text-[9px] text-slate-400 capitalize tracking-wide font-sans">Soutien scolaire d&apos;Élite</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Clock display */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full font-mono text-[10px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{gabonTime || 'Chargement Libreville...'}</span>
            </div>

            {currentUser && role && (
              <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
                
                {/* Simulator Toggle Button representing user's requested mobile display */}
                <button
                  id="toggle-simulator-btn"
                  onClick={() => {
                    setIsMobileSimulatorActive(!isMobileSimulatorActive);
                    // Reset internal states so views show home menu when going to/from simulator
                    setStudentMobileShowMenu(true);
                    setIsMarketplaceActiveOnMobile(false);
                  }}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isMobileSimulatorActive
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 hover:bg-slate-900 text-slate-350 border-slate-800 hover:text-white'
                  }`}
                  title="Découvrez la version mobile sur smartphone"
                >
                  <span>{isMobileSimulatorActive ? '🖥️ Mode PC' : '📱 Mode Mobile'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden md:inline">Vue :</span>
                  
                  {/* Role Toggle Switcher */}
                  <div className="flex bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                    {[
                      { val: 'parent', label: 'Parent' },
                      { val: 'élève', label: 'Élève' },
                      { val: 'teacher', label: 'Prof' },
                      { val: 'coach_admin', label: 'Pôle' }
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        id={`switcher-${btn.val}`}
                        onClick={() => {
                          setRole(btn.val as any);
                          setActiveVisioSession(null); 
                          setActiveQuizToSolve(null);
                          setStudentMobileShowMenu(true);
                          setIsMarketplaceActiveOnMobile(false);
                        }}
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          role === btn.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout component */}
                <button
                  id="signout-button"
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 bg-red-650/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sortie</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

        {isUsingSandbox && currentUser && (
          <div className="bg-slate-900 border border-amber-500/20 p-5 rounded-3xl mb-6 text-xs text-amber-200 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-base">🛡️</span>
              <div className="space-y-1">
                <p className="font-bold text-slate-100">Mode Simulation &amp; Sandbox Actif (Hors-ligne / Local)</p>
                <p className="text-slate-400 leading-relaxed font-sans mt-0.5 text-[11px]">
                  Votre base de données Firestore dédiée pour l'application a bien été provisionnée automatiquement avec l'ID du projet <code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-400 text-[10px]">poised-service-c07pf</code>, et nos règles de sécurité <code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-500 text-[10px]">firestore.rules</code> y ont été déployées avec succès ! 
                  Vous pouvez réinitialiser le stockage local ci-dessous pour connecter instantanément votre base Firebase en temps réel, ou bien continuer en mode local déconnecté sans aucune interruption.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('lds_use_sandbox');
                    localStorage.removeItem('lds_teachers');
                    localStorage.removeItem('lds_transactions');
                    localStorage.removeItem('lds_lessons');
                    localStorage.removeItem('lds_sessions');
                    localStorage.removeItem('lds_alerts');
                    setIsUsingSandbox(false);
                    window.location.reload();
                  }}
                  className="mt-2 pb-0.5 text-[11px] font-bold text-amber-500 hover:text-amber-400 underline cursor-pointer inline-block"
                >
                  ⚡ Réinitialiser le stockage et se connecter à l&apos;instance Firestore temps réel
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentUser || !role ? (
          <Onboarding 
            onAuthSuccess={(profile) => {
              setCurrentUser(profile);
              setRole(profile.role);
            }} 
          />
        ) : activeVisioSession ? (
          <VirtualClassroom
            sessionTitle={activeVisioSession.title}
            teacherName={activeVisioSession.teacherName}
            studentName={currentUser?.name || activeVisioSession.studentName}
            onCloseSession={() => setActiveVisioSession(null)}
          />
        ) : isMobileSimulatorActive ? (
          <div className="flex flex-col items-center justify-center py-4 bg-slate-950">
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-500 p-3 rounded-2xl text-[11px] mb-4 text-center max-w-sm flex items-center gap-2">
              <span>📱</span>
              <span>Simulateur Smartphone Gabon LDS &bull; Boutons retour &amp; structure fluide !</span>
            </div>

            {/* Realistic smartphone frame */}
            <div className="relative mx-auto w-[365px] h-[750px] bg-slate-950 border-[12px] border-slate-900 rounded-[50px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ring-4 ring-slate-800">
              
              {/* Dynamic Island Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 border border-slate-850 rounded-full z-50 flex items-center justify-center text-[7px] text-slate-500 font-bold font-mono tracking-wider">
                <span>LDS ÉLITE</span>
              </div>

              {/* Screen viewport */}
              <div className="flex-1 overflow-y-auto px-4 pt-11 pb-6 custom-scrollbar bg-slate-950">
                {renderSimulatedMobileContent()}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {role === 'parent' && (
              <div className="space-y-8">
                <ParentDashboard
                  lessonsList={lessonsList}
                  transactionsList={transactionsList}
                  sessionsList={sessionsList}
                  onOpenVirtualClass={(sess) => {
                    setActiveVisioSession(sess);
                  }}
                  onNavigateToMarketplace={(defSub) => {
                    setSuggestedSubjectMarketplace(defSub || '');
                  }}
                  onNavigateToAICoach={() => setRole('élève')}
                />

                {/* Marketplace block inline */}
                <div className="border-t border-slate-850 pt-8 mt-8">
                  <Marketplace
                    teachersList={teachersList}
                    onBookSuccess={handleBookSuccess}
                    selectedDefaultSubject={suggestedSubjectMarketplace}
                  />
                </div>
              </div>
            )}

            {role === 'élève' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Side Bar Menu */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-100 text-sm">Espace Élève</h3>
                    <p className="text-[11px] text-slate-400">Raccordé : <span className="text-amber-500 font-bold">{currentUser?.name}</span></p>
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  <div className="flex flex-col gap-2">
                    
                    <button
                      id="eleve-tab-coach"
                      onClick={() => setStudentTab('ai_coach')}
                      className={`w-full py-2.5 px-4 rounded-xl text-left font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        studentTab === 'ai_coach'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Tuteur IA Gabon 24h &bull; Saisie
                    </button>

                    <button
                      id="eleve-tab-devoir"
                      onClick={() => setStudentTab('homeworks')}
                      className={`w-full py-2.5 px-4 rounded-xl text-left font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        studentTab === 'homeworks'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Mes auto-évaluations ({lessonsList.filter(l => l.status === 'Assigné').length})
                    </button>

                    <button
                      id="eleve-tab-visio"
                      onClick={() => setStudentTab('classroom')}
                      className={`w-full py-2.5 px-4 rounded-xl text-left font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        studentTab === 'classroom'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Rejoindre Classe Réactive
                    </button>

                  </div>

                  <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[10px] text-slate-400 leading-relaxed font-sans">
                    💡 **Conseil** : Complétez vos Quiz IA de mathématiques chaque soir pour stabiliser votre moyenne. Vos notes s&apos;affichent sur l&apos;espace parent.
                  </div>
                </div>

                {/* Right Side Bar content */}
                <div className="lg:col-span-3">
                  {studentTab === 'ai_coach' && (
                    <AICoach
                      onSuggestBooking={handleSuggestBookingMarketplace}
                      onNewQuiz={async (quiz) => {
                        try {
                          await setDoc(doc(db, 'lessons', quiz.id), quiz);
                          setStudentTab('homeworks');
                        } catch (err) {
                          handleFirestoreError(err, OperationType.WRITE, 'lessons');
                        }
                      }}
                    />
                  )}

                  {studentTab === 'homeworks' && (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
                      <h3 className="font-bold text-sm tracking-wide text-slate-200">Vos Devoirs &amp; Auto-évaluations</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {lessonsList.map((lesson) => (
                          <div key={lesson.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                lesson.type === 'Quiz IA' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {lesson.type}
                              </span>
                              <h4 className="font-bold text-slate-200 text-sm">{lesson.title}</h4>
                              <p className="text-slate-400">Sujet: {lesson.subject} &bull; Par: {lesson.teacherName}</p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                              {lesson.aiScore !== null ? (
                                <div className="text-left md:text-right">
                                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Note acquise</span>
                                  <span className="font-mono text-sm font-bold text-emerald-400">{lesson.aiScore} / 20</span>
                                </div>
                              ) : (
                                <button
                                  id={`solve-homework-btn-${lesson.id}`}
                                  onClick={() => {
                                    if (lesson.type === 'Quiz IA' && lesson.questions) {
                                      setActiveQuizToSolve(lesson);
                                      setQuizAnswers({});
                                    } else {
                                      alert("Exercice rédigé : Prenez en photo votre feuille d'exercice de mathématiques dans le Coach IA pour qu'il la corrige et attribue la note de manière automatique !");
                                      setStudentTab('ai_coach');
                                    }
                                  }}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all w-full md:w-auto text-center cursor-pointer"
                                >
                                  {lesson.type === 'Quiz IA' ? 'Lancer le Quiz' : 'Résoudre par Coach IA'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {studentTab === 'classroom' && (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                      <h3 className="font-bold text-sm text-slate-200">Rejoindre votre répétiteur certifié</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Si un cours particulier de Mathématiques ou Français est actif maintenant, cliquez ci-dessous pour entrer dans la salle de vidéoconférence avec tableau blanc.
                      </p>

                      <div className="space-y-4 mt-4">
                        {sessionsList.map((s) => (
                          <div key={s.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center text-xs">
                            <div>
                              <h4 className="font-bold text-slate-200">{s.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-1">Prof: {s.teacherName} &bull; Statut : {s.status}</p>
                            </div>
                            <button
                              id={`join-direct-pupil-${s.id}`}
                              onClick={() => {
                                setActiveVisioSession(s);
                              }}
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
                            >
                              Entrer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {role === 'teacher' && (
              <TeacherDashboard
                teacherProfile={teachersList.find(t => t.email === currentUser?.email) || teachersList[0] || {
                  id: 'teacher-1',
                  name: currentUser?.name || 'Pr. Armand Ndong',
                  subjects: ['Mathématiques', 'Physique-Chimie'],
                  diplomaUrl: '#',
                  diplomaName: 'ENS_Calipee.pdf',
                  verified: true,
                  rating: 4.9,
                  pricePerSession: 5000,
                  zone: 'Akanda',
                  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                  bio: 'Diplômé de l\'École Normale Supérieure de Libreville.',
                  email: currentUser?.email || 'armand.ndong@education.ga',
                  phone: currentUser?.phone || '+241 077 45 89 12',
                  savedWallet: 12000
                }}
                lessonsList={lessonsList}
                onAddNewHomework={handleAddNewHomework}
                onStartVisioRoom={(title) => {
                  setActiveVisioSession({
                    id: 'session-visio-teacher',
                    title: title || 'Séance Géométrie Thalès',
                    startTime: new Date().toISOString(),
                    durationMinutes: 60,
                    studentId: 'eleve-1',
                    studentName: 'Jean-Daniel Mvezogo',
                    teacherId: 'teacher-1',
                    teacherName: currentUser?.name || 'Pr. Armand Ndong',
                    status: 'En cours'
                  });
                }}
              />
            )}

            {role === 'coach_admin' && (
              <CoachDashboard
                teachersList={teachersList}
                transactionsList={transactionsList}
                alertsList={alertsList}
                lessonsList={lessonsList}
                onVerifyTeacher={handleVerifyTeacher}
                onReleaseTransactionEscrow={handleReleaseEscrow}
                onResolveAlert={handleResolveAlert}
                onUpdateTeachersList={updateTeachersList}
                onUpdateTransactionsList={updateTransactionsList}
                onUpdateLessonsList={updateLessonsList}
                onUpdateAlertsList={updateAlertsList}
              />
            )}

          </div>
        )}

      </main>

      {/* Solving Interactive Quiz Dialog helper */}
      {activeQuizToSolve && activeQuizToSolve.questions && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            
            <button
              id="close-quiz-solving"
              onClick={() => setActiveQuizToSolve(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold bg-slate-950/50 p-2 rounded-full cursor-pointer h-8 w-8 flex items-center justify-center"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Évaluation IA Interactive</h3>
                <p className="text-[10px] text-slate-400">Assistance robotisée DIS&apos;SCHOOL Gabon</p>
              </div>
            </div>

            <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-4">Sujet : {activeQuizToSolve.title}</p>

            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
              {activeQuizToSolve.questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <p className="text-xs font-bold text-slate-200">{qIdx + 1}. {q.question}</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        id={`option-check-${qIdx}-${option.substring(0, 5)}`}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({ ...prev, [qIdx]: option }));
                        }}
                        className={`text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                          quizAnswers[qIdx] === option
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850 text-white'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              id="submit-quiz-answers-btn"
              onClick={handleSolveQuizSubmit}
              className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Soumettre et Corriger mon devoir
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
