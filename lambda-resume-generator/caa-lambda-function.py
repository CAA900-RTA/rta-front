import json
import boto3
import os
from datetime import datetime
import requests
import html
import base64
from io import BytesIO


def lambda_handler(event, context):
    """
    Lambda function to generate resume using GPT API and return HTML/text
    """
    try:
        # Parse input data
        candidate_data = event.get('candidate_data', {})
        job_description = event.get('job_description', '')
        
        if not candidate_data or not job_description:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Missing candidate_data or job_description'
                })
            }
        
        # Generate resume content using GPT API
        resume_content = generate_resume_with_gpt(candidate_data, job_description)
        
        # Generate HTML resume
        html_resume = generate_html_resume(resume_content, candidate_data)
        
        # Save to S3 (optional)
        s3_url = save_html_to_s3(html_resume, candidate_data['name'])
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Resume generated successfully',
                'resume_content': resume_content,
                'html_resume': html_resume,
                's3_url': s3_url
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }


def generate_resume_with_gpt(candidate_data, job_description):
    """
    Generate resume content using OpenAI GPT API with requests
    """
    # Get API key from environment variables
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OpenAI API key not found in environment variables")
    
    # Create prompt for GPT
    prompt = create_resume_prompt(candidate_data, job_description)
    
    # Prepare API request
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'model': 'gpt-4',
        'messages': [
            {
                'role': 'system',
                'content': 'You are a professional resume writer. Create a tailored resume based on the candidate data and job description provided. Return the response in a structured JSON format with sections: summary, experience, education, skills, certifications.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': 2000,
        'temperature': 0.7
    }
    
    try:
        # Make API request
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Check for HTTP errors
        response.raise_for_status()
        
        # Parse response
        result = response.json()
        
        # Handle API errors
        if 'error' in result:
            raise Exception(f"OpenAI API error: {result['error']['message']}")
        
        resume_content = result['choices'][0]['message']['content']
        
        try:
            # Try to parse as JSON
            return json.loads(resume_content)
        except json.JSONDecodeError:
            # If not JSON, return as text
            return {"content": resume_content}
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"OpenAI API request failed: {str(e)}")
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def create_resume_prompt(candidate_data, job_description):
    """
    Create a detailed prompt for GPT to generate resume
    """
    prompt = f"""
    Based on the following candidate data and job description, create a tailored resume that highlights relevant skills and experiences.

    CANDIDATE DATA:
    Name: {candidate_data.get('name', 'N/A')}
    
    Skills: {', '.join(candidate_data.get('skills', []))}
    
    Experience:
    """
    
    for exp in candidate_data.get('experience', []):
        prompt += f"""
        - {exp.get('job_title', 'N/A')} at {exp.get('company', 'N/A')} ({exp.get('start_date', 'N/A')} - {exp.get('end_date', 'N/A')})
          Location: {exp.get('location', 'N/A')}
          Responsibilities:
          {chr(10).join(f'    • {resp}' for resp in exp.get('responsibilities', []))}
        """
    
    prompt += f"""
    
    Education:
    """
    for edu in candidate_data.get('education', []):
        prompt += f"""
        - {edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')} ({edu.get('start_year', 'N/A')}-{edu.get('end_year', 'N/A')})
          Location: {edu.get('location', 'N/A')}
        """
    
    prompt += f"""
    
    Certifications:
    """
    for cert in candidate_data.get('certifications', []):
        prompt += f"""
        - {cert.get('name', 'N/A')} by {cert.get('issuer', 'N/A')} (Issued: {cert.get('issue_date', 'N/A')})
        """
    
    prompt += f"""
    
    JOB DESCRIPTION:
    {job_description}
    
    Please create a professional resume that:
    1. Includes a compelling professional summary
    2. Highlights relevant skills that match the job requirements
    3. Emphasizes relevant experience and achievements
    4. Uses action verbs and quantifiable results where possible
    5. Tailors the content to match the job description
    
    Return the response in JSON format with the following structure:
    {{
        "summary": "Professional summary paragraph",
        "experience": [
            {{
                "title": "Job Title",
                "company": "Company Name",
                "duration": "Start - End",
                "location": "Location",
                "achievements": ["Achievement 1", "Achievement 2", ...]
            }}
        ],
        "education": [
            {{
                "degree": "Degree Name",
                "institution": "Institution Name",
                "duration": "Start - End",
                "location": "Location"
            }}
        ],
        "skills": ["Skill 1", "Skill 2", ...],
        "certifications": [
            {{
                "name": "Certification Name",
                "issuer": "Issuing Organization",
                "date": "Issue Date"
            }}
        ]
    }}
    """
    
    return prompt


