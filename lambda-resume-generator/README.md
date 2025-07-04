# Lambda Resume Generator

A serverless AWS Lambda function that generates tailored resumes using OpenAI GPT API based on candidate data and job descriptions. The function creates both structured resume content and HTML-formatted resumes, with S3 storage.

## Features

- **AI-Powered Resume Generation**: Uses OpenAI GPT-4 to create tailored resumes
- **Multiple Output Formats**: Generates both structured JSON and HTML resumes
- **S3 Integration**: storage of generated resumes in S3
- **Local Testing**: Comprehensive client script for testing the Lambda function
- **Environment Support**: Supports .env files for local development
- **Error Handling**: Robust error handling and logging

## Architecture

```
Client → AWS Lambda Function → OpenAI GPT API → S3 Storage ()
```

## Prerequisites

- AWS Account with appropriate permissions
- OpenAI API Key
- Python 3.9+ (for Lambda runtime)
- AWS CLI configured (for deployment)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd lambda-resume-generator
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration (can use AWS CLI profile instead)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# S3 Configuration
S3_BUCKET_NAME=your-s3-bucket-name
```

## AWS Lambda Setup

### 1. Create Lambda Function

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `resume-generator`
5. Runtime: Python 3.9 or higher
6. Architecture: x86_64

### 2. Configure Function

1. **Code**: Copy the content of `caa-lambda-function.py` into the Lambda function
2. **Environment Variables**: Add the following:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `S3_BUCKET_NAME`: Your S3 bucket name

3. **Timeout**: Set to 30 seconds (or higher for complex resumes)
4. **Memory**: 512 MB (adjust based on needs)

### 3. Create Lambda Layer (Optional)

For better dependency management, create a Lambda Layer:

```bash
mkdir python
pip install -r requirements.txt -t python/
zip -r dependencies.zip python/
```

Upload this as a Lambda Layer and attach it to your function.

## Usage

### Local Testing

Use the provided client script to test your Lambda function:

```bash
# Basic usage with sample data
python lambda_client_env.py --function-name resume-generator

# Using custom AWS profile
python lambda_client_env.py --function-name resume-generator --profile my-aws-profile

# Using custom .env file
python lambda_client_env.py --function-name resume-generator --env-file .env.prod

# Save generated files locally
python lambda_client_env.py --function-name resume-generator --save-files

# Using custom candidate data and job description
python lambda_client_env.py --function-name resume-generator --custom-data candidate.json --custom-job job.txt
```

### Command Line Options

- `--function-name`: Lambda function name (required)
- `--region`: AWS region (default: us-east-1)
- `--profile`: AWS profile name
- `--env-file`: Path to .env file
- `--save-files`: Save HTML files locally
- `--custom-data`: Path to custom candidate data JSON file
- `--custom-job`: Path to custom job description text file

### Custom Input Files

The client script allows using custom candidate data and job description files:

```bash
# Using custom candidate data and job description
python lambda_client_env.py --function-name resume-generator --custom-data candidate.json --custom-job job.txt
```

### API Integration

You can also invoke the Lambda function programmatically:

```python
import boto3
import json

lambda_client = boto3.client('lambda', region_name='us-east-1')

payload = {
    'candidate_data': {
        'name': 'John Doe',
        'skills': ['Python', 'AWS'],
        # ... more candidate data
    },
    'job_description': 'Your job description here...'
}

response = lambda_client.invoke(
    FunctionName='resume-generator',
    InvocationType='RequestResponse',
    Payload=json.dumps(payload)
)

result = json.loads(response['Payload'].read())
```

## Response Format

### Success Response

```json
{
    "statusCode": 200,
    "body": {
        "message": "Resume generated successfully",
        "resume_content": {
            "summary": "Professional summary...",
            "experience": [...],
            "education": [...],
            "skills": [...],
            "certifications": [...]
        },
        "html_resume": "<html>...</html>",
        "s3_url": "https://bucket.s3.amazonaws.com/resumes/John_Doe_20240101_120000.html"
    }
}
```

### Error Response

```json
{
    "statusCode": 500,
    "body": {
        "error": "Error message here"
    }
}
```

## File Structure

```
lambda-resume-generator/
├── README.md
├── requirements.txt
├── caa-lambda-function.py      # Main Lambda function
└── lambda_client_env.py        # Local testing client
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `S3_BUCKET_NAME` | S3 bucket for storing resumes | No |

### Lambda Configuration

- **Runtime**: Python 3.9+
- **Timeout**: 30 seconds (recommended)
- **Memory**: 512 MB (minimum)
- **Architecture**: x86_64

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure your OpenAI API key is valid and has sufficient credits
   - Check that the environment variable is properly set

2. **AWS Permissions Error**
   - Verify your Lambda execution role has the necessary permissions
   - Check S3 bucket permissions if using S3 storage

3. **Timeout Errors**
   - Increase Lambda timeout setting
   - Consider using asynchronous invocation for complex resumes

4. **Dependencies Not Found**
   - Ensure all dependencies are installed in the Lambda environment
   - Consider using Lambda Layers for better dependency management

### Debug Mode

Enable debug logging in the Lambda function:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review AWS CloudWatch logs for Lambda execution details

## Cost Considerations

- **OpenAI API**: Costs vary based on model and usage
- **AWS Lambda**: Pay per invocation and execution time
- **S3 Storage**: Minimal costs for storing HTML files
- **CloudWatch Logs**: Standard logging charges apply

## Security Best Practices

- Never commit API keys to version control
- Use AWS IAM roles with minimal required permissions
- Regularly rotate API keys and credentials
- Monitor usage and set up billing alerts
