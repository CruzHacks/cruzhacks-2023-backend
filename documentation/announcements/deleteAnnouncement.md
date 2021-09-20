# CruzHacks Delete Announcement Service 

This Firebase Function is responsible for deleting any announcements. This service uses Cloud Firestore.

## Request Schema

```shell
curl --request DELETE \
  --url http://localhost:5001/<project>/<timezone>/announcements/:id \
  --header 'authorization: Bearer AUTH_TOKEN' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Deleted Announcement or Announcement does not Exist

```json
{
  "error": false,
  "status": 200,
  "message": "Announcement successfully removed"
}
```

### Internal Server Error

```json
{
  "error": true,
  "status": 500,
  "message": "Internal Server Error"
}
```