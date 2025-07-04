#!/usr/bin/env python3
"""
Lambda Resume Generator Client Test Script with .env support
This script tests the Lambda function from your local machine
"""

import json
import boto3
import base64
import os
from datetime import datetime
import argparse
from pathlib import Path

# Try to import python-dotenv, install if needed
try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    print("python-dotenv not installed. Install with: pip install python-dotenv")
    print("Falling back to system environment variables...")


class LambdaResumeClient:
    def __init__(self, region='us-east-1', profile_name=None, env_file=None):
        """
        Initialize the Lambda client with optional .env file support
        
        Args:
            region (str): AWS region where Lambda is deployed
            profile_name (str): AWS profile name (optional)
            env_file (str): Path to .env file (optional)
        """
        self.region = region
        
        # Load .env file if specified and available
        if env_file and DOTENV_AVAILABLE:
            env_path = Path(env_file)
            if env_path.exists():
                load_dotenv(env_path)
                print(f"Loaded environment variables from: {env_file}")
            else:
                print(f"Warning: .env file not found: {env_file}")
        elif DOTENV_AVAILABLE:
            # Try to load .env from current directory
            env_path = Path('.env')
            if env_path.exists():
                load_dotenv(env_path)
                print("Loaded environment variables from: .env")
        
        # Initialize boto3 session
        if profile_name:
            session = boto3.Session(profile_name=profile_name)
            self.lambda_client = session.client('lambda', region_name=region)
        else:
            # This will use environment variables if available
            self.lambda_client = boto3.client('lambda', region_name=region)
        
        # Verify credentials
        try:
            sts_client = boto3.client('sts')
            identity = sts_client.get_caller_identity()
            print(f"✅ AWS credentials verified for account: {identity['Account']}")
            print(f"User/Role: {identity['Arn']}")
        except Exception as e:
            print(f"❌ AWS credentials verification failed: {str(e)}")
    
    def invoke_lambda(self, function_name, candidate_data, job_description):
        """
        Invoke the Lambda function with candidate data and job description
        
        Args:
            function_name (str): Name of the Lambda function
            candidate_data (dict): Candidate information
            job_description (str): Job description text
            
        Returns:
            dict: Lambda response
        """
        # Prepare payload
        payload = {
            'candidate_data': candidate_data,
            'job_description': job_description
        }
        
        try:
            print(f"Invoking Lambda function: {function_name}")
            print(f"Region: {self.region}")
            print("-" * 50)
            
            # Invoke Lambda function
            response = self.lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',  # Synchronous invocation
                Payload=json.dumps(payload)
            )
            
            # Parse response
            response_payload = json.loads(response['Payload'].read())
            
            print(f"Lambda Status Code: {response['StatusCode']}")
            print(f"Response Status Code: {response_payload.get('statusCode', 'N/A')}")
            
            return response_payload
            
        except Exception as e:
            print(f"Error invoking Lambda: {str(e)}")
            return None
    
    def save_html_resume(self, html_content, filename=None):
        """
        Save HTML resume to local file
        
        Args:
            html_content (str): HTML content
            filename (str): Optional filename
            
        Returns:
            str: Saved filename
        """
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"resume_{timestamp}.html"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"HTML resume saved to: {filename}")
            return filename
        except Exception as e:
            print(f"Error saving HTML file: {str(e)}")
            return None
    
    def save_pdf_resume(self, pdf_base64, filename=None):
        """
        Save PDF resume from base64 string
        
        Args:
            pdf_base64 (str): Base64 encoded PDF
            filename (str): Optional filename
            
        Returns:
            str: Saved filename
        """
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"resume_{timestamp}.pdf"
        
        try:
            pdf_data = base64.b64decode(pdf_base64)
            with open(filename, 'wb') as f:
                f.write(pdf_data)
            print(f"PDF resume saved to: {filename}")
            return filename
        except Exception as e:
            print(f"Error saving PDF file: {str(e)}")
            return None


def get_sample_candidate_data():
    """
    Return sample candidate data for testing
    """
    return {
        "name": "John Doe",
        "skills": [
            "Python", "AWS", "JavaScript", "React", "Node.js", 
            "Docker", "Kubernetes", "CI/CD", "Git", "SQL"
        ],
        "experience": [
            {
                "job_title": "Senior Software Engineer",
                "company": "Tech Innovations Inc.",
                "start_date": "2021-03-01",
                "end_date": "Present",
                "location": "San Francisco, CA",
                "responsibilities": [
                    "Led development of microservices architecture using Python and AWS",
                    "Implemented CI/CD pipelines reducing deployment time by 70%",
                    "Mentored junior developers and conducted code reviews",
                    "Collaborated with cross-functional teams to deliver high-quality software"
                ]
            },
            {
                "job_title": "Software Developer",
                "company": "StartupXYZ",
                "start_date": "2019-06-01",
                "end_date": "2021-02-28",
                "location": "New York, NY",
                "responsibilities": [
                    "Developed full-stack web applications using React and Node.js",
                    "Designed and implemented RESTful APIs",
                    "Optimized database queries improving performance by 40%",
                    "Participated in agile development processes"
                ]
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "State University",
                "start_year": "2015",
                "end_year": "2019",
                "location": "California, USA"
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Solutions Architect",
                "issuer": "Amazon Web Services",
                "issue_date": "2023-06-15"
            },
            {
                "name": "Certified Kubernetes Administrator",
                "issuer": "Cloud Native Computing Foundation",
                "issue_date": "2022-11-20"
            }
        ]
    }


