"use client";
import React, { useState, useCallback } from 'react';

const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateEmail = useCallback(async (emailValue) => {
    setError('');
    setIsValidating(true);

    try {
      // Basic email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        setError('Please enter a valid email address.');
        return false;
      }

      // Extract domain
      const domain = emailValue.split('@')[1]?.toLowerCase().trim();
      if (!domain) {
        setError('Invalid email domain.');
        return false;
      }

      // Kickbox API check
      const response = await fetch(`https://open.kickbox.com/v1/disposable/${domain}`);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const { disposable } = await response.json();
      if (disposable) {
        setError('Disposable/temporary emails are not allowed. Please use a permanent email.');
        console.log(`Blocked by Kickbox API: ${domain}`);
        return false;
      }

      console.log(`Allowed by Kickbox API: ${domain}`);
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      setError('Error validating email. Please try again.');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setEmail(value);
      setError('');

      if (value) {
        const timeoutId = setTimeout(() => {
          validateEmail(value);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    },
    [validateEmail]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidating && (await validateEmail(email))) {
      console.log('Valid email submitted:', email);
      // Proceed with form submission
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">From (Email):</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="your@email.com"
        required
        aria-invalid={!!error}
        aria-describedby={error ? 'email-error' : undefined}
        disabled={isValidating}
      />
      {isValidating && <p style={{ color: 'blue' }}>Validating...</p>}
      {error && (
        <p id="email-error" style={{ color: 'red' }} role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={!!error || isValidating}>
        Submit
      </button>
    </form>
  );
};

export default ContactForm;