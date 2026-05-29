import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { TeacherProfile, LessonHomework, VideoSession, EscrowTransaction, IA_Alert } from '../types';

export const initialTeachers: TeacherProfile[] = [
  {
    id: 'teacher-1',
    name: 'Pr. Armand Ndong',
    subjects: ['Mathématiques', 'Physique-Chimie'],
    diplomaUrl: '#',
    diplomaName: 'Doctorat en Sciences Physiques - UOB Libreville.pdf',
    verified: true,
    rating: 4.9,
    pricePerSession: 6000,
    zone: 'STFO',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    bio: 'Ancien enseignant au Lycée National Léon Mba. Expert en préparation au Baccalauréat C et D.',
    email: 'armand.ndong@gmail.com',
    phone: '+241 074 88 99 00',
    savedWallet: 18000
  },
  {
    id: 'teacher-2',
    name: 'Mme Rose Obone',
    subjects: ['Français', 'Histoire-Géographie'],
    diplomaUrl: '#',
    diplomaName: 'Master IPN - Institut Pédagogique National.pdf',
    verified: true,
    rating: 4.8,
    pricePerSession: 5000,
    zone: 'Libreville Centre',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    bio: 'Spécialiste du soutien scolaire personnalisé pour le collège et le primaire. Pédagogie active.',
    email: 'rose.obone@gmail.com',
    phone: '+241 077 11 22 33',
    savedWallet: 25000
  },
  {
    id: 'teacher-3',
    name: 'M. Hugues Kombila',
    subjects: ['Anglais', 'Sciences de la Vie et de la Terre (SVT)'],
    diplomaUrl: '#',
    diplomaName: 'Licence Anglais - ENS Libreville.pdf',
    verified: false,
    rating: 4.5,
    pricePerSession: 4500,
    zone: 'Owendo',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    bio: 'Jeune diplômé dynamique de l\'École Normale Supérieure. Répétitions interactives en visio ou présentiel.',
    email: 'hugues.kombila@gmail.com',
    phone: '+241 065 55 44 33',
    savedWallet: 0
  }
];

export const initialLessons: LessonHomework[] = [
  {
    id: 'lesson-1',
    title: 'Théorème de Pythagore - Application directes',
    type: 'Quiz IA',
    studentId: 'eleve-1',
    studentName: 'Jean-Daniel Mvezogo',
    teacherId: 'IA',
    teacherName: 'Conseiller Pédagogique LDS IA',
    subject: 'Mathématiques',
    aiScore: 16,
    recommendations: 'Excellent sens de l\'hypoténuse. Réviser la notation des carrés pour éviter les fautes d\'étourderie.',
    status: 'Corrigé',
    questions: [
      {
        question: 'Dans un triangle ABC rectangle en A, d\'après le théorème de Pythagore nous avons :',
        options: ['BC² = AB² + AC²', 'AB² = BC² + AC²', 'AC² = AB² + BC²', 'BC = AB + AC'],
        correctAnswer: 'BC² = AB² + AC²'
      },
      {
        question: 'Si AB = 3 cm et AC = 4 cm dans un triangle ABC rectangle en A, quelle est la longueur de [BC] ?',
        options: ['5 cm', '7 cm', '25 cm', '6 cm'],
        correctAnswer: '5 cm'
      },
      {
        question: 'Le théorème de Pythagore permet principalement de :',
        options: ['Calculer la longueur d\'un côté d\'un triangle rectangle', 'Démontrer qu\'un triangle est équilatéral', 'Calculer l\'aire d\'un disque', 'Mesurer un angle'],
        correctAnswer: 'Calculer la longueur d\'un côté d\'un triangle rectangle'
      }
    ],
    studentAnswers: ['BC² = AB² + AC²', '5 cm', 'Mesurer un angle'],
    submissionText: 'L\'élève a répondu aux questions interactives.',
    feedbackText: 'Deux bonnes réponses sur trois. Bravo ! Attention à l\'utilité fondamentale du théorème.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'lesson-2',
    title: 'Analyse littéraire - L\'Enfant Noir de Camara Laye',
    type: 'Devoir',
    studentId: 'eleve-1',
    studentName: 'Jean-Daniel Mvezogo',
    teacherId: 'teacher-2',
    teacherName: 'Mme Rose Obone',
    subject: 'Français',
    aiScore: null,
    recommendations: null,
    status: 'Assigné',
    submissionText: '',
    feedbackText: '',
    createdAt: new Date().toISOString()
  }
];

