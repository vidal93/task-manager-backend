import { Timestamp } from 'firebase-admin/firestore';

// Estructura del documento de usuario en Firestore
export interface UserDocument {
    email: string;
    createdAt: Timestamp;
}
