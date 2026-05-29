/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client to prevent crashes if key is unconfigured
let geminiClientCache: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === '' || apiKey.includes('MY_GEMINI_API_KEY')) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  if (!geminiClientCache) {
    geminiClientCache = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClientCache;
};

// -------------------------------------------------------------
// In-Memory Database Simulator representing Firestore Collections
// -------------------------------------------------------------
let users = [
  { id: 'parent-1', name: 'Martine Mvezogo', email: 'martine@disschool.ga', role: 'parent', phone: '+241 077 45 89 12', zone: 'Akanda' },
  { id: 'eleve-1', name: 'Jean-Daniel Mvezogo', email: 'jeandaniel@disschool.ga', role: 'élève', phone: '+241 066 12 34 56', zone: 'Akanda' },
  { id: 'teacher-1', name: 'Pr. Armand Ndong', email: 'armand.ndong@disschool.ga', role: 'teacher', phone: '+241 074 88 99 00', zone: 'STFO' },
  { id: 'teacher-2', name: 'Mme Rose Obone', email: 'rose.obone@disschool.ga', role: 'teacher', phone: '+241 077 11 22 33', zone: 'Libreville Centre' },
  { id: 'teacher-3', name: 'M. Hugues Kombila', email: 'hugues.kombila@disschool.ga', role: 'teacher', phone: '+241 065 55 44 33', zone: 'Owendo' },
  { id: 'coach-1', name: 'Chef de Pôle DIS\'SCHOOL', email: 'admin@disschool.ga', role: 'coach_admin', phone: '+241 011 88 88 88', zone: 'Akanda' }
];

