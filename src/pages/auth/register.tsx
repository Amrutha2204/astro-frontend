import { useState } from "react";
import { useRouter } from "next/router";
import { registerUser } from "@/services/authService";
import styles from "@/styles/auth.module.css";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dob: "",
    birthPlace: "",
    birthTime: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || "0000000000",
        timezone: "Asia/Kolkata",
        roleId: 1,
        guestId: null,
        dob: formData.dob,
        birthPlace: formData.birthPlace,
        birthTime: formData.birthTime
      };

      console.log("Sending payload 👉", payload);

      const res = await registerUser(payload);

      console.log("REGISTER SUCCESS ✅", res.data);
      alert("Registration successful");

      router.push("/auth/login");
    } catch (error: any) {
      console.error("REGISTER FAILED ❌", error.response?.data || error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2>🪔 New Registration</h2>

        <label>Name</label>
        <input name="name" onChange={handleChange} />

        <label>Email</label>
        <input name="email" onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" onChange={handleChange} />

        <label>Phone</label>
        <input name="phoneNumber" onChange={handleChange} />

        <label>Date of Birth</label>
        <input type="date" name="dob" onChange={handleChange} />

        <label>Birth Place</label>
        <input name="birthPlace" onChange={handleChange} />

        <label>Birth Time</label>
        <input type="time" name="birthTime" onChange={handleChange} />

        <button onClick={handleRegister}>Register</button>

        <p onClick={() => router.push("/auth/login")}>
          Already registered? Login
        </p>
      </div>
    </div>
  );
}
