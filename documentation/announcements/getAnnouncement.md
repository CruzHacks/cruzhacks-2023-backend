# CruzHacks Announcements Service

This Firebase Function is responsible for getting all announcements. This service uses Cloud Firestore.

## Request Schema

```shell
curl --request GET \
  --url http://localhost:5001/<project>/<timezone>/announcements \
  --header 'authentication: API_KEY' \
  --header 'content-type: application/json' \
```

## Response Schemas

### Successfully Retrieved Announcements

```json
{
      "error": false,
      "status": 200,
      "message": "Request success, announcements retrieved",
      "announcements": "JSON.stringify(announcements)",
      "count": "<Document Count: Number>",
    }
```

### Internal Server Error
```json
{
      "error": true,
      "status": 500,
      "message": "Internal Server Error",
    }
```