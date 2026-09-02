'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByUsername, verifyPassword, createSession, ensureUsersTable, seedDefaultUser } from '@/lib/auth';

export async function loginAction(formData: FormData): Promise<void> {
  await ensureUsersTable();
  await seedDefaultUser();

  const username = String(formData.get('username') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!username || !password) { redirect('/login?error=' + encodeURIComponent('Username and password are required')); }

  const user = await getUserByUsername(username);
  if (!user) { redirect('/login?error=' + encodeURIComponent('Invalid username or password')); }
  if (!user.active) { redirect('/login?error=' + encodeURIComponent('This account has been deactivated')); }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) { redirect('/login?error=' + encodeURIComponent('Invalid username or password')); }

  const token = await createSession({
    id: user.id, username: user.username, name: user.name, role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  const redirectTo = String(formData.get('redirect') || '/');
  redirect(redirectTo);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
