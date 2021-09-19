# CruzHacks Application Service (In Progress)*

This Firebase Function is responsible for CruzHacks application.  This service uses Cloud Firestore and Cloud Storage.

## Request Schema

```shell
curl --request POST \
  --url http://localhost:5001/<project>/<timezone>/application/submit \
  --header 'authentication: Bearer AUTH_TOKEN' \
  --header 'content-type: multipart/form-data' \
  --data
```

## Response Schemas

### Successfully Submitted Application

```json
{
  "status": 201,
  "message": "TEST@ucsc.edu added to the mailing list"
}
```

