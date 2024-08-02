import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
const Groq = require('groq-sdk');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prompt } = req.body;
      const client = new Groq({ apiKey: process.env.GENERATEQB_KEY });
      
      const system = "Generate Test Cases in JSON format only, don't provide any other text than JSON. The format should be an array of objects, each representing a test case with the following properties: id, title, description, type, caseType, priority, preconditions, steps, data, expectedResult.";
      
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.0,
        max_tokens: 2064,
      });
      
      const testCases = JSON.parse(completion.choices[0].message.content);
      console.log("testCases", testCases);
      
      // Set up Google Sheets
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      
      // Add test cases to Google Sheets
      for (const testCase of testCases) {
        await sheet.addRow({
          'Test Case ID': testCase.id,
          'Test Case Title': testCase.title,
          'Test Description': testCase.description,
          'Test Type': testCase.type,
          'Test Case Type': testCase.caseType,
          'Priority': testCase.priority,
          'Preconditions': testCase.preconditions,
          'Test Steps': Array.isArray(testCase.steps) ? testCase.steps.join('\n') : testCase.steps,
          'Test Data': JSON.stringify(testCase.data),
          'Expected Result': testCase.expectedResult
        });
      }
      
      res.status(200).json({ message: 'Test cases generated and added to Google Sheets', testCases });
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(500).json({ message: 'Error processing request', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}