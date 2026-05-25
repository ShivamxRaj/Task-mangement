import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, session, loading, signInWithGoogle, signOut } = useAuthContext();

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
  };
};
export default useAuth;
