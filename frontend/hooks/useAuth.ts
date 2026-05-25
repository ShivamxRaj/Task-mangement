import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, session, loading, signInWithGoogle, signOut, updateUserMetadata } = useAuthContext();

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
    updateUserMetadata,
  };
};
export default useAuth;
