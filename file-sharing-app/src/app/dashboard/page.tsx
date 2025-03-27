"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (session) {
      fetch("/api/files/list", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((res) => res.json())
        .then((data) => setFiles(data.files));
    }
  }, [session]);

  return (
    <div>
      <h1>Welcome, {session?.user?.name}</h1>
      <button onClick={() => signOut()}>Logout</button>

      <h2>Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </div>
  );
}
