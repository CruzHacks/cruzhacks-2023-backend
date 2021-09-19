# CruzHacks Recaptcha Service

This Firebase Function is responsible for the CruzHacks user validation. This service uses the Google's recaptcha service.


## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/verifyRecaptcha/submit \
  --header 'authentication: API_KEY' \
  --header 'token: CLIENT_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Added User

```json
{
  "error": false,
  "status": 200,
  "message": "Successfully Validated Request"
}
```

### Invalid Token or Secret 
```json
{
  "error": false,
  "status": 400,
  "message": "Invalid Token or Secret"
}
```

### Request Timed Out or Duplicate Key

```json
{
  "error": true,
  "status": 401,
  "message": "Request Timed Out, or Duplicate Key"
}
```

### Google Recatpcha Validation Error
```json 
{
  "error": true,
  "status": 401,
  "message": "Unauthorized Request"
}
```

### Server Error

```json
{
  "error": true,
  "status": 500,
  "message": "Internal Service Error"
}
```
