# CruzHacks Authentication Service

This Firebase Function is responsible for CruzHacks Verification Emails. This service uses the Auth0.

## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/auth/resend \
  --header 'authorization: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Added Email to Mailing List

```json
{
  "status": 201,
  "message": "Verification Email Sent"
}
```

### Verified User requests Verification

```json
{
  "status": 406,
  "message": "Email Already Verified"
}
```

### Internal Server Error

```json
{
  "status": 500,
  "message": "Unable to send Verification Email"
}
```
