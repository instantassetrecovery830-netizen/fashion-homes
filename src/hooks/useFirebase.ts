import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, QueryConstraint, doc, onSnapshot as onSnapshotDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export function useCollection<T>(collectionPath: string, queryConstraints: QueryConstraint[] = []): T[] {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const q = query(collection(db, collectionPath), ...queryConstraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(newData);
    });

    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(queryConstraints)]);

  return data;
}

export function useDocument<T>(docPath: string): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const docRef = doc(db, docPath);
    const unsubscribe = onSnapshotDoc(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData({
          id: snapshot.id,
          ...snapshot.data()
        } as T);
      } else {
        setData(null);
      }
    });

    return () => unsubscribe();
  }, [docPath]);

  return data;
}
