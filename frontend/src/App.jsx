import { useState } from "react";
import Login from "./pages/Login";
import UploadEvidence from "./pages/UploadEvidence";
import ViewMyEvidence from "./pages/ViewMyEvidence";
import VerifyEvidence from "./pages/VerifyEvidence";
import AuditLogs from "./pages/AuditLogs";

function App() {
  const [session, setSession] = useState(null);

  if (!session) return <Login setSession={setSession} />;

  if (session.role === "investigator")
    return (
      <>
        <UploadEvidence session={session} />
        <ViewMyEvidence session={session} />
      </>
    );

  if (session.role === "officer")
    return <VerifyEvidence session={session} />;

  if (session.role === "auditor")
    return <AuditLogs session={session} />;

  return <div>Unknown role</div>;
}

export default App;
