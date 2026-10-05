// import { Link, useLocation } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faArrowRight,
//   faRightToBracket,
// } from "@fortawesome/free-solid-svg-icons";

// import { useAuth } from "../context/AuthContext";

// import "./Auth.css";

// function Login() {
//   const { login } = useAuth();
//   const location = useLocation();

//   const message = location.state?.message;

//   const handleLogin = () => {
//     login();
//   };

//   return (
//     <main className="auth-page">
//       <section className="auth-card">
//         <div className="auth-tabs">
//           <span className="auth-tab auth-tab-active">
//             <FontAwesomeIcon icon={faRightToBracket} />
//             Login
//           </span>

//           <Link to="/register" className="auth-tab">
//             Sign Up
//           </Link>
//         </div>

//         <div className="auth-header">
//           <p className="auth-eyebrow">WELCOME BACK</p>

//           <h1>Log in</h1>

//           <p>
//             Sign in to continue shopping and manage your account.
//           </p>
//         </div>

//         {message && (
//           <div className="auth-success">
//             {message}
//           </div>
//         )}

//         <div className="auth-login-content">
//           <div className="auth-login-icon">
//             <FontAwesomeIcon icon={faRightToBracket} />
//           </div>

//           <h2>Continue to your account</h2>

//           <p>
//             You'll be redirected to our secure sign-in page to enter your
//             username and password.
//           </p>

//           <button
//             type="button"
//             className="auth-submit-button"
//             onClick={handleLogin}
//           >
//             Log In
//             <FontAwesomeIcon icon={faArrowRight} />
//           </button>
//         </div>

//         <p className="auth-footer">
//           Don't have an account?{" "}
//           <Link to="/register">Create an account</Link>
//         </p>
//       </section>
//     </main>
//   );
// }

// export default Login;
