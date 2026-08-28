import json
import requests
headers = {"Authorization": "Bearer ya29.a0Aa4xrXOA2UpXxmWr7sl2xOTuPvD14J3tk5KgO0ke9k4vkjEu-u6XSxz42HMKby9ll6ZBAqocqxs-DH3x8hz_pqPeAaj99zIab8dDWXdsm0jdYhY0JklkfiHSSZT-hUCP0oMPzxJSzpLfRkd1N-1Dm7yt359xaCgYKATASARMSFQEjDvL9Dc-3L-BV6kDTOZ9u00xEqw0163"}
para = {
    "name": "BookExpense.xlsx",
}
files = {
    'data': ('metadata', json.dumps(para), 'application/json; charset=UTF-8'),
    'file': open("./BookExpense.xlsx", "rb")
}
r = requests.post(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    headers=headers,
    files=files
)