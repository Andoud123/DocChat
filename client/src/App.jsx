
import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Uploader from './components/Uploader';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Check whether a user is already logged in after a page reload
  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setRegistrationOpen(data.registrationOpen ?? true);
      })
      .catch((error) => {
        console.error('Could not check login status:', error);
      });
  }, []);

  // After login, load the user's most recent document
  useEffect(() => {
    if (!user) return;

    fetch('/api/documents', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          setDocumentId(data.documents[0].id);
          setDocumentTitle(data.documents[0].title);
        } else {
          setDocumentId(null);
          setDocumentTitle('');
        }
      })
      .catch((error) => {
        console.error('Could not load documents:', error);
      });
  }, [user]);

  // Log out
  async function logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    setDocumentId(null);
    setDocumentTitle('');
  }

  // Logged-in view
  if (user) {
    return (
      <main>
        <p>
          Hi, {user.name}!{' '}
          <button onClick={logout}>Log out</button>
        </p>

        <Uploader
          onUploaded={(id) => {
            setDocumentId(id);
          }}
        />

        {documentTitle && <p>Current document: {documentTitle}</p>}

        <Chat documentId={documentId} />
      </main>
    );
  }

  // Logged-out view
  return (
    <main>
      <h2>Create an account</h2>

      <RegisterForm
        onLoggedIn={setUser}
        disabled={!registrationOpen}
      />

      <h2>Or log in</h2>

      <LoginForm onLoggedIn={setUser} />
    </main>
  );
}

export default App;
