
import requests, base64

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
stream = False


headers = {
  "Authorization": "Bearer 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",
  "Accept": "text/event-stream" if stream else "application/json"
}

payload = {
  "model": "mistralai/mistral-small-3.1-24b-instruct-2503",
  "messages": [{"role":"user","content":"what is the capital of india"}],
  "max_tokens": 512,
  "temperature": 0.20,
  "top_p": 0.70,
  "frequency_penalty": 0.00,
  "presence_penalty": 0.00,
  "stream": stream
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.json())
# if stream:
#     for line in response.iter_lines():
#         if line:
#             print(line.decode("utf-8"))
# else:
#     print(response.json())





# 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
