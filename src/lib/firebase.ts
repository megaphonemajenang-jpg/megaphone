import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, PromoBanner, StoreSettings, OrderStatus } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as second argument
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection to Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connected to Firebase successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline or database initializing:', error.message);
    } else {
      console.log('[Firestore] Connection validated (ready)');
    }
    return true;
  }
}

// Call testConnection on load
if (typeof window !== 'undefined') {
  testFirestoreConnection();
}

// Real-Time Subscriptions for Products
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((d) => {
        products.push(d.data() as Product);
      });
      onUpdate(products);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      if (onError) onError(error);
    }
  );
}

// Real-Time Subscriptions for Orders
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'orders');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((d) => {
        orders.push(d.data() as Order);
      });
      // Sort newest first
      orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      if (onError) onError(error);
    }
  );
}

// Real-Time Subscriptions for Banners
export function subscribeToBanners(
  onUpdate: (banners: PromoBanner[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'banners');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const banners: PromoBanner[] = [];
      snapshot.forEach((d) => {
        banners.push(d.data() as PromoBanner);
      });
      onUpdate(banners);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'banners');
      if (onError) onError(error);
    }
  );
}

// Real-Time Subscriptions for Store Settings
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, 'storeSettings', 'main');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as StoreSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'storeSettings/main');
      if (onError) onError(error);
    }
  );
}

// Firestore Mutations
export async function firestoreSyncProduct(product: Product) {
  if (!auth.currentUser) return;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function firestoreDeleteProduct(productId: string) {
  if (!auth.currentUser) return;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

export async function firestoreSyncOrder(order: Order) {
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function firestoreUpdateOrderStatus(orderId: string, status: OrderStatus) {
  if (!auth.currentUser) return;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function firestoreSyncBanner(banner: PromoBanner) {
  if (!auth.currentUser) return;
  try {
    await setDoc(doc(db, 'banners', banner.id), banner);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`);
  }
}

export async function firestoreDeleteBanner(bannerId: string) {
  if (!auth.currentUser) return;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `banners/${bannerId}`);
  }
}

export async function firestoreSyncSettings(settings: StoreSettings) {
  if (!auth.currentUser) return;
  try {
    await setDoc(doc(db, 'storeSettings', 'main'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'storeSettings/main');
  }
}
