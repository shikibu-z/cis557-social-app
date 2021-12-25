function useAuth() {
  return localStorage.getItem('currUser') !== null;
}

export default useAuth;