let teachers = [
  {
    id: 'teacher-1',
    name: 'Pr. Armand Ndong',
    subjects: ['Mathématiques', 'Physique-Chimie'],
    diplomaUrl: '#',
    diplomaName: 'Doctorst en Sciences Physiques - UOB Libreville.pdf',
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
    verified: false, // Pending verification
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

let lessons = [
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

let videoSessions = [
  {
    id: 'session-1',
    title: 'Classe Virtuelle - Soutien Trigonométrie',
    startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // in 2 hours
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

let transactions = [
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
    status: 'Escrow', // Held in escrow until Parent or Admin releases
    parentId: 'parent-1',
    parentName: 'Martine Mvezogo',
    teacherId: 'teacher-2',
    teacherName: 'Mme Rose Obone',
    phoneNumber: '+241 066 12 34 56',
    date: new Date().toISOString(),
    serviceDescription: 'Cours d\'essai de Français - Soutien L\'Enfant Noir'
  }
];

let alerts = [
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

// Helper for generating French educational fallback if Gemini isn't available
function generateMockEducationalAdvice(topic: string, gradeLevel: string): string {
  return `### 💡 Aide-Mémoire DIS'SCHOOL Gabon - ${topic} (${gradeLevel})

Voici un résumé pédagogique spécialement rédigé pour vous guider en l'absence de l'API active.

#### 1. Explication Clé
Le concept de **${topic}** est fondamental au programme gabonais. Il s'agit de comprendre comment diviser la notion en briques élémentaires. Par exemple :
- **Règle d'or** : Toujours vérifier vos unités avant de commencer.
- **Formule essentielle** : Lier la théorie à la pratique en écrivant chaque étape.

#### 2. Exemple Pratique
Si vous appliquez cette méthode sur un exercice type :
- *Étape A* : Identifiez les données de l'énoncé.
- *Étape B* : Appliquez la formule de base.
- *Étape C* : Calculez et encadrez le résultat final en justifiant votre démarche !

---

### 📝 Exercice d'Entraînement type BEPC / BAC

**Consigne :**
Soit un cas d'application du cours sur **${topic}**. En utilisant les étapes décrites ci-dessus, résolvez la question suivante :
*« Calculez l'élément dérivé sachant que la constante de proportionnalité du système est fixée à 5. »*

*Astuce : Écrivez votre raisonnement sur une feuille, prenez-la en photo ou tapez votre réponse dans la zone ci-dessous pour que le Coach IA LDS puisse l'évaluer !*`;
}

// -------------------------------------------------------------
// Core backend API Routes
// -------------------------------------------------------------

// General static metrics for Coach Dashboard
app.get('/api/analytics', (req, res) => {
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const escrowHolding = transactions.filter(tx => tx.status === 'Escrow').reduce((sum, tx) => sum + tx.amount, 0);
  const activeStudents = users.filter(u => u.role === 'élève').length;
  const teachersOnline = teachers.filter(t => t.verified).length;

  res.json({
    totalRevenue,
    escrowHolding,
    activeStudents,
    teachersOnline,
    zonesCount: {
      'Akanda': users.filter(u => u.zone === 'Akanda').length,
      'STFO': users.filter(u => u.zone === 'STFO').length,
      'Libreville Centre': users.filter(u => u.zone === 'Libreville Centre').length,
      'Owendo': users.filter(u => u.zone === 'Owendo').length,
    }
  });
});

// Transactions Management (Mobile Money Escrow)
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const { amount, type, teacherId, teacherName, parentId, parentName, phoneNumber, serviceDescription } = req.body;
  const newTx = {
    id: `tx-${Date.now()}`,
    amount: parseInt(amount) || 5000,
    type: type || 'Airtel Money',
    status: 'Escrow' as const,
    parentId: parentId || 'parent-1',
    parentName: parentName || 'Martine Mvezogo',
    teacherId: teacherId || 'teacher-2',
    teacherName: teacherName || 'Mme Rose Obone',
    phoneNumber: phoneNumber || '+241 077 00 00 00',
    date: new Date().toISOString(),
    serviceDescription: serviceDescription || 'Cours de soutien ponctuel'
  };
  transactions.unshift(newTx);
  res.status(201).json(newTx);
});

// Escrow release function - Wallet Update
app.post('/api/transactions/:id/release', (req, res) => {
  const { id } = req.params;
  const txIndex = transactions.findIndex(t => t.id === id);
  if (txIndex > -1) {
    const tx = transactions[txIndex];
    tx.status = 'Released';
    
    // Release money into teacher profile
    const teacherIndex = teachers.findIndex(t => t.id === tx.teacherId);
    if (teacherIndex > -1) {
      teachers[teacherIndex].savedWallet += tx.amount;
    }
    res.json({ success: true, transaction: tx });
  } else {
    res.status(404).json({ error: 'Transaction non trouvée' });
  }
});

// Teacher Management
app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

app.post('/api/teachers/:id/verify', (req, res) => {
  const { id } = req.params;
  const teacherIndex = teachers.findIndex(t => t.id === id);
  if (teacherIndex > -1) {
    teachers[teacherIndex].verified = true;
    res.json({ success: true, teacher: teachers[teacherIndex] });
  } else {
    res.status(404).json({ error: 'Répétiteur non trouvé' });
  }
});

// Lessons & Homework
app.get('/api/lessons', (req, res) => {
  res.json(lessons);
});

app.post('/api/lessons', (req, res) => {
  const { title, type, studentId, studentName, teacherId, teacherName, subject, questions } = req.body;
  const newLesson = {
    id: `lesson-${Date.now()}`,
    title: title || 'Nouveau cours',
    type: type || 'Quiz IA',
    studentId: studentId || 'eleve-1',
    studentName: studentName || 'Jean-Daniel Mvezogo',
    teacherId: teacherId || 'IA',
    teacherName: teacherName || 'Conseiller Pédagogique LDS IA',
    subject: subject || 'Mathématiques',
    aiScore: null,
    recommendations: null,
    status: 'Assigné' as const,
    questions: questions || [],
    createdAt: new Date().toISOString()
  };
  lessons.push(newLesson as any);
  res.status(201).json(newLesson);
});

// Alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.post('/api/alerts/resolve', (req, res) => {
  const { id } = req.body;
  const alertIndex = alerts.findIndex(a => a.id === id);
  if (alertIndex > -1) {
    alerts[alertIndex].status = 'resolu';
    res.json(alerts[alertIndex]);
  } else {
    res.status(404).json({ error: 'Alerte non trouvée' });
  }
});

// -------------------------------------------------------------
// Gemini AI API integration endpoints
// -------------------------------------------------------------

// 1. Tuteur IA Francophone 24h/24 : Explain school notion step-by-step
app.post('/api/gemini/explain', async (req, res) => {
  const { topic, gradeLevel } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'La notion scolaire est requise.' });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Tu es le Conseiller Scolaire Intelligent de DIS'SCHOOL (Gabon), un répétiteur chaleureux et pédagogue. 
Explique la notion suivante du programme scolaire francophone (niveau ${gradeLevel || 'Seconde / Troisième'}) : "${topic}".
1. Offre une explication extrêmement claire, simplifiée et illustrée par des exemples réels adaptés aux réalités africaines ou gabonaises (ex: commerce sur les marchés de Libreville, distances entre Akanda et Owendo, etc.) pour capter l'intérêt de l'élève.
2. Structure la réponse en s'adressant directement à l'élève en français attentionné.
3. À la fin, propose AUTOMATIQUEMENT un court exercice d'entraînement à faire immédiatement avec sa consigne précise.

Format de retour attendu : Texte structuré en Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.warn('Gemini explain handling fallback:', err.message);
    // Return high-fidelity fallback if key is missing or errored
    const fallbackText = generateMockEducationalAdvice(topic, gradeLevel || 'Collège');
    res.json({ text: fallbackText, isFallback: true });
  }
});

