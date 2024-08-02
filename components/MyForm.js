import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const TestCaseGeneratorForm = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the GROQ API
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate test cases');
      }

      const data = await response.json();

      // Store the result in Google Sheets
      await fetch('/api/store-in-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCases: data.testCases }),
      });

      toast.success('Test cases generated and stored successfully!');
      setPrompt('');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <style jsx>{`
        .form-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f7f8fa, #e6eaf3);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .form-wrapper {
          width: 100%;
          max-width: 800px;
          background-color: white;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .form-content {
          padding: 32px;
          width: 100%;
        }
        .form-content h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .button-container {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
        }
        .button {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 4px;
          transition: background-color 0.3s ease;
          color: white;
          background-color: #0070f3;
        }
        .button:hover {
          background-color: #005bb5;
        }
        .button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>

      <Toaster position="top-center" reverseOrder={false} />
      <div className="form-wrapper">
        <div className="form-content">
          <h3>Test Case Generator</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Enter your prompt"
              name="prompt"
              value={prompt}
              onChange={handleChange}
              as="textarea"
              rows={10}
            />
            <div className="button-container">
              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Test Cases'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = 'text', value, onChange, as, ...props }) => {
  const InputComponent = as || 'input';
  
  return (
    <div className="input-container">
      <style jsx>{`
        .input-container {
          margin-bottom: 16px;
        }
        .label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }
        .input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background-color: white;
          color: #374151;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input:hover {
          border-color: #9ca3af;
        }
        .input:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 4px rgba(0, 112, 243, 0.1);
        }
      `}</style>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <InputComponent
        id={name}
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        className="input"
        {...props}
      />
    </div>
  );
};

export default TestCaseGeneratorForm;