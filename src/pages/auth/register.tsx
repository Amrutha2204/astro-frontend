import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/auth.module.css";

interface FormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  timezone: string;
  roleId: number;
  guestId: string;
  dob: string;
  birthPlace: string;
  birthTime: string;
}

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    timezone: "",
    roleId: 1,
    guestId: "",
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

  const handleRegister = () => {
    console.log("Form Data:", formData);
    // TODO: Call your API to save registration
    router.push("/auth/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2>🪔 New Registration</h2>

        <label>Name</label>
        <input name="name" placeholder="Name" onChange={handleChange} />

        <label>Email</label>
        <input name="email" placeholder="Email" onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />

        <label>Phone</label>
        <input name="phoneNumber" placeholder="Phone" onChange={handleChange} />

        <label>Date of Birth</label>
        <input type="date" name="dob" onChange={handleChange} />

        <label>Birth Place</label>
        <input name="birthPlace" placeholder="Birth Place" onChange={handleChange} />

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