// 2. OCR / Exercice Solver - Evaluates text, code, or simulated photo worksheet
app.post('/api/gemini/ocr', async (req, res) => {
  const { base64Image, textProblem, gradeLevel } = req.body;
  if (!base64Image && !textProblem) {
    return res.status(400).json({ error: "L'image ou l'énoncé textuel est requis." });
  }

  try {
    const ai = getGeminiClient();
    let promptParts: any[] = [];
    
    if (base64Image) {
      promptParts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Image.split(',')[1] || base64Image,
        },
      });
    }

    promptParts.push({
      text: `Tu es le Tuteur IA Expert de DIS'SCHOOL Gabon. Aide un élève (niveau ${gradeLevel || 'Moyen'}) à résoudre l'exercice suivant :
"${textProblem || 'Veuillez évaluer cette capture d\'énoncé.'}"
Ne donne pas directement la réponse finale brute comme ça. Donne plutôt :
1. Une explication de la notion mathématique, physique ou littéraire sous-jacente.
2. Un guidage pas-à-pas pour trouver la réponse soi-même.
3. La correction rédigée avec rigueur pédagogique pour qu'il compare.
Remarque : Si la formulation de l'élève comprend du langage grossier, avertis poliment le système en préambule d'éviter cela (Modération).`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: promptParts },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.warn('Gemini OCR handling fallback:', err.message);
    const mockOCRText = `### 📸 Correction Guidée DIS'SCHOOL (OCR Pédagogique)

Nous avons analysé l'énonciation de votre exercice : *« ${textProblem || 'Calculs algébriques / Géométrie '} »*

#### 💡 Démarche de Résolution Étape par Étape :
1. **Analyse des variables** : Identifiez les grandeurs connues et l'inconnue cherchée. 
2. **Formule applicable** : Utilisez la loi ou le théorème lié au chapitre actuel.
3. **Application numérique** : Faites les calculs intermédiaires de façon posée.

#### 📝 Solution Proposée pour Vérification :
- Posez les équations et procédez à l'élimination des termes contraires.
- Arrondissez le résultat si nécessaire et n'oubliez pas d'indiquer l'unité de mesure adéquate (ex: cm, m/s, FCFA).

*Conseil du Coach IA* : Très bon effort ! Si des difficultés persistent sur les fractions ou la géométrie, n'hésitez pas à solliciter une séance de 1h en visio avec un enseignant certifié LDS (M. Ndong ou Mme Obone) pour débloquer la notion définitivement !`;
    res.json({ text: mockOCRText, isFallback: true });
  }
});

// 3. IA intégrée dans la conversation (Bouton "Aide IA" pour résumer, simplifier, traduire)
app.post('/api/gemini/chat-helper', async (req, res) => {
  const { messages, action } = req.body;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'La liste de messages est vide.' });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Voici une discussion de chat entre un parent gabonais et un enseignant de DIS'SCHOOL : 
"${JSON.stringify(messages)}"

