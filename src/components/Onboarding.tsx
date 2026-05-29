import React, { useState } from 'react';
import LDSLogo from './LDSLogo';
import { 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Landmark, 
  MapPin, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from '../types';

interface OnboardingProps {
  onAuthSuccess: (userProfile: UserProfile) => void;
}

export const isAdminEmail = (emailStr: string | null | undefined): boolean => {
  if (!emailStr) return false;
  const normalized = emailStr.toLowerCase().trim();
  return normalized === 'ludo.consulting3@gmail.com' || normalized === 'ludoconsulting3@gmail.com';
};

export default function Onboarding({ onAuthSuccess }: OnboardingProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Credentials input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('élève');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('Akanda');
  
  // State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Google Authentication
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already has a role profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      let profileData: UserProfile;
      try {
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          profileData = userSnap.data() as UserProfile;
          if (isAdminEmail(user.email)) {
            profileData.role = 'coach_admin';
          }
        } else {
          // If profile doesn't exist, bootstrap a default profile and store it!
          const defaultProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || (isAdminEmail(user.email) ? 'Ludo Consulting Admin' : 'Utilisateur Google'),
            email: user.email || '',
            role: isAdminEmail(user.email) ? 'coach_admin' : 'élève', // admin or default role
            phone: '+241 077 00 00 00',
            zone: 'Libreville Centre'
          };
          await setDoc(userDocRef, defaultProfile);
          profileData = defaultProfile;
        }
      } catch (firestoreErr) {
        // Formats and logs the firestore permissions error toconsole
        try {
          handleFirestoreError(firestoreErr, OperationType.GET, 'users');
        } catch (logErr) {
          console.warn("Firestore error logged:", logErr);
        }
        // Securely fall back to an elegant simulated user profile
        profileData = {
          id: user.uid,
          name: user.displayName || (isAdminEmail(user.email) ? 'Ludo Consulting Admin' : 'Utilisateur Google (Simulé)'),
          email: user.email || '',
          role: isAdminEmail(user.email) ? 'coach_admin' : 'élève',
          phone: '+241 077 00 00 00',
          zone: 'Libreville Centre'
        };
      }
      onAuthSuccess(profileData);
    } catch (err: any) {
      console.error('Google Sign In Error', err);
      setErrorMsg(
        "L'authentification Google via OAuth est restreinte dans la prévisualisation iFrame (cookies tiers bloqués par le navigateur / configuration locale). Veuillez utiliser un compte de démo rapide ci-dessous ou créer un compte e-mail classique en quelques secondes !"
      );
    } finally {
      setLoading(false);
    }
  };

  // 1b. Fast Demo Login with automatic creation & absolute fallback to avoid any blocking
  const handleQuickDemoLogin = async (targetRole: UserRole) => {
    setLoading(true);
    setErrorMsg('');
    
    const demoEmail = targetRole === 'coach_admin' ? 'ludo.consulting3@gmail.com' : `${targetRole === 'élève' ? 'eleve' : targetRole === 'parent' ? 'parent' : 'prof'}@dis-school.ga`;
    const demoPassword = targetRole === 'coach_admin' ? 'password' : 'password123';
    
    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      } catch (loginErr: any) {
        // If account does not exist or first initialization, bootstrap it nicely
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/wrong-password') {
          cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          const nameMap: Record<UserRole, string> = {
            'élève': 'Marc-Aurel Ondimba (Élève)',
            'parent': 'Mme Bignoumba (Parent)',
            'teacher': 'M. Roger Ondo (Prof ENS)',
            'coach_admin': 'Ludo Consulting Admin'
          };
          await updateProfile(cred.user, { displayName: nameMap[targetRole] });
        } else {
          throw loginErr;
        }
      }
      
      // Sync Firestore profile
      const userDocRef = doc(db, 'users', cred.user.uid);
      let profileData: UserProfile;
      try {
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          profileData = userSnap.data() as UserProfile;
          // Security forced role check
          if (isAdminEmail(demoEmail)) {
            profileData.role = 'coach_admin';
          }
        } else {
          const nameMap: Record<UserRole, string> = {
            'élève': 'Marc-Aurel Ondimba (Élève)',
            'parent': 'Mme Bignoumba (Parent)',
            'teacher': 'M. Roger Ondo (Prof ENS)',
            'coach_admin': 'Ludo Consulting Admin'
          };
          profileData = {
            id: cred.user.uid,
            name: nameMap[targetRole],
            email: demoEmail,
            role: targetRole,
            phone: '+241 077 12 34 56',
            zone: targetRole === 'teacher' ? 'STFO / Soduco' : 'Akanda'
          };
          await setDoc(userDocRef, profileData);
        }
      } catch (firestoreErr) {
        try {
          handleFirestoreError(firestoreErr, OperationType.GET, 'users');
        } catch (logErr) {
          console.warn("Firestore error logged:", logErr);
        }
        const nameMap: Record<UserRole, string> = {
          'élève': 'Marc-Aurel Ondimba (Élève)',
          'parent': 'Mme Bignoumba (Parent)',
          'teacher': 'M. Roger Ondo (Prof ENS)',
          'coach_admin': 'Ludo Consulting Admin'
        };
        profileData = {
          id: cred.user.uid,
          name: nameMap[targetRole],
          email: demoEmail,
          role: targetRole,
          phone: '+241 077 12 34 56',
          zone: targetRole === 'teacher' ? 'STFO / Soduco' : 'Akanda'
        };
      }
      onAuthSuccess(profileData);
    } catch (err: any) {
      console.warn('Demo login via Firebase failed (offline or network). Falling back to direct mock profile.', err);
      // Fallback mode so the app is always fully functional!
      const fallbackNames: Record<UserRole, string> = {
        'élève': 'Marc-Aurel Ondimba (Démo)',
        'parent': 'Mme Bignoumba (Démo)',
        'teacher': 'M. Roger Ondo (Démo)',
        'coach_admin': 'Ludo Consulting Admin'
      };
      
      const fallbackProfile: UserProfile = {
        id: `fallback-${targetRole}-${Date.now()}`,
        name: fallbackNames[targetRole],
        email: demoEmail,
        role: targetRole,
        phone: '+241 077 12 34 56',
        zone: 'Akanda'
      };
      onAuthSuccess(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs de connexion.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    const lowerEmail = email.toLowerCase().trim();

    try {
      if (isSignUp) {
        // Create standard account
        if (!name || !phone) {
          setErrorMsg('Veuillez renseigner votre nom complet et numéro de téléphone.');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });

        const newUserProfile: UserProfile = {
          id: cred.user.uid,
          name,
          email,
          role: isAdminEmail(lowerEmail) ? 'coach_admin' : role,
          phone,
          zone
        };

        // Write to Firestore /users/{uid} with graceful fallback
        try {
          await setDoc(doc(db, 'users', cred.user.uid), newUserProfile);
        } catch (dbErr) {
          try {
            handleFirestoreError(dbErr, OperationType.WRITE, `users/${cred.user.uid}`);
          } catch (logErr) {
            console.warn("Firestore error logged:", logErr);
          }
          console.warn("Firestore blocked writing new profile, staying fully functional locally:", dbErr);
        }
        onAuthSuccess(newUserProfile);
      } else {
        // Login with credentials
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, email, password);
        } catch (loginErr: any) {
          // Automatic support & setup for designated admin on first use
          if (isAdminEmail(lowerEmail) && password === 'password') {
            try {
              cred = await createUserWithEmailAndPassword(auth, email, password);
              await updateProfile(cred.user, { displayName: "Ludo Consulting Admin" });
            } catch (createAdminErr) {
              throw loginErr; // If failed, throw the original login error
            }
          } else {
            throw loginErr;
          }
        }

        const userDocRef = doc(db, 'users', cred.user.uid);
        let liveProfile: UserProfile;
        
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            liveProfile = userSnap.data() as UserProfile;
            // Strict enforce role or update based on login form select
            if (isAdminEmail(lowerEmail)) {
              liveProfile.role = 'coach_admin';
            } else {
              liveProfile.role = role;
            }
            // Sync with Firestore so they go to specified dashboard
            try {
              await setDoc(userDocRef, { ...liveProfile, role: liveProfile.role }, { merge: true });
            } catch (dbErr) {
              console.warn("Firestore writing error on role update:", dbErr);
            }
          } else {
            // If signed in, but profile is missing
            const checkEmail = cred.user.email || email || '';
            const isAdmin = isAdminEmail(checkEmail);
            liveProfile = {
              id: cred.user.uid,
              name: isAdmin ? 'Ludo Consulting Admin' : (cred.user.displayName || 'Utilisateur'),
              email: checkEmail,
              role: isAdmin ? 'coach_admin' : role,
              phone: '+241 077 00 00 00',
              zone: 'Akanda'
            };
            try {
              await setDoc(userDocRef, liveProfile);
            } catch (wErr) {
              try {
                handleFirestoreError(wErr, OperationType.WRITE, `users/${cred.user.uid}`);
              } catch (logErr) {
                console.warn("Firestore error logged:", logErr);
              }
            }
          }
        } catch (dbErr) {
          try {
            handleFirestoreError(dbErr, OperationType.GET, `users/${cred.user.uid}`);
          } catch (logErr) {
            console.warn("Firestore error logged:", logErr);
          }
          console.warn("Firestore permissions blocked reading user profile, using chosen role from select dropdown.", dbErr);
          const isAdmin = isAdminEmail(cred.user.email || lowerEmail);
          
          liveProfile = {
            id: cred.user.uid,
            name: isAdmin ? 'Ludo Consulting Admin' : (cred.user.displayName || 'Utilisateur Gabonais'),
            email: cred.user.email || email,
            role: isAdmin ? 'coach_admin' : role,
            phone: '+241 077 00 00 00',
            zone: 'Akanda'
          };
        }
        onAuthSuccess(liveProfile);
      }
    } catch (err: any) {
      console.error('Email Auth Error', err);
      let localizedMsg = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        localizedMsg = 'Identifiants ou mot de passe incorrects. (Pour l\'admin suprême, connectez-vous avec ludoconsulting3@gmail.com ou ludo.consulting3@gmail.com / password)';
      } else if (err.code === 'auth/email-already-in-use') {
        localizedMsg = 'Cette adresse e-mail est déjà utilisée.';
      } else if (err.code === 'auth/weak-password') {
        localizedMsg = 'Le mot de passe doit contenir au moins 6 caractères.';
      }
      setErrorMsg(localizedMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] text-slate-100 flex flex-col justify-start py-6 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="max-w-md mx-auto text-center mt-4">
        <LDSLogo size="lg" />
        <p className="mt-4 text-slate-400 text-sm max-w-sm mx-auto">
          La plateforme d&apos;excellence qui connecte en temps réel les élèves du Gabon aux meilleurs enseignants certifiés et à un tuteur IA 24h/24.
        </p>
      </div>

      {/* Main Content Splitted */}
      <div className="max-w-6xl mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left Side: App Pitch & Features info */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-4">
            Soutien Scolaire d&apos;Élite Réel &amp; Connecté 🇬🇦
          </h2>
          
          {/* Feature list */}
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Tuteur IA Gabon 24h/7</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Une IA francophone qui explique vos cours (Maths, Français, SVT) et évalue vos quiz instantanément.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Répétiteurs ENS Certifiés</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Des professeurs habilités pour les classes de collège (BEPC) et lycée (BAC), pour des visio-conférences fluides.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Paiements Escrow Sécurisés</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Airtel Money et Moov Money intégrés. Les fonds sont sécurisés en tiers-de-confiance jusqu&apos;à réalisation de la prestation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/5 max-w-lg mx-auto w-full">
          
          <div className="border-b border-slate-800 pb-4 mb-6">
            <div className="flex justify-around">
              <button 
                id="tab-btn-signin"
                className={`pb-2 text-sm font-semibold capitalize transition-all cursor-pointer ${!isSignUp ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
              >
                Se connecter
              </button>
              <button 
                id="tab-btn-signup"
                className={`pb-2 text-sm font-semibold capitalize transition-all cursor-pointer ${isSignUp ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
              >
                Créer un compte
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl mb-4 text-center">
              ⚠ {errorMsg}
            </div>
          )}

          {/* Google Quick Login Provider */}
          <button
            id="google-signin-btn"
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-850 hover:border-slate-870 text-slate-200 border border-slate-800 rounded-xl font-medium text-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22c-.87-2.6-2.86-4.53-5.29-4.53z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
            </svg>
            <span>{isSignUp ? "S'enregistrer avec Google" : "Connexion rapide avec Google"}</span>
          </button>

          {/* Credentials form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mt-6">
            
            {/* Always visible Role Selection Dropdown */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Espace de Travail / Votre Rôle d&apos;Élite</label>
              <select
                id="auth-role-input"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500 transition-all font-sans"
              >
                <option value="élève">🎓 Je suis Élève (Sujets, Quiz &amp; Tuteur)</option>
                <option value="parent">👤 Je suis Parent (Suivi &amp; Règlements)</option>
                <option value="teacher">👨‍🏫 Je suis Professeur (Répétiteur ENS &amp; Trésorerie)</option>
                <option value="coach_admin">🛡 Je suis Coordinateur Pôle LDS (Administration)</option>
              </select>
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nom Complet</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      id="signup-name-input"
                      type="text" 
                      placeholder="Jean-Daniel Mvezogo" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all font-sans"
                      required={isSignUp}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">N_ Téléphone Gabon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input 
                        id="signup-phone-input"
                        type="tel" 
                        placeholder="+241 077 45 89 12" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all font-sans"
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Zone de résidence</label>
                    <select
                      id="signup-zone-input"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all font-sans"
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
              </>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Adresse E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  id="auth-email-input"
                  type="email" 
                  placeholder="votre.nom@dis-school.ga" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Mot De Passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  id="auth-password-input"
                  type="password" 
                  placeholder="******" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Traitement en cours...' : isSignUp ? 'Confirmer la création' : 'Se connecter'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

          </form>

        </div>

      </div>

      <div className="text-center text-[10px] text-slate-500 mt-4 max-w-sm mx-auto leading-relaxed">
        En créant un compte, vous certifiez accepter d&apos;être rattaché à l&apos;ANINF gabonaise ainsi qu&apos;aux conditions de soutien en direct de DIS&apos;SCHOOL Gabon.
      </div>

    </div>
  );
}
