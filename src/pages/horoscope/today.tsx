import { useEffect, useState } from "react";
import { getDailyHoroscope } from "@/services/horoscopeService";

export default function DailyHoroscope() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Example zodiac – replace with real one from user
    getDailyHoroscope("Scorpio")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🌞 Daily Horoscope</h1>

      {data ? (
        <>
          <p><b>Date:</b> {data.date}</p>
          <p>{data.prediction}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