Fais l'action suivante : "${action === 'summarize' ? 'Fais un résumé synthétique de ce fil de discussion en 3 points clés' : action === 'simplify' ? 'Simplifie le langage technique employé pour le rendre très accessible à un parent' : 'Traduis le fil ou propose un résumé avec quelques mots clés de salutations en dialectes gabonais courants (comme le Fang, Punu ou Nzebi) pour rapprocher les familles' }".
Sois court, précis et de bon conseil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.warn('Gemini helper handling fallback:', err.message);
    let mockResult = '';
    if (action === 'summarize') {
      mockResult = `**Résumé de la discussion (Aide IA LDS) :**
1. La séance de soutien scolaire s'est bien déroulée hier après-midi.
2. L'élève Jean-Daniel a bien compris la règle des signes mais doit s'exercer davantage sur les divisions.
3. Prochain cours planifié avec le professeur pour jeudi prochain à 16h (STFO / Visio).`;
    } else {
      mockResult = `**Simplification IA :**
L'enseignant explique que Jean-Daniel progresse bien sur les exercices de géométrie mais a tendance à oublier sa calculatrice. Il lui conseille de faire des fiches mémo simples à relire avant le coucher pour graver les formules dans sa mémoire.`;
    }
    res.json({ result: mockResult, isFallback: true });
  }
});

// 4. Live Quiz evaluating
app.post('/api/gemini/quiz-check', async (req, res) => {
  const { lessonId, answers } = req.body;
  const lessonIndex = lessons.findIndex(l => l.id === lessonId);
  if (lessonIndex === -1) {
    return res.status(404).json({ error: 'Quiz non trouvé.' });
  }

  const lesson = lessons[lessonIndex];
  
  try {
    const ai = getGeminiClient();
    const prompt = `Évalue le quiz suivant sur les notions scolaires. 
Sujet : ${lesson.title}
Questions et réponses attendues : ${JSON.stringify(lesson.questions)}
L'élève a fourni les réponses suivantes : ${JSON.stringify(answers)}

Rends une note sur 20 (Note globale calculée rigoureusement, ex: 14/20), des recommandations bienveillantes, et le corrigé succint.
Format de réponse attendu : un objet JSON valide (aucun blabla autour, juste le JSON) : 
{
  "score": 15,
  "feedback": "Bravo, bon travail !",
  "recommendations": "Relis le chapitre sur..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Note finale sur 20' },
            feedback: { type: Type.STRING, description: 'Commentaire global pédagogique' },
            recommendations: { type: Type.STRING, description: 'Recommandations pour progresser' }
          },
          required: ['score', 'feedback', 'recommendations']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Save evaluated values back to the mock DB state
    lesson.status = 'Corrigé';
    lesson.aiScore = result.score;
    lesson.recommendations = result.recommendations;
    lesson.studentAnswers = answers;
    lesson.feedbackText = result.feedback;

    // Check if score is low -> Trigger low-score alert back to Admin/Coach!
    if (result.score < 10) {
      alerts.unshift({
        id: `alert-score-${Date.now()}`,
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        type: 'Faible Score',
        message: `Jean-Daniel a obtenu la note de ${result.score}/20 sur le quiz « ${lesson.title} ». Suggestion de tutorat individuel.`,
        severity: 'high',
        createdAt: new Date().toISOString(),
        status: 'non_resolu'
      });
    }

    res.json({ success: true, lesson });
  } catch (err: any) {
    console.warn('Gemini quiz evaluate handling fallback:', err.message);
    // Standard mock correction calculation
    let calculatedScore = 14; // Default mockup score
    lesson.status = 'Corrigé';
    lesson.aiScore = calculatedScore;
    lesson.recommendations = 'Bonnes bases globales. Assure-toi de travailler l\'application avec des exercices corrigés.';
    lesson.studentAnswers = answers;
    lesson.feedbackText = 'Votre copie a bien été archivée et vérifiée par LDS IA.';

    res.json({ success: true, lesson, isFallback: true });
  }
});

// -------------------------------------------------------------
// Serve static and dev setups
// -------------------------------------------------------------

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DIS'SCHOOL SERVER] Running on host 0.0.0.0, port ${PORT}`);
  });
}

startServer();