export const initialSessions: VideoSession[] = [
  {
    id: 'session-1',
    title: 'Classe Virtuelle - Soutien Trigonométrie',
    startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    durationMinutes: 60,
    studentId: 'eleve-1',
    studentName: 'Jean-Daniel Mvezogo',
    teacherId: 'teacher-1',
    teacherName: 'Pr. Armand Ndong',
    status: 'À venir'
  },
  {
    id: 'session-2',
    title: 'Classe IA Interactive - Vocabulaire Anglais',
    startTime: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    durationMinutes: 45,
    studentId: 'eleve-1',
    studentName: 'Jean-Daniel Mvezogo',
    teacherId: 'teacher-2',
    teacherName: 'Mme Rose Obone',
    status: 'Terminé'
  }
];

export const initialTransactions: EscrowTransaction[] = [
  {
    id: 'tx-1inv',
    amount: 12000,
    type: 'Airtel Money',
    status: 'Released',
    parentId: 'parent-1',
    parentName: 'Martine Mvezogo',
    teacherId: 'teacher-1',
    teacherName: 'Pr. Armand Ndong',
    phoneNumber: '+241 077 45 89 12',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    serviceDescription: 'Abonnement 2 cours particuliers Matériaux Scientifiques'
  },
  {
    id: 'tx-2inv',
    amount: 5000,
    type: 'Moov Money',
    status: 'Escrow',
    parentId: 'parent-1',
    parentName: 'Martine Mvezogo',
    teacherId: 'teacher-2',
    teacherName: 'Mme Rose Obone',
    phoneNumber: '+241 066 12 34 56',
    date: new Date().toISOString(),
    serviceDescription: 'Cours d\'essai de Français - Soutien L\'Enfant Noir'
  }
];

export const initialAlerts: IA_Alert[] = [
  {
    id: 'alert-1',
    studentId: 'eleve-1',
    studentName: 'Jean-Daniel Mvezogo',
    type: 'Alerte Décrochage',
    message: 'Jean-Daniel a manqué la séance de soutien d\'Anglais d\'hier avec M. Hugues Kombila.',
    severity: 'medium',
    createdAt: new Date().toISOString(),
    status: 'non_resolu'
  }
];

export async function seedDatabaseIfEmpty() {
  if (!auth.currentUser) {
    console.log('Skipping database seeding because client is not authenticated yet.');
    return;
  }
  try {
    const teachersSnap = await getDocs(collection(db, 'teachers'));
    if (teachersSnap.empty) {
      console.log('Seeding initial teachers...');
      for (const t of initialTeachers) {
        await setDoc(doc(db, 'teachers', t.id), t);
      }
    }

    const lessonsSnap = await getDocs(collection(db, 'lessons'));
    if (lessonsSnap.empty) {
      console.log('Seeding initial lessons...');
      for (const l of initialLessons) {
        await setDoc(doc(db, 'lessons', l.id), l);
      }
    }

    const sessionsSnap = await getDocs(collection(db, 'sessions'));
    if (sessionsSnap.empty) {
      console.log('Seeding initial sessions...');
      for (const s of initialSessions) {
        await setDoc(doc(db, 'sessions', s.id), s);
      }
    }

    const txSnap = await getDocs(collection(db, 'transactions'));
    if (txSnap.empty) {
      console.log('Seeding initial transactions...');
      for (const tx of initialTransactions) {
        await setDoc(doc(db, 'transactions', tx.id), tx);
      }
    }

    const alertsSnap = await getDocs(collection(db, 'alerts'));
    if (alertsSnap.empty) {
      console.log('Seeding initial alerts...');
      for (const a of initialAlerts) {
        await setDoc(doc(db, 'alerts', a.id), a);
      }
    }

  } catch (error: any) {
    console.warn('Seeding issue or offline status:', error);
    try {
      handleFirestoreError(error, OperationType.GET, 'seeder');
    } catch (logErr) {
      console.warn("Seeder Firestore error logged:", logErr);
    }
  }
}
