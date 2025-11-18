# Resume Maker

## Setup Instructions
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/22f1000610/resume_maker.git
   cd resume_maker
   ```

2. Install dependencies:
   - Make sure you have Python, Node.js, and npm installed.

3. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

4. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```

5. Install front-end dependencies:
   ```bash
   cd frontend
   npm install
   ```

6. Run the Flask server:
   ```bash
   python backend/app.py
   ```

7. Run the front end (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

## Dependencies
- **Backend:** Flask, Pandoc, any other listed in requirements.txt.
- **Frontend:** React, Tailwind CSS, and others specified in `frontend/package.json`.

## Usage Guide
To create a resume, follow the prompts from the web app once the server is running.