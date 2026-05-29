/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'parent' | 'élève' | 'teacher' | 'coach_admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  zone: string; // Akanda, STFO, Libreville Centre, Owendo, Port-Gentil, Moanda, other
}

export interface TeacherProfile {
  id: string;
  name: string;
  subjects: string[];
  diplomaUrl: string; // Simulated link to PDF
  diplomaName: string;
  verified: boolean;
  rating: number;
  pricePerSession: number; // in FCFA (e.g. 5000 FCFA / session)
  zone: string;
  photoUrl: string;
  bio: string;
  email: string;
  phone: string;
  savedWallet: number; // Teacher earnings in app
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface LessonHomework {
  id: string;
  title: string;
  type: 'Quiz IA' | 'Devoir' | 'Explication';
  studentId: string;
  studentName: string;
  teacherId: string | 'IA';
  teacherName: string;
  subject: string;
  aiScore: number | null; // Grade out of 20 or 100
  recommendations: string | null;
  status: 'Assigné' | 'Soumis' | 'Corrigé';
  questions?: QuizQuestion[];
  studentAnswers?: string[]; // answers submitted for Quiz
  submissionText?: string;   // submitted paper/response
  feedbackText?: string;     // review from AI or teacher
  createdAt: string;
}

export interface VideoSession {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  recordingUrl?: string;
  status: 'À venir' | 'En cours' | 'Terminé';
}

export interface EscrowTransaction {
  id: string;
  amount: number; // in FCFA
  type: 'Airtel Money' | 'Moov Money';
  status: 'Escrow' | 'Released' | 'Refunded';
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  phoneNumber: string; // Airtel/Moov number
  date: string;
  serviceDescription: string;
}

export interface IA_Alert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Langage Inapproprié' | 'Alerte Décrochage' | 'Faible Score';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  status: 'non_resolu' | 'resolu';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // can be teacher id, or 'support', or 'IA'
  text: string;
  imageUrl?: string;
  audioUrl?: string; // Simulated audio
  createdAt: string;
}
