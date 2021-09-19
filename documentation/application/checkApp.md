# CruzHacks Recaptcha Service (In Progress)*

This Firebase Function is responsible for the CruzHacks user validation. This service uses the Google's recaptcha service REST API.


## Request Schema

```shell
curl --request GET \
  --url http://localhost:5001/<project>/<timezone>/application/checkApp \
  --header 'authentication: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Retrieved App Status

```json
{
  "code": 200,
  "exists": true,
  "status": "Accepted | Pending | Rejected",
  "message": ""
}
```

### Failed to Retrieve App Status 
```json
{
  "exists": false,
  "code": 500,
  "message": "No Document"
}
```

