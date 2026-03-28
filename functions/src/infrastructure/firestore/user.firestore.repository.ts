import { Timestamp } from 'firebase-admin/firestore';

import { createConverter, db } from '../../config/firebase.config';
import { CreateUserDto, User } from '../../domain/models/user.model';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserDocument } from './user.document';

const COLLECTION = 'users';

const usersCollection = db
    .collection(COLLECTION)
    .withConverter(createConverter<UserDocument>());

// Convierte un documento de Firestore al modelo de dominio
function toDomain(id: string, doc: UserDocument): User {
    return {
        id,
        email: doc.email,
        createdAt: doc.createdAt.toDate(),
    };
}

export class UserFirestoreRepository implements UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        // Busca por email y limita a un solo resultado
        const snapshot = await usersCollection
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return toDomain(doc.id, doc.data());
    }

    async create(dto: CreateUserDto): Promise<User> {
        const document: UserDocument = {
            email: dto.email,
            createdAt: Timestamp.now(),
        };

        const ref = await usersCollection.add(document);
        return toDomain(ref.id, document);
    }
}
