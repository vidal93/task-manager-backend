import * as admin from 'firebase-admin';
import {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase-admin/firestore';

// Solo inicializar si aun no hay una instancia activa
if (!admin.apps.length) {
    admin.initializeApp();
}

export const db = admin.firestore();

// Convierte los datos de Firestore al tipo que le indiquemos
export function createConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
    return {
        toFirestore: (data: T): DocumentData => data,
        fromFirestore: (snap: QueryDocumentSnapshot): T => snap.data() as T,
    };
}
