# CruzHacks Recaptcha Service

This Firebase Function is responsible for the CruzHacks user validation. This service uses cloud firestore.

## Request Schema

```shell
curl --request GET \
  --url http://localhost:5001/<project>/<timezone>/application/checkApp \
  --header 'authorization: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Retrieved App Status

```json
{
  "code": 200,
  "exists": true,
  "status": "Accepted | Pending | Rejected",
  "message": "Document Found"
}
```

### No Document Exists

```json
{
  "code": 200,
  "exists": false,
  "status": "No Document",
  "message": "No Document"
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

