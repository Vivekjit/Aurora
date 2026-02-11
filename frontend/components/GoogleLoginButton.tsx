import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/context/AuthContext";

const GoogleLoginButton = () => {
  const { login } = useAuth(); // We don't need 'user' or 'logout' here anymore

  // ❌ DELETED the 'if (user)' block to make this a pure button.

  return (
    <div className="opacity-90 hover:opacity-100 transition-opacity">
      <GoogleLogin
        onSuccess={(res) => {
          if (res.credential) login(res.credential);
        }}
        onError={() => console.log('Login Failed')}
        theme="filled_black"
        shape="pill"
      />
    </div>
  );
};
export default GoogleLoginButton;