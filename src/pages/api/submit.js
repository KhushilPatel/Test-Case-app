import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { testCases ,sheetId} = req.body;

      // Set up Google Sheets
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];

      // Add test cases to Google Sheets
      for (const testCase of testCases) {
        console.log("testCase", testCase);
        await sheet.addRow({
          'Test Case ID': testCase['Test Case ID'],
          'Test Case Title': testCase['Test Case Title'],
          'Test Description': testCase['Test Description'],
          'Test Type': testCase['Test Type'],
          'Test Case Type': testCase['Test Case Type'],
          'Priority': testCase.Priority,
          'Preconditions': testCase.Preconditions,
          'Test Steps': Array.isArray(testCase['Test Steps']) ? testCase['Test Steps'].join('\n') : testCase['Test Steps'],
          'Test Data': testCase['Test Data'],
          'Expected Result': testCase['Expected Result']
        });
      }

      res.status(200).json({ message: 'Test cases added to Google Sheets successfully', testCases });
    } catch (error) {
      console.error('Detailed error:', error);
      res.status(500).json({ message: 'Error processing request', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}