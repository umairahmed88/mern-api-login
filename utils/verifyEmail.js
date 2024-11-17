import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyEmail = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				const response = await axios.get(
					`https://mern-api-ua.vercel.app/api/v1/auth/verify-email?token=${token}`
				);

				if (response.data.message === "Email already verified") {
					toast.info("Your email has already been verified");
					navigate("/signin");
				} else {
					toast.success("Email verified");
				}

				navigate("/signin");
			} catch (error) {
				if (error.response) {
					toast.error(
						`Error verifying signup email: ${error.response.data.message}`
					);
				} else if (error.response) {
					toast.error("No response, please try again");
				} else {
					toast.error("An error occurred, please try again later.");
				}
			}
		};

		verifyEmail();
	}, [navigate, token]);

	return <div>Verifying Email...</div>;
};

export default VerifyEmail;
