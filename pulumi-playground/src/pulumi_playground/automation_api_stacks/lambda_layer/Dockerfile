FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt .

RUN pip install -r requirements.txt -t /opt/python

CMD ["echo", "Lambda layer built successfully"]