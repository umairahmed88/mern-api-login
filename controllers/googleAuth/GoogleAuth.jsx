import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { googleAuth } from "../redux/auth/authSlices";

const GoogleAuth = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleGoogleAuth = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider);

			const { displayName: name, email, photoURL } = result.user;

			const res = await dispatch(
				googleAuth({ email, name, avatar: photoURL })
			).unwrap();

			if (res) {
				navigate("/profile");
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<button
			onClick={handleGoogleAuth}
			type='button'
			className=' text-white uppercase bg-red-700 p-3 rounded-lg hover:opacity-90'
		>
			Continue with google
		</button>
	);
};

export default GoogleAuth;