def get_sample_job_description():
    """
    Return sample job description for testing
    """
    return """
    Senior Software Engineer - Cloud Platform Team

    We are seeking a highly skilled Senior Software Engineer to join our Cloud Platform team. 
    The ideal candidate will have extensive experience in cloud technologies, particularly AWS, 
    and a strong background in Python development.

    Key Responsibilities:
    - Design and implement scalable cloud-native applications
    - Build and maintain microservices architecture
    - Collaborate with DevOps teams to implement CI/CD pipelines
    - Mentor junior developers and provide technical leadership
    - Participate in architectural decisions and code reviews

    Required Skills:
    - 5+ years of experience in software development
    - Strong proficiency in Python and modern web frameworks
    - Extensive experience with AWS services (EC2, S3, Lambda, RDS, etc.)
    - Experience with containerization technologies (Docker, Kubernetes)
    - Knowledge of CI/CD tools and practices
    - Strong understanding of database design and optimization
    - Experience with version control systems (Git)
    - Excellent problem-solving and communication skills

    Preferred Qualifications:
    - AWS certifications (Solutions Architect, Developer, etc.)
    - Experience with Infrastructure as Code (Terraform, CloudFormation)
    - Knowledge of monitoring and logging tools
    - Experience with agile development methodologies
    - Bachelor's degree in Computer Science or related field

    We offer competitive salary, comprehensive benefits, and opportunities for professional growth.
    """


def main():
    """
    Main function to run the Lambda client test
    """
    parser = argparse.ArgumentParser(description='Test Lambda Resume Generator')
    parser.add_argument('--function-name', required=True, help='Lambda function name')
    parser.add_argument('--region', default='us-east-1', help='AWS region')
    parser.add_argument('--profile', help='AWS profile name')
    parser.add_argument('--env-file', help='Path to .env file')
    parser.add_argument('--save-files', action='store_true', help='Save HTML/PDF files locally')
    parser.add_argument('--custom-data', help='Path to custom candidate data JSON file')
    parser.add_argument('--custom-job', help='Path to custom job description text file')
    
    args = parser.parse_args()
    
    # Initialize client
    client = LambdaResumeClient(
        region=args.region, 
        profile_name=args.profile,
        env_file=args.env_file
    )
    
    # Get candidate data
    if args.custom_data:
        try:
            with open(args.custom_data, 'r') as f:
                candidate_data = json.load(f)
            print(f"Loaded custom candidate data from: {args.custom_data}")
        except Exception as e:
            print(f"Error loading custom data: {str(e)}")
            print("Using sample data instead...")
            candidate_data = get_sample_candidate_data()
    else:
        candidate_data = get_sample_candidate_data()
        print("Using sample candidate data")
    
    # Get job description
    if args.custom_job:
        try:
            with open(args.custom_job, 'r') as f:
                job_description = f.read()
            print(f"Loaded custom job description from: {args.custom_job}")
        except Exception as e:
            print(f"Error loading custom job description: {str(e)}")
            print("Using sample job description instead...")
            job_description = get_sample_job_description()
    else:
        job_description = get_sample_job_description()
        print("Using sample job description")
    
    print("\nCandidate Name:", candidate_data.get('name', 'N/A'))
    print("Skills:", ', '.join(candidate_data.get('skills', [])))
    print("Experience Count:", len(candidate_data.get('experience', [])))
    print("Education Count:", len(candidate_data.get('education', [])))
    print("Certifications Count:", len(candidate_data.get('certifications', [])))
    print("\nJob Description Preview:", job_description[:200] + "...")
    print("\n" + "="*50)
    
    # Invoke Lambda
    response = client.invoke_lambda(args.function_name, candidate_data, job_description)
    
    if response:
        print("\n" + "="*50)
        print("LAMBDA RESPONSE:")
        print("="*50)
        
        if response.get('statusCode') == 200:
            body = json.loads(response['body'])
            print("✅ SUCCESS!")
            print(f"Message: {body.get('message', 'N/A')}")
            
            if 's3_url' in body and body['s3_url']:
                print(f"S3 URL: {body['s3_url']}")
            
            # Save files locally if requested
            if args.save_files:
                print("\nSaving files locally...")
                
                # Save HTML
                if 'html_resume' in body:
                    client.save_html_resume(body['html_resume'])
                
                # Save PDF if available
                if 'pdf_base64' in body:
                    client.save_pdf_resume(body['pdf_base64'])
            
            print("\nResume Content Preview:")
            print("-" * 30)
            resume_content = body.get('resume_content', {})
            if isinstance(resume_content, dict):
                if 'summary' in resume_content:
                    print(f"Summary: {resume_content['summary'][:200]}...")
                if 'skills' in resume_content:
                    print(f"Skills: {', '.join(resume_content['skills'][:5])}...")
            else:
                print(f"Content: {str(resume_content)[:200]}...")
        
        else:
            print("FAILED!")
            body = json.loads(response['body'])
            print(f"Error: {body.get('error', 'Unknown error')}")
    
    else:
        print("Failed to invoke Lambda function")


if __name__ == "__main__":
    main()