def generate_html_resume(resume_content, candidate_data):
    """
    Generate HTML resume (can be converted to PDF client-side)
    """
    html_template = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - {name}</title>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }}
            .container {{
                background-color: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
                font-size: 2.5em;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
            }}
            h2 {{
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 5px;
                margin-top: 30px;
            }}
            .section {{
                margin-bottom: 25px;
            }}
            .job-title {{
                font-weight: bold;
                color: #2c3e50;
                font-size: 1.2em;
            }}
            .company-info {{
                color: #7f8c8d;
                font-style: italic;
                margin-bottom: 10px;
            }}
            .achievements {{
                margin-left: 20px;
            }}
            .achievements li {{
                margin-bottom: 5px;
            }}
            .skills {{
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }}
            .skill {{
                background-color: #3498db;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.9em;
            }}
            .summary {{
                background-color: #ecf0f1;
                padding: 15px;
                border-radius: 5px;
                font-style: italic;
            }}
            @media print {{
                body {{
                    background-color: white;
                }}
                .container {{
                    box-shadow: none;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>{name}</h1>
            
            {content}
        </div>
    </body>
    </html>
    """
    
    content = ""
    
    if isinstance(resume_content, dict):
        # Professional Summary
        if 'summary' in resume_content:
            content += f"""
            <div class="section">
                <h2>Professional Summary</h2>
                <div class="summary">{html.escape(resume_content['summary'])}</div>
            </div>
            """
        
        # Experience
        if 'experience' in resume_content:
            content += '<div class="section"><h2>Experience</h2>'
            for exp in resume_content['experience']:
                content += f"""
                <div style="margin-bottom: 20px;">
                    <div class="job-title">{html.escape(exp.get('title', 'N/A'))}</div>
                    <div class="company-info">{html.escape(exp.get('company', 'N/A'))} | {html.escape(exp.get('duration', 'N/A'))} | {html.escape(exp.get('location', 'N/A'))}</div>
                    <ul class="achievements">
                """
                for achievement in exp.get('achievements', []):
                    content += f'<li>{html.escape(achievement)}</li>'
                content += '</ul></div>'
            content += '</div>'
        
        # Education
        if 'education' in resume_content:
            content += '<div class="section"><h2>Education</h2>'
            for edu in resume_content['education']:
                content += f"""
                <div style="margin-bottom: 15px;">
                    <div class="job-title">{html.escape(edu.get('degree', 'N/A'))}</div>
                    <div class="company-info">{html.escape(edu.get('institution', 'N/A'))} | {html.escape(edu.get('duration', 'N/A'))} | {html.escape(edu.get('location', 'N/A'))}</div>
                </div>
                """
            content += '</div>'
        
        # Skills
        if 'skills' in resume_content:
            content += '<div class="section"><h2>Skills</h2><div class="skills">'
            for skill in resume_content['skills']:
                content += f'<span class="skill">{html.escape(skill)}</span>'
            content += '</div></div>'
        
        # Certifications
        if 'certifications' in resume_content:
            content += '<div class="section"><h2>Certifications</h2>'
            for cert in resume_content['certifications']:
                content += f"""
                <div style="margin-bottom: 10px;">
                    <strong>{html.escape(cert.get('name', 'N/A'))}</strong> - {html.escape(cert.get('issuer', 'N/A'))} ({html.escape(cert.get('date', 'N/A'))})
                </div>
                """
            content += '</div>'
    else:
        # If resume_content is not structured, add as plain text
        content = f'<div class="section"><h2>Resume Content</h2><p>{html.escape(str(resume_content))}</p></div>'
    
    return html_template.format(
        name=html.escape(candidate_data.get('name', 'N/A')),
        content=content
    )


def save_html_to_s3(html_content, candidate_name):
    """
    Save HTML resume to S3 bucket
    """
    try:
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        
        if not bucket_name:
            return None
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"resumes/{candidate_name.replace(' ', '_')}_{timestamp}.html"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=html_content.encode('utf-8'),
            ContentType='text/html'
        )
        
        # Return S3 URL
        return f"https://{bucket_name}.s3.amazonaws.com/{filename}"
        
    except Exception as e:
        print(f"Error saving to S3: {str(e)}")
        return None