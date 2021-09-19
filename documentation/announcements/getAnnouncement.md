# CruzHacks Announcements Service (In Progress)*

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

