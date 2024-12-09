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
    // Get the full path after your GitHub Pages base URL
    const path = window.location.pathname;
  
    // Extract the part after "/GabrielTourPasswordReset/"
    const paramString = path.split('/GabrielTourPasswordReset/')[1];
  
    // Check if we have parameters in the format `id_klient=...&Email=...&Klic=...`
    if (paramString) {
      const params = paramString.split('&').reduce((acc, param) => {
        const [key, value] = param.split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {});
  
      // Extract the parameters you need
      const key = params.Klic;
      const clientId = params.id_klient;
      const email = params.Email;
      console.log('Extracted Parameters:', { key, clientId, email });
      if (key && clientId && email) {
        setAuthKey(key);
        setClientId(clientId);
        setEmail(email);
        verifyAuthKey(key, clientId, email);
      } else {
        setMessage('URL neobsahuje požadovaný input.');
      }
    } else {
      setMessage('URL neobsahuje požadovaný input.');
    }
  }, []);

  
  const verifyAuthKey = async (authKey, clientId, email) => {
    try {
      console.log("i got to verifyAuth");
      const response = await fetch(`http://13.53.236.35:9090/auth/verify-key?authKey=${authKey}&email=${email}&clientId=${clientId}`);
                                  // 'http://localhost:9090/auth/verify-key?authKey=7B98403B&email=babica.jakub@gmail.com&clientId=9388'
      const data = await response.json();
      if (data.message === "Authorization key is valid.") {
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
      const response = await fetch('http://13.53.236.35:9090/auth/change-password', {
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
