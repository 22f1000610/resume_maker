FROM ubuntu:22.04

# Install Python, TeX Live, and Pandoc (OS dependencies)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    pandoc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies (including Gunicorn)
COPY requirements.txt .
RUN pip3 install -r requirements.txt gunicorn --break-system-packages

# Copy the application code, templates, and assets
COPY backend/ ./backend/
COPY templates/ ./templates/
COPY "cds jnu logo.png" .

EXPOSE 5000

# Command to start the application using Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "backend.app:app"]
