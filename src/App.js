import React, { useState, useEffect } from 'react';

function App() {
  const [authKey, setAuthKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [email, setEmail] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('Klic'); 
    const clientId = urlParams.get('id_Klient'); 
    const email = urlParams.get('Email'); 

    if (key && clientId && email) {
      setAuthKey(key);
      setClientId(clientId);
      setEmail(email);
      verifyAuthKey(key, clientId, email); 
  } else {
    setMessage('URL neobsahuje požadovaný input.');
  }
  }, []);

  
  const verifyAuthKey = async (key, clientId, email) => {
    try {
      const response = await fetch(`http://85.122.161.68/auth/verify-key?authKey=${key}&id_Klient=${clientId}&Email=${email}`);
      const data = await response.json();
      if (data.message === "Authorizačný kľúč je platný.") {
        setIsKeyValid(true);
      } else {
        setMessage('Authorizačný kľúč je neplatný.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Chyba pri overovaní authorizačného kľúča.');
    }
  };



  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Heslá sa nezhodujú.');
      return;
    }

    try {
      const response = await fetch('http://85.122.161.68/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authKey,
          newPassword,
          clientId,
          email,
        }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Chyba pri zmene hesla.');
    }
  };

  return (
    <div style={styles.container}>
      <img src={`${process.env.PUBLIC_URL}/logo1.png`} alt="Gabriel Tour Logo" style={styles.logo} />
      <h1 style={styles.title}>Resetovať Heslo</h1>
      {message && <p style={styles.message}>{message}</p>}
      {isKeyValid ? (
        <form onSubmit={handlePasswordChange} style={styles.form}>
          <input
            type="password"
            placeholder="Vložte nové heslo"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Potvrďte nové heslo"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Zmeniť heslo</button>
        </form>
      ) : (
        !message && <p style={styles.loadingMessage}>Overujem overovací kľúč...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  logo: {
    width: '300px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    color: '#000000',
    marginBottom: '20px',
  },
  message: {
    color: '#000000',    fontSize: '16px',
    marginBottom: '20px',
  },
  loadingMessage: {
    color: '#000000',
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    width: '80%',
    maxWidth: '400px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 20px',
    fontSize: '18px',
    backgroundColor: '#A67B5B',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s',
  },
};

export default App;
